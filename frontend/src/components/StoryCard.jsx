import { Link } from 'react-router-dom';

const FALLBACK_COVER =
  'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=800&q=80';

function StoryCard({ story, compact = false }) {
  return (
    <article className="story-card-v2">
      <Link to={`/story/${story.id}`} className="story-image d-block">
        <img
          src={story.cover_image_url || FALLBACK_COVER}
          alt={story.title}
          onError={(event) => {
            event.currentTarget.src = FALLBACK_COVER;
          }}
        />
      </Link>
      <div className="story-info">
        <Link to={`/story/${story.id}`} className="story-title text-decoration-none">
          {story.title}
        </Link>
        <p className="story-meta mb-1">
          {(story.tags && story.tags.length > 0
            ? story.tags.map((t) => t.name).join(', ')
            : story.category) || 'Truyện'}
          {' · '}
          {story.chapter_count || story.total_chapters || 0}
          {' chương'}
        </p>
        {!compact && story.description ? (
          <p className="story-meta mb-2" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {story.description}
          </p>
        ) : null}
        <Link to={`/story/${story.id}`} className="btn-cmc btn-cmc-primary btn-sm" style={{ fontSize: '0.85rem', padding: '0.4rem 0.85rem' }}>
          Đọc ngay
        </Link>
      </div>
    </article>
  );
}

export default StoryCard;
