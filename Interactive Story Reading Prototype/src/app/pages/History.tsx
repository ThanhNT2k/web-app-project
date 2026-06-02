import { Link } from 'react-router';
import { mockUser, getStoryById, getChapterById } from '../data/mockData';
import { Clock, BookOpen, ChevronRight, Trash2 } from 'lucide-react';

export default function History() {
  const historyWithDetails = mockUser.readingHistory.map(item => ({
    ...item,
    story: getStoryById(item.storyId),
    chapter: getChapterById(item.chapterId),
  })).filter(item => item.story && item.chapter);

  return (
    <div className="space-y-6">
      <div className="wireframe-section">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="wireframe-heading">Reading History</h1>
            <p className="wireframe-text mt-2">
              Your recent reading activity
            </p>
          </div>
          <button className="wireframe-button-secondary flex items-center gap-2">
            <Trash2 size={18} />
            Clear History
          </button>
        </div>
      </div>

      {historyWithDetails.length === 0 ? (
        <div className="wireframe-card text-center py-12">
          <Clock size={48} className="mx-auto mb-4 text-gray-400" />
          <p className="wireframe-text mb-4">No reading history yet</p>
          <Link to="/search" className="wireframe-button-primary">
            Start Reading
          </Link>
        </div>
      ) : (
        <>
          <div className="wireframe-card">
            <h2 className="wireframe-section-title mb-4">Continue Reading</h2>
            <div className="space-y-3">
              {historyWithDetails.map((item) => (
                <div key={item.chapterId} className="wireframe-list-item">
                  <div className="flex items-center gap-4">
                    <div className="wireframe-image-placeholder w-16 h-20 flex-shrink-0">
                      <span className="text-xs">Cover</span>
                    </div>
                    <div className="flex-1">
                      <Link
                        to={`/story/${item.storyId}`}
                        className="font-bold hover:underline"
                      >
                        {item.story!.title}
                      </Link>
                      <p className="wireframe-text text-sm mt-1">
                        Last read: Chapter {item.chapter!.number} - {item.chapter!.title}
                      </p>
                      <p className="wireframe-text text-xs mt-1 text-gray-500">
                        {item.date}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Link
                        to={`/read/${item.storyId}/${item.chapterId}`}
                        className="wireframe-button-primary flex items-center gap-2"
                      >
                        Continue
                        <ChevronRight size={16} />
                      </Link>
                      <button className="wireframe-button-secondary">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="wireframe-card">
            <h2 className="wireframe-section-title mb-4">Reading Statistics</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="wireframe-card bg-gray-50 text-center">
                <div className="flex items-center justify-center mb-2">
                  <BookOpen size={24} />
                </div>
                <p className="text-2xl font-bold">{historyWithDetails.length}</p>
                <p className="wireframe-text text-sm">Stories Started</p>
              </div>
              <div className="wireframe-card bg-gray-50 text-center">
                <div className="flex items-center justify-center mb-2">
                  <Clock size={24} />
                </div>
                <p className="text-2xl font-bold">24</p>
                <p className="wireframe-text text-sm">Chapters Read</p>
              </div>
              <div className="wireframe-card bg-gray-50 text-center">
                <div className="flex items-center justify-center mb-2">
                  <span className="text-2xl">📚</span>
                </div>
                <p className="text-2xl font-bold">8h</p>
                <p className="wireframe-text text-sm">Time Spent</p>
              </div>
              <div className="wireframe-card bg-gray-50 text-center">
                <div className="flex items-center justify-center mb-2">
                  <span className="text-2xl">🔥</span>
                </div>
                <p className="text-2xl font-bold">7</p>
                <p className="wireframe-text text-sm">Day Streak</p>
              </div>
            </div>
          </div>

          <div className="wireframe-card">
            <h2 className="wireframe-section-title mb-4">Reading Activity (Last 7 Days)</h2>
            <div className="wireframe-chart h-48 flex items-end justify-around gap-2">
              {[3, 5, 2, 8, 4, 6, 7].map((height, index) => (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <div
                    className="w-full bg-gray-300 border-2 border-gray-600"
                    style={{ height: `${height * 10}%` }}
                  />
                  <span className="text-xs mt-2 wireframe-text">
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][index]}
                  </span>
                </div>
              ))}
            </div>
            <p className="wireframe-text text-sm text-center mt-4">
              Chapters read per day
            </p>
          </div>
        </>
      )}
    </div>
  );
}
