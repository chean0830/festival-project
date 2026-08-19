import { useRef, useState } from 'react'
import { resolveImageUrl } from '../api/profileApi'

export default function ProfileImageUploader({ imageUrl, onUpload, onDelete }) {
  const fileInputRef = useRef(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setBusy(true)
    setError(null)
    try {
      await onUpload(file)
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
      e.target.value = ''
    }
  }

  const handleDelete = async (e) => {
    e.stopPropagation()
    setBusy(true)
    setError(null)
    try {
      await onDelete()
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="profile-image-uploader">
      <div className="profile-image-frame" onClick={() => fileInputRef.current?.click()}>
        <div className="profile-image-preview">
          {imageUrl && <img src={resolveImageUrl(imageUrl)} alt="프로필 이미지" />}
        </div>
        <div className="profile-image-overlay">
          <button type="button" className="profile-btn-outline" disabled={busy}>
            {imageUrl ? '변경' : '등록'}
          </button>
          {imageUrl && (
            <button type="button" className="profile-btn-ghost" disabled={busy} onClick={handleDelete}>
              삭제
            </button>
          )}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif"
          hidden
          onChange={handleFileChange}
        />
      </div>
      {error && <p className="profile-error-text">{error}</p>}
    </div>
  )
}
