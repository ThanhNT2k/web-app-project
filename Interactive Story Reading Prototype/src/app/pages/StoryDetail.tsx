import { Link, useParams } from 'react-router';
import { getStoryById, getChaptersByStoryId } from '../data/mockData';
import { BookOpen, Eye, Star, Heart, Clock } from 'lucide-react';

export default function StoryDetail() {
  const { id } = useParams<{ id: string }>();
  const story = getStoryById(id!);
  const chapters = getChaptersByStoryId(id!);

  if (!story) {
    return (
      <div className="wireframe-card text-center py-12">
        <p className="wireframe-text">Không tìm thấy truyện</p>
        <Link to="/" className="wireframe-button-secondary mt-4 inline-block">
          Về Trang Chủ
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="wireframe-card">
        <div className="flex gap-6">
          <div className="wireframe-image-placeholder w-48 h-64 flex-shrink-0">
            <span className="text-sm">Cover Image</span>
          </div>
          <div className="flex-1">
            <h1 className="wireframe-heading">{story.title}</h1>
            <p className="wireframe-text mt-2">tác giả {story.author}</p>

            <div className="flex items-center gap-4 mt-4">
              <span className="wireframe-badge">{story.genre}</span>
              <span className="wireframe-badge">{story.status}</span>
            </div>

            <div className="flex items-center gap-6 mt-4 text-sm">
              <span className="flex items-center gap-1">
                <BookOpen size={18} />
                {story.chapters} chương
              </span>
              <span className="flex items-center gap-1">
                <Eye size={18} />
                {story.views.toLocaleString()} lượt xem
              </span>
              <span className="flex items-center gap-1">
                <Star size={18} />
                {story.rating} đánh giá
              </span>
            </div>

            <div className="flex gap-3 mt-6">
              <Link
                to={`/read/${story.id}/c${story.id}-1`}
                className="wireframe-button-primary"
              >
                Bắt Đầu Đọc
              </Link>
              <button className="wireframe-button-secondary flex items-center gap-2">
                <Heart size={18} />
                Thêm Vào Yêu Thích
              </button>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t-2 border-gray-300">
          <h2 className="wireframe-section-title">Mô Tả</h2>
          <p className="wireframe-text mt-3">{story.description}</p>
        </div>

        <div className="mt-6 pt-6 border-t-2 border-gray-300">
          <h2 className="wireframe-section-title">Tóm Tắt (AI Tạo)</h2>
          <div className="wireframe-card bg-gray-100 mt-3">
            <p className="wireframe-text text-sm">
              Một câu chuyện hấp dẫn thuộc thể loại {story.genre},
              với nhân vật được xây dựng khéo léo và cốt truyện lôi cuốn. Tác giả khéo léo kết hợp
              các yếu tố khiến độc giả không thể rời mắt. Hoàn hảo cho những ai yêu thích {story.genre}
              đang tìm kiếm truyện hay tiếp theo.
            </p>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t-2 border-gray-300">
          <h2 className="wireframe-section-title">Truyện Tương Tự</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="wireframe-card text-center">
                <div className="wireframe-image-placeholder h-32 mb-2">
                  <span className="text-xs">Story {i}</span>
                </div>
                <p className="wireframe-text text-sm font-bold">Similar Story {i}</p>
                <p className="wireframe-text text-xs mt-1">by Author {i}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="wireframe-card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="wireframe-section-title">Danh Sách Chương ({chapters.length})</h2>
          <select className="wireframe-select">
            <option>Sắp xếp: Mới nhất</option>
            <option>Sắp xếp: Cũ nhất</option>
          </select>
        </div>

        <div className="space-y-2">
          {chapters.slice(0, 10).map((chapter) => (
            <Link
              key={chapter.id}
              to={`/read/${story.id}/${chapter.id}`}
              className="wireframe-list-item hover:bg-gray-200 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="wireframe-badge">Ch {chapter.number}</span>
                  <span className="font-bold">{chapter.title}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <span className="flex items-center gap-1">
                    <Clock size={14} />
                    {chapter.publishedDate}
                  </span>
                </div>
              </div>
            </Link>
          ))}
          {chapters.length > 10 && (
            <div className="wireframe-list-item text-center">
              <span className="wireframe-text text-sm">+ {chapters.length - 10} chương nữa</span>
            </div>
          )}
        </div>
      </div>

      <div className="wireframe-card">
        <h2 className="wireframe-section-title">Bình Luận</h2>
        <div className="mt-4 space-y-4">
          <div className="wireframe-card bg-gray-50">
            <div className="flex items-start gap-3">
              <div className="wireframe-image-placeholder w-10 h-10 rounded-full flex-shrink-0">
                <span className="text-xs">U</span>
              </div>
              <div className="flex-1">
                <p className="font-bold text-sm">User123</p>
                <p className="wireframe-text text-sm mt-1">
                  Great story! Can't wait for the next chapter.
                </p>
                <p className="text-xs text-gray-500 mt-2">2 days ago</p>
              </div>
            </div>
          </div>
          <div className="wireframe-card bg-gray-50">
            <div className="flex items-start gap-3">
              <div className="wireframe-image-placeholder w-10 h-10 rounded-full flex-shrink-0">
                <span className="text-xs">U</span>
              </div>
              <div className="flex-1">
                <p className="font-bold text-sm">Reader456</p>
                <p className="wireframe-text text-sm mt-1">
                  Amazing character development in this chapter!
                </p>
                <p className="text-xs text-gray-500 mt-2">5 days ago</p>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-4">
          <textarea
            placeholder="Viết bình luận..."
            className="wireframe-textarea"
            rows={3}
          />
          <button className="wireframe-button-primary mt-2">Đăng Bình Luận</button>
        </div>
      </div>
    </div>
  );
}
