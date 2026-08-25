let loadPromise = null;

/**
 * Toss Payments JS SDK(v1, 결제창 방식)를 한 번만 로드한다.
 */
export function loadTossPayments() {
  if (window.TossPayments) {
    return Promise.resolve(window.TossPayments);
  }

  if (loadPromise) {
    return loadPromise;
  }

  loadPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://js.tosspayments.com/v1/payment";
    script.async = true;
    script.onload = () => resolve(window.TossPayments);
    script.onerror = () => {
      loadPromise = null;
      reject(new Error("결제 모듈을 불러오지 못했습니다."));
    };
    document.head.appendChild(script);
  });

  return loadPromise;
}
