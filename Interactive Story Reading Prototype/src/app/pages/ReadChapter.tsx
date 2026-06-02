import { Link, useParams } from 'react-router';
import { getStoryById, getChapterById, getChaptersByStoryId } from '../data/mockData';
import { ChevronLeft, ChevronRight, List, Settings } from 'lucide-react';

export default function ReadChapter() {
  const { storyId, chapterId } = useParams<{ storyId: string; chapterId: string }>();
  const story = getStoryById(storyId!);
  const chapter = getChapterById(chapterId!);
  const allChapters = getChaptersByStoryId(storyId!);

  if (!story || !chapter) {
    return (
      <div className="wireframe-card text-center py-12">
        <p className="wireframe-text">Chapter not found</p>
        <Link to="/" className="wireframe-button-secondary mt-4 inline-block">
          Back to Home
        </Link>
      </div>
    );
  }

  const currentIndex = allChapters.findIndex(ch => ch.id === chapterId);
  const previousChapter = currentIndex > 0 ? allChapters[currentIndex - 1] : null;
  const nextChapter = currentIndex < allChapters.length - 1 ? allChapters[currentIndex + 1] : null;

  return (
    <div className="space-y-6">
      <div className="wireframe-card flex items-center justify-between">
        <Link to={`/story/${storyId}`} className="wireframe-button-secondary flex items-center gap-2">
          <ChevronLeft size={18} />
          Back to Story
        </Link>
        <div className="text-center">
          <h2 className="wireframe-card-title">{story.title}</h2>
          <p className="wireframe-text text-sm">Chapter {chapter.number}: {chapter.title}</p>
        </div>
        <button className="wireframe-button-secondary flex items-center gap-2">
          <Settings size={18} />
          Settings
        </button>
      </div>

      <div className="wireframe-card">
        <div className="flex items-center justify-between mb-6 pb-4 border-b-2 border-gray-300">
          <div>
            <h1 className="wireframe-heading">Chapter {chapter.number}</h1>
            <h2 className="wireframe-section-title mt-1">{chapter.title}</h2>
          </div>
          <div className="text-sm text-gray-600">
            Published: {chapter.publishedDate}
          </div>
        </div>

        <div className="wireframe-reader-content prose max-w-none">
          {chapter.content.split('\n\n').map((paragraph, index) => (
            <p key={index} className="wireframe-text mb-4 leading-relaxed">
              {paragraph}
            </p>
          ))}
        </div>

        <div className="mt-8 pt-6 border-t-2 border-gray-300">
          <div className="flex items-center justify-between">
            {previousChapter ? (
              <Link
                to={`/read/${storyId}/${previousChapter.id}`}
                className="wireframe-button-secondary flex items-center gap-2"
              >
                <ChevronLeft size={18} />
                <div className="text-left">
                  <p className="text-xs">Previous</p>
                  <p className="font-bold">Chapter {previousChapter.number}</p>
                </div>
              </Link>
            ) : (
              <div className="wireframe-button-secondary opacity-50 cursor-not-allowed">
                <ChevronLeft size={18} />
                <span>No Previous Chapter</span>
              </div>
            )}

            <Link
              to={`/story/${storyId}`}
              className="wireframe-button-secondary flex items-center gap-2"
            >
              <List size={18} />
              Chapter List
            </Link>

            {nextChapter ? (
              <Link
                to={`/read/${storyId}/${nextChapter.id}`}
                className="wireframe-button-primary flex items-center gap-2"
              >
                <div className="text-right">
                  <p className="text-xs">Next</p>
                  <p className="font-bold">Chapter {nextChapter.number}</p>
                </div>
                <ChevronRight size={18} />
              </Link>
            ) : (
              <div className="wireframe-button-secondary opacity-50 cursor-not-allowed">
                <span>No Next Chapter</span>
                <ChevronRight size={18} />
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="wireframe-card">
        <h3 className="wireframe-section-title mb-4">Chapter Navigation</h3>
        <div className="grid grid-cols-5 gap-2">
          {allChapters.slice(0, 20).map((ch) => (
            <Link
              key={ch.id}
              to={`/read/${storyId}/${ch.id}`}
              className={`wireframe-list-item text-center ${
                ch.id === chapterId ? 'border-gray-700 bg-gray-200' : ''
              }`}
            >
              <span className="text-sm font-bold">Ch {ch.number}</span>
            </Link>
          ))}
          {allChapters.length > 20 && (
            <div className="wireframe-list-item text-center">
              <span className="text-sm">+{allChapters.length - 20}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
