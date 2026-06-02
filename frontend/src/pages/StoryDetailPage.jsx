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

const CHAPTERS_PER_PAGE = 50;

function StoryDetailPage() {
  const { id } = useParams();
  const { isAuthenticated } = useAuth();
  const [story, setStory] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [storyProgress, setStoryProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [chapterLoading, setChapterLoading] = useState(false);
  const [error, setError] = useState('');
  const [chapterPage, setChapterPage] = useState(1);
  const [chapterPagination, setChapterPagination] = useState({ page: 1, totalPages: 1, totalItems: 0 });

  // Load story info once
  useEffect(() => {
    const fetchStory = async () => {
      try {
        setLoading(true);
        const storyResponse = await API.stories.getById(id);
        setStory(storyResponse.story || storyResponse);
        setError('');
      } catch {
        const fallbackStory = mockStories.find((item) => String(item.id) === String(id)) || mockStories[0];
        setStory(fallbackStory);
        setError('Không kết nối API. Hiển thị dữ liệu mẫu.');
      } finally {
        setLoading(false);
      }
    };
    fetchStory();
  }, [id]);

  // Load chapters with pagination
  useEffect(() => {
    const fetchChapters = async () => {
      try {
        setChapterLoading(true);
        const chaptersResponse = await API.chapters.getByStory(id, chapterPage, CHAPTERS_PER_PAGE);
        setChapters(chaptersResponse.chapters || []);
        setChapterPagination(chaptersResponse.pagination || { page: 1, totalPages: 1, totalItems: 0 });
      } catch {
        setChapters([
          { id: 1, chapter_number: 1, title: 'Chương mẫu 1' },
          { id: 2, chapter_number: 2, title: 'Chương mẫu 2' },
        ]);
      } finally {
        setChapterLoading(false);
      }
    };
    fetchChapters();
  }, [id, chapterPage]);

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

  const continueChapter = storyProgress?.last_chapter_read || chapters[0]?.id;

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
              Tác giả:{' '}
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
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h4 className="panel-title mb-0">Danh sách chương</h4>
              {chapterPagination.totalItems > 0 && (
                <span className="small text-muted">
                  {chapterPagination.totalItems} chương
                </span>
              )}
            </div>

            {chapterLoading ? (
              <p className="loading-text">Đang tải danh sách chương...</p>
            ) : (
              <>
                <ul className="chapter-list">
                  {chapters.map((chapter) => (
                    <li key={chapter.id}>
                      <Link to={`/story/${story.id}/chapter/${chapter.id}`}>
                        <span>
                          Ch.{chapter.chapter_number}: {chapter.title}
                        </span>
                        <span className="text-muted small">Đọc →</span>
                      </Link>
                    </li>
                  ))}
                </ul>

                {/* Chapter pagination */}
                {chapterPagination.totalPages > 1 && (
                  <div className="d-flex justify-content-center align-items-center gap-2 mt-4 flex-wrap">
                    <button
                      type="button"
                      className="btn-cmc btn-cmc-outline btn-sm"
                      disabled={chapterPage <= 1}
                      onClick={() => setChapterPage((p) => p - 1)}
                    >
                      ← Trước
                    </button>
                    {/* Page number buttons — show max 5 around current */}
                    {Array.from({ length: chapterPagination.totalPages }, (_, i) => i + 1)
                      .filter((p) => Math.abs(p - chapterPage) <= 2)
                      .map((p) => (
                        <button
                          key={p}
                          type="button"
                          className={`btn-cmc btn-sm ${p === chapterPage ? 'btn-cmc-primary' : 'btn-cmc-outline'}`}
                          onClick={() => setChapterPage(p)}
                        >
                          {p}
                        </button>
                      ))}
                    <button
                      type="button"
                      className="btn-cmc btn-cmc-outline btn-sm"
                      disabled={chapterPage >= chapterPagination.totalPages}
                      onClick={() => setChapterPage((p) => p + 1)}
                    >
                      Sau →
                    </button>
                  </div>
                )}
              </>
            )}
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
