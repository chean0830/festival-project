import { todayIso } from "./todayIso";

// MD 사전예약 상품의 마감/재고 상태를 카드·목록·상세에서 동일하게 판단하기 위한 헬퍼.

export function formatDeadline(preorderDeadline) {
  if (!preorderDeadline) return "";
  const deadlineDate = preorderDeadline.slice(0, 10);
  const today = todayIso();
  if (deadlineDate < today) return "예약 마감";

  const diffMs = new Date(deadlineDate) - new Date(today);
  const dDay = Math.round(diffMs / (1000 * 60 * 60 * 24));
  if (dDay === 0) return "오늘 마감";
  return `D-${dDay} 마감`;
}

export function isDeadlinePassed(product) {
  return formatDeadline(product?.preorderDeadline) === "예약 마감";
}

export function isSoldOut(product) {
  return (product?.stock ?? 0) <= 0 || product?.status === "SOLD_OUT";
}

// 지금 바로 예약할 수 있는 상품인지 (마감 전 + 재고 있음 + 예약중 상태).
export function isReservable(product) {
  return !isDeadlinePassed(product) && !isSoldOut(product) && product?.status === "PREORDER";
}
