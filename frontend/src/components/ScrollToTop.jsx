import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * ScrollToTop component tự động scroll về đầu trang khi route thay đổi.
 * Đặt component này bên trong <BrowserRouter> để nó hoạt động trên tất cả các trang.
 */
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // Scroll về đầu trang (0, 0) khi pathname thay đổi
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

export default ScrollToTop;
