import { resolveImageUrl } from '../api/profileApi'

export default function InterestedArtistList({ artists, onRemove }) {
  if (!artists || artists.length === 0) {
    return <p className="profile-empty-text">아직 하트를 누른 관심 가수가 없습니다.</p>
  }

  return (
    <ul className="profile-interest-list">
      {artists.map((artist) => (
        <li key={artist.artistId} className="profile-interest-item">
          {artist.profileImageUrl ? (
            <img src={resolveImageUrl(artist.profileImageUrl)} alt={artist.name} />
          ) : (
            <div className="profile-interest-thumb-placeholder" />
          )}
          <span>{artist.name}</span>
          {onRemove && (
            <button
              type="button"
              className="profile-interest-remove"
              onClick={() => onRemove(artist.artistId)}
              aria-label={`${artist.name} 관심 해제`}
            >
              찜 해제
            </button>
          )}
        </li>
      ))}
    </ul>
  )
}
