import { useCallback, useEffect, useState } from 'react';

import StoryCard from './StoryCard';
import AutoSlidingStoryRow from './AutoSlidingStoryRow';
import IconBadge from './IconBadge';
import API from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { FontAwesomeIcon, faRotateRight, faHeart } from '../lib/icons';

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
    } catch (err) {
      console.error('[RecommendedStories] Error fetching:', err);
      setError('Không thể tải gợi ý lúc này.');
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
          <p className="section-eyebrow">Dành cho bạn</p>
          <h2 className="section-title">
            <IconBadge icon={faHeart} size="sm" tone="pink" />
            Gợi ý truyện yêu thích
          </h2>
        </div>
      </div>

      {error ? (
        <div className="empty-state-card">
          <IconBadge icon={faHeart} size="lg" tone="pink" />
          <div>
            <h3>Gợi ý đang tạm không khả dụng</h3>
            <p>Chúng tôi không thể tải danh sách gợi ý lúc này. Vui lòng thử lại sau.</p>
          </div>
          <button type="button" className="btn-cmc btn-cmc-outline" onClick={fetchRecommendations}>
            <FontAwesomeIcon icon={faRotateRight} />
            Thử lại
          </button>
        </div>
      ) : null}

      {loading ? <div className="recommended-loading">Đang chuẩn bị danh sách gợi ý cho bạn...</div> : null}

      <AutoSlidingStoryRow className="stories-grid stories-grid-recommended" label="Gợi ý truyện cho bạn" variant="recommended">
        {stories.map((story) => (
          <StoryCard story={story} key={story.id} />
        ))}
      </AutoSlidingStoryRow>
    </section>
  );
}

export default RecommendedStories;
