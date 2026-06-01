import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import AIChapterSummary from '../components/AIChapterSummary';
import StoryReader from '../components/StoryReader';
import { chapters as chapterApi } from '../services/api';
import type { Chapter, Story } from '../types';

export default function ChapterReaderPage() {
  const { storyId, chapterId } = useParams();
  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [story, setStory] = useState<Story | null>(null);
  const [storyChapters, setStoryChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function loadChapter() {
      if (!storyId || !chapterId) {
        return;
      }

      setLoading(true);
      setError('');

      try {
        const [chapterResponse, listResponse] = await Promise.all([
          chapterApi.getById(storyId, chapterId),
          chapterApi.getByStory(storyId, 1),
        ]);

        const loadedChapter = chapterResponse.chapter || null;
        if (!cancelled) {
          setChapter(loadedChapter);
          setStory(
            loadedChapter
              ? {
                  id: loadedChapter.story_id_ref || Number(storyId),
                  title: loadedChapter.story_title || '',
                  slug: loadedChapter.story_slug || '',
                  author_id: 0,
                  description: loadedChapter.story_description || null,
                  cover_image_url: loadedChapter.story_cover_image_url || null,
                  category: loadedChapter.story_category || null,
                  status: loadedChapter.story_status || null,
                  total_chapters: loadedChapter.story_total_chapters || 0,
                }
              : null
          );
          setStoryChapters(listResponse.chapters || []);
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : 'Failed to load chapter');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadChapter();

    return () => {
      cancelled = true;
    };
  }, [storyId, chapterId]);

  const chapterIndex = useMemo(() => storyChapters.findIndex((item) => String(item.id) === String(chapterId)), [storyChapters, chapterId]);
  const previousChapter = chapterIndex > 0 ? storyChapters[chapterIndex - 1] : null;
  const nextChapter = chapterIndex >= 0 && chapterIndex < storyChapters.length - 1 ? storyChapters[chapterIndex + 1] : null;

  if (loading) {
    return <div className="container py-5 text-center">Loading chapter...</div>;
  }

  if (error) {
    return <div className="container py-5"><div className="alert alert-danger">{error}</div></div>;
  }

  if (!chapter) {
    return <div className="container py-5"><div className="alert alert-warning">Chapter not found</div></div>;
  }

  return (
    <div className="container py-4 py-md-5">
      <div className="mb-3">
        <Link to={`/story/${storyId}`} className="text-decoration-none">← Back to story</Link>
      </div>

      <StoryReader story={story} chapter={chapter} onPrev={previousChapter ? () => window.location.assign(`/story/${storyId}/chapter/${previousChapter.id}`) : undefined} onNext={nextChapter ? () => window.location.assign(`/story/${storyId}/chapter/${nextChapter.id}`) : undefined} />

      <div className="row g-4 mt-4">
        <div className="col-lg-8">
          <AIChapterSummary summary={`Summary for chapter ${chapter.chapter_number} of ${story?.title || 'this story'}.`} />
        </div>
      </div>
    </div>
  );
}