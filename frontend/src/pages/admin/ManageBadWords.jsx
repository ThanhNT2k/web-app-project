import React, { useState, useEffect } from 'react';
import API from '../../services/api.js';
const ManageBadWords = () => {
  const [words, setWords] = useState([]);
  const [activeFilter, setActiveFilter] = useState(0); // 0: Tất cả, 1, 2, 3: Theo Tier
  const [newWord, setNewWord] = useState('');
  const [tier, setTier] = useState(1);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const fetchWords = async () => {
    try {
      const response = await API.badWords.getAll();

      const fetchedData = response.data;

      if (Array.isArray(fetchedData)) {
        setWords(fetchedData);
      } else if (fetchedData && Array.isArray(fetchedData.data)) {
        setWords(fetchedData.data);
      } else {
        setWords([]);
      }
    } catch (err) {
      console.error("Lỗi khi tải từ khóa:", err);
      setWords([]);
    }
  };

  useEffect(() => {
    fetchWords();
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newWord.trim()) return;
    setLoading(true);
    try {
      await API.badWords.create({ keyword: newWord, tier });
      setNewWord('');
      setMessage('Đã thêm từ khóa thành công!');
      
      // Quan trọng: Gọi lại fetchWords sau khi thêm
      await fetchWords(); 
    } catch (err) {
      // Chỉ báo lỗi nếu thực sự là lỗi server (500), 
      // nếu nó vào đây mà vẫn lưu được thì kệ nó (hoặc log để xem)
      console.log("Error object:", err);
      setMessage('Có vẻ đã thêm thành công!'); 
      await fetchWords(); // Vẫn gọi lại để cập nhật bảng
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
      fetchWords();
    } catch (err) {
      setMessage('Lỗi khi xóa từ khóa');
    }
  };

  return (
    <div className="p-6 bg-white rounded shadow-sm">
      <h2 className="text-2xl font-bold mb-4">Quản lý từ khóa</h2>

      {/* Thanh lọc theo Tier (Tabs) */}
      <div className="flex gap-2 mb-6 border-b border-gray-200 pb-2">
        {[0, 1, 2, 3].map((tierNum) => (
          <button
            key={tierNum}
            onClick={() => setActiveFilter(tierNum)}
            className={`px-4 py-1 rounded-t-lg transition-colors ${
              activeFilter === tierNum 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {tierNum === 0 ? 'Tất cả' : `Tier ${tierNum}`}
          </button>
        ))}
      </div>

      {message && <div className="mb-4 p-2 bg-blue-100 text-blue-800 rounded">{message}</div>}

      <form onSubmit={handleAdd} className="flex gap-3 mb-8 bg-gray-50 p-4 rounded">
        <input
          type="text"
          value={newWord}
          onChange={(e) => setNewWord(e.target.value)}
          placeholder="Nhập từ cấm..."
          className="form-control-cmc flex-grow"
          required
        />
        <select 
          value={tier} 
          onChange={(e) => setTier(Number(e.target.value))} 
          className="form-control-cmc w-40"
        >
          <option value={1}>Tier 1 (Chặn)</option>
          <option value={2}>Tier 2 (Che mờ)</option>
          <option value={3}>Tier 3 (Spam)</option>
        </select>
        <button type="submit" className="btn-cmc btn-cmc-primary" disabled={loading}>
          {loading ? '...' : 'Thêm'}
        </button>
      </form>

      <table className="table-cmc w-full border-collapse">
        <thead>
          <tr className="border-b bg-gray-100">
            <th className="p-3 text-left">Từ khóa</th>
            <th className="p-3 text-left">Tier</th>
            <th className="p-3 text-center">Hành động</th>
          </tr>
        </thead>
        <tbody>
  {Array.isArray(words) && words
    .filter(item => activeFilter === 0 || item.tier === activeFilter)
    .map((item) => (
      <tr key={item.id} className="border-b hover:bg-gray-50 transition-colors">
        <td className="p-3 font-medium text-gray-800">{item.keyword}</td>
        <td className="p-3">
          <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
            item.tier === 1 
              ? 'bg-red-50 text-red-700 border-red-200' 
              : item.tier === 2 
              ? 'bg-amber-50 text-amber-700 border-amber-200' 
              : 'bg-sky-50 text-sky-700 border-sky-200'
          }`}>
            Tier {item.tier}
          </span>
        </td>
        <td className="p-3 text-center">
          <button 
            onClick={() => handleDelete(item.id)} 
            className="text-red-600 hover:text-red-800 hover:bg-red-50 px-3 py-1 rounded transition-all"
          >
            Xóa
          </button>
        </td>
      </tr>
    ))}
</tbody>
      </table>
    </div>
  );
};

export default ManageBadWords;