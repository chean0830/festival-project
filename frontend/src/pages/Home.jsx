import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/common/Layout/Layout";
import Button from "../components/common/Button/Button";
import ProgramCarousel from "../components/home/ProgramCarousel/ProgramCarousel";
import BannerNotice from "../components/home/BannerNotice/BannerNotice";
import NewsSection from "../components/home/NewsSection/NewsSection";
import { getUpcomingEvents, toProgramItem } from "../api/eventApi";
import { getRecentNews, getHomeBanner } from "../api/newsApi";
import bannerPhoto from "../assets/home/banner-b.png";
import "./Home.css";

const CAROUSEL_MAX_COUNT = 5;

/**
 * 메인 화면
 * 스케치 기준으로 4개 섹션을 배치함:
 * 1. 배너 (공지사항 — event_news 중 newsType이 NOTICE인 것만 자동으로 넘어가며 보여줌)
 * 2. 공연일정 캐러셀 (가운데 카드가 가장 크고, 시간이 지나면 자동으로 옆으로 넘어감) — GET /api/home/events
 * 3. 페스티벌 기록 홍보 (나만의 기록 만들기 유도)
 * 4. 뉴스 (NOTICE를 제외한 나머지 소식 — 아티스트 신곡/공연 발표/MD 발표 등) — GET /api/home/news
 */

function Home() {
  const navigate = useNavigate();
  const [programItems, setProgramItems] = useState([]);
  const [noticeItems, setNoticeItems] = useState([]);
  const [newsItems, setNewsItems] = useState([]);
  const [bannerUrl, setBannerUrl] = useState(bannerPhoto);

  useEffect(() => {
    let cancelled = false;

    getHomeBanner()
      .then((banner) => {
        if (!cancelled && banner?.imageUrl) setBannerUrl(banner.imageUrl);
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    getUpcomingEvents()
      .then((events) => {
        if (cancelled) return;
        setProgramItems(events.slice(0, CAROUSEL_MAX_COUNT).map(toProgramItem));
      })
      .catch(() => {
        if (!cancelled) setProgramItems([]);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    getRecentNews()
      .then((news) => {
        if (cancelled) return;
        setNoticeItems(
          news
            .filter((item) => item.newsType === "NOTICE")
            .map((item) => ({ id: item.id, text: item.title }))
        );
        setNewsItems(news.filter((item) => item.newsType !== "NOTICE"));
      })
      .catch(() => {
        if (!cancelled) {
          setNoticeItems([]);
          setNewsItems([]);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <Layout>
      {/* 1. 배너 — 공지사항 자리. 무대 조명 사진을 배경으로 깔아둔 순수 디스플레이용 배너, 클릭 안 됨 */}
      <div className="home__banner">
        <img src={bannerUrl} alt="" className="home__banner-photo" />
        <div className="home__banner-overlay" />
        <div className="home__banner-inner">
          <BannerNotice items={noticeItems} intervalMs={7000} />
        </div>
      </div>

      {/* 2. 공연일정 미리보기 */}
      <section className="home__section">
        <div className="home__section-header">
          <h2>공연일정</h2>
          <a href="/program" className="home__section-more">
            더보기 ›
          </a>
        </div>

        <ProgramCarousel items={programItems} />
      </section>

      {/* 3. 페스티벌 기록 홍보 */}
      <section className="home__log-promo">
        <div className="home__log-promo-text">
          <h2 className="home__log-promo-title">
            페스티벌 기록
            <span className="home__log-promo-icon" aria-hidden="true">
              📔
            </span>
          </h2>
          <p>나만의 페스티벌 기록을 만들어보세요!</p>
          <Button variant="primary" onClick={() => navigate("/festival-log/new")}>
            기록 만들러 가기 →
          </Button>
        </div>
        <div className="home__log-promo-image">예시 이미지</div>
      </section>

      {/* 4. 뉴스 */}
      <section className="home__section">
        <div className="home__section-header">
          <h2>뉴스</h2>
          <a href="/news" className="home__section-more">
            더보기 ›
          </a>
        </div>

        <NewsSection items={newsItems} />
      </section>
    </Layout>
  );
}

export default Home;
