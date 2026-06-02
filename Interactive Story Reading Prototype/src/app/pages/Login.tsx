import { Link, useNavigate } from 'react-router';
import { useState } from 'react';
import { LogIn } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate login
    navigate('/profile');
  };

  return (
    <div className="max-w-md mx-auto">
      <div className="wireframe-card">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 border-2 border-gray-700 mb-4">
            <LogIn size={32} />
          </div>
          <h1 className="wireframe-heading">Login</h1>
          <p className="wireframe-text mt-2">Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="wireframe-label">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="wireframe-input w-full"
              placeholder="your.email@example.com"
              required
            />
          </div>

          <div>
            <label className="wireframe-label">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="wireframe-input w-full"
              placeholder="Enter your password"
              required
            />
          </div>

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2">
              <input type="checkbox" className="wireframe-checkbox" />
              <span className="wireframe-text">Remember me</span>
            </label>
            <a href="#" className="wireframe-text underline">
              Forgot password?
            </a>
          </div>

          <button type="submit" className="wireframe-button-primary w-full">
            Login
          </button>
        </form>

        <div className="mt-6 pt-6 border-t-2 border-gray-300 text-center">
          <p className="wireframe-text text-sm">
            Don't have an account?{' '}
            <Link to="/register" className="font-bold underline">
              Register here
            </Link>
          </p>
        </div>

        <div className="mt-4 text-center">
          <Link to="/" className="wireframe-text text-sm underline">
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
