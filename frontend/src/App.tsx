import { BrowserRouter, Navigate, Route, Routes, Outlet } from 'react-router-dom';

import Footer from './components/Footer';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import RoleRoute from './components/RoleRoute';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import ChapterReaderPage from './pages/ChapterReaderPage';
import DashboardPage from './pages/DashboardPage';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import StoryDetailPage from './pages/StoryDetailPage';
import UserProfilePage from './pages/UserProfilePage';

function AppLayout() {
  return (
    <div className="app-shell d-flex flex-column min-vh-100 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      <Navbar />
      <main className="flex-grow-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<AppLayout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/story/:id" element={<StoryDetailPage />} />
              <Route path="/story/:storyId/chapter/:chapterId" element={<ChapterReaderPage />} />
              <Route element={<ProtectedRoute />}>
                <Route path="/profile" element={<UserProfilePage />} />
              </Route>
              <Route element={<RoleRoute roles={['Uploader', 'Admin']} />}>
                <Route path="/dashboard" element={<DashboardPage />} />
              </Route>
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}