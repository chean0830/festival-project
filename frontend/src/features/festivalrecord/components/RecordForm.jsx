import { useState } from 'react'
import StarRating from './StarRating'

const emptySong = { songTitle: '', artistName: '' }

export default function RecordForm({ eligibleEvents, initialValues, onSubmit, onCancel, submitLabel }) {
  const [eventId, setEventId] = useState(initialValues?.eventId ?? '')
  const [title, setTitle] = useState(initialValues?.title ?? '')
  const [content, setContent] = useState(initialValues?.content ?? '')
  const [rating, setRating] = useState(initialValues?.rating ?? null)
  const [oneLineReview, setOneLineReview] = useState(initialValues?.oneLineReview ?? '')
  const [memo, setMemo] = useState(initialValues?.memo ?? '')
  const [hashtag, setHashtag] = useState(initialValues?.hashtag ?? '')
  const [songs, setSongs] = useState(initialValues?.songs?.length ? initialValues.songs : [{ ...emptySong }])
  const [foods, setFoods] = useState(initialValues?.foods?.length ? initialValues.foods : [''])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  function updateSong(index, field, value) {
    setSongs((prev) => prev.map((song, i) => (i === index ? { ...song, [field]: value } : song)))
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
      await onSubmit({
        eventId: Number(eventId),
        title: title || null,
        content: content || null,
        rating,
        oneLineReview: oneLineReview || null,
        memo: memo || null,
        hashtag: hashtag || null,
        songs: songs.filter((song) => song.songTitle.trim()),
        foods: foods.map((food) => food.trim()).filter(Boolean),
      })
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
            </option>
          ))}
        </select>
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
          <div key={index} className="record-form-row">
            <input
              type="text"
              placeholder="곡 제목"
              value={song.songTitle}
              onChange={(e) => updateSong(index, 'songTitle', e.target.value)}
            />
            <input
              type="text"
              placeholder="아티스트"
              value={song.artistName}
              onChange={(e) => updateSong(index, 'artistName', e.target.value)}
            />
            <button type="button" className="record-form-row-remove" onClick={() => setSongs((prev) => prev.filter((_, i) => i !== index))}>
              삭제
            </button>
          </div>
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
