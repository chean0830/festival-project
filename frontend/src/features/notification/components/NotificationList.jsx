const TYPE_LABEL = {
  TICKET_OPEN: '티켓 오픈',
  ARTIST_EVENT: '관심 아티스트',
  EVENT_UPCOMING: '공연 임박',
  WEATHER: '날씨',
  RECOMMENDATION: '추천',
  COMMUNITY: '커뮤니티',
  ORDER: '주문',
  NOTICE: '공지',
}

export default function NotificationList({ notifications, onRead }) {
  if (!notifications || notifications.length === 0) {
    return <p className="notification-empty-text">받은 알림이 없습니다.</p>
  }

  return (
    <ul className="notification-list">
      {notifications.map((notification) => (
        <li
          key={notification.notificationId}
          className={`notification-item${notification.read ? '' : ' notification-item--unread'}`}
        >
          <div className="notification-item-body" onClick={() => !notification.read && onRead(notification.notificationId)}>
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
