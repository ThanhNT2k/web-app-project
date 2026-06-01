import type { Chapter, Story } from '../types';

export default function StoryReader({
  story,
  chapter,
  onPrev,
  onNext,
}: {
  story?: Story | null;
  chapter?: Chapter | null;
  onPrev?: () => void;
  onNext?: () => void;
}) {
  return (
    <article className="story-reader card border-0 shadow-sm">
      <div className="card-body p-4 p-md-5">
        <div className="mb-4">
          <p className="text-uppercase text-brand-700 small fw-semibold mb-1">{story?.title || 'Story'}</p>
          <h1 className="h3 fw-bold mb-2">{chapter?.title || 'Chapter'}</h1>
          <div className="text-muted small">Chapter {chapter?.chapter_number || '—'}</div>
        </div>

        <div className="reader-content fs-5 lh-lg whitespace-pre-line">
          {chapter?.content || 'No chapter content available.'}
        </div>

        <div className="d-flex justify-content-between gap-2 mt-4">
          <button className="btn btn-outline-secondary" type="button" onClick={onPrev}>
            Previous
          </button>
          <button className="btn btn-brand" type="button" onClick={onNext}>
            Next
          </button>
        </div>
      </div>
    </article>
  );
}