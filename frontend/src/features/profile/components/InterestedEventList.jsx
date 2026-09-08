import { useState } from 'react'
import { Link } from 'react-router-dom'
import { resolveImageUrl, addInterestedEvent, removeInterestedEvent } from '../api/profileApi'

/**
 * 하트를 눌러도 목록에서 바로 사라지지 않는다 (하트만 흰색으로 토글되고, 다시 눌러 취소 가능).
 * 실제로 목록에서 빠지는 건 다음에 프로필 페이지를 새로 불러왔을 때다.
 */
export default function InterestedEventList({ events, memberId }) {
  const [likedMap, setLikedMap] = useState(() => Object.fromEntries(events.map((event) => [event.eventId, true])))
  const [busyId, setBusyId] = useState(null)
  const [error, setError] = useState(null)

  if (!events || events.length === 0) {
    return <p className="profile-empty-text">아직 하트를 누른 관심 공연이 없습니다.</p>
  }

  async function handleToggle(eventId) {
    if (busyId) return
    const currentlyLiked = likedMap[eventId] ?? true
    setBusyId(eventId)
    setError(null)
    try {
      if (currentlyLiked) {
        await removeInterestedEvent(memberId, eventId)
      } else {
        await addInterestedEvent(memberId, eventId)
      }
      setLikedMap((prev) => ({ ...prev, [eventId]: !currentlyLiked }))
    } catch (err) {
      setError(err.message)
    } finally {
      setBusyId(null)
    }
  }

  return (
    <>
      {error && <p className="profile-error-text">{error}</p>}

      <ul className="profile-interest-list">
        {events.map((event) => {
          const liked = likedMap[event.eventId] ?? true
          return (
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
              <button
                type="button"
                className={`profile-used-like-heart${liked ? ' profile-used-like-heart--active' : ''}`}
                onClick={() => handleToggle(event.eventId)}
                disabled={busyId === event.eventId}
                aria-label={liked ? `${event.name} 관심 해제` : `${event.name} 관심 공연 추가`}
                aria-pressed={liked}
              >
                <span aria-hidden="true">{liked ? '♥' : '♡'}</span>
              </button>
            </li>
          )
        })}
      </ul>
    </>
  )
}
