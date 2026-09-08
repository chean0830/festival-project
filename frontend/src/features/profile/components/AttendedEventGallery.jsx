import { Link } from 'react-router-dom'
import { resolveImageUrl } from '../api/profileApi'

export default function AttendedEventGallery({ events, expanded, onToggleExpand }) {
  if (!events || events.length === 0) {
    return <p className="profile-empty-text">아직 다녀온 공연이 없습니다.</p>
  }

  const groupedByYear = new Map()
  events.forEach((event) => {
    const list = groupedByYear.get(event.year) || []
    list.push(event)
    groupedByYear.set(event.year, list)
  })
  const years = Array.from(groupedByYear.keys()).sort((a, b) => b - a)
  const hasMoreYears = years.length > 1
  const visibleYears = expanded ? years : years.slice(0, 1)

  return (
    <div className="profile-attended">
      {visibleYears.map((year) => (
        <div key={year} className="profile-attended-year-group">
          <span className="profile-attended-year">{year}년</span>
          <ul className="profile-poster-grid">
            {groupedByYear.get(year).map((event) => (
              <li key={event.eventId} className="profile-poster-item">
                <Link to={`/program/event/${event.eventId}`} className="profile-poster-link">
                  {event.posterImageUrl ? (
                    <img src={resolveImageUrl(event.posterImageUrl)} alt={event.name} />
                  ) : (
                    <div className="profile-poster-placeholder">{event.name}</div>
                  )}
                  <span className="profile-poster-name">{event.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}

      {hasMoreYears && (
        <button type="button" className="profile-btn-ghost profile-attended-toggle" onClick={onToggleExpand}>
          {expanded ? '접기' : `이전 공연 더보기 (${years.length - 1}개 연도)`}
        </button>
      )}
    </div>
  )
}
