import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * ScrollToTop component tự động scroll về đầu trang khi route thay đổi.
 * Đặt component này bên trong <BrowserRouter> để nó hoạt động trên tất cả các trang.
 */
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // If there's a saved scroll position for this path, skip auto scroll-to-top
    const savedPos = sessionStorage.getItem(`scroll_pos_${pathname}`);
    if (savedPos !== null) {
      return;
    }
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

export default ScrollToTop;
