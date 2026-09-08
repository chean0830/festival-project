import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Layout from "../components/common/Layout/Layout";
import Button from "../components/common/Button/Button";
import { getEventDetail, getEventLineup, getEventWeather, getEventNews } from "../api/eventApi";
import { checkInEvent } from "../api/visitApi";
import { getChatRoomByEvent, getLatestChatMessage } from "../api/chatApi";
import { hasUnseenMessage } from "../utils/chatSeen";
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

const NEWS_TYPE_LABEL = {
  LINEUP: "라인업",
  SCHEDULE: "일정변경",
  NOTICE: "공지",
  PERFORMANCE: "공연",
  MD: "MD",
  ARTIST: "아티스트",
};

function NoticeInline({ tag, text }) {
  return (
    <div className="notice-inline">
      <span className="notice-inline__dot" />
      <span className="notice-inline__tag">{tag}</span>
      <span className="notice-inline__text">{text}</span>
    </div>
  );
}

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
  const [weather, setWeather] = useState(undefined);
  const [news, setNews] = useState([]);
  const [checkInStatus, setCheckInStatus] = useState("idle"); // idle | checking | success | error
  const [checkInMessage, setCheckInMessage] = useState(null);
  const [hasNewChat, setHasNewChat] = useState(false);

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
    let cancelled = false;
    setWeather(undefined);

    getEventWeather(eventId)
      .then((data) => {
        if (!cancelled) setWeather(data);
      })
      .catch((err) => {
        if (!cancelled) setWeather({ available: false, message: err.message });
      });

    return () => {
      cancelled = true;
    };
  }, [eventId]);

  useEffect(() => {
    let cancelled = false;
    setNews([]);

    getEventNews(eventId)
      .then((data) => {
        if (!cancelled) setNews(data ?? []);
      })
      .catch(() => {
        if (!cancelled) setNews([]);
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

  useEffect(() => {
    if (!memberId) {
      setHasNewChat(false);
      return undefined;
    }

    let cancelled = false;

    getChatRoomByEvent(eventId)
      .then((roomData) => getLatestChatMessage(roomData.roomId).then((latest) => ({ roomData, latest })))
      .then(({ roomData, latest }) => {
        if (!cancelled) setHasNewChat(hasUnseenMessage(roomData.roomId, latest));
      })
      .catch(() => {
        if (!cancelled) setHasNewChat(false);
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

  function handleCheckIn() {
    if (!memberId) {
      navigate("/login");
      return;
    }
    if (!navigator.geolocation) {
      setCheckInStatus("error");
      setCheckInMessage("이 브라우저는 위치 정보를 지원하지 않아요.");
      return;
    }

    setCheckInStatus("checking");
    setCheckInMessage(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        checkInEvent(memberId, {
          eventId,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        })
          .then((result) => {
            setCheckInStatus(result.success ? "success" : "error");
            setCheckInMessage(result.message);
          })
          .catch((err) => {
            setCheckInStatus("error");
            setCheckInMessage(err.message);
          });
      },
      () => {
        setCheckInStatus("error");
        setCheckInMessage("위치 권한을 허용해야 체크인할 수 있어요.");
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
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
        {news.length > 0 && (
          <div className="event-detail__news">
            {news.map((item) => (
              <NoticeInline
                key={item.id}
                tag={NEWS_TYPE_LABEL[item.newsType] || "소식"}
                text={item.title}
              />
            ))}
          </div>
        )}

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
            {weather?.available && (
              <div>
                <dt>날씨</dt>
                <dd className="event-detail__weather">
                  {weather.icon && (
                    <img
                      className="event-detail__weather-icon"
                      src={`https://openweathermap.org/img/wn/${weather.icon}.png`}
                      alt={weather.description ?? ""}
                    />
                  )}
                  <span>
                    {Math.round(weather.minTemp)}° - {Math.round(weather.maxTemp)}°
                    {weather.description ? ` · ${weather.description}` : ""}
                    {weather.rainChancePercent != null ? ` · 강수확률 ${weather.rainChancePercent}%` : ""}
                  </span>
                </dd>
              </div>
            )}
            {weather && !weather.available && weather.message && (
              <div>
                <dt>날씨</dt>
                <dd className="event-detail__weather event-detail__weather--unavailable">{weather.message}</dd>
              </div>
            )}
            {event.genres?.length > 0 && (
              <div>
                <dt>장르</dt>
                <dd className="event-detail__genres">
                  {event.genres.map((genre) => (
                    <span key={genre} className="event-detail__genre-tag">
                      {genre}
                    </span>
                  ))}
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

            <button
              type="button"
              className="event-detail__chat-btn"
              aria-label="오픈채팅 입장"
              onClick={() => navigate(`/program/event/${eventId}/chat`)}
            >
              <svg viewBox="0 0 24 24" width="22" height="22" stroke="currentColor" strokeWidth="2">
                <path
                  d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z"
                  fill="none"
                />
              </svg>
              {hasNewChat && <span className="event-detail__chat-btn-dot" aria-label="새 메시지 있음" />}
            </button>
          </div>

          {heartError && <p className="event-detail__heart-error">{heartError}</p>}

          <button
            type="button"
            className="event-detail__checkin-btn"
            onClick={handleCheckIn}
            disabled={checkInStatus === "checking" || checkInStatus === "success"}
          >
            {checkInStatus === "success" ? "체크인 완료 ✓" : checkInStatus === "checking" ? "위치 확인 중..." : "📍 방문 체크인"}
          </button>
          {checkInMessage && (
            <p
              className={`event-detail__checkin-message${
                checkInStatus === "error" ? " event-detail__checkin-message--error" : ""
              }`}
            >
              {checkInMessage}
            </p>
          )}

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
