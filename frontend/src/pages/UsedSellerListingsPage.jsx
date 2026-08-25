import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Layout from "../components/common/Layout/Layout";
import RequireLogin from "../features/profile/components/RequireLogin";
import useCurrentMember from "../features/profile/hooks/useCurrentMember";
import UsedListingCard from "../components/usedtrade/UsedListingCard/UsedListingCard";
import { fetchUsedListings } from "../api/usedTradeApi";
import "./UsedTradePage.css";

/**
 * 특정 판매자가 등록한 다른 매물 목록. "/shop/used/sellers/:sellerId" 라우트.
 * 회원만 이용할 수 있고, 비회원은 로그인 안내로 보낸다.
 */
function UsedSellerListingsPage() {
  const { sellerId } = useParams();
  const currentMember = useCurrentMember();
  const memberId = currentMember?.memberId;

  const [listings, setListings] = useState([]);
  const [sellerNickname, setSellerNickname] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  useEffect(() => {
    if (!memberId) return undefined;

    let cancelled = false;
    setLoading(true);

    fetchUsedListings({ sellerId, size: 60 })
      .then((data) => {
        if (cancelled) return;
        setListings(data.items);
        setSellerNickname(data.items[0]?.sellerNickname ?? null);
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
  }, [memberId, sellerId]);

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

  return (
    <Layout>
      <section className="used-trade-page">
        <div className="used-trade-page__header">
          <div>
            <h1>{sellerNickname ? `${sellerNickname}님의 매물` : "판매자 매물"}</h1>
            <p className="used-trade-page__subtitle">
              <Link to="/shop">‹ MD 중고거래로 돌아가기</Link>
            </p>
          </div>
        </div>

        {loading && <p className="used-trade-page__empty">불러오는 중...</p>}
        {loadError && <p className="used-trade-page__empty">{loadError}</p>}

        {!loading && !loadError && (
          listings.length === 0 ? (
            <p className="used-trade-page__empty">등록된 매물이 없어요.</p>
          ) : (
            <div className="used-trade-page__grid">
              {listings.map((listing) => (
                <UsedListingCard key={listing.listingId} listing={listing} />
              ))}
            </div>
          )
        )}
      </section>
    </Layout>
  );
}

export default UsedSellerListingsPage;
