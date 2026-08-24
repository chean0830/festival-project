import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import Layout from '../../components/common/Layout/Layout'
import {
  changeLiveChatEnabled,
  endLiveStream,
  fetchLiveStream,
  startLiveStream,
} from './api/liveApi'
import BrowserLivePlayer from './BrowserLivePlayer'
import './live.css'

const STATUS_LABEL = { SCHEDULED: '방송 대기', LIVE: 'LIVE', ENDED: '방송 종료' }
const MD_PREORDER_URL = ''
const TEMP_AD = {
  eyebrow: 'FESTLOG 광고',
  title: '광고 내용 준비 중입니다',
  url: '',
}

function LiveChatPanel({
  open,
  enabled,
  owner,
  viewerCount,
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
          <div className="live-chat__messages" aria-live="polite">
            {!enabled && (
              <div className="live-chat__system">방송자가 채팅을 중지했습니다.</div>
            )}
            {enabled && messages.length === 0 && (
              <div className="live-chat__empty">첫 번째 채팅을 남겨보세요.</div>
            )}
            {messages.map((message) => (
              <div className={`live-chat__message ${message.mine ? 'is-mine' : ''}`} key={message.id}>
                <div>
                  <strong>{message.senderName}</strong>
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
    </div>
  )
}

export default function LiveWatchPage() {
  const { streamId } = useParams()
  const navigate = useNavigate()
  const fullscreenRef = useRef(null)
  const playerRef = useRef(null)
  const [stream, setStream] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [changing, setChanging] = useState(false)
  const [browserReady, setBrowserReady] = useState(false)
  const [viewerCount, setViewerCount] = useState(0)
  const [chatOpen, setChatOpen] = useState(true)
  const [chatMessages, setChatMessages] = useState([])
  const [chatController, setChatController] = useState(null)
  const [chatInput, setChatInput] = useState('')
  const [sendingChat, setSendingChat] = useState(false)
  const [changingChatSetting, setChangingChatSetting] = useState(false)
  const [viewerPlaying, setViewerPlaying] = useState(true)
  const [viewerMuted, setViewerMuted] = useState(false)
  const [viewerVolume, setViewerVolume] = useState(1)
  const [viewerPip, setViewerPip] = useState(false)
  const [viewerFullscreen, setViewerFullscreen] = useState(false)
  const [adVisible, setAdVisible] = useState(true)

  useEffect(() => {
    fetchLiveStream(streamId)
      .then((result) => {
        setStream(result)
        setAdVisible(true)
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

  const getViewerMedia = useCallback(() => (
    Array.from(playerRef.current?.querySelectorAll('video, audio') ?? [])
  ), [])

  async function handleViewerPlayPause() {
    const media = getViewerMedia()
    if (media.length === 0) {
      setError('재생할 방송 영상을 준비하는 중입니다.')
      return
    }

    if (viewerPlaying) {
      media.forEach((element) => element.pause())
      setViewerPlaying(false)
      return
    }

    const results = await Promise.allSettled(media.map((element) => element.play()))
    if (results.some((result) => result.status === 'fulfilled')) {
      setViewerPlaying(true)
      setError('')
    } else {
      setError('방송 영상을 다시 재생하지 못했습니다.')
    }
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

  function handleMdPreorder() {
    openPreparedLink(MD_PREORDER_URL, 'MD 사전예약 링크를 준비 중입니다.')
  }

  function handleDonation() {
    window.alert('후원 기능을 준비 중입니다.')
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
              {stream.status !== 'ENDED' ? (
                <BrowserLivePlayer
                  streamId={stream.streamId}
                  owner={stream.owner}
                  status={stream.status}
                  chatEnabled={stream.chatEnabled}
                  onReadyChange={setBrowserReady}
                  onError={setError}
                  onChatEnabledChange={handleRemoteChatEnabledChange}
                  onChatMessage={handleChatMessage}
                  onStreamEnded={handleRemoteStreamEnded}
                  onChatControllerChange={handleChatControllerChange}
                  onViewerCountChange={setViewerCount}
                />
              ) : (
                <div className="live-player__waiting" style={{ backgroundImage: `linear-gradient(rgba(0,0,0,.55), rgba(0,0,0,.7)), url(${stream.thumbnailUrl})` }}>
                  <strong>방송이 종료되었습니다.</strong>
                </div>
              )}
              {!stream.owner && stream.status === 'LIVE' && adVisible && (
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
              <div className="live-player__hover-ui">
                <div className="live-player__hover-top">
                  <button
                    type="button"
                    className="live-player__quick-action"
                    onClick={handleMdPreorder}
                    aria-label="MD 사전예약"
                    title="MD 사전예약"
                  >
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M6.5 8.5h11l1 11h-13l1-11Z" />
                      <path d="M9 9V6.5a3 3 0 0 1 6 0V9" />
                    </svg>
                  </button>
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
                    <span className="live-player__live-label"><i /> {STATUS_LABEL[stream.status]}</span>
                    <span className="live-player__viewer-label">
                      <svg viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M16 20v-1.5a4.5 4.5 0 0 0-4.5-4.5h-3A4.5 4.5 0 0 0 4 18.5V20M10 10a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm7.5 3.5a3.7 3.7 0 0 1 2.5 3.5v1m-4-8a2.6 2.6 0 0 0 0-5" />
                      </svg>
                      {viewerCount}
                    </span>
                  </div>

                  <div className="live-player__action-group">
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
                      <button
                        type="button"
                        className="live-player__control"
                        onClick={handleViewerPlayPause}
                        aria-label={viewerPlaying ? '일시정지' : '재생'}
                        title={viewerPlaying ? '일시정지' : '재생'}
                      >
                        {viewerPlaying ? (
                          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 5v14M17 5v14" /></svg>
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
                  <li>카메라·마이크를 허용합니다.</li>
                  <li>미리보기를 확인합니다.</li>
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
                viewerCount={viewerCount}
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
      </div>
    </Layout>
  )
}
