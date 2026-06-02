import { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router';
import { getStoryById, getChaptersByStoryId } from '../../data/mockData';
import { Save, X, Upload, Plus, Edit, Trash2 } from 'lucide-react';

export default function EditStory() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const story = getStoryById(id!);
  const chapters = getChaptersByStoryId(id!);

  const [title, setTitle] = useState(story?.title || '');
  const [author, setAuthor] = useState(story?.author || '');
  const [genre, setGenre] = useState(story?.genre || 'Fantasy');
  const [status, setStatus] = useState(story?.status || 'Ongoing');
  const [description, setDescription] = useState(story?.description || '');

  if (!story) {
    return (
      <div className="wireframe-card text-center py-12">
        <p className="wireframe-text">Story not found</p>
        <Link to="/admin/stories" className="wireframe-button-secondary mt-4 inline-block">
          Back to Manage Stories
        </Link>
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Story updated successfully!');
    navigate('/admin/stories');
  };

  const handleDelete = () => {
    if (confirm(`Are you sure you want to delete "${story.title}"? This action cannot be undone.`)) {
      alert('Story deleted (simulated)');
      navigate('/admin/stories');
    }
  };

  const genres = ['Fantasy', 'Sci-Fi', 'Mystery', 'Romance', 'Horror', 'Xuanhuan', 'Action', 'Drama'];

  return (
    <div className="space-y-6">
      <div className="wireframe-section">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="wireframe-heading">Edit Story</h1>
            <p className="wireframe-text mt-2">Update story information</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleDelete}
              className="wireframe-button-secondary flex items-center gap-2 border-red-400 text-red-600"
            >
              <Trash2 size={18} />
              Delete Story
            </button>
            <Link to="/admin/stories" className="wireframe-button-secondary flex items-center gap-2">
              <X size={18} />
              Cancel
            </Link>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="wireframe-card">
          <h2 className="wireframe-section-title mb-4">Basic Information</h2>

          <div className="space-y-4">
            <div>
              <label className="wireframe-label">Story Title *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="wireframe-input w-full"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="wireframe-label">Author *</label>
                <input
                  type="text"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  className="wireframe-input w-full"
                  required
                />
              </div>

              <div>
                <label className="wireframe-label">Genre *</label>
                <select
                  value={genre}
                  onChange={(e) => setGenre(e.target.value)}
                  className="wireframe-select w-full"
                  required
                >
                  {genres.map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="wireframe-label">Status *</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="status"
                    value="Ongoing"
                    checked={status === 'Ongoing'}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="wireframe-radio"
                  />
                  <span className="wireframe-text">Ongoing</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="status"
                    value="Completed"
                    checked={status === 'Completed'}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="wireframe-radio"
                  />
                  <span className="wireframe-text">Completed</span>
                </label>
              </div>
            </div>

            <div>
              <label className="wireframe-label">Description *</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="wireframe-textarea"
                rows={5}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="wireframe-label">Total Views</label>
                <input
                  type="text"
                  value={story.views.toLocaleString()}
                  className="wireframe-input w-full"
                  disabled
                />
              </div>
              <div>
                <label className="wireframe-label">Rating</label>
                <input
                  type="text"
                  value={story.rating}
                  className="wireframe-input w-full"
                  disabled
                />
              </div>
              <div>
                <label className="wireframe-label">Total Chapters</label>
                <input
                  type="text"
                  value={chapters.length}
                  className="wireframe-input w-full"
                  disabled
                />
              </div>
            </div>
          </div>
        </div>

        <div className="wireframe-card">
          <h2 className="wireframe-section-title mb-4">Cover Image</h2>
          <div className="flex gap-4 items-start">
            <div className="wireframe-image-placeholder w-48 h-64">
              <span className="text-sm">Current Cover</span>
            </div>
            <div className="flex-1">
              <p className="wireframe-text mb-3">Update cover image</p>
              <button type="button" className="wireframe-button-secondary">
                <Upload size={18} className="mr-2" />
                Choose New Image
              </button>
              <p className="wireframe-text text-xs mt-2">Recommended: 800x1200px</p>
            </div>
          </div>
        </div>

        <div className="wireframe-card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="wireframe-section-title">Chapters ({chapters.length})</h2>
            <button type="button" className="wireframe-button-secondary flex items-center gap-2">
              <Plus size={18} />
              Add Chapter
            </button>
          </div>

          <div className="space-y-2 max-h-96 overflow-y-auto">
            {chapters.slice(0, 10).map((chapter) => (
              <div key={chapter.id} className="wireframe-list-item">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="wireframe-badge">Ch {chapter.number}</span>
                    <span className="font-bold">{chapter.title}</span>
                  </div>
                  <div className="flex gap-2">
                    <button type="button" className="wireframe-button-secondary text-sm p-2">
                      <Edit size={16} />
                    </button>
                    <button type="button" className="wireframe-button-secondary text-sm p-2">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {chapters.length > 10 && (
              <p className="wireframe-text text-sm text-center py-2">
                + {chapters.length - 10} more chapters
              </p>
            )}
          </div>
        </div>

        <div className="wireframe-card bg-gray-50">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="wireframe-section-title">Save Changes?</h3>
              <p className="wireframe-text text-sm mt-1">
                Your changes will be visible immediately
              </p>
            </div>
            <div className="flex gap-3">
              <Link to="/admin/stories" className="wireframe-button-secondary">
                Cancel
              </Link>
              <button type="submit" className="wireframe-button-primary flex items-center gap-2">
                <Save size={18} />
                Update Story
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
