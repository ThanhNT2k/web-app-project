import React, { useState } from 'react';
import { REPORT_REASONS } from '../constants/reportConstants';
import API from '../services/api';

const ReportModal = ({ chapterId, storyId, onClose }) => {
  const [formData, setFormData] = useState({ reason: 'BROKEN_IMAGE', description: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const numericChapterId = chapterId ? parseInt(chapterId, 10) : null;
    const numericStoryId = storyId ? parseInt(storyId, 10) : null;
    try {
      await API.reports.create({ 
        ...formData, 
        story_id: numericStoryId,
        chapter_id: numericChapterId 
      });
    
      alert("Cảm ơn bạn đã báo cáo!");
      onClose();
    } catch (err) {
      console.error("Lỗi chi tiết:", err.response?.data);
      setError("Có lỗi xảy ra: " + (err.response?.data?.error ? JSON.stringify(err.response.data.error) : "Vui lòng thử lại sau"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 animate-in fade-in zoom-in duration-200">
        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          🚩 Báo cáo vi phạm
        </h3>
        
        {error && <p className="mb-4 text-sm text-red-500 bg-red-50 p-2 rounded">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Lý do báo cáo</label>
            <select 
              className="w-full p-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              value={formData.reason}
              onChange={(e) => setFormData({...formData, reason: e.target.value})}
            >
              {Object.entries(REPORT_REASONS).map(([key, value]) => (
                <option key={key} value={key}>{value}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Chi tiết vấn đề</label>
            <textarea 
              className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none h-24 resize-none"
              placeholder="Hãy cho chúng tôi biết rõ hơn về vấn đề này..." 
              maxLength={500}
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
            />
            <p className="text-right text-xs text-gray-400 mt-1">{formData.description.length}/500</p>
          </div>

          <div className="flex gap-3 mt-6">
            <button 
              type="button" 
              onClick={onClose}
              className="flex-1 py-2.5 rounded-lg font-semibold text-gray-600 hover:bg-gray-100 transition"
            >
              Hủy
            </button>
            <button 
              type="submit" 
              disabled={loading}
              className="flex-1 py-2.5 rounded-lg font-semibold text-white bg-blue-600 hover:bg-blue-700 transition disabled:opacity-50"
            >
              {loading ? 'Đang gửi...' : 'Gửi báo cáo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReportModal;