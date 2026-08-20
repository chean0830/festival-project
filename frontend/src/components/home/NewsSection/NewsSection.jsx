import "./NewsSection.css";

/**
 * 홈 화면 "뉴스" 섹션 — 아티스트 신곡/공연 발표/MD 발표 등 소식을
 * 사진 + 제목 카드로 가로 스크롤 보여준다.
 * 누르면 실제 기사 원문(sourceUrl)으로 새 탭 이동한다.
 * items: [{ id, title, imageUrl, sourceUrl }, ...]
 */
function NewsSection({ items }) {
  if (items.length === 0) {
    return null;
  }

  return (
    <div className="news-section">
      {items.map((item) => (
        <button
          key={item.id}
          type="button"
          className="news-card"
          onClick={() =>
            item.sourceUrl &&
            window.open(item.sourceUrl, "_blank", "noopener,noreferrer")
          }
        >
          <div className="news-card__thumb">
            {item.imageUrl && <img src={item.imageUrl} alt={item.title} />}
          </div>
          <p className="news-card__title">{item.title}</p>
        </button>
      ))}
    </div>
  );
}

export default NewsSection;
