import { Link } from 'react-router-dom';

const FALLBACK_COVER =
  'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=800&q=80';

function StoryCard({ story, compact = false, horizontal = false }) {
  // Hàm hiển thị danh sách thẻ
  const renderTags = () => {
    if (!story.genres || story.genres.length === 0) return null;
    return (
      <div className="d-flex flex-wrap gap-1 mb-2">
        {story.genres.slice(0, 3).map((genre, index) => (
          <span 
            key={index} 
            className="badge border" 
            style={{ 
              fontSize: '0.7rem', 
              padding: '0.2rem 0.5rem', 
              backgroundColor: 'var(--surface-secondary)', 
              color: 'var(--text-muted)' 
            }}
          >
            {typeof genre === 'string' ? genre : genre.name}
          </span>
        ))}
      </div>
    );
  };

  if (horizontal) {
    return (
      <article className="story-card-horizontal d-flex gap-3 p-3 rounded-4" style={{ background: 'var(--surface)', border: '1px solid var(--border)', boxShadow: 'var(--shadow)' }}>
        <Link to={`/story/${story.id}`} className="story-image-horizontal flex-shrink-0" style={{ width: '90px', height: '120px', borderRadius: '8px', overflow: 'hidden' }}>
          <img
            src={story.cover_image_url || FALLBACK_COVER}
            alt={story.title}
            onError={(event) => { event.currentTarget.src = FALLBACK_COVER; }}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </Link>
        <div className="story-info-horizontal d-flex flex-column flex-grow-1 min-w-0">
          <Link to={`/story/${story.id}`} className="story-title text-decoration-none fw-bold text-truncate" style={{ fontSize: '1.05rem', color: 'var(--text)' }}>
            {story.title}
          </Link>
          <p className="small text-muted mb-1 text-truncate">
            Tác giả: {story.author_full_name || story.author_username || 'CMC'}
          </p>
          <p className="story-desc-horizontal text-muted small mb-2" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {story.description}
          </p>
          
          {renderTags()}

          <div className="mt-auto d-flex justify-content-between align-items-center">
            <span className="small text-muted">
              📖 {story.chapter_count || story.total_chapters || 0} chương · 👥 {story.follow_count || 0} theo dõi
            </span>
            <Link to={`/story/${story.id}`} className="btn-cmc btn-cmc-primary btn-xs">
              Đọc ngay
            </Link>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className="story-card-v2">
      <Link to={`/story/${story.id}`} className="story-image d-block">
        <img
          src={story.cover_image_url || FALLBACK_COVER}
          alt={story.title}
          onError={(event) => { event.currentTarget.src = FALLBACK_COVER; }}
        />
      </Link>
      <div className="story-info">
        <Link to={`/story/${story.id}`} className="story-title text-decoration-none">
          {story.title}
        </Link>
        <p className="story-meta mb-1">
          ✍️ {story.author_full_name || story.author_username || 'CMC'}
        </p>

        <p className="story-meta mb-2">
          📖 {story.chapter_count || story.total_chapters || 0} chương · 👥 {story.follow_count || 0} theo dõi
        </p>
        
        {renderTags()}

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