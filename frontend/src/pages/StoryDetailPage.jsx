import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import CommentSection from '../components/CommentSection';
import FollowButton from '../components/FollowButton';
import ReadingProgress from '../components/ReadingProgress';
import API from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { mockStories } from '../data/mockStories';
import { slugify } from '../utils/slugify';

const FALLBACK_COVER =
  'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=800&q=80';

function StoryDetailPage() {
  const { id } = useParams();
  const { isAuthenticated } = useAuth();
  const [story, setStory] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [storyProgress, setStoryProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStory = async () => {
      try {
        setLoading(true);
        const [storyResponse, chaptersResponse] = await Promise.all([
          API.stories.getById(id),
          API.chapters.getByStory(id, 1),
        ]);
        setStory(storyResponse.story || storyResponse);
        setChapters(chaptersResponse.chapters || []);
        setError('');
      } catch {
        const fallbackStory = mockStories.find((item) => String(item.id) === String(id)) || mockStories[0];
        setStory(fallbackStory);
        setChapters([
          { id: 1, chapter_number: 1, title: 'Chương mẫu 1' },
          { id: 2, chapter_number: 2, title: 'Chương mẫu 2' },
        ]);
        setError('Không kết nối API. Hiển thị dữ liệu mẫu.');
      } finally {
        setLoading(false);
      }
    };
    fetchStory();
  }, [id]);

  useEffect(() => {
    if (!isAuthenticated) return;
    API.readingHistory.getStoryProgress(id)
      .then((res) => setStoryProgress(res.progress || null))
      .catch(() => setStoryProgress(null));
  }, [isAuthenticated, id]);

  if (loading) {
    return <main className="cmc-main"><p className="loading-text">Đang tải...</p></main>;
  }

  if (!story) {
    return <main className="cmc-main"><p>Không tìm thấy truyện.</p></main>;
  }

  const continueChapter = storyProgress?.last_chapter_read
    || chapters[0]?.id;

  return (
    <main className="cmc-main">
      {error ? <div className="alert-cmc alert-cmc-warning">{error}</div> : null}

      {isAuthenticated && storyProgress ? (
        <ReadingProgress progress={storyProgress} storyId={id} />
      ) : null}

      <div className="story-detail-header panel-card">
        <div className="story-detail-grid">
          <img
            src={story.cover_image_url || FALLBACK_COVER}
            alt={story.title}
            className="story-detail-cover"
            onError={(e) => { e.currentTarget.src = FALLBACK_COVER; }}
          />
          <div>
            <h1>{story.title}</h1>
            <p className="text-muted mb-2">
              Tác giả:
              {' '}
              {story.author_full_name || story.author_username || 'CMC'}
            </p>
            <p className="story-detail-desc">{story.description}</p>
            <div className="d-flex flex-wrap gap-2 align-items-center mb-3">
              <span className="small text-muted">
                {story.chapter_count || story.total_chapters || 0}
                {' chương · '}
                {story.status}
              </span>
            </div>
            {story.tags?.length > 0 ? (
              <div className="story-tags-row mb-3">
                {story.tags.map((tag) => (
                  <Link key={tag.id} to={`/tim-truyen?tag=${tag.slug}`} className="story-tag-chip">
                    {tag.name}
                  </Link>
                ))}
              </div>
            ) : story.category ? (
              <div className="mb-3">
                <Link to={`/tim-truyen?tag=${slugify(story.category)}`} className="story-tag-chip">
                  {story.category}
                </Link>
              </div>
            ) : null}
            <div className="d-flex flex-wrap gap-2">
              {continueChapter ? (
                <Link
                  to={`/story/${story.id}/chapter/${continueChapter}`}
                  className="btn-cmc btn-cmc-primary"
                >
                  {storyProgress ? 'Tiếp tục đọc' : 'Bắt đầu đọc'}
                </Link>
              ) : null}
              <FollowButton storyId={story.id} />
            </div>
          </div>
        </div>
      </div>

      <div className="row g-4 mt-2">
        <div className="col-lg-8">
          <section className="panel-card">
            <h4 className="panel-title">Danh sách chương</h4>
            <ul className="chapter-list">
              {chapters.map((chapter) => (
                <li key={chapter.id}>
                  <Link to={`/story/${story.id}/chapter/${chapter.id}`}>
                    <span>
                      Ch.
                      {chapter.chapter_number}
                      :
                      {' '}
                      {chapter.title}
                    </span>
                    <span className="text-muted small">Đọc →</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        </div>
        <div className="col-lg-4">
          <CommentSection key={`story-comments-${id}`} storyId={id} mode="story" />
        </div>
      </div>
    </main>
  );
}

export default StoryDetailPage;
