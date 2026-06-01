import { Link } from 'react-router-dom';

import type { Story } from '../types';

function truncate(text = '', maxLength = 120) {
  if (text.length <= maxLength) {
    return text;
  }

  return `${text.slice(0, maxLength).trim()}...`;
}

export default function StoryCard({ story }: { story: Story }) {
  const authorName = story.author_full_name || story.author_username || 'Unknown author';

  return (
    <div className="card h-100 story-card border-0 shadow-sm overflow-hidden">
      <div className="ratio ratio-16x9 bg-slate-900">
        <img
          src={story.cover_image_url || 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=900&q=80'}
          alt={story.title}
          className="w-100 h-100 object-fit-cover"
        />
      </div>
      <div className="card-body d-flex flex-column gap-2">
        <div className="d-flex justify-content-between align-items-start gap-2">
          <h5 className="card-title mb-0 text-truncate">{story.title}</h5>
          <span className="badge bg-brand text-dark text-nowrap">{story.category || 'General'}</span>
        </div>
        <div className="text-muted small">{authorName}</div>
        <p className="card-text text-secondary small mb-0">{truncate(story.description || 'No description available')}</p>
        <div className="d-flex justify-content-between align-items-center mt-auto pt-2">
          <span className="small text-muted">{story.total_chapters || story.chapter_count || 0} chapters</span>
          <Link to={`/story/${story.id}`} className="btn btn-sm btn-brand">
            View story
          </Link>
        </div>
      </div>
    </div>
  );
}