import { BrowserRouter, Navigate, Outlet, Route, Routes } from 'react-router-dom';
import ModeratorLayout from './layouts/ModeratorLayout';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import LegacyRedirect from './components/LegacyRedirect';

import ProtectedRoute from './components/ProtectedRoute';
import RoleProtectedRoute from './components/RoleProtectedRoute';

import AdminLayout from './layouts/AdminLayout';
import AdminUsersPage from './pages/AdminUsersPage';
import AdminStoriesPage from './pages/AdminStoriesPage';
import AdminReportsPage from './pages/AdminReportsPage';
import ManageBadWords from './pages/admin/ManageBadWords';

import HomePage from './pages/HomePage';
import FindStoriesPage from './pages/FindStoriesPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import StoryDetailPage from './pages/StoryDetailPage';
import ChapterReaderPage from './pages/ChapterReaderPage';
import UserProfilePage from './pages/UserProfilePage';
import DashboardPage from './pages/DashboardPage';
import AdminPage from './pages/AdminPage';
import AccountPage from './pages/AccountPage';
import NotFoundPage from './pages/NotFoundPage';

import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';

function Layout() {
  return (
    <>
      <Navbar />
      <Outlet />
      <Footer />
    </>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <LegacyRedirect />

          <Routes>

            {/* USER LAYOUT */}
            <Route element={<Layout />}>

              <Route path="/" element={<HomePage />} />
              <Route path="/browse" element={<FindStoriesPage />} />
              <Route path="/tim-truyen" element={<FindStoriesPage />} />

              <Route path="/reader" element={<LegacyRedirect />} />
              <Route path="/pages/*" element={<LegacyRedirect />} />

              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/account" element={<AccountPage />} />

              <Route path="/story/:slug" element={<StoryDetailPage />} />
              <Route
                path="/:storySlug/:chapterNumber"
                element={<ChapterReaderPage />}
              />

              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <UserProfilePage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/dashboard"
                element={
                  <RoleProtectedRoute allowedRoles={['Uploader', 'Admin']}>
                    <DashboardPage />
                  </RoleProtectedRoute>
                }
              />

              <Route path="*" element={<NotFoundPage />} />
            </Route>

            {/* ADMIN LAYOUT RIÊNG */}
            <Route
              element={
                <RoleProtectedRoute allowedRoles={['Admin']}>
                  <AdminLayout />
                </RoleProtectedRoute>
              }
            >
              <Route path="/admin" element={<AdminPage />} />
              <Route path="/admin/users" element={<AdminUsersPage />} />
              <Route path="/admin/stories" element={<AdminStoriesPage />} />
              <Route path="/admin/reports" element={<AdminReportsPage />} />
              <Route path="/admin/bad-words" element={<ManageBadWords />} />
            </Route>

            {/* MODERATOR LAYOUT RIÊNG */}
            <Route
              element={
                <RoleProtectedRoute allowedRoles={['Moderator', 'Admin']}>
                  <ModeratorLayout />
                </RoleProtectedRoute>
              }
            >
              <Route path="/moderator/dashboard" element={<div className="p-4">Trang Tổng quan Mod (Sẽ làm sau)</div>} />
              <Route path="/moderator/pending-stories" element={<div className="p-4">Trang Duyệt truyện (Sẽ làm sau)</div>} />
              <Route path="/moderator/reports" element={<div className="p-4">Trang Xử lý Report (Sẽ làm sau)</div>} />
              <Route path="/moderator/comments" element={<div className="p-4">Trang Quản lý Bình luận (Sẽ làm sau)</div>} />
            </Route>

            <Route path="/home" element={<Navigate to="/" replace />} />

          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;