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

function StoryCardSkeleton({ compact }) {
  return (
    <div
      className="story-card-skeleton animate-pulse"
      style={{
        background: 'var(--surface)',
        borderRadius: '16px',
        overflow: 'hidden',
        padding: '12px',
        border: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        minHeight: compact ? '200px' : '280px',
      }}
    >
      <div
        className="skeleton-box"
        style={{ width: '100%', height: compact ? '120px' : '180px', borderRadius: '12px' }}
      />
      <div className="skeleton-box" style={{ height: '20px', borderRadius: '4px', width: '80%' }} />
      <div className="skeleton-box" style={{ height: '14px', borderRadius: '4px', width: '50%' }} />
      {!compact && (
        <div style={{ display: 'flex', gap: '8px', marginTop: 'auto' }}>
          <div className="skeleton-box" style={{ height: '24px', borderRadius: '12px', width: '60px' }} />
          <div className="skeleton-box" style={{ height: '24px', borderRadius: '12px', width: '60px' }} />
        </div>
      )}
    </div>
  );
}

function HomePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [stories, setStories] = useState([]);
  const [featuredStories, setFeaturedStories] = useState([]);
  const [recentStories, setRecentStories] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [loadingFeatured, setLoadingFeatured] = useState(true);
  const [loadingRecent, setLoadingRecent] = useState(true);
  const [error, setError] = useState('');
  
  const [page, setPage] = useState(Number(searchParams.get('page')) || 1);
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });

  const isSearching = useMemo(() => Boolean(query.trim() || (category && category !== 'all')), [query, category]);

  // Fetch Featured Stories (Popular - most followed)
  useEffect(() => {
    if (isSearching) return;
    const fetchFeatured = async () => {
      try {
        setLoadingFeatured(true);
        const response = await API.stories.getAll(1, 6, 'popular');
        setFeaturedStories(response.stories || []);
      } catch {
        // Fallback sorted by chapters as a popularity proxy
        setFeaturedStories([...mockStories].sort((a, b) => b.total_chapters - a.total_chapters).slice(0, 6));
      } finally {
        setLoadingFeatured(false);
      }
    };
    fetchFeatured();
  }, [isSearching]);

  // Fetch Recent Updates (sortBy = updated)
  useEffect(() => {
    if (isSearching) return;
    const fetchRecent = async () => {
      try {
        setLoadingRecent(true);
        const response = await API.stories.getAll(1, 3, 'updated');
        setRecentStories(response.stories || []);
      } catch {
        setRecentStories([...mockStories].slice(0, 3));
      } finally {
        setLoadingRecent(false);
      }
    };
    fetchRecent();
  }, [isSearching]);

  // Fetch Browse / Search Stories
  useEffect(() => {
    const fetchStories = async () => {
      try {
        setLoading(true);
        setError('');
        const cat = category && category !== 'all' ? category : null;
        const response = isSearching
          ? await API.stories.search(query.trim(), cat, page)
          : await API.stories.getAll(page, 12, 'newest');

        const list = response.stories || [];
        setStories(list);
        setPagination(response.pagination || { page: 1, totalPages: 1 });
      } catch {
        setError('Không thể kết nối đến máy chủ. Hệ thống đang hoạt động ở chế độ ngoại tuyến.');
        setStories(mockStories);
        setPagination({ page: 1, totalPages: 1 });
      } finally {
        setLoading(false);
      }
    };

    fetchStories();
  }, [isSearching, query, category, page]);

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

      {!isSearching && <RecommendedStories />}

      {/* Featured Stories */}
      {!isSearching && (
        <section className="mb-5">
          <h2 className="section-title">📖 Truyện Nổi Bật</h2>
          {loadingFeatured ? (
            <div className="stories-grid">
              {Array.from({ length: 6 }).map((_, i) => (
                <StoryCardSkeleton key={`skeleton-feat-${i}`} compact />
              ))}
            </div>
          ) : featuredStories.length > 0 ? (
            <div className="stories-grid">
              {featuredStories.map((story) => (
                <StoryCard key={`feat-${story.id}`} story={story} compact />
              ))}
            </div>
          ) : (
            <p className="no-data">Hiện tại chưa có truyện nổi bật nào.</p>
          )}
        </section>
      )}

      {/* Recent Updates */}
      {!isSearching && (
        <section className="mb-5">
          <h2 className="section-title">⚡ Cập Nhật Gần Đây</h2>
          {loadingRecent ? (
            <div className="stories-grid-horizontal" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={`skeleton-recent-${i}`} className="story-card-skeleton animate-pulse d-flex gap-3 p-3 rounded-4" style={{ background: 'var(--surface)', border: '1px solid var(--border)', minHeight: '150px' }}>
                  <div className="skeleton-box flex-shrink-0" style={{ width: '90px', height: '120px', borderRadius: '8px' }} />
                  <div className="d-flex flex-column flex-grow-1 gap-2">
                    <div className="skeleton-box" style={{ height: '20px', width: '80%', borderRadius: '4px' }} />
                    <div className="skeleton-box" style={{ height: '14px', width: '50%', borderRadius: '4px' }} />
                    <div className="skeleton-box mt-auto" style={{ height: '14px', width: '90%', borderRadius: '4px' }} />
                  </div>
                </div>
              ))}
            </div>
          ) : recentStories.length > 0 ? (
            <div className="stories-grid-horizontal" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
              {recentStories.map((story) => (
                <StoryCard key={`recent-${story.id}`} story={story} horizontal={true} />
              ))}
            </div>
          ) : (
            <p className="no-data">Không có cập nhật mới.</p>
          )}
        </section>
      )}

      {/* Main browse list / Search list */}
      <section id="browse" className="mb-4">
        <h2 className="section-title">
          {isSearching ? '🔍 Kết quả tìm kiếm' : '📚 Tất cả truyện'}
        </h2>
        
        {loading ? (
          <div className="stories-grid">
            {Array.from({ length: 8 }).map((_, i) => (
              <StoryCardSkeleton key={`skeleton-all-${i}`} />
            ))}
          </div>
        ) : stories.length > 0 ? (
          <div className="stories-grid">
            {stories.map((story) => (
              <StoryCard key={`all-${story.id}`} story={story} />
            ))}
          </div>
        ) : (
          <p className="no-data">Không tìm thấy truyện phù hợp.</p>
        )}

        {!loading && pagination.totalPages > 1 ? (
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
              Trang {pagination.page} / {pagination.totalPages}
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
