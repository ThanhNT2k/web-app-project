import React, { useState, useEffect, useMemo } from 'react';
import API from '../../services/api.js';

const ManageBadWords = () => {
  const [words, setWords] = useState([]);
  const [activeFilter, setActiveFilter] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [newWord, setNewWord] = useState('');
  const [tier, setTier] = useState(1);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const fetchWords = async () => {
    try {
      const response = await API.badWords.getAll();
      const data = response.data?.data || (Array.isArray(response.data) ? response.data : []);
      setWords(data);
    } catch (err) {
      console.error("Lỗi khi tải từ khóa:", err);
      setWords([]);
    }
  };

  useEffect(() => {
    fetchWords();
  }, []);

  // Định nghĩa lại hàm handleAdd
  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newWord.trim()) return;
    setLoading(true);
    try {
      await API.badWords.create({ keyword: newWord, tier });
      setNewWord('');
      setMessage('Đã thêm từ khóa thành công!');
      await fetchWords();
    } catch (err) {
      setMessage('Lỗi khi thêm từ khóa!');
    } finally {
      setLoading(false);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa từ khóa này?")) return;
    try {
      await API.badWords.delete(id);
      setMessage('Đã xóa từ khóa!');
      await fetchWords();
    } catch (err) {
      setMessage('Lỗi khi xóa từ khóa');
    }
  };

  const handleUpdateTier = async (id, currentTier) => {
    const nextTier = currentTier === 3 ? 1 : currentTier + 1;
    try {
      await API.badWords.update(id, { tier: nextTier });
      fetchWords();
    } catch (err) {
      alert("Không thể cập nhật Tier");
    }
  };

  const filteredWords = useMemo(() => {
    return words.filter(item => {
      const matchesTier = activeFilter === 0 || item.tier === activeFilter;
      const matchesSearch = item.keyword.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesTier && matchesSearch;
    });
  }, [words, activeFilter, searchTerm]);

  return (
    <div className="p-4 bg-white rounded shadow-sm">
      <h2 className="section-title mb-4">Quản lý từ khóa cấm</h2>

      <div className="row g-3 mb-4">
        <div className="col-md-6">
          <input
            type="text"
            className="form-control"
            placeholder="Tìm kiếm từ khóa..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="col-md-6 d-flex gap-2">
          {[0, 1, 2, 3].map((t) => (
            <button
              key={t}
              onClick={() => setActiveFilter(t)}
              className={`btn btn-sm ${activeFilter === t ? 'btn-primary' : 'btn-outline-secondary'}`}
            >
              {t === 0 ? 'Tất cả' : `Tier ${t}`}
            </button>
          ))}
        </div>
      </div>

      {message && <div className="alert alert-info py-2">{message}</div>}

      <form onSubmit={handleAdd} className="row g-2 mb-4 bg-light p-3 rounded">
        <div className="col-md-5">
          <input type="text" className="form-control" placeholder="Từ khóa mới..." value={newWord} onChange={(e) => setNewWord(e.target.value)} required />
        </div>
        <div className="col-md-4">
          <select className="form-select" value={tier} onChange={(e) => setTier(Number(e.target.value))}>
            <option value={1}>Tier 1 (Chặn)</option>
            <option value={2}>Tier 2 (Che mờ)</option>
            <option value={3}>Tier 3 (Spam)</option>
          </select>
        </div>
        <div className="col-md-3">
          <button type="submit" className="btn btn-success w-100" disabled={loading}>Thêm mới</button>
        </div>
      </form>

      <div className="table-responsive">
        <table className="table table-hover align-middle">
          <thead className="table-light">
            <tr>
              <th>Từ khóa</th>
              <th>Cấp độ</th>
              <th className="text-center">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {filteredWords.map((item) => (
              <tr key={item.id}>
                <td className="fw-bold">{item.keyword}</td>
                <td>
                  <button 
                    className={`badge border-0 ${item.tier === 1 ? 'bg-danger' : item.tier === 2 ? 'bg-warning text-dark' : 'bg-info'}`}
                    onClick={() => handleUpdateTier(item.id, item.tier)}
                    title="Bấm để chuyển Tier"
                  >
                    Tier {item.tier}
                  </button>
                </td>
                <td className="text-center">
                  <button onClick={() => handleDelete(item.id)} className="btn btn-sm btn-outline-danger">Xóa</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ManageBadWords;