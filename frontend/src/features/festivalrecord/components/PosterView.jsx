import { useMemo, useRef, useState } from 'react'
import html2canvas from 'html2canvas'
import StarRating from './StarRating'

const STYLE_THEMES = [
  { key: 'rock', label: '락' },
  { key: 'indie', label: '인디' },
  { key: 'summer', label: '여름' },
  { key: 'sensitive', label: '감성' },
]

const SHARE_PLATFORMS = [
  { key: 'INSTAGRAM', label: '인스타그램' },
  { key: 'X', label: 'X' },
  { key: 'FACEBOOK', label: '페이스북' },
]

const FREE_REGEN_LIMIT = 3

function guessTheme(hashtag) {
  const text = (hashtag || '').toLowerCase()
  if (text.includes('락') || text.includes('rock')) return 'rock'
  if (text.includes('인디') || text.includes('indie')) return 'indie'
  if (text.includes('여름') || text.includes('summer')) return 'summer'
  return 'sensitive'
}

function shuffled(list) {
  const copy = [...list]
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

export default function PosterView({ record, onShare, onRegenerate }) {
  const posterRef = useRef(null)
  const [isDownloading, setIsDownloading] = useState(false)
  const [downloadError, setDownloadError] = useState(null)
  const [theme, setTheme] = useState(() => guessTheme(record.hashtag))
  const [photoOrder, setPhotoOrder] = useState(() => shuffled(record.images).slice(0, 4))
  // 서버(festival_record.ai_regenerated_count)에 저장된 값으로 초기화한다.
  // state로만 두면 페이지를 나갔다 들어왔을 때 초기화돼서 무료 횟수 제한이 무의미해진다.
  const [regenCount, setRegenCount] = useState(record.aiRegeneratedCount ?? 0)
  const [isRegenerating, setIsRegenerating] = useState(false)
  const [regenError, setRegenError] = useState(null)
  const [shareMessage, setShareMessage] = useState(null)

  const hashtags = useMemo(
    () => (record.hashtag || '').split(/[\s,]+/).filter(Boolean),
    [record.hashtag],
  )

  const regenLimitReached = regenCount >= FREE_REGEN_LIMIT

  async function handleRegenerate() {
    if (isRegenerating || regenLimitReached) {
      return
    }
    setIsRegenerating(true)
    setRegenError(null)
    try {
      const updated = await onRegenerate()
      setPhotoOrder(shuffled(record.images).slice(0, 4))
      setRegenCount(updated.aiRegeneratedCount)
    } catch (err) {
      setRegenError(err.message)
    } finally {
      setIsRegenerating(false)
    }
  }

  async function handleShare(platform) {
    await onShare(platform)
    setShareMessage(`${platform}에 공유했어요.`)
  }

  async function handleDownload() {
    if (!posterRef.current || isDownloading) {
      return
    }
    setIsDownloading(true)
    setDownloadError(null)
    try {
      const canvas = await html2canvas(posterRef.current, {
        useCORS: true,
        backgroundColor: null,
        scale: 2,
      })
      const dataUrl = canvas.toDataURL('image/png')
      const link = document.createElement('a')
      link.href = dataUrl
      link.download = `${record.title || record.eventName || 'festival-poster'}.png`
      document.body.appendChild(link)
      link.click()
      link.remove()
    } catch {
      setDownloadError('포스터 이미지를 만드는 데 실패했어요. 다시 시도해 주세요.')
    } finally {
      setIsDownloading(false)
    }
  }

  return (
    <div className="fr-poster-wrap">
      <div ref={posterRef} className={`fr-poster fr-poster--${theme}`}>
        <div className="fr-poster-photos">
          {photoOrder.length > 0 ? (
            photoOrder.map((image, index) => (
              <img
                key={image.imageId}
                src={image.imageUrl}
                alt=""
                className={`fr-poster-photo fr-poster-photo--${index}`}
              />
            ))
          ) : (
            <div className="fr-poster-photo-empty">사진을 추가하면 포스터에 함께 담겨요</div>
          )}
        </div>

        <div className="fr-poster-overlay">
          <span className="fr-poster-event">{record.eventName}</span>
          <h2 className="fr-poster-title">{record.title || record.eventName}</h2>
          {record.rating != null && <StarRating value={record.rating} readOnly />}
          {record.oneLineReview && <p className="fr-poster-review">“{record.oneLineReview}”</p>}
          {hashtags.length > 0 && (
            <div className="fr-poster-hashtags">
              {hashtags.map((tag) => (
                <span key={tag}>{tag}</span>
              ))}
            </div>
          )}
        </div>
      </div>

      <p className="fr-poster-ai-note">
        ✨ AI 자동 셀렉/생성 기능은 아직 준비 중이에요. 지금은 업로드하신 사진 중에서 무작위로 골라 배치해드려요.
      </p>

      <div className="fr-poster-styles">
        <span>분위기 선택</span>
        <div className="fr-poster-style-buttons">
          {STYLE_THEMES.map((style) => (
            <button
              key={style.key}
              type="button"
              className={`fr-poster-style-btn${theme === style.key ? ' fr-poster-style-btn--active' : ''}`}
              onClick={() => setTheme(style.key)}
            >
              {style.label}
            </button>
          ))}
        </div>
      </div>

      <div className="fr-poster-actions">
        <button
          type="button"
          className="record-btn-ghost"
          onClick={handleRegenerate}
          disabled={isRegenerating || regenLimitReached}
        >
          {regenLimitReached ? '🔒 다시 만들기' : isRegenerating ? '만드는 중...' : '🔄 다시 만들기'}
        </button>
        <button type="button" className="record-btn-primary" onClick={handleDownload} disabled={isDownloading}>
          {isDownloading ? '이미지 만드는 중...' : '⬇ 이미지로 저장'}
        </button>
        <div className="record-share-buttons">
          {SHARE_PLATFORMS.map((platform) => (
            <button key={platform.key} type="button" className="record-btn-ghost" onClick={() => handleShare(platform.key)}>
              {platform.label}
            </button>
          ))}
        </div>
      </div>

      {downloadError && <p className="record-error-text">{downloadError}</p>}

      {regenLimitReached && (
        <p className="fr-poster-regen-limit">
          무료 재생성 {FREE_REGEN_LIMIT}회를 모두 사용했어요. 추가 생성은 결제 후 이용할 수 있어요.
          <br />
          <button type="button" className="record-btn-ghost" disabled>
            결제하고 더 만들기 (준비 중)
          </button>
        </p>
      )}

      {regenError && <p className="record-error-text">{regenError}</p>}
      {shareMessage && <p className="fr-poster-share-message">{shareMessage}</p>}
    </div>
  )
}
