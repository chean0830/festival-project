const STARS = [1, 2, 3, 4, 5]

export default function StarRating({ value, onChange, readOnly = false }) {
  return (
    <div className={`record-star-rating${readOnly ? ' record-star-rating--readonly' : ''}`}>
      {STARS.map((star) => (
        <button
          key={star}
          type="button"
          className={`record-star${value >= star ? ' record-star--filled' : ''}`}
          onClick={readOnly ? undefined : () => onChange(value === star ? null : star)}
          disabled={readOnly}
          aria-label={`별점 ${star}점`}
        >
          ★
        </button>
      ))}
    </div>
  )
}
