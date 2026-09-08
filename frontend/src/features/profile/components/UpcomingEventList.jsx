import { resolveImageUrl } from '../api/profileApi'
import { todayIso } from '../../../utils/todayIso'

// 공연 시작일~종료일 사이(당일 포함)에만 "진행중"을 띄우고, 그 전까지는 디데이를 유지한다.
function isInProgress(event) {
  const today = todayIso()
  return today >= event.startDate && today <= event.endDate
}

function formatStatus(event) {
  if (isInProgress(event)) return '진행중'
  return `D-${event.dDay}`
}

export default function UpcomingEventList({ events }) {
  if (!events || events.length === 0) {
    return <p className="profile-empty-text">예정된 공연이 없습니다.</p>
  }

  return (
    <ul className="profile-upcoming-list">
      {events.map((event) => (
        <li key={event.eventId} className="profile-upcoming-item">
          {event.posterImageUrl ? (
            <img src={resolveImageUrl(event.posterImageUrl)} alt={event.name} className="profile-upcoming-thumb" />
          ) : (
            <div className="profile-upcoming-thumb profile-interest-thumb-placeholder" />
          )}
          <div className="profile-upcoming-info">
            <span className="profile-upcoming-name">{event.name}</span>
            <span className="profile-interest-date">
              {event.startDate} ~ {event.endDate}
            </span>
          </div>
          <span className={`profile-dday-badge${isInProgress(event) ? ' profile-dday-live' : ''}`}>
            {formatStatus(event)}
          </span>
        </li>
      ))}
    </ul>
  )
}
