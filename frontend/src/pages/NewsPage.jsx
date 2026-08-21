import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Layout from "../components/common/Layout/Layout";
import { getAllNews } from "../api/newsApi";
import "../components/home/NewsSection/NewsSection.css";
import "./NewsPage.css";

/**
 * 뉴스 전체 목록 페이지.
 * 홈 화면 뉴스 섹션의 "더보기"로 들어오는 페이지. 카드 스타일은 홈 뉴스 섹션과 동일하게 맞춤.
 * 목록은 GET /api/home/news/all로 받아온 실제 DB 데이터를 씀 (공지 포함 전체).
 */
function NewsPage() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    let cancelled = false;

    getAllNews()
      .then((news) => {
        if (!cancelled) setItems(news);
      })
      .catch(() => {
        if (!cancelled) setItems([]);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <Layout>
      <section className="news-page">
        <Link to="/" className="news-page__back">
          ‹ 홈
        </Link>
        <h1>뉴스</h1>

        {items.length === 0 ? (
          <p className="news-page__empty">아직 등록된 뉴스가 없어요.</p>
        ) : (
          <div className="news-page__grid">
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
        )}
      </section>
    </Layout>
  );
}

export default NewsPage;
