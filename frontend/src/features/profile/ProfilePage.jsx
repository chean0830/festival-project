import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
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
  addInterestedArtist,
  fetchInterestedEvents,
  removeInterestedArtist,
  removeInterestedEvent,
  fetchAttendedEvents,
  addAttendedEvent,
  fetchUpcomingEvents,
  addUpcomingEvent,
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
import AddEventModal from './components/AddEventModal'
import ProfileStats from './components/ProfileStats'
import NotificationBell from '../notification/components/NotificationBell'
import { fetchFestivalRecords } from '../festivalrecord/api/festivalRecordApi'
import RecordCard from '../festivalrecord/components/RecordCard'
import { cancelMdOrder, fetchMyMdOrders } from '../../api/mdShopApi'
import MdOrderHistoryList from './components/MdOrderHistoryList'
import '../festivalrecord/festivalrecord.css'
import './profile.css'

/**
 * 프로필 담당 진입 컴포넌트.
 * useCurrentMember로 로그인한 사용자를 확인하고, 그 memberId로 내 프로필 데이터를 불러온다.
 */
export default function ProfilePage() {
  const navigate = useNavigate()
  const location = useLocation()
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
  const [mdOrders, setMdOrders] = useState([])
  const [attendedExpanded, setAttendedExpanded] = useState(false)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(null)
  const [addModalTarget, setAddModalTarget] = useState(null) // null | 'artist' | 'attended' | 'upcoming'
  const attendedSectionRef = useRef(null)
  const mdOrdersSectionRef = useRef(null)

  function goToAttendedSection(expandAll) {
    if (expandAll) setAttendedExpanded(true)
    attendedSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  async function handleAddArtist(artistId) {
    const added = await addInterestedArtist(memberId, artistId)
    setArtists((prev) => {
      if (prev.some((artist) => artist.artistId === added.artistId)) return prev
      return [added, ...prev]
    })
  }

  async function handleAddAttendedEvent(eventId) {
    const added = await addAttendedEvent(memberId, eventId)
    setAttendedEvents((prev) => {
      if (prev.some((event) => event.eventId === added.eventId)) return prev
      return [added, ...prev]
    })
  }

  async function handleAddUpcomingEvent(eventId) {
    const added = await addUpcomingEvent(memberId, eventId)
    setUpcomingEvents((prev) => {
      const withoutDuplicate = prev.filter((event) => event.eventId !== added.eventId)
      return [...withoutDuplicate, added].sort((a, b) => a.startDate.localeCompare(b.startDate))
    })
  }

  async function handleCancelMdOrder(orderId) {
    const canceled = await cancelMdOrder(memberId, orderId)
    setMdOrders((prev) => prev.map((order) => (order.orderId === canceled.orderId ? canceled : order)))
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
        const [profileData, artistData, eventData, attendedData, upcomingData, badgeData, statsData, recordData, mdOrderData] =
          await Promise.all([
            fetchProfile(memberId),
            fetchInterestedArtists(memberId),
            fetchInterestedEvents(memberId),
            fetchAttendedEvents(memberId),
            fetchUpcomingEvents(memberId),
            fetchMyBadges(memberId),
            fetchProfileStats(memberId),
            fetchFestivalRecords(memberId),
            fetchMyMdOrders(memberId),
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
          setMdOrders(mdOrderData)

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

  useEffect(() => {
    if (!loading && location.state?.scrollTo === 'mdOrders') {
      mdOrdersSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [loading, location.state])

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
          <div className="profile-section-header">
            <h2>관심 가수</h2>
            <button type="button" className="profile-btn-outline" onClick={() => setAddModalTarget('artist')}>
              가수 추가하기
            </button>
          </div>
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
            <div className="profile-section-header">
              <h3>다녀온 공연</h3>
              <button type="button" className="profile-btn-outline" onClick={() => setAddModalTarget('attended')}>
                공연 추가하기
              </button>
            </div>
            <AttendedEventGallery
              events={attendedEvents}
              expanded={attendedExpanded}
              onToggleExpand={() => setAttendedExpanded((prev) => !prev)}
            />
          </div>

          <div className="profile-my-events-group">
            <div className="profile-section-header">
              <h3>예정된 공연</h3>
              <button type="button" className="profile-btn-outline" onClick={() => setAddModalTarget('upcoming')}>
                공연 추가하기
              </button>
            </div>
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
            <div className="profile-empty-state">
              <p className="profile-empty-text">아직 작성한 페스티벌 기록이 없어요.</p>
              <button type="button" className="profile-btn-outline" onClick={() => navigate('/festival-log/new')}>
                새로운 페스티벌 기록 작성하기
              </button>
            </div>
          ) : (
            <div className="record-grid">
              {festivalRecords.slice(0, 4).map((record) => (
                <RecordCard key={record.recordId} record={record} />
              ))}
            </div>
          )}
        </section>

        <section ref={mdOrdersSectionRef}>
          <div className="profile-section-header">
            <h2>MD 사전예약 내역</h2>
            <a href="/shop/preorder" className="profile-section-more">
              MD 사전예약 가기 ›
            </a>
          </div>
          <MdOrderHistoryList orders={mdOrders} onCancel={handleCancelMdOrder} />
        </section>
      </div>
      </div>

      {addModalTarget === 'artist' && (
        <AddEventModal
          title="관심 가수 추가"
          searchPlaceholder="아티스트 이름으로 검색"
          allowedTypes={['artist']}
          onClose={() => setAddModalTarget(null)}
          onAdd={handleAddArtist}
        />
      )}

      {(addModalTarget === 'attended' || addModalTarget === 'upcoming') && (
        <AddEventModal
          title={addModalTarget === 'attended' ? '다녀온 공연 추가' : '예정된 공연 추가'}
          excludePastEvents={addModalTarget === 'upcoming'}
          onClose={() => setAddModalTarget(null)}
          onAdd={addModalTarget === 'attended' ? handleAddAttendedEvent : handleAddUpcomingEvent}
        />
      )}
    </Layout>
  )
}
