import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Layout from "../components/common/Layout/Layout";
import Button from "../components/common/Button/Button";
import { getEventDetail, getEventLineup } from "../api/eventApi";
import useCurrentMember from "../features/profile/hooks/useCurrentMember";
import {
  fetchInterestedEventStatus,
  addInterestedEvent,
  removeInterestedEvent,
} from "../features/profile/api/profileApi";
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
  const navigate = useNavigate();
  const currentMember = useCurrentMember();
  const memberId = currentMember?.memberId;
  const [event, setEvent] = useState(undefined);
  const [error, setError] = useState(null);
  const [interested, setInterested] = useState(false);
  const [heartBusy, setHeartBusy] = useState(false);
  const [heartError, setHeartError] = useState(null);
  const [lineup, setLineup] = useState(undefined);
  const [showLineup, setShowLineup] = useState(false);
  const [lineupError, setLineupError] = useState(null);

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

  useEffect(() => {
    if (!memberId) {
      setInterested(false);
      return undefined;
    }

    let cancelled = false;

    fetchInterestedEventStatus(memberId, eventId)
      .then((data) => {
        if (!cancelled) setInterested(Boolean(data?.interested));
      })
      .catch(() => {
        if (!cancelled) setInterested(false);
      });

    return () => {
      cancelled = true;
    };
  }, [memberId, eventId]);

  function handleToggleLineup() {
    setShowLineup((prev) => !prev);

    if (lineup === undefined) {
      getEventLineup(eventId)
        .then((data) => setLineup(data))
        .catch((err) => setLineupError(err.message));
    }
  }

  async function handleToggleInterest() {
    if (!memberId) {
      navigate("/login");
      return;
    }
    if (heartBusy) return;

    setHeartBusy(true);
    setHeartError(null);
    try {
      if (interested) {
        await removeInterestedEvent(memberId, eventId);
        setInterested(false);
      } else {
        await addInterestedEvent(memberId, eventId);
        setInterested(true);
      }
    } catch (err) {
      setHeartError(err.message);
    } finally {
      setHeartBusy(false);
    }
  }

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

          <div className="event-detail__actions">
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

            <button
              type="button"
              className={`event-detail__heart-btn${interested ? " event-detail__heart-btn--active" : ""}`}
              aria-label={interested ? "관심 공연 해제" : "관심 공연 추가"}
              aria-pressed={interested}
              disabled={heartBusy}
              onClick={handleToggleInterest}
            >
              <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2">
                <path
                  d="M12 21s-7.5-4.8-10-9.5C0.3 8 1.7 4.5 5 3.6c2.1-0.6 4.3 0.3 5.6 2.1L12 7.5l1.4-1.8c1.3-1.8 3.5-2.7 5.6-2.1 3.3 0.9 4.7 4.4 3 7.9C19.5 16.2 12 21 12 21z"
                  fill={interested ? "currentColor" : "none"}
                />
              </svg>
            </button>
          </div>

          {heartError && <p className="event-detail__heart-error">{heartError}</p>}

          <button type="button" className="event-detail__lineup-toggle" onClick={handleToggleLineup}>
            라인업 확인하기 {showLineup ? "▲" : "▼"}
          </button>

          {showLineup && (
            <div className="event-detail__lineup">
              {lineupError && <p className="event-detail__heart-error">{lineupError}</p>}
              {lineup === undefined && !lineupError && <p>라인업을 불러오는 중...</p>}
              {lineup && lineup.length === 0 && <p>등록된 라인업이 없어요.</p>}
              {lineup && lineup.length > 0 && (
                <ul className="event-detail__lineup-grid">
                  {lineup.map((artist) => (
                    <li key={artist.artistId}>
                      <button
                        type="button"
                        className="event-detail__lineup-artist"
                        onClick={() => navigate(`/artists/${artist.artistId}`)}
                      >
                        <span className="event-detail__lineup-artist-thumb">
                          {artist.profileImage ? (
                            <img src={artist.profileImage} alt={artist.name} />
                          ) : (
                            "예시 이미지"
                          )}
                        </span>
                        <span className="event-detail__lineup-artist-name">{artist.name}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

export default ProgramEventDetail;
