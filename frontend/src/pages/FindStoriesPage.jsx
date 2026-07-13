import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import StoryCard from '../components/StoryCard';
import IconBadge from '../components/IconBadge';
import API from '../services/api';
import { FontAwesomeIcon, faMagnifyingGlass } from '../lib/icons';

function FindStoriesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [stories, setStories] = useState([]);
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [activeTag, setActiveTag] = useState(searchParams.get('tag') || '');
  const [page, setPage] = useState(Number(searchParams.get('page')) || 1);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });

  useEffect(() => {
    API.tags.getAll()
      .then((res) => setTags(res.tags || []))
      .catch(() => setTags([]));
  }, []);

  useEffect(() => {
    const fetchStories = async () => {
      try {
        setLoading(true);
        const hasQuery = query.trim() || activeTag;
        const response = hasQuery
          ? await API.stories.search(query.trim(), null, activeTag || null, page, 12)
          : await API.stories.getAll(page, 12);

        setStories(response.stories || []);
        setPagination(response.pagination || { page: 1, totalPages: 1 });
      } catch {
        setStories([]);
      } finally {
        setLoading(false);
      }
    };

    fetchStories();
  }, [query, activeTag, page]);

  const applySearch = (event) => {
    event.preventDefault();
    setPage(1);
    const params = {};
    if (query.trim()) params.q = query.trim();
    if (activeTag) params.tag = activeTag;
    params.page = '1';
    setSearchParams(params);
  };

  const selectTag = (slug) => {
    const next = activeTag === slug ? '' : slug;
    setActiveTag(next);
    setPage(1);
    const params = {};
    if (query.trim()) params.q = query.trim();
    if (next) params.tag = next;
    params.page = '1';
    setSearchParams(params);
  };

  return (
    <main className="cmc-main">
      <h1 className="page-title-with-icon mb-2">
        <IconBadge icon={faMagnifyingGlass} size="md" tone="primary" />
        Tìm truyện
      </h1>
      <p className="text-muted mb-4">Tìm theo tên truyện, tên tác giả hoặc chọn thẻ (tag) bên dưới.</p>

      <section className="panel-card mb-4">
        <form onSubmit={applySearch} className="find-form">
          <input
            className="form-control-cmc"
            placeholder="Nhập tên truyện, tên tác giả hoặc mô tả..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button type="submit" className="btn-cmc btn-cmc-primary">
            <FontAwesomeIcon icon={faMagnifyingGlass} />
            Tìm kiếm
          </button>
        </form>

        <div className="mt-4">
          <p className="small text-muted mb-2">Lọc theo thẻ</p>
          <div className="genres-grid">
            <button
              type="button"
              className={`genre-item ${!activeTag ? 'genre-item-active' : ''}`}
              onClick={() => selectTag('')}
            >
              Tất cả
            </button>
            {tags.map((tag) => (
              <button
                key={tag.id}
                type="button"
                className={`genre-item ${activeTag === tag.slug ? 'genre-item-active' : ''}`}
                onClick={() => selectTag(tag.slug)}
              >
                {tag.name}
              </button>
            ))}
          </div>
        </div>
      </section>

      {loading ? <p className="loading-text">Đang tải...</p> : null}

      {!loading && stories.length === 0 ? (
        <p className="no-data">Không tìm thấy truyện phù hợp.</p>
      ) : null}

      <div className="stories-grid">
        {stories.map((story) => (
          <StoryCard key={story.id} story={story} />
        ))}
      </div>

      {pagination.totalPages > 1 ? (
        <div className="d-flex justify-content-center gap-2 mt-4">
          <button
            type="button"
            className="btn-cmc btn-cmc-outline"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            Trước
          </button>
          <span className="align-self-center text-muted">
            Trang
            {' '}
            {pagination.page}
            /
            {pagination.totalPages}
          </span>
          <button
            type="button"
            className="btn-cmc btn-cmc-outline"
            disabled={page >= pagination.totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Sau
          </button>
        </div>
      ) : null}
    </main>
  );
}

export default FindStoriesPage;
