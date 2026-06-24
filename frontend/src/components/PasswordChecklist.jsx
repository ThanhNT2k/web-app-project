/**
 * PasswordChecklist — Component hiển thị realtime 4 tiêu chí độ mạnh mật khẩu.
 * Xuất hiện ngay bên dưới ô nhập mật khẩu, tích xanh từng tiêu chí khi đạt.
 *
 * Dùng CSS variables của hệ thống để tự động hỗ trợ dark/light mode.
 */
function PasswordChecklist({ password }) {
  const checks = [
    { key: 'length',   label: 'Ít nhất 8 ký tự',                    met: password.length >= 8 },
    { key: 'upper',    label: 'Ít nhất 1 chữ hoa (A-Z)',             met: /[A-Z]/.test(password) },
    { key: 'number',   label: 'Ít nhất 1 chữ số (0-9)',              met: /[0-9]/.test(password) },
    { key: 'special',  label: 'Ít nhất 1 ký tự đặc biệt (!@#...)',   met: /[!@#$%^&*(),.?":{}|<>]/.test(password) },
  ];

  // Không hiển thị khi chưa nhập gì
  if (!password) return null;

  return (
    <div className="password-checklist">
      <p className="password-checklist__label">Yêu cầu mật khẩu:</p>
      <ul className="password-checklist__list">
        {checks.map(({ key, label, met }) => (
          <li key={key} className={`password-checklist__item ${met ? 'met' : ''}`}>
            <span className="password-checklist__icon" aria-hidden="true">
              {met ? (
                // Checkmark SVG khi đạt
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <circle cx="7" cy="7" r="7" fill="currentColor" />
                  <path d="M3.5 7L5.83 9.5L10.5 4.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              ) : (
                // Circle outline khi chưa đạt
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.5" />
                </svg>
              )}
            </span>
            <span className="password-checklist__text">{label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default PasswordChecklist;
