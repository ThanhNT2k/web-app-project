import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import AIChapterSummary from '../components/AIChapterSummary';
import ReadingScrollProgress from '../components/ReadingScrollProgress';
import CommentSection from '../components/CommentSection';
import StoryReader, { loadReaderPrefs } from '../components/StoryReader';
import ReportModal from '../components/ReportModal';
import API from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { mockChapter } from '../data/mockStories';

const AUTOSAVE_INTERVAL_MS = 30000;

function ChapterReaderPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { storySlug, chapterNumber } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  
  const [chapter, setChapter] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [storyProgress, setStoryProgress] = useState(null);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [fontSize, setFontSize] = useState(18);
  const [lineSpacing, setLineSpacing] = useState(1.6);
  const [fontFamily, setFontFamily] = useState('Inter, sans-serif');
  const [autoBookmark, setAutoBookmark] = useState(true);
  
  const readTimeRef = useRef(0);
  const scrollRef = useRef(0);
  const hasInitialSavedRef = useRef(false);

  const chapterNumericId = useMemo(() => chapter?.id || null, [chapter]);

  useEffect(() => {
    const prefs = loadReaderPrefs();
    if (prefs) {
      if (prefs.fontSize) setFontSize(prefs.fontSize);
      if (prefs.lineSpacing) setLineSpacing(prefs.lineSpacing);
      if (prefs.fontFamily) setFontFamily(prefs.fontFamily);
    }
    hasInitialSavedRef.current = false;
  }, [chapterNumber]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError('');
        const chapterResponse = await API.chapters.getBySlugAndNumber(storySlug, chapterNumber);
        const resolvedChapter = chapterResponse.chapter || chapterResponse;
        setChapter(resolvedChapter);

        const chaptersResponse = await API.chapters.getByStory(resolvedChapter.story_id, 1, 100);
        setChapters(chaptersResponse.chapters || []);
      } catch (err) {
        setChapter(mockChapter);
        setChapters([]);
        if (err?.response?.status === 404) {
          setError('Chương truyện không tồn tại hoặc đã bị ẩn.');
        } else {
          setError('Không tải được chương từ máy chủ. Đang hiển thị chương mô phỏng.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [storySlug, chapterNumber]);

  useEffect(() => {
    if (chapter && chapter.story_id && chapter.story_slug) {
      const canonicalStorySlug = `${chapter.story_id}-${chapter.story_slug}`;
      if (storySlug !== canonicalStorySlug) {
        navigate(`/${canonicalStorySlug}/${chapterNumber}`, { replace: true });
      }
    }
  }, [chapter, storySlug, chapterNumber, navigate]);

  useEffect(() => {
    if (!isAuthenticated || !chapter?.story_id) return;

    API.preferences.get()
      .then((res) => {
        const p = res.preferences;
        if (!p) return;
        setAutoBookmark(p.auto_bookmark !== false);
        if (p.font_size) setFontSize(p.font_size);
        if (p.line_spacing) setLineSpacing(Number(p.line_spacing));
        if (p.font_family) setFontFamily(p.font_family);
      })
      .catch(() => {});

    API.readingHistory.getStoryProgress(chapter.story_id)
      .then((res) => setStoryProgress(res.progress || null))
      .catch(() => setStoryProgress(null));
  }, [isAuthenticated, chapter?.story_id]);

  const saveProgress = useCallback(async () => {
    if (!isAuthenticated || !chapter) return;

    const resolvedChapterId = Number(chapter.id);
    if (!resolvedChapterId || !Number.isFinite(resolvedChapterId)) return;

    try {
      const response = await API.readingHistory.save({
        story_id: Number(chapter.story_id),
        chapter_id: resolvedChapterId,
        read_position: Number.isFinite(scrollRef.current) ? Math.round(scrollRef.current) : 0,
        read_time: Number.isFinite(readTimeRef.current) ? Math.round(readTimeRef.current) : 0,
      });
      setStoryProgress(response.progress || null);
      readTimeRef.current = 0;
    } catch {
      // silent
    }
  }, [isAuthenticated, chapter]);

  useEffect(() => {
    if (!isAuthenticated || !chapter || !autoBookmark) return;
    if (hasInitialSavedRef.current) return;

    const timer = setTimeout(() => {
      hasInitialSavedRef.current = true;
      saveProgress();
    }, 1000);

    return () => clearTimeout(timer);
  }, [isAuthenticated, chapter?.id, autoBookmark, saveProgress]);

  useEffect(() => {
    if (!isAuthenticated) return undefined;

    const onScroll = () => {
      scrollRef.current = Math.round(window.scrollY);
    };
    window.addEventListener('scroll', onScroll, { passive: true });

    const tick = setInterval(() => {
      readTimeRef.current += 1;
    }, 1000);

    const autosave = setInterval(() => {
      saveProgress();
    }, AUTOSAVE_INTERVAL_MS);

    return () => {
      window.removeEventListener('scroll', onScroll);
      clearInterval(tick);
      clearInterval(autosave);
      saveProgress();
    };
  }, [isAuthenticated, saveProgress]);

  const chapterIndex = useMemo(
    () => chapters.findIndex((c) => String(c.id) === String(chapter?.id)),
    [chapters, chapter]
  );

  const goToChapter = (targetChapterNumber) => {
    navigate(`/${storySlug}/${targetChapterNumber}`);
  };

  const handlePrevious = () => {
    if (chapterIndex > 0) {
      goToChapter(chapters[chapterIndex - 1].chapter_number);
      return;
    }
    const num = Number(chapter?.chapter_number || 1);
    if (num > 1) {
      goToChapter(num - 1);
    }
  };

  const handleNext = () => {
    if (chapterIndex >= 0 && chapterIndex < chapters.length - 1) {
      goToChapter(chapters[chapterIndex + 1].chapter_number);
    }
  };

  useEffect(() => {
    const onKeyDown = (e) => {
      const tag = document.activeElement?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || document.activeElement?.isContentEditable) return;

      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrevious();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleNext();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [chapterIndex, chapters, chapter]);

  if (loading) {
    return (
      <main className="cmc-main animate-pulse">
        <div className="panel-card p-4 p-lg-5" style={{ background: 'var(--surface)', borderRadius: '16px' }}>
          <div className="skeleton-box mb-3" style={{ height: '30px', width: '40%', borderRadius: '6px' }} />
          <div className="skeleton-box mb-4" style={{ height: '20px', width: '25%', borderRadius: '6px' }} />
          <hr />
          <div className="skeleton-box mb-3" style={{ height: '16px', width: '100%', borderRadius: '4px' }} />
          <div className="skeleton-box mb-3" style={{ height: '16px', width: '95%', borderRadius: '4px' }} />
          <div className="skeleton-box mb-3" style={{ height: '16px', width: '98%', borderRadius: '4px' }} />
        </div>
      </main>
    );
  }

  if (!chapter) {
    return (
      <main className="cmc-main">
        {error ? (
          <div className="alert-cmc alert-cmc-warning">{error}</div>
        ) : (
          <p>Không tìm thấy chương.</p>
        )}
      </main>
    );
  }

  return (
    <main className="cmc-main px-0 px-md-3">
      {/* Nút báo cáo được dời gọn lên sát góc phải */}
      <div className="container-fluid mb-2 d-flex justify-content-end px-0">
        <button className="btn btn-sm btn-outline-danger" onClick={() => setIsModalOpen(true)}>
          Báo cáo vi phạm
        </button>
      </div>

      {isModalOpen && (
        <ReportModal 
          storyId={chapter.story_id}
          chapterId={Number(chapter.id)} 
          onClose={() => setIsModalOpen(false)} 
        />
      )}

      <ReadingScrollProgress />

      {error ? <div className="alert-cmc alert-cmc-warning">{error}</div> : null}

      {/* Gọi trực tiếp StoryReader đã được nâng cấp */}
      <StoryReader
        chapter={chapter}
        chapters={chapters}
        onPrevious={handlePrevious}
        onNext={handleNext}
        onChapterSelect={goToChapter}
        fontSize={fontSize}
        setFontSize={setFontSize}
        lineSpacing={lineSpacing}
        setLineSpacing={setLineSpacing}
        fontFamily={fontFamily}
        setFontFamily={setFontFamily}
      />

      <div className="mt-4">
        <AIChapterSummary chapterId={chapterNumericId} />
      </div>

      <div className="mt-4">
        <CommentSection
          key={`chapter-comments-${chapter.story_id}-${chapterNumericId}`}
          storyId={chapter.story_id}
          chapterId={chapterNumericId}
          mode="chapter"
        />
      </div>
    </main>
  );
}

export default ChapterReaderPage;