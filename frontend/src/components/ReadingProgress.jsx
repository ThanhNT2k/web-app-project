import { Link } from 'react-router-dom';

function ReadingProgress({ progress, storySlug }) {
  if (!progress) {
    return null;
  }

  const completion = Math.round(Number(progress.completion_rate) || 0);
  const lastRead = progress.last_read_at
    ? new Date(progress.last_read_at).toLocaleString('vi-VN')
    : null;
  const chapterId = progress.last_chapter_read;
  const chapterNumber = progress.last_chapter_number || progress.chapter_number;

  return (
    <section className="card border-0 shadow-sm mb-4">
      <div className="card-body p-4">
        <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-2">
          <h6 className="mb-0">Tiến độ đọc</h6>
          <span className="text-muted small">{completion}%</span>
        </div>
        <div className="progress mb-3" style={{ height: '10px' }} role="progressbar" aria-valuenow={completion} aria-valuemin={0} aria-valuemax={100}>
          <div className="progress-bar bg-brand" style={{ width: `${completion}%` }} />
        </div>
        {lastRead ? <p className="text-muted small mb-3">Đọc lần cuối: {lastRead}</p> : null}
        {chapterId ? (
          <Link
            className="btn btn-brand btn-sm"
            to={`/${storySlug}/${chapterNumber}`}
          >
            Tiếp tục đọc
            {chapterNumber ? ` (Chương ${chapterNumber})` : ''}
          </Link>
        ) : null}
      </div>
    </section>
  );
}

export default ReadingProgress;
