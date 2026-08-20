import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/common/Layout/Layout";
import Button from "../components/common/Button/Button";
import ProgramCarousel from "../components/home/ProgramCarousel/ProgramCarousel";
import BannerNotice from "../components/home/BannerNotice/BannerNotice";
import { getUpcomingEvents, toProgramItem } from "../api/eventApi";
import "./Home.css";

const CAROUSEL_MAX_COUNT = 5;

/**
 * 메인 화면
 * 스케치 기준으로 3개 섹션을 배치함:
 * 1. 배너 (공지사항/알림 노출용 — 자동으로 넘어가는 공지 텍스트가 들어감)
 * 2. 공연일정 캐러셀 (가운데 카드가 가장 크고, 시간이 지나면 자동으로 옆으로 넘어감) — GET /api/home/events
 * 3. 페스티벌 기록 홍보 (나만의 기록 만들기 유도)
 *
 * 배너 공지(noticeItems)는 아직 API가 없어서 더미 데이터야.
 */

const noticeItems = [
  { id: 1, text: "FESTLOG 공식 홈페이지가 오픈했습니다." },
  { id: 2, text: "8월 29일(토) 티켓 예매가 시작됩니다." },
  { id: 3, text: "라인업 1차 공개! 지금 확인해보세요." },
  { id: 4, text: "공식 굿즈(MD) 사전 예약이 곧 시작됩니다." },
];

function Home() {
  const navigate = useNavigate();
  const [programItems, setProgramItems] = useState([]);

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

  return (
    <Layout>
      {/* 1. 배너 — 공지사항 자리. 클릭하면 공지사항 페이지로 이동 (지금은 "/notice"로 임시 연결) */}
      <a href="/notice" className="home__banner">
        <div className="home__banner-inner">
          <BannerNotice items={noticeItems} />
        </div>
      </a>

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
    </Layout>
  );
}

export default Home;
