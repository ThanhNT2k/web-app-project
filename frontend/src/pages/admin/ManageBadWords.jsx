import { useEffect, useMemo, useState } from 'react';

import API from '../../services/api.js';

const TIER_INFO = {
  1: { label: 'Tier 1', description: 'Chặn nội dung nghiêm trọng' },
  2: { label: 'Tier 2', description: 'Che từ nhạy cảm' },
  3: { label: 'Tier 3', description: 'Đánh dấu spam' },
};

function ManageBadWords() {
  const [words, setWords] = useState([]);
  const [activeFilter, setActiveFilter] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [newWord, setNewWord] = useState('');
  const [tier, setTier] = useState(1);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const fetchWords = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await API.badWords.getAll();
      setWords(response.data || []);
    } catch (err) {

      setError('Không thể tải danh sách từ khóa.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchWords(); }, []);

  const filteredWords = useMemo(() => words.filter((item) => (
    (activeFilter === 0 || Number(item.tier) === activeFilter)
    && item.keyword.toLowerCase().includes(searchTerm.toLowerCase().trim())
  )), [words, activeFilter, searchTerm]);

  const tierCounts = useMemo(() => words.reduce((counts, item) => ({
    ...counts,
    [item.tier]: (counts[item.tier] || 0) + 1,
  }), {}), [words]);

  const showMessage = (text) => {
    setMessage(text);
    setTimeout(() => setMessage(''), 3500);
  };

  const handleAdd = async (event) => {
    event.preventDefault();
    if (!newWord.trim()) return;
    try {
      setProcessingId('new');
      await API.badWords.create({ keyword: newWord.trim(), tier });
      setNewWord('');
      showMessage('Đã thêm từ khóa vào bộ lọc.');
      await fetchWords();
    } catch (err) {
      setError(err?.response?.data?.message || 'Không thể thêm từ khóa.');
    } finally {
      setProcessingId(null);
    }
  };

  const handleTierChange = async (item, nextTier) => {
    try {
      setProcessingId(item.id);
      await API.badWords.update(item.id, { tier: Number(nextTier) });
      showMessage(`Đã chuyển “${item.keyword}” sang Tier ${nextTier}.`);
      await fetchWords();
    } catch (err) {
      alert(err?.response?.data?.message || 'Không thể cập nhật cấp độ.');
    } finally {
      setProcessingId(null);
    }
  };

  const handleDelete = async (item) => {
    if (!window.confirm(`Xóa từ khóa “${item.keyword}” khỏi bộ lọc?`)) return;
    try {
      setProcessingId(item.id);
      await API.badWords.delete(item.id);
      showMessage('Đã xóa từ khóa.');
      await fetchWords();
    } catch (err) {
      alert(err?.response?.data?.message || 'Không thể xóa từ khóa.');
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <section className="management-page">
      <header className="management-page-header">
        <div><p className="management-eyebrow">BỘ LỌC TỰ ĐỘNG</p><h2>Quản lý từ khóa</h2><p>Thiết lập mức xử lý cho nội dung nghiêm trọng, nhạy cảm và spam.</p></div>
        <button type="button" onClick={fetchWords} disabled={loading}>{loading ? 'Đang tải...' : 'Làm mới'}</button>
      </header>

      <div className="management-stats-grid compact">
        <article className="management-stat"><span>Tổng từ khóa</span><strong>{words.length}</strong><small>Đang áp dụng trong bộ lọc</small></article>
        {[1, 2, 3].map((value) => <article className={`management-stat stat-tier-${value}`} key={value}><span>{TIER_INFO[value].label}</span><strong>{tierCounts[value] || 0}</strong><small>{TIER_INFO[value].description}</small></article>)}
      </div>

      <section className="management-data-panel bad-words-panel">
        <form className="bad-word-create-form" onSubmit={handleAdd}>
          <div><label htmlFor="new-bad-word">Từ khóa mới</label><input id="new-bad-word" value={newWord} onChange={(event) => setNewWord(event.target.value)} placeholder="Nhập từ hoặc cụm từ..." required /></div>
          <div><label htmlFor="new-bad-word-tier">Cấp độ xử lý</label><select id="new-bad-word-tier" value={tier} onChange={(event) => setTier(Number(event.target.value))}>{[1,2,3].map((value) => <option value={value} key={value}>{TIER_INFO[value].label} — {TIER_INFO[value].description}</option>)}</select></div>
          <button type="submit" disabled={processingId === 'new'}>{processingId === 'new' ? 'Đang thêm...' : 'Thêm từ khóa'}</button>
        </form>

        <div className="management-toolbar">
          <div className="management-search-form"><input value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="Tìm trong bộ từ khóa..." /></div>
          <div className="bad-word-filters">{[0,1,2,3].map((value) => <button type="button" className={activeFilter === value ? 'active' : ''} onClick={() => setActiveFilter(value)} key={value}>{value === 0 ? 'Tất cả' : `Tier ${value}`}<strong>{value === 0 ? words.length : tierCounts[value] || 0}</strong></button>)}</div>
        </div>

        {message ? <div className="alert-cmc">{message}</div> : null}
        {error ? <div className="alert-cmc alert-cmc-warning">{error}</div> : null}

        {loading ? <div className="management-loading">Đang tải bộ từ khóa...</div> : <div className="bad-word-list">{filteredWords.map((item) => <article className="bad-word-card" key={item.id}><div><strong>{item.keyword}</strong><small>{TIER_INFO[item.tier]?.description}</small></div><select value={item.tier} onChange={(event) => handleTierChange(item, event.target.value)} disabled={processingId === item.id}>{[1,2,3].map((value) => <option value={value} key={value}>Tier {value}</option>)}</select><button type="button" onClick={() => handleDelete(item)} disabled={processingId === item.id}>Xóa</button></article>)}{!filteredWords.length ? <div className="management-loading">Không tìm thấy từ khóa phù hợp.</div> : null}</div>}
      </section>
    </section>
  );
}

export default ManageBadWords;
