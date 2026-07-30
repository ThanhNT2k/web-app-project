import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import GoogleLoginButton from '../components/GoogleLoginButton';
import PasswordChecklist from '../components/PasswordChecklist';
import PasswordInput from '../components/PasswordInput';
import { useAuth } from '../contexts/AuthContext';

function RegisterPage() {
  const navigate = useNavigate();
  const { register, loginWithGoogle } = useAuth();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const passwordValid =
    password.length >= 8 &&
    /[A-Z]/.test(password) &&
    /[0-9]/.test(password) &&
    /[!@#$%^&*(),.?":{}|<>]/.test(password);
  const confirmPasswordError =
    confirmPassword && password !== confirmPassword
      ? 'Mật khẩu nhập lại không khớp.'
      : '';

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (!passwordValid) {
      setError('Mật khẩu chưa đáp ứng đủ các tiêu chí bảo mật.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Xác nhận mật khẩu không khớp.');
      return;
    }

    try {
      setLoading(true);
      await register(username, email, password, fullName);
      navigate('/');
    } catch (registerError) {
      setError(registerError?.response?.data?.message || registerError.message || 'Đăng ký thất bại.');
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
        // Lần đầu đăng ký Google → chuyển sang trang đặt mật khẩu
        navigate('/auth/google/complete', { state: { tempToken: result.tempToken, suggestedData: result.suggestedData } });
      } else {
        navigate('/');
      }
    } catch (err) {
      setError(err?.response?.data?.message || 'Đăng nhập Google thất bại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="cmc-main">
      <div className="row justify-content-center">
        <div className="col-12 col-md-8 col-lg-6">
          <div className="card border-0 shadow-lg" style={{ background: 'var(--surface)', color: 'var(--text)' }}>
            <div className="card-body p-4 p-lg-5">
              <h2 className="mb-2">Đăng ký tài khoản</h2>
              <p className="text-muted mb-4">Tham gia CMC Truyện để lưu tiến độ đọc.</p>

              {error ? <div className="alert alert-danger">{error}</div> : null}

              <form className="d-grid gap-3" onSubmit={handleSubmit}>
                <input
                  className="form-control form-control-lg"
                  name="username"
                  autoComplete="username"
                  placeholder="Tên đăng nhập (username)"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  pattern="^[a-zA-Z][a-zA-Z0-9_-]*$"
                  minLength={3}
                  maxLength={100}
                  title="Tên đăng nhập phải bắt đầu bằng chữ cái và chỉ chứa chữ cái không dấu, chữ số, dấu gạch dưới (_) và gạch ngang (-)"
                />
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
                  name="fullName"
                  autoComplete="name"
                  placeholder="Họ và tên"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />

                <div>
                  <PasswordInput
                    id="register-password"
                    name="password"
                    autoComplete="new-password"
                    placeholder="Mật khẩu"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <PasswordChecklist password={password} />
                </div>

                <PasswordInput
                  id="register-confirm-password"
                  name="confirmPassword"
                  autoComplete="new-password"
                  placeholder="Xác nhận mật khẩu"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  error={confirmPasswordError}
                  required
                />

                <button
                  className="btn-cmc btn-cmc-primary w-100"
                  type="submit"
                  disabled={loading || !passwordValid}
                >
                  {loading ? 'Đang tạo...' : 'Đăng ký'}
                </button>
              </form>

              {/* Divider */}
              <div className="auth-divider">
                <span>hoặc</span>
              </div>

              <GoogleLoginButton
                onSuccess={handleGoogleSuccess}
                onError={(err) => setError(err.message)}
                text="signup_with"
              />

              <p className="text-muted mt-4 mb-0">
                Đã có tài khoản? <Link to="/login">Đăng nhập</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default RegisterPage;
