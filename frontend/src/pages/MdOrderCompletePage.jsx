import { useLocation, useNavigate } from "react-router-dom";
import Layout from "../components/common/Layout/Layout";
import { formatPrice } from "../utils/formatPrice";
import "./MdOrderPage.css";

/**
 * MD 사전예약 완료 화면. 결제 페이지에서 예약(주문) 생성이 끝난 직후에만 보여준다.
 * "확인"을 누르면 MD 사전예약 목록으로 돌아간다.
 */
function MdOrderCompletePage() {
  const location = useLocation();
  const navigate = useNavigate();
  const order = location.state?.order;

  if (!order) {
    return (
      <Layout>
        <div className="md-order-page">
          <p className="md-order-page__empty">예약 정보를 찾을 수 없어요.</p>
          <button
            type="button"
            className="md-order-page__btn-primary"
            onClick={() => navigate("/shop/preorder")}
          >
            MD 사전예약으로 돌아가기
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="md-order-page md-order-page--complete">
        <div className="md-order-page__complete-icon">🎉</div>
        <h1>예약이 완료되었습니다</h1>
        <p className="md-order-page__complete-order-number">
          예약번호 <strong>{order.orderNumber}</strong>
        </p>

        <div className="md-order-page__summary">
          <div className="md-order-page__summary-thumb">
            {order.productImageUrl ? (
              <img src={order.productImageUrl} alt={order.productName} />
            ) : (
              "예시 이미지"
            )}
          </div>
          <div className="md-order-page__summary-info">
            <p className="md-order-page__summary-name">{order.productName}</p>
            <p className="md-order-page__summary-price">
              {formatPrice(order.totalPrice)} ({order.quantity}개)
            </p>
          </div>
        </div>

        <div className="md-order-page__recap">
          <div className="md-order-page__recap-row">
            <span>받는 사람</span>
            <span>{order.shippingName}</span>
          </div>
          <div className="md-order-page__recap-row">
            <span>배송지</span>
            <span>{order.shippingAddress}</span>
          </div>
          <div className="md-order-page__recap-row">
            <span>연락처</span>
            <span>{order.shippingPhone}</span>
          </div>
        </div>

        <div className="md-order-page__complete-actions">
          <button type="button" className="md-order-page__complete-btn" onClick={() => navigate("/")}>
            홈
          </button>
          <button
            type="button"
            className="md-order-page__complete-btn"
            onClick={() => navigate("/profile", { state: { scrollTo: "mdOrders" } })}
          >
            예약 조회
          </button>
          <button
            type="button"
            className="md-order-page__complete-btn md-order-page__complete-btn--primary"
            onClick={() => navigate("/shop/preorder")}
          >
            확인
          </button>
        </div>
      </div>
    </Layout>
  );
}

export default MdOrderCompletePage;
