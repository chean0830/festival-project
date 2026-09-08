import { useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import Layout from "../components/common/Layout/Layout";
import RequireLogin from "../features/profile/components/RequireLogin";
import useCurrentMember from "../features/profile/hooks/useCurrentMember";
import { createMdOrder } from "../api/mdShopApi";
import { formatPrice } from "../utils/formatPrice";
import { PAYMENT_METHOD_LABELS, requestTossPayment } from "../utils/tossPayment";
import "./MdOrderPage.css";

/**
 * MD 사전예약 - 결제 페이지.
 * "예약 완료하기"를 누르면 먼저 주문(사전예약, status=PAYMENT_WAIT)을 생성하고,
 * 곧바로 Toss Payments 결제창으로 넘어간다. 결제가 끝나면 Toss가 브라우저를
 * /payment/result로 돌려보내고, 거기서 서버에 결제 승인을 요청해 PAID로 확정한다.
 * 이전 페이지(배송지 입력)에서 라우터 state로 넘어온 주문 정보가 없으면
 * 새로고침 등으로 직접 들어온 것으로 보고 안내 후 되돌아가게 한다.
 */
function MdOrderPaymentPage() {
  const { productId } = useParams();
  const location = useLocation();
  const currentMember = useCurrentMember();
  const order = location.state;

  const [createdOrder, setCreatedOrder] = useState(null);
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

  async function handlePay(methodLabel) {
    setSubmitting(true);
    setError(null);
    try {
      const target =
        createdOrder ??
        (await createMdOrder(currentMember.memberId, {
          productId: product.productId,
          quantity,
          recipientName,
          address,
          phone,
        }));
      setCreatedOrder(target);

      await requestTossPayment({
        methodLabel,
        domainPrefix: "MD",
        domainId: target.orderId,
        amount: target.totalPrice,
        orderName: target.productName,
        customerName: target.shippingName,
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
          <strong>{formatPrice(totalPrice)}</strong>
        </div>

        <div className="md-order-page__actions">
          <Link to={`/shop/preorder/${productId}/order`} className="md-order-page__btn-ghost">
            이전으로
          </Link>
        </div>
      </div>
    </Layout>
  );
}

export default MdOrderPaymentPage;
