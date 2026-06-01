import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

import RecommendedStories from '../components/RecommendedStories';
import StoryCard from '../components/StoryCard';
import API from '../services/api';
import { mockStories } from '../data/mockStories';

const GENRES = [
  { slug: 'Tien Hiep', label: 'Tiên Hiệp' },
  { slug: 'Kiem Hiep', label: 'Kiếm Hiệp' },
  { slug: 'Do Thi', label: 'Đô Thị' },
  { slug: 'Huyen Huyen', label: 'Huyền Huyễn' },
  { slug: 'Ngon Tinh', label: 'Ngôn Tình' },
  { slug: 'Lich Su', label: 'Lịch Sử' },
];

function HomePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(Number(searchParams.get('page')) || 1);
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });

  const isSearching = useMemo(() => Boolean(query.trim() || (category && category !== 'all')), [query, category]);

  useEffect(() => {
    const fetchStories = async () => {
      try {
        setLoading(true);
        setError('');
        const cat = category && category !== 'all' ? category : null;
        const response = isSearching
          ? await API.stories.search(query.trim(), cat, page)
          : await API.stories.getAll(page, 12);

        const list = response.stories || [];
        setStories(list);
        setPagination(response.pagination || { page: 1, totalPages: 1 });
        if (list.length === 0 && !isSearching) {
          setError('API đã kết nối nhưng chưa có truyện. Chạy: cd backend && npm run db:init && npm run db:seed');
        }
      } catch {
        setError(
          'Không kết nối được API backend. Hãy chạy backend và seed dữ liệu. Đang hiển thị dữ liệu mẫu.'
        );
        setStories(mockStories);
        setPagination({ page: 1, totalPages: 1 });
      } finally {
        setLoading(false);
      }
    };

    fetchStories();
  }, [isSearching, query, category, page]);

  const featuredStories = useMemo(() => stories.slice(0, 6), [stories]);
  const recentStories = useMemo(() => stories.slice(0, 3), [stories]);

  const handleGenreClick = (slug) => {
    setCategory(slug);
    setPage(1);
    setSearchParams({ category: slug, page: '1' });
    document.getElementById('browse')?.scrollIntoView({ behavior: 'smooth' });
  };

  const goToPage = (nextPage) => {
    setPage(nextPage);
    setSearchParams((params) => {
      params.set('page', String(nextPage));
      if (query.trim()) params.set('q', query.trim());
      if (category) params.set('category', category);
      return params;
    });
  };

  return (
    <main className="cmc-main">
      <section className="cmc-hero">
        <h1>Chào mừng đến CMC Truyện</h1>
        <p>Thư viện truyện online — Đọc truyện yêu thích mọi lúc, mọi nơi</p>
        <div className="cmc-hero-actions">
          <Link to="/tim-truyen" className="btn-cmc btn-cmc-secondary">
            Bắt đầu đọc
          </Link>
          <Link to="/tim-truyen" className="btn-cmc btn-cmc-ghost">
            Khám phá thêm
          </Link>
        </div>
      </section>

      {error ? <div className="alert-cmc alert-cmc-warning">{error}</div> : null}

      <RecommendedStories />

      <section className="mb-5">
        <h2 className="section-title">📖 Truyện Nổi Bật</h2>
        {loading ? (
          <p className="loading-text">Đang tải truyện...</p>
        ) : featuredStories.length > 0 ? (
          <div className="stories-grid">
            {featuredStories.map((story) => (
              <StoryCard key={story.id} story={story} compact />
            ))}
          </div>
        ) : (
          <p className="no-data">Hiện tại chưa có truyện nào được đăng tải.</p>
        )}
      </section>

      <section className="mb-5">
        <h2 className="section-title">🏷️ Thể Loại Phổ Biến</h2>
        <div className="genres-grid">
          {GENRES.map((genre) => (
            <button
              key={genre.slug}
              type="button"
              className="genre-item"
              onClick={() => handleGenreClick(genre.slug)}
            >
              {genre.label}
            </button>
          ))}
        </div>
      </section>

      <section className="mb-5">
        <h2 className="section-title">⚡ Cập Nhật Gần Đây</h2>
        {loading ? (
          <p className="loading-text">Đang tải truyện...</p>
        ) : recentStories.length > 0 ? (
          <div className="stories-grid">
            {recentStories.map((story) => (
              <StoryCard key={`recent-${story.id}`} story={story} compact />
            ))}
          </div>
        ) : (
          <p className="no-data">Không có cập nhật mới.</p>
        )}
      </section>

      <section id="browse" className="mb-4">
        <h2 className="section-title">
          {isSearching ? '🔍 Kết quả tìm kiếm' : '📚 Tất cả truyện'}
        </h2>
        {!loading && stories.length > 0 ? (
          <div className="stories-grid">
            {stories.map((story) => (
              <StoryCard key={`all-${story.id}`} story={story} />
            ))}
          </div>
        ) : null}
        {!loading && stories.length === 0 ? (
          <p className="no-data">Không tìm thấy truyện phù hợp.</p>
        ) : null}

        {pagination.totalPages > 1 ? (
          <div className="d-flex justify-content-center gap-2 mt-4 flex-wrap">
            <button
              type="button"
              className="btn-cmc btn-cmc-outline"
              disabled={page <= 1}
              onClick={() => goToPage(page - 1)}
            >
              Trước
            </button>
            <span className="align-self-center" style={{ color: 'var(--text-muted)' }}>
              Trang
              {' '}
              {pagination.page}
              {' '}
              /
              {' '}
              {pagination.totalPages}
            </span>
            <button
              type="button"
              className="btn-cmc btn-cmc-outline"
              disabled={page >= pagination.totalPages}
              onClick={() => goToPage(page + 1)}
            >
              Sau
            </button>
          </div>
        ) : null}
      </section>
    </main>
  );
}

export default HomePage;
