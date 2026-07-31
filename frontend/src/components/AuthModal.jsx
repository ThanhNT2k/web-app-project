import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import GoogleLoginButton from './GoogleLoginButton';
import PasswordChecklist from './PasswordChecklist';
import { useAuth } from '../contexts/AuthContext';
import { getApiErrorMessage } from '../utils/apiError';

function AuthModal({ open, onClose }) {
  const navigate = useNavigate();
  const { login, register, loginWithGoogle } = useAuth();
  const [mode, setMode] = useState('login');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');

  if (!open) {
    return null;
  }

  const passwordValid =
    registerPassword.length >= 8 &&
    /[A-Z]/.test(registerPassword) &&
    /[0-9]/.test(registerPassword) &&
    /[!@#$%^&*(),.?":{}|<>]/.test(registerPassword);

  const handleOverlayClick = (event) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  const handleLogin = async (event) => {
    event.preventDefault();
    try {
      setLoading(true);
      setError('');
      
      const loggedInUser = await login(loginEmail, loginPassword);
      onClose();

      if (loggedInUser?.role === 'Admin') {
        navigate('/admin');
      } else if (loggedInUser?.role === 'Moderator') {
        navigate('/moderator/dashboard');
      }

    } catch (err) {
      setError(getApiErrorMessage(err, 'Đăng nhập thất bại. Kiểm tra email và mật khẩu.'));
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (event) => {
    event.preventDefault();
    setError('');

    if (!passwordValid) {
      setError('Mật khẩu chưa đáp ứng đủ các tiêu chí bảo mật.');
      return;
    }

    try {
      setLoading(true);
      await register(username, registerEmail, registerPassword, fullName);
      setMode('login');
      setError('');
      alert('Đăng ký thành công! Vui lòng đăng nhập.');
    } catch (err) {
      setError(getApiErrorMessage(err, 'Đăng ký thất bại.'));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (idToken) => {
    try {
      setLoading(true);
      setError('');
      const result = await loginWithGoogle(idToken);
      onClose();
      if (result?.isNewUser) {
        navigate('/auth/google/complete', { state: { tempToken: result.tempToken, suggestedData: result.suggestedData } });
      } else {
        if (result?.user?.role === 'Admin') {
          navigate('/admin');
        } else if (result?.user?.role === 'Moderator') {
          navigate('/moderator/dashboard');
        } else {
          navigate('/');
        }
      }
    } catch (err) {
      setError(getApiErrorMessage(err, 'Đăng nhập Google thất bại.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" onClick={handleOverlayClick}>
      <div className="modal-content">
        <button type="button" className="close-modal" onClick={onClose} aria-label="Đóng">
          &times;
        </button>

        {error ? <div className="alert-cmc alert-cmc-warning mb-3">{error}</div> : null}

        {mode === 'login' ? (
          <div id="login-box">
            <h2>Đăng Nhập</h2>
            <form onSubmit={handleLogin}>
              <div className="form-group-cmc">
                <input
                  type="email"
                  name="email"
                  autoComplete="email"
                  placeholder="Email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  required
                />
              </div>
              <div className="form-group-cmc">
                <input
                  type="password"
                  name="password"
                  autoComplete="current-password"
                  placeholder="Mật khẩu"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  required
                />
              </div>
              <div className="text-end mb-3">
                <Link to="/forgot-password" onClick={onClose} className="forgot-password-link">
                  Quên mật khẩu?
                </Link>
              </div>
              <button type="submit" className="btn-cmc btn-cmc-primary w-100" disabled={loading}>
                {loading ? 'Đang xử lý...' : 'Đăng Nhập'}
              </button>
            </form>

            <div className="auth-divider">
              <span>hoặc</span>
            </div>

            <GoogleLoginButton
              onSuccess={handleGoogleSuccess}
              onError={(err) => setError(err.message)}
              text="signin_with"
            />

            <p className="switch-auth">
              Chưa có tài khoản?
              {' '}
              <button type="button" onClick={() => { setMode('register'); setError(''); }}>
                Đăng ký ngay
              </button>
            </p>
          </div>
        ) : (
          <div id="register-box">
            <h2>Đăng Ký Tài Khoản</h2>
            <form onSubmit={handleRegister}>
              <div className="form-group-cmc">
                <input
                  type="text"
                  name="username"
                  autoComplete="username"
                  placeholder="Tên đăng nhập"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  pattern="^[a-zA-Z][a-zA-Z0-9_-]*$"
                  minLength={3}
                  maxLength={100}
                  title="Tên đăng nhập phải bắt đầu bằng chữ cái và chỉ chứa chữ cái không dấu, chữ số, dấu gạch dưới (_) và gạch ngang (-)"
                />
              </div>
              <div className="form-group-cmc">
                <input
                  type="text"
                  name="fullName"
                  autoComplete="name"
                  placeholder="Họ và tên"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>
              <div className="form-group-cmc">
                <input
                  type="email"
                  name="email"
                  autoComplete="email"
                  placeholder="Email"
                  value={registerEmail}
                  onChange={(e) => setRegisterEmail(e.target.value)}
                  required
                />
              </div>
              <div className="form-group-cmc">
                <input
                  type="password"
                  name="password"
                  autoComplete="new-password"
                  placeholder="Mật khẩu"
                  value={registerPassword}
                  onChange={(e) => setRegisterPassword(e.target.value)}
                  required
                />
                <PasswordChecklist password={registerPassword} />
              </div>
              <button type="submit" className="btn-cmc btn-cmc-primary w-100" disabled={loading}>
                {loading ? 'Đang xử lý...' : 'Đăng Ký'}
              </button>
            </form>

            <div className="auth-divider">
              <span>hoặc</span>
            </div>

            <GoogleLoginButton
              onSuccess={handleGoogleSuccess}
              onError={(err) => setError(err.message)}
              text="signup_with"
            />

            <p className="switch-auth">
              Đã có tài khoản?
              {' '}
              <button type="button" onClick={() => { setMode('login'); setError(''); }}>
                Đăng nhập
              </button>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default AuthModal;
