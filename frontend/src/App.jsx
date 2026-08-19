import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Program from "./pages/Program";
import ProfilePage from "./features/profile/ProfilePage";
import BadgePage from "./features/profile/BadgePage";

/**
 * 페이지 라우팅
 * - "/" : 메인 화면
 * - "/program" : 공연일정 페이지 (지금은 준비중 placeholder)
 * - "/profile" : 내 프로필
 * - "/profile/badges" : 나의 뱃지
 *
 * 커뮤니티/MD구매/로그인 등 다른 메뉴들은 아직 페이지가 없어서
 * 눌러도 흰 화면(라우트 없음)이 뜰 거야. 각 기능 브랜치가 합쳐지면
 * 여기에 Route를 하나씩 추가해주면 돼.
 */

// TODO: 로그인 기능이 붙으면 실제 로그인한 사용자의 memberId로 교체
const CURRENT_MEMBER_ID = 3;

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/program" element={<Program />} />
      <Route path="/profile" element={<ProfilePage memberId={CURRENT_MEMBER_ID} />} />
      <Route path="/profile/badges" element={<BadgePage memberId={CURRENT_MEMBER_ID} />} />
    </Routes>
  );
}

export default App;
