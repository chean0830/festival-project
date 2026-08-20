import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import Layout from '../../components/common/Layout/Layout'
import RequireLogin from '../profile/components/RequireLogin'
import useCurrentMember from '../profile/hooks/useCurrentMember'
import {
  createLiveStream,
  createYouTubeBroadcast,
  fetchLiveEvents,
  fetchYouTubeStatus,
} from './api/liveApi'
import './live.css'

export default function LiveCreatePage() {
  const currentMember = useCurrentMember()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [events, setEvents] = useState([])
  const [youtubeMode, setYoutubeMode] = useState('auto')
  const [youtubeStatus, setYoutubeStatus] = useState(null)
  const [form, setForm] = useState({
    eventId: '', title: '', description: '', youtubeUrl: '', thumbnailUrl: '',
  })
  const [fieldErrors, setFieldErrors] = useState({})
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchLiveEvents().then(setEvents).catch((loadError) => setError(loadError.message))
  }, [])

  async function loadYouTubeStatus() {
    if (!currentMember?.memberId) return
    fetchYouTubeStatus()
      .then(setYoutubeStatus)
      .catch((loadError) => setError(loadError.message))
  }

  useEffect(() => {
    loadYouTubeStatus()
    // 로그인 회원이 바뀐 경우에만 연결 상태를 다시 확인한다.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentMember?.memberId])

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
      let youtubeUrl = form.youtubeUrl
      let youtubeSetup = null

      if (youtubeMode === 'auto') {
        youtubeSetup = await createYouTubeBroadcast({
          title: form.title,
          description: form.description,
        })
        youtubeUrl = youtubeSetup.youtubeUrl
      }

      const stream = await createLiveStream({
        ...form,
        youtubeUrl,
        eventId: Number(form.eventId),
      })
      navigate(`/live/${stream.streamId}`, { state: { youtubeSetup } })
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

  return (
    <Layout>
      <div className="live-form-page">
        <div className="live-form-heading">
          <span className="live-eyebrow">CREATE LIVE</span>
          <h1>라이브 방송 만들기</h1>
          <p>내 YouTube 채널을 연결하면 방송과 OBS 스트림 키가 자동으로 생성됩니다.</p>
        </div>

        <form className="live-form" onSubmit={handleSubmit}>
          <fieldset className="live-mode-fieldset">
            <legend>YouTube 방송 생성 방식</legend>
            <label className="live-mode-option">
              <input type="radio" name="youtubeMode" value="auto" checked={youtubeMode === 'auto'} onChange={() => setYoutubeMode('auto')} />
              <span><strong>내 YouTube 채널에서 자동 생성</strong><small>권장 · FESTLOG가 방송과 OBS 정보를 자동으로 만듭니다.</small></span>
            </label>
            <label className="live-mode-option">
              <input type="radio" name="youtubeMode" value="manual" checked={youtubeMode === 'manual'} onChange={() => setYoutubeMode('manual')} />
              <span><strong>기존 YouTube 주소 직접 입력</strong><small>이미 YouTube Studio에서 방송을 만든 경우 사용합니다.</small></span>
            </label>
          </fieldset>

          {youtubeMode === 'auto' && (
            <div className={`youtube-connect-card ${youtubeStatus?.liveEnabled ? 'youtube-connect-card--ready' : ''}`}>
              <div>
                <strong>
                  {!youtubeStatus ? 'YouTube 상태 확인 중...' : youtubeStatus.channelTitle ?? 'YouTube 계정 연결'}
                </strong>
                <p>{youtubeStatus?.message ?? '연결 상태를 확인하고 있습니다.'}</p>
                {searchParams.get('youtube') === 'denied' && (
                  <p className="live-message--error">YouTube 권한 동의가 취소되었습니다.</p>
                )}
                {searchParams.get('youtube') === 'error' && (
                  <p className="live-message--error">
                    {searchParams.get('message') ?? 'YouTube 계정을 연결하지 못했습니다.'}
                  </p>
                )}
              </div>
              {youtubeStatus && !youtubeStatus.connected && (
                <button
                  type="button"
                  className="live-button live-button--youtube"
                  onClick={() => { window.location.href = '/api/youtube/oauth/authorize' }}
                  disabled={!youtubeStatus.configured}
                >
                  YouTube 연결
                </button>
              )}
              {youtubeStatus?.connected && !youtubeStatus.liveEnabled && (
                <div className="youtube-connect-actions">
                  <a href="https://www.youtube.com/features" target="_blank" rel="noreferrer" className="live-button live-button--youtube">YouTube에서 활성화</a>
                  <button type="button" className="live-button live-button--ghost" onClick={loadYouTubeStatus}>다시 확인</button>
                </div>
              )}
            </div>
          )}

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
          {youtubeMode === 'manual' && (
            <label>
              YouTube 영상 주소 <b>*</b>
              <input name="youtubeUrl" value={form.youtubeUrl} onChange={handleChange} required placeholder="https://www.youtube.com/watch?v=..." />
              <small>YouTube Studio 라이브 관리 화면의 공유 주소를 붙여 넣으세요.</small>
            </label>
          )}
          <label>
            방송 설명
            <textarea name="description" value={form.description} onChange={handleChange} maxLength="1000" rows="5" placeholder="방송 내용을 소개해 주세요" />
          </label>
          <label>
            썸네일 이미지 주소 (선택)
            <input name="thumbnailUrl" value={form.thumbnailUrl} onChange={handleChange} placeholder="비워두면 YouTube 썸네일을 사용합니다" />
          </label>

          {error && <p className="live-message live-message--error">{error}</p>}
          <div className="live-form__actions">
            <button type="button" className="live-button live-button--ghost" onClick={() => navigate('/live')}>취소</button>
            <button
              type="submit"
              className="live-button live-button--primary"
              disabled={saving || (youtubeMode === 'auto' && !youtubeStatus?.liveEnabled)}
            >
              {saving ? '만드는 중...' : '방송 만들기'}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  )
}
