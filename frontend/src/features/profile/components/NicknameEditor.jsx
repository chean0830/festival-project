import { useState } from 'react'

const NICKNAME_PATTERN = /^[가-힣a-zA-Z0-9]{2,10}$/

function PencilIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </svg>
  )
}

export default function NicknameEditor({ nickname, onSave }) {
  const [editing, setEditing] = useState(false)
  const [value, setValue] = useState(nickname)
  const [error, setError] = useState(null)
  const [busy, setBusy] = useState(false)

  const startEdit = () => {
    setValue(nickname)
    setError(null)
    setEditing(true)
  }

  const cancelEdit = () => {
    setEditing(false)
    setError(null)
  }

  const handleSave = async () => {
    if (!NICKNAME_PATTERN.test(value)) {
      setError('닉네임은 2~10자의 한글, 영문, 숫자만 사용할 수 있습니다.')
      return
    }
    setBusy(true)
    setError(null)
    try {
      await onSave(value)
      setEditing(false)
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  if (!editing) {
    return (
      <div className="profile-field profile-field-inline">
        <span className="profile-nickname">{nickname}</span>
        <button type="button" className="profile-icon-btn" aria-label="닉네임 수정" onClick={startEdit}>
          <PencilIcon />
        </button>
      </div>
    )
  }

  return (
    <div className="profile-field profile-field-editing">
      <input
        type="text"
        value={value}
        maxLength={10}
        disabled={busy}
        onChange={(e) => setValue(e.target.value)}
        placeholder="2~10자, 한글/영문/숫자"
      />
      <div className="profile-field-editing-row">
        <span className="profile-char-count">{value.length} / 10</span>
        <div className="profile-field-editing-actions">
          <button type="button" className="profile-btn-outline" disabled={busy} onClick={handleSave}>
            저장
          </button>
          <button type="button" className="profile-btn-ghost" disabled={busy} onClick={cancelEdit}>
            취소
          </button>
        </div>
      </div>
      {error && <p className="profile-error-text">{error}</p>}
    </div>
  )
}
