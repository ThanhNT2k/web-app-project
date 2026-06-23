import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import PasswordChecklist from '../components/PasswordChecklist';
import { useAuth } from '../contexts/AuthContext';
import API from '../services/api';

/**
 * GoogleRegisterCompletePage — Trang hoàn tất đăng ký lần đầu bằng Google.
 * Hiển thị thông tin lấy từ Google (readonly) và yêu cầu đặt mật khẩu.
 * Nhận dữ liệu từ navigate state (tempToken + suggestedData từ /auth/google response).
 */
function GoogleRegisterCompletePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { setUser } = useAuth();

  const { tempToken, suggestedData } = location.state || {};

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const passwordValid =
    password.length >= 8 &&
    /[A-Z]/.test(password) &&
    /[0-9]/.test(password) &&
    /[!@#$%^&*(),.?":{}|<>]/.test(password);

  // Redirect nếu không có state hợp lệ (ai đó vào thẳng URL)
  useEffect(() => {
    if (!tempToken || !suggestedData) {
      navigate('/register', { replace: true });
    }
  }, [tempToken, suggestedData, navigate]);

  if (!tempToken || !suggestedData) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
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
      const response = await API.auth.googleComplete({ tempToken, password, confirmPassword });

      // Lưu token + user vào localStorage và cập nhật AuthContext
      localStorage.setItem('cmc_token', response.token);
      localStorage.setItem('cmc_user', JSON.stringify(response.user));
      setUser(response.user);

      navigate('/');
    } catch (err) {
      setError(err?.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại.');
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
              <h2 className="mb-1">Hoàn tất đăng ký</h2>
              <p className="text-muted mb-4">
                Đây là lần đầu bạn đăng nhập bằng Google. Vui lòng đặt mật khẩu để hoàn tất tạo tài khoản.
              </p>

              {/* Thông tin từ Google — readonly */}
              <div className="google-profile-preview mb-4">
                {suggestedData.avatar_url && (
                  <img
                    src={suggestedData.avatar_url}
                    alt="Avatar"
                    className="google-profile-preview__avatar"
                  />
                )}
                <div>
                  <p className="google-profile-preview__name">{suggestedData.full_name}</p>
                  <p className="google-profile-preview__email">{suggestedData.email}</p>
                </div>
              </div>

              {error ? <div className="alert alert-danger mb-3">{error}</div> : null}

              <form className="d-grid gap-3" onSubmit={handleSubmit}>
                <div>
                  <input
                    className="form-control form-control-lg"
                    type="password"
                    autoComplete="new-password"
                    placeholder="Đặt mật khẩu cho tài khoản"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoFocus
                  />
                  <PasswordChecklist password={password} />
                </div>

                <input
                  className="form-control form-control-lg"
                  type="password"
                  autoComplete="new-password"
                  placeholder="Xác nhận mật khẩu"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />

                <button
                  className="btn-cmc btn-cmc-primary w-100"
                  type="submit"
                  disabled={loading || !passwordValid}
                >
                  {loading ? 'Đang tạo tài khoản...' : 'Hoàn tất đăng ký'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default GoogleRegisterCompletePage;
