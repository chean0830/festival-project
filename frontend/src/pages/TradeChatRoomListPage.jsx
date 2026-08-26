import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../components/common/Layout/Layout'
import RequireLogin from '../features/profile/components/RequireLogin'
import useCurrentMember from '../features/profile/hooks/useCurrentMember'
import { fetchMyTradeChatRooms } from '../api/tradeChatApi'
import { relativeTime } from '../utils/relativeTime'
import { STATUS_LABEL as LISTING_STATUS_LABEL } from '../components/usedtrade/usedTradeCategories'
import './TradeChatRoomListPage.css'

function getInitial(nickname) {
  return nickname ? nickname.slice(0, 1) : '?'
}

export default function TradeChatRoomListPage() {
  const navigate = useNavigate()
  const currentMember = useCurrentMember()
  const memberId = currentMember?.memberId

  const [rooms, setRooms] = useState(undefined)
  const [loadError, setLoadError] = useState(null)

  useEffect(() => {
    if (!memberId) return
    let cancelled = false
    fetchMyTradeChatRooms(memberId)
      .then((data) => {
        if (!cancelled) setRooms(data)
      })
      .catch((err) => {
        if (!cancelled) setLoadError(err.message)
      })
    return () => {
      cancelled = true
    }
  }, [memberId])

  if (currentMember === undefined) {
    return (
      <Layout>
        <div className="trade-chat-list-page">확인 중입니다...</div>
      </Layout>
    )
  }
  if (currentMember === null) {
    return <RequireLogin />
  }

  return (
    <Layout>
      <div className="trade-chat-list-page">
        <h1 className="trade-chat-list-page__title">나의 채팅</h1>

        {loadError && <p className="trade-chat-list-page__error">{loadError}</p>}

        {rooms === undefined && !loadError && <p className="trade-chat-list-page__empty">불러오는 중...</p>}

        {rooms && rooms.length === 0 && (
          <p className="trade-chat-list-page__empty">아직 중고거래 채팅이 없어요. MD 중고거래에서 구매 요청을 하면 채팅이 시작돼요.</p>
        )}

        {rooms && rooms.length > 0 && (
          <ul className="trade-chat-list-page__list">
            {rooms.map((room) => (
              <li key={room.roomId}>
                <button
                  type="button"
                  className="trade-chat-list-page__item"
                  onClick={() => navigate(`/shop/used/chat/${room.transactionId}`)}
                >
                  <span className="trade-chat-list-page__avatar">
                    {room.counterpartProfileImage ? (
                      <img src={room.counterpartProfileImage} alt="" />
                    ) : (
                      getInitial(room.counterpartNickname)
                    )}
                    {room.counterpartOnline && <span className="trade-chat-list-page__online-dot" />}
                  </span>

                  <span className="trade-chat-list-page__info">
                    <span className="trade-chat-list-page__row">
                      <span className="trade-chat-list-page__nickname">{room.counterpartNickname}</span>
                      <span className="trade-chat-list-page__listing-status">
                        {LISTING_STATUS_LABEL[room.listingStatus] ?? room.listingStatus}
                      </span>
                    </span>
                    <span className="trade-chat-list-page__listing-title">{room.listingTitle}</span>
                    <span className="trade-chat-list-page__preview">
                      {room.lastMessage
                        ? room.lastMessageType === 'IMAGE'
                          ? '사진을 보냈습니다'
                          : room.lastMessage
                        : '아직 메시지가 없어요'}
                    </span>
                  </span>

                  <span className="trade-chat-list-page__meta">
                    {room.lastMessageAt && <span className="trade-chat-list-page__time">{relativeTime(room.lastMessageAt)}</span>}
                    {room.unreadCount > 0 && <span className="trade-chat-list-page__badge">{room.unreadCount}</span>}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Layout>
  )
}
