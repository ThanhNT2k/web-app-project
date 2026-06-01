import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

export default function Navbar() {
  const [search, setSearch] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    navigate(search.trim() ? `/?q=${encodeURIComponent(search.trim())}` : '/');
    setIsOpen(false);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark shadow-sm sticky-top">
      <div className="container-fluid container-xl">
        <Link className="navbar-brand fw-bold text-brand-100" to="/">
          CMC Truyện
        </Link>

        <button
          className="navbar-toggler"
          type="button"
          aria-controls="mainNavbar"
          aria-expanded={isOpen}
          aria-label="Toggle navigation"
          onClick={() => setIsOpen((current) => !current)}
        >
          <span className="navbar-toggler-icon" />
        </button>

        <div className={`collapse navbar-collapse ${isOpen ? 'show' : ''}`} id="mainNavbar">
          <form className="d-flex ms-lg-3 my-3 my-lg-0 flex-grow-1" onSubmit={handleSearch}>
            <input
              className="form-control me-2"
              type="search"
              placeholder="Search stories..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
            <button className="btn btn-brand me-2" type="submit">
              Search
            </button>
          </form>

          <ul className="navbar-nav ms-lg-3 align-items-lg-center gap-lg-2">
            <li className="nav-item">
              <Link className="nav-link" to="/">
                Home
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/dashboard">
                Dashboard
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/profile">
                Profile
              </Link>
            </li>
            <li className="nav-item">
              <button type="button" className="btn btn-outline-light btn-sm" onClick={toggleTheme}>
                {isDarkMode ? 'Light' : 'Dark'}
              </button>
            </li>
            {isAuthenticated ? (
              <>
                <li className="nav-item text-white-50 small px-2">{user?.username}</li>
                <li className="nav-item">
                  <button type="button" className="btn btn-outline-warning btn-sm" onClick={handleLogout}>
                    Logout
                  </button>
                </li>
              </>
            ) : (
              <>
                <li className="nav-item">
                  <Link className="btn btn-outline-light btn-sm me-2" to="/login">
                    Login
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="btn btn-brand btn-sm" to="/register">
                    Register
                  </Link>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
}