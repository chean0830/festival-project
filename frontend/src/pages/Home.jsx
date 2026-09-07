import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/common/Layout/Layout";
import Button from "../components/common/Button/Button";
import ProgramCarousel from "../components/home/ProgramCarousel/ProgramCarousel";
import BannerNotice from "../components/home/BannerNotice/BannerNotice";
import NewsSection from "../components/home/NewsSection/NewsSection";
import { getUpcomingEvents, toProgramItem } from "../api/eventApi";
import { getRecentNews } from "../api/newsApi";
import gratefulYesterdaysBanner from "../assets/home/banner-grateful-yesterdays.png";
import fujiRockBanner from "../assets/home/banner-fuji-rock.png";
import coachellaBanner from "../assets/home/banner-coachella.webp";
import "./Home.css";

const CAROUSEL_MAX_COUNT = 5;
const HOME_BANNERS = [
  {
    id: "grateful-yesterdays-seoul",
    eyebrow: "LIVE IN SEOUL · 2026",
    title: "back number Grateful Yesterdays Tour 2026 in Seoul",
    description: "오래 기다려 온 노래와 함께 다시 만나는 서울의 밤",
    image: gratefulYesterdaysBanner,
    href: "/program/event/7",
    tone: "violet",
  },
  {
    id: "fuji-rock-2026",
    eyebrow: "NIIGATA, JAPAN · SUMMER 2026",
    title: "Fuji Rock Festival 2026",
    description: "푸른 자연 한가운데서 펼쳐지는 여름 음악 여행",
    image: fujiRockBanner,
    href: "/program/event/9",
    tone: "green",
  },
  {
    id: "coachella-2026",
    eyebrow: "INDIO, CALIFORNIA · APRIL 2026",
    title: "Coachella 2026",
    description: "사막의 빛과 음악이 만나는 가장 뜨거운 주말",
    image: coachellaBanner,
    href: "/program/event/6",
    tone: "sunset",
  },
];

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
  const [newsItems, setNewsItems] = useState([]);

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
        setNewsItems(news.filter((item) => item.newsType !== "NOTICE"));
      })
      .catch(() => {
        if (!cancelled) {
          setNewsItems([]);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <Layout>
      {/* 1. 화면 전체 폭을 사용하는 메인 페스티벌 배너 */}
      <section className="home__banner" aria-label="주요 공연 및 페스티벌">
        <BannerNotice items={HOME_BANNERS} intervalMs={6500} />
      </section>

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
