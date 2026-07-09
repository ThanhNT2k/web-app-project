import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FontAwesomeIcon,
  faArrowLeft,
  faArrowRight,
  faLayerGroup,
  faUser,
} from '../lib/icons';

const FALLBACK_COVER =
  'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=900&q=80';

function getStoryPath(story) {
  return `/story/${story.id}-${story.slug}`;
}

function getTagList(story) {
  const tagData = story.tags;
  const tags = tagData && (!Array.isArray(tagData) || tagData.length > 0)
    ? (Array.isArray(tagData) ? tagData : [tagData])
    : (story.category ? [story.category] : []);

  return tags
    .map((tag) => (typeof tag === 'object' && tag !== null ? (tag.name || tag.title || '') : tag))
    .filter(Boolean)
    .slice(0, 3);
}

function FeaturedCarousel({ stories = [] }) {
  const navigate = useNavigate();
  const [activeIndex, setActiveIndex] = useState(0);
  const slides = useMemo(() => stories.filter(Boolean).slice(0, 6), [stories]);
  const activeStory = slides[activeIndex] || slides[0];

  useEffect(() => {
    setActiveIndex(0);
  }, [slides.length]);

  if (!activeStory) return null;

  const cover = activeStory.cover_image_url || FALLBACK_COVER;
  const tags = getTagList(activeStory);
  const storyPath = getStoryPath(activeStory);
  const authorName = activeStory.author_full_name || activeStory.author_username || '';
  const description = activeStory.description || 'Một tựa truyện đang được nhiều độc giả CMC Truyện quan tâm hôm nay.';
  const currentRank = activeIndex + 1;

  const goPrevious = () => {
    setActiveIndex((current) => (current === 0 ? slides.length - 1 : current - 1));
  };

  const goNext = () => {
    setActiveIndex((current) => (current + 1) % slides.length);
  };

  const openActiveStory = (event) => {
    if (event.target instanceof Element && event.target.closest('a, button')) return;
    navigate(storyPath);
  };

  return (
    <section className="cmc-hero featured-carousel" aria-label="Truyện nổi bật" onClick={openActiveStory}>
      <div className="featured-carousel-bg" style={{ backgroundImage: `url(${cover})` }} aria-hidden="true" />
      <div className="featured-carousel-overlay" aria-hidden="true" />

      <p className="featured-carousel-label">Truyện nổi bật</p>

      <Link to={storyPath} className="featured-carousel-poster" aria-label={`Xem chi tiết ${activeStory.title}`}>
        <img
          src={cover}
          alt={activeStory.title}
          onError={(event) => { event.currentTarget.src = FALLBACK_COVER; }}
        />
      </Link>

      <div className="featured-carousel-content">
        <Link to={storyPath} className="featured-carousel-title">
          {activeStory.title}
        </Link>

        {tags.length > 0 ? (
          <div className="featured-carousel-tags" aria-label="Thể loại">
            {tags.map((tag) => (
              <span key={tag} className="featured-carousel-tag">
                <FontAwesomeIcon icon={faLayerGroup} />
                {tag}
              </span>
            ))}
          </div>
        ) : null}

        <p className="featured-carousel-desc">{description}</p>

        <div className="featured-carousel-meta">
          {authorName ? (
            <span>
              <FontAwesomeIcon icon={faUser} />
              {authorName}
            </span>
          ) : null}
          <Link to={storyPath} className="featured-carousel-cta">
            Xem chi tiết
            <FontAwesomeIcon icon={faArrowRight} />
          </Link>
        </div>
      </div>

      {slides.length > 1 ? (
        <>
          <div className="featured-carousel-controls" role="group" aria-label="Điều hướng truyện nổi bật">
            <span className="featured-carousel-rank">NO. {currentRank}</span>
            <button
              type="button"
              className="featured-carousel-arrow featured-carousel-arrow-prev"
              onClick={goPrevious}
              aria-label="Truyện trước"
            >
              <FontAwesomeIcon icon={faArrowLeft} />
            </button>
            <button
              type="button"
              className="featured-carousel-arrow featured-carousel-arrow-next"
              onClick={goNext}
              aria-label="Truyện tiếp theo"
            >
              <FontAwesomeIcon icon={faArrowRight} />
            </button>
          </div>
          <div className="featured-carousel-dots" aria-label="Vị trí truyện nổi bật">
            {slides.map((story, index) => (
              <button
                key={`${story.id}-${index}`}
                type="button"
                className={`featured-carousel-dot ${index === activeIndex ? 'is-active' : ''}`}
                onClick={() => setActiveIndex(index)}
                aria-label={`Xem truyện nổi bật ${index + 1}`}
                aria-current={index === activeIndex ? 'true' : undefined}
              />
            ))}
          </div>
        </>
      ) : null}
    </section>
  );
}

export default FeaturedCarousel;
