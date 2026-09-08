import { useEffect, useState } from 'react'
import Layout from '../../components/common/Layout/Layout'
import useCurrentMember from '../profile/hooks/useCurrentMember'
import RequireLogin from '../profile/components/RequireLogin'
import { fetchNotifications, markNotificationAsRead, markAllNotificationsAsRead } from './api/notificationApi'
import NotificationList from './components/NotificationList'
import './notification.css'

export default function NotificationPage() {
  const currentMember = useCurrentMember()
  const memberId = currentMember?.memberId
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(null)
  const [markingAll, setMarkingAll] = useState(false)

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

  async function handleReadAll() {
    setMarkingAll(true)
    try {
      await markAllNotificationsAsRead(memberId)
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
    } catch (err) {
      setLoadError(err.message)
    } finally {
      setMarkingAll(false)
    }
  }

  const hasUnread = notifications.some((n) => !n.read)

  return (
    <Layout>
      <div className="notification-page">
        <div className="notification-content">
          <div className="notification-content__header">
            <h1>알림</h1>
            <button
              type="button"
              className="notification-read-all-btn"
              disabled={!hasUnread || markingAll}
              onClick={handleReadAll}
            >
              전체 읽음
            </button>
          </div>
          {loading && <p>알림을 불러오는 중입니다...</p>}
          {loadError && <p className="notification-error-text">알림을 불러오지 못했습니다: {loadError}</p>}
          {!loading && !loadError && <NotificationList notifications={notifications} onRead={handleRead} />}
        </div>
      </div>
    </Layout>
  )
}
