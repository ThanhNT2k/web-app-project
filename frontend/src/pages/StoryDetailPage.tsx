import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import AIChapterSummary from '../components/AIChapterSummary';
import CommentSection from '../components/CommentSection';
import { chapters as chapterApi, stories as storyApi } from '../services/api';
import type { Chapter, Story } from '../types';

export default function StoryDetailPage() {
  const { id } = useParams();
  const [story, setStory] = useState<Story | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function loadStory() {
      if (!id) {
        return;
      }

      setLoading(true);
      setError('');

      try {
        const [storyResponse, chapterResponse] = await Promise.all([storyApi.getById(id), chapterApi.getByStory(id, 1)]);

        if (!cancelled) {
          setStory(storyResponse.story || null);
          setChapters(chapterResponse.chapters || []);
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : 'Failed to load story');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadStory();

    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) {
    return <div className="container py-5 text-center">Loading story...</div>;
  }

  if (error) {
    return <div className="container py-5"><div className="alert alert-danger">{error}</div></div>;
  }

  if (!story) {
    return <div className="container py-5"><div className="alert alert-warning">Story not found</div></div>;
  }

  return (
    <div className="container py-4 py-md-5">
      <div className="row g-4">
        <div className="col-lg-4">
          <div className="card border-0 shadow-sm overflow-hidden">
            <img
              src={story.cover_image_url || 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=900&q=80'}
              alt={story.title}
              className="w-100 object-fit-cover"
            />
          </div>
        </div>
        <div className="col-lg-8">
          <div className="d-flex flex-column gap-3">
            <div>
              <h1 className="display-6 fw-bold mb-2">{story.title}</h1>
              <div className="text-muted">{story.author_full_name || story.author_username || 'Unknown author'}</div>
            </div>
            <div className="d-flex flex-wrap gap-2">
              <span className="badge bg-brand text-dark">{story.category || 'General'}</span>
              <span className="badge bg-secondary">{story.status || 'Unknown'}</span>
              <span className="badge bg-dark">{story.total_chapters || story.chapter_count || 0} chapters</span>
            </div>
            <p className="lead text-secondary">{story.description || 'No description available.'}</p>
            <div className="d-flex gap-2">
              {chapters[0] ? (
                <Link to={`/story/${story.id}/chapter/${chapters[0].id}`} className="btn btn-brand">
                  Start reading
                </Link>
              ) : null}
            </div>
            <AIChapterSummary summary="This story follows a compelling journey with layered character growth and high-stakes progression." />
          </div>
        </div>
      </div>

      <section className="mt-5">
        <h2 className="h4 fw-bold mb-3">Chapters</h2>
        <div className="list-group shadow-sm">
          {chapters.length === 0 ? (
            <div className="list-group-item">No chapters available.</div>
          ) : (
            chapters.map((chapter) => (
              <Link key={chapter.id} to={`/story/${story.id}/chapter/${chapter.id}`} className="list-group-item list-group-item-action d-flex justify-content-between align-items-center">
                <span>
                  Chapter {chapter.chapter_number}: {chapter.title}
                </span>
                <span className="small text-muted">Read</span>
              </Link>
            ))
          )}
        </div>
      </section>

      <div className="row g-4 mt-4">
        <div className="col-lg-8">
          <CommentSection />
        </div>
      </div>
    </div>
  );
}