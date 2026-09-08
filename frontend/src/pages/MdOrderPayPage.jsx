import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import Layout from "../components/common/Layout/Layout";
import RequireLogin from "../features/profile/components/RequireLogin";
import useCurrentMember from "../features/profile/hooks/useCurrentMember";
import { fetchMdOrder } from "../api/mdShopApi";
import { formatPrice } from "../utils/formatPrice";
import { PAYMENT_METHOD_LABELS, requestTossPayment } from "../utils/tossPayment";
import "./MdOrderPage.css";

/**
 * 프로필의 "결제 대기" 예약을 결제하는 페이지.
 * 결제 수단을 누르면 Toss Payments 결제창으로 이동하고, 결제가 끝나면
 * /payment/result에서 서버에 결제 승인을 요청해 주문 status를 PAID로 확정한다.
 */
function MdOrderPayPage() {
  const { orderId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const currentMember = useCurrentMember();
  const memberId = currentMember?.memberId;

  const [order, setOrder] = useState(location.state?.order);
  const [loadError, setLoadError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!memberId || order) {
      return undefined;
    }

    let cancelled = false;

    fetchMdOrder(memberId, orderId)
      .then((data) => {
        if (!cancelled) setOrder(data);
      })
      .catch((err) => {
        if (!cancelled) setLoadError(err.message);
      });

    return () => {
      cancelled = true;
    };
  }, [memberId, orderId, order]);

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

  if (loadError) {
    return (
      <Layout>
        <div className="md-order-page">
          <p className="md-order-page__empty">{loadError}</p>
        </div>
      </Layout>
    );
  }

  if (!order) {
    return (
      <Layout>
        <div className="md-order-page">불러오는 중...</div>
      </Layout>
    );
  }

  if (order.status !== "PAYMENT_WAIT") {
    return (
      <Layout>
        <div className="md-order-page">
          <p className="md-order-page__empty">이미 처리된 예약이에요.</p>
          <button
            type="button"
            className="md-order-page__btn-primary"
            onClick={() => navigate("/profile", { state: { scrollTo: "mdOrders" } })}
          >
            프로필로 돌아가기
          </button>
        </div>
      </Layout>
    );
  }

  async function handlePay(methodLabel) {
    setSubmitting(true);
    setError(null);
    try {
      await requestTossPayment({
        methodLabel,
        domainPrefix: "MD",
        domainId: order.orderId,
        amount: order.totalPrice,
        orderName: order.productName,
        customerName: order.shippingName,
      });
      // 성공 시 브라우저가 Toss 결제창으로 이동하므로 이후 코드는 실행되지 않는다.
    } catch (err) {
      setError(err.message);
      setSubmitting(false);
    }
  }

  return (
    <Layout>
      <div className="md-order-page">
        <h1>MD 사전예약 결제</h1>

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
            <span>예약번호</span>
            <span>{order.orderNumber}</span>
          </div>
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

        <div className="md-order-page__field">
          <label>결제 수단</label>
          <div className="md-order-page__payment-methods">
            {PAYMENT_METHOD_LABELS.map((method) => (
              <button
                key={method}
                type="button"
                className="md-order-page__payment-method md-order-page__payment-method--active"
                disabled={submitting}
                onClick={() => handlePay(method)}
              >
                {method}
              </button>
            ))}
          </div>
        </div>

        <div className="md-order-page__preparing">
          Toss Payments 결제창으로 이동해요. 테스트 결제라 실제로 돈이 빠져나가지 않아요.
        </div>

        {error && <p className="md-order-page__error">{error}</p>}

        <div className="md-order-page__total">
          <span>총 결제 금액</span>
          <strong>{formatPrice(order.totalPrice)}</strong>
        </div>

        <div className="md-order-page__actions">
          <button
            type="button"
            className="md-order-page__btn-ghost"
            onClick={() => navigate("/profile", { state: { scrollTo: "mdOrders" } })}
          >
            취소
          </button>
        </div>
      </div>
    </Layout>
  );
}

export default MdOrderPayPage;
