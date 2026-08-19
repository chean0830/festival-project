import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../../components/common/Layout/Layout'
import {
  fetchProfile,
  updateNickname,
  updateIntroduction,
  uploadProfileImage,
  deleteProfileImage,
  fetchInterestedArtists,
  fetchInterestedEvents,
  fetchAttendedEvents,
  fetchUpcomingEvents,
  fetchMyBadges,
  fetchProfileStats,
} from './api/profileApi'
import ProfileImageUploader from './components/ProfileImageUploader'
import NicknameEditor from './components/NicknameEditor'
import IntroductionEditor from './components/IntroductionEditor'
import InterestedArtistList from './components/InterestedArtistList'
import InterestedEventList from './components/InterestedEventList'
import AttendedEventGallery from './components/AttendedEventGallery'
import UpcomingEventList from './components/UpcomingEventList'
import ProfileStats from './components/ProfileStats'
import './profile.css'

/**
 * 프로필 담당 진입 컴포넌트.
 * 로그인 기능이 아직 없어 memberId를 prop으로 받는다.
 * 로그인 기능이 붙으면, 실제 로그인한 사용자의 memberId를 여기로 넘겨주면 된다.
 */
export default function ProfilePage({ memberId }) {
  const navigate = useNavigate()
  const [profile, setProfile] = useState(null)
  const [artists, setArtists] = useState([])
  const [events, setEvents] = useState([])
  const [attendedEvents, setAttendedEvents] = useState([])
  const [upcomingEvents, setUpcomingEvents] = useState([])
  const [badges, setBadges] = useState([])
  const [stats, setStats] = useState(null)
  const [attendedExpanded, setAttendedExpanded] = useState(false)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(null)
  const attendedSectionRef = useRef(null)

  function goToAttendedSection(expandAll) {
    if (expandAll) setAttendedExpanded(true)
    attendedSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      setLoadError(null)
      try {
        const [profileData, artistData, eventData, attendedData, upcomingData, badgeData, statsData] = await Promise.all([
          fetchProfile(memberId),
          fetchInterestedArtists(memberId),
          fetchInterestedEvents(memberId),
          fetchAttendedEvents(memberId),
          fetchUpcomingEvents(memberId),
          fetchMyBadges(memberId),
          fetchProfileStats(memberId),
        ])
        if (!cancelled) {
          setProfile(profileData)
          setArtists(artistData)
          setEvents(eventData)
          setAttendedEvents(attendedData)
          setUpcomingEvents(upcomingData)
          setBadges(badgeData)
          setStats(statsData)

          // 새로 획득한 뱃지가 있으면 곧바로 뱃지 페이지로 넘어가서 보여준다.
          if (badgeData.some((badge) => badge.newlyEarned)) {
            navigate('/profile/badges')
          }
        }
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [memberId])

  if (loading) {
    return (
      <Layout>
        <div className="profile-page">프로필을 불러오는 중입니다...</div>
      </Layout>
    )
  }

  if (loadError) {
    return (
      <Layout>
        <div className="profile-page profile-error-text">프로필을 불러오지 못했습니다: {loadError}</div>
      </Layout>
    )
  }

  const earnedBadgeCount = badges.filter((badge) => badge.earned).length

  return (
    <Layout>
      <div className="profile-page">
      <div className="profile-content">
        <div className="profile-header-row">
          <h1>내 프로필</h1>
          <button type="button" className="profile-badge-entry" onClick={() => navigate('/profile/badges')}>
            🏅 나의 뱃지 {earnedBadgeCount}/{badges.length}
          </button>
        </div>

        <div className="profile-top">
          <ProfileImageUploader
            imageUrl={profile.profileImageUrl}
            onUpload={async (file) => {
              const result = await uploadProfileImage(memberId, file)
              setProfile((prev) => ({ ...prev, profileImageUrl: result.profileImageUrl }))
            }}
            onDelete={async () => {
              await deleteProfileImage(memberId)
              setProfile((prev) => ({ ...prev, profileImageUrl: null }))
            }}
          />

          <div className="profile-top-fields">
            <NicknameEditor
              nickname={profile.nickname}
              onSave={async (nickname) => {
                const result = await updateNickname(memberId, nickname)
                setProfile(result)
              }}
            />

            <IntroductionEditor
              introduction={profile.introduction}
              onSave={async (introduction) => {
                const result = await updateIntroduction(memberId, introduction)
                setProfile(result)
              }}
            />
          </div>
        </div>

        <section>
          <h2>관심 가수</h2>
          <InterestedArtistList artists={artists} />
        </section>

        <section>
          <h2>나의 공연</h2>

          <ProfileStats
            stats={stats}
            onClickTotalVisits={() => goToAttendedSection(true)}
            onClickThisYearVisits={() => goToAttendedSection(false)}
          />

          <div className="profile-my-events-group">
            <h3>관심 공연</h3>
            <InterestedEventList events={events} />
          </div>

          <div className="profile-my-events-group" ref={attendedSectionRef}>
            <h3>다녀온 공연</h3>
            <AttendedEventGallery
              events={attendedEvents}
              expanded={attendedExpanded}
              onToggleExpand={() => setAttendedExpanded((prev) => !prev)}
            />
          </div>

          <div className="profile-my-events-group">
            <h3>예정된 공연</h3>
            <UpcomingEventList events={upcomingEvents} />
          </div>
        </section>
      </div>
      </div>
    </Layout>
  )
}
