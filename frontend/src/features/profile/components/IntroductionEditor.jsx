import { useState } from 'react'

const MAX_LENGTH = 100

function PencilIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </svg>
  )
}

export default function IntroductionEditor({ introduction, onSave }) {
  const [editing, setEditing] = useState(false)
  const [value, setValue] = useState(introduction || '')
  const [error, setError] = useState(null)
  const [busy, setBusy] = useState(false)

  const startEdit = () => {
    setValue(introduction || '')
    setError(null)
    setEditing(true)
  }

  const cancelEdit = () => {
    setEditing(false)
    setError(null)
  }

  const handleSave = async () => {
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
      <div className="profile-field profile-field-inline profile-field-introduction">
        <span className="profile-introduction">
          {introduction || '한 줄 자기소개를 작성해보세요.'}
        </span>
        <button type="button" className="profile-icon-btn profile-icon-btn-subtle" aria-label="자기소개 수정" onClick={startEdit}>
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
        maxLength={MAX_LENGTH}
        disabled={busy}
        onChange={(e) => setValue(e.target.value)}
        placeholder="한 줄 자기소개"
      />
      <div className="profile-field-editing-row">
        <span className="profile-char-count">
          {value.length} / {MAX_LENGTH}
        </span>
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
