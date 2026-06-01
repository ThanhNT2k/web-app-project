import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

import { useAuth } from '../contexts/AuthContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname || '/';

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      await login(email, password);
      navigate(redirectTo, { replace: true });
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5" style={{ maxWidth: 520 }}>
      <div className="card border-0 shadow-sm">
        <div className="card-body p-4 p-md-5">
          <h1 className="h3 fw-bold mb-2">Welcome back</h1>
          <p className="text-muted mb-4">Sign in to continue reading.</p>
          {error ? <div className="alert alert-danger">{error}</div> : null}
          <form className="d-grid gap-3" onSubmit={handleSubmit}>
            <div>
              <label className="form-label">Email</label>
              <input className="form-control" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
            </div>
            <div>
              <label className="form-label">Password</label>
              <input className="form-control" type="password" value={password} onChange={(event) => setPassword(event.target.value)} required />
            </div>
            <button className="btn btn-brand" type="submit" disabled={loading}>
              {loading ? 'Signing in...' : 'Login'}
            </button>
          </form>
          <p className="mt-3 mb-0 text-muted">
            No account? <Link to="/register">Create one</Link>
          </p>
        </div>
      </div>
    </div>
  );
}