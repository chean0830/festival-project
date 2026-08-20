import { Route, Routes } from 'react-router-dom'
import Home from './pages/Home'
import Program from './pages/Program'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import AccountRecoveryPage from './pages/AccountRecoveryPage'
import ResetPasswordPage from './pages/ResetPasswordPage'
import ProfilePage from './features/profile/ProfilePage'
import BadgePage from './features/profile/BadgePage'

/**
 * 페이지 라우팅
 * - "/" : 메인 화면
 * - "/program" : 공연일정 페이지 (지금은 준비중 placeholder)
 * - "/login", "/signup", "/account/recovery", "/password/reset/confirm" : 인증 관련 페이지
 * - "/profile", "/profile/badges" : 내 프로필 / 나의 뱃지 (로그인한 사용자 기준, 비로그인 시 로그인 안내)
 *
 * 커뮤니티/MD구매 등 다른 메뉴들은 아직 페이지가 없어서
 * 눌러도 흰 화면(라우트 없음)이 뜰 거야. 각 기능 브랜치가 합쳐지면
 * 여기에 Route를 하나씩 추가해주면 돼.
 */
function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/program" element={<Program />} />

      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/account/recovery" element={<AccountRecoveryPage />} />
      <Route path="/password/reset/confirm" element={<ResetPasswordPage />} />

      <Route path="/profile" element={<ProfilePage />} />
      <Route path="/profile/badges" element={<BadgePage />} />
    </Routes>
  )
}

export default App
