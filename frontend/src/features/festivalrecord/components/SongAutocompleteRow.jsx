import { useEffect, useRef, useState } from 'react'
import { searchSongs } from '../api/songSearchApi'

export default function SongAutocompleteRow({ song, onChange, onRemove }) {
  const [suggestions, setSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [searching, setSearching] = useState(false)
  const debounceRef = useRef(null)

  useEffect(() => {
    return () => clearTimeout(debounceRef.current)
  }, [])

  function handleTitleChange(value) {
    onChange({ ...song, songTitle: value, albumCoverUrl: null })
    clearTimeout(debounceRef.current)

    if (!value.trim()) {
      setSuggestions([])
      setShowSuggestions(false)
      return
    }

    debounceRef.current = setTimeout(async () => {
      setSearching(true)
      try {
        const results = await searchSongs(value)
        setSuggestions(results)
        setShowSuggestions(true)
      } catch {
        setSuggestions([])
      } finally {
        setSearching(false)
      }
    }, 400)
  }

  function handlePick(result) {
    onChange({ ...song, ...result })
    setShowSuggestions(false)
  }

  return (
    <div className="record-form-row record-form-song-row">
      {song.albumCoverUrl ? (
        <img src={song.albumCoverUrl} alt="" className="record-form-song-cover" />
      ) : (
        <div className="record-form-song-cover record-form-song-cover--empty" />
      )}

      <div className="record-form-song-inputs">
        <div className="record-form-song-autocomplete">
          <input
            type="text"
            placeholder="곡 제목 (입력하면 자동완성)"
            value={song.songTitle}
            onChange={(e) => handleTitleChange(e.target.value)}
            onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
          />
          {searching && <span className="record-form-song-loading">검색 중...</span>}
          {showSuggestions && suggestions.length > 0 && (
            <ul className="record-form-song-suggestions">
              {suggestions.map((result, index) => (
                <li key={index} onMouseDown={() => handlePick(result)}>
                  {result.albumCoverUrl && <img src={result.albumCoverUrl} alt="" />}
                  <div>
                    <span className="record-form-song-suggestion-title">{result.songTitle}</span>
                    <span className="record-form-song-suggestion-artist">{result.artistName}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
        <input
          type="text"
          placeholder="아티스트"
          value={song.artistName}
          onChange={(e) => onChange({ ...song, artistName: e.target.value })}
        />
      </div>

      <button type="button" className="record-form-row-remove" onClick={onRemove}>
        삭제
      </button>
    </div>
  )
}
