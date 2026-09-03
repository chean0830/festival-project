import { useNavigate } from "react-router-dom";
import useCurrentMember from "../../../features/profile/hooks/useCurrentMember";
import { formatPrice } from "../../../utils/formatPrice";
import { formatDeadline, isDeadlinePassed, isSoldOut } from "../../../utils/mdPreorderStatus";
import "./MdProductCard.css";

/**
 * MD 사전예약 상품 카드 (쇼핑몰 스타일).
 * - 사진/상품명 등 카드 본문을 누르면 상품 상세 페이지로 이동한다. (마감된 상품도 확인 가능)
 * - "사전예약하기"를 누르면 배송지 입력 페이지(주문서)로 이동한다.
 *   비회원이면 주문서로 보내지 않고 바로 로그인 페이지로 보낸다.
 * - 마감/품절 상품은 버튼이 "예약 마감"/"품절"로 비활성화된다.
 */
function MdProductCard({ product }) {
  const navigate = useNavigate();
  const currentMember = useCurrentMember();
  const deadlinePassed = isDeadlinePassed(product);
  const soldOut = isSoldOut(product);
  const isClosed = deadlinePassed || soldOut;

  function goToDetail() {
    navigate(`/shop/preorder/${product.productId}`);
  }

  function handleReserve() {
    if (!currentMember?.memberId) {
      navigate("/login");
      return;
    }
    navigate(`/shop/preorder/${product.productId}/order`);
  }

  return (
    <div className="md-product-card">
      <div
        className="md-product-card__body"
        role="button"
        tabIndex={0}
        onClick={goToDetail}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            goToDetail();
          }
        }}
      >
        <div className="md-product-card__poster">
          {product.imageUrl ? (
            <img src={product.imageUrl} alt={product.name} />
          ) : (
            "예시 이미지"
          )}
          <span className={`md-product-card__deadline${isClosed ? " md-product-card__deadline--closed" : ""}`}>
            {soldOut ? "품절" : formatDeadline(product.preorderDeadline)}
          </span>
        </div>

        <span className="md-product-card__event">{product.eventName}</span>
        <p className="md-product-card__name">{product.name}</p>
        <p className="md-product-card__price">{formatPrice(product.price)}</p>
        <p className="md-product-card__stock">남은 재고 {product.stock}개</p>
      </div>

      <button type="button" className="md-product-card__cta" disabled={isClosed} onClick={handleReserve}>
        {soldOut ? "품절" : deadlinePassed ? "예약 마감" : "사전예약하기"}
      </button>
    </div>
  );
}

export default MdProductCard;
