import { createBrowserRouter } from 'react-router';
import Layout from './components/Layout';
import Home from './pages/Home';
import Search from './pages/Search';
import StoryDetail from './pages/StoryDetail';
import ReadChapter from './pages/ReadChapter';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Favorites from './pages/Favorites';
import History from './pages/History';
import AdminDashboard from './pages/admin/Dashboard';
import AddStory from './pages/admin/AddStory';
import ManageStories from './pages/admin/ManageStories';
import EditStory from './pages/admin/EditStory';

export const router = createBrowserRouter([
  {
    path: '/',
    Component: Layout,
    children: [
      // User Routes
      { index: true, Component: Home },
      { path: 'search', Component: Search },
      { path: 'story/:id', Component: StoryDetail },
      { path: 'read/:storyId/:chapterId', Component: ReadChapter },
      { path: 'login', Component: Login },
      { path: 'register', Component: Register },
      { path: 'profile', Component: Profile },
      { path: 'favorites', Component: Favorites },
      { path: 'history', Component: History },

      // Admin Routes
      { path: 'admin', Component: AdminDashboard },
      { path: 'admin/add-story', Component: AddStory },
      { path: 'admin/stories', Component: ManageStories },
      { path: 'admin/edit-story/:id', Component: EditStory },
    ],
  },
]);
