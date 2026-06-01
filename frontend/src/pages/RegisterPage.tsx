import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { useAuth } from '../contexts/AuthContext';

export default function RegisterPage() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      setLoading(false);
      return;
    }

    try {
      await register(username, email, password, fullName);
      navigate('/', { replace: true });
    } catch (registerError) {
      setError(registerError instanceof Error ? registerError.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5" style={{ maxWidth: 620 }}>
      <div className="card border-0 shadow-sm">
        <div className="card-body p-4 p-md-5">
          <h1 className="h3 fw-bold mb-2">Create your account</h1>
          <p className="text-muted mb-4">Start tracking stories and chapters.</p>
          {error ? <div className="alert alert-danger">{error}</div> : null}
          <form className="row g-3" onSubmit={handleSubmit}>
            <div className="col-md-6">
              <label className="form-label">Username</label>
              <input className="form-control" value={username} onChange={(event) => setUsername(event.target.value)} required />
            </div>
            <div className="col-md-6">
              <label className="form-label">Full name</label>
              <input className="form-control" value={fullName} onChange={(event) => setFullName(event.target.value)} />
            </div>
            <div className="col-12">
              <label className="form-label">Email</label>
              <input className="form-control" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
            </div>
            <div className="col-12">
              <label className="form-label">Password</label>
              <input className="form-control" type="password" minLength={8} value={password} onChange={(event) => setPassword(event.target.value)} required />
              <div className="form-text">Use at least 8 characters.</div>
            </div>
            <div className="col-12">
              <button className="btn btn-brand w-100" type="submit" disabled={loading}>
                {loading ? 'Creating account...' : 'Register'}
              </button>
            </div>
          </form>
          <p className="mt-3 mb-0 text-muted">
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}