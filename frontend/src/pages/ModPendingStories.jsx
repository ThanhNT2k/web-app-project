import React from 'react';
import { Link } from 'react-router-dom';

function ModPendingStories() {
  return (
    <div style={{ paddingLeft: '5px', paddingRight: '250px' }}>
      <h2 className="section-title mb-4">Duyệt Truyện Chờ</h2>

      <div className="panel-card">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h3 className="panel-title mb-0">Danh sách chờ (12)</h3>
          <button className="btn-cmc btn-cmc-outline btn-sm">Làm mới 🔄</button>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Tên truyện</th>
                <th>Người đăng</th>
                <th>Thể loại</th>
                <th>Ngày gửi</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {/* Mock data - Sau này bạn thay bằng dữ liệu API */}
              <tr>
                <td><strong>Hệ Thống Bán Cơm</strong></td>
                <td>@uploader_duy</td>
                <td><span className="genre-badge">Đô Thị</span></td>
                <td>15/06/2026</td>
                <td>
                  <div className="d-flex gap-2">
                    <button className="btn-cmc btn-cmc-primary btn-sm">Duyệt</button>
                    <button className="btn-cmc btn-cmc-outline btn-sm text-danger border-danger">Từ chối</button>
                  </div>
                </td>
              </tr>
              <tr>
                <td><strong>Đại Quản Gia Là Ma Hoàng</strong></td>
                <td>@luong_pro</td>
                <td><span className="genre-badge">Huyền Huyễn</span></td>
                <td>14/06/2026</td>
                <td>
                  <div className="d-flex gap-2">
                    <button className="btn-cmc btn-cmc-primary btn-sm">Duyệt</button>
                    <button className="btn-cmc btn-cmc-outline btn-sm text-danger border-danger">Từ chối</button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default ModPendingStories;