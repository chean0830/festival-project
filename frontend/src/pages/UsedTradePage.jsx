import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/common/Layout/Layout";
import RequireLogin from "../features/profile/components/RequireLogin";
import UsedListingCard from "../components/usedtrade/UsedListingCard/UsedListingCard";
import { CATEGORY_LABEL, SORT_LABEL, SORT_OPTIONS, USED_TRADE_CATEGORIES } from "../components/usedtrade/usedTradeCategories";
import useCurrentMember from "../features/profile/hooks/useCurrentMember";
import { fetchUsedListings } from "../api/usedTradeApi";
import "./UsedTradePage.css";

const ALL_CATEGORY = "전체";

/**
 * MD 중고거래 둘러보기 페이지. "/shop" 라우트.
 * 회원만 이용할 수 있고, 비회원은 로그인 안내로 보낸다.
 * 아티스트 MD / 페스티벌 MD / 음반, 세 카테고리로 한정된 매물만 다룬다.
 * 검색창에 "#"으로 시작하면 해시태그 검색, 아니면 제목/설명 검색으로 처리한다.
 */
function UsedTradePage() {
  const navigate = useNavigate();
  const currentMember = useCurrentMember();
  const memberId = currentMember?.memberId;

  const [page, setPage] = useState({ items: [], page: 0, size: 20, totalElements: 0, totalPages: 0, hasNext: false });
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  const [activeCategory, setActiveCategory] = useState(ALL_CATEGORY);
  const [sort, setSort] = useState("NEWEST");
  const [onSaleOnly, setOnSaleOnly] = useState(false);
  const [minPriceInput, setMinPriceInput] = useState("");
  const [maxPriceInput, setMaxPriceInput] = useState("");
  const [activeMinPrice, setActiveMinPrice] = useState("");
  const [activeMaxPrice, setActiveMaxPrice] = useState("");

  const [searchInput, setSearchInput] = useState("");
  const [activeTag, setActiveTag] = useState("");
  const [activeKeyword, setActiveKeyword] = useState("");

  const [pageIndex, setPageIndex] = useState(0);

  useEffect(() => {
    if (!memberId) return undefined;

    let cancelled = false;
    setLoading(true);

    fetchUsedListings({
      category: activeCategory === ALL_CATEGORY ? undefined : activeCategory,
      tag: activeTag || undefined,
      keyword: activeKeyword || undefined,
      minPrice: activeMinPrice || undefined,
      maxPrice: activeMaxPrice || undefined,
      onSaleOnly,
      sort,
      page: pageIndex,
    })
      .then((data) => {
        if (!cancelled) setPage(data);
      })
      .catch((err) => {
        if (!cancelled) setLoadError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [memberId, activeCategory, activeTag, activeKeyword, activeMinPrice, activeMaxPrice, onSaleOnly, sort, pageIndex]);

  // 필터/정렬이 바뀌면 항상 1페이지부터 다시 본다.
  useEffect(() => {
    setPageIndex(0);
  }, [activeCategory, activeTag, activeKeyword, activeMinPrice, activeMaxPrice, onSaleOnly, sort]);

  function handleSearchSubmit(event) {
    event.preventDefault();
    const trimmed = searchInput.trim();
    if (trimmed.startsWith("#")) {
      setActiveTag(trimmed);
      setActiveKeyword("");
    } else {
      setActiveKeyword(trimmed);
      setActiveTag("");
    }
  }

  function handleClearSearch() {
    setSearchInput("");
    setActiveTag("");
    setActiveKeyword("");
  }

  function handlePriceFilterSubmit(event) {
    event.preventDefault();
    setActiveMinPrice(minPriceInput);
    setActiveMaxPrice(maxPriceInput);
  }

  function handleSellClick() {
    navigate("/shop/used/new");
  }

  if (currentMember === undefined) {
    return (
      <Layout>
        <div className="used-trade-page">확인 중입니다...</div>
      </Layout>
    );
  }

  if (currentMember === null) {
    return <RequireLogin />;
  }

  const activeSearchLabel = activeTag || activeKeyword;

  return (
    <Layout>
      <section className="used-trade-page">
        <div className="used-trade-page__header">
          <div>
            <h1>MD 중고거래</h1>
            <p className="used-trade-page__subtitle">
              아티스트 MD, 페스티벌 MD, 음반만 거래할 수 있어요.
            </p>
          </div>
          <button type="button" className="used-trade-page__sell-button" onClick={handleSellClick}>
            판매하기
          </button>
        </div>

        <form className="used-trade-page__search" onSubmit={handleSearchSubmit}>
          <input
            type="text"
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder="제목으로 검색하거나 #해시태그로 검색 (예: 티셔츠, #넬)"
          />
          <button type="submit">검색</button>
          {activeSearchLabel && (
            <button type="button" className="used-trade-page__search-clear" onClick={handleClearSearch}>
              {activeTag ? `#${activeTag.replace(/^#/, "")}` : activeKeyword} 지우기
            </button>
          )}
        </form>

        <nav className="used-trade-page__tabs">
          <button
            type="button"
            className={`used-trade-page__tab${activeCategory === ALL_CATEGORY ? " used-trade-page__tab--active" : ""}`}
            onClick={() => setActiveCategory(ALL_CATEGORY)}
          >
            {ALL_CATEGORY}
          </button>
          {USED_TRADE_CATEGORIES.map((category) => (
            <button
              key={category}
              type="button"
              className={`used-trade-page__tab${category === activeCategory ? " used-trade-page__tab--active" : ""}`}
              onClick={() => setActiveCategory(category)}
            >
              {CATEGORY_LABEL[category]}
            </button>
          ))}
        </nav>

        <div className="used-trade-page__filter-row">
          <form className="used-trade-page__price-filter" onSubmit={handlePriceFilterSubmit}>
            <input
              type="number"
              min="0"
              inputMode="numeric"
              value={minPriceInput}
              onChange={(event) => setMinPriceInput(event.target.value)}
              placeholder="최소 가격"
            />
            <span>~</span>
            <input
              type="number"
              min="0"
              inputMode="numeric"
              value={maxPriceInput}
              onChange={(event) => setMaxPriceInput(event.target.value)}
              placeholder="최대 가격"
            />
            <button type="submit">적용</button>
          </form>

          <label className="used-trade-page__onsale-toggle">
            <input type="checkbox" checked={onSaleOnly} onChange={(event) => setOnSaleOnly(event.target.checked)} />
            판매중만 보기
          </label>

          <select className="used-trade-page__sort" value={sort} onChange={(event) => setSort(event.target.value)}>
            {SORT_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {SORT_LABEL[option]}
              </option>
            ))}
          </select>
        </div>

        {loading && <p className="used-trade-page__empty">불러오는 중...</p>}
        {loadError && <p className="used-trade-page__empty">{loadError}</p>}

        {!loading && !loadError && (
          page.items.length === 0 ? (
            <p className="used-trade-page__empty">등록된 매물이 없어요.</p>
          ) : (
            <>
              <div className="used-trade-page__grid">
                {page.items.map((listing) => (
                  <UsedListingCard key={listing.listingId} listing={listing} />
                ))}
              </div>

              {page.totalPages > 1 && (
                <div className="used-trade-page__pagination">
                  <button
                    type="button"
                    disabled={page.page <= 0}
                    onClick={() => setPageIndex((prev) => Math.max(0, prev - 1))}
                  >
                    이전
                  </button>
                  <span>
                    {page.page + 1} / {page.totalPages}
                  </span>
                  <button type="button" disabled={!page.hasNext} onClick={() => setPageIndex((prev) => prev + 1)}>
                    다음
                  </button>
                </div>
              )}
            </>
          )
        )}
      </section>
    </Layout>
  );
}

export default UsedTradePage;
