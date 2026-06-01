export default function AIChapterSummary({ summary, loading }: { summary?: string | null; loading?: boolean }) {
  return (
    <aside className="card border-0 shadow-sm bg-gradient-to-br from-brand-50 to-white dark:from-slate-900 dark:to-slate-950">
      <div className="card-body p-4">
        <h3 className="h6 fw-bold mb-2">AI Summary</h3>
        {loading ? <p className="mb-0 text-muted">Generating summary...</p> : <p className="mb-0 text-secondary">{summary || 'No summary available for this chapter yet.'}</p>}
      </div>
    </aside>
  );
}