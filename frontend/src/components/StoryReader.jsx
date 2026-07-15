import { useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon, faArrowLeft, faArrowRight, faCircleInfo } from '../lib/icons';

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
    <section className="story-reader reader-shell mx-auto px-2 px-sm-3 px-md-5 py-4" style={{ maxWidth: '1000px' }}>
      
      <div className="mb-4">
        <div className="reader-breadcrumb mb-3">
          <Link to="/" className="reader-link">Trang Chủ</Link>
          <span className="mx-2">/</span>
          {storyDetailPath ? (
            <Link to={storyDetailPath} className="reader-link">{chapter.story_title}</Link>
          ) : (
            <span className="reader-link">{chapter.story_title}</span>
          )}
          <span className="mx-2">/</span>
          <span className="reader-current">Chương {chapter.chapter_number}</span>
        </div>

        <h2 className="reader-title mb-2">
          {chapter.story_title} - Chương {chapter.chapter_number} 
          <span className="reader-updated ms-2">
            (Cập nhật lúc: {currentDate})
          </span>
        </h2>
      </div>

      <div 
        className="reader-keyboard-hint text-center py-3 mb-4 rounded" 
      >
        <i><FontAwesomeIcon className="me-2" icon={faCircleInfo} />Sử dụng mũi tên trái hoặc phải để chuyển chapter</i>
      </div>

      <div className="reader-nav-actions d-flex justify-content-center gap-2 mb-4">
        <button
          className="btn reader-nav-button px-4 py-2"
          onClick={onPrevious}
          disabled={!hasPrevious}
        >
          <FontAwesomeIcon icon={faArrowLeft} /> Chap trước
        </button>
        <button
          className="btn reader-nav-button px-4 py-2"
          onClick={onNext}
          disabled={!hasNext}
        >
          Chap sau <FontAwesomeIcon icon={faArrowRight} />
        </button>
      </div>

      <div className="reader-toolbar rounded p-3 mb-4 d-flex flex-wrap gap-4 align-items-center justify-content-center">
        {chapters.length > 0 && onChapterSelect ? (
          <select
            className="form-select form-select-sm reader-select reader-chapter-select"
            value={chapter.id || ''}
            onChange={(e) => onChapterSelect(e.target.value)}
          >
            {chapter.id && !chapters.find(c => Number(c.id) === Number(chapter.id)) && (
              <option key={chapter.id} value={chapter.id}>
                Ch. {chapter.chapter_number}: {chapter.title}
              </option>
            )}
            {chapters.map((item) => (
              <option key={item.id} value={item.id}>
                Ch. {item.chapter_number}: {item.title}
              </option>
            ))}
          </select>
        ) : null}

        <div className="d-flex align-items-center gap-2 small mb-0">
          <span className="reader-toolbar-label fw-medium">Cỡ chữ</span>
          <div className="btn-group btn-group-sm reader-stepper">
            <button className="btn reader-step-button px-2" onClick={() => setFontSize(Math.max(14, fontSize - 1))} disabled={fontSize <= 14}>-</button>
            <span className="reader-step-value px-3">{fontSize}</span>
            <button className="btn reader-step-button px-2" onClick={() => setFontSize(Math.min(28, fontSize + 1))} disabled={fontSize >= 28}>+</button>
          </div>
        </div>

        <div className="d-flex align-items-center gap-2 small mb-0">
          <span className="reader-toolbar-label fw-medium">Giãn dòng</span>
          <div className="btn-group btn-group-sm reader-stepper">
            <button className="btn reader-step-button px-2" onClick={() => setLineSpacing(Math.max(1.2, parseFloat((lineSpacing - 0.1).toFixed(1))))} disabled={lineSpacing <= 1.2}>-</button>
            <span className="reader-step-value reader-step-value-wide px-3">{lineSpacing.toFixed(1)}</span>
            <button className="btn reader-step-button px-2" onClick={() => setLineSpacing(Math.min(2.4, parseFloat((lineSpacing + 0.1).toFixed(1))))} disabled={lineSpacing >= 2.4}>+</button>
          </div>
        </div>

        <select
          className="form-select form-select-sm reader-select reader-font-select"
          value={fontFamily}
          onChange={(e) => setFontFamily(e.target.value)}
        >
          {FONT_FAMILIES.map((f) => (
            <option key={f.value} value={f.value}>{f.label}</option>
          ))}
        </select>
      </div>

      <div className="reader-content-card panel-card mb-5">
        <div className="reader-content-body p-3 p-sm-4 p-lg-5">
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

      <div className="reader-nav-actions d-flex justify-content-center gap-2 mb-5">
        <button className="btn reader-nav-button px-4 py-2" onClick={onPrevious} disabled={!hasPrevious}><FontAwesomeIcon icon={faArrowLeft} /> Chap trước</button>
        <button className="btn reader-nav-button px-4 py-2" onClick={onNext} disabled={!hasNext}>Chap sau <FontAwesomeIcon icon={faArrowRight} /></button>
      </div>

      {/* --- PHỤC HỒI THANH ĐIỀU HƯỚNG NỔI (FLOATING NAV) --- */}
      <div className="floating-reader-nav">
        <button
          className="btn reader-floating-button d-flex align-items-center justify-content-center"
          onClick={onPrevious}
          type="button"
          disabled={!hasPrevious}
        >
          <FontAwesomeIcon icon={faArrowLeft} />
        </button>

        <select
          className="form-select reader-floating-select"
          value={chapter.id || ''}
          onChange={(e) => onChapterSelect(e.target.value)}
        >
          {chapter.id && !chapters.find(c => Number(c.id) === Number(chapter.id)) && (
            <option key={chapter.id} value={chapter.id}>
              Chương {chapter.chapter_number}
            </option>
          )}
          {chapters.map((item) => (
            <option key={item.id} value={item.id}>
              Chương {item.chapter_number}
            </option>
          ))}
        </select>

        <button
          className="btn reader-floating-button d-flex align-items-center justify-content-center"
          onClick={onNext}
          type="button"
          disabled={!hasNext}
        >
          <FontAwesomeIcon icon={faArrowRight} />
        </button>
      </div>

    </section>
  );
}

export { READER_PREFS_KEY, loadReaderPrefs, saveReaderPrefs };
export default StoryReader;
