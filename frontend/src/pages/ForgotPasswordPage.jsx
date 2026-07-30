import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import PasswordChecklist from '../components/PasswordChecklist';
import PasswordInput from '../components/PasswordInput';
import API from '../services/api';
import { getApiErrorMessage } from '../utils/apiError';
import { isStrongPassword, passwordsMatch } from '../utils/passwordValidation';

/**
 * ForgotPasswordPage — 3 bước trong 1 trang:
 * Step 1: Nhập email → gửi OTP
 * Step 2: Nhập OTP 6 số
 * Step 3: Nhập mật khẩu mới + xác nhận
 */
function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const passwordValid = isStrongPassword(newPassword);
  const passwordConfirmed = passwordsMatch(newPassword, confirmPassword);
  const confirmPasswordError =
    confirmPassword && !passwordConfirmed
      ? 'Mật khẩu nhập lại không khớp.'
      : '';

  // Step 1: Gửi OTP
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    try {
      setLoading(true);
      await API.auth.forgotPassword(email.trim().toLowerCase());
      setSuccessMessage('Nếu email tồn tại, mã OTP đã được gửi. Vui lòng kiểm tra hộp thư (kể cả thư mục Spam).');
      setStep(2);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Có lỗi xảy ra, vui lòng thử lại.'));
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Xác thực OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    if (otp.trim().length !== 6) {
      setError('Mã OTP gồm 6 chữ số.');
      return;
    }
    try {
      setLoading(true);
      await API.auth.verifyOtp(email.trim().toLowerCase(), otp.trim());
      setSuccessMessage('Xác thực OTP thành công. Bạn có thể đặt mật khẩu mới.');
      setStep(3);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Mã OTP không đúng hoặc đã hết hạn.'));
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Đặt mật khẩu mới
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    if (!passwordValid) {
      setError('Mật khẩu chưa đáp ứng đủ các tiêu chí bảo mật.');
      return;
    }
    if (!passwordConfirmed) {
      setError('Xác nhận mật khẩu không khớp.');
      return;
    }
    try {
      setLoading(true);
      await API.auth.resetPassword({
        email: email.trim().toLowerCase(),
        newPassword,
        confirmPassword,
      });
      // Thành công → chuyển về trang login
      navigate('/login', { state: { message: 'Mật khẩu đã được đặt lại thành công. Vui lòng đăng nhập.' } });
    } catch (err) {
      setError(getApiErrorMessage(err, 'Có lỗi xảy ra, vui lòng thử lại.'));
    } finally {
      setLoading(false);
    }
  };

  // Thanh tiến trình step
  const steps = ['Nhập email', 'Xác nhận OTP', 'Đặt mật khẩu mới'];

  return (
    <main className="cmc-main">
      <div className="row justify-content-center">
        <div className="col-12 col-md-8 col-lg-5">
          <div className="card border-0 shadow-lg" style={{ background: 'var(--surface)', color: 'var(--text)' }}>
            <div className="card-body p-4 p-lg-5">
              <h2 className="mb-1">Quên mật khẩu</h2>
              <p className="text-muted mb-4">Khôi phục quyền truy cập tài khoản của bạn.</p>

              {/* Step indicator */}
              <div className="forgot-steps mb-4">
                {steps.map((label, idx) => (
                  <div key={idx} className={`forgot-step ${step === idx + 1 ? 'active' : step > idx + 1 ? 'done' : ''}`}>
                    <div className="forgot-step__dot">
                      {step > idx + 1 ? '✓' : idx + 1}
                    </div>
                    <span className="forgot-step__label">{label}</span>
                  </div>
                ))}
              </div>

              {error ? <div className="alert alert-danger mb-3">{error}</div> : null}
              {successMessage ? <div className="alert alert-success mb-3">{successMessage}</div> : null}

              {/* STEP 1 */}
              {step === 1 && (
                <form className="d-grid gap-3" onSubmit={handleSendOtp}>
                  <label className="small fw-bold" style={{ color: 'var(--text-muted)' }}>
                    Nhập email đã đăng ký tài khoản:
                  </label>
                  <input
                    className="form-control form-control-lg"
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoFocus
                  />
                  <button className="btn-cmc btn-cmc-primary w-100" type="submit" disabled={loading}>
                    {loading ? 'Đang gửi...' : 'Gửi mã OTP'}
                  </button>
                  <p className="text-muted text-center mb-0 small">
                    <Link to="/login">← Quay lại đăng nhập</Link>
                  </p>
                </form>
              )}

              {/* STEP 2 */}
              {step === 2 && (
                <form className="d-grid gap-3" onSubmit={handleVerifyOtp}>
                  <label className="small fw-bold" style={{ color: 'var(--text-muted)' }}>
                    Nhập mã OTP 6 chữ số đã gửi đến <strong>{email}</strong>:
                  </label>
                  <input
                    className="form-control form-control-lg text-center otp-input"
                    type="text"
                    inputMode="numeric"
                    placeholder="• • • • • •"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    required
                    autoFocus
                  />
                  <button className="btn-cmc btn-cmc-primary w-100" type="submit" disabled={loading}>
                    {loading ? 'Đang xác thực...' : 'Xác nhận OTP'}
                  </button>
                  <button
                    type="button"
                    className="btn-cmc btn-cmc-outline w-100"
                    disabled={loading}
                    onClick={handleSendOtp}
                  >
                    Gửi lại mã OTP
                  </button>
                </form>
              )}

              {/* STEP 3 */}
              {step === 3 && (
                <form className="d-grid gap-3" onSubmit={handleResetPassword}>
                  <label className="small fw-bold" style={{ color: 'var(--text-muted)' }}>
                    Nhập mật khẩu mới cho tài khoản:
                  </label>
                  <div>
                    <PasswordInput
                      id="reset-password"
                      autoComplete="new-password"
                      placeholder="Mật khẩu mới"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                    />
                    <PasswordChecklist password={newPassword} />
                  </div>
                  <PasswordInput
                    id="reset-confirm-password"
                    autoComplete="new-password"
                    placeholder="Xác nhận mật khẩu mới"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    error={confirmPasswordError}
                    required
                  />
                  <button
                    className="btn-cmc btn-cmc-primary w-100"
                    type="submit"
                    disabled={loading || !passwordValid || !passwordConfirmed}
                  >
                    {loading ? 'Đang lưu...' : 'Đặt mật khẩu mới'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default ForgotPasswordPage;
