import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import Layout from '../../components/common/Layout/Layout'
import { endLiveStream, fetchLiveStream, startLiveStream } from './api/liveApi'
import './live.css'

const STATUS_LABEL = { SCHEDULED: '방송 대기', LIVE: 'LIVE', ENDED: '방송 종료' }

export default function LiveWatchPage() {
  const { streamId } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const youtubeSetup = location.state?.youtubeSetup
  const [stream, setStream] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [changing, setChanging] = useState(false)

  useEffect(() => {
    fetchLiveStream(streamId)
      .then(setStream)
      .catch((loadError) => setError(loadError.message))
      .finally(() => setLoading(false))
  }, [streamId])

  async function handleStart() {
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
      await endLiveStream(streamId)
      navigate('/live', { replace: true })
    } catch (changeError) {
      setError(changeError.message)
      setChanging(false)
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

        <div className="live-watch__layout">
          <section>
            <div className="live-player">
              {stream.status === 'LIVE' ? (
                <iframe
                  src={stream.youtubeEmbedUrl}
                  title={stream.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              ) : (
                <div className="live-player__waiting" style={{ backgroundImage: `linear-gradient(rgba(0,0,0,.55), rgba(0,0,0,.7)), url(${stream.thumbnailUrl})` }}>
                  <strong>{stream.status === 'SCHEDULED' ? '방송 시작을 기다리고 있습니다.' : '종료된 방송입니다.'}</strong>
                </div>
              )}
            </div>

            <div className="live-watch__info">
              <span>{stream.eventName}</span>
              <h1>{stream.title}</h1>
              <div className="live-watch__host">방송자 <strong>{stream.hostNickname}</strong></div>
              {stream.description && <p>{stream.description}</p>}
            </div>
          </section>

          <aside className="live-side-panel">
            {stream.owner ? (
              <>
                <h2>방송 관리</h2>
                {youtubeSetup && (
                  <div className="obs-setup-card">
                    <strong>OBS 연결 정보</strong>
                    <p>보안을 위해 지금 화면에서만 확인하세요. 스트림 키를 다른 사람에게 보내면 안 됩니다.</p>
                    <label>
                      서버
                      <div><code>{youtubeSetup.obsServerUrl}</code><button type="button" onClick={() => navigator.clipboard.writeText(youtubeSetup.obsServerUrl)}>복사</button></div>
                    </label>
                    <label>
                      스트림 키
                      <div><code>{youtubeSetup.streamKey}</code><button type="button" onClick={() => navigator.clipboard.writeText(youtubeSetup.streamKey)}>복사</button></div>
                    </label>
                  </div>
                )}
                <ol className="live-guide">
                  <li>OBS 설정의 방송 서비스에서 사용자 지정 또는 YouTube RTMPS를 선택합니다.</li>
                  <li>위 서버 주소와 스트림 키를 OBS에 넣고 송출합니다.</li>
                  <li>YouTube 미리보기를 확인한 뒤 아래 버튼을 누릅니다.</li>
                </ol>
                {stream.status === 'SCHEDULED' && (
                  <button className="live-button live-button--primary live-button--wide" onClick={handleStart} disabled={changing}>방송 시작 상태로 변경</button>
                )}
                {stream.status === 'LIVE' && (
                  <button className="live-button live-button--danger live-button--wide" onClick={handleEnd} disabled={changing}>방송 종료</button>
                )}
                <a href={stream.youtubeWatchUrl} target="_blank" rel="noreferrer" className="live-button live-button--ghost live-button--wide">YouTube에서 확인</a>
                <p className="live-guide__note">FESTLOG의 시작·종료 버튼은 목록 공개 상태를 바꿉니다. 실제 영상 송출은 OBS와 YouTube Studio에서 관리해 주세요.</p>
              </>
            ) : (
              <>
                <h2>실시간 방송</h2>
                <p className="live-side-panel__text">채팅 기능은 다음 개발 단계에서 이 영역에 연결할 수 있습니다.</p>
              </>
            )}
          </aside>
        </div>
        {error && <p className="live-message live-message--error">{error}</p>}
      </div>
    </Layout>
  )
}
