function AdminStoriesPage() {
  return (
    <main className="cmc-main">

      <div className="mb-4">
        <h1>Quản lý truyện</h1>
        <p className="text-muted">
          Quản lý toàn bộ truyện trong hệ thống
        </p>
      </div>

      <div className="panel-card">

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: '1rem',
          }}
        >
          <input
            type="text"
            placeholder="Tìm truyện..."
            className="form-control-cmc"
            style={{ maxWidth: '300px' }}
          />
        </div>

        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Tên truyện</th>
              <th>Tác giả</th>
              <th>Trạng thái</th>
              <th>Hành động</th>
            </tr>
          </thead>

          <tbody>

            <tr>
              <td>1</td>
              <td>Phàm Nhân Tu Tiên</td>
              <td>Nguyễn Văn A</td>
              <td>Đang phát hành</td>
              <td>
                <button className="btn-cmc btn-cmc-sm">
                  Sửa
                </button>
              </td>
            </tr>

            <tr>
              <td>2</td>
              <td>Kiếm Lai</td>
              <td>Uploader 02</td>
              <td>Hoàn thành</td>
              <td>
                <button className="btn-cmc btn-cmc-sm">
                  Sửa
                </button>
              </td>
            </tr>

            <tr>
              <td>3</td>
              <td>Đô Thị Thần Y</td>
              <td>Uploader 03</td>
              <td>Tạm ngưng</td>
              <td>
                <button className="btn-cmc btn-cmc-sm">
                  Sửa
                </button>
              </td>
            </tr>

          </tbody>
        </table>

      </div>

    </main>
  );
}

export default AdminStoriesPage;