import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Layout from '../../components/common/Layout/Layout'
import useCurrentMember from '../profile/hooks/useCurrentMember'
import { fetchLiveStreams } from './api/liveApi'
import { formatPrice } from '../../utils/formatPrice'
import './live.css'

const STATUS_LABEL = {
  SCHEDULED: '방송 대기',
  LIVE: 'LIVE',
  ENDED: '종료',
}

function LiveCard({ stream }) {
  return (
    <Link to={`/live/${stream.streamId}`} className="live-card">
      <div className="live-card__visual">
        <img src={stream.thumbnailUrl} alt="" className="live-card__thumbnail" />
        <span className={`live-status live-status--${stream.status.toLowerCase()}`}>
          {STATUS_LABEL[stream.status]}
        </span>
        <span className={`live-card__price ${Number(stream.entranceFee) > 0 ? 'is-paid' : ''}`}>
          {Number(stream.entranceFee) > 0 ? formatPrice(stream.entranceFee) : '무료'}
        </span>
      </div>
      <div className="live-card__body">
        <strong className="live-card__title">{stream.title}</strong>
        <span className="live-card__event">{stream.eventName}</span>
        <span className="live-card__host">{stream.hostNickname}</span>
      </div>
    </Link>
  )
}

export default function LiveListPage() {
  const currentMember = useCurrentMember()
  const isAdmin = currentMember?.role === 'ADMIN'
  const [streams, setStreams] = useState([])
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
    const initialTimer = window.setTimeout(loadLiveStreams, 0)
    const timer = window.setInterval(loadLiveStreams, 5000)
    return () => {
      window.clearTimeout(initialTimer)
      window.clearInterval(timer)
    }
  }, [loadLiveStreams])

  return (
    <Layout>
      <div className="live-page">
        <section className="live-hero">
          <div>
            <span className="live-eyebrow">FESTLOG LIVE</span>
            <h1>페스티벌의 순간을 라이브로</h1>
            <p>페스티벌을 라이브로 FESTLOG에서 함께 시청하세요.</p>
          </div>
          {isAdmin ? (
            <Link to="/live/new" className="live-button live-button--primary">방송 만들기</Link>
          ) : !currentMember?.memberId ? (
            <Link to="/login?returnTo=%2Flive" className="live-button live-button--primary">로그인하고 참여하기</Link>
          ) : null}
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
      </div>
    </Layout>
  )
}
