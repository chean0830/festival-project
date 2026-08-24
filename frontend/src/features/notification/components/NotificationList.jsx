import { useNavigate } from 'react-router-dom'

const TYPE_LABEL = {
  TICKET_OPEN: '티켓 오픈',
  ARTIST_EVENT: '관심 아티스트',
  EVENT_UPCOMING: '공연 임박',
  WEATHER: '날씨',
  RECOMMENDATION: '추천',
  COMMUNITY: '커뮤니티',
  ORDER: '주문',
  NOTICE: '공지',
  FESTIVAL_RECORD: '페스티벌 기록',
  RECORD_REMINDER: '기록 남기기',
}

export default function NotificationList({ notifications, onRead }) {
  const navigate = useNavigate()

  if (!notifications || notifications.length === 0) {
    return <p className="notification-empty-text">받은 알림이 없습니다.</p>
  }

  function handleClick(notification) {
    if (!notification.read) {
      onRead(notification.notificationId)
    }
    if (notification.eventId) {
      navigate(`/program/event/${notification.eventId}`)
    }
  }

  return (
    <ul className="notification-list">
      {notifications.map((notification) => (
        <li
          key={notification.notificationId}
          className={`notification-item${notification.read ? '' : ' notification-item--unread'}`}
        >
          <div className="notification-item-body" onClick={() => handleClick(notification)}>
            <span className="notification-item-type">{TYPE_LABEL[notification.type] || notification.type}</span>
            <span className="notification-item-title">{notification.title}</span>
            {notification.content && <p className="notification-item-content">{notification.content}</p>}
            <span className="notification-item-date">
              {new Date(notification.createdAt).toLocaleString()}
            </span>
          </div>
        </li>
      ))}
    </ul>
  )
}
