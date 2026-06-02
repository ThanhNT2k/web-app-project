import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

import { useAuth } from '../contexts/AuthContext';

function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      setLoading(true);
      setError('');
      await login(email, password);
      navigate(location.state?.from?.pathname || '/');
    } catch (loginError) {
      setError(loginError?.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="cmc-main">
      <div className="row justify-content-center">
        <div className="col-12 col-md-8 col-lg-5">
          <div className="card border-0 shadow-lg" style={{ background: 'var(--surface)', color: 'var(--text)' }}>
            <div className="card-body p-4 p-lg-5">
              <h2 className="mb-2">Đăng nhập</h2>
              <p className="text-muted mb-4">Đăng nhập để tiếp tục đọc truyện.</p>
              {error ? <div className="alert alert-danger">{error}</div> : null}
              <form className="d-grid gap-3" onSubmit={handleSubmit}>
                <input className="form-control form-control-lg" type="email" placeholder="Email" value={email} onChange={(event) => setEmail(event.target.value)} required />
                <input className="form-control form-control-lg" type="password" placeholder="Password" value={password} onChange={(event) => setPassword(event.target.value)} required />
                <button className="btn-cmc btn-cmc-primary w-100" type="submit" disabled={loading}>
                  {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
                </button>
              </form>
              <p className="text-muted mt-4 mb-0">
                Chưa có tài khoản? <Link to="/register">Đăng ký</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default LoginPage;