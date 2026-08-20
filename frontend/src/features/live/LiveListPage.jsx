import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Layout from '../../components/common/Layout/Layout'
import useCurrentMember from '../profile/hooks/useCurrentMember'
import { fetchLiveStreams, fetchMyLiveStreams } from './api/liveApi'
import './live.css'

const STATUS_LABEL = {
  SCHEDULED: '방송 대기',
  LIVE: 'LIVE',
  ENDED: '종료',
}

function LiveCard({ stream, management = false }) {
  return (
    <Link to={`/live/${stream.streamId}`} className="live-card">
      <div className="live-card__visual">
        <img src={stream.thumbnailUrl} alt="" className="live-card__thumbnail" />
        <span className={`live-status live-status--${stream.status.toLowerCase()}`}>
          {STATUS_LABEL[stream.status]}
        </span>
      </div>
      <div className="live-card__body">
        <strong className="live-card__title">{stream.title}</strong>
        <span className="live-card__event">{stream.eventName}</span>
        <span className="live-card__host">
          {management ? '내 방송 관리' : stream.hostNickname}
        </span>
      </div>
    </Link>
  )
}

export default function LiveListPage() {
  const currentMember = useCurrentMember()
  const [streams, setStreams] = useState([])
  const [myStreams, setMyStreams] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadLiveStreams = useCallback(async () => {
    try {
      const data = await fetchLiveStreams()
      setStreams(data)
      setError('')
    } catch (loadError) {
      setError(loadError.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadLiveStreams()
    const timer = window.setInterval(loadLiveStreams, 5000)
    return () => window.clearInterval(timer)
  }, [loadLiveStreams])

  useEffect(() => {
    if (!currentMember?.memberId) return
    fetchMyLiveStreams().then(setMyStreams).catch(() => setMyStreams([]))
  }, [currentMember?.memberId])

  return (
    <Layout>
      <div className="live-page">
        <section className="live-hero">
          <div>
            <span className="live-eyebrow">FESTLOG LIVE</span>
            <h1>페스티벌의 순간을 라이브로</h1>
            <p>페스티벌을 라이브로 송출하고 FESTLOG에서 함께 시청하세요.</p>
          </div>
          {currentMember?.memberId ? (
            <Link to="/live/new" className="live-button live-button--primary">방송 만들기</Link>
          ) : (
            <Link to="/login" className="live-button live-button--primary">로그인하고 방송하기</Link>
          )}
        </section>

        <section className="live-section">
          <div className="live-section__heading">
            <h2><span className="live-dot" /> 지금 라이브</h2>
            <span>5초마다 방송 상태가 갱신됩니다.</span>
          </div>

          {loading && <p className="live-message">라이브 방송을 불러오는 중입니다...</p>}
          {error && <p className="live-message live-message--error">{error}</p>}
          {!loading && !error && streams.length === 0 && (
            <div className="live-empty">
              <strong>현재 진행 중인 방송이 없습니다.</strong>
              <span>새로운 라이브가 시작되면 이곳에 표시됩니다.</span>
            </div>
          )}
          {streams.length > 0 && (
            <div className="live-grid">
              {streams.map((stream) => <LiveCard key={stream.streamId} stream={stream} />)}
            </div>
          )}
        </section>

        {currentMember?.memberId && myStreams.length > 0 && (
          <section className="live-section live-section--mine">
            <div className="live-section__heading"><h2>내 방송 관리</h2></div>
            <div className="live-grid">
              {myStreams.map((stream) => (
                <LiveCard key={stream.streamId} stream={stream} management />
              ))}
            </div>
          </section>
        )}
      </div>
    </Layout>
  )
}
