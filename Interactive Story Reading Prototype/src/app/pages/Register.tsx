import { Link, useNavigate } from 'react-router';
import { useState } from 'react';
import { UserPlus } from 'lucide-react';

export default function Register() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate registration
    navigate('/login');
  };

  return (
    <div className="max-w-md mx-auto">
      <div className="wireframe-card">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 border-2 border-gray-700 mb-4">
            <UserPlus size={32} />
          </div>
          <h1 className="wireframe-heading">Register</h1>
          <p className="wireframe-text mt-2">Create your account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="wireframe-label">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="wireframe-input w-full"
              placeholder="Choose a username"
              required
            />
          </div>

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
              placeholder="Create a password"
              required
            />
          </div>

          <div>
            <label className="wireframe-label">Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="wireframe-input w-full"
              placeholder="Confirm your password"
              required
            />
          </div>

          <div className="flex items-start gap-2">
            <input type="checkbox" className="wireframe-checkbox mt-1" required />
            <label className="wireframe-text text-sm">
              I agree to the Terms of Service and Privacy Policy
            </label>
          </div>

          <button type="submit" className="wireframe-button-primary w-full">
            Create Account
          </button>
        </form>

        <div className="mt-6 pt-6 border-t-2 border-gray-300 text-center">
          <p className="wireframe-text text-sm">
            Already have an account?{' '}
            <Link to="/login" className="font-bold underline">
              Login here
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
