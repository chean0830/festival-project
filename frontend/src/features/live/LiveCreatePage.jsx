import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../../components/common/Layout/Layout'
import RequireLogin from '../profile/components/RequireLogin'
import useCurrentMember from '../profile/hooks/useCurrentMember'
import {
  createLiveStream,
  fetchLiveEvents,
} from './api/liveApi'
import './live.css'

export default function LiveCreatePage() {
  const currentMember = useCurrentMember()
  const navigate = useNavigate()
  const [events, setEvents] = useState([])
  const [form, setForm] = useState({
    eventId: '', title: '', description: '', thumbnailUrl: '',
  })
  const [fieldErrors, setFieldErrors] = useState({})
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (currentMember?.role !== 'ADMIN') return
    fetchLiveEvents().then(setEvents).catch((loadError) => setError(loadError.message))
  }, [currentMember?.role])

  function handleChange(event) {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
    if (fieldErrors[name]) {
      setFieldErrors((current) => ({ ...current, [name]: '' }))
    }
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')

    const nextFieldErrors = {}
    if (!form.eventId) nextFieldErrors.eventId = '연결할 공연을 선택해 주세요.'
    if (!form.title.trim()) nextFieldErrors.title = '방송 제목을 입력해 주세요.'
    setFieldErrors(nextFieldErrors)

    if (Object.keys(nextFieldErrors).length > 0) return

    setSaving(true)
    try {
      const stream = await createLiveStream({
        ...form,
        eventId: Number(form.eventId),
      })
      navigate(`/live/${stream.streamId}`)
    } catch (submitError) {
      setError(submitError.message)
    } finally {
      setSaving(false)
    }
  }

  if (currentMember === undefined) {
    return <Layout><div className="live-page"><p>로그인 정보를 확인 중입니다...</p></div></Layout>
  }
  if (currentMember === null) return <RequireLogin />
  if (currentMember.role !== 'ADMIN') {
    return (
      <Layout>
        <div className="live-page">
          <div className="live-empty">
            <strong>관리자만 라이브 방송을 만들 수 있습니다.</strong>
            <span>일반 회원은 진행 중인 라이브 방송에 참여할 수 있습니다.</span>
            <button type="button" className="live-button live-button--primary" onClick={() => navigate('/live')}>
              라이브 목록으로
            </button>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="live-form-page">
        <div className="live-form-heading">
          <span className="live-eyebrow">CREATE LIVE</span>
          <h1>라이브 방송 만들기</h1>
          <p>브라우저 카메라와 마이크를 LiveKit Cloud에 연결해 바로 방송합니다.</p>
        </div>

        <form className="live-form" onSubmit={handleSubmit}>
          <label>
            연결할 공연 <b>*</b>
            <select
              name="eventId"
              value={form.eventId}
              onChange={handleChange}
              aria-invalid={Boolean(fieldErrors.eventId)}
              aria-describedby={fieldErrors.eventId ? 'live-event-error' : undefined}
            >
              <option value="">공연을 선택해 주세요</option>
              {events.map((item) => (
                <option key={item.eventId} value={item.eventId}>{item.name}</option>
              ))}
            </select>
            {fieldErrors.eventId && <span id="live-event-error" className="live-field-error">{fieldErrors.eventId}</span>}
          </label>
          <label>
            방송 제목 <b>*</b>
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              maxLength="100"
              aria-invalid={Boolean(fieldErrors.title)}
              aria-describedby={fieldErrors.title ? 'live-title-error' : undefined}
              placeholder="방송 제목을 입력해 주세요"
            />
            {fieldErrors.title && <span id="live-title-error" className="live-field-error">{fieldErrors.title}</span>}
          </label>
          <label>
            방송 설명
            <textarea name="description" value={form.description} onChange={handleChange} maxLength="1000" rows="5" placeholder="방송 내용을 소개해 주세요" />
          </label>
          <label>
            썸네일 이미지 주소 (선택)
            <input name="thumbnailUrl" value={form.thumbnailUrl} onChange={handleChange} placeholder="비워두면 기본 이미지를 사용합니다" />
          </label>

          {error && <p className="live-message live-message--error">{error}</p>}
          <div className="live-form__actions">
            <button type="button" className="live-button live-button--ghost" onClick={() => navigate('/live')}>취소</button>
            <button
              type="submit"
              className="live-button live-button--primary"
              disabled={saving}
            >
              {saving ? '만드는 중...' : '방송 만들기'}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  )
}
