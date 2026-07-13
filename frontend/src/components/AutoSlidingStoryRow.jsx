import { Children, useCallback, useEffect, useRef, useState } from 'react';

import { FontAwesomeIcon, faArrowLeft, faArrowRight } from '../lib/icons';

const AUTO_SLIDE_DELAY = 4000;

function AutoSlidingStoryRow({ children, className = '', label = 'Danh sách truyện', variant = 'standard' }) {
  const trackRef = useRef(null);
  const [navigation, setNavigation] = useState({ canScroll: false, atStart: true, atEnd: false });
  const [autoResetKey, setAutoResetKey] = useState(0);
  const itemCount = Children.count(children);

  const updateNavigation = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    const maxScroll = Math.max(0, track.scrollWidth - track.clientWidth);
    setNavigation({
      canScroll: maxScroll > 1,
      atStart: track.scrollLeft <= 2,
      atEnd: track.scrollLeft >= maxScroll - 2,
    });
  }, []);

  const getScrollMetrics = () => {
    const track = trackRef.current;
    const firstItem = track?.firstElementChild;
    if (!track || !firstItem) return null;
    const gap = Number.parseFloat(window.getComputedStyle(track).columnGap || '0');
    return {
      track,
      step: firstItem.getBoundingClientRect().width + gap,
      maxScroll: Math.max(0, track.scrollWidth - track.clientWidth),
    };
  };

  const move = (direction, manual = false) => {
    const metrics = getScrollMetrics();
    if (!metrics || metrics.maxScroll <= 1) return;
    const { track, step, maxScroll } = metrics;
    let left;

    if (direction > 0) {
      left = track.scrollLeft >= maxScroll - 2 ? 0 : Math.min(track.scrollLeft + step, maxScroll);
    } else {
      left = track.scrollLeft <= 2 ? maxScroll : Math.max(track.scrollLeft - step, 0);
    }

    track.scrollTo({ left, behavior: 'smooth' });
    if (manual) setAutoResetKey((value) => value + 1);
  };

  useEffect(() => {
    const frame = window.requestAnimationFrame(updateNavigation);
    window.addEventListener('resize', updateNavigation);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener('resize', updateNavigation);
    };
  }, [itemCount, updateNavigation]);

  useEffect(() => {
    if (itemCount <= 1) return undefined;

    const timer = window.setInterval(() => {
      move(1);
    }, AUTO_SLIDE_DELAY);

    return () => window.clearInterval(timer);
  }, [autoResetKey, itemCount]);

  return (
    <div className="auto-sliding-story-shell">
      <div
        ref={trackRef}
        className={`${className} auto-sliding-story-row auto-sliding-story-row-${variant}`.trim()}
        role="region"
        aria-label={label}
        tabIndex={0}
        onScroll={updateNavigation}
      >
        {children}
      </div>
      {navigation.canScroll ? (
        <div className="auto-sliding-story-controls" role="group" aria-label={`Điều hướng ${label}`}>
          <button type="button" onClick={() => move(-1, true)} aria-label="Xem truyện trước">
            <FontAwesomeIcon icon={faArrowLeft} />
          </button>
          <button type="button" onClick={() => move(1, true)} aria-label="Xem truyện tiếp theo">
            <FontAwesomeIcon icon={faArrowRight} />
          </button>
        </div>
      ) : null}
    </div>
  );
}

export default AutoSlidingStoryRow;
