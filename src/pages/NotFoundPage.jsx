import { Link } from 'react-router-dom';

function NotFoundPage() {
  return (
    <main className="container py-5 text-center">
      <h1 className="display-4 fw-bold">404</h1>
      <p className="text-muted mb-4">The page you are looking for does not exist.</p>
      <Link className="btn btn-brand" to="/">Go Home</Link>
    </main>
  );
}

export default NotFoundPage;