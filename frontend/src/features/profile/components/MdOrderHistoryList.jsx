import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { formatPrice } from '../../../utils/formatPrice'

const STATUS_LABEL = {
  PAYMENT_WAIT: '결제 대기',
  PAID: '결제 완료',
  SHIPPED: '배송 중',
  COMPLETED: '완료',
  CANCELED: '취소됨',
}

const CANCELABLE_STATUSES = new Set(['PAYMENT_WAIT', 'PAID'])

export default function MdOrderHistoryList({ orders, onCancel }) {
  const navigate = useNavigate()
  const [confirmingOrderId, setConfirmingOrderId] = useState(null)
  const [canceling, setCanceling] = useState(false)
  const [error, setError] = useState(null)

  if (!orders || orders.length === 0) {
    return <p className="profile-empty-text">아직 사전예약한 MD 상품이 없어요.</p>
  }

  async function handleConfirmCancel() {
    setCanceling(true)
    setError(null)
    try {
      await onCancel(confirmingOrderId)
      setConfirmingOrderId(null)
    } catch (err) {
      setError(err.message)
    } finally {
      setCanceling(false)
    }
  }

  return (
    <>
      {error && <p className="profile-error-text">{error}</p>}

      <ul className="profile-md-order-list">
        {orders.map((order) => (
          <li key={order.orderId} className="profile-md-order-item">
            {order.productImageUrl ? (
              <img src={order.productImageUrl} alt={order.productName} />
            ) : (
              <div className="profile-interest-thumb-placeholder" />
            )}
            <div className="profile-md-order-info">
              <span className="profile-md-order-number">예약번호 {order.orderNumber}</span>
              <span className="profile-md-order-name">{order.productName}</span>
              <span className="profile-interest-date">
                {formatPrice(order.totalPrice)} ({order.quantity}개)
              </span>
            </div>

            <div className="profile-md-order-actions">
              {order.status === 'PAYMENT_WAIT' ? (
                <button
                  type="button"
                  className="profile-md-order-status profile-md-order-status--payment_wait profile-md-order-status--clickable"
                  onClick={() => navigate(`/shop/preorder/order/${order.orderId}/pay`, { state: { order } })}
                >
                  결제 대기
                </button>
              ) : (
                <span className={`profile-md-order-status profile-md-order-status--${order.status.toLowerCase()}`}>
                  {STATUS_LABEL[order.status] ?? order.status}
                </span>
              )}

              {CANCELABLE_STATUSES.has(order.status) && (
                <button
                  type="button"
                  className="profile-md-order-cancel"
                  onClick={() => setConfirmingOrderId(order.orderId)}
                >
                  예약 취소
                </button>
              )}
            </div>
          </li>
        ))}
      </ul>

      {confirmingOrderId && (
        <div className="profile-modal-backdrop" onClick={() => !canceling && setConfirmingOrderId(null)}>
          <div className="profile-modal profile-modal--confirm" onClick={(event) => event.stopPropagation()}>
            <p className="profile-modal-confirm-text">예약을 취소하겠습니까?</p>
            <div className="profile-modal-confirm-actions">
              <button
                type="button"
                className="profile-btn-ghost"
                disabled={canceling}
                onClick={() => setConfirmingOrderId(null)}
              >
                아니요
              </button>
              <button type="button" className="profile-btn-outline" disabled={canceling} onClick={handleConfirmCancel}>
                {canceling ? '취소하는 중...' : '예'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
