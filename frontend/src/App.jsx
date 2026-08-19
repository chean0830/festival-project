import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Program from "./pages/Program";

/**
 * 페이지 라우팅
 * - "/" : 메인 화면
 * - "/program" : 공연일정 페이지 (지금은 준비중 placeholder)
 *
 * 커뮤니티/MD구매/로그인 등 다른 메뉴들은 아직 페이지가 없어서
 * 눌러도 흰 화면(라우트 없음)이 뜰 거야. 각 기능 브랜치가 합쳐지면
 * 여기에 Route를 하나씩 추가해주면 돼.
 */
function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/program" element={<Program />} />
    </Routes>
  );
}

export default App;
