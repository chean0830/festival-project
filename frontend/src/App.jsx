import { Route, Routes } from 'react-router-dom'
import Home from './pages/Home'
import Program from './pages/Program'
import ProgramCalendar from './pages/ProgramCalendar'
import ProgramCategory from './pages/ProgramCategory'
import Search from './pages/Search'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import AccountRecoveryPage from './pages/AccountRecoveryPage'
import ResetPasswordPage from './pages/ResetPasswordPage'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/program" element={<Program />} />
      <Route path="/program/calendar" element={<ProgramCalendar />} />
      <Route path="/program/:category" element={<ProgramCategory />} />
      <Route path="/search" element={<Search />} />

      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/account/recovery" element={<AccountRecoveryPage />} />
      <Route
        path="/password/reset/confirm"
        element={<ResetPasswordPage />}
      />
    </Routes>
  )
}

export default App