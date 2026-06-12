import React, { useState } from 'react';
import { REPORT_REASONS } from '../constants/reportConstants';
import api from '../services/api'; // Giả định bạn dùng instance axios tại đây

const ReportModal = ({ chapterId, onClose }) => {
  const [formData, setFormData] = useState({ reason: 'BROKEN_IMAGE', description: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    try {
      await api.post('/reports', { ...formData, chapterId });
      alert("Cảm ơn bạn đã báo cáo, chúng tôi sẽ xử lý sớm nhất!");
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || "Có lỗi xảy ra, vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay"> {/* Thêm overlay nếu cần */}
      <div className="modal-content">
        <h3>Báo cáo vi phạm</h3>
        
        {error && <p style={{ color: 'red' }}>{error}</p>}

        <label>Lý do:</label>
        <select 
          value={formData.reason}
          onChange={(e) => setFormData({...formData, reason: e.target.value})}
        >
          {Object.entries(REPORT_REASONS).map(([key, value]) => (
            <option key={key} value={value}>{value}</option>
          ))}
        </select>

        <label>Chi tiết:</label>
        <textarea 
          placeholder="Mô tả chi tiết vấn đề..." 
          maxLength={500}
          value={formData.description}
          onChange={(e) => setFormData({...formData, description: e.target.value})}
        />

        <div className="modal-actions">
          <button onClick={handleSubmit} disabled={loading}>
            {loading ? 'Đang gửi...' : 'Gửi báo cáo'}
          </button>
          <button onClick={onClose} disabled={loading}>Hủy</button>
        </div>
      </div>
    </div>
  );
};

export default ReportModal;