import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Layout from "../components/common/Layout/Layout";
import RequireLogin from "../features/profile/components/RequireLogin";
import useCurrentMember from "../features/profile/hooks/useCurrentMember";
import { formatPrice } from "../utils/formatPrice";
import { PAYMENT_METHOD_LABELS, requestTossPayment } from "../utils/tossPayment";
import "./MdOrderPage.css";

/**
 * 중고거래 구매 요청(APPROVED)에 대한 결제 페이지.
 * 프로필의 "내가 보낸 구매 요청" 목록에서 거래 정보를 라우터 state로 받아 들어온다.
 */
function UsedTransactionPaymentPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const currentMember = useCurrentMember();
  const transaction = location.state?.transaction;

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

  if (!transaction) {
    return (
      <Layout>
        <div className="md-order-page">
          <p className="md-order-page__empty">거래 정보를 찾을 수 없어요. 프로필에서 다시 시도해주세요.</p>
          <Link to="/profile" className="md-order-page__back-link">
            ‹ 프로필로 돌아가기
          </Link>
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
        domainPrefix: "USED",
        domainId: transaction.transactionId,
        amount: transaction.price,
        orderName: transaction.listingTitle,
        customerName: currentMember.nickname,
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
        <h1>중고거래 결제</h1>

        <div className="md-order-page__summary">
          <div className="md-order-page__summary-thumb">
            {transaction.listingImageUrl ? (
              <img src={transaction.listingImageUrl} alt={transaction.listingTitle} />
            ) : (
              "예시 이미지"
            )}
          </div>
          <div className="md-order-page__summary-info">
            <p className="md-order-page__summary-name">{transaction.listingTitle}</p>
            <p className="md-order-page__summary-price">판매자 {transaction.sellerNickname}</p>
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
          <strong>{formatPrice(transaction.price)}</strong>
        </div>

        <div className="md-order-page__actions">
          <button
            type="button"
            className="md-order-page__btn-ghost"
            onClick={() => navigate("/profile", { state: { scrollTo: "usedTrade" } })}
          >
            취소
          </button>
        </div>
      </div>
    </Layout>
  );
}

export default UsedTransactionPaymentPage;
