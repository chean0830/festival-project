import { Link } from 'react-router-dom'
import { resolveImageUrl } from '../api/profileApi'

export default function InterestedEventList({ events, onRemove }) {
  if (!events || events.length === 0) {
    return <p className="profile-empty-text">아직 하트를 누른 관심 공연이 없습니다.</p>
  }

  return (
    <ul className="profile-interest-list">
      {events.map((event) => (
        <li key={event.eventId} className="profile-interest-item">
          <Link to={`/program/event/${event.eventId}`} className="profile-interest-link">
            {event.posterImageUrl ? (
              <img src={resolveImageUrl(event.posterImageUrl)} alt={event.name} />
            ) : (
              <div className="profile-interest-thumb-placeholder" />
            )}
            <div>
              <span>{event.name}</span>
              <span className="profile-interest-date">
                {event.startDate} ~ {event.endDate}
              </span>
            </div>
          </Link>
          {onRemove && (
            <button
              type="button"
              className="profile-interest-remove"
              onClick={() => onRemove(event.eventId)}
              aria-label={`${event.name} 관심 해제`}
            >
              찜 해제
            </button>
          )}
        </li>
      ))}
    </ul>
  )
}
