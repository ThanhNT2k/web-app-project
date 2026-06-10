function AdminUsersPage() {
  return (
    <div className="panel-card">
      <h4 className="panel-title">Quản lý người dùng</h4>

      <div className="table-responsive">
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Tên</th>
              <th>Email</th>
              <th>Vai trò</th>
            </tr>
          </thead>

          <tbody>
            <tr>
              <td>1</td>
              <td>Admin Demo</td>
              <td>admin@test.com</td>
              <td>Admin</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AdminUsersPage;