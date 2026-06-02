import { Link } from 'react-router';
import { mockUser, getStoryById } from '../data/mockData';
import { Heart, BookOpen, Star, Eye, X } from 'lucide-react';

export default function Favorites() {
  const favoriteStories = mockUser.favoriteStories
    .map(id => getStoryById(id))
    .filter(story => story !== undefined);

  return (
    <div className="space-y-6">
      <div className="wireframe-section">
        <h1 className="wireframe-heading">Truyện Yêu Thích</h1>
        <p className="wireframe-text mt-2">
          {favoriteStories.length} {favoriteStories.length === 1 ? 'truyện' : 'truyện'} trong danh sách yêu thích
        </p>
      </div>

      {favoriteStories.length === 0 ? (
        <div className="wireframe-card text-center py-12">
          <Heart size={48} className="mx-auto mb-4 text-gray-400" />
          <p className="wireframe-text mb-4">Bạn chưa thêm truyện yêu thích nào</p>
          <Link to="/search" className="wireframe-button-primary">
            Tìm Truyện
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {favoriteStories.map((story) => (
            <div key={story.id} className="wireframe-card">
              <div className="flex gap-4">
                <div className="wireframe-image-placeholder w-32 h-44 flex-shrink-0">
                  <span className="text-xs">Cover</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <Link to={`/story/${story.id}`} className="wireframe-card-title hover:underline">
                        {story.title}
                      </Link>
                      <p className="wireframe-text text-sm mt-1">tác giả {story.author}</p>
                    </div>
                    <button className="wireframe-button-secondary flex items-center gap-2 text-sm">
                      <X size={16} />
                      Xóa
                    </button>
                  </div>
                  <p className="wireframe-text mt-3">{story.description}</p>
                  <div className="flex items-center gap-4 mt-4 text-sm">
                    <span className="wireframe-badge">{story.genre}</span>
                    <span className="wireframe-badge">{story.status}</span>
                    <span className="flex items-center gap-1">
                      <BookOpen size={16} />
                      {story.chapters} chương
                    </span>
                    <span className="flex items-center gap-1">
                      <Eye size={16} />
                      {(story.views / 1000).toFixed(0)}k lượt xem
                    </span>
                    <span className="flex items-center gap-1">
                      <Star size={16} />
                      {story.rating}
                    </span>
                  </div>
                  <div className="flex gap-3 mt-4">
                    <Link
                      to={`/read/${story.id}/c${story.id}-1`}
                      className="wireframe-button-primary"
                    >
                      Tiếp Tục Đọc
                    </Link>
                    <Link
                      to={`/story/${story.id}`}
                      className="wireframe-button-secondary"
                    >
                      Xem Chi Tiết
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="wireframe-card">
        <h2 className="wireframe-section-title mb-4">Gợi Ý Cho Bạn</h2>
        <p className="wireframe-text text-sm mb-4">
          Dựa trên sở thích của bạn, có thể bạn sẽ thích:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="wireframe-card text-center hover:border-gray-700 transition-colors cursor-pointer">
              <div className="wireframe-image-placeholder h-32 mb-2">
                <span className="text-xs">Story {i}</span>
              </div>
              <p className="wireframe-text text-sm font-bold">Recommended Story {i}</p>
              <p className="wireframe-text text-xs mt-1">by Author {i}</p>
              <div className="flex items-center justify-center gap-2 mt-2 text-xs">
                <span className="flex items-center gap-1">
                  <Star size={12} />
                  4.7
                </span>
                <span className="wireframe-badge">Fantasy</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
