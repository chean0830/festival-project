import { useNavigate } from "react-router-dom";
import { formatPrice } from "../../../utils/formatPrice";
import { CATEGORY_LABEL, STATUS_LABEL, parseTags } from "../usedTradeCategories";
import "./UsedListingCard.css";

/**
 * MD 중고거래 매물 카드 (MdProductCard 스타일 미러).
 * 상세 조회는 비로그인도 가능해서, 카드 클릭 자체에는 로그인 가드를 걸지 않는다.
 */
function UsedListingCard({ listing }) {
  const navigate = useNavigate();
  const isClosed = listing.status !== "ON_SALE";

  function handleClick() {
    navigate(`/shop/used/${listing.listingId}`);
  }

  return (
    <div className="used-listing-card" role="button" tabIndex={0} onClick={handleClick}>
      <div className="used-listing-card__poster">
        {listing.imageUrl ? (
          <img src={listing.imageUrl} alt={listing.title} />
        ) : (
          "예시 이미지"
        )}
        <span className={`used-listing-card__status${isClosed ? " used-listing-card__status--closed" : ""}`}>
          {STATUS_LABEL[listing.status] ?? listing.status}
        </span>
      </div>

      <span className="used-listing-card__tag">{CATEGORY_LABEL[listing.category] ?? listing.category}</span>
      <p className="used-listing-card__title">{listing.title}</p>
      <p className="used-listing-card__price">{formatPrice(listing.price)}</p>
      {parseTags(listing.tags).length > 0 && (
        <p className="used-listing-card__hashtags">{parseTags(listing.tags).join(" ")}</p>
      )}
      <p className="used-listing-card__meta">
        <span>{listing.region ?? "지역 미정"}</span>
        <span className="used-listing-card__like">
          <span aria-hidden="true">♥</span>
          {listing.likeCount}
        </span>
      </p>
    </div>
  );
}

export default UsedListingCard;
