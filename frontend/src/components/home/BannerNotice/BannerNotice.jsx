import { useEffect, useState } from "react";
import "./BannerNotice.css";

/**
 * 배너 안에서 자동으로 넘어가는 공지사항 영역
 * - 일정 시간(4초)마다 다음 공지로 자동 전환 (페이드 효과)
 * - 하단 점(dot)을 누르면 그 공지로 바로 이동
 * - 배너 전체가 <a> 링크라서, 점을 눌렀을 때 페이지 이동이 같이 일어나지
 *   않도록 클릭 이벤트 전파를 막아둠
 *
 * items: [{ id, text }, ...] 형태의 배열 (지금은 더미 텍스트)
 */
function BannerNotice({ items, intervalMs = 4000 }) {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (items.length === 0) return;

    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % items.length);
    }, intervalMs);

    return () => clearInterval(timer);
  }, [items.length, intervalMs]);

  const handleDotClick = (event, index) => {
    event.preventDefault();
    event.stopPropagation();
    setActiveIndex(index);
  };

  return (
    <div className="banner-notice">
      <div className="banner-notice__track">
        {items.map((item, index) => (
          <p
            key={item.id}
            className={`banner-notice__text${
              index === activeIndex ? " banner-notice__text--active" : ""
            }`}
          >
            {item.text}
          </p>
        ))}
      </div>

      <div className="banner-notice__dots">
        {items.map((item, index) => (
          <span
            key={item.id}
            className={`banner-notice__dot${
              index === activeIndex ? " banner-notice__dot--active" : ""
            }`}
            onClick={(event) => handleDotClick(event, index)}
          />
        ))}
      </div>
    </div>
  );
}

export default BannerNotice;
