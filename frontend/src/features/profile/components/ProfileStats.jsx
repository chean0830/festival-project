export default function ProfileStats({ stats, onClickTotalVisits, onClickThisYearVisits }) {
  if (!stats) {
    return null
  }

  return (
    <ul className="profile-stats-row">
      <li>
        <button type="button" className="profile-stat-chip profile-stat-chip-clickable" onClick={onClickTotalVisits}>
          <span className="profile-stat-value">{stats.totalVisits}</span>
          <span className="profile-stat-label">총 방문 페스티벌</span>
        </button>
      </li>
      <li>
        <button
          type="button"
          className="profile-stat-chip profile-stat-chip-clickable"
          onClick={onClickThisYearVisits}
        >
          <span className="profile-stat-value">{stats.thisYearVisits}</span>
          <span className="profile-stat-label">올해 다녀온 페스티벌</span>
        </button>
      </li>
      <li className="profile-stat-chip">
        <span className="profile-stat-value">{stats.favoriteGenre || '-'}</span>
        <span className="profile-stat-label">최애 장르</span>
      </li>
    </ul>
  )
}
