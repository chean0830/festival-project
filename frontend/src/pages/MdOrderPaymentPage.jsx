import { useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import Layout from "../components/common/Layout/Layout";
import RequireLogin from "../features/profile/components/RequireLogin";
import useCurrentMember from "../features/profile/hooks/useCurrentMember";
import { createMdOrder } from "../api/mdShopApi";
import { formatPrice } from "../utils/formatPrice";
import "./MdOrderPage.css";

const PAYMENT_METHODS = ["카드 결제", "계좌 이체", "간편 결제"];

/**
 * MD 사전예약 - 결제 페이지.
 * 실제 결제(PG) 연동은 아직 없어서 결제 수단 선택은 비활성화 상태로만 보여준다.
 * 다만 "예약 완료하기"는 실제로 주문(사전예약)을 생성한다 — 결제는 나중에,
 * 예약 자체는 지금 확정한다는 개념으로 status는 PAYMENT_WAIT으로 저장된다.
 * 이전 페이지(배송지 입력)에서 라우터 state로 넘어온 주문 정보가 없으면
 * 새로고침 등으로 직접 들어온 것으로 보고 안내 후 되돌아가게 한다.
 */
function MdOrderPaymentPage() {
  const { productId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const currentMember = useCurrentMember();
  const order = location.state;

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  if (currentMember === undefined) {
    return (
      <Layout>
        <div className="md-order-page">확인 중입니다...</div>
      </Layout>
    );
  }

  if (currentMember === null) {
    return <RequireLogin />;
  }

  if (!order) {
    return (
      <Layout>
        <div className="md-order-page">
          <p className="md-order-page__empty">주문 정보를 찾을 수 없어요. 배송지 입력부터 다시 진행해주세요.</p>
          <Link to={`/shop/preorder/${productId}/order`} className="md-order-page__back-link">
            ‹ 배송지 입력으로 돌아가기
          </Link>
        </div>
      </Layout>
    );
  }

  const { product, quantity, totalPrice, recipientName, address, phone } = order;

  async function handleConfirm() {
    setSubmitting(true);
    setError(null);
    try {
      const created = await createMdOrder(currentMember.memberId, {
        productId: product.productId,
        quantity,
        recipientName,
        address,
        phone,
      });
      navigate(`/shop/preorder/${productId}/complete`, {
        state: { order: created },
        replace: true,
      });
    } catch (err) {
      setError(err.message);
      setSubmitting(false);
    }
  }

  return (
    <Layout>
      <div className="md-order-page">
        <h1>사전예약 - 결제</h1>

        <div className="md-order-page__summary">
          <div className="md-order-page__summary-thumb">
            {product.imageUrl ? <img src={product.imageUrl} alt={product.name} /> : "예시 이미지"}
          </div>
          <div className="md-order-page__summary-info">
            <span className="md-order-page__summary-event">{product.eventName}</span>
            <p className="md-order-page__summary-name">{product.name}</p>
            <p className="md-order-page__summary-price">
              {formatPrice(product.price)} × {quantity}개
            </p>
          </div>
        </div>

        <div className="md-order-page__recap">
          <div className="md-order-page__recap-row">
            <span>받는 사람</span>
            <span>{recipientName}</span>
          </div>
          <div className="md-order-page__recap-row">
            <span>배송지</span>
            <span>{address}</span>
          </div>
          <div className="md-order-page__recap-row">
            <span>연락처</span>
            <span>{phone}</span>
          </div>
        </div>

        <div className="md-order-page__field">
          <label>결제 수단</label>
          <div className="md-order-page__payment-methods">
            {PAYMENT_METHODS.map((method) => (
              <button key={method} type="button" className="md-order-page__payment-method" disabled>
                {method}
              </button>
            ))}
          </div>
        </div>

        <div className="md-order-page__preparing">
          🚧 실제 결제 기능은 아직 준비 중입니다. 지금은 결제 없이 사전예약만 확정돼요.
        </div>

        {error && <p className="md-order-page__error">{error}</p>}

        <div className="md-order-page__total">
          <span>총 결제 금액</span>
          <strong>{formatPrice(totalPrice)}</strong>
        </div>

        <div className="md-order-page__actions">
          <Link to={`/shop/preorder/${productId}/order`} className="md-order-page__btn-ghost">
            이전으로
          </Link>
          <button type="button" className="md-order-page__btn-primary" disabled={submitting} onClick={handleConfirm}>
            {submitting ? "예약 처리 중..." : "예약 완료하기"}
          </button>
        </div>
      </div>
    </Layout>
  );
}

export default MdOrderPaymentPage;
