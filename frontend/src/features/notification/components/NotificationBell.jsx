import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useCurrentMember from '../../profile/hooks/useCurrentMember'
import { fetchUnreadCount } from '../api/notificationApi'
import '../notification.css'

/**
 * 알림 진입점(벨 아이콘 + 안 읽은 개수).
 * 공용 Header가 아직 실제 로그인 상태와 연동되지 않아서(TODO: feature/auth 붙으면 교체),
 * 지금은 이 컴포넌트를 쓰는 각 페이지에서 개별적으로 로그인 상태를 확인한다.
 * Header 쪽 인증 연동이 끝나면 그때 Header로 옮기면 된다.
 */
export default function NotificationBell() {
  const navigate = useNavigate()
  const currentMember = useCurrentMember()
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    const memberId = currentMember?.memberId
    if (!memberId) {
      return
    }
    let cancelled = false

    function refresh() {
      fetchUnreadCount(memberId)
        .then((data) => {
          if (!cancelled) setUnreadCount(data.unreadCount)
        })
        .catch(() => {
          if (!cancelled) setUnreadCount(0)
        })
    }

    refresh()
    window.addEventListener('notifications:read', refresh)
    return () => {
      cancelled = true
      window.removeEventListener('notifications:read', refresh)
    }
  }, [currentMember])

  if (!currentMember?.memberId) {
    return null
  }

  return (
    <button
      type="button"
      className="notification-bell"
      aria-label="알림"
      onClick={() => navigate('/notifications')}
    >
      <svg viewBox="0 0 24 24" width="23" height="23" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinejoin="round">
        <path d="M12 3a5 5 0 00-5 5v3.5c0 .8-.3 1.6-.9 2.1L5 15h14l-1.1-1.4a3 3 0 01-.9-2.1V8a5 5 0 00-5-5z" />
        <path d="M9.5 18a2.5 2.5 0 005 0" strokeLinecap="round" />
      </svg>
      {unreadCount > 0 && <span className="notification-bell__badge">{unreadCount}</span>}
    </button>
  )
}
