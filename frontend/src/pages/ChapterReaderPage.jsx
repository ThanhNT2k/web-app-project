import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import AIChapterSummary from '../components/AIChapterSummary';
import ReadingScrollProgress from '../components/ReadingScrollProgress';
import CommentSection from '../components/CommentSection';
import ReadingProgress from '../components/ReadingProgress';
import StoryReader, { loadReaderPrefs } from '../components/StoryReader';
import API from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { mockChapter } from '../data/mockStories';

const AUTOSAVE_INTERVAL_MS = 30000;
const BOOKMARK_KEY = 'cmc_bookmarks';

function getBookmarks() {
  try {
    return JSON.parse(localStorage.getItem(BOOKMARK_KEY) || '[]');
  } catch {
    return [];
  }
}

function ChapterReaderPage() {
  const { storyId, chapterId } = useParams();
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
  const [bookmarked, setBookmarked] = useState(false);
  const [autoBookmark, setAutoBookmark] = useState(true);
  const readTimeRef = useRef(0);
  const scrollRef = useRef(0);
  // Tracks whether we have already performed the initial bookmark save for
  // the current chapter so we don't double-save when autoBookmark loads async.
  const hasInitialSavedRef = useRef(false);

  const chapterNumericId = useMemo(() => chapter?.id || chapterId, [chapter, chapterId]);

  useEffect(() => {
    const prefs = loadReaderPrefs();
    if (prefs) {
      if (prefs.fontSize) setFontSize(prefs.fontSize);
      if (prefs.lineSpacing) setLineSpacing(prefs.lineSpacing);
      if (prefs.fontFamily) setFontFamily(prefs.fontFamily);
    }
    setBookmarked(getBookmarks().includes(String(chapterId)));
    // Reset the initial-save flag whenever the user navigates to a new chapter.
    hasInitialSavedRef.current = false;
  }, [chapterId]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError('');
        const [chapterResponse, chaptersResponse] = await Promise.all([
          API.chapters.getById(storyId, chapterId),
          API.chapters.getByStory(storyId, 1),
        ]);
        setChapter(chapterResponse.chapter || chapterResponse);
        setChapters(chaptersResponse.chapters || []);
      } catch {
        setChapter(mockChapter);
        setChapters([]);
        setError('Không tải được chương từ API. Hiển thị dữ liệu mẫu.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [storyId, chapterId]);

  useEffect(() => {
    if (!isAuthenticated) return;

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

    API.readingHistory.getStoryProgress(storyId)
      .then((res) => setStoryProgress(res.progress || null))
      .catch(() => setStoryProgress(null));
  }, [isAuthenticated, storyId]);

  const saveProgress = useCallback(async () => {
    if (!isAuthenticated || !chapter) {
      return;
    }

    // chapter.id comes from the API response; chapterId is the URL param string.
    // Prefer chapter.id (authoritative DB id), fall back to URL param.
    const resolvedChapterId = Number(chapter.id || chapterId);
    if (!resolvedChapterId || !Number.isFinite(resolvedChapterId)) {
      return; // Cannot save without a valid chapter id
    }

    try {
      const response = await API.readingHistory.save({
        story_id: Number(storyId),
        chapter_id: resolvedChapterId,
        // Guard against NaN / Infinity from scroll / timer refs
        read_position: Number.isFinite(scrollRef.current) ? Math.round(scrollRef.current) : 0,
        read_time: Number.isFinite(readTimeRef.current) ? Math.round(readTimeRef.current) : 0,
      });
      setStoryProgress(response.progress || null);
      readTimeRef.current = 0;
    } catch {
      // silent — network errors should not surface to the user here
    }
  // chapterId added back intentionally as a string-safe fallback; it does NOT
  // cause double-saves because hasInitialSavedRef prevents that.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, chapter, storyId, chapterId]);

  // Initial bookmark save — fires once per chapter load, after a short delay
  // so the user has actually opened the chapter (not just navigated through).
  useEffect(() => {
    if (!isAuthenticated || !chapter || !autoBookmark) return;
    if (hasInitialSavedRef.current) return;

    const timer = setTimeout(() => {
      hasInitialSavedRef.current = true;
      saveProgress();
    }, 1000);

    return () => clearTimeout(timer);
  // Only re-run when chapter identity or autoBookmark flag changes.
  // saveProgress is intentionally excluded — it is stable within a chapter.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, chapter?.id, autoBookmark]);

  useEffect(() => {
    if (!isAuthenticated) {
      return undefined;
    }

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

  // Keyboard navigation: ArrowLeft = previous chapter, ArrowRight = next chapter
  useEffect(() => {
    const onKeyDown = (e) => {
      // Don't trigger when user is typing in an input/textarea/contenteditable
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chapterIndex, chapters, chapter]);

  const chapterIndex = useMemo(
    () => chapters.findIndex((c) => String(c.id) === String(chapter?.id)),
    [chapters, chapter]
  );

  const goToChapter = (targetId) => {
    navigate(`/story/${storyId}/chapter/${targetId}`);
  };

  const handlePrevious = () => {
    if (chapterIndex > 0) {
      goToChapter(chapters[chapterIndex - 1].id);
      return;
    }
    const num = Number(chapter?.chapter_number || 1);
    if (num > 1) {
      navigate(`/story/${storyId}/chapter/${num - 1}`);
    }
  };

  const handleNext = () => {
    if (chapterIndex >= 0 && chapterIndex < chapters.length - 1) {
      goToChapter(chapters[chapterIndex + 1].id);
    }
  };

  const handleToggleBookmark = () => {
    const key = String(chapterId);
    let list = getBookmarks();
    if (list.includes(key)) {
      list = list.filter((id) => id !== key);
      setBookmarked(false);
    } else {
      list = [...list, key];
      setBookmarked(true);
    }
    localStorage.setItem(BOOKMARK_KEY, JSON.stringify(list));
  };

  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';

  if (loading) {
    return <main className="cmc-main"><p className="loading-text">Đang tải chương...</p></main>;
  }

  if (!chapter) {
    return <main className="cmc-main"><p>Không tìm thấy chương.</p></main>;
  }

  return (
    <main className="cmc-main">
      <ReadingScrollProgress />
      <div className="reader-top-bar">
        <Link to={`/story/${storyId}`} className="btn-cmc btn-cmc-outline btn-sm">
          ← Về truyện
        </Link>
        <div className="d-flex align-items-center gap-2">
          <span className="keyboard-hint" title="Dùng phím ← → để chuyển chương">
            ⌨️ <kbd>←</kbd> <kbd>→</kbd>
          </span>
          <button
            type="button"
            className="btn-cmc btn-cmc-outline btn-sm"
            onClick={() => navigator.clipboard?.writeText(shareUrl).then(() => alert('Đã copy link!'))}
          >
            Chia sẻ
          </button>
        </div>
      </div>

      {error ? <div className="alert-cmc alert-cmc-warning">{error}</div> : null}

      {isAuthenticated && storyProgress ? (
        <ReadingProgress progress={storyProgress} storyId={storyId} />
      ) : null}

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
        bookmarked={bookmarked}
        onToggleBookmark={handleToggleBookmark}
      />

      <div className="mt-4">
        <AIChapterSummary chapterId={chapterNumericId} />
      </div>

      <div className="mt-4">
        <CommentSection
          key={`chapter-comments-${storyId}-${chapterNumericId}`}
          storyId={storyId}
          chapterId={chapterNumericId}
          mode="chapter"
        />
      </div>
    </main>
  );
}

export default ChapterReaderPage;
