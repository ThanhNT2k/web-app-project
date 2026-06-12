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
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Quản lý Báo cáo</h2>
      
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-4 border-b">Người gửi</th>
              <th className="p-4 border-b">Nội dung</th>
              <th className="p-4 border-b">Trạng thái</th>
              <th className="p-4 border-b">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {reports.map((report) => (
              <tr key={report.id} className="border-b hover:bg-gray-50">
                <td className="p-4">{report.user_email || 'Ẩn danh'}</td>
                <td className="p-4">{report.reason}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${
                    report.status === 'NEW' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                  }`}>
                    {report.status}
                  </span>
                </td>
                <td className="p-4 flex gap-2">
                  {report.status === 'NEW' && (
                    <button 
                      onClick={() => handleUpdateStatus(report.id, 'RESOLVED')}
                      className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600"
                    >
                      Đánh dấu đã xử lý
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {reports.length === 0 && (
          <p className="p-6 text-center text-gray-500">Không có báo cáo nào mới.</p>
        )}
      </div>
    </div>
  );
}

export default AdminReportsPage;