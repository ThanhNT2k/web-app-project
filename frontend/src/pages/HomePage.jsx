import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';

import FeaturedCarousel from '../components/FeaturedCarousel';
import AutoSlidingStoryRow from '../components/AutoSlidingStoryRow';
import RecommendedStories from '../components/RecommendedStories';
import StoryCard from '../components/StoryCard';
import IconBadge from '../components/IconBadge';
import API from '../services/api';
import { mockStories } from '../data/mockStories';
import { useAuth } from '../contexts/AuthContext';
import {
  faBookOpen,
  faClockRotateLeft,
  faMagnifyingGlass,
  faRotateRight,
  faTriangleExclamation,
} from '../lib/icons';

function StoryCardSkeleton({ compact }) {
  return (
    <div className={`story-card-skeleton animate-pulse ${compact ? 'is-compact' : ''}`}>
      <div className="skeleton-box skeleton-cover" />
      <div className="skeleton-box skeleton-title" />
      <div className="skeleton-box skeleton-line" />
      {!compact && (
        <div className="skeleton-chip-row">
          <div className="skeleton-box skeleton-chip" />
          <div className="skeleton-box skeleton-chip" />
        </div>
      )}
    </div>
  );
}

function RecentStorySkeleton() {
  return (
    <div className="story-card-skeleton story-card-skeleton-horizontal animate-pulse">
      <div className="skeleton-box skeleton-cover-horizontal" />
      <div className="skeleton-horizontal-content">
        <div className="skeleton-box skeleton-title" />
        <div className="skeleton-box skeleton-line short" />
        <div className="skeleton-box skeleton-line" />
      </div>
    </div>
  );
}

function SectionHeading({ eyebrow, title, icon, action }) {
  return (
    <div className="section-heading">
      <div>
        {eyebrow ? <p className="section-eyebrow">{eyebrow}</p> : null}
        <h2 className="section-title">
          {icon ? <IconBadge icon={icon} size="sm" tone="primary" /> : null}
          {title}
        </h2>
      </div>
      {action}
    </div>
  );
}

function HomePage() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [stories, setStories] = useState([]);
  const [featuredStories, setFeaturedStories] = useState([]);
  const [recentStories, setRecentStories] = useState([]);

  const [loading, setLoading] = useState(true);
  const [loadingFeatured, setLoadingFeatured] = useState(true);
  const [loadingRecent, setLoadingRecent] = useState(true);
  const [error, setError] = useState('');
  const [usingFallbackStories, setUsingFallbackStories] = useState(false);
  const [usingFallbackFeatured, setUsingFallbackFeatured] = useState(false);
  const [usingFallbackRecent, setUsingFallbackRecent] = useState(false);

  const [page, setPage] = useState(Number(searchParams.get('page')) || 1);
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });

  const isSearching = useMemo(
    () => Boolean(query.trim() || (category && category !== 'all')),
    [query, category]
  );

  const heroStories = useMemo(() => {
    if (!isSearching && featuredStories.length > 0) return featuredStories;
    if (stories.length > 0) return stories;
    return [];
  }, [featuredStories, isSearching, stories]);
  const loadingHero = !isSearching ? loadingFeatured : loading;

  const hasFallbackData = usingFallbackStories || usingFallbackFeatured || usingFallbackRecent;

  const serviceMessage = useMemo(() => {
    if (!hasFallbackData) return '';
    if (isSearching && usingFallbackStories) {
      return 'Không thể tải dữ liệu mới từ hệ thống. Đang hiển thị dữ liệu dự phòng cho kết quả tìm kiếm.';
    }

    const fallbackSections = [
      usingFallbackFeatured ? 'truyện nổi bật' : null,
      usingFallbackRecent ? 'cập nhật gần đây' : null,
      usingFallbackStories ? (isSearching ? 'kết quả tìm kiếm' : 'danh sách truyện') : null,
    ].filter(Boolean);

    return `Không thể tải dữ liệu mới từ hệ thống. Đang hiển thị dữ liệu dự phòng cho ${fallbackSections.join(', ')}.`;
  }, [hasFallbackData, isSearching, usingFallbackFeatured, usingFallbackRecent, usingFallbackStories]);

  useEffect(() => {
    if (!authLoading && user) {
      const role = user.role?.toLowerCase();
      if (role === 'admin') {
        navigate('/admin', { replace: true });
      } else if (role === 'moderator') {
        navigate('/moderator/dashboard', { replace: true });
      }
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (isSearching) {
      setFeaturedStories([]);
      setUsingFallbackFeatured(false);
      setLoadingFeatured(false);
      return;
    }

    const fetchFeatured = async () => {
      try {
        setLoadingFeatured(true);
        setUsingFallbackFeatured(false);
        const response = await API.stories.getAll(1, 10, 'popular');
        setFeaturedStories(response.stories || []);
      } catch {
        setUsingFallbackFeatured(true);
        setFeaturedStories([...mockStories].sort((a, b) => b.total_chapters - a.total_chapters).slice(0, 10));
      } finally {
        setLoadingFeatured(false);
      }
    };

    fetchFeatured();
  }, [isSearching]);

  useEffect(() => {
    if (isSearching) {
      setRecentStories([]);
      setUsingFallbackRecent(false);
      setLoadingRecent(false);
      return;
    }

    const fetchRecent = async () => {
      try {
        setLoadingRecent(true);
        setUsingFallbackRecent(false);
        const response = await API.stories.getAll(1, 9, 'updated');
        setRecentStories(response.stories || []);
      } catch {
        setUsingFallbackRecent(true);
        setRecentStories([...mockStories].slice(0, 9));
      } finally {
        setLoadingRecent(false);
      }
    };

    fetchRecent();
  }, [isSearching]);

  useEffect(() => {
    const fetchStories = async () => {
      try {
        setLoading(true);
        setError('');
        setUsingFallbackStories(false);

        const cat = category && category !== 'all' ? category : null;
        const response = isSearching
          ? await API.stories.search(query.trim(), cat, null, page, 15)
          : await API.stories.getAll(page, 15, 'newest');

        const list = response.stories || [];
        setStories(list);
        setPagination(response.pagination || { page: 1, totalPages: 1 });
      } catch {
        setUsingFallbackStories(true);
        setError('Không thể kết nối đến máy chủ. Hệ thống đang hoạt động ở chế độ ngoại tuyến.');
        setStories(mockStories);
        setPagination({ page: 1, totalPages: 1 });
      } finally {
        setLoading(false);
      }
    };

    fetchStories();
  }, [isSearching, query, category, page]);

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
    <div className="cmc-home-page-wrapper">
      <FeaturedCarousel stories={heroStories} isLoading={loadingHero} />
      <main className="cmc-main cmc-home-page">
        {hasFallbackData ? (
          <div className="home-service-note">
            <IconBadge icon={faTriangleExclamation} size="md" tone="warning" />
            <div>
              <strong>Đang dùng dữ liệu dự phòng.</strong>
              <span>{serviceMessage || error}</span>
            </div>
          </div>
        ) : null}

        {!isSearching ? <RecommendedStories /> : null}

        {!isSearching && (
          <section className="home-section">
            <SectionHeading
              eyebrow="Được quan tâm"
              title="Truyện nổi bật"
              icon={faBookOpen}
              action={<Link to="/tim-truyen" className="section-action-link">Xem thêm</Link>}
            />
            {loadingFeatured ? (
              <div className="stories-grid stories-grid-featured">
                {Array.from({ length: 6 }).map((_, i) => (
                  <StoryCardSkeleton key={`skeleton-feat-${i}`} compact />
                ))}
              </div>
            ) : featuredStories.length > 0 ? (
              <AutoSlidingStoryRow className="stories-grid stories-grid-featured" label="Truyện nổi bật" autoSlide={false}>
                {featuredStories.slice(0, 10).map((story) => (
                  <StoryCard key={`feat-${story.id}`} story={story} compact />
                ))}
              </AutoSlidingStoryRow>
            ) : (
              <div className="empty-state-card">
                <IconBadge icon={faBookOpen} size="lg" tone="primary" />
                <div>
                  <h3>Chưa có truyện nổi bật</h3>
                  <p>Danh sách sẽ được cập nhật khi có thêm dữ liệu đọc và theo dõi.</p>
                </div>
              </div>
            )}
          </section>
        )}

        {!isSearching && (
          <section className="home-section">
            <SectionHeading eyebrow="Vừa lên chương" title="Cập nhật gần đây" icon={faClockRotateLeft} />
            {loadingRecent ? (
              <div className="stories-grid-horizontal">
                {Array.from({ length: 3 }).map((_, i) => (
                  <RecentStorySkeleton key={`skeleton-recent-${i}`} />
                ))}
              </div>
            ) : recentStories.length > 0 ? (
              <AutoSlidingStoryRow className="stories-grid-horizontal" label="Truyện cập nhật gần đây" variant="horizontal" autoSlide={false}>
                {recentStories.map((story) => (
                  <StoryCard key={`recent-${story.id}`} story={story} horizontal={true} />
                ))}
              </AutoSlidingStoryRow>
            ) : (
              <div className="empty-state-card compact">
                <IconBadge icon={faRotateRight} size="lg" tone="aqua" />
                <div>
                  <h3>Chưa có cập nhật mới</h3>
                  <p>Quay lại sau để xem các chương vừa được đăng.</p>
                </div>
              </div>
            )}
          </section>
        )}

        <section id="browse" className="home-section">
          <SectionHeading
            eyebrow={isSearching ? 'Đang lọc' : 'Thư viện'}
            title={isSearching ? 'Kết quả tìm kiếm' : 'Tất cả truyện'}
            icon={isSearching ? faMagnifyingGlass : faBookOpen}
          />
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
            <div className="empty-state-card">
              <IconBadge icon={faMagnifyingGlass} size="lg" tone="primary" />
              <div>
                <h3>Không tìm thấy truyện phù hợp</h3>
                <p>Thử đổi từ khóa hoặc chọn một thể loại khác để khám phá thêm.</p>
              </div>
            </div>
          )}

          {!loading && pagination.totalPages > 1 ? (
            <div className="home-pagination">
              <button
                type="button"
                className="btn-cmc btn-cmc-outline"
                disabled={page <= 1}
                onClick={() => goToPage(page - 1)}
              >
                Trước
              </button>
              <span>
                Trang {pagination.page}/{pagination.totalPages}
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
    </div>
  );
}

export default HomePage;
