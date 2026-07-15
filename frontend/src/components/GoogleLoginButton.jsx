import { useEffect, useRef } from 'react';

/**
 * GoogleLoginButton — Nút "Tiếp tục với Google" dùng Google Identity Services (GSI).
 * Load Google script một lần, render nút qua Google renderButton API để đúng chuẩn branding.
 *
 * @param {function} onSuccess - Callback khi Google trả về credential thành công
 * @param {function} onError - Callback khi xảy ra lỗi
 * @param {string} text - Text hiển thị: 'signin_with' | 'signup_with' | 'continue_with'
 */
function GoogleLoginButton({ onSuccess, onError, text = 'continue_with' }) {
  const containerRef = useRef(null);
  const initializedRef = useRef(false);

  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!clientId) {
      console.warn('[GoogleLoginButton] VITE_GOOGLE_CLIENT_ID chưa được cấu hình.');
      return;
    }

    // Load Google Identity Services script nếu chưa có
    const loadGoogleScript = () => {
      return new Promise((resolve) => {
        if (window.google?.accounts) {
          resolve();
          return;
        }
        const script = document.createElement('script');
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.defer = true;
        script.onload = resolve;
        document.head.appendChild(script);
      });
    };

    let resizeObserver;

    loadGoogleScript().then(() => {
      if (!window.google?.accounts || !containerRef.current) return;

      if (!initializedRef.current) {
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: (response) => {
            if (response.credential) {
              onSuccess(response.credential);
            } else {
              onError?.(new Error('Google không trả về credential.'));
            }
          },
        });
        initializedRef.current = true;
      }

      const renderGoogleButton = () => {
        if (!containerRef.current) return;

        const width = Math.max(Math.round(containerRef.current.offsetWidth || 0), 240);
        containerRef.current.replaceChildren();

        window.google.accounts.id.renderButton(containerRef.current, {
          type: 'standard',
          shape: 'rectangular',
          theme: 'outline',
          text,
          size: 'medium',
          width,
          logo_alignment: 'left',
          locale: 'vi',
        });
      };

      renderGoogleButton();

      if (window.ResizeObserver) {
        resizeObserver = new window.ResizeObserver(() => {
          renderGoogleButton();
        });
        resizeObserver.observe(containerRef.current);
      }
    });

    return () => {
      resizeObserver?.disconnect();
      // Cleanup khi component unmount
      window.google?.accounts?.id?.cancel?.();
    };
  }, [onSuccess, onError, text]);

  return (
    <div className="google-btn-wrapper">
      <div ref={containerRef} className="google-btn-container" />
    </div>
  );
}

export default GoogleLoginButton;
