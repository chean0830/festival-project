import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../components/common/Layout/Layout'
import RequireLogin from '../features/profile/components/RequireLogin'
import useCurrentMember from '../features/profile/hooks/useCurrentMember'
import { fetchMyTradeChatRooms } from '../api/tradeChatApi'
import { fetchMyOpenChatRooms } from '../api/chatApi'
import { relativeTime } from '../utils/relativeTime'
import { STATUS_LABEL as LISTING_STATUS_LABEL } from '../components/usedtrade/usedTradeCategories'
import './MyChatsPage.css'

function getInitial(text) {
  return text ? text.slice(0, 1) : '?'
}

function TradeChatTab({ memberId }) {
  const navigate = useNavigate()
  const [rooms, setRooms] = useState(undefined)
  const [loadError, setLoadError] = useState(null)

  useEffect(() => {
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

  if (loadError) return <p className="chat-room-list__error">{loadError}</p>
  if (rooms === undefined) return <p className="chat-room-list__empty">불러오는 중...</p>
  if (rooms.length === 0) {
    return (
      <p className="chat-room-list__empty">
        아직 중고거래 채팅이 없어요. MD 중고거래 매물에서 채팅하기를 눌러보세요.
      </p>
    )
  }

  return (
    <ul className="chat-room-list">
      {rooms.map((room) => (
        <li key={room.roomId}>
          <button
            type="button"
            className="chat-room-list__item"
            onClick={() => navigate(`/shop/used/chat/room/${room.roomId}`)}
          >
            <span className="chat-room-list__avatar">
              {room.counterpartProfileImage ? (
                <img src={room.counterpartProfileImage} alt="" />
              ) : (
                getInitial(room.counterpartNickname)
              )}
              {room.counterpartOnline && <span className="chat-room-list__online-dot" />}
            </span>

            <span className="chat-room-list__info">
              <span className="chat-room-list__row">
                <span className="chat-room-list__nickname">{room.counterpartNickname}</span>
                <span className="chat-room-list__badge-label">
                  {LISTING_STATUS_LABEL[room.listingStatus] ?? room.listingStatus}
                </span>
              </span>
              <span className="chat-room-list__title">{room.listingTitle}</span>
              <span className="chat-room-list__preview">
                {room.lastMessage
                  ? room.lastMessageType === 'IMAGE'
                    ? '사진을 보냈습니다'
                    : room.lastMessage
                  : '아직 메시지가 없어요'}
              </span>
            </span>

            <span className="chat-room-list__meta">
              {room.lastMessageAt && <span className="chat-room-list__time">{relativeTime(room.lastMessageAt)}</span>}
              {room.unreadCount > 0 && <span className="chat-room-list__unread">{room.unreadCount}</span>}
            </span>
          </button>
        </li>
      ))}
    </ul>
  )
}

function OpenChatTab({ memberId }) {
  const navigate = useNavigate()
  const [rooms, setRooms] = useState(undefined)
  const [loadError, setLoadError] = useState(null)

  useEffect(() => {
    let cancelled = false
    fetchMyOpenChatRooms(memberId)
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

  if (loadError) return <p className="chat-room-list__error">{loadError}</p>
  if (rooms === undefined) return <p className="chat-room-list__empty">불러오는 중...</p>
  if (rooms.length === 0) {
    return <p className="chat-room-list__empty">아직 참여 중인 오픈채팅이 없어요. 공연 상세에서 오픈채팅에 참여해보세요.</p>
  }

  return (
    <ul className="chat-room-list">
      {rooms.map((room) => (
        <li key={room.roomId}>
          <button
            type="button"
            className="chat-room-list__item"
            onClick={() => navigate(`/program/event/${room.eventId}/chat`)}
          >
            <span className="chat-room-list__avatar chat-room-list__avatar--room">{getInitial(room.eventName)}</span>

            <span className="chat-room-list__info">
              <span className="chat-room-list__row">
                <span className="chat-room-list__nickname">{room.eventName}</span>
              </span>
              <span className="chat-room-list__preview">{room.lastMessage ?? '아직 메시지가 없어요'}</span>
            </span>

            <span className="chat-room-list__meta">
              {room.lastMessageAt && <span className="chat-room-list__time">{relativeTime(room.lastMessageAt)}</span>}
              <span className="chat-room-list__participant-count">참여 {room.participantCount}명</span>
            </span>
          </button>
        </li>
      ))}
    </ul>
  )
}

export default function MyChatsPage() {
  const currentMember = useCurrentMember()
  const memberId = currentMember?.memberId
  const [activeTab, setActiveTab] = useState('trade')

  if (currentMember === undefined) {
    return (
      <Layout>
        <div className="my-chats-page">확인 중입니다...</div>
      </Layout>
    )
  }
  if (currentMember === null) {
    return <RequireLogin />
  }

  return (
    <Layout>
      <div className="my-chats-page">
        <h1 className="my-chats-page__title">나의 채팅</h1>

        <div className="my-chats-page__tabs" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'open'}
            className={`my-chats-page__tab${activeTab === 'open' ? ' my-chats-page__tab--active' : ''}`}
            onClick={() => setActiveTab('open')}
          >
            오픈채팅
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'trade'}
            className={`my-chats-page__tab${activeTab === 'trade' ? ' my-chats-page__tab--active' : ''}`}
            onClick={() => setActiveTab('trade')}
          >
            중고거래 채팅
          </button>
        </div>

        <div className="my-chats-page__panel">
          {activeTab === 'open' ? <OpenChatTab memberId={memberId} /> : <TradeChatTab memberId={memberId} />}
        </div>
      </div>
    </Layout>
  )
}
