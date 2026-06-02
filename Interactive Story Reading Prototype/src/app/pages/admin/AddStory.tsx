import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { Save, X, Upload } from 'lucide-react';

export default function AddStory() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [genre, setGenre] = useState('Fantasy');
  const [status, setStatus] = useState('Ongoing');
  const [description, setDescription] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate saving
    alert('Story added successfully!');
    navigate('/admin/stories');
  };

  const genres = ['Fantasy', 'Sci-Fi', 'Mystery', 'Romance', 'Horror', 'Xuanhuan', 'Action', 'Drama'];

  return (
    <div className="space-y-6">
      <div className="wireframe-section">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="wireframe-heading">Add New Story</h1>
            <p className="wireframe-text mt-2">Create a new story on the platform</p>
          </div>
          <Link to="/admin/stories" className="wireframe-button-secondary flex items-center gap-2">
            <X size={18} />
            Cancel
          </Link>
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
                placeholder="Enter story title"
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
                  placeholder="Enter author name"
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
                    onChange={(e) => setStatus(e.target.value)}
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
                    onChange={(e) => setStatus(e.target.value)}
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
                placeholder="Enter story description"
                required
              />
              <p className="wireframe-text text-xs mt-1">
                {description.length} characters
              </p>
            </div>
          </div>
        </div>

        <div className="wireframe-card">
          <h2 className="wireframe-section-title mb-4">Cover Image</h2>
          <div className="wireframe-image-placeholder h-64 cursor-pointer hover:bg-gray-200 transition-colors">
            <Upload size={32} className="mb-2" />
            <span className="text-sm">Click to upload cover image</span>
            <p className="wireframe-text text-xs mt-2">Recommended: 800x1200px</p>
          </div>
          <button type="button" className="wireframe-button-secondary mt-3">
            <Upload size={18} className="mr-2" />
            Choose File
          </button>
        </div>

        <div className="wireframe-card">
          <h2 className="wireframe-section-title mb-4">Additional Settings</h2>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="wireframe-label">Tags</label>
                <input
                  type="text"
                  className="wireframe-input w-full"
                  placeholder="e.g. adventure, dragons, magic"
                />
              </div>

              <div>
                <label className="wireframe-label">Language</label>
                <select className="wireframe-select w-full">
                  <option>English</option>
                  <option>Vietnamese</option>
                  <option>Chinese</option>
                  <option>Korean</option>
                  <option>Japanese</option>
                </select>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <input type="checkbox" className="wireframe-checkbox mt-1" />
              <label className="wireframe-text text-sm">
                Mark this story as featured on homepage
              </label>
            </div>

            <div className="flex items-start gap-2">
              <input type="checkbox" className="wireframe-checkbox mt-1" />
              <label className="wireframe-text text-sm">
                Enable comments for this story
              </label>
            </div>

            <div className="flex items-start gap-2">
              <input type="checkbox" className="wireframe-checkbox mt-1" />
              <label className="wireframe-text text-sm">
                Send notification to followers when publishing
              </label>
            </div>
          </div>
        </div>

        <div className="wireframe-card bg-gray-50">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="wireframe-section-title">Ready to publish?</h3>
              <p className="wireframe-text text-sm mt-1">
                You can add chapters after creating the story
              </p>
            </div>
            <div className="flex gap-3">
              <Link to="/admin/stories" className="wireframe-button-secondary">
                Cancel
              </Link>
              <button type="submit" className="wireframe-button-primary flex items-center gap-2">
                <Save size={18} />
                Save Story
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
