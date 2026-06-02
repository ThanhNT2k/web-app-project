import { useState } from 'react';
import { Link } from 'react-router';
import { mockStories, searchStories } from '../data/mockData';
import { Search as SearchIcon, BookOpen, Star, Eye } from 'lucide-react';

export default function Search() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(mockStories);
  const [selectedGenre, setSelectedGenre] = useState('All');

  const genres = ['Tất Cả', 'Tiên Hiệp', 'Kiếm Hiệp', 'Đô Thị', 'Ngôn Tình', 'Huyền Huyễn', 'Đam Mỹ'];

  const handleSearch = (searchQuery: string) => {
    setQuery(searchQuery);
    if (searchQuery.trim() === '') {
      setResults(mockStories);
    } else {
      setResults(searchStories(searchQuery));
    }
  };

  const filteredResults = selectedGenre === 'Tất Cả'
    ? results
    : results.filter(story => story.genre === selectedGenre);

  return (
    <div className="space-y-6">
      <div className="wireframe-section">
        <h1 className="wireframe-heading">Tìm Kiếm Truyện</h1>
        <p className="wireframe-text mt-2">Tìm truyện yêu thích tiếp theo</p>
      </div>

      <div className="wireframe-card">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Tìm theo tên, tác giả hoặc từ khóa..."
              value={query}
              onChange={(e) => handleSearch(e.target.value)}
              className="wireframe-input w-full pl-10"
            />
            <SearchIcon size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          </div>
          <button className="wireframe-button-primary">Tìm Kiếm</button>
        </div>

        <div className="mt-4">
          <label className="wireframe-text text-sm font-bold mb-2 block">Lọc theo thể loại:</label>
          <div className="flex flex-wrap gap-2">
            {genres.map((genre) => (
              <button
                key={genre}
                onClick={() => setSelectedGenre(genre)}
                className={`wireframe-badge cursor-pointer ${
                  selectedGenre === genre ? 'border-gray-700 bg-gray-200' : ''
                }`}
              >
                {genre}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="wireframe-section">
        <h2 className="wireframe-section-title">
          {query ? `Kết quả cho "${query}"` : 'Tất Cả Truyện'} ({filteredResults.length})
        </h2>
      </div>

      <div className="space-y-4">
        {filteredResults.map((story) => (
          <Link
            key={story.id}
            to={`/story/${story.id}`}
            className="wireframe-card block hover:border-gray-700 transition-colors"
          >
            <div className="flex gap-4">
              <div className="wireframe-image-placeholder w-32 h-44 flex-shrink-0">
                <span className="text-xs">Cover</span>
              </div>
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="wireframe-card-title">{story.title}</h3>
                    <p className="wireframe-text text-sm mt-1">tác giả {story.author}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star size={16} />
                    <span className="font-bold">{story.rating}</span>
                  </div>
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
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {filteredResults.length === 0 && (
        <div className="wireframe-card text-center py-12">
          <p className="wireframe-text">Không tìm thấy truyện. Thử từ khóa khác nhé.</p>
        </div>
      )}
    </div>
  );
}
