import { resolveImageUrl } from '../api/profileApi'

function formatDDay(dDay) {
  if (dDay > 0) return `D-${dDay}`
  if (dDay === 0) return 'D-DAY'
  return '진행중'
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
          <span className={`profile-dday-badge${event.dDay <= 0 ? ' profile-dday-live' : ''}`}>
            {formatDDay(event.dDay)}
          </span>
        </li>
      ))}
    </ul>
  )
}
