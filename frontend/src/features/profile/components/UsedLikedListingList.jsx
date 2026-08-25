import { useState } from 'react'
import { Link } from 'react-router-dom'
import { formatPrice } from '../../../utils/formatPrice'
import { likeUsedListing, unlikeUsedListing } from '../../../api/usedTradeApi'

/**
 * 찜한 매물을 눌러도 목록에서 바로 사라지지 않는다 (하트만 흰색으로 토글되고, 다시 눌러 취소 가능).
 * 실제로 목록에서 빠지는 건 다음에 프로필 페이지를 새로 불러왔을 때다.
 */
export default function UsedLikedListingList({ listings, memberId }) {
  const [likedMap, setLikedMap] = useState(() => Object.fromEntries(listings.map((listing) => [listing.listingId, true])))
  const [busyId, setBusyId] = useState(null)
  const [error, setError] = useState(null)

  if (!listings || listings.length === 0) {
    return <p className="profile-empty-text">아직 찜한 중고거래 매물이 없어요.</p>
  }

  async function handleToggle(listingId) {
    if (busyId) return
    const currentlyLiked = likedMap[listingId] ?? true
    setBusyId(listingId)
    setError(null)
    try {
      if (currentlyLiked) {
        await unlikeUsedListing(memberId, listingId)
      } else {
        await likeUsedListing(memberId, listingId)
      }
      setLikedMap((prev) => ({ ...prev, [listingId]: !currentlyLiked }))
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
        {listings.map((listing) => {
          const liked = likedMap[listing.listingId] ?? true
          return (
            <li key={listing.listingId} className="profile-interest-item">
              <Link to={`/shop/used/${listing.listingId}`} className="profile-interest-link">
                {listing.imageUrl ? (
                  <img src={listing.imageUrl} alt={listing.title} />
                ) : (
                  <div className="profile-interest-thumb-placeholder" />
                )}
                <span>{listing.title}</span>
                <span className="profile-interest-date">{formatPrice(listing.price)}</span>
              </Link>
              <button
                type="button"
                className={`profile-used-like-heart${liked ? ' profile-used-like-heart--active' : ''}`}
                onClick={() => handleToggle(listing.listingId)}
                disabled={busyId === listing.listingId}
                aria-label={liked ? `${listing.title} 찜 해제` : `${listing.title} 찜하기`}
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
