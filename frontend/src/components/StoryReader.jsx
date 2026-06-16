import { useEffect, useMemo } from 'react';

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

  return (
    <section className="story-reader panel-card">
      <div className="card-body p-4 p-lg-5">  
        <div className="d-flex justify-content-between flex-wrap gap-3 align-items-start mb-4">
          <div>
            <p className="text-uppercase text-muted small mb-1">
              Chương
              {' '}
              {chapter.chapter_number}
            </p>
            <h2 className="mb-1">{chapter.title}</h2>
            <p className="text-muted mb-0">{chapter.story_title}</p>
          </div>
          <div className="d-flex gap-2 flex-wrap">
            <button className={`btn ${hasPrevious ? 'btn-brand' : 'btn-outline-secondary'}`} onClick={onPrevious} type="button" disabled={!hasPrevious}>
              Trước
            </button>
            <button className={`btn ${hasNext ? 'btn-brand' : 'btn-outline-secondary'}`} onClick={onNext} type="button" disabled={!hasNext}>
              Sau 
            </button>
            </div>
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
          style={{
            width: '180px',
            minWidth: '180px'
          }}
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
          </div>

        {/* --- KHU VỰC TOOLBAR ĐƯỢC NÂNG CẤP --- */}
        <div className="reader-toolbar rounded-4 p-3 mb-4 d-flex flex-wrap gap-4 align-items-center">
          {chapters.length > 0 && onChapterSelect ? (
            <select
              className="form-select form-select-sm"
              style={{ maxWidth: '220px' }}
              value={chapter.id}
              onChange={(e) => onChapterSelect(e.target.value)}
              aria-label="Chọn chương"
            >
              {chapters.map((item) => (
                <option key={item.id} value={item.id}>
                  Ch.
                  {' '}
                  {item.chapter_number}
                  :
                  {' '}
                  {item.title}
                </option>
              ))}
            </select>
          ) : null}

          {/* Cụm nút chỉnh Cỡ chữ */}
          <div className="d-flex align-items-center gap-2 small mb-0">
            <span className="text-muted fw-medium">Cỡ chữ</span>
            <div className="btn-group btn-group-sm">
              <button 
                className="btn btn-outline-secondary px-2" 
                onClick={() => setFontSize(Math.max(14, fontSize - 1))}
                disabled={fontSize <= 14}
              >
                -
              </button>
              <span className="btn btn-outline-secondary disabled text-dark border-secondary px-3" style={{ opacity: 1 }}>
                {fontSize}
              </span>
              <button 
                className="btn btn-outline-secondary px-2" 
                onClick={() => setFontSize(Math.min(28, fontSize + 1))}
                disabled={fontSize >= 28}
              >
                +
              </button>
            </div>
          </div>

          {/* Cụm nút chỉnh Giãn dòng */}
          <div className="d-flex align-items-center gap-2 small mb-0">
            <span className="text-muted fw-medium">Giãn dòng</span>
            <div className="btn-group btn-group-sm">
              <button 
                className="btn btn-outline-secondary px-2" 
                onClick={() => setLineSpacing(Math.max(1.2, parseFloat((lineSpacing - 0.1).toFixed(1))))}
                disabled={lineSpacing <= 1.2}
              >
                -
              </button>
              <span className="btn btn-outline-secondary disabled text-dark border-secondary px-3" style={{ opacity: 1, minWidth: '45px' }}>
                {lineSpacing.toFixed(1)}
              </span>
              <button 
                className="btn btn-outline-secondary px-2" 
                onClick={() => setLineSpacing(Math.min(2.4, parseFloat((lineSpacing + 0.1).toFixed(1))))}
                disabled={lineSpacing >= 2.4}
              >
                +
              </button>
            </div>
          </div>

          <select
            className="form-select form-select-sm"
            style={{ maxWidth: '140px' }}
            value={fontFamily}
            onChange={(e) => setFontFamily(e.target.value)}
            aria-label="Font chữ"
          >
            {FONT_FAMILIES.map((f) => (
              <option key={f.value} value={f.value}>{f.label}</option>
            ))}
          </select>
        </div>
        {/* --- KẾT THÚC KHU VỰC TOOLBAR --- */}

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

       <div className="d-flex justify-content-between mt-5 pt-4 border-top">
          <button 
            className={`btn ${hasPrevious ? 'btn-brand' : 'btn-outline-secondary'} d-flex align-items-center justify-content-center`} 
            onClick={onPrevious} 
            type="button" 
            disabled={!hasPrevious}
            style={{ width: '40px', height: '40px', padding: '0', flexShrink: 0 }}
          >
            ←
          </button>
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
      </div>
    </section>
  );
}

export { READER_PREFS_KEY, loadReaderPrefs, saveReaderPrefs };
export default StoryReader;