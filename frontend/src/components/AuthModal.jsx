import { useState } from 'react';

import { useAuth } from '../contexts/AuthContext';
import { userNavigate } from 'react-router-dom';

function AuthModal({ open, onClose }) {
  const navigate = userNavigate();
  const { login, register } = useAuth();
  const [mode, setMode] = useState('login');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  const [username, setUsername] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');

  if (!open) {
    return null;
  }

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
      }

    } catch (err) {
      setError(err?.response?.data?.message || 'Đăng nhập thất bại. Kiểm tra email và mật khẩu.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (event) => {
    event.preventDefault();
    try {
      setLoading(true);
      setError('');
      await register(username, registerEmail, registerPassword, username);
      setMode('login');
      setError('');
      alert('Đăng ký thành công! Vui lòng đăng nhập.');
    } catch (err) {
      setError(err?.response?.data?.message || 'Đăng ký thất bại.');
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
                  placeholder="Email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  required
                />
              </div>
              <div className="form-group-cmc">
                <input
                  type="password"
                  placeholder="Mật khẩu"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  required
                />
              </div>
              <button type="submit" className="btn-cmc btn-cmc-primary w-100" disabled={loading}>
                {loading ? 'Đang xử lý...' : 'Đăng Nhập'}
              </button>
            </form>
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
                  placeholder="Tên hiển thị"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
              <div className="form-group-cmc">
                <input
                  type="email"
                  placeholder="Email"
                  value={registerEmail}
                  onChange={(e) => setRegisterEmail(e.target.value)}
                  required
                />
              </div>
              <div className="form-group-cmc">
                <input
                  type="password"
                  placeholder="Mật khẩu (tối thiểu 8 ký tự)"
                  value={registerPassword}
                  onChange={(e) => setRegisterPassword(e.target.value)}
                  minLength={8}
                  required
                />
              </div>
              <button type="submit" className="btn-cmc btn-cmc-primary w-100" disabled={loading}>
                {loading ? 'Đang xử lý...' : 'Đăng Ký'}
              </button>
            </form>
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
