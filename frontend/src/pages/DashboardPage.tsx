import { useAuth } from '../contexts/AuthContext';

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <div className="container py-5">
      <div className="row g-4 align-items-stretch">
        <div className="col-lg-8">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body p-4 p-md-5">
              <h1 className="h3 fw-bold mb-2">Dashboard</h1>
              <p className="text-muted mb-4">Welcome, {user?.full_name || user?.username || 'creator'}.</p>
              <div className="row g-3">
                <div className="col-md-4"><div className="p-3 rounded-3 bg-brand-50">Stories</div></div>
                <div className="col-md-4"><div className="p-3 rounded-3 bg-brand-50">Chapters</div></div>
                <div className="col-md-4"><div className="p-3 rounded-3 bg-brand-50">Comments</div></div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-lg-4">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body p-4">
              <h2 className="h5 fw-bold mb-3">Role</h2>
              <p className="mb-0 text-secondary">{user?.role || 'Guest'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}