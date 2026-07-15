import { useEffect, useRef } from 'react';

import { FontAwesomeIcon, faGoogle } from '../lib/icons';

function GoogleLoginButton({ onSuccess, onError, text = 'continue_with' }) {
  const containerRef = useRef(null);

  const buttonLabelMap = {
    signin_with: 'Dang nhap voi Google',
    signup_with: 'Dang ky voi Google',
    continue_with: 'Tiep tuc voi Google',
    signin: 'Dang nhap',
  };

  const visibleLabel = buttonLabelMap[text] || buttonLabelMap.continue_with;

  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!clientId) {
      console.warn('[GoogleLoginButton] VITE_GOOGLE_CLIENT_ID chua duoc cau hinh.');
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

    loadGoogleScript().then(() => {
      if (!window.google?.accounts || !containerRef.current) {
        return;
      }

      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: (response) => {
          if (response.credential) {
            onSuccess(response.credential);
          } else {
            onError?.(new Error('Google khong tra ve credential.'));
          }
        },
      });

      window.google.accounts.id.renderButton(containerRef.current, {
        type: 'standard',
        shape: 'rectangular',
        theme: 'outline',
        text: 'signin_with',
        size: 'medium',
        width: containerRef.current.offsetWidth || 400,
        logo_alignment: 'left',
        locale: 'vi',
      });
    });

    return () => {
      window.google?.accounts?.id?.cancel?.();
    };
  }, [onSuccess, onError]);

  return (
    <div className="google-btn-wrapper">
      <div className="google-btn-shell" aria-hidden="true">
        <span className="google-btn-shell__icon">
          <FontAwesomeIcon icon={faGoogle} />
        </span>
        <span className="google-btn-shell__label">{visibleLabel}</span>
      </div>
      <div ref={containerRef} className="google-btn-container" />
    </div>
  );
}

export default GoogleLoginButton;
