import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import API from '../services/api';

function AdminReportsPage() {
  const [statusFilter, setStatusFilter] = useState('NEW');
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchReports();
  }, [statusFilter]);

  const fetchReports = async () => {
  try {
    setLoading(true);
    const data = await API.admin.getReports(statusFilter);
    console.log("Dữ liệu mới nhận được từ server:", data.reports);
    setReports(data.reports || []);
  } catch (err) {
    setError("Không thể tải danh sách báo cáo.");
    console.error(err);
  } finally {
    setLoading(false);
  }
};

  const handleUpdateStatus = async (id, status) => {
    try {
      await API.reports.updateStatus(id, status);
      fetchReports();
    } catch (err) {
      console.error("Lỗi cập nhật:", err.response || err);
      alert("Cập nhật trạng thái thất bại: " + (err.response?.data?.message || "Lỗi server"));
    }
  };

  if (loading) return <div className="p-6">Đang tải...</div>;
  if (error) return <div className="p-6 text-red-500">{error}</div>;

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-800">Danh sách báo cáo</h2>
        <div className="flex bg-gray-100 p-1 rounded-lg">
          {['NEW', 'RESOLVED', 'ALL'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                statusFilter === status 
                  ? 'bg-white text-blue-600 shadow-sm' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {status === 'NEW' ? 'Báo cáo mới' : status === 'RESOLVED' ? 'Đã xử lý' : 'Tất cả'}
            </button>
          ))}
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-gray-500 uppercase bg-gray-50">
            <tr>
              <th className="px-6 py-3">Người dùng</th>
              <th className="px-6 py-3">Truyện / Chương</th>
              <th className="px-6 py-3">Nội dung báo cáo</th>
              <th className="px-6 py-3">Trạng thái</th>
              <th className="px-6 py-3 text-right">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {reports.map((report) => (
              <tr key={report.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 font-medium text-gray-900">{report.reporter_username || `ID: ${report.user_id}`}</td>
                <td className="px-6 py-4">
                  {report.comment_id ? (
                    <div>
                      <span className="font-semibold text-gray-800">Bình luận</span>
                      {report.comment_content ? (
                        <div className="text-gray-500 truncate max-w-xs">{report.comment_content}</div>
                      ) : null}
                    </div>
                  ) : report.story_title || report.chapter_title || report.story_slug ? (
                    report.story_slug ? (
                      <Link to={`/${report.story_slug}${report.chapter_number ? `/${report.chapter_number}` : ''}`} className="font-semibold text-blue-600 hover:underline">
                        {report.story_title || report.chapter_title || report.story_slug}{report.chapter_number ? ` — Chương ${report.chapter_number}` : ''}
                      </Link>
                    ) : (
                      <span className="font-semibold text-gray-800">{report.story_title || report.chapter_title || `ID: ${report.story_id}`}</span>
                    )
                  ) : (
                    <span className="text-gray-500">—</span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <div className="font-semibold text-gray-800">{report.reason}</div>
                  <div className="text-gray-500 truncate max-w-xs">{report.description}</div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${
                    report.status === 'NEW' ? 'bg-blue-50 text-blue-600' : 'bg-green-50 text-green-600'
                  }`}>
                    {report.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  {report.status === 'NEW' && (
                    <button 
                      onClick={() => handleUpdateStatus(report.id, 'RESOLVED')}
                      className="text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-xs font-medium transition-all"
                    >
                      Xử lý
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AdminReportsPage;