import { useState } from 'react'
import useCurrentMember from '../../profile/hooks/useCurrentMember'
import { requestTossPayment } from '../../../utils/tossPayment'
import { formatPrice } from '../../../utils/formatPrice'

const SHARE_PLATFORMS = [
  { key: 'INSTAGRAM', label: '인스타그램' },
  { key: 'X', label: 'X' },
  { key: 'FACEBOOK', label: '페이스북' },
]

const POSTER_CHARGE_PRICE = 900
const MAX_POSTER_CHARGE_QTY = 5
const CHARGE_QTY_OPTIONS = [1, 2, 3, 4, 5]

export default function PosterView({ record, onShare, onRegenerate, onSelectVersion, styleRequest, onStyleRequestChange }) {
  const currentMember = useCurrentMember()
  // 서버(festival_record_ai_quota.used_count)에 저장된 값으로 초기화한다.
  // state로만 두면 페이지를 나갔다 들어왔을 때 초기화돼서 무료 횟수 제한이 무의미해진다.
  const [regenCount, setRegenCount] = useState(record.aiRegeneratedCount ?? 0)
  const [freeLimit] = useState(record.aiPosterFreeLimit ?? 3)
  const [posterImageUrl, setPosterImageUrl] = useState(record.posterImageUrl ?? null)
  const [versions, setVersions] = useState(record.posterVersions ?? [])
  const [isRegenerating, setIsRegenerating] = useState(false)
  const [isSwitchingVersion, setIsSwitchingVersion] = useState(false)
  const [regenError, setRegenError] = useState(null)
  const [shareMessage, setShareMessage] = useState(null)
  const [chargePromptOpen, setChargePromptOpen] = useState(false)
  const [chargeQty, setChargeQty] = useState(1)
  const [isCharging, setIsCharging] = useState(false)
  const [chargeError, setChargeError] = useState(null)

  // 충전(유료) 횟수는 결제 후 페이지를 다시 들어올 때 record로 최신값이 들어오므로 prop에서 바로 읽는다.
  const paidCount = record.aiPosterPaidCount ?? 0
  const totalLimit = freeLimit + paidCount
  const regenLimitReached = regenCount >= totalLimit

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
      setVersions(updated.posterVersions ?? [])
    } catch (err) {
      setRegenError(err.message)
    } finally {
      setIsRegenerating(false)
    }
  }

  function handleRegenButtonClick() {
    if (regenLimitReached) {
      setChargeError(null)
      setChargeQty(1)
      setChargePromptOpen(true)
      return
    }
    handleRegenerate()
  }

  async function handleConfirmCharge() {
    if (isCharging) {
      return
    }
    setIsCharging(true)
    setChargeError(null)
    try {
      await requestTossPayment({
        methodLabel: '카드 결제',
        domainPrefix: 'POSTER',
        domainId: record.recordId,
        amount: chargeQty * POSTER_CHARGE_PRICE,
        orderName: `AI 포스터 생성 ${chargeQty}회 충전`,
        customerName: currentMember?.nickname ?? '회원',
      })
      // 성공 시 브라우저가 Toss 결제창으로 이동하므로 이후 코드는 실행되지 않는다.
    } catch (err) {
      setChargeError(err.message)
      setIsCharging(false)
    }
  }

  async function handleSelectVersion(versionId) {
    if (isSwitchingVersion || versionId === null) {
      return
    }
    setIsSwitchingVersion(true)
    setRegenError(null)
    try {
      const updated = await onSelectVersion(versionId)
      setPosterImageUrl(updated.posterImageUrl)
      setVersions(updated.posterVersions ?? [])
    } catch (err) {
      setRegenError(err.message)
    } finally {
      setIsSwitchingVersion(false)
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

      {versions.length > 1 && (
        <div className="fr-version-gallery">
          {versions.map((version) => (
            <button
              key={version.versionId}
              type="button"
              className={`fr-version-thumb${version.imageUrl === posterImageUrl ? ' fr-version-thumb--active' : ''}`}
              onClick={() => handleSelectVersion(version.versionId)}
              disabled={isSwitchingVersion}
            >
              <img src={version.imageUrl} alt="이전에 만든 포스터" />
            </button>
          ))}
        </div>
      )}

      <p className="fr-ai-usage-count">
        {paidCount > 0
          ? `생성 ${regenCount}/${totalLimit}회 사용 (무료 ${freeLimit} + 충전 ${paidCount})`
          : `무료 생성 ${regenCount}/${freeLimit}회 사용`}
      </p>

      {!regenLimitReached && (
        <div className="record-form-field">
          <label htmlFor="poster-style-request-regen">어떤 느낌의 포스터를 원하시나요?</label>
          <textarea
            id="poster-style-request-regen"
            value={styleRequest}
            onChange={(e) => onStyleRequestChange(e.target.value)}
            placeholder="예) 푸르고 시원한 청량 여름느낌, 에너지 폭발 쿨한 느낌"
            rows={2}
            maxLength={200}
          />
        </div>
      )}

      <div className="fr-poster-actions">
        <button
          type="button"
          className="record-btn-ghost"
          onClick={handleRegenButtonClick}
          disabled={isRegenerating}
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
        <p className="fr-poster-regen-limit">
          무료 생성 {freeLimit}회를 모두 사용했어요. 1회당 {POSTER_CHARGE_PRICE}원에 충전할 수 있어요.
        </p>
      )}

      {regenError && <p className="record-error-text">{regenError}</p>}
      {shareMessage && <p className="fr-poster-share-message">{shareMessage}</p>}

      {chargePromptOpen && (
        <div
          className="fr-charge-modal__backdrop"
          onClick={() => {
            if (!isCharging) setChargePromptOpen(false)
          }}
        >
          <div
            className="fr-charge-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="fr-charge-modal-title"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 id="fr-charge-modal-title" className="fr-charge-modal__title">
              생성 횟수를 충전하시겠습니까?
            </h3>
            <p className="fr-charge-modal__desc">
              무료 생성 {freeLimit}회를 모두 사용했어요.
              <br />몇 회 충전할지 선택해주세요. (한 번에 최대 {MAX_POSTER_CHARGE_QTY}회)
            </p>

            <div className="fr-charge-modal__qty">
              {CHARGE_QTY_OPTIONS.map((n) => (
                <button
                  key={n}
                  type="button"
                  className={`fr-charge-qty-btn${n === chargeQty ? ' fr-charge-qty-btn--active' : ''}`}
                  onClick={() => setChargeQty(n)}
                  disabled={isCharging}
                >
                  {n}회
                </button>
              ))}
            </div>

            <p className="fr-charge-modal__total">
              1회당 {POSTER_CHARGE_PRICE}원 · 총 결제 <strong>{formatPrice(chargeQty * POSTER_CHARGE_PRICE)}</strong>
            </p>

            {chargeError && <p className="record-error-text">{chargeError}</p>}
            <div className="fr-charge-modal__actions">
              <button
                type="button"
                className="record-btn-ghost"
                onClick={() => setChargePromptOpen(false)}
                disabled={isCharging}
              >
                아니오
              </button>
              <button
                type="button"
                className="record-btn-primary"
                onClick={handleConfirmCharge}
                disabled={isCharging}
              >
                {isCharging ? '결제창 여는 중...' : '예, 결제하기'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
