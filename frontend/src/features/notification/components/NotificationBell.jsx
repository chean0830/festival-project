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
    fetchUnreadCount(memberId)
      .then((data) => {
        if (!cancelled) setUnreadCount(data.unreadCount)
      })
      .catch(() => {
        if (!cancelled) setUnreadCount(0)
      })
    return () => {
      cancelled = true
    }
  }, [currentMember])

  if (!currentMember?.memberId) {
    return null
  }

  return (
    <button type="button" className="notification-bell" onClick={() => navigate('/notifications')}>
      🔔 알림{unreadCount > 0 ? ` ${unreadCount}` : ''}
    </button>
  )
}
