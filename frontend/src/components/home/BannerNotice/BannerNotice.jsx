import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./BannerNotice.css";

/**
 * 홈 상단의 전체 폭 페스티벌 슬라이드 배너
 */
function BannerNotice({ items, intervalMs = 4000 }) {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (items.length <= 1) return undefined;

    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % items.length);
    }, intervalMs);

    return () => clearInterval(timer);
  }, [items.length, intervalMs]);

  const showPrevious = () => {
    setActiveIndex((prev) => (prev - 1 + items.length) % items.length);
  };

  const showNext = () => {
    setActiveIndex((prev) => (prev + 1) % items.length);
  };

  return (
    <div className="banner-notice" aria-roledescription="carousel">
      <div className="banner-notice__track" aria-live="polite">
        {items.map((item, index) => {
          const slideBody = (
            <>
              <img className="banner-notice__image" src={item.image} alt="" />
              <div className="banner-notice__overlay" />
              <div className="banner-notice__content">
                <p className="banner-notice__eyebrow">{item.eyebrow}</p>
                <h1 className="banner-notice__title">{item.title}</h1>
                <p className="banner-notice__description">{item.description}</p>
              </div>
            </>
          );

          return (
            <article
              key={item.id}
              className={`banner-notice__slide banner-notice__slide--${item.tone}${
                index === activeIndex ? " banner-notice__slide--active" : ""
              }`}
              aria-hidden={index !== activeIndex}
            >
              {item.href ? (
                <Link
                  to={item.href}
                  className="banner-notice__link"
                  tabIndex={index === activeIndex ? 0 : -1}
                  aria-label={`${item.title} 상세 보기`}
                >
                  {slideBody}
                </Link>
              ) : (
                <div className="banner-notice__link">{slideBody}</div>
              )}
            </article>
          );
        })}
      </div>

      {items.length > 1 && (
        <>
          <button
            type="button"
            className="banner-notice__arrow banner-notice__arrow--previous"
            onClick={showPrevious}
            aria-label="이전 배너"
          >
            ‹
          </button>
          <button
            type="button"
            className="banner-notice__arrow banner-notice__arrow--next"
            onClick={showNext}
            aria-label="다음 배너"
          >
            ›
          </button>
        </>
      )}

      <div className="banner-notice__dots" aria-label="배너 선택">
        {items.map((item, index) => (
          <button
            type="button"
            key={item.id}
            className={`banner-notice__dot${
              index === activeIndex ? " banner-notice__dot--active" : ""
            }`}
            onClick={() => setActiveIndex(index)}
            aria-label={`${index + 1}번 배너: ${item.title}`}
            aria-current={index === activeIndex ? "true" : undefined}
          />
        ))}
      </div>
    </div>
  );
}

export default BannerNotice;
