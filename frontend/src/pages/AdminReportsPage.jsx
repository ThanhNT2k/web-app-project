import React, { useState, useEffect } from 'react';
import axios from 'axios';

function AdminReportsPage() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      // Thay URL này bằng base URL của backend bạn
      const response = await axios.get('/api/reports', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setReports(response.data.reports || []);
    } catch (err) {
      setError("Không thể tải danh sách báo cáo.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      await axios.patch(`/api/reports/${id}`, { status }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      fetchReports(); // Load lại danh sách sau khi update
    } catch (err) {
      alert("Cập nhật trạng thái thất bại!");
    }
  };

  if (loading) return <div className="p-6">Đang tải...</div>;
  if (error) return <div className="p-6 text-red-500">{error}</div>;

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Danh sách báo cáo</h2>
  
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-gray-500 uppercase bg-gray-50">
            <tr>
              <th className="px-6 py-3">Người dùng</th>
              <th className="px-6 py-3">Nội dung báo cáo</th>
              <th className="px-6 py-3">Trạng thái</th>
              <th className="px-6 py-3 text-right">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {reports.map((report) => (
              <tr key={report.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 font-medium text-gray-900">ID: {report.user_id}</td>
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