import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/common/Layout/Layout";
import WriteButton from "../components/community/WriteButton/WriteButton";
import PostCard from "../components/community/PostCard/PostCard";
import { COMMUNITY_CATEGORIES, categoryColor } from "../data/communityCategories";
import { getPosts } from "../api/communityApi";
import useCurrentMember from "../features/profile/hooks/useCurrentMember";
import "./CommunityPage.css";

const SORT_OPTIONS = [
  { key: "latest", label: "최신순" },
  { key: "popular", label: "인기순" },
];

function sortPosts(posts, sortBy) {
  if (sortBy !== "popular") return posts;
  return [...posts].sort((a, b) => b.likeCount * 2 + b.commentCount - (a.likeCount * 2 + a.commentCount));
}

/**
 * 커뮤니티 메인 페이지.
 * - 이용 규칙 모달은 부모 라우트인 CommunityLayout에서 관리함 (커뮤니티 안에서 이동하는 동안은 한 번만 뜸)
 * - 카테고리 필터(전체/공연후기/동행/질문/정보/이벤트/양도/자유게시판) + 키워드 검색 + 정렬(최신/인기)
 * - 글쓰기는 로그인 필요, 비로그인이면 로그인 페이지로 보냄
 */
function CommunityPage() {
  const navigate = useNavigate();
  const currentMember = useCurrentMember();

  const [category, setCategory] = useState(null);
  const [keyword, setKeyword] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [sortBy, setSortBy] = useState("latest");
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    getPosts({ category, keyword })
      .then((data) => {
        if (!cancelled) setPosts(data);
      })
      .catch(() => {
        if (!cancelled) setPosts([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [category, keyword]);

  const sortedPosts = useMemo(() => sortPosts(posts, sortBy), [posts, sortBy]);

  function handleSearchSubmit(event) {
    event.preventDefault();
    setKeyword(searchInput.trim());
  }

  function handleResetToAll() {
    setCategory(null);
    setKeyword("");
    setSearchInput("");
  }

  function handleWriteClick() {
    if (!currentMember?.memberId) {
      navigate("/login");
      return;
    }
    navigate("/community/new");
  }

  return (
    <Layout>
      <section className="community-page">
        <div className="community-page__header">
          <h1>
            <button type="button" className="community-page__title" onClick={handleResetToAll}>
              커뮤니티
            </button>
          </h1>
          <p className="community-page__desc">
            공연 후기부터 동행, 양도, 이벤트 소식까지 — 페스티벌 팬들과 자유롭게 나눠보세요.
          </p>
        </div>

        <nav className="community-page__filters">
          <button
            type="button"
            className={`community-page__chip${category === null ? " community-page__chip--active" : ""}`}
            onClick={() => setCategory(null)}
          >
            전체
          </button>
          {COMMUNITY_CATEGORIES.map((item) => (
            <button
              key={item.key}
              type="button"
              className={`community-page__chip${category === item.key ? " community-page__chip--active" : ""}`}
              onClick={() => setCategory(item.key)}
            >
              <span
                className="community-page__chip-dot"
                style={{ background: category === item.key ? "#fff" : categoryColor(item.key) }}
                aria-hidden="true"
              />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="community-page__toolbar">
          <form className="community-page__search-row" onSubmit={handleSearchSubmit}>
            <div className="community-page__search">
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
                <path d="M21 21l-4.3-4.3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
              <input
                type="text"
                placeholder="제목, 내용으로 검색"
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
              />
            </div>
            <button type="submit" className="community-page__search-btn">
              검색
            </button>
          </form>

          <div className="community-page__sort-write">
            <div className="community-page__sort">
              {SORT_OPTIONS.map((option) => (
                <button
                  key={option.key}
                  type="button"
                  className={`community-page__sort-link${
                    sortBy === option.key ? " community-page__sort-link--active" : ""
                  }`}
                  onClick={() => setSortBy(option.key)}
                >
                  {option.label}
                </button>
              ))}
            </div>
            <WriteButton onClick={handleWriteClick} />
          </div>
        </div>

        {loading ? (
          <div className="community-page__skeleton-list">
            {[0, 1, 2].map((i) => (
              <div key={i} className="community-page__skeleton-card" />
            ))}
          </div>
        ) : sortedPosts.length === 0 ? (
          <div className="community-page__empty">
            <span className="community-page__empty-icon" aria-hidden="true">
              {keyword ? "🔍" : "📝"}
            </span>
            <p>{keyword ? "검색 결과가 없어요." : "아직 게시글이 없어요. 첫 글을 남겨보세요!"}</p>
          </div>
        ) : (
          <div className="community-page__posts">
            {sortedPosts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </section>
    </Layout>
  );
}

export default CommunityPage;
