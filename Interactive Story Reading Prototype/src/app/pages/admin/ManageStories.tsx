import { useState } from 'react';
import { Link } from 'react-router';
import { mockStories } from '../../data/mockData';
import { Plus, Search, Edit, Trash2, Eye, Filter } from 'lucide-react';

export default function ManageStories() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterGenre, setFilterGenre] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');

  const genres = ['All', 'Fantasy', 'Sci-Fi', 'Mystery', 'Romance', 'Horror', 'Xuanhuan'];
  const statuses = ['All', 'Ongoing', 'Completed'];

  const filteredStories = mockStories.filter(story => {
    const matchesSearch = story.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         story.author.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGenre = filterGenre === 'All' || story.genre === filterGenre;
    const matchesStatus = filterStatus === 'All' || story.status === filterStatus;
    return matchesSearch && matchesGenre && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="wireframe-section">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="wireframe-heading">Manage Stories</h1>
            <p className="wireframe-text mt-2">
              {filteredStories.length} of {mockStories.length} stories
            </p>
          </div>
          <Link to="/admin/add-story" className="wireframe-button-primary flex items-center gap-2">
            <Plus size={18} />
            Add New Story
          </Link>
        </div>
      </div>

      <div className="wireframe-card">
        <div className="space-y-4">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Search stories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="wireframe-input w-full pl-10"
              />
              <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            </div>
            <button className="wireframe-button-secondary flex items-center gap-2">
              <Filter size={18} />
              Filters
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="wireframe-label text-sm">Filter by Genre</label>
              <select
                value={filterGenre}
                onChange={(e) => setFilterGenre(e.target.value)}
                className="wireframe-select w-full"
              >
                {genres.map((genre) => (
                  <option key={genre} value={genre}>
                    {genre}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="wireframe-label text-sm">Filter by Status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="wireframe-select w-full"
              >
                {statuses.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="wireframe-card">
        <div className="overflow-x-auto">
          <table className="wireframe-table">
            <thead>
              <tr>
                <th className="text-left">Cover</th>
                <th className="text-left">Title</th>
                <th className="text-left">Author</th>
                <th className="text-center">Genre</th>
                <th className="text-center">Chapters</th>
                <th className="text-center">Views</th>
                <th className="text-center">Rating</th>
                <th className="text-center">Status</th>
                <th className="text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredStories.map((story) => (
                <tr key={story.id}>
                  <td>
                    <div className="wireframe-image-placeholder w-12 h-16">
                      <span className="text-xs">IMG</span>
                    </div>
                  </td>
                  <td className="font-bold">{story.title}</td>
                  <td>{story.author}</td>
                  <td className="text-center">
                    <span className="wireframe-badge">{story.genre}</span>
                  </td>
                  <td className="text-center">{story.chapters}</td>
                  <td className="text-center">{(story.views / 1000).toFixed(0)}k</td>
                  <td className="text-center">{story.rating} ⭐</td>
                  <td className="text-center">
                    <span className="wireframe-badge">{story.status}</span>
                  </td>
                  <td className="text-center">
                    <div className="flex items-center justify-center gap-2">
                      <Link
                        to={`/story/${story.id}`}
                        className="wireframe-button-secondary text-sm p-2"
                        title="View"
                      >
                        <Eye size={16} />
                      </Link>
                      <Link
                        to={`/admin/edit-story/${story.id}`}
                        className="wireframe-button-secondary text-sm p-2"
                        title="Edit"
                      >
                        <Edit size={16} />
                      </Link>
                      <button
                        className="wireframe-button-secondary text-sm p-2"
                        title="Delete"
                        onClick={() => {
                          if (confirm(`Delete "${story.title}"?`)) {
                            alert('Story deleted (simulated)');
                          }
                        }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredStories.length === 0 && (
          <div className="text-center py-12">
            <p className="wireframe-text">No stories found</p>
          </div>
        )}
      </div>

      <div className="wireframe-card bg-gray-50">
        <div className="flex items-center justify-between">
          <p className="wireframe-text text-sm">
            Showing {filteredStories.length} of {mockStories.length} stories
          </p>
          <div className="flex gap-2">
            <button className="wireframe-button-secondary text-sm">Previous</button>
            <button className="wireframe-button-secondary text-sm">1</button>
            <button className="wireframe-button-secondary text-sm">2</button>
            <button className="wireframe-button-secondary text-sm">3</button>
            <button className="wireframe-button-secondary text-sm">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}
