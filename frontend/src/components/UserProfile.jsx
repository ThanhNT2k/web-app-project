function UserProfile({ user }) {
  if (!user) {
    return null;
  }

  return (
    <section className="card border-0 shadow-sm user-profile-card">
      <div className="card-body p-4 p-lg-5 d-flex flex-column flex-md-row gap-4 align-items-md-center">
        <div className="profile-avatar">{(user.full_name || user.username || 'U').charAt(0).toUpperCase()}</div>
        <div className="flex-grow-1">
          <h3 className="mb-1">{user.full_name || user.username}</h3>
          <p className="text-muted mb-2">{user.email}</p>
          <div className="d-flex flex-wrap gap-2">
            <span className="badge text-bg-primary">{user.role}</span>
            <span className="badge text-bg-secondary">{user.is_active ? 'Active' : 'Inactive'}</span>
          </div>
        </div>
      </div>
    </section>
  );
}

export default UserProfile;