import { useEffect, useRef } from 'react';

import { FontAwesomeIcon, faGoogle } from '../lib/icons';

function GoogleLoginButton({ onSuccess, onError, text = 'continue_with' }) {
  const containerRef = useRef(null);
  const initializedRef = useRef(false);

  const buttonLabelMap = {
    signin_with: 'Đăng nhập với Google',
    signup_with: 'Đăng ký với Google',
    continue_with: 'Tiếp tục với Google',
    signin: 'Đăng nhập',
  };

  const visibleLabel = buttonLabelMap[text] || buttonLabelMap.continue_with;

  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!clientId) {
      console.warn('[GoogleLoginButton] VITE_GOOGLE_CLIENT_ID chưa được cấu hình.');
      return;
    }

    const loadGoogleScript = () =>
      new Promise((resolve) => {
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

    let resizeObserver;

    loadGoogleScript().then(() => {
      if (!window.google?.accounts || !containerRef.current) {
        return;
      }

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
  }, [onSuccess, onError]);

  return (
    <div className="google-btn-wrapper">
      <div className="google-btn-shell" aria-hidden="true">
        <span className="google-btn-shell__icon-wrap">
          <FontAwesomeIcon icon={faGoogle} />
        </span>
        <span className="google-btn-shell__label">{visibleLabel}</span>
      </div>
      <div ref={containerRef} className="google-btn-container" />
    </div>
  );
}

export default GoogleLoginButton;
