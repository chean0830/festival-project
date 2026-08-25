import { useEffect, useState } from 'react'
import StarRating from './StarRating'
import SongAutocompleteRow from './SongAutocompleteRow'
import { photoSlotLabel } from '../photoSlots'

const emptySong = { songTitle: '', artistName: '', albumCoverUrl: null }
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

export default function RecordForm({
  eligibleEvents,
  recordedEventIds = new Set(),
  initialValues,
  existingImages = [],
  onDeleteExistingImage,
  onReorderExistingImages,
  onSubmit,
  onCancel,
  submitLabel,
}) {
  const [eventId, setEventId] = useState(initialValues?.eventId ?? '')
  const [title, setTitle] = useState(initialValues?.title ?? '')
  const [content, setContent] = useState(initialValues?.content ?? '')
  const [rating, setRating] = useState(initialValues?.rating ?? null)
  const [oneLineReview, setOneLineReview] = useState(initialValues?.oneLineReview ?? '')
  const [memo, setMemo] = useState(initialValues?.memo ?? '')
  const [hashtag, setHashtag] = useState(initialValues?.hashtag ?? '')
  const [songs, setSongs] = useState(initialValues?.songs?.length ? initialValues.songs : [{ ...emptySong }])
  const [foods, setFoods] = useState(initialValues?.foods?.length ? initialValues.foods : [''])
  const [newPhotos, setNewPhotos] = useState([])
  const [deletingImageId, setDeletingImageId] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    return () => {
      newPhotos.forEach((photo) => URL.revokeObjectURL(photo.previewUrl))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function handlePhotoSelect(e) {
    const files = Array.from(e.target.files ?? [])
    const valid = files.filter((file) => ALLOWED_IMAGE_TYPES.includes(file.type))
    if (valid.length < files.length) {
      setError('jpg, png, webp, gif 형식의 이미지만 추가할 수 있습니다.')
    }
    setNewPhotos((prev) => [...prev, ...valid.map((file) => ({ file, previewUrl: URL.createObjectURL(file) }))])
    e.target.value = ''
  }

  function removeNewPhoto(index) {
    setNewPhotos((prev) => {
      URL.revokeObjectURL(prev[index].previewUrl)
      return prev.filter((_, i) => i !== index)
    })
  }

  function moveNewPhoto(index, direction) {
    setNewPhotos((prev) => {
      const target = index + direction
      if (target < 0 || target >= prev.length) return prev
      const next = [...prev]
      ;[next[index], next[target]] = [next[target], next[index]]
      return next
    })
  }

  async function moveExistingImage(index, direction) {
    if (!onReorderExistingImages) return
    const target = index + direction
    if (target < 0 || target >= existingImages.length) return
    const next = [...existingImages]
    ;[next[index], next[target]] = [next[target], next[index]]
    try {
      await onReorderExistingImages(next)
    } catch (err) {
      setError(err.message)
    }
  }

  async function handleDeleteExisting(imageId) {
    if (!onDeleteExistingImage) return
    setDeletingImageId(imageId)
    try {
      await onDeleteExistingImage(imageId)
    } catch (err) {
      setError(err.message)
    } finally {
      setDeletingImageId(null)
    }
  }

  function updateFood(index, value) {
    setFoods((prev) => prev.map((food, i) => (i === index ? value : food)))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!eventId) {
      setError('공연을 선택해주세요.')
      return
    }
    setSubmitting(true)
    setError(null)
    try {
      await onSubmit(
        {
          eventId: Number(eventId),
          title: title || null,
          content: content || null,
          rating,
          oneLineReview: oneLineReview || null,
          memo: memo || null,
          hashtag: hashtag || null,
          songs: songs.filter((song) => song.songTitle.trim()),
          foods: foods.map((food) => food.trim()).filter(Boolean),
        },
        newPhotos.map((photo) => photo.file),
      )
    } catch (err) {
      setError(err.message)
      setSubmitting(false)
    }
  }

  return (
    <form className="record-form" onSubmit={handleSubmit}>
      <div className="record-form-field">
        <label htmlFor="record-event">공연</label>
        <select id="record-event" value={eventId} onChange={(e) => setEventId(e.target.value)}>
          <option value="">공연을 선택해주세요</option>
          {eligibleEvents.map((event) => (
            <option key={event.eventId} value={event.eventId}>
              {event.name}
              {recordedEventIds.has(event.eventId) ? ' (생성 완료)' : ''}
            </option>
          ))}
        </select>
      </div>

      <div className="record-form-field">
        <label>사진</label>
        <p className="record-form-photo-hint">
          사진 순서가 곧 책 페이지예요 — <strong>1번째 대표(공연 정보)</strong> ·{' '}
          <strong>2번째 노래 페이지</strong> · <strong>3번째 음식 페이지</strong> · 이후는 사진 갤러리. 화살표로 순서를
          바꿀 수 있어요.
        </p>
        <div className="record-form-photo-grid">
          {existingImages.map((image, index) => (
            <div key={image.imageId} className="record-form-photo-item">
              <span
                className={`record-form-photo-slot-badge${index === 0 ? ' record-form-photo-slot-badge--main' : ''}`}
              >
                {photoSlotLabel(index)}
              </span>
              <img src={image.imageUrl} alt="" />
              <div className="record-form-photo-item-actions">
                <button type="button" disabled={index === 0} onClick={() => moveExistingImage(index, -1)}>
                  ‹
                </button>
                <button
                  type="button"
                  disabled={deletingImageId === image.imageId}
                  onClick={() => handleDeleteExisting(image.imageId)}
                >
                  삭제
                </button>
                <button
                  type="button"
                  disabled={index === existingImages.length - 1}
                  onClick={() => moveExistingImage(index, 1)}
                >
                  ›
                </button>
              </div>
            </div>
          ))}
          {newPhotos.map((photo, index) => {
            const overallIndex = existingImages.length + index
            return (
              <div key={photo.previewUrl} className="record-form-photo-item">
                <span
                  className={`record-form-photo-slot-badge${overallIndex === 0 ? ' record-form-photo-slot-badge--main' : ''}`}
                >
                  {photoSlotLabel(overallIndex)}
                </span>
                <img src={photo.previewUrl} alt="" />
                <div className="record-form-photo-item-actions">
                  <button type="button" disabled={index === 0} onClick={() => moveNewPhoto(index, -1)}>
                    ‹
                  </button>
                  <button type="button" onClick={() => removeNewPhoto(index)}>
                    삭제
                  </button>
                  <button type="button" disabled={index === newPhotos.length - 1} onClick={() => moveNewPhoto(index, 1)}>
                    ›
                  </button>
                </div>
              </div>
            )
          })}
          <label className="record-form-photo-add">
            + 사진 추가
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              multiple
              onChange={handlePhotoSelect}
              hidden
            />
          </label>
        </div>
      </div>

      <div className="record-form-field">
        <label htmlFor="record-title">제목</label>
        <input id="record-title" type="text" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={200} />
      </div>

      <div className="record-form-field">
        <label htmlFor="record-content">내용</label>
        <textarea id="record-content" value={content} onChange={(e) => setContent(e.target.value)} rows={5} />
      </div>

      <div className="record-form-field">
        <label>별점</label>
        <StarRating value={rating} onChange={setRating} />
      </div>

      <div className="record-form-field">
        <label htmlFor="record-one-line">한줄평</label>
        <input
          id="record-one-line"
          type="text"
          value={oneLineReview}
          onChange={(e) => setOneLineReview(e.target.value)}
          maxLength={200}
        />
      </div>

      <div className="record-form-field">
        <label>들은 노래</label>
        {songs.map((song, index) => (
          <SongAutocompleteRow
            key={index}
            song={song}
            onChange={(updated) => setSongs((prev) => prev.map((s, i) => (i === index ? updated : s)))}
            onRemove={() => setSongs((prev) => prev.filter((_, i) => i !== index))}
          />
        ))}
        <button type="button" className="record-form-row-add" onClick={() => setSongs((prev) => [...prev, { ...emptySong }])}>
          + 노래 추가
        </button>
      </div>

      <div className="record-form-field">
        <label>먹은 음식</label>
        {foods.map((food, index) => (
          <div key={index} className="record-form-row">
            <input type="text" placeholder="음식 이름" value={food} onChange={(e) => updateFood(index, e.target.value)} />
            <button type="button" className="record-form-row-remove" onClick={() => setFoods((prev) => prev.filter((_, i) => i !== index))}>
              삭제
            </button>
          </div>
        ))}
        <button type="button" className="record-form-row-add" onClick={() => setFoods((prev) => [...prev, ''])}>
          + 음식 추가
        </button>
      </div>

      <div className="record-form-field">
        <label htmlFor="record-memo">메모</label>
        <textarea id="record-memo" value={memo} onChange={(e) => setMemo(e.target.value)} rows={3} maxLength={500} />
      </div>

      <div className="record-form-field">
        <label htmlFor="record-hashtag">해시태그</label>
        <input
          id="record-hashtag"
          type="text"
          placeholder="#락페 #여름 #첫페스티벌"
          value={hashtag}
          onChange={(e) => setHashtag(e.target.value)}
          maxLength={300}
        />
      </div>

      {error && <p className="record-error-text">{error}</p>}

      <div className="record-form-actions">
        {onCancel && (
          <button type="button" className="record-btn-ghost" onClick={onCancel}>
            취소
          </button>
        )}
        <button type="submit" className="record-btn-primary" disabled={submitting}>
          {submitLabel}
        </button>
      </div>
    </form>
  )
}
