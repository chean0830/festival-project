import { useEffect, useState } from 'react'
import Layout from '../../components/common/Layout/Layout'
import useCurrentMember from '../profile/hooks/useCurrentMember'
import RequireLogin from '../profile/components/RequireLogin'
import { fetchNotifications, markNotificationAsRead } from './api/notificationApi'
import NotificationList from './components/NotificationList'
import './notification.css'

export default function NotificationPage() {
  const currentMember = useCurrentMember()
  const memberId = currentMember?.memberId
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(null)

  useEffect(() => {
    if (!memberId) {
      return undefined
    }
    let cancelled = false

    fetchNotifications(memberId)
      .then((data) => {
        if (!cancelled) setNotifications(data)
      })
      .catch((err) => {
        if (!cancelled) setLoadError(err.message)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [memberId])

  if (currentMember === undefined) {
    return (
      <Layout>
        <div className="notification-page">확인 중입니다...</div>
      </Layout>
    )
  }

  if (currentMember === null) {
    return <RequireLogin />
  }

  async function handleRead(notificationId) {
    await markNotificationAsRead(memberId, notificationId)
    setNotifications((prev) =>
      prev.map((n) => (n.notificationId === notificationId ? { ...n, read: true } : n)),
    )
  }

  return (
    <Layout>
      <div className="notification-page">
        <div className="notification-content">
          <h1>알림</h1>
          {loading && <p>알림을 불러오는 중입니다...</p>}
          {loadError && <p className="notification-error-text">알림을 불러오지 못했습니다: {loadError}</p>}
          {!loading && !loadError && <NotificationList notifications={notifications} onRead={handleRead} />}
        </div>
      </div>
    </Layout>
  )
}
