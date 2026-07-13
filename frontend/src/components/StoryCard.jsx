import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FontAwesomeIcon,
  faBookOpen,
  faEye,
  faFeatherPointed,
  faLayerGroup,
  faUsers,
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

function StoryCard({ story, compact = false, horizontal = false }) {
  const cardRef = useRef(null);
  const hideTimerRef = useRef(null);
  const [previewPosition, setPreviewPosition] = useState(null);

  const storyPath = `/story/${story.id}-${story.slug}`;
  const chapterCount = story.chapter_count || story.total_chapters || 0;
  const followCount = story.follow_count || 0;
  const viewCount = story.view_count ?? story.views ?? story.total_views ?? story.views_metric ?? null;
  const authorName = story.author_name || 'Không rõ tác giả';
  const tags = getTagList(story);

  const formatCount = (value) => Number(value || 0).toLocaleString('vi-VN');

  const clearHideTimer = () => {
    if (hideTimerRef.current) {
      window.clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
  };

  const hidePreview = () => {
    clearHideTimer();
    hideTimerRef.current = window.setTimeout(() => {
      setPreviewPosition(null);
    }, 120);
  };

  const showPreview = () => {
    if (horizontal || typeof window === 'undefined' || !cardRef.current) return;
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

  if (horizontal) {
    return (
      <article className="story-card-horizontal">
        <Link to={storyPath} className="story-image-horizontal">
          <img
            src={story.cover_image_url || FALLBACK_COVER}
            alt={story.title}
            onError={(event) => { event.currentTarget.src = FALLBACK_COVER; }}
          />
        </Link>
        <div className="story-info-horizontal">
          <Link to={storyPath} className="story-title">
            {story.title}
          </Link>
          <p className="story-card-author" title={authorName}>
            <FontAwesomeIcon icon={faFeatherPointed} /> {authorName}
          </p>

          <div className="story-card-footer">
            <span className="story-card-metrics">
              <span><FontAwesomeIcon icon={faBookOpen} /> {formatCount(chapterCount)} chương</span>
              <span><FontAwesomeIcon icon={faUsers} /> {formatCount(followCount)} theo dõi</span>
              {viewCount != null ? (
                <span><FontAwesomeIcon icon={faEye} /> {formatCount(viewCount)} lượt xem</span>
              ) : null}
            </span>
          </div>
        </div>
      </article>
    );
  }

  return (
    <>
      <article
        ref={cardRef}
        className={`story-card-v2 ${compact ? 'story-card-compact' : ''}`}
        onMouseEnter={showPreview}
        onMouseLeave={hidePreview}
        onFocus={showPreview}
        onBlur={hidePreview}
      >
        <Link to={storyPath} className="story-image" aria-label={`Xem chi tiết ${story.title}`}>
          <img
            src={story.cover_image_url || FALLBACK_COVER}
            alt={story.title}
            onError={(event) => { event.currentTarget.src = FALLBACK_COVER; }}
          />
        </Link>
        <div className="story-info">
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

          <p className="story-card-author" title={authorName}>
            <FontAwesomeIcon icon={faFeatherPointed} /> {authorName}
          </p>

          <div className="story-card-metrics">
            <span><FontAwesomeIcon icon={faBookOpen} /> {formatCount(chapterCount)} chương</span>
            <span><FontAwesomeIcon icon={faUsers} /> {formatCount(followCount)} theo dõi</span>
            {viewCount != null ? (
              <span><FontAwesomeIcon icon={faEye} /> {formatCount(viewCount)} lượt xem</span>
            ) : null}
          </div>
        </div>
      </article>
      {previewPosition ? (
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
