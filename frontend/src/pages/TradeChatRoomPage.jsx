import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Client } from '@stomp/stompjs'
import SockJS from 'sockjs-client'
import Layout from '../components/common/Layout/Layout'
import RequireLogin from '../features/profile/components/RequireLogin'
import useCurrentMember from '../features/profile/hooks/useCurrentMember'
import { STATUS_LABEL as LISTING_STATUS_LABEL, TX_STATUS_LABEL } from '../components/usedtrade/usedTradeCategories'
import {
  getOrCreateTradeChatRoom,
  fetchTradeChatRoom,
  fetchTradeChatMessages,
  enterTradeChatRoom,
  exitTradeChatRoom,
  blockTradeChatCounterpart,
  unblockTradeChatCounterpart,
  uploadTradeChatImage,
  reportTradeChatMessage,
  reportTradeChatUser,
} from '../api/tradeChatApi'
import './TradeChatRoomPage.css'

function formatTime(dateStr) {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  const hours = date.getHours()
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const period = hours < 12 ? '오전' : '오후'
  const hour12 = hours % 12 === 0 ? 12 : hours % 12
  return `${period} ${hour12}:${minutes}`
}

function formatLastSeen(dateStr) {
  if (!dateStr) return null
  const diffMs = Date.now() - new Date(dateStr).getTime()
  const diffMin = Math.floor(diffMs / 60000)
  if (diffMin < 1) return '방금 전 접속'
  if (diffMin < 60) return `${diffMin}분 전 접속`
  const diffHour = Math.floor(diffMin / 60)
  if (diffHour < 24) return `${diffHour}시간 전 접속`
  return `${Math.floor(diffHour / 24)}일 전 접속`
}

export default function TradeChatRoomPage() {
  const { transactionId, roomId: roomIdParam } = useParams()
  const navigate = useNavigate()
  const currentMember = useCurrentMember()
  const memberId = currentMember?.memberId

  const [room, setRoom] = useState(undefined)
  const [loadError, setLoadError] = useState(null)
  const [messages, setMessages] = useState([])
  const [connected, setConnected] = useState(false)
  const [input, setInput] = useState('')
  const [warning, setWarning] = useState(null)
  const [actionError, setActionError] = useState(null)

  const clientRef = useRef(null)
  const messagesEndRef = useRef(null)
  const fileInputRef = useRef(null)

  useEffect(() => {
    if (!memberId) return undefined
    let cancelled = false

    async function load() {
      try {
        const roomData = transactionId
          ? await getOrCreateTradeChatRoom(memberId, transactionId)
          : await fetchTradeChatRoom(memberId, roomIdParam)
        if (cancelled) return
        setRoom(roomData)

        await enterTradeChatRoom(memberId, roomData.roomId)

        const history = await fetchTradeChatMessages(memberId, roomData.roomId)
        if (cancelled) return
        setMessages(history)

        const client = new Client({
          webSocketFactory: () => new SockJS('/ws-chat'),
          reconnectDelay: 3000,
          onConnect: () => {
            if (cancelled) return
            setConnected(true)
            client.subscribe(`/topic/trade-chat-rooms/${roomData.roomId}`, (frame) => {
              const received = JSON.parse(frame.body)
              setMessages((prev) => [...prev, received])
            })
            client.subscribe(`/topic/trade-chat-rooms/${roomData.roomId}/warning`, (frame) => {
              setWarning(JSON.parse(frame.body))
            })
            client.subscribe(`/topic/trade-chat-rooms/${roomData.roomId}/read`, (frame) => {
              const event = JSON.parse(frame.body)
              setMessages((prev) =>
                prev.map((m) =>
                  m.senderId === memberId && m.messageId <= event.upToMessageId ? { ...m, read: true } : m,
                ),
              )
            })
            client.subscribe(`/topic/trade-chat-rooms/${roomData.roomId}/presence`, (frame) => {
              const presence = JSON.parse(frame.body)
              if (presence.memberId !== memberId) {
                setRoom((prev) => (prev ? { ...prev, counterpartOnline: presence.online } : prev))
              }
            })
          },
          onWebSocketClose: () => {
            if (!cancelled) setConnected(false)
          },
        })
        client.activate()
        clientRef.current = client
      } catch (err) {
        if (!cancelled) setLoadError(err.message)
      }
    }

    load()

    return () => {
      cancelled = true
      clientRef.current?.deactivate()
      clientRef.current = null
      if (room?.roomId) {
        exitTradeChatRoom(memberId, room.roomId).catch(() => {})
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [memberId, transactionId, roomIdParam])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  function sendPayload(message, messageType) {
    if (!room || !clientRef.current?.connected) return
    clientRef.current.publish({
      destination: `/app/trade-chat-rooms/${room.roomId}/send`,
      body: JSON.stringify({ memberId, message, messageType }),
    })
  }

  function handleSend(e) {
    e.preventDefault()
    const trimmed = input.trim()
    if (!trimmed) return
    sendPayload(trimmed, 'TEXT')
    setInput('')
  }

  async function handleImagePick(e) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    try {
      const { imageUrl } = await uploadTradeChatImage(memberId, file)
      sendPayload(imageUrl, 'IMAGE')
    } catch (err) {
      setActionError(err.message)
    }
  }

  async function handleBlock() {
    if (!room) return
    const confirmMsg = room.blocked
      ? '차단을 해제할까요? 다시 메시지를 주고받을 수 있게 돼요.'
      : `${room.counterpartNickname}님을 차단할까요? 서로 메시지를 주고받을 수 없게 돼요.`
    if (!window.confirm(confirmMsg)) return

    try {
      if (room.blocked) {
        await unblockTradeChatCounterpart(memberId, room.roomId)
        setRoom((prev) => ({ ...prev, blocked: false, blockedByMe: false }))
      } else {
        await blockTradeChatCounterpart(memberId, room.roomId)
        setRoom((prev) => ({ ...prev, blocked: true, blockedByMe: true }))
      }
    } catch (err) {
      setActionError(err.message)
    }
  }

  async function handleReportMessage(msg) {
    if (!window.confirm('이 메시지를 신고할까요?')) return
    try {
      await reportTradeChatMessage(memberId, msg.messageId, '중고거래 채팅 메시지 신고')
      window.alert('신고했어요. 운영팀이 확인할게요.')
    } catch (err) {
      setActionError(err.message)
    }
  }

  async function handleReportUser() {
    if (!room) return
    if (!window.confirm(`${room.counterpartNickname}님을 신고할까요?`)) return
    try {
      await reportTradeChatUser(memberId, room.counterpartId, '중고거래 채팅 사용자 신고')
      window.alert('신고했어요. 운영팀이 확인할게요.')
    } catch (err) {
      setActionError(err.message)
    }
  }

  if (currentMember === undefined) {
    return (
      <Layout hideSubnav hideFooter>
        <div className="trade-chat-page">확인 중입니다...</div>
      </Layout>
    )
  }
  if (currentMember === null) {
    return <RequireLogin />
  }

  return (
    <Layout hideSubnav hideFooter>
      <div className="trade-chat-page">
        {loadError && <p className="trade-chat-page__error">{loadError}</p>}

        {!loadError && (
          <div className="trade-chat-page__card">
            <div className="trade-chat-page__head">
              <button type="button" className="trade-chat-page__back" onClick={() => navigate(-1)}>
                ‹
              </button>
              <div className="trade-chat-page__head-info">
                <span className="trade-chat-page__nickname">{room?.counterpartNickname ?? '상대방'}</span>
                <span className="trade-chat-page__presence">
                  {room?.counterpartOnline
                    ? '🟢 온라인'
                    : room?.counterpartLastSeenAt
                      ? formatLastSeen(room.counterpartLastSeenAt)
                      : '오프라인'}
                </span>
              </div>
              <button type="button" className="trade-chat-page__menu-btn" onClick={handleReportUser} title="사용자 신고">
                🚩
              </button>
              <button type="button" className="trade-chat-page__menu-btn" onClick={handleBlock} title="차단">
                {room?.blocked ? '차단해제' : '🚫'}
              </button>
            </div>

            {room && (
              <div className="trade-chat-page__status-banner">
                <img src={room.listingImageUrl} alt="" className="trade-chat-page__status-thumb" />
                <div className="trade-chat-page__status-text">
                  <span className="trade-chat-page__status-title">{room.listingTitle}</span>
                  <span className="trade-chat-page__status-badge">
                    {LISTING_STATUS_LABEL[room.listingStatus] ?? room.listingStatus}
                    {room.transactionStatus &&
                      ` · ${TX_STATUS_LABEL[room.transactionStatus] ?? room.transactionStatus}`}
                  </span>
                </div>
              </div>
            )}

            {actionError && <p className="trade-chat-page__error trade-chat-page__error--inline">{actionError}</p>}

            <div className="trade-chat-page__messages">
              {messages.length === 0 && <p className="trade-chat-page__empty">아직 메시지가 없어요. 첫 메시지를 남겨보세요!</p>}
              {messages.map((msg) => {
                const isMine = msg.senderId === memberId
                return (
                  <div
                    key={msg.messageId}
                    className={`trade-chat-page__message${isMine ? ' trade-chat-page__message--mine' : ''}`}
                  >
                    <div className="trade-chat-page__bubble-col">
                      <div className="trade-chat-page__bubble">
                        {msg.messageType === 'IMAGE' ? (
                          <img src={msg.message} alt="첨부 이미지" className="trade-chat-page__image-message" />
                        ) : (
                          <span>{msg.message}</span>
                        )}
                      </div>
                      <div className="trade-chat-page__meta-row">
                        {isMine && msg.read && <span className="trade-chat-page__read">읽음</span>}
                        <span className="trade-chat-page__time">{formatTime(msg.createdAt)}</span>
                        {!isMine && (
                          <button
                            type="button"
                            className="trade-chat-page__report-msg"
                            onClick={() => handleReportMessage(msg)}
                          >
                            신고
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
              <div ref={messagesEndRef} />
            </div>

            {room?.blocked ? (
              <p className="trade-chat-page__blocked-notice">
                {room.blockedByMe ? '상대방을 차단했어요.' : '상대방이 채팅을 차단했어요.'} 메시지를 보낼 수 없어요.
              </p>
            ) : (
              <form className="trade-chat-page__input-row" onSubmit={handleSend}>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  hidden
                  onChange={handleImagePick}
                />
                <button
                  type="button"
                  className="trade-chat-page__image-btn"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={!connected}
                  aria-label="이미지 첨부"
                >
                  📷
                </button>
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={connected ? '메시지를 입력하세요' : '연결 중...'}
                  disabled={!connected}
                  maxLength={1000}
                />
                <button type="submit" className="trade-chat-page__send-btn" disabled={!connected || !input.trim()}>
                  전송
                </button>
              </form>
            )}
          </div>
        )}

        {warning && (
          <div className="trade-chat-page__warning-backdrop" onClick={() => setWarning(null)}>
            <div className="trade-chat-page__warning-dialog" onClick={(e) => e.stopPropagation()}>
              <p className="trade-chat-page__warning-text">{warning.warningText}</p>
              <button type="button" className="trade-chat-page__warning-close" onClick={() => setWarning(null)}>
                확인했어요
              </button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}
