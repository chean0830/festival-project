import { Route, Routes } from 'react-router-dom'
import ScrollToTop from './components/common/ScrollToTop'
import Home from './pages/Home'
import Program from './pages/Program'
import ProgramCalendar from './pages/ProgramCalendar'
import ProgramCategory from './pages/ProgramCategory'
import ProgramEventDetail from './pages/ProgramEventDetail'
import ArtistDetailPage from './pages/ArtistDetailPage'
import MdPreorderPage from './pages/MdPreorderPage'
import MdOrderShippingPage from './pages/MdOrderShippingPage'
import MdOrderPaymentPage from './pages/MdOrderPaymentPage'
import MdOrderCompletePage from './pages/MdOrderCompletePage'
import MdOrderPayPage from './pages/MdOrderPayPage'
import CommunityLayout from './components/community/CommunityLayout'
import CommunityPage from './pages/CommunityPage'
import CommunityPostWritePage from './pages/CommunityPostWritePage'
import CommunityPostDetailPage from './pages/CommunityPostDetailPage'
import Search from './pages/Search'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import AccountRecoveryPage from './pages/AccountRecoveryPage'
import ResetPasswordPage from './pages/ResetPasswordPage'
import ProfilePage from './features/profile/ProfilePage'
import BadgePage from './features/profile/BadgePage'
import NotificationPage from './features/notification/NotificationPage'
import FestivalRecordListPage from './features/festivalrecord/FestivalRecordListPage'
import FestivalRecordFormPage from './features/festivalrecord/FestivalRecordFormPage'
import FestivalRecordDetailPage from './features/festivalrecord/FestivalRecordDetailPage'
import FestivalRecordBookPage from './features/festivalrecord/FestivalRecordBookPage'

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
    <>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/program" element={<Program />} />
        <Route path="/program/calendar" element={<ProgramCalendar />} />
        <Route path="/program/:category" element={<ProgramCategory />} />
        <Route path="/program/event/:eventId" element={<ProgramEventDetail />} />
        <Route path="/artists/:artistId" element={<ArtistDetailPage />} />
        <Route path="/shop/preorder" element={<MdPreorderPage />} />
        <Route path="/shop/preorder/:productId/order" element={<MdOrderShippingPage />} />
        <Route path="/shop/preorder/:productId/payment" element={<MdOrderPaymentPage />} />
        <Route path="/shop/preorder/:productId/complete" element={<MdOrderCompletePage />} />
        <Route path="/shop/preorder/order/:orderId/pay" element={<MdOrderPayPage />} />
        <Route path="/community" element={<CommunityLayout />}>
          <Route index element={<CommunityPage />} />
          <Route path="new" element={<CommunityPostWritePage />} />
          <Route path=":postId/edit" element={<CommunityPostWritePage />} />
          <Route path=":postId" element={<CommunityPostDetailPage />} />
        </Route>
        <Route path="/search" element={<Search />} />

        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/account/recovery" element={<AccountRecoveryPage />} />
        <Route path="/password/reset/confirm" element={<ResetPasswordPage />} />

        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/profile/badges" element={<BadgePage />} />
        <Route path="/notifications" element={<NotificationPage />} />

        <Route path="/festival-log" element={<FestivalRecordListPage />} />
        <Route path="/festival-log/new" element={<FestivalRecordFormPage />} />
        <Route path="/festival-log/:recordId" element={<FestivalRecordDetailPage />} />
        <Route path="/festival-log/:recordId/edit" element={<FestivalRecordFormPage />} />
        <Route path="/festival-log/:recordId/poster" element={<FestivalRecordBookPage />} />
      </Routes>
    </>
  )
}

export default App
