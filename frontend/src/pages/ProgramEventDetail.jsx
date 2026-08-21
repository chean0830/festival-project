import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Layout from "../components/common/Layout/Layout";
import Button from "../components/common/Button/Button";
import { getEventDetail } from "../api/eventApi";
import "./ProgramEventDetail.css";

const EVENT_TYPE_LABEL = {
  FESTIVAL: "페스티벌",
  CONCERT: "콘서트",
};

function formatDate(dateStr) {
  if (!dateStr) return "";
  const [year, month, day] = dateStr.split("-");
  return `${year}.${month}.${day}`;
}

/**
 * 공연 상세페이지
 * - GET /api/home/events/{eventId} 로 데이터를 받아온다.
 * - 예매 링크(YES24)가 있으면 "예매하러 가기" 버튼으로 새 탭에서 연결.
 */
function ProgramEventDetail() {
  const { eventId } = useParams();
  const [event, setEvent] = useState(undefined);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    getEventDetail(eventId)
      .then((data) => {
        if (!cancelled) setEvent(data);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      });

    return () => {
      cancelled = true;
    };
  }, [eventId]);

  if (error) {
    return (
      <Layout>
        <div className="event-detail event-detail--message">{error}</div>
      </Layout>
    );
  }

  if (event === undefined) {
    return (
      <Layout>
        <div className="event-detail event-detail--message">불러오는 중...</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="event-detail">
        <div className="event-detail__poster">
          {event.posterImage ? (
            <img src={event.posterImage} alt={event.name} />
          ) : (
            "예시 이미지"
          )}
        </div>

        <div className="event-detail__info">
          {event.eventType && (
            <span className="event-detail__type">
              {EVENT_TYPE_LABEL[event.eventType] || event.eventType}
            </span>
          )}
          <h1 className="event-detail__name">{event.name}</h1>

          <dl className="event-detail__meta">
            <div>
              <dt>일정</dt>
              <dd>
                {formatDate(event.startDate)} - {formatDate(event.endDate)}
              </dd>
            </div>
            {event.venueName && (
              <div>
                <dt>장소</dt>
                <dd>
                  {event.venueName}
                  {event.venueAddress ? ` (${event.venueAddress})` : ""}
                </dd>
              </div>
            )}
          </dl>

          {event.description && (
            <p className="event-detail__description">{event.description}</p>
          )}

          <Button
            variant="primary"
            size="lg"
            disabled={!event.ticketUrl}
            onClick={() =>
              window.open(event.ticketUrl, "_blank", "noopener,noreferrer")
            }
          >
            {event.ticketUrl ? "YES24에서 예매하기 →" : "예매 링크 준비 중"}
          </Button>
        </div>
      </div>
    </Layout>
  );
}

export default ProgramEventDetail;
