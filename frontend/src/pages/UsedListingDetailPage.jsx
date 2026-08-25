import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Layout from "../components/common/Layout/Layout";
import RequireLogin from "../features/profile/components/RequireLogin";
import useCurrentMember from "../features/profile/hooks/useCurrentMember";
import {
  deleteUsedListing,
  fetchLikeStatus,
  fetchUsedListing,
  likeUsedListing,
  requestUsedPurchase,
  unlikeUsedListing,
} from "../api/usedTradeApi";
import { reportContent } from "../api/communityApi";
import { CATEGORY_LABEL, STATUS_LABEL, parseTags } from "../components/usedtrade/usedTradeCategories";
import { formatPrice } from "../utils/formatPrice";
import "./UsedListingDetailPage.css";

/**
 * MD 중고거래 매물 상세 페이지. "/shop/used/:listingId" 라우트.
 * 회원만 이용할 수 있고, 비회원은 로그인 안내로 보낸다.
 */
function UsedListingDetailPage() {
  const { listingId } = useParams();
  const navigate = useNavigate();
  const currentMember = useCurrentMember();
  const memberId = currentMember?.memberId;

  const [listing, setListing] = useState(undefined);
  const [loadError, setLoadError] = useState(null);
  const [likeStatus, setLikeStatus] = useState(null);
  const [actionError, setActionError] = useState(null);
  const [actionMessage, setActionMessage] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  useEffect(() => {
    if (!memberId) return undefined;

    let cancelled = false;

    fetchUsedListing(listingId)
      .then((data) => {
        if (!cancelled) setListing(data);
      })
      .catch((err) => {
        if (!cancelled) setLoadError(err.message);
      });

    return () => {
      cancelled = true;
    };
  }, [memberId, listingId]);

  useEffect(() => {
    if (!memberId) {
      setLikeStatus(null);
      return undefined;
    }
    let cancelled = false;
    fetchLikeStatus(memberId, listingId)
      .then((data) => {
        if (!cancelled) setLikeStatus(data);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [memberId, listingId]);

  async function handleToggleLike() {
    try {
      const next = likeStatus?.liked
        ? await unlikeUsedListing(memberId, listingId)
        : await likeUsedListing(memberId, listingId);
      setLikeStatus(next);
    } catch (err) {
      setActionError(err.message);
    }
  }

  async function handleRequestPurchase() {
    setSubmitting(true);
    setActionError(null);
    try {
      await requestUsedPurchase(memberId, listingId);
      setActionMessage("구매 요청을 보냈어요. 판매자의 승인을 기다려주세요.");
    } catch (err) {
      setActionError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleReport() {
    const reason = window.prompt("신고 사유를 입력해주세요 (선택 입력 가능)");
    if (reason === null) return;
    try {
      await reportContent(memberId, { targetType: "LISTING", targetId: Number(listingId), reason });
      window.alert("신고가 접수됐어요.");
    } catch (err) {
      window.alert(err.message);
    }
  }

  async function handleDelete() {
    setDeleting(true);
    setActionError(null);
    try {
      await deleteUsedListing(memberId, listingId);
      navigate("/shop");
    } catch (err) {
      setActionError(err.message);
      setDeleting(false);
    }
  }

  if (currentMember === undefined) {
    return (
      <Layout>
        <div className="used-listing-detail">확인 중입니다...</div>
      </Layout>
    );
  }

  if (currentMember === null) {
    return <RequireLogin />;
  }

  if (loadError) {
    return (
      <Layout>
        <div className="used-listing-detail">
          <p className="used-listing-detail__empty">{loadError}</p>
          <Link to="/shop" className="used-listing-detail__back-link">
            ‹ MD 중고거래로 돌아가기
          </Link>
        </div>
      </Layout>
    );
  }

  if (listing === undefined) {
    return (
      <Layout>
        <div className="used-listing-detail">불러오는 중...</div>
      </Layout>
    );
  }

  const isSeller = memberId && listing.sellerId === memberId;
  const isPurchasable = listing.status === "ON_SALE" && !isSeller;
  const images = listing.imageUrls ?? [];

  return (
    <Layout>
      <div className="used-listing-detail">
        <div>
          <div className="used-listing-detail__poster">
            {images.length > 0 ? (
              <img src={images[activeImageIndex] ?? images[0]} alt={listing.title} />
            ) : (
              "예시 이미지"
            )}
          </div>
          {images.length > 1 && (
            <div className="used-listing-detail__thumbs">
              {images.map((url, index) => (
                <button
                  key={url + index}
                  type="button"
                  className={`used-listing-detail__thumb${index === activeImageIndex ? " used-listing-detail__thumb--active" : ""}`}
                  onClick={() => setActiveImageIndex(index)}
                >
                  <img src={url} alt={`${listing.title} ${index + 1}`} />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="used-listing-detail__info">
          <span className="used-listing-detail__tag">{CATEGORY_LABEL[listing.category] ?? listing.category}</span>
          <h1>{listing.title}</h1>
          <p className="used-listing-detail__price">{formatPrice(listing.price)}</p>
          <p className="used-listing-detail__status">{STATUS_LABEL[listing.status] ?? listing.status}</p>
          {parseTags(listing.tags).length > 0 && (
            <p className="used-listing-detail__hashtags">{parseTags(listing.tags).join(" ")}</p>
          )}

          <dl className="used-listing-detail__meta">
            <div>
              <dt>판매자</dt>
              <dd>
                <Link to={`/shop/used/sellers/${listing.sellerId}`} className="used-listing-detail__seller-link">
                  {listing.sellerNickname}
                </Link>
                {!isSeller && (
                  <button type="button" className="used-listing-detail__report-link" onClick={handleReport}>
                    신고
                  </button>
                )}
              </dd>
            </div>
            <div>
              <dt>거래 방식</dt>
              <dd>{listing.tradeMethod ?? "미정"}</dd>
            </div>
            <div>
              <dt>지역</dt>
              <dd>{listing.region ?? "미정"}</dd>
            </div>
            <div>
              <dt>상태</dt>
              <dd>{listing.condition ?? "미정"}</dd>
            </div>
          </dl>

          {listing.description && <p className="used-listing-detail__description">{listing.description}</p>}

          {actionError && <p className="used-listing-detail__error">{actionError}</p>}
          {actionMessage && <p className="used-listing-detail__notice">{actionMessage}</p>}

          <div className="used-listing-detail__actions">
            {isSeller ? (
              <>
                <button
                  type="button"
                  className="used-listing-detail__like-button"
                  disabled={listing.status === "CANCELED"}
                  onClick={() => navigate(`/shop/used/${listingId}/edit`)}
                >
                  수정
                </button>
                <button
                  type="button"
                  className="used-listing-detail__buy-button"
                  disabled={listing.status !== "ON_SALE"}
                  onClick={() => setConfirmingDelete(true)}
                >
                  삭제
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  className={`used-listing-detail__heart-btn${likeStatus?.liked ? " used-listing-detail__heart-btn--active" : ""}`}
                  aria-label={likeStatus?.liked ? "찜 취소" : "찜하기"}
                  aria-pressed={likeStatus?.liked ?? false}
                  onClick={handleToggleLike}
                >
                  <svg viewBox="0 0 24 24" width="22" height="22" stroke="currentColor" strokeWidth="2">
                    <path
                      d="M12 21s-7.5-4.8-10-9.5C0.3 8 1.7 4.5 5 3.6c2.1-0.6 4.3 0.3 5.6 2.1L12 7.5l1.4-1.8c1.3-1.8 3.5-2.7 5.6-2.1 3.3 0.9 4.7 4.4 3 7.9C19.5 16.2 12 21 12 21z"
                      fill={likeStatus?.liked ? "currentColor" : "none"}
                    />
                  </svg>
                  <span className="used-listing-detail__heart-count">{likeStatus?.likeCount ?? listing.likeCount}</span>
                </button>
                <button
                  type="button"
                  className="used-listing-detail__buy-button"
                  disabled={!isPurchasable || submitting}
                  onClick={handleRequestPurchase}
                >
                  {isPurchasable ? "구매 요청하기" : "거래 불가"}
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {confirmingDelete && (
        <div className="used-listing-detail__modal-backdrop" onClick={() => !deleting && setConfirmingDelete(false)}>
          <div className="used-listing-detail__modal" onClick={(event) => event.stopPropagation()}>
            <p>매물을 삭제하겠습니까?</p>
            <div className="used-listing-detail__modal-actions">
              <button type="button" disabled={deleting} onClick={() => setConfirmingDelete(false)}>
                아니요
              </button>
              <button type="button" disabled={deleting} onClick={handleDelete}>
                {deleting ? "삭제하는 중..." : "예"}
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}

export default UsedListingDetailPage;
