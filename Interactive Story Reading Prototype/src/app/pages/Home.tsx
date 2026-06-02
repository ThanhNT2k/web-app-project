import { Link } from 'react-router';
import { mockStories } from '../data/mockData';
import { Eye, Star, BookOpen } from 'lucide-react';

export default function Home() {
  const featuredStories = mockStories.slice(0, 3);
  const popularStories = mockStories.slice(3);

  return (
    <div className="space-y-8">
      <div className="wireframe-section">
        <h1 className="wireframe-heading">Chào mừng đến với CMC Truyện</h1>
        <p className="wireframe-text mt-2">
          Khám phá và đọc hàng ngàn truyện đa thể loại
        </p>
      </div>

      <section>
        <h2 className="wireframe-section-title">Truyện Nổi Bật</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
          {featuredStories.map((story) => (
            <Link
              key={story.id}
              to={`/story/${story.id}`}
              className="wireframe-card hover:border-gray-700 transition-colors"
            >
              <div className="wireframe-image-placeholder h-48 mb-4">
                <span className="text-sm">Cover Image</span>
              </div>
              <h3 className="wireframe-card-title">{story.title}</h3>
              <p className="wireframe-text text-sm mt-1">tác giả {story.author}</p>
              <div className="flex items-center gap-4 mt-3 text-sm">
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
              <div className="mt-3">
                <span className="wireframe-badge">{story.genre}</span>
                <span className="wireframe-badge ml-2">{story.status}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <h2 className="wireframe-section-title">Truyện Phổ Biến</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
          {popularStories.map((story) => (
            <Link
              key={story.id}
              to={`/story/${story.id}`}
              className="wireframe-card hover:border-gray-700 transition-colors"
            >
              <div className="flex gap-4">
                <div className="wireframe-image-placeholder w-24 h-32 flex-shrink-0">
                  <span className="text-xs">Cover</span>
                </div>
                <div className="flex-1">
                  <h3 className="wireframe-card-title">{story.title}</h3>
                  <p className="wireframe-text text-sm mt-1">tác giả {story.author}</p>
                  <p className="wireframe-text text-xs mt-2 line-clamp-2">
                    {story.description}
                  </p>
                  <div className="flex items-center gap-3 mt-3 text-xs">
                    <span className="flex items-center gap-1">
                      <BookOpen size={14} />
                      {story.chapters}
                    </span>
                    <span className="flex items-center gap-1">
                      <Star size={14} />
                      {story.rating}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <div className="wireframe-section text-center">
        <Link to="/search" className="wireframe-button-primary">
          Khám Phá Tất Cả
        </Link>
      </div>
    </div>
  );
}
