import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Layout from "../components/common/Layout/Layout";
import RequireLogin from "../features/profile/components/RequireLogin";
import useCurrentMember from "../features/profile/hooks/useCurrentMember";
import { confirmMdOrderPayment } from "../api/mdShopApi";
import { confirmUsedTransactionPayment } from "../api/usedTradeApi";
import { confirmLiveDonation } from "../features/live/api/donationApi";
import { confirmLiveAdmission } from "../features/live/api/admissionApi";
import { formatPrice } from "../utils/formatPrice";
import { parseTossOrderId } from "../utils/tossPayment";
import "./MdOrderPage.css";

/**
 * Toss Payments 결제창(successUrl/failUrl)이 공통으로 돌아오는 페이지.
 * orderId(Toss 주문번호)의 "MD_" / "USED_" / "DONATION_" / "LIVE_" 접두사로 어떤 도메인의 결제인지 구분해서
 * 해당 도메인의 결제 승인 API를 호출한다.
 */
function PaymentResultPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const currentMember = useCurrentMember();
  const memberId = currentMember?.memberId;

  const [state, setState] = useState("checking"); // checking | success | fail
  const [data, setData] = useState(null);
  const [message, setMessage] = useState(null);
  const resultParam = params.get("result");
  const isDirectFail = resultParam === "fail";

  const tossOrderId = params.get("orderId");
  const paymentKey = params.get("paymentKey");
  const amount = Number(params.get("amount"));
  const { domainPrefix, domainId } = parseTossOrderId(tossOrderId);
  const supportedDomains = ["MD", "USED", "DONATION", "LIVE"];
  const isMalformed = !isDirectFail && (
    !supportedDomains.includes(domainPrefix) || !domainId || !paymentKey || !Number.isFinite(amount)
  );

  useEffect(() => {
    if (!memberId || isDirectFail || isMalformed) return undefined;

    let cancelled = false;
    let confirm;
    if (domainPrefix === "MD") {
      confirm = confirmMdOrderPayment(memberId, domainId, { paymentKey, orderId: tossOrderId, amount });
    } else if (domainPrefix === "USED") {
      confirm = confirmUsedTransactionPayment(memberId, domainId, { paymentKey, orderId: tossOrderId, amount });
    } else if (domainPrefix === "DONATION") {
      confirm = confirmLiveDonation(domainId, { paymentKey, orderId: tossOrderId, amount });
    } else {
      confirm = confirmLiveAdmission(domainId, { paymentKey, orderId: tossOrderId, amount });
    }

    confirm
      .then((result) => {
        if (cancelled) return;
        setData({ domainPrefix, result });
        setState("success");
      })
      .catch((err) => {
        if (cancelled) return;
        setMessage(err.message);
        setState("fail");
      });

    return () => {
      cancelled = true;
    };
  }, [memberId, isDirectFail, isMalformed, domainPrefix, domainId, paymentKey, tossOrderId, amount]);

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

  if (isDirectFail || isMalformed || state === "fail") {
    const failMessage = isDirectFail
      ? params.get("message") || "결제가 취소되었거나 실패했어요."
      : isMalformed
        ? "결제 정보를 확인할 수 없어요."
        : message;
    return (
      <Layout>
        <div className="md-order-page md-order-page--complete">
          <div className="md-order-page__complete-icon">😥</div>
          <h1>결제를 완료하지 못했어요</h1>
          <p className="md-order-page__empty">{failMessage}</p>
          <div className="md-order-page__complete-actions">
            <button type="button" className="md-order-page__complete-btn" onClick={() => navigate("/")}>
              홈
            </button>
            {domainPrefix === "LIVE" && domainId ? (
              <button
                type="button"
                className="md-order-page__complete-btn md-order-page__complete-btn--primary"
                onClick={() => navigate(`/live/${domainId}`, { replace: true })}
              >
                방송으로 돌아가기
              </button>
            ) : (
              <button
                type="button"
                className="md-order-page__complete-btn md-order-page__complete-btn--primary"
                onClick={() => navigate("/profile")}
              >
                프로필로 돌아가기
              </button>
            )}
          </div>
        </div>
      </Layout>
    );
  }

  if (state === "checking" || !data) {
    return (
      <Layout>
        <div className="md-order-page">결제 확인 중입니다...</div>
      </Layout>
    );
  }

  const isMd = data.domainPrefix === "MD";
  const isDonation = data.domainPrefix === "DONATION";
  const isLiveAdmission = data.domainPrefix === "LIVE";
  const { result } = data;

  return (
    <Layout>
      <div className="md-order-page md-order-page--complete">
        <div className="md-order-page__complete-icon">🎉</div>
        <h1>결제가 완료되었습니다</h1>

        {isMd ? (
          <>
            <p className="md-order-page__complete-order-number">
              예약번호 <strong>{result.orderNumber}</strong>
            </p>
            <div className="md-order-page__summary">
              <div className="md-order-page__summary-thumb">
                {result.productImageUrl ? <img src={result.productImageUrl} alt={result.productName} /> : "예시 이미지"}
              </div>
              <div className="md-order-page__summary-info">
                <p className="md-order-page__summary-name">{result.productName}</p>
                <p className="md-order-page__summary-price">
                  {formatPrice(result.totalPrice)} ({result.quantity}개)
                </p>
              </div>
            </div>
            <div className="md-order-page__recap">
              <div className="md-order-page__recap-row">
                <span>받는 사람</span>
                <span>{result.shippingName}</span>
              </div>
              <div className="md-order-page__recap-row">
                <span>배송지</span>
                <span>{result.shippingAddress}</span>
              </div>
            </div>
          </>
        ) : isDonation ? (
          <div className="md-order-page__recap">
            <div className="md-order-page__recap-row">
              <span>방송</span>
              <span>{result.streamTitle}</span>
            </div>
            <div className="md-order-page__recap-row">
              <span>후원 금액</span>
              <strong>{formatPrice(result.amount)}</strong>
            </div>
            {result.message && (
              <div className="md-order-page__recap-row">
                <span>응원 메시지</span>
                <span>{result.message}</span>
              </div>
            )}
          </div>
        ) : isLiveAdmission ? (
          <div className="md-order-page__recap">
            <div className="md-order-page__recap-row">
              <span>방송</span>
              <span>{result.streamTitle}</span>
            </div>
            <div className="md-order-page__recap-row">
              <span>입장료</span>
              <strong>{formatPrice(result.amount)}</strong>
            </div>
            <div className="md-order-page__recap-row">
              <span>결제 수단</span>
              <span>{result.paymentMethod}</span>
            </div>
          </div>
        ) : (
          <div className="md-order-page__summary">
            <div className="md-order-page__summary-thumb">
              {result.listingImageUrl ? <img src={result.listingImageUrl} alt={result.listingTitle} /> : "예시 이미지"}
            </div>
            <div className="md-order-page__summary-info">
              <p className="md-order-page__summary-name">{result.listingTitle}</p>
              <p className="md-order-page__summary-price">{formatPrice(result.price)}</p>
            </div>
          </div>
        )}

        <div className="md-order-page__complete-actions">
          <button type="button" className="md-order-page__complete-btn" onClick={() => navigate("/")}>
            홈
          </button>
          {isDonation ? (
            <button
              type="button"
              className="md-order-page__complete-btn md-order-page__complete-btn--primary"
              onClick={() => navigate(`/live/${result.streamId}`, {
                state: { completedDonation: result },
                replace: true,
              })}
            >
              방송으로 돌아가기
            </button>
          ) : isLiveAdmission ? (
            <button
              type="button"
              className="md-order-page__complete-btn md-order-page__complete-btn--primary"
              onClick={() => navigate(`/live/${result.streamId}`, { replace: true })}
            >
              방송 입장하기
            </button>
          ) : (
            <button
              type="button"
              className="md-order-page__complete-btn md-order-page__complete-btn--primary"
              onClick={() =>
                navigate("/profile", { state: { scrollTo: isMd ? "mdOrders" : "usedTrade" } })
              }
            >
              프로필에서 확인
            </button>
          )}
        </div>
      </div>
    </Layout>
  );
}

export default PaymentResultPage;
