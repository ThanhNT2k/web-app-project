import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import StoryCard from '../components/StoryCard';
import { stories as storyApi } from '../services/api';
import type { Pagination, Story } from '../types';

const categories = ['','Tien Hiep','Kiem Hiep','Do Thi','Huyen Huyen','Ngon Tinh','Lich Su'];

export default function HomePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [page, setPage] = useState(Number(searchParams.get('page') || 1));
  const [stories, setStories] = useState<Story[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const requestKey = useMemo(() => `${query}-${category}-${page}`, [query, category, page]);

  useEffect(() => {
    setQuery(searchParams.get('q') || '');
    setCategory(searchParams.get('category') || '');
    setPage(Number(searchParams.get('page') || 1));
  }, [searchParams]);

  useEffect(() => {
    let cancelled = false;

    async function loadStories() {
      setLoading(true);
      setError('');

      try {
        const response = query || category ? await storyApi.search(query, category, page) : await storyApi.getAll(page, 9);

        if (!cancelled) {
          setStories(response.stories || []);
          setPagination(response.pagination || null);
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : 'Failed to load stories');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadStories();

    return () => {
      cancelled = true;
    };
  }, [requestKey]);

  const submitSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSearchParams(
      {
        ...(query ? { q: query } : {}),
        ...(category ? { category } : {}),
        page: '1',
      },
      { replace: true }
    );
  };

  return (
    <div className="container py-4 py-md-5">
      <section className="hero-panel p-4 p-md-5 rounded-4 mb-4 shadow-glow">
        <div className="row align-items-center g-4">
          <div className="col-lg-7">
            <p className="text-uppercase text-brand-700 fw-semibold small mb-2">Discover stories</p>
            <h1 className="display-5 fw-bold mb-3">Read stories with a bold, modern interface.</h1>
            <p className="lead text-secondary mb-0">Search, browse, and continue reading with AI-ready scaffolding built for CMC Truyện.</p>
          </div>
          <div className="col-lg-5">
            <form className="card border-0 shadow-sm p-3 p-md-4" onSubmit={submitSearch}>
              <div className="mb-3">
                <label className="form-label">Search</label>
                <input className="form-control" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search stories" />
              </div>
              <div className="mb-3">
                <label className="form-label">Category</label>
                <select className="form-select" value={category} onChange={(event) => setCategory(event.target.value)}>
                  <option value="">All categories</option>
                  {categories.filter(Boolean).map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>
              <button className="btn btn-brand w-100" type="submit">
                Search stories
              </button>
            </form>
          </div>
        </div>
      </section>

      {error ? <div className="alert alert-danger">{error}</div> : null}
      {loading ? <div className="alert alert-info">Loading stories...</div> : null}

      <div className="row g-4">
        {stories.map((story) => (
          <div key={story.id} className="col-12 col-md-6 col-xl-4">
            <StoryCard story={story} />
          </div>
        ))}
      </div>

      {!loading && stories.length === 0 ? <div className="text-center text-muted py-5">No stories found.</div> : null}

      {pagination ? (
        <div className="d-flex justify-content-center gap-2 mt-4">
          <button
            className="btn btn-outline-secondary"
            type="button"
            disabled={pagination.page <= 1}
            onClick={() => setSearchParams({ ...(query ? { q: query } : {}), ...(category ? { category } : {}), page: String(pagination.page - 1) })}
          >
            Previous
          </button>
          <span className="align-self-center small text-muted">
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <button
            className="btn btn-outline-secondary"
            type="button"
            disabled={pagination.page >= pagination.totalPages}
            onClick={() => setSearchParams({ ...(query ? { q: query } : {}), ...(category ? { category } : {}), page: String(pagination.page + 1) })}
          >
            Next
          </button>
        </div>
      ) : null}
    </div>
  );
}