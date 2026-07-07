import { useCallback, useEffect, useState } from 'react';

import API from '../services/api';

function SummarySkeleton() {
  return (
    <div className="placeholder-glow" aria-hidden="true">
      <span className="placeholder col-12 mb-2" />
      <span className="placeholder col-11 mb-2" />
      <span className="placeholder col-10 2mb-2" />
      <span className="placeholder col-9" />
    </div>
  );
}

function AIChapterSummary({ chapterId }) {
  const [summary, setSummary] = useState('');
  const [generatedAt, setGeneratedAt] = useState(null);
  const [cached, setCached] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const loadSummary = useCallback(async (regenerate = false) => {
    if (!chapterId) {
      return;
    }

    try {
      setLoading(true);
      setError('');
      const response = await API.ai.generateSummary(chapterId, regenerate);
      setSummary(response.summary || '');
      setGeneratedAt(response.generated_at || null);
      setCached(Boolean(response.cached));
    } catch (err) {
      setError(err?.response?.data?.message || 'Không thể tạo tóm tắt. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  }, [chapterId]);

  useEffect(() => {
    setSummary('');
    setGeneratedAt(null);
    setCached(false);
    setError('');
  }, [chapterId]);

  const handleCopy = async () => {
    if (!summary) {
      return;
    }
    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError('Không thể sao chép vào clipboard.');
    }
  };

  return (
    <section className="card border-0 shadow-sm ai-summary-card">
      <div className="card-body p-4 p-lg-5">
        <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-3">
          <div>
            <p className="text-uppercase text-muted small mb-1">Tóm tắt AI</p>
            <h5 className="mb-0">Tóm tắt chương</h5>
          </div>
          <div className="d-flex gap-2 flex-wrap">
            {!summary && !loading ? (
              <button className="btn btn-brand btn-sm" type="button" onClick={() => loadSummary(false)}>
                Tạo tóm tắt
              </button>
            ) : null}
            {summary ? (
              <>
                <button className="btn btn-outline-secondary btn-sm" type="button" onClick={handleCopy}>
                  {copied ? 'Đã sao chép' : 'Sao chép'}
                </button>
                <button className="btn btn-outline-primary btn-sm" type="button" onClick={() => loadSummary(true)}>
                  Tạo lại
                </button>
              </>
            ) : null}
          </div>
        </div>

        {loading ? <SummarySkeleton /> : null}

        {!loading && error ? <div className="alert alert-warning mb-0">{error}</div> : null}

        {!loading && !error && summary ? (
          <>
            <p className="mb-0 text-secondary" style={{ whiteSpace: 'pre-line' }}>{summary}</p>
            <div className="d-flex flex-wrap gap-2 align-items-center mt-3 text-muted small">
              {cached ? <span className="badge text-bg-success">Đã lưu cache</span> : <span className="badge text-bg-info">Mới tạo</span>}
              {generatedAt ? (
                <span>
                  Tạo lúc:
                  {' '}
                  {new Date(generatedAt).toLocaleString('vi-VN')}
                </span>
              ) : null}
            </div>
          </>
        ) : null}

        {!loading && !error && !summary ? (
          <p className="text-muted mb-0">
            Nhấn &quot;Tạo tóm tắt&quot; để AI tóm tắt chương này bằng tiếng Việt (Gemini).
          </p>
        ) : null}
      </div>
    </section>
  );
}

export default AIChapterSummary;
