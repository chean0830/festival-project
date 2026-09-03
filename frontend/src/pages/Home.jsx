import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/common/Layout/Layout";
import Button from "../components/common/Button/Button";
import ProgramCarousel from "../components/home/ProgramCarousel/ProgramCarousel";
import BannerNotice from "../components/home/BannerNotice/BannerNotice";
import NewsSection from "../components/home/NewsSection/NewsSection";
import { getUpcomingEvents, toProgramItem } from "../api/eventApi";
import { getRecentNews, getHomeBanner } from "../api/newsApi";
import bannerPhoto from "../assets/home/banner-b.png";
import parallaxBackground from "../assets/home/festlog-parallax-background.png";
import parallaxStage from "../assets/home/festlog-parallax-stage.png";
import parallaxCrowd from "../assets/home/festlog-parallax-crowd.png";
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
  const parallaxRef = useRef(null);
  const [programItems, setProgramItems] = useState([]);
  const [noticeItems, setNoticeItems] = useState([]);
  const [newsItems, setNewsItems] = useState([]);
  const [bannerUrl, setBannerUrl] = useState(bannerPhoto);

  useEffect(() => {
    const section = parallaxRef.current;
    if (!section) return undefined;

    document.body.classList.add("home-parallax-active");

    let frameId = 0;

    const renderParallax = () => {
      const rect = section.getBoundingClientRect();
      const scrollRange = Math.max(1, section.offsetHeight - window.innerHeight);
      const progress = Math.min(1, Math.max(0, -rect.top / scrollRange));
      section.style.setProperty("--home-parallax", progress.toFixed(4));
      frameId = 0;
    };

    const requestRender = () => {
      if (!frameId) frameId = window.requestAnimationFrame(renderParallax);
    };

    const handlePointerMove = (event) => {
      const x = event.clientX / window.innerWidth - 0.5;
      const y = event.clientY / window.innerHeight - 0.5;
      section.style.setProperty("--home-pointer-x", x.toFixed(4));
      section.style.setProperty("--home-pointer-y", y.toFixed(4));
    };

    renderParallax();
    window.addEventListener("scroll", requestRender, { passive: true });
    window.addEventListener("resize", requestRender);
    window.addEventListener("pointermove", handlePointerMove, { passive: true });

    return () => {
      if (frameId) window.cancelAnimationFrame(frameId);
      window.removeEventListener("scroll", requestRender);
      window.removeEventListener("resize", requestRender);
      window.removeEventListener("pointermove", handlePointerMove);
      document.body.classList.remove("home-parallax-active");
    };
  }, []);

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
      <div className="home__page" ref={parallaxRef}>
        {/* 홈 전체에서 유지되는 패럴랙스 배경 */}
        <div className="home__parallax-background" aria-hidden="true">
          <img src={parallaxBackground} alt="" className="home__parallax-photo home__parallax-photo--base home__parallax-layer" />
          <img src={parallaxStage} alt="" className="home__parallax-photo home__parallax-photo--middle home__parallax-layer" />
          <img src={parallaxCrowd} alt="" className="home__parallax-photo home__parallax-photo--front home__parallax-layer" />
          <div className="home__parallax-sky home__parallax-layer" aria-hidden="true" />
          <div className="home__parallax-sun home__parallax-layer" aria-hidden="true" />
          <svg className="home__parallax-mountain home__parallax-mountain--back home__parallax-layer" viewBox="0 0 1600 900" preserveAspectRatio="none" aria-hidden="true">
            <path className="home__mountain-shape" d="M-80 720 C70 660 135 570 250 590 C330 604 370 655 455 642 C575 624 630 485 760 500 C875 513 900 615 1010 608 C1130 600 1185 500 1300 520 C1400 538 1460 625 1680 585 L1680 940 L-80 940 Z" />
            <path className="home__mountain-light" d="M-40 716 C115 651 164 593 258 609 C338 623 382 670 466 655 C591 632 647 514 758 526 C855 536 906 635 1016 627 C1136 618 1193 530 1300 546 C1410 562 1490 625 1640 605 L1640 690 C1465 708 1390 645 1280 635 C1162 623 1118 708 1000 714 C882 720 835 627 742 620 C634 611 574 716 458 737 C352 756 308 714 232 702 C140 687 79 744 -40 790 Z" />
          </svg>
          <svg className="home__parallax-valley home__parallax-layer" viewBox="0 0 1600 900" preserveAspectRatio="none" aria-hidden="true">
            <path d="M-80 760 C115 698 222 728 382 687 C548 645 662 708 816 672 C982 633 1092 685 1250 649 C1404 613 1512 650 1680 610 L1680 950 L-80 950 Z" />
            <path d="M-40 805 C128 766 264 785 420 752 C594 716 716 763 870 731 C1038 696 1176 742 1320 708 C1448 678 1540 700 1640 682 L1640 950 L-40 950 Z" />
          </svg>
          <svg className="home__parallax-mountain home__parallax-mountain--front home__parallax-layer" viewBox="0 0 1600 900" preserveAspectRatio="none" aria-hidden="true">
            <path className="home__mountain-shape" d="M-100 735 C45 690 110 625 205 638 C300 651 326 727 430 708 C548 687 603 575 720 588 C835 600 867 704 978 690 C1083 677 1133 583 1244 591 C1370 600 1418 690 1700 642 L1700 950 L-100 950 Z" />
            <path className="home__mountain-shadow" d="M-60 770 C80 724 131 681 216 691 C309 702 342 773 446 756 C557 737 615 637 718 646 C823 655 870 758 983 742 C1090 728 1140 644 1246 650 C1382 657 1450 730 1660 696 L1660 950 L-60 950 Z" />
          </svg>
          <svg className="home__parallax-festival home__parallax-layer" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
            <defs>
              <radialGradient id="festival-glow">
                <stop offset="0" stopColor="#dfffc5" stopOpacity=".95" />
                <stop offset=".45" stopColor="#66f3d0" stopOpacity=".36" />
                <stop offset="1" stopColor="#2dc7ea" stopOpacity="0" />
              </radialGradient>
              <linearGradient id="festival-beam" x1="0" y1="1" x2="0" y2="0">
                <stop offset="0" stopColor="#b9ffe0" stopOpacity=".68" />
                <stop offset="1" stopColor="#5ed8f3" stopOpacity="0" />
              </linearGradient>
            </defs>
            <ellipse cx="800" cy="720" rx="500" ry="280" fill="url(#festival-glow)" />
            <path d="M760 735 L460 140 L705 735 Z" fill="url(#festival-beam)" opacity=".42" />
            <path d="M795 735 L710 80 L835 735 Z" fill="url(#festival-beam)" opacity=".3" />
            <path d="M835 735 L1135 155 L890 735 Z" fill="url(#festival-beam)" opacity=".4" />
            <g className="home__festival-wheel" transform="translate(1225 500)">
              <circle r="122" /><circle r="15" />
              <path d="M0-122V122M-122 0H122M-86-86 86 86M86-86-86 86" />
              <path d="M-75 120H75M-48 120 0 0 48 120" />
            </g>
            <g className="home__festival-tents">
              <path d="M100 750 215 605 330 750Z" /><path d="M178 750 215 605 252 750Z" />
              <path d="M1280 770 1390 635 1500 770Z" /><path d="M1355 770 1390 635 1425 770Z" />
              <path d="M320 775 395 680 470 775Z" /><path d="M1130 780 1200 690 1270 780Z" />
            </g>
            <g className="home__festival-bulbs">
              <path d="M40 560 Q400 670 800 550 T1560 565" />
              <circle cx="120" cy="584" r="7" /><circle cx="245" cy="610" r="7" /><circle cx="380" cy="621" r="7" />
              <circle cx="520" cy="608" r="7" /><circle cx="665" cy="574" r="7" /><circle cx="810" cy="551" r="7" />
              <circle cx="965" cy="585" r="7" /><circle cx="1110" cy="608" r="7" /><circle cx="1260" cy="601" r="7" />
              <circle cx="1410" cy="575" r="7" />
            </g>
          </svg>
          <div className="home__parallax-stage home__parallax-layer" aria-hidden="true">
            <span className="home__stage-roof">FESTLOG LIVE</span>
            <i /><i /><i /><i /><i />
          </div>
          <svg className="home__parallax-crowd home__parallax-layer" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
            <path className="home__crowd-ground" d="M-80 775 C115 728 245 754 398 729 C570 701 690 748 842 722 C1010 694 1136 739 1290 708 C1434 679 1538 705 1680 675 L1680 950 L-80 950 Z" />
            <g className="home__crowd-people">
              <circle cx="80" cy="700" r="24" /><circle cx="155" cy="730" r="20" /><circle cx="235" cy="690" r="25" />
              <circle cx="330" cy="722" r="22" /><circle cx="430" cy="682" r="27" /><circle cx="535" cy="716" r="21" />
              <circle cx="635" cy="675" r="26" /><circle cx="750" cy="708" r="23" /><circle cx="855" cy="668" r="28" />
              <circle cx="970" cy="710" r="22" /><circle cx="1080" cy="680" r="26" /><circle cx="1190" cy="716" r="22" />
              <circle cx="1305" cy="671" r="27" /><circle cx="1425" cy="705" r="24" /><circle cx="1535" cy="676" r="26" />
              <path d="M208 715 160 610 182 600 238 690M620 700 580 594 603 586 650 678M1290 700 1342 590 1365 603 1330 715" />
            </g>
          </svg>
          <div className="home__parallax-shade" />
        </div>

        {/* 기존 홈 콘텐츠는 패럴랙스 배경 위에 표시 */}
        <div className="home__foreground">
          <section className="home__banner" aria-label="FESTLOG 공지 배너">
            <img src={bannerUrl} alt="" className="home__banner-photo" />
            <div className="home__banner-overlay" />
            <div className="home__banner-inner">
              <BannerNotice items={noticeItems} intervalMs={7000} />
            </div>
          </section>

          <section className="home__section">
            <div className="home__section-header">
              <h2>공연일정</h2>
              <a href="/program" className="home__section-more">더보기 ›</a>
            </div>
            <ProgramCarousel items={programItems} />
          </section>

          <section className="home__log-promo">
            <div className="home__log-promo-text">
              <h2 className="home__log-promo-title">
                페스티벌 기록
                <span className="home__log-promo-icon" aria-hidden="true">📔</span>
              </h2>
              <p>나만의 페스티벌 기록을 만들어보세요!</p>
              <Button variant="primary" onClick={() => navigate("/festival-log/new")}>기록 만들러 가기 →</Button>
            </div>
            <div className="home__log-promo-image">예시 이미지</div>
          </section>

          <section className="home__section">
            <div className="home__section-header">
              <h2>뉴스</h2>
              <a href="/news" className="home__section-more">더보기 ›</a>
            </div>
            <NewsSection items={newsItems} />
          </section>
        </div>
      </div>
    </Layout>
  );
}

export default Home;
