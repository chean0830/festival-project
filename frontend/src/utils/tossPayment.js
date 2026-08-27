import { loadTossPayments } from "./loadTossPayments";

const METHOD_BY_LABEL = {
  "카드 결제": "카드",
  "계좌 이체": "계좌이체",
  "간편 결제": "토스페이",
};

export const PAYMENT_METHOD_LABELS = Object.keys(METHOD_BY_LABEL);

/**
 * domainPrefix("MD" | "USED" | "DONATION" | "LIVE") + domainId(주문/거래/후원/방송 PK)를 Toss 주문번호에 인코딩해서
 * 결제 완료 후 successUrl(PaymentResultPage)에서 어떤 도메인의 무엇을 확정해야 하는지 복원할 수 있게 한다.
 */
function buildTossOrderId(domainPrefix, domainId) {
  return `${domainPrefix}_${domainId}_${Date.now()}`;
}

export async function requestTossPayment({ methodLabel, domainPrefix, domainId, amount, orderName, customerName }) {
  const TossPayments = await loadTossPayments();
  const clientKey = import.meta.env.VITE_TOSS_CLIENT_KEY;
  if (!clientKey) {
    throw new Error("결제 설정이 올바르지 않습니다. 잠시 후 다시 시도해 주세요.");
  }

  const tossPayments = TossPayments(clientKey);
  const orderId = buildTossOrderId(domainPrefix, domainId);
  const origin = window.location.origin;

  return tossPayments.requestPayment(METHOD_BY_LABEL[methodLabel] ?? "카드", {
    amount,
    orderId,
    orderName,
    customerName,
    successUrl: `${origin}/payment/result?result=success`,
    failUrl: `${origin}/payment/result?result=fail`,
  });
}

/**
 * Toss 주문번호("MD_123_..." / "USED_45_..." / "LIVE_7_...")에서 도메인과 내부 PK를 복원한다.
 */
export function parseTossOrderId(tossOrderId) {
  const [domainPrefix, domainId] = (tossOrderId ?? "").split("_");
  return { domainPrefix, domainId };
}
