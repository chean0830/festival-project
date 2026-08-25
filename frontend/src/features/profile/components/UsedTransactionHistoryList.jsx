import { Link, useNavigate } from 'react-router-dom'
import { formatPrice } from '../../../utils/formatPrice'

const STATUS_LABEL = {
  REQUEST: '요청됨',
  APPROVED: '승인됨',
  PAID: '결제완료',
  COMPLETED: '거래완료',
  CANCELED: '취소됨',
}

/**
 * role="buyer": 내가 보낸 구매 요청 목록. role="seller": 내가 받은 구매 요청 목록.
 * 구매 흐름: REQUEST -> APPROVED(판매자 승인) -> PAID(구매자 결제) -> COMPLETED(판매자 거래완료 처리).
 */
export default function UsedTransactionHistoryList({ transactions, role, onApprove, onComplete, onCancel }) {
  const navigate = useNavigate()
  if (!transactions || transactions.length === 0) {
    return (
      <p className="profile-empty-text">
        {role === 'seller' ? '아직 받은 구매 요청이 없어요.' : '아직 구매 요청한 내역이 없어요.'}
      </p>
    )
  }

  return (
    <ul className="profile-md-order-list">
      {transactions.map((tx) => (
        <li key={tx.transactionId} className="profile-md-order-item">
          {tx.listingImageUrl ? (
            <img src={tx.listingImageUrl} alt={tx.listingTitle} />
          ) : (
            <div className="profile-interest-thumb-placeholder" />
          )}
          <div className="profile-md-order-info">
            <Link to={`/shop/used/${tx.listingId}`} className="profile-md-order-name">
              {tx.listingTitle}
            </Link>
            <span className="profile-interest-date">
              {formatPrice(tx.price)} · {role === 'seller' ? tx.buyerNickname : tx.sellerNickname}
            </span>
          </div>

          <div className="profile-md-order-actions">
            <span className={`profile-md-order-status profile-md-order-status--${tx.status.toLowerCase()}`}>
              {STATUS_LABEL[tx.status] ?? tx.status}
            </span>

            {role === 'seller' && tx.status === 'REQUEST' && (
              <>
                <button type="button" className="profile-md-order-status profile-md-order-status--clickable" onClick={() => onApprove(tx.transactionId)}>
                  승인
                </button>
                <button type="button" className="profile-md-order-cancel" onClick={() => onCancel(tx.transactionId)}>
                  거절
                </button>
              </>
            )}

            {role === 'seller' && tx.status === 'PAID' && (
              <>
                <button type="button" className="profile-md-order-status profile-md-order-status--clickable" onClick={() => onComplete(tx.transactionId)}>
                  거래완료
                </button>
                <button type="button" className="profile-md-order-cancel" onClick={() => onCancel(tx.transactionId)}>
                  취소
                </button>
              </>
            )}

            {role === 'buyer' && tx.status === 'APPROVED' && (
              <button
                type="button"
                className="profile-md-order-status profile-md-order-status--clickable"
                onClick={() => navigate(`/shop/used/transactions/${tx.transactionId}/payment`, { state: { transaction: tx } })}
              >
                결제하기
              </button>
            )}

            {role === 'buyer' && (tx.status === 'REQUEST' || tx.status === 'APPROVED' || tx.status === 'PAID') && (
              <button type="button" className="profile-md-order-cancel" onClick={() => onCancel(tx.transactionId)}>
                취소
              </button>
            )}
          </div>
        </li>
      ))}
    </ul>
  )
}
