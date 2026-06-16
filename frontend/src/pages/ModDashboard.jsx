import React from 'react';

function ModDashboard() {
  return (
<div style={{ paddingLeft: '5px', paddingRight: '250px' }}>
          <h2 className="section-title mb-4">Bảng điều khiển Moderator</h2>
      
      {/* Khối thống kê */}
      <div className="stats-row mb-4">
        <div className="stat-box">
          <span>Truyện chờ duyệt</span>
          <strong>12</strong>
        </div>
        <div className="stat-box">
          <span>Truyện bị ẩn</span>
          <strong>2</strong>
        </div>
        <div className="stat-box">
          <span>Báo cáo mới</span>
          <strong>5</strong>
        </div>
        <div className="stat-box">
          <span>Tổng bình luận xử lý</span>
          <strong>29</strong>
        </div>
      </div>

      {/* Bảng hoạt động gần đây */}
      <div className="panel-card">
        <h3 className="panel-title">Hoạt động kiểm duyệt gần đây</h3>
        <table className="admin-table mt-3">
          <thead>
            <tr>
              <th>Hành động</th>
              <th>Đối tượng</th>
              <th>Thời gian</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><span className="badge-role" style={{background: '#dcfce7', color: '#16a34a'}}>Đã duyệt</span></td>
              <td>Truyện: Phàm Nhân Tu Tiên</td>
              <td>10 phút trước</td>
            </tr>
            <tr>
              <td><span className="badge-role" style={{background: '#fee2e2', color: '#ef4444'}}>Đã xóa</span></td>
              <td>Bình luận vi phạm (Spam)</td>
              <td>1 giờ trước</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ModDashboard;