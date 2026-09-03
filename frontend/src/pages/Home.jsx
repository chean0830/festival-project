import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/common/Layout/Layout";
import useCurrentMember from "../features/profile/hooks/useCurrentMember";
import ProgramCarousel from "../components/home/ProgramCarousel/ProgramCarousel";
import BannerNotice from "../components/home/BannerNotice/BannerNotice";
import NewsSection from "../components/home/NewsSection/NewsSection";
import PostCard from "../components/community/PostCard/PostCard";
import UsedListingCard from "../components/usedtrade/UsedListingCard/UsedListingCard";
import { getUpcomingEvents, toProgramItem } from "../api/eventApi";
import { getRecentNews, getHomeBanner } from "../api/newsApi";
import { getPosts } from "../api/communityApi";
import { fetchUsedListings } from "../api/usedTradeApi";
import bannerPhoto from "../assets/home/banner-b.png";
import festivalRecordBanner from "../assets/home/festival-record-banner.png";
import "./Home.css";

const CAROUSEL_MAX_COUNT = 5;
const COMMUNITY_PREVIEW_COUNT = 3;
const USED_PREVIEW_COUNT = 4;

/**
 * 메인 화면
 * 1. 배너 (공지사항 — event_news 중 newsType이 NOTICE인 것만 자동으로 넘어가며 보여줌)
 * 2. 공연일정 캐러셀 (가운데 카드가 가장 크고, 시간이 지나면 자동으로 옆으로 넘어감) — GET /api/home/events
 * 3. 페스티벌 기록 홍보 (나만의 기록 만들기 유도)
 * 4. 커뮤니티 미리보기 (최근 글 몇 개 + 더보기) — GET /api/posts
 * 5. MD 중고거래 미리보기 (최근 매물 몇 개 + 더보기) — GET /api/used/listings
 * 6. 뉴스 (NOTICE를 제외한 나머지 소식 — 아티스트 신곡/공연 발표/MD 발표 등) — GET /api/home/news
 */

function Home() {
  const navigate = useNavigate();
  const currentMember = useCurrentMember();
  const memberId = currentMember?.memberId;
  const [programItems, setProgramItems] = useState([]);
  const [noticeItems, setNoticeItems] = useState([]);
  const [newsItems, setNewsItems] = useState([]);
  const [communityPosts, setCommunityPosts] = useState([]);
  const [usedListings, setUsedListings] = useState([]);
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

  useEffect(() => {
    let cancelled = false;

    getPosts()
      .then((posts) => {
        if (!cancelled) setCommunityPosts(posts.slice(0, COMMUNITY_PREVIEW_COUNT));
      })
      .catch(() => {
        if (!cancelled) setCommunityPosts([]);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  // 중고거래 목록 API는 로그인이 필요해서, 로그인한 사용자에게만 미리보기를 채운다.
  useEffect(() => {
    if (!memberId) {
      return undefined;
    }
    let cancelled = false;

    fetchUsedListings({ size: USED_PREVIEW_COUNT })
      .then((data) => {
        if (!cancelled) setUsedListings((data.items ?? []).slice(0, USED_PREVIEW_COUNT));
      })
      .catch(() => {
        if (!cancelled) setUsedListings([]);
      });

    return () => {
      cancelled = true;
    };
  }, [memberId]);

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

      {/* 3. 페스티벌 기록 홍보 — 배너 이미지를 누르면 기록 만들기 화면으로 이동 */}
      <section className="home__log-promo">
        <button
          type="button"
          className="home__log-promo-banner"
          onClick={() => navigate("/festival-log/new")}
          aria-label="나만의 페스티벌 기록 만들러 가기"
        >
          <img src={festivalRecordBanner} alt="나만의 페스티벌 기록을 만들어보세요" />
        </button>
      </section>

      {/* 4. 커뮤니티 미리보기 */}
      <section className="home__section">
        <div className="home__section-header">
          <h2>커뮤니티</h2>
          <a href="/community" className="home__section-more">
            더보기 ›
          </a>
        </div>

        {communityPosts.length === 0 ? (
          <p className="home__preview-empty">아직 올라온 글이 없어요.</p>
        ) : (
          <div className="home__preview-list">
            {communityPosts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </section>

      {/* 5. MD 중고거래 미리보기 */}
      <section className="home__section">
        <div className="home__section-header">
          <h2>MD 중고거래</h2>
          <a href="/shop" className="home__section-more">
            더보기 ›
          </a>
        </div>

        {usedListings.length === 0 ? (
          <p className="home__preview-empty">
            {memberId ? "아직 등록된 매물이 없어요." : "로그인하면 최근 매물을 볼 수 있어요."}
          </p>
        ) : (
          <div className="home__preview-grid">
            {usedListings.map((listing) => (
              <UsedListingCard key={listing.listingId} listing={listing} />
            ))}
          </div>
        )}
      </section>

      {/* 6. 뉴스 — 맨 아래 */}
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
