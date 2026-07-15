import { BrowserRouter, Navigate, Outlet, Route, Routes } from 'react-router-dom';
import ModeratorLayout from './layouts/ModeratorLayout';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import LegacyRedirect from './components/LegacyRedirect';
import ScrollToTop from './components/ScrollToTop';

import ProtectedRoute from './components/ProtectedRoute';
import RoleProtectedRoute from './components/RoleProtectedRoute';

import AdminLayout from './layouts/AdminLayout';
import AdminUsersPage from './pages/AdminUsersPage';
import AdminStoriesPage from './pages/AdminStoriesPage';
import AdminReportsPage from './pages/AdminReportsPage';
import ManageBadWords from './pages/admin/ManageBadWords';

import ModeratorDashboardPage from './pages/moderator/ModeratorDashboardPage';
import ModeratorPendingStoriesPage from './pages/moderator/ModeratorPendingStoriesPage';
import ModeratorCommentsPage from './pages/moderator/ModeratorCommentsPage';
import ModeratorProfilesPage from './pages/moderator/ModeratorProfilesPage';
import AuditLogsPage from './pages/AuditLogsPage';

import HomePage from './pages/HomePage';
import FindStoriesPage from './pages/FindStoriesPage';
import RankingsPage from './pages/RankingsPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import GoogleRegisterCompletePage from './pages/GoogleRegisterCompletePage';
import StoryDetailPage from './pages/StoryDetailPage';
import ChapterReaderPage from './pages/ChapterReaderPage';
import DashboardPage from './pages/DashboardPage';
import AdminPage from './pages/AdminPage';
import AccountSettingsPage from './pages/AccountSettingsPage';
import FollowingStoriesPage from './pages/FollowingStoriesPage';
import ReadingHistoryPage from './pages/ReadingHistoryPage';
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
          <ScrollToTop />
          <LegacyRedirect />

          <Routes>

            {/* USER LAYOUT */}
            <Route element={<Layout />}>

              <Route path="/" element={<HomePage />} />
              <Route path="/browse" element={<FindStoriesPage />} />
              <Route path="/tim-truyen" element={<FindStoriesPage />} />
              <Route path="/bang-xep-hang" element={<RankingsPage />} />

              <Route path="/reader" element={<LegacyRedirect />} />
              <Route path="/pages/*" element={<LegacyRedirect />} />

              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/auth/google/complete" element={<GoogleRegisterCompletePage />} />
              <Route path="/account" element={<Navigate to="/account/following" replace />} />

              <Route
                path="/account/following"
                element={
                  <ProtectedRoute>
                    <FollowingStoriesPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/account/history"
                element={
                  <ProtectedRoute>
                    <ReadingHistoryPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/account/settings"
                element={
                  <ProtectedRoute>
                    <AccountSettingsPage />
                  </ProtectedRoute>
                }
              />

              <Route path="/story/:slug" element={<StoryDetailPage />} />
              <Route
                path="/:storySlug/:chapterNumber"
                element={<ChapterReaderPage />}
              />

              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Navigate to="/account/settings" replace />
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
              <Route path="/admin/comments" element={<ModeratorCommentsPage />} />
              <Route path="/admin/profiles" element={<ModeratorProfilesPage />} />
              <Route path="/admin/logs" element={<AuditLogsPage />} />
            </Route>

            {/* MODERATOR LAYOUT RIÊNG */}
            <Route
              element={
                <RoleProtectedRoute allowedRoles={['Moderator', 'Admin']}>
                  <ModeratorLayout />
                </RoleProtectedRoute>
              }
            >
              <Route path="/moderator/dashboard" element={<ModeratorDashboardPage />} />
              <Route path="/moderator/pending-stories" element={<ModeratorPendingStoriesPage />} />
              <Route path="/moderator/reports" element={<AdminReportsPage />} />
              <Route path="/moderator/comments" element={<ModeratorCommentsPage />} />
              <Route path="/moderator/profiles" element={<ModeratorProfilesPage />} />
              <Route path="/moderator/logs" element={<AuditLogsPage />} />
            </Route>

            <Route path="/home" element={<Navigate to="/" replace />} />

          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
