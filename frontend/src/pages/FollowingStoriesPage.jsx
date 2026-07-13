import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import AccountSectionNav from '../components/AccountSectionNav';
import StoryCard from '../components/StoryCard';
import API from '../services/api';

function FollowingStoriesPage() {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    API.follows.getAll()
      .then((response) => {
        if (active) setStories(response.stories || []);
      })
      .catch(() => {
        if (active) setError('Không thể tải danh sách truyện đang theo dõi.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => { active = false; };
  }, []);

  return (
    <main className="cmc-main account-area">
      <header className="account-page-heading">
        <div>
          <span className="account-page-heading__eyebrow">Tủ sách &amp; Hồ sơ</span>
          <h1>Truyện đang theo dõi</h1>
          <p>Theo dõi các truyện yêu thích và quay lại đọc bất cứ lúc nào.</p>
        </div>
        {!loading && stories.length > 0 ? (
          <span className="account-page-heading__count">{stories.length} truyện</span>
        ) : null}
      </header>

      <AccountSectionNav />

      <section className="panel-card account-content-panel">
        {loading ? <div className="account-state">Đang tải tủ sách...</div> : null}
        {error ? <div className="alert alert-danger mb-0">{error}</div> : null}
        {!loading && !error && stories.length === 0 ? (
          <div className="account-empty-state">
            <h3>Tủ sách của bạn đang trống</h3>
            <p>Nhấn “Theo dõi” tại trang chi tiết truyện để lưu truyện vào đây.</p>
            <Link to="/browse" className="btn-cmc btn-cmc-primary">Khám phá truyện</Link>
          </div>
        ) : null}
        {!loading && !error && stories.length > 0 ? (
          <div className="stories-grid account-following-grid">
            {stories.map((story) => <StoryCard key={story.id} story={story} compact />)}
          </div>
        ) : null}
      </section>
    </main>
  );
}

export default FollowingStoriesPage;
