import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../../components/common/Layout/Layout'
import { fetchMyBadges } from './api/profileApi'
import './profile.css'

function ShareIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
    </svg>
  )
}

export default function BadgePage({ memberId }) {
  const navigate = useNavigate()
  const [badges, setBadges] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(null)
  const [sharedBadgeId, setSharedBadgeId] = useState(null)
  const [openBadgeId, setOpenBadgeId] = useState(null)

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      setLoadError(null)
      try {
        const data = await fetchMyBadges(memberId)
        if (!cancelled) setBadges(data)
      } catch (err) {
        if (!cancelled) setLoadError(err.message)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [memberId])

  async function handleShare(badge) {
    const shareText = `🏅 페스티벌 뱃지 "${badge.name}"를 획득했어요!\n${badge.description}`

    if (navigator.share) {
      try {
        await navigator.share({ text: shareText })
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error(err)
        }
      }
      return
    }

    if (navigator.clipboard) {
      await navigator.clipboard.writeText(shareText)
      setSharedBadgeId(badge.badgeId)
      setTimeout(() => setSharedBadgeId((current) => (current === badge.badgeId ? null : current)), 1500)
    }
  }

  if (loading) {
    return (
      <Layout>
        <div className="profile-page">뱃지를 불러오는 중입니다...</div>
      </Layout>
    )
  }

  if (loadError) {
    return (
      <Layout>
        <div className="profile-page profile-error-text">뱃지를 불러오지 못했습니다: {loadError}</div>
      </Layout>
    )
  }

  const earnedCount = badges.filter((badge) => badge.earned).length

  return (
    <Layout>
      <div className="profile-page">
      <div className="profile-content">
        <div className="profile-header-row">
          <h1>나의 뱃지</h1>
          <button type="button" className="profile-badge-entry" onClick={() => navigate('/profile')}>
            ← 프로필로
          </button>
        </div>

        <p className="profile-badge-progress">
          {earnedCount} / {badges.length}개 획득
        </p>

        <ul className="profile-badge-grid">
          {badges.map((badge) => (
            <li
              key={badge.badgeId}
              className={
                'profile-badge-tile' +
                (badge.earned ? '' : ' profile-badge-locked') +
                (badge.newlyEarned ? ' profile-badge-new' : '')
              }
            >
              <button
                type="button"
                className="profile-badge-circle"
                onClick={() => setOpenBadgeId((current) => (current === badge.badgeId ? null : badge.badgeId))}
              >
                {badge.newlyEarned && <span className="profile-badge-new-tag">NEW</span>}
                <span className="profile-badge-icon">{badge.badgeImage || '🏅'}</span>
              </button>

              <span className="profile-badge-name">{badge.name}</span>
              <span className="profile-badge-tooltip">{badge.description}</span>

              {badge.earned && (
                <button
                  type="button"
                  className={
                    'profile-badge-share' + (openBadgeId === badge.badgeId ? ' profile-badge-share-visible' : '')
                  }
                  onClick={() => handleShare(badge)}
                >
                  <ShareIcon />
                  {sharedBadgeId === badge.badgeId ? '복사됨!' : '공유'}
                </button>
              )}
            </li>
          ))}
        </ul>
      </div>
      </div>
    </Layout>
  )
}
