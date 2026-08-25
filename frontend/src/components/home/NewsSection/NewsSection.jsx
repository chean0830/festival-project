import { useNavigate } from "react-router-dom";
import { NEWS_TYPE_ICON, NEWS_TYPE_IMAGE } from "../../../data/newsTypes";
import "./NewsSection.css";

/**
 * 홈 화면 "뉴스" 섹션 — 아티스트 신곡/공연 발표/MD 발표 등 소식을
 * 사진 + 제목 카드로 가로 스크롤 보여준다.
 * sourceUrl이 있으면 기사 원문으로 새 탭 이동, 없고 eventId가 있으면 그 공연 상세페이지로 이동한다.
 * items: [{ id, title, imageUrl, sourceUrl, eventId, eventName }, ...]
 */
function NewsSection({ items }) {
  const navigate = useNavigate();

  if (items.length === 0) {
    return null;
  }

  function handleClick(item) {
    if (item.sourceUrl) {
      window.open(item.sourceUrl, "_blank", "noopener,noreferrer");
    } else if (item.eventId) {
      navigate(`/program/event/${item.eventId}`);
    }
  }

  return (
    <div className="news-section">
      {items.map((item) => (
        <button
          key={item.id}
          type="button"
          className="news-card"
          onClick={() => handleClick(item)}
        >
          <div className="news-card__thumb">
            {item.imageUrl || NEWS_TYPE_IMAGE[item.newsType] ? (
              <img src={item.imageUrl || NEWS_TYPE_IMAGE[item.newsType]} alt={item.title} />
            ) : (
              <span className="news-card__thumb-fallback">
                {NEWS_TYPE_ICON[item.newsType] || "📰"}
              </span>
            )}
          </div>
          {item.eventName && <p className="news-card__event">{item.eventName}</p>}
          <p className="news-card__title">{item.title}</p>
        </button>
      ))}
    </div>
  );
}

export default NewsSection;
