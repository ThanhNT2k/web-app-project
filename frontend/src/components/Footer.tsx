import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="mt-auto border-top bg-white/80 dark:bg-slate-950/80 backdrop-blur">
      <div className="container py-5">
        <div className="row g-4">
          <div className="col-md-4">
            <h5 className="fw-bold">CMC Truyện</h5>
            <p className="text-muted mb-0">A polished reading experience for stories, chapters, and community.</p>
          </div>
          <div className="col-md-4">
            <h6 className="fw-semibold">Quick links</h6>
            <ul className="list-unstyled d-grid gap-2 mb-0">
              <li><Link to="/" className="text-decoration-none">Home</Link></li>
              <li><Link to="/login" className="text-decoration-none">Login</Link></li>
              <li><Link to="/register" className="text-decoration-none">Register</Link></li>
            </ul>
          </div>
          <div className="col-md-4">
            <h6 className="fw-semibold">Newsletter</h6>
            <form className="d-flex gap-2">
              <input className="form-control" type="email" placeholder="Your email" />
              <button className="btn btn-brand" type="button">Join</button>
            </form>
          </div>
        </div>
        <div className="pt-4 mt-4 border-top d-flex flex-column flex-md-row justify-content-between gap-2 text-muted small">
          <span>© {new Date().getFullYear()} CMC Truyện</span>
          <span>Built with React, Tailwind, Bootstrap, and Vite</span>
        </div>
      </div>
    </footer>
  );
}