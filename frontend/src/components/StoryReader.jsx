import { useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';

const FONT_FAMILIES = [
  { value: 'Inter, sans-serif', label: 'Inter' },
  { value: 'Georgia, serif', label: 'Georgia' },
  { value: '"Times New Roman", serif', label: 'Times' },
  { value: 'system-ui, sans-serif', label: 'System' },
];

const READER_PREFS_KEY = 'cmc_reader_prefs';

function loadReaderPrefs() {
  try {
    const raw = localStorage.getItem(READER_PREFS_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveReaderPrefs(prefs) {
  try {
    localStorage.setItem(READER_PREFS_KEY, JSON.stringify(prefs));
  } catch {
    // ignore
  }
}

function StoryReader({
  chapter,
  chapters = [],
  onPrevious,
  onNext,
  onChapterSelect,
  fontSize,
  setFontSize,
  lineSpacing,
  setLineSpacing,
  fontFamily,
  setFontFamily,
}) {

  const hasPrevious = useMemo(() => {
    if (!chapter || chapters.length === 0) {
      return Number(chapter?.chapter_number) > 1;
    }
    const idx = chapters.findIndex((c) => Number(c.id) === Number(chapter.id));
    return idx > 0;
  }, [chapter, chapters]);

  const hasNext = useMemo(() => {
    if (!chapter || chapters.length === 0) {
      return true;
    }
    const idx = chapters.findIndex((c) => Number(c.id) === Number(chapter.id));
    return idx >= 0 && idx < chapters.length - 1;
  }, [chapter, chapters]);

  useEffect(() => {
    const prefs = loadReaderPrefs();
    if (!prefs) {
      return;
    }
    if (prefs.fontSize && setFontSize) {
      setFontSize(prefs.fontSize);
    }
    if (prefs.lineSpacing && setLineSpacing) {
      setLineSpacing(prefs.lineSpacing);
    }
    if (prefs.fontFamily && setFontFamily) {
      setFontFamily(prefs.fontFamily);
    }
  }, [setFontSize, setLineSpacing, setFontFamily]);

  useEffect(() => {
    if (fontSize == null) {
      return;
    }
    saveReaderPrefs({ fontSize, lineSpacing, fontFamily });
  }, [fontSize, lineSpacing, fontFamily]);

  if (!chapter) {
    return null;
  }

  const storyDetailPath = chapter.story_id && chapter.story_slug
    ? `/story/${chapter.story_id}-${chapter.story_slug}`
    : null;

  const currentDate = new Date().toLocaleDateString('vi-VN', {
    hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric'
  });

  return (
    <section className="story-reader mx-auto px-3 px-md-5 py-4" style={{ maxWidth: '1000px' }}>
      
      <div className="mb-4">
        <div className="text-muted mb-3" style={{ fontSize: '15px' }}>
          <Link to="/" className="text-decoration-none text-dark hover-primary">Trang Chủ</Link>
          <span className="mx-2">/</span>
          {storyDetailPath ? (
            <Link to={storyDetailPath} className="text-decoration-none text-dark hover-primary">{chapter.story_title}</Link>
          ) : (
            <span className="text-dark">{chapter.story_title}</span>
          )}
          <span className="mx-2">/</span>
          <span>Chương {chapter.chapter_number}</span>
        </div>

        <h2 className="fw-normal mb-2" style={{ fontSize: '22px', color: '#333' }}>
          {chapter.story_title} - Chương {chapter.chapter_number} 
          <span className="text-muted ms-2" style={{ fontSize: '14px' }}>
            (Cập nhật lúc: {currentDate})
          </span>
        </h2>
      </div>

      <div 
        className="text-center py-3 mb-4 rounded" 
        style={{ backgroundColor: '#e5f3f8', color: '#4a7282', fontSize: '15px' }}
      >
        <i><span className="me-2" style={{fontWeight: 'bold'}}>ℹ</span>Sử dụng mũi tên trái (←) hoặc phải (→) để chuyển chapter</i>
      </div>

      <div className="d-flex justify-content-center gap-2 mb-4">
        <button
          className="btn px-4 py-2 text-white"
          onClick={onPrevious}
          disabled={!hasPrevious}
          style={{ backgroundColor: hasPrevious ? '#73b7d2' : '#d1d5db', border: 'none', borderRadius: '4px', fontWeight: '500' }}
        >
          ← Chap trước
        </button>
        <button
          className="btn px-4 py-2 text-white"
          onClick={onNext}
          disabled={!hasNext}
          style={{ backgroundColor: hasNext ? '#73b7d2' : '#d1d5db', border: 'none', borderRadius: '4px', fontWeight: '500' }}
        >
          Chap sau →
        </button>
      </div>

      <div className="reader-toolbar rounded p-3 mb-4 d-flex flex-wrap gap-4 align-items-center justify-content-center bg-light border">
        {chapters.length > 0 && onChapterSelect ? (
          <select
            className="form-select form-select-sm"
            style={{ maxWidth: '220px' }}
            value={chapter.id}
            onChange={(e) => onChapterSelect(e.target.value)}
          >
            {chapters.map((item) => (
              <option key={item.id} value={item.id}>
                Ch. {item.chapter_number}: {item.title}
              </option>
            ))}
          </select>
        ) : null}

        <div className="d-flex align-items-center gap-2 small mb-0">
          <span className="text-muted fw-medium">Cỡ chữ</span>
          <div className="btn-group btn-group-sm">
            <button className="btn btn-outline-secondary px-2" onClick={() => setFontSize(Math.max(14, fontSize - 1))} disabled={fontSize <= 14}>-</button>
            <span className="btn btn-outline-secondary disabled text-dark border-secondary px-3" style={{ opacity: 1 }}>{fontSize}</span>
            <button className="btn btn-outline-secondary px-2" onClick={() => setFontSize(Math.min(28, fontSize + 1))} disabled={fontSize >= 28}>+</button>
          </div>
        </div>

        <div className="d-flex align-items-center gap-2 small mb-0">
          <span className="text-muted fw-medium">Giãn dòng</span>
          <div className="btn-group btn-group-sm">
            <button className="btn btn-outline-secondary px-2" onClick={() => setLineSpacing(Math.max(1.2, parseFloat((lineSpacing - 0.1).toFixed(1))))} disabled={lineSpacing <= 1.2}>-</button>
            <span className="btn btn-outline-secondary disabled text-dark border-secondary px-3" style={{ opacity: 1, minWidth: '45px' }}>{lineSpacing.toFixed(1)}</span>
            <button className="btn btn-outline-secondary px-2" onClick={() => setLineSpacing(Math.min(2.4, parseFloat((lineSpacing + 0.1).toFixed(1))))} disabled={lineSpacing >= 2.4}>+</button>
          </div>
        </div>

        <select
          className="form-select form-select-sm"
          style={{ maxWidth: '140px' }}
          value={fontFamily}
          onChange={(e) => setFontFamily(e.target.value)}
        >
          {FONT_FAMILIES.map((f) => (
            <option key={f.value} value={f.value}>{f.label}</option>
          ))}
        </select>
      </div>

      <div className="card shadow-sm border-0 panel-card mb-5">
        <div className="card-body p-4 p-lg-5">
          <div
            className="chapter-content reader-content"
            style={{
              fontSize: `${fontSize}px`,
              lineHeight: lineSpacing,
              fontFamily,
            }}
          >
            {chapter.content}
          </div>
        </div>
      </div>

      <div className="d-flex justify-content-center gap-2 mb-5">
        <button className="btn px-4 py-2 text-white" onClick={onPrevious} disabled={!hasPrevious} style={{ backgroundColor: hasPrevious ? '#73b7d2' : '#d1d5db', border: 'none', borderRadius: '4px', fontWeight: '500' }}>← Chap trước</button>
        <button className="btn px-4 py-2 text-white" onClick={onNext} disabled={!hasNext} style={{ backgroundColor: hasNext ? '#73b7d2' : '#d1d5db', border: 'none', borderRadius: '4px', fontWeight: '500' }}>Chap sau →</button>
      </div>

      {/* --- PHỤC HỒI THANH ĐIỀU HƯỚNG NỔI (FLOATING NAV) --- */}
      <div className="floating-reader-nav">
        <button
          className={`btn ${hasPrevious ? 'btn-brand' : 'btn-outline-secondary'} d-flex align-items-center justify-content-center`}
          onClick={onPrevious}
          type="button"
          disabled={!hasPrevious}
          style={{ width: '40px', height: '40px', padding: '0', flexShrink: 0 }}
        >
          ←
        </button>

        <select
          className="form-select"
          value={chapter.id}
          onChange={(e) => onChapterSelect(e.target.value)}
          style={{ width: '180px', minWidth: '180px' }}
        >
          {chapters.map((item) => (
            <option key={item.id} value={item.id}>
              Chương {item.chapter_number}
            </option>
          ))}
        </select>

        <button
          className={`btn ${hasNext ? 'btn-brand' : 'btn-outline-secondary'} d-flex align-items-center justify-content-center`}
          onClick={onNext}
          type="button"
          disabled={!hasNext}
          style={{ width: '40px', height: '40px', padding: '0', flexShrink: 0 }}
        >
          →
        </button>
      </div>

    </section>
  );
}

export { READER_PREFS_KEY, loadReaderPrefs, saveReaderPrefs };
export default StoryReader;
