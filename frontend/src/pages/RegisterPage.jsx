import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { useAuth } from '../contexts/AuthContext';

function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      setLoading(true);
      setError('');
      if (password.length < 8) {
        throw new Error('Password must be at least 8 characters long.');
      }
      await register(username, email, password, fullName);
      navigate('/');
    } catch (registerError) {
      setError(registerError?.response?.data?.message || registerError.message || 'Registration failed.');
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
                  placeholder="Username"
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  required
                  pattern="^[a-zA-Z][a-zA-Z0-9_-]*$"
                  minLength={3}
                  maxLength={100}
                  title="Tên đăng nhập phải bắt đầu bằng chữ cái và chỉ chứa chữ cái không dấu, chữ số, dấu gạch dưới (_) và gạch ngang (-)"
                />
                <input className="form-control form-control-lg" type="email" name="email" autoComplete="email" placeholder="Email" value={email} onChange={(event) => setEmail(event.target.value)} required />
                <input className="form-control form-control-lg" name="fullName" autoComplete="name" placeholder="Full name" value={fullName} onChange={(event) => setFullName(event.target.value)} required />
                <input className="form-control form-control-lg" type="password" name="password" autoComplete="new-password" placeholder="Password (min 8 chars)" value={password} onChange={(event) => setPassword(event.target.value)} required minLength={8} />
                <button className="btn-cmc btn-cmc-primary w-100" type="submit" disabled={loading}>
                  {loading ? 'Đang tạo...' : 'Đăng ký'}
                </button>
              </form>
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