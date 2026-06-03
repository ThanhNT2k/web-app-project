import { BrowserRouter, Navigate, Outlet, Route, Routes } from 'react-router-dom';

import Navbar from './components/Navbar';
import Footer from './components/Footer';

// ProtectedRoute: Chuyển hướng về /login nếu user chưa đăng nhập
import ProtectedRoute from './components/ProtectedRoute';

// RoleProtectedRoute: Chuyển hướng về / nếu user không có role đủ quyền
import RoleProtectedRoute from './components/RoleProtectedRoute';

// Import tất cả các trang của ứng dụng
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

// LegacyRedirect: Xử lý các URL cũ từ phiên bản trước của app
import LegacyRedirect from './components/LegacyRedirect';

// AuthProvider: Cung cấp trạng thái đăng nhập cho toàn app
import { AuthProvider } from './contexts/AuthContext';

// ThemeProvider: Cung cấp theme (dark/light mode) cho toàn app
import { ThemeProvider } from './contexts/ThemeContext';

/**
 * Layout component: Bọc các trang có Navbar và Footer.
 * Dùng Outlet để render child routes trong khoảng giữa Navbar và Footer.
 * Các route con được khai báo trong Route element={<Layout />}.
 */
function Layout() {
  return (
    <>
      <Navbar />
      <Outlet /> {/* Render nội dung trang con tại đây */}
      <Footer />
    </>
  );
}

/**
 * App component: Root component của toàn bộ ứng dụng.
 * Cấu trúc Provider lồng nhau (từ ngoài vào trong):
 * 1. ThemeProvider: Theme phải bọc ngoài cùng để Navbar có thể đọc theme
 * 2. AuthProvider: Context xác thực cần wrapping router để redirect hoạt động
 * 3. BrowserRouter: Cung cấp routing context cho toàn bộ app
 *
 * Cấu trúc Route:
 * - Route element={<Layout />}: Tất cả route con đều có Navbar và Footer
 * - ProtectedRoute: Yêu cầu đăng nhập (chuyển về /login nếu chưa)
 * - RoleProtectedRoute: Yêu cầu role cụ thể (chuyển về / nếu không đủ quyền)
 */
function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          {/* LegacyRedirect: Chạy ngoài Routes để xử lý redirect URL cũ trước khi routing */}
          <LegacyRedirect />
          <Routes>
            {/* Layout route bọc tất cả trang cần có Navbar và Footer */}
            <Route element={<Layout />}>

              {/* ── Public routes (không cần đăng nhập) ── */}
              <Route path="/" element={<HomePage />} />
              <Route path="/browse" element={<FindStoriesPage />} />
              <Route path="/tim-truyen" element={<FindStoriesPage />} />  {/* URL tiếng Việt */}
              <Route path="/reader" element={<LegacyRedirect />} />
              <Route path="/pages/*" element={<LegacyRedirect />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/account" element={<AccountPage />} />
              <Route path="/story/:id" element={<StoryDetailPage />} />
              <Route path="/story/:storyId/chapter/:chapterId" element={<ChapterReaderPage />} />

              {/* ── Protected routes (yêu cầu đăng nhập) ── */}
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>  {/* Redirect về /login nếu chưa đăng nhập */}
                    <UserProfilePage />
                  </ProtectedRoute>
                }
              />

              {/* ── Role-protected routes (yêu cầu role cụ thể) ── */}
              <Route
                path="/dashboard"
                element={
                  <RoleProtectedRoute allowedRoles={['Uploader', 'Admin']}>  {/* Cần role Uploader hoặc Admin */}
                    <DashboardPage />
                  </RoleProtectedRoute>
                }
              />
              <Route
                path="/admin"
                element={
                  <RoleProtectedRoute allowedRoles={['Admin']}>  {/* Chỉ Admin được vào */}
                    <AdminPage />
                  </RoleProtectedRoute>
                }
              />

              {/* ── Catch-all route ── */}
              <Route path="*" element={<NotFoundPage />} />
            </Route>

            {/* Redirect /home về / (xử lý URL cũ) */}
            <Route path="/home" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;