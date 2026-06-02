import { Link } from 'react-router';
import { mockStories } from '../../data/mockData';
import { BookOpen, Users, Eye, TrendingUp, Plus, Edit } from 'lucide-react';

export default function AdminDashboard() {
  const totalStories = mockStories.length;
  const totalChapters = mockStories.reduce((sum, story) => sum + story.chapters, 0);
  const totalViews = mockStories.reduce((sum, story) => sum + story.views, 0);

  const recentStories = mockStories.slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="wireframe-section">
        <h1 className="wireframe-heading">Admin Dashboard</h1>
        <p className="wireframe-text mt-2">Manage your story platform</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="wireframe-card bg-gray-50">
          <div className="flex items-center justify-between mb-2">
            <h3 className="wireframe-text text-sm">Total Stories</h3>
            <BookOpen size={20} />
          </div>
          <p className="text-3xl font-bold">{totalStories}</p>
          <p className="wireframe-text text-xs mt-1">+2 this week</p>
        </div>

        <div className="wireframe-card bg-gray-50">
          <div className="flex items-center justify-between mb-2">
            <h3 className="wireframe-text text-sm">Total Chapters</h3>
            <Edit size={20} />
          </div>
          <p className="text-3xl font-bold">{totalChapters}</p>
          <p className="wireframe-text text-xs mt-1">+15 this week</p>
        </div>

        <div className="wireframe-card bg-gray-50">
          <div className="flex items-center justify-between mb-2">
            <h3 className="wireframe-text text-sm">Total Views</h3>
            <Eye size={20} />
          </div>
          <p className="text-3xl font-bold">{(totalViews / 1000).toFixed(0)}k</p>
          <p className="wireframe-text text-xs mt-1">+5.2k this week</p>
        </div>

        <div className="wireframe-card bg-gray-50">
          <div className="flex items-center justify-between mb-2">
            <h3 className="wireframe-text text-sm">Total Users</h3>
            <Users size={20} />
          </div>
          <p className="text-3xl font-bold">1,234</p>
          <p className="wireframe-text text-xs mt-1">+48 this week</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="wireframe-card">
          <h2 className="wireframe-section-title mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3">
            <Link
              to="/admin/add-story"
              className="wireframe-list-item hover:bg-gray-200 transition-colors text-center"
            >
              <Plus size={24} className="mx-auto mb-2" />
              <span className="font-bold">Add New Story</span>
            </Link>
            <Link
              to="/admin/stories"
              className="wireframe-list-item hover:bg-gray-200 transition-colors text-center"
            >
              <BookOpen size={24} className="mx-auto mb-2" />
              <span className="font-bold">Manage Stories</span>
            </Link>
            <button className="wireframe-list-item hover:bg-gray-200 transition-colors text-center">
              <Users size={24} className="mx-auto mb-2" />
              <span className="font-bold">Manage Users</span>
            </button>
            <button className="wireframe-list-item hover:bg-gray-200 transition-colors text-center">
              <TrendingUp size={24} className="mx-auto mb-2" />
              <span className="font-bold">View Reports</span>
            </button>
          </div>
        </div>

        <div className="wireframe-card">
          <h2 className="wireframe-section-title mb-4">Platform Activity</h2>
          <div className="wireframe-chart h-48 flex items-end justify-around gap-2">
            {[45, 62, 38, 85, 72, 91, 68].map((height, index) => (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div
                  className="w-full bg-gray-300 border-2 border-gray-600"
                  style={{ height: `${height}%` }}
                />
                <span className="text-xs mt-2 wireframe-text">
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][index]}
                </span>
              </div>
            ))}
          </div>
          <p className="wireframe-text text-sm text-center mt-4">
            Daily active users (last 7 days)
          </p>
        </div>
      </div>

      <div className="wireframe-card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="wireframe-section-title">Recent Stories</h2>
          <Link to="/admin/stories" className="wireframe-button-secondary text-sm">
            View All
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="wireframe-table">
            <thead>
              <tr>
                <th className="text-left">Title</th>
                <th className="text-left">Author</th>
                <th className="text-left">Genre</th>
                <th className="text-center">Chapters</th>
                <th className="text-center">Views</th>
                <th className="text-center">Status</th>
                <th className="text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {recentStories.map((story) => (
                <tr key={story.id}>
                  <td className="font-bold">{story.title}</td>
                  <td>{story.author}</td>
                  <td>
                    <span className="wireframe-badge">{story.genre}</span>
                  </td>
                  <td className="text-center">{story.chapters}</td>
                  <td className="text-center">{(story.views / 1000).toFixed(0)}k</td>
                  <td className="text-center">
                    <span className="wireframe-badge">{story.status}</span>
                  </td>
                  <td className="text-center">
                    <Link
                      to={`/admin/edit-story/${story.id}`}
                      className="wireframe-button-secondary text-sm"
                    >
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="wireframe-card">
          <h2 className="wireframe-section-title mb-4">Top Performing Stories</h2>
          <div className="space-y-2">
            {mockStories.slice(0, 5).map((story, index) => (
              <div key={story.id} className="wireframe-list-item">
                <div className="flex items-center gap-3">
                  <span className="text-2xl font-bold text-gray-400">#{index + 1}</span>
                  <div className="flex-1">
                    <p className="font-bold">{story.title}</p>
                    <p className="wireframe-text text-xs">{story.views.toLocaleString()} views</p>
                  </div>
                  <span className="wireframe-badge">{story.rating} ⭐</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="wireframe-card">
          <h2 className="wireframe-section-title mb-4">Recent User Activity</h2>
          <div className="space-y-2">
            {[
              'User123 started reading "The Dragon\'s Legacy"',
              'Reader456 added "Starship Odyssey" to favorites',
              'StoryFan789 completed "Love in Tokyo"',
              'BookLover commented on "Mystery of the Old Manor"',
              'NewUser registered on the platform',
            ].map((activity, index) => (
              <div key={index} className="wireframe-list-item">
                <div className="flex items-start gap-3">
                  <div className="wireframe-image-placeholder w-8 h-8 rounded-full flex-shrink-0">
                    <span className="text-xs">U</span>
                  </div>
                  <div className="flex-1">
                    <p className="wireframe-text text-sm">{activity}</p>
                    <p className="wireframe-text text-xs text-gray-500">{index + 1}h ago</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
