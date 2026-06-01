import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import ReadingPreferencesPanel from '../components/ReadingPreferencesPanel';
import StoryCard from '../components/StoryCard';
import UserProfile from '../components/UserProfile';
import { useAuth } from '../contexts/AuthContext';
import API from '../services/api';

function UserProfilePage() {
  const { user } = useAuth();
  const [history, setHistory] = useState([]);
  const [follows, setFollows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [historyRes, followsRes] = await Promise.all([
          API.readingHistory.getAll(),
          API.follows.getAll(),
        ]);
        setHistory(historyRes.history || []);
        setFollows(followsRes.stories || []);
      } catch {
        setHistory([]);
        setFollows([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <main className="cmc-main">
      <UserProfile user={user} />

      <div className="row g-4 mt-2">
        <div className="col-lg-7">
          <section className="panel-card">
            <h5 className="panel-title">Lịch sử đọc</h5>
            {loading ? <p className="text-muted small">Đang tải...</p> : null}
            {!loading && history.length === 0 ? (
              <p className="text-muted mb-0">Bạn chưa đọc truyện nào.</p>
            ) : null}
            <ul className="history-list">
              {history.map((item) => (
                <li key={item.id} className="history-item">
                  <div>
                    <Link to={`/story/${item.story_id}`} className="fw-semibold">
                      {item.title}
                    </Link>
                    <div className="small text-muted">
                      {item.last_chapter_title
                        ? `Chương ${item.last_chapter_number}: ${item.last_chapter_title}`
                        : 'Đang đọc'}
                      {' · '}
                      {Math.round(item.completion_rate || 0)}%
                    </div>
                  </div>
                  {item.last_chapter_read ? (
                    <Link
                      className="btn-cmc btn-cmc-primary btn-sm"
                      to={`/story/${item.story_id}/chapter/${item.last_chapter_read}`}
                    >
                      Tiếp tục
                    </Link>
                  ) : null}
                </li>
              ))}
            </ul>
          </section>

          <section className="panel-card mt-4">
            <h5 className="panel-title">Truyện đang theo dõi</h5>
            {!loading && follows.length === 0 ? (
              <p className="text-muted mb-0">Chưa theo dõi truyện nào.</p>
            ) : null}
            <div className="stories-grid mt-3">
              {follows.map((story) => (
                <StoryCard key={story.id} story={story} compact />
              ))}
            </div>
          </section>
        </div>

        <div className="col-lg-5">
          <ReadingPreferencesPanel />
        </div>
      </div>
    </main>
  );
}

export default UserProfilePage;
