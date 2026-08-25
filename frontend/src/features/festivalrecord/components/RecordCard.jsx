import { Link } from 'react-router-dom'
import StarRating from './StarRating'

export default function RecordCard({ record }) {
  return (
    <Link to={`/festival-log/${record.recordId}`} className="record-card">
      {record.thumbnailImageUrl ? (
        <img src={record.thumbnailImageUrl} alt={record.eventName} className="record-card-thumb" />
      ) : (
        <div className="record-card-thumb record-card-thumb--placeholder" />
      )}
      <div className="record-card-body">
        <span className="record-card-event">{record.eventName}</span>
        <span className="record-card-title">{record.title || '제목 없는 기록'}</span>
        {record.rating != null && <StarRating value={record.rating} readOnly />}
        {record.aiSummary ? (
          <p className="record-card-review record-card-ai-summary">📝 {record.aiSummary}</p>
        ) : (
          record.oneLineReview && <p className="record-card-review">{record.oneLineReview}</p>
        )}
      </div>
    </Link>
  )
}
