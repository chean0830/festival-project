import { useCallback, useState } from 'react'
import ProfilePage from './features/profile/ProfilePage'
import BadgePage from './features/profile/BadgePage'

function App() {
  // TODO: 로그인 기능이 붙으면 실제 로그인한 사용자의 memberId로 교체
  const memberId = 3
  const [view, setView] = useState('profile')

  const goToBadges = useCallback(() => setView('badges'), [])
  const goToProfile = useCallback(() => setView('profile'), [])

  if (view === 'badges') {
    return <BadgePage memberId={memberId} onBack={goToProfile} />
  }
  return <ProfilePage memberId={memberId} onNavigateToBadges={goToBadges} />
}

export default App
