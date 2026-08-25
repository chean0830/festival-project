import { useNavigate } from "react-router-dom";
import useCurrentMember from "../../../features/profile/hooks/useCurrentMember";
import { todayIso } from "../../../utils/todayIso";
import { formatPrice } from "../../../utils/formatPrice";
import "./MdProductCard.css";

function formatDeadline(preorderDeadline) {
  if (!preorderDeadline) return "";
  const deadlineDate = preorderDeadline.slice(0, 10);
  const today = todayIso();
  if (deadlineDate < today) return "예약 마감";

  const diffMs = new Date(deadlineDate) - new Date(today);
  const dDay = Math.round(diffMs / (1000 * 60 * 60 * 24));
  if (dDay === 0) return "오늘 마감";
  return `D-${dDay} 마감`;
}

/**
 * MD 사전예약 상품 카드 (쇼핑몰 스타일).
 * "사전예약하기"를 누르면 배송지 입력 페이지(주문서)로 이동한다.
 * 비회원이면 주문서로 보내지 않고 바로 로그인 페이지로 보낸다.
 */
function MdProductCard({ product }) {
  const navigate = useNavigate();
  const currentMember = useCurrentMember();
  const isDeadlinePassed = formatDeadline(product.preorderDeadline) === "예약 마감";
  const isSoldOut = product.stock <= 0;
  const isClosed = isDeadlinePassed || isSoldOut;

  function handleClick() {
    if (!currentMember?.memberId) {
      navigate("/login");
      return;
    }
    navigate(`/shop/preorder/${product.productId}/order`);
  }

  return (
    <div className="md-product-card">
      <div className="md-product-card__poster">
        {product.imageUrl ? (
          <img src={product.imageUrl} alt={product.name} />
        ) : (
          "예시 이미지"
        )}
        <span className={`md-product-card__deadline${isClosed ? " md-product-card__deadline--closed" : ""}`}>
          {isSoldOut ? "품절" : formatDeadline(product.preorderDeadline)}
        </span>
      </div>

      <span className="md-product-card__event">{product.eventName}</span>
      <p className="md-product-card__name">{product.name}</p>
      <p className="md-product-card__price">{formatPrice(product.price)}</p>
      <p className="md-product-card__stock">남은 재고 {product.stock}개</p>

      <button type="button" className="md-product-card__cta" disabled={isClosed} onClick={handleClick}>
        {isSoldOut ? "품절" : isDeadlinePassed ? "예약 마감" : "사전예약하기"}
      </button>
    </div>
  );
}

export default MdProductCard;
