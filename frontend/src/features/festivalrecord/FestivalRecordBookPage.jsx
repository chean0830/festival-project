import { forwardRef, useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import HTMLFlipBook from 'react-pageflip'
import Layout from '../../components/common/Layout/Layout'
import useCurrentMember from '../profile/hooks/useCurrentMember'
import RequireLogin from '../profile/components/RequireLogin'
import { fetchFestivalRecord, generatePoster, shareFestivalRecord } from './api/festivalRecordApi'
import BookCoverPage from './components/BookCoverPage'
import PosterView from './components/PosterView'
import StarRating from './components/StarRating'
import './festivalrecord.css'

const PAGE_WIDTH = 340
const PAGE_HEIGHT = 520

const Page = forwardRef(function Page({ children, number }, ref) {
  return (
    <div ref={ref} className="fr-flip-page">
      <div className="fr-page-content">{children}</div>
      {number && <span className="fr-flip-page-number">{number}</span>}
    </div>
  )
})

function EventInfoContent({ record }) {
  return (
    <>
      <h3>공연 정보</h3>
      {record.images[0] && <img src={record.images[0].imageUrl} alt="" className="fr-page-cover-photo" />}
      <p className="fr-page-event-name">{record.eventName}</p>
      {record.rating != null && <StarRating value={record.rating} readOnly />}
      <p className="fr-page-date">{new Date(record.createdAt).toLocaleDateString()}</p>
    </>
  )
}

function PhotoGalleryContent({ record }) {
  return (
    <>
      <h3>사진</h3>
      {record.images.length === 0 ? (
        <p className="fr-page-empty">업로드된 사진이 없어요.</p>
      ) : (
        <div className="fr-page-photo-grid">
          {record.images.map((image) => (
            <img key={image.imageId} src={image.imageUrl} alt="" />
          ))}
        </div>
      )}
    </>
  )
}

function SongsContent({ record }) {
  const pagePhoto = record.images[1]
  return (
    <>
      <h3>들은 노래</h3>
      {pagePhoto && <img src={pagePhoto.imageUrl} alt="" className="fr-page-side-photo" />}
      {record.songs.length === 0 ? (
        <p className="fr-page-empty">기록된 노래가 없어요.</p>
      ) : (
        <ul className="fr-page-list">
          {record.songs.map((song) => (
            <li key={song.songId} className="fr-page-song-item">
              {song.albumCoverUrl ? (
                <img src={song.albumCoverUrl} alt="" className="fr-page-song-cover" />
              ) : (
                <span className="fr-page-song-note">🎵</span>
              )}
              <span>
                {song.songTitle}
                {song.artistName ? ` - ${song.artistName}` : ''}
              </span>
            </li>
          ))}
        </ul>
      )}
    </>
  )
}

function FoodMemoContent({ record }) {
  const pagePhoto = record.images[2]
  return (
    <>
      <h3>먹은 음식 & 메모</h3>
      {pagePhoto && <img src={pagePhoto.imageUrl} alt="" className="fr-page-side-photo" />}
      {record.foods.length > 0 && (
        <div className="fr-page-food-tags">
          {record.foods.map((food) => (
            <span key={food}>🍴 {food}</span>
          ))}
        </div>
      )}
      {record.memo ? <p className="fr-page-memo">{record.memo}</p> : <p className="fr-page-empty">메모가 없어요.</p>}
    </>
  )
}

function ReviewContent({ record }) {
  return (
    <>
      <h3>한줄평</h3>
      {record.oneLineReview && <p className="fr-page-review">“{record.oneLineReview}”</p>}
      {record.hashtag && <p className="fr-page-hashtag">{record.hashtag}</p>}
      <p className="fr-page-ai-placeholder">📝 AI 일기는 준비 중이에요. 조금만 기다려주세요!</p>
    </>
  )
}

function PhotoCollageContent({ record }) {
  return (
    <>
      <h3>우리의 순간들</h3>
      {record.images.length === 0 ? (
        <p className="fr-page-empty">모아둘 사진이 없어요.</p>
      ) : (
        <div className="fr-page-collage">
          {record.images.map((image, index) => (
            <img key={image.imageId} src={image.imageUrl} alt="" className={`fr-page-collage-photo--${index % 4}`} />
          ))}
        </div>
      )}
    </>
  )
}

export default function FestivalRecordBookPage() {
  const { recordId } = useParams()
  const currentMember = useCurrentMember()
  const memberId = currentMember?.memberId
  const bookRef = useRef(null)

  const [record, setRecord] = useState(null)
  const [loadError, setLoadError] = useState(null)
  const [currentPage, setCurrentPage] = useState(0)
  // idle -> generating(Gemini 호출 중) -> ready | error
  const [posterStage, setPosterStage] = useState('idle')
  const [posterError, setPosterError] = useState(null)

  useEffect(() => {
    if (!memberId) {
      return undefined
    }
    let cancelled = false

    fetchFestivalRecord(memberId, recordId)
      .then((data) => {
        if (!cancelled) {
          setRecord(data)
          // 이미 포스터를 만든 적 있는 기록이면 다시 확인 프롬프트 없이 바로 보여준다.
          if (data.posterImageUrl) {
            setPosterStage('ready')
          }
        }
      })
      .catch((err) => {
        if (!cancelled) setLoadError(err.message)
      })

    return () => {
      cancelled = true
    }
  }, [memberId, recordId])

  if (currentMember === undefined) {
    return (
      <Layout>
        <div className="record-page">확인 중입니다...</div>
      </Layout>
    )
  }

  if (currentMember === null) {
    return <RequireLogin />
  }

  if (loadError) {
    return (
      <Layout>
        <div className="record-page record-error-text">기록을 불러오지 못했습니다: {loadError}</div>
      </Layout>
    )
  }

  if (!record) {
    return (
      <Layout>
        <div className="record-page">불러오는 중입니다...</div>
      </Layout>
    )
  }

  async function handleShare(platform) {
    await shareFestivalRecord(memberId, recordId, { platform, shareUrl: null })
  }

  async function handleRegeneratePoster() {
    const updated = await generatePoster(memberId, recordId)
    setRecord(updated)
    return updated
  }

  async function handleGeneratePoster() {
    setPosterStage('generating')
    setPosterError(null)
    try {
      const updated = await generatePoster(memberId, recordId)
      setRecord(updated)
      setPosterStage('ready')
    } catch (err) {
      setPosterError(err.message)
      setPosterStage('idle')
    }
  }

  const TOTAL_PAGES = 8
  const isFirstPage = currentPage <= 0
  const isLastPage = currentPage >= TOTAL_PAGES - 1

  return (
    <Layout>
      <div className="record-page fr-book-page-wrap">
        <div className="record-content">
          <div className="record-header-row">
            <Link to={`/festival-log/${recordId}`} className="record-btn-ghost">
              ← 기록으로 돌아가기
            </Link>
          </div>

          <div className="fr-flipbook-wrap">
            <HTMLFlipBook
              ref={bookRef}
              width={PAGE_WIDTH}
              height={PAGE_HEIGHT}
              size="stretch"
              minWidth={260}
              maxWidth={420}
              minHeight={400}
              maxHeight={620}
              showCover
              maxShadowOpacity={0.6}
              flippingTime={700}
              className="fr-flipbook"
              onFlip={(e) => setCurrentPage(e.data)}
            >
              <BookCoverPage title={record.title} eventName={record.eventName} variant="front" />
              <Page number="1">
                <EventInfoContent record={record} />
              </Page>
              <Page number="2">
                <PhotoGalleryContent record={record} />
              </Page>
              <Page number="3">
                <SongsContent record={record} />
              </Page>
              <Page number="4">
                <FoodMemoContent record={record} />
              </Page>
              <Page number="5">
                <ReviewContent record={record} />
              </Page>
              <Page number="6">
                <PhotoCollageContent record={record} />
              </Page>
              <BookCoverPage eventName={record.eventName} variant="back" />
            </HTMLFlipBook>
          </div>

          <div className="fr-book-nav">
            <button
              type="button"
              className="record-btn-ghost"
              disabled={isFirstPage}
              onClick={() => bookRef.current?.pageFlip().flipPrev()}
            >
              ← 이전 장
            </button>
            <button
              type="button"
              className="record-btn-primary"
              disabled={isLastPage}
              onClick={() => bookRef.current?.pageFlip().flipNext()}
            >
              다음 장 →
            </button>
          </div>

          <section className="fr-poster-cta">
            {posterStage === 'idle' && (
              <>
                <p>포스터를 생성하시겠습니까?</p>
                <p className="fr-poster-cta-hint">
                  업로드한 사진과 분위기/한줄평/해시태그를 바탕으로 AI가 포스터 이미지를 새로 만들어드려요.
                  (10~20초 정도 걸릴 수 있어요)
                </p>
                {posterError && <p className="record-error-text">{posterError}</p>}
                <button type="button" className="record-btn-primary" onClick={handleGeneratePoster}>
                  예, 포스터 만들기
                </button>
              </>
            )}

            {posterStage === 'generating' && <p className="fr-poster-cta-hint">✨ AI가 포스터를 만들고 있어요...</p>}

            {posterStage === 'ready' && (
              <PosterView record={record} onShare={handleShare} onRegenerate={handleRegeneratePoster} />
            )}
          </section>
        </div>
      </div>
    </Layout>
  )
}
