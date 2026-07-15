import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FontAwesomeIcon,
  faBookOpen,
  faClockRotateLeft,
  faFeatherPointed,
  faLayerGroup,
} from '../lib/icons';
import StoryHoverPreview from './StoryHoverPreview';

const FALLBACK_COVER =
  'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=800&q=80';

const PREVIEW_WIDTH = 336;
const PREVIEW_HEIGHT = 360;
const PREVIEW_GAP = 14;
const VIEWPORT_PADDING = 16;

function getTagList(story) {
  const tagData = story.tags;
  const tags = tagData && (!Array.isArray(tagData) || tagData.length > 0)
    ? (Array.isArray(tagData) ? tagData : [tagData])
    : (story.category ? [story.category] : []);

  return tags
    .map((tag) => (typeof tag === 'object' && tag !== null ? (tag.name || tag.title || '') : tag))
    .filter(Boolean)
    .slice(0, 2);
}

function formatCount(value) {
  return Number(value || 0).toLocaleString('vi-VN');
}

function getLatestChapterNumber(story) {
  return story.latest_chapter_number
    || story.last_chapter_number
    || story.chapter_number
    || story.chapter_count
    || story.total_chapters
    || null;
}

function getUpdatedAtValue(story) {
  return story.latest_chapter_updated_at_epoch
    || story.last_chapter_updated_at_epoch
    || story.updated_at_epoch
    || story.latest_chapter_updated_at
    || story.last_chapter_updated_at
    || story.updated_at
    || story.published_at
    || story.created_at
    || '';
}

function formatRelativeTime(dateValue) {
  if (!dateValue) return 'Vừa cập nhật';

  const numericValue = Number(dateValue);
  const timestampMs = Number.isFinite(numericValue) && numericValue > 0
    ? numericValue * 1000
    : new Date(dateValue).getTime();

  if (!Number.isFinite(timestampMs)) return 'Vừa cập nhật';

  const diffMs = Date.now() - timestampMs;
  if (diffMs <= 0) return 'Vừa cập nhật';

  const diffMinutes = Math.floor(diffMs / 60000);
  if (diffMinutes < 1) return 'Vừa cập nhật';
  if (diffMinutes < 60) return `${diffMinutes} phút trước`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours} giờ trước`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays} ngày trước`;

  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(timestampMs));
}

function StoryCard({ story, compact = false, horizontal = false, showPreview = true }) {
  const cardRef = useRef(null);
  const hideTimerRef = useRef(null);
  const [previewPosition, setPreviewPosition] = useState(null);

  const storyPath = `/story/${story.id}-${story.slug}`;
  const chapterCount = story.chapter_count || story.total_chapters || 0;
  const authorName = story.author_name || 'Không rõ tác giả';
  const tags = getTagList(story);
  const latestChapterNumber = getLatestChapterNumber(story);
  const updatedAtLabel = formatRelativeTime(getUpdatedAtValue(story));

  const clearHideTimer = () => {
    if (hideTimerRef.current) {
      window.clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
  };

  const hidePreview = () => {
    if (!showPreview) return;
    clearHideTimer();
    hideTimerRef.current = window.setTimeout(() => {
      setPreviewPosition(null);
    }, 120);
  };

  const openPreview = () => {
    if (!showPreview) return;
    if (typeof window === 'undefined' || !cardRef.current) return;
    if (!window.matchMedia('(hover: hover) and (pointer: fine) and (min-width: 768px)').matches) return;

    clearHideTimer();

    const rect = cardRef.current.getBoundingClientRect();
    const hasSpaceRight = rect.right + PREVIEW_GAP + PREVIEW_WIDTH <= window.innerWidth - VIEWPORT_PADDING;
    const hasSpaceLeft = rect.left - PREVIEW_GAP - PREVIEW_WIDTH >= VIEWPORT_PADDING;
    const openLeft = !hasSpaceRight && hasSpaceLeft;
    const rawLeft = openLeft ? rect.left - PREVIEW_GAP - PREVIEW_WIDTH : rect.right + PREVIEW_GAP;
    const left = Math.min(
      Math.max(rawLeft, VIEWPORT_PADDING),
      window.innerWidth - PREVIEW_WIDTH - VIEWPORT_PADDING,
    );
    const maxTop = Math.max(VIEWPORT_PADDING, window.innerHeight - PREVIEW_HEIGHT - VIEWPORT_PADDING);
    const top = Math.min(Math.max(rect.top, VIEWPORT_PADDING), maxTop);

    setPreviewPosition({
      placement: openLeft ? 'left' : 'right',
      style: {
        left: `${left}px`,
        top: `${top}px`,
        width: `${PREVIEW_WIDTH}px`,
      },
    });
  };

  useEffect(() => () => clearHideTimer(), []);

  useEffect(() => {
    if (!previewPosition) return undefined;

    const closePreview = () => setPreviewPosition(null);
    window.addEventListener('scroll', closePreview, true);
    window.addEventListener('resize', closePreview);

    return () => {
      window.removeEventListener('scroll', closePreview, true);
      window.removeEventListener('resize', closePreview);
    };
  }, [previewPosition]);

  const articleProps = {
    ref: cardRef,
    onMouseEnter: showPreview ? openPreview : undefined,
    onMouseLeave: showPreview ? hidePreview : undefined,
    onFocus: showPreview ? openPreview : undefined,
    onBlur: showPreview ? hidePreview : undefined,
  };

  if (horizontal) {
    return (
      <>
        <article
          {...articleProps}
          className="story-card-horizontal story-card-horizontal-recent"
        >
          <Link to={storyPath} className="story-image-horizontal">
            <img
              src={story.cover_image_url || FALLBACK_COVER}
              alt={story.title}
              onError={(event) => { event.currentTarget.src = FALLBACK_COVER; }}
            />
          </Link>
          <div className="story-info-horizontal story-info-horizontal-recent">
            <Link to={storyPath} className="story-title">
              {story.title}
            </Link>

            <p className="story-card-author" title={authorName}>
              <FontAwesomeIcon icon={faFeatherPointed} /> {authorName}
            </p>

            <div className="story-recent-update">
              <span className="story-recent-update-line story-recent-update-chip">
                <FontAwesomeIcon icon={faBookOpen} />
                {latestChapterNumber ? `Chương ${formatCount(latestChapterNumber)}` : `${formatCount(chapterCount)} chương`}
              </span>
              <span className="story-recent-update-line story-recent-update-time">
                <FontAwesomeIcon icon={faClockRotateLeft} />
                {updatedAtLabel}
              </span>
            </div>
          </div>
        </article>
        {showPreview && previewPosition ? (
          <StoryHoverPreview
            story={story}
            placement={previewPosition.placement}
            style={previewPosition.style}
            onMouseEnter={clearHideTimer}
            onMouseLeave={hidePreview}
          />
        ) : null}
      </>
    );
  }

  return (
    <>
      <article
        {...articleProps}
        className={`story-card-v2 ${compact ? 'story-card-compact' : ''}`}
      >
        <Link to={storyPath} className="story-image" aria-label={`Xem chi tiết ${story.title}`}>
          <img
            src={story.cover_image_url || FALLBACK_COVER}
            alt={story.title}
            onError={(event) => { event.currentTarget.src = FALLBACK_COVER; }}
          />
        </Link>
        <div className="story-info story-info-poster-first">
          {tags.length > 0 ? (
            <div className="story-card-tags">
              {tags.map((tag) => (
                <span key={tag} className="story-card-tag">
                  <FontAwesomeIcon icon={faLayerGroup} />
                  {tag}
                </span>
              ))}
            </div>
          ) : null}

          <Link to={storyPath} className="story-title">
            {story.title}
          </Link>
        </div>
      </article>
      {showPreview && previewPosition ? (
        <StoryHoverPreview
          story={story}
          placement={previewPosition.placement}
          style={previewPosition.style}
          onMouseEnter={clearHideTimer}
          onMouseLeave={hidePreview}
        />
      ) : null}
    </>
  );
}

export default StoryCard;
