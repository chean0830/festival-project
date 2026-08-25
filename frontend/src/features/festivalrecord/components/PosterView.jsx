import { useState } from 'react'

const SHARE_PLATFORMS = [
  { key: 'INSTAGRAM', label: '인스타그램' },
  { key: 'X', label: 'X' },
  { key: 'FACEBOOK', label: '페이스북' },
]

const FREE_REGEN_LIMIT = 3

export default function PosterView({ record, onShare, onRegenerate }) {
  // 서버(festival_record.ai_regenerated_count)에 저장된 값으로 초기화한다.
  // state로만 두면 페이지를 나갔다 들어왔을 때 초기화돼서 무료 횟수 제한이 무의미해진다.
  const [regenCount, setRegenCount] = useState(record.aiRegeneratedCount ?? 0)
  const [posterImageUrl, setPosterImageUrl] = useState(record.posterImageUrl ?? null)
  const [isRegenerating, setIsRegenerating] = useState(false)
  const [regenError, setRegenError] = useState(null)
  const [shareMessage, setShareMessage] = useState(null)

  const regenLimitReached = regenCount >= FREE_REGEN_LIMIT

  async function handleRegenerate() {
    if (isRegenerating || regenLimitReached) {
      return
    }
    setIsRegenerating(true)
    setRegenError(null)
    try {
      const updated = await onRegenerate()
      setPosterImageUrl(updated.posterImageUrl)
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

  return (
    <div className="fr-poster-wrap">
      <div className="fr-poster fr-poster--ai">
        {posterImageUrl ? (
          <img src={posterImageUrl} alt="AI가 만든 포스터" className="fr-poster-ai-image" />
        ) : (
          <div className="fr-poster-photo-empty">아직 만들어진 포스터가 없어요</div>
        )}
      </div>

      <div className="fr-poster-actions">
        <button
          type="button"
          className="record-btn-ghost"
          onClick={handleRegenerate}
          disabled={isRegenerating || regenLimitReached}
        >
          {regenLimitReached ? '🔒 다시 만들기' : isRegenerating ? '✨ AI가 만드는 중...' : '🔄 다시 만들기'}
        </button>
        {posterImageUrl && (
          <a href={posterImageUrl} download className="record-btn-primary">
            ⬇ 이미지로 저장
          </a>
        )}
        <div className="record-share-buttons">
          {SHARE_PLATFORMS.map((platform) => (
            <button key={platform.key} type="button" className="record-btn-ghost" onClick={() => handleShare(platform.key)}>
              {platform.label}
            </button>
          ))}
        </div>
      </div>

      {regenLimitReached && (
        <p className="fr-poster-regen-limit">무료 생성 {FREE_REGEN_LIMIT}회를 모두 사용했어요.</p>
      )}

      {regenError && <p className="record-error-text">{regenError}</p>}
      {shareMessage && <p className="fr-poster-share-message">{shareMessage}</p>}
    </div>
  )
}
