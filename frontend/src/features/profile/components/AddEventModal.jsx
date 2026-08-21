import { useEffect, useRef, useState } from 'react'
import { search, SEARCH_TYPE_LABEL } from '../../../api/searchApi'
import { todayIso } from '../../../utils/todayIso'

const ADDABLE_TYPES = new Set(['festival', 'event'])

/**
 * 검색해서 공연을 골라 추가하는 모달. '다녀온 공연' / '예정된 공연'이 같은 로직(검색 + 추가)을 공유한다.
 * DB에 있는 공연/페스티벌을 검색해서 선택하면 부모(onAdd)가 실제 등록 API를 호출한다.
 * excludePastEvents가 true면(예정된 공연) 이미 끝난 공연은 검색 결과에서 아예 제외한다.
 */
export default function AddEventModal({ title = '공연 추가', excludePastEvents = false, onClose, onAdd }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [pendingId, setPendingId] = useState(null)
  const [flashId, setFlashId] = useState(null)
  const [error, setError] = useState(null)
  const inputRef = useRef(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  useEffect(() => {
    const trimmed = query.trim()
    if (!trimmed) {
      setResults([])
      return undefined
    }

    let cancelled = false
    const timer = setTimeout(() => {
      search(trimmed)
        .then((data) => {
          if (cancelled) return
          const today = todayIso()
          const filtered = data.filter((item) => {
            if (!ADDABLE_TYPES.has(item.type)) return false
            if (excludePastEvents && item.endDate && item.endDate < today) return false
            return true
          })
          setResults(filtered)
        })
        .catch(() => {
          if (!cancelled) setResults([])
        })
    }, 250)

    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [query, excludePastEvents])

  async function handleAdd(item) {
    const eventId = Number(item.id.split('-')[1])
    if (!eventId || pendingId) return

    setPendingId(item.id)
    setError(null)
    try {
      await onAdd(eventId)
      setFlashId(item.id)
      setTimeout(() => {
        setFlashId((current) => (current === item.id ? null : current))
      }, 500)
    } catch (err) {
      setError(err.message)
    } finally {
      setPendingId(null)
    }
  }

  return (
    <div className="profile-modal-backdrop" onClick={onClose}>
      <div className="profile-modal" onClick={(event) => event.stopPropagation()}>
        <div className="profile-modal-header">
          <h3>{title}</h3>
          <button type="button" className="profile-modal-close" aria-label="닫기" onClick={onClose}>
            ✕
          </button>
        </div>

        <input
          ref={inputRef}
          type="text"
          className="profile-modal-search-input"
          placeholder="공연/페스티벌 이름으로 검색"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />

        {error && <p className="profile-error-text">{error}</p>}

        <ul className="profile-modal-result-list">
          {results.length === 0 && query.trim() && (
            <li className="profile-empty-text">검색 결과가 없어요</li>
          )}
          {results.map((item) => (
            <li key={item.id} className="profile-modal-result-item">
              <span className="profile-modal-result-thumb">
                {item.image && <img src={item.image} alt="" />}
              </span>
              <div className="profile-modal-result-info">
                <span className="profile-modal-result-name">{item.name}</span>
                <span className="profile-modal-result-subtitle">
                  {SEARCH_TYPE_LABEL[item.type]} · {item.subtitle}
                </span>
              </div>
              <button
                type="button"
                className={`profile-modal-add-btn${flashId === item.id ? ' profile-modal-add-btn--flash' : ''}`}
                aria-label={`${item.name} 추가`}
                disabled={pendingId === item.id}
                onClick={() => handleAdd(item)}
              >
                <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" fill="none">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
