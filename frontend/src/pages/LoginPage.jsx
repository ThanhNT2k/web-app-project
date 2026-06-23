import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

import GoogleLoginButton from '../components/GoogleLoginButton';
import { useAuth } from '../contexts/AuthContext';

function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, loginWithGoogle } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      setLoading(true);
      setError('');
      const currentUser = await login(email, password);

      if (currentUser?.role === 'Admin') {
        navigate('/admin');
        return;
      }

      if (currentUser?.role === 'Moderator') {
        navigate('/moderator/dashboard');
        return;
      }

      navigate(location.state?.from?.pathname || '/');
    } catch (loginError) {
      setError(loginError?.response?.data?.message || 'Đăng nhập thất bại. Vui lòng kiểm tra email và mật khẩu.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (idToken) => {
    try {
      setLoading(true);
      setError('');
      const result = await loginWithGoogle(idToken);
      if (result?.isNewUser) {
        navigate('/auth/google/complete', { state: { tempToken: result.tempToken, suggestedData: result.suggestedData } });
        return;
      }
      if (result?.user?.role === 'Admin') {
        navigate('/admin');
        return;
      }
      navigate(location.state?.from?.pathname || '/');
    } catch (err) {
      setError(err?.response?.data?.message || 'Đăng nhập Google thất bại.');
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
                <input
                  className="form-control form-control-lg"
                  type="email"
                  name="email"
                  autoComplete="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <input
                  className="form-control form-control-lg"
                  type="password"
                  name="password"
                  autoComplete="current-password"
                  placeholder="Mật khẩu"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />

                <div className="text-end">
                  <Link to="/forgot-password" className="forgot-password-link">
                    Quên mật khẩu?
                  </Link>
                </div>

                <button className="btn-cmc btn-cmc-primary w-100" type="submit" disabled={loading}>
                  {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
                </button>
              </form>

              {/* Divider */}
              <div className="auth-divider">
                <span>hoặc</span>
              </div>

              <GoogleLoginButton
                onSuccess={handleGoogleSuccess}
                onError={(err) => setError(err.message)}
                text="signin_with"
              />

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