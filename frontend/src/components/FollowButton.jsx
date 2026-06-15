import { useEffect, useState } from 'react';

import API from '../services/api';
import { useAuth } from '../contexts/AuthContext';

function FollowButton({ storyId }) {
  const { isAuthenticated } = useAuth();
  const [following, setFollowing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    // Only check follow status when the user is logged in.
    // When they log out, reset to "not following" immediately.
    if (!isAuthenticated) {
      setFollowing(false);
      setChecked(false);
      return;
    }

    let cancelled = false;
    const check = async () => {
      try {
        const res = await API.follows.check(storyId);
        if (!cancelled) {
          setFollowing(Boolean(res.following));
          setChecked(true);
        }
      } catch {
        if (!cancelled) setFollowing(false);
      }
    };
    check();

    return () => { cancelled = true; };
  }, [storyId, isAuthenticated]);

  const toggle = async () => {
    if (!isAuthenticated) {
      alert('Vui lòng đăng nhập để theo dõi truyện.');
      return;
    }
    try {
      setLoading(true);
      if (following) {
        await API.follows.unfollow(storyId);
        setFollowing(false);
      } else {
        await API.follows.follow(storyId);
        setFollowing(true);
      }
    } catch (err) {
      const msg = err?.response?.data?.message || 'Không thực hiện được. Thử lại sau.';
      alert(msg);
    } finally {
      setLoading(false);
    }
  };

  // Don't render while checking follow status for the first time (avoids flicker)
  if (isAuthenticated && !checked) {
    return (
      <button type="button" className="btn-cmc btn-cmc-outline" disabled>
        ...
      </button>
    );
  }

  return (
    <button
      type="button"
      className={`btn-cmc ${following ? 'btn-cmc-outline' : 'btn-cmc-primary'}`}
      onClick={toggle}
      disabled={loading}
    >
      {/* eslint-disable-next-line no-nested-ternary */}
      {loading ? '...' : following ? '✓ Đang theo dõi' : '+ Theo dõi'}
    </button>
  );
}

export default FollowButton;
