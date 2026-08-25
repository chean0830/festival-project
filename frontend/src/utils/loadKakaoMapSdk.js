let loadPromise = null;

/**
 * 카카오맵 JS SDK를 한 번만 로드한다 (여러 컴포넌트에서 호출해도 스크립트 태그는 하나만 생김).
 */
export function loadKakaoMapSdk(appKey) {
  if (window.kakao && window.kakao.maps) {
    return Promise.resolve(window.kakao);
  }

  if (loadPromise) {
    return loadPromise;
  }

  loadPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${appKey}&autoload=false`;
    script.async = true;
    script.onload = () => window.kakao.maps.load(() => resolve(window.kakao));
    script.onerror = () => {
      loadPromise = null;
      reject(new Error("카카오맵 SDK를 불러오지 못했습니다."));
    };
    document.head.appendChild(script);
  });

  return loadPromise;
}
