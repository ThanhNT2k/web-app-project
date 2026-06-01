import type { User } from '../types';

export default function UserProfile({ user }: { user: User | null }) {
  if (!user) {
    return <div className="alert alert-warning">You are not signed in.</div>;
  }

  return (
    <div className="card border-0 shadow-sm">
      <div className="card-body p-4 p-md-5 d-flex flex-column gap-3">
        <div>
          <h2 className="h4 fw-bold mb-1">{user.full_name || user.username}</h2>
          <p className="text-muted mb-0">@{user.username}</p>
        </div>
        <div className="d-flex flex-wrap gap-2">
          <span className="badge bg-brand text-dark">{user.role}</span>
          <span className="badge bg-secondary">{user.email}</span>
        </div>
        {user.bio ? <p className="mb-0 text-secondary">{user.bio}</p> : <p className="mb-0 text-secondary">No bio provided.</p>}
      </div>
    </div>
  );
}