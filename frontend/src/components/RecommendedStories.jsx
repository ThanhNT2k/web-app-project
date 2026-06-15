import { useEffect, useState } from 'react';

import StoryCard from './StoryCard';
import API from '../services/api';
import { useAuth } from '../contexts/AuthContext';

function RecommendedStories() {
  const { isAuthenticated } = useAuth();
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      setStories([]);
      return;
    }

    const fetchRecommendations = async () => {
      try {
        setLoading(true);
        setError('');
        const response = await API.ai.getRecommendations();
        setStories(response.stories || []);
      } catch {
        setError('Không thể tải gợi ý truyện.');
        setStories([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return null;
  }

  if (!loading && stories.length === 0 && !error) {
    return null;
  }

  return (
    <section className="mb-5">
      <div className="d-flex align-items-center justify-content-between mb-3">
        <h3 className="h4 mb-0">Gợi ý cho bạn</h3>
        <span className="badge text-bg-info">AI</span>
      </div>
      {error ? <div className="alert alert-warning">{error}</div> : null}
      {loading ? <div className="text-muted">Đang tải gợi ý...</div> : null}
      <div className="row g-4">
        {stories.map((story) => (
          <div className="col-12 col-md-6 col-xl-4" key={story.id}>
            <StoryCard story={story} />
          </div>
        ))}
      </div>
    </section>
  );
}

export default RecommendedStories;
