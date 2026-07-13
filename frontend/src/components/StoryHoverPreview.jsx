import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import {
  FontAwesomeIcon,
  faBookOpen,
  faEye,
  faFeatherPointed,
  faLayerGroup,
  faStar,
  faUsers,
} from '../lib/icons';

function formatCount(value) {
  return Number(value || 0).toLocaleString('vi-VN');
}

function getTagList(story) {
  const tagData = story.tags;
  const tags = tagData && (!Array.isArray(tagData) || tagData.length > 0)
    ? (Array.isArray(tagData) ? tagData : [tagData])
    : (story.category ? [story.category] : []);

  return tags
    .map((tag) => (typeof tag === 'object' && tag !== null ? (tag.name || tag.title || '') : tag))
    .filter(Boolean)
    .slice(0, 4);
}

function getStoryPath(story) {
  return `/story/${story.id}-${story.slug}`;
}

function StoryHoverPreview({ story, placement, style, onMouseEnter, onMouseLeave }) {
  if (!story || typeof document === 'undefined') return null;

  const chapterCount = story.chapter_count || story.total_chapters || 0;
  const followCount = story.follow_count || 0;
  const viewCount = story.view_count ?? story.views ?? story.total_views ?? story.views_metric ?? null;
  const ratingCount = story.rating_count || story.total_rating_count || 0;
  const averageRating = Number(story.average_rating || 0);
  const tags = getTagList(story);
  const status = story.status || story.state || story.story_status || '';
  const year = story.year || story.release_year || story.published_year || '';
  const description = story.description || 'Chưa có mô tả cho truyện này.';

  return createPortal(
    <aside
      className={`story-hover-preview story-hover-preview-${placement}`}
      style={style}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      role="dialog"
      aria-label={`Xem nhanh ${story.title}`}
    >
      <div className="story-hover-preview-header">
        <Link to={getStoryPath(story)} className="story-hover-preview-title">
          {story.title}
        </Link>
        {ratingCount > 0 ? (
          <span className="story-hover-preview-rating">
            <FontAwesomeIcon icon={faStar} />
            {averageRating.toFixed(1)}
          </span>
        ) : null}
      </div>

      <div className="story-hover-preview-meta">
        <span><FontAwesomeIcon icon={faFeatherPointed} /> {story.author_name || 'Không rõ tác giả'}</span>
        <span><FontAwesomeIcon icon={faBookOpen} /> {formatCount(chapterCount)} chương</span>
        <span><FontAwesomeIcon icon={faUsers} /> {formatCount(followCount)} theo dõi</span>
        {viewCount != null ? (
          <span><FontAwesomeIcon icon={faEye} /> {formatCount(viewCount)} lượt xem</span>
        ) : null}
        {status ? <span>{status}</span> : null}
        {year ? <span>{year}</span> : null}
      </div>

      <p className="story-hover-preview-desc">{description}</p>

      {tags.length > 0 ? (
        <div className="story-hover-preview-tags">
          {tags.map((tag) => (
            <span key={tag}>
              <FontAwesomeIcon icon={faLayerGroup} />
              {tag}
            </span>
          ))}
        </div>
      ) : null}

      <Link to={getStoryPath(story)} className="story-hover-preview-cta">
        Xem chi tiết
      </Link>
    </aside>,
    document.body,
  );
}

export default StoryHoverPreview;
