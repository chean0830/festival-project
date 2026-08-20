import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../../components/common/Layout/Layout'
import useCurrentMember from './hooks/useCurrentMember'
import RequireLogin from './components/RequireLogin'
import {
  fetchProfile,
  updateNickname,
  updateIntroduction,
  uploadProfileImage,
  deleteProfileImage,
  fetchInterestedArtists,
  fetchInterestedEvents,
  removeInterestedArtist,
  removeInterestedEvent,
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
import NotificationBell from '../notification/components/NotificationBell'
import { fetchFestivalRecords } from '../festivalrecord/api/festivalRecordApi'
import RecordCard from '../festivalrecord/components/RecordCard'
import '../festivalrecord/festivalrecord.css'
import './profile.css'

/**
 * 프로필 담당 진입 컴포넌트.
 * useCurrentMember로 로그인한 사용자를 확인하고, 그 memberId로 내 프로필 데이터를 불러온다.
 */
export default function ProfilePage() {
  const navigate = useNavigate()
  const currentMember = useCurrentMember()
  const memberId = currentMember?.memberId
  const [profile, setProfile] = useState(null)
  const [artists, setArtists] = useState([])
  const [events, setEvents] = useState([])
  const [attendedEvents, setAttendedEvents] = useState([])
  const [upcomingEvents, setUpcomingEvents] = useState([])
  const [badges, setBadges] = useState([])
  const [stats, setStats] = useState(null)
  const [festivalRecords, setFestivalRecords] = useState([])
  const [attendedExpanded, setAttendedExpanded] = useState(false)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(null)
  const attendedSectionRef = useRef(null)

  function goToAttendedSection(expandAll) {
    if (expandAll) setAttendedExpanded(true)
    attendedSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  useEffect(() => {
    if (!memberId) {
      return undefined
    }

    let cancelled = false

    async function load() {
      setLoading(true)
      setLoadError(null)
      try {
        const [profileData, artistData, eventData, attendedData, upcomingData, badgeData, statsData, recordData] =
          await Promise.all([
            fetchProfile(memberId),
            fetchInterestedArtists(memberId),
            fetchInterestedEvents(memberId),
            fetchAttendedEvents(memberId),
            fetchUpcomingEvents(memberId),
            fetchMyBadges(memberId),
            fetchProfileStats(memberId),
            fetchFestivalRecords(memberId),
          ])
        if (!cancelled) {
          setProfile(profileData)
          setArtists(artistData)
          setEvents(eventData)
          setAttendedEvents(attendedData)
          setUpcomingEvents(upcomingData)
          setBadges(badgeData)
          setStats(statsData)
          setFestivalRecords(recordData)

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

  if (currentMember === undefined) {
    return (
      <Layout>
        <div className="profile-page">확인 중입니다...</div>
      </Layout>
    )
  }

  if (currentMember === null) {
    return <RequireLogin />
  }

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
          <div className="profile-header-actions">
            <NotificationBell />
            <button type="button" className="profile-badge-entry" onClick={() => navigate('/profile/badges')}>
              🏅 나의 뱃지 {earnedBadgeCount}/{badges.length}
            </button>
          </div>
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
          <InterestedArtistList
            artists={artists}
            onRemove={async (artistId) => {
              await removeInterestedArtist(memberId, artistId)
              setArtists((prev) => prev.filter((artist) => artist.artistId !== artistId))
            }}
          />
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
            <InterestedEventList
              events={events}
              onRemove={async (eventId) => {
                await removeInterestedEvent(memberId, eventId)
                setEvents((prev) => prev.filter((event) => event.eventId !== eventId))
              }}
            />
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

        <section>
          <div className="profile-section-header">
            <h2>나의 페스티벌 기록</h2>
            <a href="/festival-log" className="profile-section-more">
              전체보기 ›
            </a>
          </div>

          {festivalRecords.length === 0 ? (
            <p className="profile-empty-text">아직 작성한 페스티벌 기록이 없어요.</p>
          ) : (
            <div className="record-grid">
              {festivalRecords.slice(0, 4).map((record) => (
                <RecordCard key={record.recordId} record={record} />
              ))}
            </div>
          )}
        </section>
      </div>
      </div>
    </Layout>
  )
}
