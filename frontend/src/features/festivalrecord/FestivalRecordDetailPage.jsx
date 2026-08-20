import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import Layout from '../../components/common/Layout/Layout'
import useCurrentMember from '../profile/hooks/useCurrentMember'
import RequireLogin from '../profile/components/RequireLogin'
import {
  addRecordImage,
  deleteFestivalRecord,
  deleteRecordImage,
  fetchFestivalRecord,
  shareFestivalRecord,
} from './api/festivalRecordApi'
import StarRating from './components/StarRating'
import './festivalrecord.css'

const SHARE_PLATFORMS = [
  { key: 'INSTAGRAM', label: '인스타그램' },
  { key: 'X', label: 'X' },
  { key: 'FACEBOOK', label: '페이스북' },
]

export default function FestivalRecordDetailPage() {
  const navigate = useNavigate()
  const { recordId } = useParams()
  const currentMember = useCurrentMember()
  const memberId = currentMember?.memberId
  const fileInputRef = useRef(null)

  const [record, setRecord] = useState(null)
  const [loadError, setLoadError] = useState(null)
  const [actionError, setActionError] = useState(null)

  useEffect(() => {
    if (!memberId) {
      return undefined
    }
    let cancelled = false

    fetchFestivalRecord(memberId, recordId)
      .then((data) => {
        if (!cancelled) setRecord(data)
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

  async function handleImageUpload(e) {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const updated = await addRecordImage(memberId, recordId, file)
      setRecord(updated)
    } catch (err) {
      setActionError(err.message)
    } finally {
      e.target.value = ''
    }
  }

  async function handleImageDelete(imageId) {
    try {
      await deleteRecordImage(memberId, recordId, imageId)
      setRecord((prev) => ({ ...prev, images: prev.images.filter((img) => img.imageId !== imageId) }))
    } catch (err) {
      setActionError(err.message)
    }
  }

  async function handleShare(platform) {
    try {
      const updated = await shareFestivalRecord(memberId, recordId, { platform, shareUrl: null })
      setRecord(updated)
    } catch (err) {
      setActionError(err.message)
    }
  }

  async function handleDelete() {
    if (!window.confirm('이 기록을 삭제할까요?')) return
    try {
      await deleteFestivalRecord(memberId, recordId)
      navigate('/festival-log')
    } catch (err) {
      setActionError(err.message)
    }
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

  return (
    <Layout>
      <div className="record-page">
        <div className="record-content">
          <div className="record-header-row">
            <h1>{record.title || '제목 없는 기록'}</h1>
            <div className="record-header-actions">
              <Link to={`/festival-log/${record.recordId}/edit`} className="record-btn-ghost">
                수정
              </Link>
              <button type="button" className="record-btn-ghost" onClick={handleDelete}>
                삭제
              </button>
            </div>
          </div>

          <p className="record-detail-event">{record.eventName}</p>
          {record.rating != null && <StarRating value={record.rating} readOnly />}
          {record.oneLineReview && <p className="record-detail-one-line">{record.oneLineReview}</p>}
          {record.content && <p className="record-detail-content">{record.content}</p>}

          <section className="record-detail-section">
            <h2>사진</h2>
            <div className="record-image-grid">
              {record.images.map((image) => (
                <div key={image.imageId} className="record-image-item">
                  <img src={image.imageUrl} alt="기록 사진" />
                  <button type="button" onClick={() => handleImageDelete(image.imageId)}>
                    삭제
                  </button>
                </div>
              ))}
              <button type="button" className="record-image-add" onClick={() => fileInputRef.current?.click()}>
                + 사진 추가
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                style={{ display: 'none' }}
                onChange={handleImageUpload}
              />
            </div>
          </section>

          {record.songs.length > 0 && (
            <section className="record-detail-section">
              <h2>들은 노래</h2>
              <ul className="record-detail-list">
                {record.songs.map((song) => (
                  <li key={song.songId}>
                    {song.songTitle}
                    {song.artistName ? ` - ${song.artistName}` : ''}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {record.foods.length > 0 && (
            <section className="record-detail-section">
              <h2>먹은 음식</h2>
              <ul className="record-detail-list">
                {record.foods.map((food) => (
                  <li key={food}>{food}</li>
                ))}
              </ul>
            </section>
          )}

          {record.memo && (
            <section className="record-detail-section">
              <h2>메모</h2>
              <p>{record.memo}</p>
            </section>
          )}

          {record.hashtag && <p className="record-detail-hashtag">{record.hashtag}</p>}

          <section className="record-detail-section">
            <h2>공유{record.shared ? ' (공유됨)' : ''}</h2>
            <div className="record-share-buttons">
              {SHARE_PLATFORMS.map((platform) => (
                <button key={platform.key} type="button" className="record-btn-ghost" onClick={() => handleShare(platform.key)}>
                  {platform.label}
                </button>
              ))}
            </div>
          </section>

          {actionError && <p className="record-error-text">{actionError}</p>}
        </div>
      </div>
    </Layout>
  )
}
