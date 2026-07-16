import { useEffect, useMemo, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';

import CommentSection from '../components/CommentSection';
import FollowButton from '../components/FollowButton';
import ReportModal from '../components/ReportModal';
import StoryRating from '../components/StoryRating';
import API from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { mockStories } from '../data/mockStories';
import { slugify } from '../utils/slugify';
import {
  FontAwesomeIcon,
  faBookOpen,
  faFlag,
  faForwardStep,
  faStar,
} from '../lib/icons';

const FALLBACK_COVER =
  'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=800&q=80';

const CHAPTERS_SCROLL_LIMIT = 1000;

function StoryDetailSkeleton() {
  return (
    <main className="cmc-main storyqq-page story-detail-skeleton" aria-busy="true">
      <div className="storyqq-page-shell">
        <section className="storyqq-header panel-card storyqq-panel">
          <div className="storyqq-cover-column">
            <div className="skeleton-box story-detail-skeleton-cover" />
            <div className="skeleton-box story-detail-skeleton-meta" />
          </div>
          <div className="storyqq-header-content story-detail-skeleton-content">
            <div className="skeleton-box story-detail-skeleton-title" />
            <div className="skeleton-box story-detail-skeleton-author" />
            <div className="skeleton-box story-detail-skeleton-line" />
            <div className="skeleton-box story-detail-skeleton-line" />
            <div className="skeleton-box story-detail-skeleton-line is-short" />
            <div className="story-detail-skeleton-actions">
              {[1, 2, 3].map((item) => <div key={item} className="skeleton-box" />)}
            </div>
          </div>
        </section>
        <section className="panel-card mt-4 storyqq-panel story-detail-skeleton-chapters">
          <div className="skeleton-box story-detail-skeleton-heading" />
          {[1, 2, 3, 4, 5].map((item) => <div key={item} className="skeleton-box story-detail-skeleton-chapter" />)}
        </section>
      </div>
    </main>
  );
}

function formatChapterUploadDate(createdAt) {
  if (!createdAt) return '--/--/----';
  const parsed = new Date(createdAt);
  if (Number.isNaN(parsed.getTime())) return '--/--/----';
  return parsed.toLocaleDateString('vi-VN');
}

function formatDateOrFallback(dateValue) {
  if (!dateValue) return 'Chưa cập nhật';
  const parsed = new Date(dateValue);
  if (Number.isNaN(parsed.getTime())) return 'Chưa cập nhật';
  return parsed.toLocaleDateString('vi-VN');
}

function formatWholeNumber(value) {
  return Number(value || 0).toLocaleString('vi-VN');
}

function formatRatingWithCount(averageValue, countValue) {
  const rating = Number(averageValue || 0);
  const count = Number(countValue || 0);
  const ratingStr = rating.toLocaleString('vi-VN', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });
  const countStr = count.toLocaleString('vi-VN');
  return `${ratingStr}/5 (${countStr} lượt)`;
}

function StoryDetailPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [story, setStory] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [storyProgress, setStoryProgress] = useState(null);
  const [readChapterNumbers, setReadChapterNumbers] = useState(() => new Set());
  const [loading, setLoading] = useState(true);
  const [chapterLoading, setChapterLoading] = useState(false);
  const [error, setError] = useState('');
  const [chapterPagination, setChapterPagination] = useState({ page: 1, totalPages: 1, totalItems: 0 });
  const [sortOrder, setSortOrder] = useState('desc');
  const [chapterSearch, setChapterSearch] = useState('');
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [showRatingPanel, setShowRatingPanel] = useState(false);
  const [introExpanded, setIntroExpanded] = useState(false);

  // Load story info once
  useEffect(() => {
    const fetchStory = async () => {
      try {
        setLoading(true);
        setIntroExpanded(false);
        const storyResponse = await API.stories.getBySlug(slug);
        setStory(storyResponse.story || storyResponse);
        setError('');
      } catch (err) {
        if (err?.response?.status === 404) {
          setStory(null);
          setError('Truyện không tồn tại hoặc đã bị ẩn.');
        } else {
          const fallbackStory = mockStories.find((item) => item.slug === slug) || mockStories[0];
          setStory(fallbackStory);
          setError('Không kết nối API. Hiển thị dữ liệu mẫu.');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchStory();
  }, [slug]);

  // Redirect to canonical URL (storyId-slug) if not already matching
  useEffect(() => {
    if (story && story.id && story.slug) {
      const canonicalSlug = `${story.id}-${story.slug}`;
      if (slug !== canonicalSlug) {
        navigate(`/story/${canonicalSlug}`, { replace: true });
      }
    }
  }, [story, slug, navigate]);

  // Load chapter metadata for the in-list vertical scroller.
  useEffect(() => {
    if (!story?.id) return;
    const fetchChapters = async () => {
      try {
        setChapterLoading(true);
        const chaptersResponse = await API.chapters.getByStory(story.id, 1, CHAPTERS_SCROLL_LIMIT, sortOrder);
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
  }, [story?.id, sortOrder]);

  useEffect(() => {
    if (!isAuthenticated || !story?.id) {
      setStoryProgress(null);
      setReadChapterNumbers(new Set());
      return;
    }

    let isActive = true;

    const fetchReadingState = async () => {
      const [progressResult, readChaptersResult] = await Promise.allSettled([
        API.readingHistory.getStoryProgress(story.id),
        API.readingHistory.getReadChapters(story.id),
      ]);

      if (!isActive) return;

      const progress = progressResult.status === 'fulfilled'
        ? progressResult.value?.progress || null
        : null;
      setStoryProgress(progress);

      const readChapterList = readChaptersResult.status === 'fulfilled'
        ? readChaptersResult.value?.chapter_numbers || []
        : [];
      const nextReadChapters = new Set(
        readChapterList
          .map((chapterNumber) => Number(chapterNumber))
          .filter((chapterNumber) => Number.isInteger(chapterNumber) && chapterNumber > 0),
      );

      if (nextReadChapters.size === 0 && progress?.chapter_number) {
        nextReadChapters.add(Number(progress.chapter_number));
      }

      setReadChapterNumbers(nextReadChapters);
    };

    fetchReadingState();

    return () => {
      isActive = false;
    };
  }, [isAuthenticated, story?.id]);

  const filteredChapters = useMemo(() => {
    const keyword = chapterSearch.trim().toLocaleLowerCase('vi-VN');
    if (!keyword) return chapters;
    const numberKeyword = keyword.replace(/^(?:ch|chương)\.?\s*/u, '');

    return chapters.filter((chapter) => {
      const chapterNumber = String(chapter.chapter_number ?? '');
      const chapterTitle = String(chapter.title || '').toLocaleLowerCase('vi-VN');
      return chapterNumber.includes(numberKeyword) || chapterTitle.includes(keyword);
    });
  }, [chapters, chapterSearch]);

  if (loading) {
    return <StoryDetailSkeleton />;
  }

  if (!story) {
    return (
      <main className="cmc-main">
        {error ? (
          <div className="alert-cmc alert-cmc-warning">{error}</div>
        ) : (
          <p>Không tìm thấy truyện.</p>
        )}
      </main>
    );
  }

  const lastReadChapterNumber = Number(storyProgress?.chapter_number || 0);
  const totalChapters = story.chapter_count || story.total_chapters || chapterPagination.totalItems || 0;
  const firstChapterNumber = totalChapters > 0 ? 1 : null;
  const continueChapterNumber = storyProgress?.chapter_number || firstChapterNumber;
  const latestChapter = chapters.reduce((latest, chapter) => {
    if (!latest) return chapter;
    return Number(chapter.chapter_number || 0) > Number(latest.chapter_number || 0) ? chapter : latest;
  }, null);
  const storyCreatedDate = formatDateOrFallback(story.created_at || story.published_at || latestChapter?.created_at);
  const followCount = story.follow_count ?? story.follower_count ?? 0;
  const totalViews = story.total_views ?? story.view_count ?? story.views ?? story.views_metric ?? 0;
  const averageRating = story.average_rating ?? 0;
  const ratingCount = story.rating_count ?? story.total_rating_count ?? 0;
  const description = story.description || 'Chưa có mô tả cho truyện này.';
  const hasLongDescription = description.length > 320;
  const detailBackdropStyle = {
    '--storyqq-backdrop-image': `url('${story.cover_image_url || FALLBACK_COVER}')`,
  };

  const storyMetaItems = [
    { label: 'Số chương', value: formatWholeNumber(totalChapters) },
    { label: 'Người theo dõi', value: formatWholeNumber(followCount) },
    { label: 'Tổng lượt đọc', value: formatWholeNumber(totalViews) },
    { label: 'Đánh giá', value: formatRatingWithCount(averageRating, ratingCount) },
    { label: 'Ngày đăng', value: storyCreatedDate },
  ];

  return (
    <main className="cmc-main storyqq-page" style={detailBackdropStyle}>
      {error ? <div className="alert-cmc alert-cmc-warning">{error}</div> : null}



      <div className="storyqq-page-shell">
        <section className="storyqq-header panel-card storyqq-panel">
        <div className="storyqq-cover-column">
          <div className="storyqq-cover-wrap">
            <img
              src={story.cover_image_url || FALLBACK_COVER}
              alt={story.title}
              className="storyqq-cover"
              onError={(e) => { e.currentTarget.src = FALLBACK_COVER; }}
            />
            <span className="storyqq-status-badge">{story.status || 'Đang cập nhật'}</span>
          </div>

          <dl className="storyqq-meta-table">
            {storyMetaItems.map((item) => (
              <div key={item.label} className="storyqq-meta-item">
                <dt className="storyqq-meta-label">{item.label}</dt>
                <dd className="storyqq-meta-value">{item.value}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="storyqq-header-content">
          <h1 className="storyqq-title">{story.title}</h1>

          <p className="storyqq-author">
            <span>Tác giả: {story.author_name || 'Không rõ tác giả'}</span>
            <span className="text-muted">
              {' · Người đăng: '}
              {story.author_full_name || (story.author_username ? `@${story.author_username}` : 'Không rõ')}
            </span>
            {story.collaborators?.length > 0 && (
              <>
                {' · Đồng đăng: '}
                <span className="text-muted">
                  {story.collaborators.map((c) => c.full_name || c.username).join(', ')}
                </span>
              </>
            )}
          </p>

          <div className="storyqq-intro-block">
            <p className="storyqq-intro-label">Giới thiệu truyện</p>
            <p className={`storyqq-desc${!introExpanded && hasLongDescription ? ' is-collapsed' : ''}`}>
              {description}
            </p>
            {hasLongDescription ? (
              <button
                type="button"
                className="storyqq-intro-toggle"
                onClick={() => setIntroExpanded((current) => !current)}
                aria-expanded={introExpanded}
              >
                {introExpanded ? 'Thu gọn' : 'Đọc thêm'}
              </button>
            ) : null}
          </div>

          <div className="storyqq-tags-footer">
            {story.tags?.length > 0 ? (
              <div className="story-tags-row">
                {story.tags.map((tag) => (
                  <Link key={tag.id} to={`/tim-truyen?tag=${tag.slug}`} className="story-tag-chip">
                    {tag.name}
                  </Link>
                ))}
              </div>
            ) : story.category ? (
              <div className="story-tags-row">
                <Link to={`/tim-truyen?tag=${slugify(story.category)}`} className="story-tag-chip">
                  {story.category}
                </Link>
              </div>
            ) : null}
          </div>

        </div>

        {showRatingPanel ? (
          <StoryRating
            storyId={story.id}
            initialAverageRating={story.average_rating}
            initialRatingCount={story.rating_count || story.total_rating_count}
            className="storyqq-rating-panel"
            onRatingChange={(nextRating) => {
              setStory((currentStory) => currentStory
                ? {
                  ...currentStory,
                  average_rating: nextRating.average_rating,
                  rating_count: nextRating.rating_count,
                  total_rating_count: nextRating.rating_count,
                }
                : currentStory);
            }}
          />
        ) : null}

        <div className="storyqq-actions">
          {continueChapterNumber ? (
            <Link
              to={`/${story.id}-${story.slug}/${continueChapterNumber}`}
              className="btn-cmc btn-cmc-primary storyqq-icon-action"
              aria-label={storyProgress ? 'Tiếp tục đọc' : 'Bắt đầu đọc'}
              title={storyProgress ? 'Tiếp tục đọc' : 'Bắt đầu đọc'}
              data-tooltip={storyProgress ? 'Tiếp tục đọc' : 'Bắt đầu đọc'}
            >
              <FontAwesomeIcon icon={faBookOpen} />
              <span className="storyqq-action-text">{storyProgress ? 'Tiếp tục đọc' : 'Bắt đầu đọc'}</span>
            </Link>
          ) : null}

          {latestChapter ? (
            <Link
              to={`/${story.id}-${story.slug}/${latestChapter.chapter_number}`}
              className="btn-cmc btn-cmc-outline storyqq-icon-action"
              aria-label="Đọc chương mới nhất"
              title="Đọc chương mới nhất"
              data-tooltip="Chương mới nhất"
            >
              <FontAwesomeIcon icon={faForwardStep} />
              <span className="storyqq-action-text">Chương mới nhất</span>
            </Link>
          ) : null}

          <FollowButton storyId={story.id} responsiveIconOnly />

          <button
            type="button"
            className="btn-cmc btn-cmc-outline storyqq-icon-action"
            onClick={() => setIsReportModalOpen(true)}
            aria-label="Báo cáo truyện"
            title="Báo cáo truyện"
            data-tooltip="Báo cáo"
          >
            <FontAwesomeIcon icon={faFlag} />
            <span className="storyqq-action-text">Báo cáo</span>
          </button>

          <button
            type="button"
            className={`btn-cmc btn-cmc-outline storyqq-icon-action${showRatingPanel ? ' is-active' : ''}`}
            onClick={() => setShowRatingPanel((prev) => !prev)}
            aria-label={showRatingPanel ? 'Ẩn đánh giá truyện' : 'Đánh giá truyện'}
            title={showRatingPanel ? 'Ẩn đánh giá truyện' : 'Đánh giá truyện'}
            data-tooltip={showRatingPanel ? 'Ẩn đánh giá' : 'Đánh giá'}
          >
            <FontAwesomeIcon icon={faStar} />
            <span className="storyqq-action-text">{showRatingPanel ? 'Ẩn đánh giá' : 'Đánh giá'}</span>
          </button>
        </div>
        </section>

        <section className="panel-card mt-4 storyqq-panel">
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
          <h4 className="panel-title mb-0">
            Danh sách chương ({chapterPagination.totalItems || 0})
          </h4>
          <div className="storyqq-chapter-tools">
            <label className="storyqq-chapter-search">
              <span className="visually-hidden">Tìm kiếm chương</span>
              <input
                type="search"
                value={chapterSearch}
                onChange={(e) => setChapterSearch(e.target.value)}
                placeholder="Tìm số hoặc tên chương..."
                aria-label="Tìm kiếm chương"
              />
              {chapterSearch ? (
                <button type="button" onClick={() => setChapterSearch('')} aria-label="Xóa tìm kiếm chương">×</button>
              ) : null}
            </label>
            <select
              className="form-select form-select-sm"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              aria-label="Sắp xếp chương"
            >
              <option value="asc">Sắp xếp: Cũ nhất</option>
              <option value="desc">Sắp xếp: Mới nhất</option>
            </select>
          </div>
        </div>

        {chapterLoading ? (
          <div className="loading-text" aria-label="Đang tải danh sách chương" />
        ) : (
          <ul className="chapter-list storyqq-chapter-list">
              {filteredChapters.map((chapter) => {
                const chapterNumber = Number(chapter.chapter_number || 0);
                const isRead = readChapterNumbers.has(chapterNumber);

                return (
                  <li key={chapter.id}>
                    <Link
                      to={`/${story.id}-${story.slug}/${chapter.chapter_number}`}
                      className={isRead ? 'chapter-link-is-read' : ''}
                    >
                      <span>
                        Ch.{chapter.chapter_number}: {chapter.title || `Chương ${chapter.chapter_number}`}
                      </span>
                      <span className="text-muted small chapter-upload-date">
                        {formatChapterUploadDate(chapter.created_at)}
                      </span>
                    </Link>
                  </li>
                );
              })}
              {filteredChapters.length === 0 ? (
                <li className="storyqq-chapter-empty">
                  Không tìm thấy chương phù hợp với “{chapterSearch.trim()}”.
                </li>
              ) : null}
            </ul>
        )}
        </section>

        <section className="mt-4 storyqq-panel-stack">
          <CommentSection key={`story-comments-${story.id}`} storyId={story.id} mode="story" />
        </section>
      </div>
      {isReportModalOpen && (
        <ReportModal 
          storyId={story.id}
          chapterId={null}
          onClose={() => setIsReportModalOpen(false)} 
        />
      )}
    </main>
  );
}

export default StoryDetailPage;
