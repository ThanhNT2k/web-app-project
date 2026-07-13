import { useCallback, useEffect, useState } from 'react';

import StoryCard from './StoryCard';
import AutoSlidingStoryRow from './AutoSlidingStoryRow';
import IconBadge from './IconBadge';
import API from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { FontAwesomeIcon, faRobot, faRotateRight, faWandMagicSparkles } from '../lib/icons';

function RecommendedStories() {
  const { isAuthenticated } = useAuth();
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchRecommendations = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const response = await API.ai.getRecommendations();
      setStories(response.stories || []);
    } catch {
      setError('Chưa thể tải gợi ý cá nhân hóa lúc này.');
      setStories([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      setStories([]);
      return;
    }

    fetchRecommendations();
  }, [fetchRecommendations, isAuthenticated]);

  if (!isAuthenticated) {
    return null;
  }

  if (!loading && stories.length === 0 && !error) {
    return null;
  }

  return (
    <section className="home-section recommended-section">
      <div className="section-heading">
        <div>
          <p className="section-eyebrow">Cá nhân hóa</p>
          <h2 className="section-title">
            <IconBadge icon={faWandMagicSparkles} size="sm" tone="aqua" />
            Gợi ý cho bạn
          </h2>
        </div>
        <span className="ai-pill">
          <FontAwesomeIcon icon={faRobot} />
          AI
        </span>
      </div>

      {error ? (
        <div className="empty-state-card">
          <IconBadge icon={faWandMagicSparkles} size="lg" tone="aqua" />
          <div>
            <h3>Gợi ý đang tạm nghỉ</h3>
            <p>{error} Bạn vẫn có thể khám phá danh sách truyện nổi bật bên dưới.</p>
          </div>
          <button type="button" className="btn-cmc btn-cmc-outline" onClick={fetchRecommendations}>
            <FontAwesomeIcon icon={faRotateRight} />
            Thử lại
          </button>
        </div>
      ) : null}

      {loading ? <div className="recommended-loading">Đang chọn vài bộ hợp gu đọc của bạn...</div> : null}

      <AutoSlidingStoryRow className="stories-grid stories-grid-recommended" label="Gợi ý truyện cho bạn" variant="recommended">
        {stories.map((story) => (
          <StoryCard story={story} key={story.id} />
        ))}
      </AutoSlidingStoryRow>
    </section>
  );
}

export default RecommendedStories;
