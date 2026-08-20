import { forwardRef } from 'react'

const BookCoverPage = forwardRef(function BookCoverPage({ title, eventName, variant = 'front' }, ref) {
  return (
    <div ref={ref} className={`fr-flip-page fr-flip-cover fr-flip-cover--${variant}`} data-density="hard">
      <div className="fr-flip-cover-inner">
        {variant === 'front' ? (
          <>
            <span className="fr-flip-cover-label">FESTIVAL DIARY</span>
            <h2 className="fr-flip-cover-title">{title || eventName}</h2>
            <span className="fr-flip-cover-event">{eventName}</span>
            <span className="fr-flip-cover-hint">모서리를 넘겨보세요 →</span>
          </>
        ) : (
          <>
            <span className="fr-flip-cover-label">THE END</span>
            <span className="fr-flip-cover-event">{eventName}</span>
          </>
        )}
      </div>
    </div>
  )
})

export default BookCoverPage
