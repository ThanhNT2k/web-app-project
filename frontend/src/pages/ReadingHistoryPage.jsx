import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import AccountSectionNav from '../components/AccountSectionNav';
import StoryCard from '../components/StoryCard';
import { FontAwesomeIcon, faBookOpen } from '../lib/icons';
import API from '../services/api';

function ReadingHistoryPage() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    API.readingHistory.getAll()
      .then((response) => {
        if (active) setHistory(response.history || []);
      })
      .catch(() => {
        if (active) setError('Không thể tải lịch sử đọc.');
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
          <h1>Lịch sử đọc</h1>
          <p>Tiếp tục từ chương gần nhất và theo dõi tiến độ của từng truyện.</p>
        </div>
        {!loading && history.length > 0 ? (
          <span className="account-page-heading__count">{history.length} truyện</span>
        ) : null}
      </header>

      <AccountSectionNav />

      <section className="panel-card account-content-panel">
        {loading ? <div className="account-state">Đang tải lịch sử đọc...</div> : null}
        {error ? <div className="alert alert-danger mb-0">{error}</div> : null}
        {!loading && !error && history.length === 0 ? (
          <div className="account-empty-state">
            <h3>Chưa có lịch sử đọc</h3>
            <p>Truyện bạn bắt đầu đọc sẽ được lưu tại đây.</p>
            <Link to="/browse" className="btn-cmc btn-cmc-primary">Bắt đầu đọc truyện</Link>
          </div>
        ) : null}
        {!loading && !error && history.length > 0 ? (
          <div className="stories-grid account-following-grid account-history-grid">
            {history.map((item) => (
              <article key={item.id || item.story_id} className="account-history-story">
                <StoryCard
                  story={{
                    ...item,
                    id: item.story_id,
                    chapter_count: item.chapter_count || item.total_chapters,
                  }}
                  compact
                />
                <div className="account-history-story__last-read">
                  <FontAwesomeIcon icon={faBookOpen} />
                  <div>
                    <span>Đọc gần nhất</span>
                    <strong>
                      {item.last_chapter_number
                        ? `Chương ${item.last_chapter_number}${item.last_chapter_title ? `: ${item.last_chapter_title}` : ''}`
                        : 'Chưa xác định chương'}
                    </strong>
                  </div>
                </div>
                {item.last_chapter_read ? (
                  <Link
                    className="btn-cmc btn-cmc-primary btn-sm account-history-story__continue"
                    to={`/${item.story_id}-${item.slug}/${item.last_chapter_number}`}
                  >
                    Tiếp tục đọc
                  </Link>
                ) : null}
              </article>
            ))}
          </div>
        ) : null}
      </section>
    </main>
  );
}

export default ReadingHistoryPage;
