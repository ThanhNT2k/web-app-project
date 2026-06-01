import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

/**
 * Chuyển URL cũ (pages/*.html, query reader) sang route React.
 */
function LegacyRedirect() {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const path = location.pathname.toLowerCase();
    const params = new URLSearchParams(location.search);

    if (path.endsWith('/reader.html') || path === '/reader') {
      const storyId = params.get('storyId') || params.get('comicId');
      const chapterId = params.get('chapterId') || params.get('id');
      if (storyId && chapterId) {
        navigate(`/story/${storyId}/chapter/${chapterId}`, { replace: true });
      }
      return;
    }

    if (path.endsWith('/story.html') || path === '/browse') {
      const genre = params.get('genre');
      const q = params.get('q');
      const next = new URLSearchParams(location.search);
      if (genre && genre !== 'all' && !next.has('category')) {
        next.set('category', genre);
      }
      if (q && !next.has('q')) next.set('q', q);
      const qs = next.toString();
      navigate(qs ? `/tim-truyen?${qs}` : '/tim-truyen', { replace: true });
      return;
    }

    if (path.endsWith('/profile.html')) {
      navigate('/profile', { replace: true });
      return;
    }

    if (path.endsWith('/account.html')) {
      navigate('/account', { replace: true });
      return;
    }

    if (path.endsWith('/admin.html')) {
      navigate('/admin', { replace: true });
    }
  }, [location.pathname, location.search, navigate]);

  return null;
}

export default LegacyRedirect;
