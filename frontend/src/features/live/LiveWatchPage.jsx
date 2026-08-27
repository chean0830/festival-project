import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import Layout from '../../components/common/Layout/Layout'
import { fetchPreorderProducts } from '../../api/mdShopApi'
import useCurrentMember from '../profile/hooks/useCurrentMember'
import { formatPrice } from '../../utils/formatPrice'
import { todayIso } from '../../utils/todayIso'
import { PAYMENT_METHOD_LABELS, requestTossPayment } from '../../utils/tossPayment'
import {
  changeLiveChatEnabled,
  endLiveStream,
  fetchLiveStream,
  startLiveStream,
} from './api/liveApi'
import { createLiveDonation } from './api/donationApi'
import BrowserLivePlayer from './BrowserLivePlayer'
import './live.css'

const STATUS_LABEL = { SCHEDULED: '방송 대기', LIVE: 'LIVE', ENDED: '방송 종료' }
const BROADCAST_QUALITY_LABEL = {
  SD: '360p · 데이터 절약',
  HD: '720p · 권장',
  FHD: '1080p · 고화질',
}
const TEMP_AD = {
  eyebrow: 'FESTLOG 광고',
  title: '광고 내용 준비 중입니다',
  url: '',
}
const DONATION_AMOUNTS = [1000, 3000, 5000, 10000]

function LiveDonationModal({
  open,
  streamTitle,
  amount,
  message,
  paymentMethod,
  submitting,
  error,
  onAmountChange,
  onMessageChange,
  onPaymentMethodChange,
  onClose,
  onSubmit,
}) {
  if (!open) return null

  return (
    <div className="live-donation-modal" role="presentation" onMouseDown={onClose}>
      <section
        className="live-donation-modal__dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="live-donation-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          className="live-donation-modal__close"
          onClick={onClose}
          disabled={submitting}
          aria-label="후원창 닫기"
        >
          ×
        </button>
        <span className="live-donation-modal__eyebrow">LIVE SUPPORT</span>
        <h2 id="live-donation-title">방송 후원하기</h2>
        <p><strong>{streamTitle}</strong> 방송자에게 응원의 마음을 전해보세요.</p>

        <form onSubmit={onSubmit} noValidate>
          <fieldset>
            <legend>후원 금액</legend>
            <div className="live-donation-modal__amounts">
              {DONATION_AMOUNTS.map((preset) => (
                <button
                  type="button"
                  key={preset}
                  className={Number(amount) === preset ? 'is-selected' : ''}
                  onClick={() => onAmountChange(String(preset))}
                >
                  {formatPrice(preset)}
                </button>
              ))}
            </div>
            <label className="live-donation-modal__custom-amount">
              <span>직접 입력</span>
              <span>
                <input
                  type="number"
                  value={amount}
                  onChange={(event) => onAmountChange(event.target.value)}
                  aria-label="후원 금액 직접 입력"
                  required
                />
                원
              </span>
            </label>
            <small>1,000원부터 1,000,000원까지 후원할 수 있습니다.</small>
          </fieldset>

          <label className="live-donation-modal__message">
            응원 메시지 <small>선택</small>
            <textarea
              value={message}
              onChange={(event) => onMessageChange(event.target.value)}
              maxLength="200"
              rows="3"
              placeholder="방송자에게 응원 메시지를 남겨보세요"
            />
            <span>{message.length}/200</span>
          </label>

          <fieldset>
            <legend>결제 수단</legend>
            <div className="live-donation-modal__methods">
              {PAYMENT_METHOD_LABELS.map((method) => (
                <button
                  type="button"
                  key={method}
                  className={paymentMethod === method ? 'is-selected' : ''}
                  onClick={() => onPaymentMethodChange(method)}
                >
                  {method}
                </button>
              ))}
            </div>
          </fieldset>

          <div className="live-donation-modal__total">
            <span>최종 후원 금액</span>
            <strong>{formatPrice(Number(amount) || 0)}</strong>
          </div>
          {error && <p className="live-donation-modal__error">{error}</p>}
          <button
            type="submit"
            className="live-donation-modal__submit"
            disabled={submitting}
          >
            {submitting ? '결제 준비 중...' : '후원 결제하기'}
          </button>
        </form>
      </section>
    </div>
  )
}

function LiveDonationWarningModal({ message, onClose }) {
  if (!message) return null

  return (
    <div className="live-donation-warning" role="presentation" onMouseDown={onClose}>
      <section
        className="live-donation-warning__dialog"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="live-donation-warning-title"
        aria-describedby="live-donation-warning-message"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="live-donation-warning__icon" aria-hidden="true">!</div>
        <h2 id="live-donation-warning-title">후원 금액을 확인해 주세요</h2>
        <p id="live-donation-warning-message">{message}</p>
        <button type="button" onClick={onClose} autoFocus>확인</button>
      </section>
    </div>
  )
}

function formatMdDeadline(preorderDeadline) {
  if (!preorderDeadline) return ''
  const deadlineDate = preorderDeadline.slice(0, 10)
  const today = todayIso()
  if (deadlineDate < today) return '예약 마감'

  const diffMs = new Date(`${deadlineDate}T00:00:00`) - new Date(`${today}T00:00:00`)
  const dDay = Math.round(diffMs / (1000 * 60 * 60 * 24))
  return dDay === 0 ? '오늘 마감' : `D-${dDay}`
}

function isMdProductClosed(product) {
  return product.status === 'SOLD_OUT'
    || product.stock <= 0
    || formatMdDeadline(product.preorderDeadline) === '예약 마감'
}

function LiveMdPreorderPanel({ open, eventName, products, loading, error, onClose, onSelect }) {
  if (!open) return null

  return (
    <aside className="live-md-panel" aria-label={`${eventName} MD 사전예약 목록`}>
      <div className="live-md-panel__header">
        <div>
          <small>{eventName}</small>
          <h2>MD 사전예약</h2>
        </div>
        <button type="button" onClick={onClose} aria-label="MD 사전예약 목록 닫기">×</button>
      </div>

      <div className="live-md-panel__body">
        {loading && <p className="live-md-panel__state">상품을 불러오는 중입니다...</p>}
        {!loading && error && <p className="live-md-panel__state live-md-panel__state--error">{error}</p>}
        {!loading && !error && products?.length === 0 && (
          <p className="live-md-panel__state">이 공연에 등록된 사전예약 상품이 없습니다.</p>
        )}

        {!loading && !error && products?.map((product) => {
          const closed = isMdProductClosed(product)
          const deadline = product.status === 'SOLD_OUT' || product.stock <= 0
            ? '품절'
            : formatMdDeadline(product.preorderDeadline)

          return (
            <button
              type="button"
              className="live-md-product"
              key={product.productId}
              onClick={() => onSelect(product)}
              disabled={closed}
            >
              <span className="live-md-product__image">
                {product.imageUrl ? <img src={product.imageUrl} alt="" /> : <span>MD</span>}
              </span>
              <span className="live-md-product__content">
                <strong>{product.name}</strong>
                <span className="live-md-product__price">{formatPrice(product.price)}</span>
                <span className="live-md-product__meta">
                  <span>남은 재고 {product.stock}개</span>
                  {deadline && <em className={closed ? 'is-closed' : ''}>{deadline}</em>}
                </span>
              </span>
            </button>
          )
        })}
      </div>

      <div className="live-md-panel__footer">상품을 선택하면 사전예약 주문서로 이동합니다.</div>
    </aside>
  )
}

function LiveChatPanel({
  open,
  enabled,
  owner,
  hostName,
  viewerCount,
  viewerParticipants,
  messages,
  controller,
  input,
  sending,
  changingSetting,
  onInputChange,
  onSubmit,
  onToggleOpen,
  onToggleEnabled,
}) {
  const [participantsOpen, setParticipantsOpen] = useState(false)

  return (
    <div className={`live-chat ${open ? '' : 'live-chat--closed'}`}>
      <div className="live-chat__header">
        <div>
          <h2>실시간 채팅</h2>
          <span className="live-viewer-count" aria-label={`현재 시청자 ${viewerCount}명`}>
            시청자 {viewerCount}명
          </span>
        </div>
        <div className="live-chat__header-actions">
          <button
            type="button"
            className={`live-chat__participants-button ${participantsOpen ? 'is-active' : ''}`}
            onClick={() => setParticipantsOpen((current) => !current)}
            aria-label="채팅 참여 인원"
            aria-expanded={participantsOpen}
            title="채팅 참여 인원"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M15 20v-1.5a4.5 4.5 0 0 0-4.5-4.5h-3A4.5 4.5 0 0 0 3 18.5V20M9 10a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm8-3h4m-4 4h4m-4 4h4" />
            </svg>
          </button>
          {owner && (
            <button
              type="button"
              className={`live-chat__setting ${enabled ? 'is-on' : ''}`}
              onClick={onToggleEnabled}
              disabled={changingSetting}
              aria-pressed={enabled}
            >
              채팅 {enabled ? 'ON' : 'OFF'}
            </button>
          )}
          <button
            type="button"
            className="live-chat__collapse"
            onClick={onToggleOpen}
            aria-expanded={open}
            aria-label="채팅창 닫기"
            title="채팅창 닫기"
          >
            ×
          </button>
        </div>
      </div>

      {open && (
        <>
          {participantsOpen ? (
            <div className="live-chat-participants">
              <div className="live-chat-participants__title">
                <div>
                  <strong>채팅 참여 인원</strong>
                  <span>현재 {viewerCount + 1}명 참여 중</span>
                </div>
                <button type="button" onClick={() => setParticipantsOpen(false)} aria-label="참여 인원 목록 닫기">×</button>
              </div>

              <section className="live-chat-participants__section">
                <h3>방송자</h3>
                <div className="live-chat-participant is-host">
                  <span className="live-chat-participant__avatar">
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <rect x="8" y="3" width="8" height="12" rx="4" />
                      <path d="M5 11a7 7 0 0 0 14 0M12 18v3m-4 0h8" />
                    </svg>
                  </span>
                  <strong>{hostName || '방송자'}</strong>
                  <span className="live-chat-participant__role">방송자</span>
                </div>
              </section>

              <section className="live-chat-participants__section">
                <h3>시청자 <span>{viewerCount}</span></h3>
                {viewerParticipants.length === 0 ? (
                  <p className="live-chat-participants__empty">현재 참여 중인 시청자가 없습니다.</p>
                ) : viewerParticipants.map((participant) => (
                  <div className="live-chat-participant" key={participant.identity}>
                    <span className="live-chat-participant__avatar">
                      {(participant.name || '시').slice(0, 1)}
                    </span>
                    <strong>{participant.name}</strong>
                    {participant.mine && <span className="live-chat-participant__mine">나</span>}
                  </div>
                ))}
              </section>
            </div>
          ) : (
            <>
              <div className="live-chat__messages" aria-live="polite">
                {!enabled && (
                  <div className="live-chat__system">방송자가 채팅을 중지했습니다.</div>
                )}
                {enabled && messages.length === 0 && (
                  <div className="live-chat__empty">첫 번째 채팅을 남겨보세요.</div>
                )}
                {messages.map((message) => (
                  <div
                    className={`live-chat__message ${message.mine ? 'is-mine' : ''} ${message.host ? 'is-host' : ''} ${message.donation ? 'is-donation' : ''}`}
                    key={message.id}
                  >
                    <div>
                      <strong>{message.senderName}</strong>
                      {message.donation && (
                        <span className="live-chat__donation-badge">
                          ♥ {formatPrice(message.amount)} 후원
                        </span>
                      )}
                      {message.host && (
                        <span className="live-chat__host-badge">
                          <svg viewBox="0 0 24 24" aria-hidden="true">
                            <rect x="8" y="3" width="8" height="12" rx="4" />
                            <path d="M5 11a7 7 0 0 0 14 0M12 18v3m-4 0h8" />
                          </svg>
                          방송자
                        </span>
                      )}
                      <time>{new Date(message.sentAt).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}</time>
                    </div>
                    <p>{message.text}</p>
                  </div>
                ))}
              </div>
              <form className="live-chat__form" onSubmit={onSubmit}>
                <input
                  value={input}
                  onChange={onInputChange}
                  maxLength="300"
                  placeholder={enabled ? '메시지를 입력하세요' : '현재 채팅을 사용할 수 없습니다'}
                  disabled={!enabled || !controller || sending}
                  aria-label="채팅 메시지"
                />
                <button
                  type="submit"
                  disabled={!enabled || !controller || sending || !input.trim()}
                >
                  전송
                </button>
              </form>
            </>
          )}
        </>
      )}
    </div>
  )
}

export default function LiveWatchPage() {
  const { streamId } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const currentMember = useCurrentMember()
  const fullscreenRef = useRef(null)
  const playerRef = useRef(null)
  const donationAnnouncedRef = useRef(null)
  const [stream, setStream] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [changing, setChanging] = useState(false)
  const [browserReady, setBrowserReady] = useState(false)
  const [viewerCount, setViewerCount] = useState(0)
  const [viewerParticipants, setViewerParticipants] = useState([])
  const [chatOpen, setChatOpen] = useState(true)
  const [chatMessages, setChatMessages] = useState([])
  const [chatController, setChatController] = useState(null)
  const [chatInput, setChatInput] = useState('')
  const [sendingChat, setSendingChat] = useState(false)
  const [changingChatSetting, setChangingChatSetting] = useState(false)
  const [viewerPlaying, setViewerPlaying] = useState(true)
  const [viewerQuality, setViewerQuality] = useState('AUTO')
  const [broadcastQuality, setBroadcastQuality] = useState('HD')
  const [viewerMuted, setViewerMuted] = useState(false)
  const [viewerVolume, setViewerVolume] = useState(1)
  const [viewerPip, setViewerPip] = useState(false)
  const [viewerFullscreen, setViewerFullscreen] = useState(false)
  const [adVisible, setAdVisible] = useState(true)
  const [mdPanelOpen, setMdPanelOpen] = useState(false)
  const [mdProducts, setMdProducts] = useState(null)
  const [mdLoading, setMdLoading] = useState(false)
  const [mdError, setMdError] = useState('')
  const [donationOpen, setDonationOpen] = useState(false)
  const [donationAmount, setDonationAmount] = useState('5000')
  const [donationMessage, setDonationMessage] = useState('')
  const [donationPaymentMethod, setDonationPaymentMethod] = useState(PAYMENT_METHOD_LABELS[0])
  const [donationSubmitting, setDonationSubmitting] = useState(false)
  const [donationError, setDonationError] = useState('')
  const [donationWarning, setDonationWarning] = useState('')

  useEffect(() => {
    fetchLiveStream(streamId)
      .then((result) => {
        setStream(result)
        setViewerPlaying(true)
        setAdVisible(true)
        setMdPanelOpen(false)
        setMdProducts(null)
        setMdError('')
      })
      .catch((loadError) => setError(loadError.message))
      .finally(() => setLoading(false))
  }, [streamId])

  useEffect(() => {
    function handleFullscreenChange() {
      const fullscreenElement = document.fullscreenElement ?? document.webkitFullscreenElement
      setViewerFullscreen(fullscreenElement === fullscreenRef.current)
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange)
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange)
    }
  }, [])

  useEffect(() => {
    const completedDonation = location.state?.completedDonation
    if (!completedDonation || !chatController?.sendDonation) return
    if (donationAnnouncedRef.current === completedDonation.donationId) return

    donationAnnouncedRef.current = completedDonation.donationId
    chatController.sendDonation(completedDonation)
      .then(() => {
        setChatOpen(true)
        navigate(location.pathname, { replace: true, state: null })
      })
      .catch((sendError) => setError(sendError.message))
  }, [chatController, location.pathname, location.state, navigate])

  const getViewerMedia = useCallback(() => (
    Array.from(playerRef.current?.querySelectorAll('video, audio') ?? [])
  ), [])

  function handleViewerPlayPause() {
    if (viewerPlaying) {
      if (document.pictureInPictureElement && document.exitPictureInPicture) {
        document.exitPictureInPicture().catch(() => {})
      }
      setViewerPip(false)
      setViewerPlaying(false)
      setMdPanelOpen(false)
      setViewerCount(0)
      setViewerParticipants([])
      setChatController(null)
      setError('')
      return
    }

    setViewerPlaying(true)
    setError('')
  }

  function applyViewerVolume(volume, muted) {
    getViewerMedia().forEach((element) => {
      element.volume = volume
      element.muted = muted
    })
  }

  function handleViewerMuteToggle() {
    const nextMuted = !viewerMuted
    setViewerMuted(nextMuted)
    applyViewerVolume(viewerVolume, nextMuted)
  }

  function handleViewerVolumeChange(event) {
    const nextVolume = Number(event.target.value)
    const nextMuted = nextVolume === 0
    setViewerVolume(nextVolume)
    setViewerMuted(nextMuted)
    applyViewerVolume(nextVolume, nextMuted)
  }

  async function handleViewerPip() {
    const video = playerRef.current?.querySelector('video')
    if (!video) {
      setError('PIP로 재생할 방송 영상을 준비하는 중입니다.')
      return
    }

    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture()
        setViewerPip(false)
      } else if (document.pictureInPictureEnabled && video.requestPictureInPicture) {
        video.addEventListener('leavepictureinpicture', () => setViewerPip(false), { once: true })
        await video.requestPictureInPicture()
        setViewerPip(true)
      } else if (video.webkitSupportsPresentationMode) {
        const nextMode = video.webkitPresentationMode === 'picture-in-picture' ? 'inline' : 'picture-in-picture'
        video.webkitSetPresentationMode(nextMode)
        setViewerPip(nextMode === 'picture-in-picture')
      } else {
        setError('현재 브라우저에서는 PIP 기능을 지원하지 않습니다.')
      }
    } catch {
      setError('PIP 화면을 시작하지 못했습니다.')
    }
  }

  async function handleViewerFullscreen() {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen()
      } else if (document.webkitFullscreenElement && document.webkitExitFullscreen) {
        document.webkitExitFullscreen()
      } else if (fullscreenRef.current?.requestFullscreen) {
        await fullscreenRef.current.requestFullscreen()
      } else if (fullscreenRef.current?.webkitRequestFullscreen) {
        fullscreenRef.current.webkitRequestFullscreen()
        setViewerFullscreen(true)
      } else {
        setError('현재 브라우저에서는 전체화면 기능을 지원하지 않습니다.')
      }
    } catch {
      setError('전체화면으로 전환하지 못했습니다.')
    }
  }

  function openPreparedLink(url, pendingMessage) {
    if (!url) {
      window.alert(pendingMessage)
      return
    }
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  async function handleMdPreorder() {
    const nextOpen = !mdPanelOpen
    setMdPanelOpen(nextOpen)
    if (!nextOpen || mdProducts !== null || mdLoading || !stream?.eventId) return

    setMdLoading(true)
    setMdError('')
    try {
      setMdProducts(await fetchPreorderProducts(stream.eventId))
    } catch (loadError) {
      setMdError(loadError.message)
    } finally {
      setMdLoading(false)
    }
  }

  function handleMdProductSelect(product) {
    if (isMdProductClosed(product)) return
    window.open(
      `/shop/preorder/${product.productId}/order`,
      '_blank',
      'noopener,noreferrer'
    )
  }

  function handleDonation() {
    if (!currentMember) {
      window.alert('로그인 후 후원할 수 있습니다.')
      return
    }
    setDonationAmount('5000')
    setDonationMessage('')
    setDonationPaymentMethod(PAYMENT_METHOD_LABELS[0])
    setDonationError('')
    setDonationWarning('')
    setDonationOpen(true)
  }

  async function handleDonationSubmit(event) {
    event.preventDefault()
    const amount = Number(donationAmount)
    if (!Number.isInteger(amount)) {
      setDonationWarning('후원 금액을 원 단위의 숫자로 입력해 주세요.')
      return
    }
    if (amount < 1000) {
      setDonationWarning('최소 후원 금액은 1,000원입니다.')
      return
    }
    if (amount > 1000000) {
      setDonationWarning('최대 후원 금액은 1,000,000원입니다.')
      return
    }

    setDonationSubmitting(true)
    setDonationError('')
    try {
      const donation = await createLiveDonation(stream.streamId, {
        amount,
        message: donationMessage.trim() || null,
      })
      await requestTossPayment({
        methodLabel: donationPaymentMethod,
        domainPrefix: 'DONATION',
        domainId: donation.donationId,
        amount,
        orderName: `${stream.title} 라이브 후원`,
        customerName: currentMember.nickname,
      })
    } catch (submitError) {
      setDonationError(submitError.message)
      setDonationSubmitting(false)
    }
  }

  function handleTemporaryAd() {
    openPreparedLink(TEMP_AD.url, '광고 상세 내용을 준비 중입니다.')
  }

  const handleChatMessage = useCallback((message) => {
    setChatMessages((current) => {
      if (current.some((item) => item.id === message.id)) return current
      return [...current, message].slice(-100)
    })
  }, [])

  const handleRemoteChatEnabledChange = useCallback((enabled) => {
    setStream((current) => current ? { ...current, chatEnabled: enabled } : current)
  }, [])

  const handleRemoteStreamEnded = useCallback(() => {
    setStream((current) => current ? { ...current, status: 'ENDED' } : current)
    setChatController(null)
    setBrowserReady(false)
    setError('')
  }, [])

  const handleChatControllerChange = useCallback((controller) => {
    setChatController(controller)
  }, [])

  async function handleStart() {
    if (!browserReady) {
      setError('먼저 카메라와 마이크를 시작해 주세요.')
      return
    }
    setChanging(true)
    setError('')
    try {
      setStream(await startLiveStream(streamId))
    } catch (changeError) {
      setError(changeError.message)
    } finally {
      setChanging(false)
    }
  }

  async function handleEnd() {
    if (!window.confirm('FESTLOG 라이브를 종료할까요? 종료 후 라이브 목록에서 사라집니다.')) return
    setChanging(true)
    try {
      try {
        await chatController?.notifyStreamEnded()
      } catch {
        // 연결이 이미 끊겼더라도 서버의 방송 종료 처리는 계속 진행합니다.
      }
      await endLiveStream(streamId)
      navigate('/live', { replace: true })
    } catch (changeError) {
      setError(changeError.message)
      setChanging(false)
    }
  }

  async function handleToggleChatEnabled() {
    if (!stream.owner || changingChatSetting) return
    setChangingChatSetting(true)
    setError('')
    try {
      setStream(await changeLiveChatEnabled(streamId, !stream.chatEnabled))
    } catch (changeError) {
      setError(changeError.message)
    } finally {
      setChangingChatSetting(false)
    }
  }

  async function handleSendChat(event) {
    event.preventDefault()
    const message = chatInput.trim()
    if (!message || !chatController || !stream.chatEnabled) return

    setSendingChat(true)
    setError('')
    try {
      await chatController.sendChat(message)
      setChatInput('')
    } catch (sendError) {
      setError(sendError.message)
    } finally {
      setSendingChat(false)
    }
  }

  if (loading) return <Layout><div className="live-page"><p>방송 정보를 불러오는 중입니다...</p></div></Layout>

  if (error && !stream) {
    return (
      <Layout><div className="live-page"><div className="live-empty"><strong>{error}</strong><Link to="/live">라이브 목록으로</Link></div></div></Layout>
    )
  }

  return (
    <Layout>
      <div className="live-watch-page">
        <div className="live-watch__topline">
          <Link to="/live" className="live-back">← 라이브 목록</Link>
          <span className={`live-status live-status--${stream.status.toLowerCase()}`}>{STATUS_LABEL[stream.status]}</span>
        </div>

        <div
          className={`live-watch__layout ${chatOpen ? '' : 'live-watch__layout--chat-hidden'}`}
          ref={fullscreenRef}
        >
          <section>
            <div className="live-player" ref={playerRef}>
              {stream.status !== 'ENDED' && (stream.owner || viewerPlaying) ? (
                <BrowserLivePlayer
                  streamId={stream.streamId}
                  owner={stream.owner}
                  status={stream.status}
                  broadcastQuality={broadcastQuality}
                  viewerQuality={viewerQuality}
                  chatEnabled={stream.chatEnabled}
                  onReadyChange={setBrowserReady}
                  onError={setError}
                  onChatEnabledChange={handleRemoteChatEnabledChange}
                  onChatMessage={handleChatMessage}
                  onStreamEnded={handleRemoteStreamEnded}
                  onChatControllerChange={handleChatControllerChange}
                  onViewerCountChange={setViewerCount}
                  onViewerParticipantsChange={setViewerParticipants}
                />
              ) : stream.status === 'ENDED' ? (
                <div className="live-player__waiting" style={{ backgroundImage: `linear-gradient(rgba(0,0,0,.55), rgba(0,0,0,.7)), url(${stream.thumbnailUrl})` }}>
                  <strong>방송이 종료되었습니다.</strong>
                </div>
              ) : (
                <div className="live-player__waiting" style={{ backgroundImage: `linear-gradient(rgba(0,0,0,.42), rgba(0,0,0,.68)), url(${stream.thumbnailUrl || '/favicon.svg'})` }}>
                  <div className="live-player__stopped-message">
                    <strong>시청을 정지했습니다.</strong>
                    <span>재생 버튼을 누르면 방송에 다시 참여합니다.</span>
                  </div>
                </div>
              )}
              {!stream.owner && stream.status === 'LIVE' && viewerPlaying && adVisible && (
                <div className="live-player__ad" role="complementary" aria-label="광고">
                  <button
                    type="button"
                    className="live-player__ad-content"
                    onClick={handleTemporaryAd}
                  >
                    <span className="live-player__ad-thumbnail" aria-hidden="true">AD</span>
                    <span>
                      <small>{TEMP_AD.eyebrow}</small>
                      <strong>{TEMP_AD.title}</strong>
                    </span>
                  </button>
                  <button
                    type="button"
                    className="live-player__ad-close"
                    onClick={() => setAdVisible(false)}
                    aria-label="광고 닫기"
                    title="광고 닫기"
                  >
                    ×
                  </button>
                </div>
              )}
              {!stream.owner && (
                <LiveMdPreorderPanel
                  open={mdPanelOpen}
                  eventName={stream.eventName}
                  products={mdProducts}
                  loading={mdLoading}
                  error={mdError}
                  onClose={() => setMdPanelOpen(false)}
                  onSelect={handleMdProductSelect}
                />
              )}
              <div className="live-player__hover-ui">
                <div className="live-player__hover-top">
                  {!stream.owner && (
                    <button
                      type="button"
                      className={`live-player__quick-action ${mdPanelOpen ? 'is-active' : ''}`}
                      onClick={handleMdPreorder}
                      aria-label="MD 사전예약"
                      aria-expanded={mdPanelOpen}
                      title="MD 사전예약"
                    >
                      <svg viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M6.5 8.5h11l1 11h-13l1-11Z" />
                        <path d="M9 9V6.5a3 3 0 0 1 6 0V9" />
                      </svg>
                    </button>
                  )}
                  <button
                    type="button"
                    className="live-player__quick-action live-player__chat-toggle"
                    onClick={() => setChatOpen((current) => !current)}
                    aria-label={chatOpen ? '채팅창 닫기' : '채팅창 열기'}
                    title={chatOpen ? '채팅창 닫기' : '채팅창 열기'}
                  >
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M5 5.5h14a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2h-7l-4.8 3.2.8-3.2H5a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2Z" />
                      <circle cx="8" cy="11" r="1" />
                      <circle cx="12" cy="11" r="1" />
                      <circle cx="16" cy="11" r="1" />
                    </svg>
                  </button>
                </div>
                <div className="live-player__hover-bottom">
                  <div className="live-player__status-group">
                    {!stream.owner && stream.status !== 'ENDED' && (
                      <div className="live-player__playback-controls">
                        <button
                          type="button"
                          className="live-player__control"
                          onClick={handleViewerPlayPause}
                          aria-label={viewerPlaying ? '시청 정지' : '방송 다시 참여'}
                          title={viewerPlaying ? '시청 정지' : '방송 다시 참여'}
                        >
                          {viewerPlaying ? (
                            <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="6" y="6" width="12" height="12" rx="1" /></svg>
                          ) : (
                            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m8 5 11 7-11 7Z" /></svg>
                          )}
                        </button>

                        <div className="live-player__volume-control">
                          <button
                            type="button"
                            className="live-player__control"
                            onClick={handleViewerMuteToggle}
                            aria-label={viewerMuted ? '음소거 해제' : '음소거'}
                            title={viewerMuted ? '음소거 해제' : '음소거'}
                          >
                            <svg viewBox="0 0 24 24" aria-hidden="true">
                              <path d="M5 9v6h4l5 4V5L9 9H5Z" />
                              {viewerMuted ? <path d="m18 9 4 4m0-4-4 4" /> : <path d="M17 9.5a4 4 0 0 1 0 5M19.5 7a7 7 0 0 1 0 10" />}
                            </svg>
                          </button>
                          <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.05"
                            value={viewerMuted ? 0 : viewerVolume}
                            onChange={handleViewerVolumeChange}
                            aria-label="볼륨 조절"
                          />
                        </div>
                      </div>
                    )}
                    <span className="live-player__live-label"><i /> {STATUS_LABEL[stream.status]}</span>
                  </div>

                  <div className="live-player__action-group">
                    <span className="live-player__viewer-label">
                      <svg viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M16 20v-1.5a4.5 4.5 0 0 0-4.5-4.5h-3A4.5 4.5 0 0 0 4 18.5V20M10 10a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm7.5 3.5a3.7 3.7 0 0 1 2.5 3.5v1m-4-8a2.6 2.6 0 0 0 0-5" />
                      </svg>
                      {viewerCount}
                    </span>
                    {!stream.owner && stream.status === 'LIVE' && (
                      <button
                        type="button"
                        className="live-player__donation"
                        onClick={handleDonation}
                        aria-label="후원"
                        title="후원"
                      >
                        <svg viewBox="0 0 24 24" aria-hidden="true">
                          <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z" />
                        </svg>
                        <span>후원</span>
                      </button>
                    )}

                    {!stream.owner && stream.status !== 'ENDED' && (
                      <div className="live-player__viewer-controls">
                      <label className="live-player__quality" title="시청 화질 선택">
                        <span className="sr-only">시청 화질</span>
                        <select
                          value={viewerQuality}
                          onChange={(event) => setViewerQuality(event.target.value)}
                          aria-label="시청 화질 선택"
                        >
                          <option value="AUTO">자동</option>
                          <option value="LOW">저화질</option>
                          <option value="MEDIUM">일반</option>
                          <option value="HIGH">고화질</option>
                        </select>
                      </label>

                      <button
                        type="button"
                        className={`live-player__control ${viewerPip ? 'is-active' : ''}`}
                        onClick={handleViewerPip}
                        aria-label="PIP 화면"
                        title="PIP 화면"
                      >
                        <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2" /><rect x="12" y="11" width="7" height="5" rx="1" /></svg>
                      </button>

                      <button
                        type="button"
                        className={`live-player__control ${viewerFullscreen ? 'is-active' : ''}`}
                        onClick={handleViewerFullscreen}
                        aria-label={viewerFullscreen ? '전체화면 종료' : '전체화면'}
                        title={viewerFullscreen ? '전체화면 종료' : '전체화면'}
                      >
                        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 3H3v5m13-5h5v5M8 21H3v-5m13 5h5v-5" /></svg>
                      </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {stream.owner && (
              <div className="live-broadcast-controls live-broadcast-controls--below-player">
                <div className="live-broadcast-controls__heading">
                  <div>
                    <h2>방송 관리</h2>
                    <p>카메라와 마이크 상태를 확인한 뒤 방송을 시작하거나 종료하세요.</p>
                  </div>
                  <div className="live-broadcast-controls__actions">
                    {stream.status === 'SCHEDULED' && (
                      <label className="live-broadcast-quality">
                        <span>송출 화질</span>
                        <select
                          value={broadcastQuality}
                          onChange={(event) => setBroadcastQuality(event.target.value)}
                          disabled={browserReady}
                          aria-label="방송 송출 화질 선택"
                        >
                          {Object.entries(BROADCAST_QUALITY_LABEL).map(([value, label]) => (
                            <option key={value} value={value}>{label}</option>
                          ))}
                        </select>
                      </label>
                    )}
                    {stream.status === 'SCHEDULED' && (
                      <button
                        className="live-button live-button--primary"
                        onClick={handleStart}
                        disabled={changing || !browserReady}
                      >
                        방송 시작
                      </button>
                    )}
                    {stream.status === 'LIVE' && (
                      <button
                        className="live-button live-button--danger"
                        onClick={handleEnd}
                        disabled={changing}
                      >
                        방송 종료
                      </button>
                    )}
                  </div>
                </div>
                <ol className="live-guide live-guide--horizontal">
                  <li>송출 화질을 선택합니다.</li>
                  <li>카메라·마이크를 허용하고 미리보기를 확인합니다.</li>
                  <li>방송 시작 또는 종료 버튼을 누릅니다.</li>
                </ol>
              </div>
            )}

            <div className="live-watch__info">
              <span>{stream.eventName}</span>
              <h1>{stream.title}</h1>
              <div className="live-watch__host">방송자 <strong>{stream.hostNickname}</strong></div>
              {stream.description && <p>{stream.description}</p>}
            </div>
          </section>

          {chatOpen && (
            <aside className="live-side-panel">
              <LiveChatPanel
                open
                enabled={stream.chatEnabled}
                owner={stream.owner}
                hostName={stream.hostNickname}
                viewerCount={viewerCount}
                viewerParticipants={viewerParticipants}
                messages={chatMessages}
                controller={chatController}
                input={chatInput}
                sending={sendingChat}
                changingSetting={changingChatSetting}
                onInputChange={(event) => setChatInput(event.target.value)}
                onSubmit={handleSendChat}
                onToggleOpen={() => setChatOpen(false)}
                onToggleEnabled={handleToggleChatEnabled}
              />
            </aside>
          )}
        </div>
        {error && <p className="live-message live-message--error">{error}</p>}
        <LiveDonationModal
          open={donationOpen}
          streamTitle={stream.title}
          amount={donationAmount}
          message={donationMessage}
          paymentMethod={donationPaymentMethod}
          submitting={donationSubmitting}
          error={donationError}
          onAmountChange={setDonationAmount}
          onMessageChange={setDonationMessage}
          onPaymentMethodChange={setDonationPaymentMethod}
          onClose={() => {
            if (!donationSubmitting) setDonationOpen(false)
          }}
          onSubmit={handleDonationSubmit}
        />
        <LiveDonationWarningModal
          message={donationWarning}
          onClose={() => setDonationWarning('')}
        />
      </div>
    </Layout>
  )
}
