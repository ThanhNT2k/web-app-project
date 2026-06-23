import { createContext, useContext, useEffect, useMemo, useState } from 'react';

import API from '../services/api';
import authService from '../services/authService';

/**
 * AuthContext: Context toàn cục quản lý trạng thái xác thực của user.
 * Được cung cấp ở root App.jsx và có thể truy cập từ bất kỳ component nào
 * thông qua hook useAuth().
 */
const AuthContext = createContext(null);

/**
 * AuthProvider: Component bọc toàn bộ ứng dụng để cung cấp trạng thái auth.
 *
 * State quản lý:
 * - user: Thông tin user đang đăng nhập (null nếu chưa đăng nhập)
 * - token: JWT token (null nếu chưa đăng nhập)
 * - loading: Trạng thái đang tải (khi fetch thông tin user từ server)
 *
 * Khởi tạo state từ localStorage (lazy initializer): Giúp ứng dụng "nhớ" trạng thái
 * đăng nhập sau khi reload trang mà không cần đăng nhập lại.
 */
function AuthProvider({ children }) {
  // Lazy initializer: Chạy một lần khi mount, đọc từ localStorage tránh re-render thừa
  const [user, setUser] = useState(() => authService.getCurrentUser());
  const [token, setToken] = useState(() => authService.getToken());
  const [loading, setLoading] = useState(false);

  /**
   * Khi component mount: Xác thực lại với server để đảm bảo token vẫn hợp lệ
   * và lấy thông tin user mới nhất (tránh dùng data cũ từ localStorage).
   * Chỉ chạy khi user đã authenticated (có token).
   */
  useEffect(() => {
    const initializeUser = async () => {
      if (!authService.isAuthenticated()) {
        return; // Không có token → không cần fetch
      }

      try {
        setLoading(true);
        // Gọi /auth/me để lấy thông tin user mới nhất từ server
        // Nếu token đã hết hạn, server trả về 401 → apiClient interceptor tự xử lý logout
        const response = await API.auth.getCurrentUser();
        setUser(response.user || null);
      } catch (err) {
        // Nếu tài khoản bị khóa (403), thực hiện đăng xuất ngay lập tức
        if (err?.response?.status === 403) {
          logout();
        }
      } finally {
        setLoading(false);
      }
    };

    initializeUser();
  }, []); // Chỉ chạy 1 lần khi mount

  /**
   * Đăng nhập: Gọi authService.login → lưu token vào localStorage → cập nhật state.
   * Trả về currentUser để component có thể xử lý redirect sau đăng nhập.
   */
  const login = async (email, password) => {
    const currentUser = await authService.login(email, password);
    setUser(currentUser);
    setToken(authService.getToken()); // Đọc lại token từ localStorage sau khi authService đã lưu
    return currentUser;
  };

  /**
   * Đăng ký tài khoản mới: Gọi authService.register → tự động đăng nhập luôn.
   * Sau đăng ký thành công, user không cần đăng nhập lại.
   */
  const register = async (username, email, password, fullName) => {
    const currentUser = await authService.register(username, email, password, fullName);
    setUser(currentUser);
    setToken(authService.getToken());
    return currentUser;
  };

  /**
   * Đăng nhập bằng Google: gửi idToken lên backend xác thực.
   * Nếu isNewUser=true: trả về để FE chuyển sang trang đặt mật khẩu.
   * Nếu đăng nhập thành công: lưu token + cập nhật state.
   */
  const loginWithGoogle = async (idToken) => {
    const response = await API.auth.googleLogin(idToken);
    if (response.isNewUser) {
      // Trả về để component quyết định redirect
      return response;
    }
    // Đăng nhập thành công
    authService.saveAuthData(response.token, response.user);
    setUser(response.user);
    setToken(response.token);
    return response;
  };

  /**
   * Đăng xuất: Xóa token khỏi localStorage → reset state về null.
   * Sau logout, mọi route được bảo vệ sẽ redirect về trang login.
   */
  const logout = async () => {
    await authService.logout();
    setUser(null);
    setToken(null);
  };

  /**
   * useMemo: Tối ưu hiệu suất bằng cách ghi nhớ value object.
   * Context value chỉ tạo lại khi user, token hoặc loading thay đổi.
   * Tránh tất cả consumer bị re-render không cần thiết khi parent component render lại.
   */
  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      isAuthenticated: Boolean(token),
      login,
      register,
      logout,
      loginWithGoogle,
      setUser,
      refreshCurrentUser: async () => {
        const response = await API.auth.getCurrentUser();
        setUser(response.user || null);
        return response.user || null;
      },
    }),
    [user, token, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * useAuth: Custom hook để truy cập AuthContext.
 * Throw lỗi rõ ràng nếu dùng ngoài AuthProvider (giúp phát hiện lỗi sớm khi dev).
 *
 * Cách dùng trong component:
 *   const { user, isAuthenticated, login, logout } = useAuth();
 */
function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

export { AuthProvider, useAuth };