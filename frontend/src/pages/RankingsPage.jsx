import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

import IconBadge from '../components/IconBadge';
import API from '../services/api';
import {
  FontAwesomeIcon,
  faBookOpen,
  faEye,
  faFeatherPointed,
  faRankingStar,
  faStar,
  faUsers,
} from '../lib/icons';

const RANKING_TYPES = [
  { key: 'trending', label: 'Xu hướng' },
  { key: 'views', label: 'Lượt đọc' },
  { key: 'rating', label: 'Đánh giá' },
  { key: 'follows', label: 'Theo dõi' },
];

const PERIODS = [
  { key: 'week', label: 'Tuần' },
  { key: 'month', label: 'Tháng' },
  { key: 'all', label: 'Mọi thời đại' },
];

const FALLBACK_COVER =
  'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=600&q=80';

function getBadgeLabel(rank) {
  if (rank === 1) return 'TOP 1';
  if (rank === 2) return 'TOP 2';
  if (rank === 3) return 'TOP 3';
  return null;
}

function RankingsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatedAt, setUpdatedAt] = useState('');

  const type = useMemo(() => {
    const value = searchParams.get('type') || 'trending';
    return RANKING_TYPES.some((item) => item.key === value) ? value : 'trending';
  }, [searchParams]);

  const period = useMemo(() => {
    const value = searchParams.get('period') || 'week';
    return PERIODS.some((item) => item.key === value) ? value : 'week';
  }, [searchParams]);

  useEffect(() => {
    const fetchRankings = async () => {
      try {
        setLoading(true);
        setError('');

        const response = await API.rankings.get(type, period, 20);
        setStories(response.stories || []);
        setUpdatedAt(response.updated_at || '');
      } catch {
        setStories([]);
        setError('Không tải được bảng xếp hạng. Vui lòng thử lại.');
      } finally {
        setLoading(false);
      }
    };

    fetchRankings();
  }, [type, period]);

  const applyFilter = (nextType, nextPeriod) => {
    const params = new URLSearchParams(searchParams);
    params.set('type', nextType);
    params.set('period', nextPeriod);
    setSearchParams(params);
  };

  const formatDateTime = (value) => {
    if (!value) return '--';
    try {
      return new Date(value).toLocaleString('vi-VN');
    } catch {
      return '--';
    }
  };

  const formatWholeNumber = (value) => Number(value || 0).toLocaleString('vi-VN');

  return (
    <main className="cmc-main rankings-page">
      <section className="rankings-hero">
        <h1>
          <IconBadge icon={faRankingStar} size="md" tone="warning" />
          Bảng Xếp Hạng Truyện
        </h1>
        <p>Theo dõi các bộ truyện đang bứt phá theo xu hướng, lượt đọc, đánh giá và lượt theo dõi.</p>
      </section>

      <section className="panel-card rankings-controls">
        <div className="rankings-filter-group">
          {RANKING_TYPES.map((item) => (
            <button
              key={item.key}
              type="button"
              className={`rankings-filter-btn ${type === item.key ? 'active' : ''}`}
              onClick={() => applyFilter(item.key, period)}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="rankings-filter-group">
          {PERIODS.map((item) => (
            <button
              key={item.key}
              type="button"
              className={`rankings-filter-btn period ${period === item.key ? 'active' : ''}`}
              onClick={() => applyFilter(type, item.key)}
            >
              {item.label}
            </button>
          ))}
        </div>

        <p className="rankings-updated-at">Cập nhật lần cuối: {formatDateTime(updatedAt)}</p>
      </section>

      {loading ? <p className="loading-text">Đang tải bảng xếp hạng...</p> : null}
      {error ? <p className="no-data">{error}</p> : null}

      {!loading && !error ? (
        <section className="rankings-list">
          {stories.map((story) => {
            const badgeLabel = getBadgeLabel(story.rank);

            return (
              <article key={story.id} className={`ranking-item ${story.badge || ''}`}>
                <div className="ranking-position">
                  <span className="ranking-number">#{story.rank}</span>
                  {badgeLabel ? <span className="ranking-badge">{badgeLabel}</span> : null}
                </div>

                <Link to={`/story/${story.id}-${story.slug}`} className="ranking-cover">
                  <img
                    src={story.cover_image_url || FALLBACK_COVER}
                    alt={story.title}
                    onError={(event) => {
                      event.currentTarget.src = FALLBACK_COVER;
                    }}
                  />
                </Link>

                <div className="ranking-content">
                  <Link to={`/story/${story.id}-${story.slug}`} className="ranking-title">
                    {story.title}
                  </Link>

                  <p className="ranking-meta">
                    <FontAwesomeIcon icon={faFeatherPointed} /> {story.author_name || 'Không rõ tác giả'}
                  </p>

                  <div className="ranking-metrics">
                    <span><FontAwesomeIcon icon={faBookOpen} /> {formatWholeNumber(story.total_chapters)} chương</span>
                    <span><FontAwesomeIcon icon={faEye} /> {formatWholeNumber(story.views_metric)} lượt đọc</span>
                    <span><FontAwesomeIcon icon={faStar} /> {Number(story.rating_avg_metric || story.average_rating || 0).toFixed(1)}</span>
                    <span><FontAwesomeIcon icon={faUsers} /> {formatWholeNumber(story.total_followers)} theo dõi</span>
                  </div>
                </div>
              </article>
            );
          })}

          {stories.length === 0 ? <p className="no-data">Chưa có dữ liệu xếp hạng.</p> : null}
        </section>
      ) : null}
    </main>
  );
}

export default RankingsPage;
