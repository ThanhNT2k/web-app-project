import { useState } from 'react';

type CommentItem = {
  id: number;
  author?: string;
  content: string;
};

export default function CommentSection({
  comments = [],
  onSubmit,
}: {
  comments?: CommentItem[];
  onSubmit?: (content: string) => Promise<void> | void;
}) {
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!content.trim()) {
      return;
    }

    if (onSubmit) {
      setIsSubmitting(true);
      await onSubmit(content.trim());
      setIsSubmitting(false);
    }

    setContent('');
  };

  return (
    <section className="card border-0 shadow-sm">
      <div className="card-body p-4 p-md-5">
        <h3 className="h5 fw-bold mb-3">Comments</h3>

        <form className="mb-4" onSubmit={handleSubmit}>
          <textarea
            className="form-control mb-3"
            rows={3}
            placeholder="Write a comment..."
            value={content}
            onChange={(event) => setContent(event.target.value)}
          />
          <button className="btn btn-brand" type="submit" disabled={isSubmitting || !onSubmit}>
            {isSubmitting ? 'Posting...' : 'Post comment'}
          </button>
          {!onSubmit ? <div className="form-text mt-2">Comments will connect once the backend endpoint is available.</div> : null}
        </form>

        <div className="d-grid gap-3">
          {comments.length === 0 ? (
            <p className="text-muted mb-0">No comments yet.</p>
          ) : (
            comments.map((comment) => (
              <div key={comment.id} className="p-3 rounded-3 bg-slate-50 dark:bg-slate-900">
                <div className="fw-semibold small mb-1">{comment.author || 'Reader'}</div>
                <div className="text-secondary">{comment.content}</div>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}