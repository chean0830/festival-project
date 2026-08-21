import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * SPA 라우팅은 페이지 이동해도 스크롤 위치를 그대로 유지하기 때문에,
 * 경로가 바뀔 때마다 맨 위로 스크롤을 강제로 올려준다.
 */
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

export default ScrollToTop;
