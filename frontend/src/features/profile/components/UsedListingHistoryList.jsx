import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { formatPrice } from '../../../utils/formatPrice'
import { STATUS_LABEL } from '../../../components/usedtrade/usedTradeCategories'

export default function UsedListingHistoryList({ listings, onDelete }) {
  const navigate = useNavigate()
  const [confirmingListingId, setConfirmingListingId] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState(null)

  if (!listings || listings.length === 0) {
    return <p className="profile-empty-text">아직 등록한 중고 매물이 없어요.</p>
  }

  async function handleConfirmDelete() {
    setDeleting(true)
    setError(null)
    try {
      await onDelete(confirmingListingId)
      setConfirmingListingId(null)
    } catch (err) {
      setError(err.message)
    } finally {
      setDeleting(false)
    }
  }

  return (
    <>
      {error && <p className="profile-error-text">{error}</p>}

      <ul className="profile-md-order-list">
        {listings.map((listing) => (
          <li key={listing.listingId} className="profile-md-order-item">
            {listing.imageUrl ? (
              <img src={listing.imageUrl} alt={listing.title} />
            ) : (
              <div className="profile-interest-thumb-placeholder" />
            )}
            <div className="profile-md-order-info">
              <span className="profile-md-order-name">{listing.title}</span>
              <span className="profile-interest-date">{formatPrice(listing.price)}</span>
            </div>

            <div className="profile-md-order-actions">
              <span className={`profile-md-order-status profile-md-order-status--${listing.status.toLowerCase()}`}>
                {STATUS_LABEL[listing.status] ?? listing.status}
              </span>

              {listing.status === 'ON_SALE' && (
                <>
                  <button
                    type="button"
                    className="profile-md-order-status profile-md-order-status--clickable"
                    onClick={() => navigate(`/shop/used/${listing.listingId}/edit`)}
                  >
                    수정
                  </button>
                  <button
                    type="button"
                    className="profile-md-order-cancel"
                    onClick={() => setConfirmingListingId(listing.listingId)}
                  >
                    삭제
                  </button>
                </>
              )}
            </div>
          </li>
        ))}
      </ul>

      {confirmingListingId && (
        <div className="profile-modal-backdrop" onClick={() => !deleting && setConfirmingListingId(null)}>
          <div className="profile-modal profile-modal--confirm" onClick={(event) => event.stopPropagation()}>
            <p className="profile-modal-confirm-text">매물을 삭제하겠습니까?</p>
            <div className="profile-modal-confirm-actions">
              <button
                type="button"
                className="profile-btn-ghost"
                disabled={deleting}
                onClick={() => setConfirmingListingId(null)}
              >
                아니요
              </button>
              <button type="button" className="profile-btn-outline" disabled={deleting} onClick={handleConfirmDelete}>
                {deleting ? '삭제하는 중...' : '예'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
