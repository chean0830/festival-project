import { useState } from 'react'
import { Link } from 'react-router-dom'
import { resolveImageUrl, addInterestedArtist, removeInterestedArtist } from '../api/profileApi'

/**
 * 하트를 눌러도 목록에서 바로 사라지지 않는다 (하트만 흰색으로 토글되고, 다시 눌러 취소 가능).
 * 실제로 목록에서 빠지는 건 다음에 프로필 페이지를 새로 불러왔을 때다.
 */
export default function InterestedArtistList({ artists, memberId }) {
  const [likedMap, setLikedMap] = useState(() => Object.fromEntries(artists.map((artist) => [artist.artistId, true])))
  const [busyId, setBusyId] = useState(null)
  const [error, setError] = useState(null)

  if (!artists || artists.length === 0) {
    return <p className="profile-empty-text">아직 하트를 누른 관심 가수가 없습니다.</p>
  }

  async function handleToggle(artistId) {
    if (busyId) return
    const currentlyLiked = likedMap[artistId] ?? true
    setBusyId(artistId)
    setError(null)
    try {
      if (currentlyLiked) {
        await removeInterestedArtist(memberId, artistId)
      } else {
        await addInterestedArtist(memberId, artistId)
      }
      setLikedMap((prev) => ({ ...prev, [artistId]: !currentlyLiked }))
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
        {artists.map((artist) => {
          const liked = likedMap[artist.artistId] ?? true
          return (
            <li key={artist.artistId} className="profile-interest-item">
              <Link to={`/artists/${artist.artistId}`} className="profile-interest-link">
                {artist.profileImageUrl ? (
                  <img src={resolveImageUrl(artist.profileImageUrl)} alt={artist.name} />
                ) : (
                  <div className="profile-interest-thumb-placeholder" />
                )}
                <span>{artist.name}</span>
              </Link>
              <button
                type="button"
                className={`profile-used-like-heart${liked ? ' profile-used-like-heart--active' : ''}`}
                onClick={() => handleToggle(artist.artistId)}
                disabled={busyId === artist.artistId}
                aria-label={liked ? `${artist.name} 관심 해제` : `${artist.name} 관심 가수 추가`}
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
