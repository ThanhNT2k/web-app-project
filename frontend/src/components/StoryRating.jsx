import { useEffect, useState } from 'react';

import { useAuth } from '../contexts/AuthContext';
import API from '../services/api';

const STAR_VALUES = [1, 2, 3, 4, 5];

function StoryRating({
  storyId,
  initialAverageRating = 0,
  initialRatingCount = 0,
  className = '',
  onRatingChange,
}) {
  const { isAuthenticated } = useAuth();
  const [averageRating, setAverageRating] = useState(Number(initialAverageRating) || 0);
  const [ratingCount, setRatingCount] = useState(Number(initialRatingCount) || 0);
  const [distribution, setDistribution] = useState(STAR_VALUES.map((rating) => ({ rating, count: 0 })));
  const [userRating, setUserRating] = useState(null);
  const [hoverRating, setHoverRating] = useState(0);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const applyRatingPayload = (payload = {}) => {
    setAverageRating(Number(payload.average_rating) || 0);
    setRatingCount(Number(payload.rating_count) || 0);
    setUserRating(payload.user_rating || null);
    if (Array.isArray(payload.distribution) && payload.distribution.length === 5) {
      setDistribution(payload.distribution.map((item) => ({
        rating: Number(item.rating) || 0,
        count: Number(item.count) || 0,
      })));
    }
  };

  useEffect(() => {
    let isActive = true;

    const loadRating = async () => {
      if (!storyId) return;

      try {
        setLoading(true);
        setError('');
        const response = await API.stories.getRating(storyId);
        if (!isActive) return;

        const nextRating = response.rating || {};
        applyRatingPayload(nextRating);
      } catch {
        if (!isActive) return;
        setError('Không tải được đánh giá truyện.');
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    };

    loadRating();

    return () => {
      isActive = false;
    };
  }, [storyId]);

  const handleRate = async (value) => {
    if (!isAuthenticated) {
      setError('Vui lòng đăng nhập để đánh giá truyện.');
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      const response = await API.stories.rate(storyId, value);
      const nextRating = response.rating || {};
      applyRatingPayload(nextRating);
      if (onRatingChange) {
        onRatingChange(nextRating);
      }
    } catch (err) {
      setError(err?.response?.data?.message || 'Không gửi được đánh giá.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!isAuthenticated || !userRating) return;

    try {
      setSubmitting(true);
      setError('');
      const response = await API.stories.deleteRating(storyId);
      const nextRating = response.rating || {};
      applyRatingPayload(nextRating);
      if (onRatingChange) {
        onRatingChange(nextRating);
      }
    } catch (err) {
      setError(err?.response?.data?.message || 'Không xóa được đánh giá.');
    } finally {
      setSubmitting(false);
    }
  };

  const displayRating = hoverRating || userRating || 0;
  const hasRating = ratingCount > 0;
  const maxDistributionCount = distribution.reduce((max, item) => Math.max(max, item.count), 0);

  return (
    <section className={`story-rating-panel ${className}`.trim()}>
      <div className="story-rating-header">
        <div>
          <p className="story-rating-label">Đánh giá truyện</p>
          <div className="story-rating-summary">
            <strong>{hasRating ? averageRating.toFixed(1) : '0.0'}</strong>
            <span>/5</span>
            <span className="story-rating-count">{ratingCount} lượt đánh giá</span>
          </div>
        </div>
        {loading ? <span className="story-rating-state">Đang tải...</span> : null}
      </div>

      <div className="story-rating-stars" role="radiogroup" aria-label="Chọn số sao đánh giá">
        {STAR_VALUES.map((value) => {
          const filled = value <= displayRating;
          return (
            <button
              key={value}
              type="button"
              className={`story-rating-star ${filled ? 'is-filled' : ''}`}
              onMouseEnter={() => setHoverRating(value)}
              onMouseLeave={() => setHoverRating(0)}
              onFocus={() => setHoverRating(value)}
              onBlur={() => setHoverRating(0)}
              onClick={() => handleRate(value)}
              disabled={submitting}
              aria-label={`${value} sao`}
              aria-checked={userRating === value}
              role="radio"
            >
              ★
            </button>
          );
        })}
      </div>

      <div className="story-rating-distribution" aria-label="Phân bố đánh giá theo sao">
        {distribution.slice().reverse().map((item) => {
          const percent = maxDistributionCount > 0 ? (item.count / maxDistributionCount) * 100 : 0;
          return (
            <div key={item.rating} className="story-rating-distribution-row">
              <span className="story-rating-distribution-label">{item.rating}★</span>
              <div className="story-rating-distribution-bar">
                <span className="story-rating-distribution-fill" style={{ width: `${percent}%` }} />
              </div>
              <span className="story-rating-distribution-count">{item.count}</span>
            </div>
          );
        })}
      </div>

      <div className="story-rating-footer">
        <span>
          {userRating ? `Bạn đã đánh giá ${userRating}/5` : isAuthenticated ? 'Chạm vào số sao để đánh giá' : 'Đăng nhập để đánh giá'}
        </span>
        <div className="d-flex gap-2 align-items-center">
          {userRating ? (
            <button
              type="button"
              className="btn-link-danger btn-sm"
              onClick={handleDelete}
              disabled={submitting}
            >
              Xóa đánh giá
            </button>
          ) : null}
          {submitting ? <span className="story-rating-state">Đang lưu...</span> : null}
        </div>
      </div>

      {error ? <p className="story-rating-error">{error}</p> : null}
    </section>
  );
}

export default StoryRating;
