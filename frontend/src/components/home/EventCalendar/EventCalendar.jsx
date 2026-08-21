import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getUpcomingEvents, formatEventDate } from "../../../api/eventApi";
import "./EventCalendar.css";

/**
 * 공연 캘린더 (월 단위)
 * - 이전/다음 달 이동
 * - 공연 있는 날짜에 점(dot) 표시, 마우스 올리면 간단 미리보기
 * - 공연이 여러 개인 날짜를 클릭하면 그 날의 전체 공연 목록을 모달로 보여줌
 * - GET /api/home/events로 받아온 실제 DB 데이터를 날짜별로 묶어서 씀
 */

const DOT_PALETTE = ["#c98fd1", "#ff6f91", "#5ac8fa", "#4be3ab", "#ffb347", "#7c83fd"];

// events를 날짜(dateKey)별로 묶는다. start~end 사이 모든 날짜에 표시한다.
function buildEventsByDate(events) {
  const map = {};

  events.forEach((event) => {
    const cursor = new Date(event.startDate);
    const end = new Date(event.endDate);

    while (cursor <= end) {
      const key = toDateKey(cursor.getFullYear(), cursor.getMonth(), cursor.getDate());
      (map[key] ??= []).push({
        id: event.id,
        name: event.name,
        venueName: event.venueName,
        startDate: event.startDate,
      });
      cursor.setDate(cursor.getDate() + 1);
    }
  });

  return map;
}

const WEEKDAY_LABELS = ["일", "월", "화", "수", "목", "금", "토"];

function toDateKey(year, month, day) {
  const mm = String(month + 1).padStart(2, "0");
  const dd = String(day).padStart(2, "0");
  return `${year}-${mm}-${dd}`;
}

// 달력에 필요한 6주(42칸) 분량의 날짜 셀을 만든다.
// 이전/다음 달에 걸치는 칸은 inCurrentMonth: false로 표시해서 흐리게 보여줄 수 있게 한다.
function buildCalendarCells(year, month) {
  const firstDayOfWeek = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const cells = [];

  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    cells.push({ day: daysInPrevMonth - i, inCurrentMonth: false, dateKey: null });
  }
  for (let day = 1; day <= daysInMonth; day++) {
    cells.push({ day, inCurrentMonth: true, dateKey: toDateKey(year, month, day) });
  }
  while (cells.length % 7 !== 0 || cells.length < 42) {
    const day = cells.length - (firstDayOfWeek + daysInMonth) + 1;
    cells.push({ day, inCurrentMonth: false, dateKey: null });
  }

  return cells;
}

function EventCalendar() {
  const navigate = useNavigate();
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [hoveredDateKey, setHoveredDateKey] = useState(null);
  const [eventsByDate, setEventsByDate] = useState({});
  const [modalDateKey, setModalDateKey] = useState(null);

  useEffect(() => {
    let cancelled = false;

    getUpcomingEvents()
      .then((events) => {
        if (!cancelled) setEventsByDate(buildEventsByDate(events));
      })
      .catch(() => {
        if (!cancelled) setEventsByDate({});
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const cells = buildCalendarCells(viewYear, viewMonth);
  const todayKey = toDateKey(today.getFullYear(), today.getMonth(), today.getDate());

  function goToPrevMonth() {
    setHoveredDateKey(null);
    if (viewMonth === 0) {
      setViewYear((y) => y - 1);
      setViewMonth(11);
    } else {
      setViewMonth((m) => m - 1);
    }
  }

  function goToNextMonth() {
    setHoveredDateKey(null);
    if (viewMonth === 11) {
      setViewYear((y) => y + 1);
      setViewMonth(0);
    } else {
      setViewMonth((m) => m + 1);
    }
  }

  function handleCellClick(cell, events) {
    if (!events.length) return;
    if (events.length === 1) {
      navigate(`/program/event/${events[0].id}`);
      return;
    }
    setModalDateKey(cell.dateKey);
  }

  const hoveredEvents = hoveredDateKey ? eventsByDate[hoveredDateKey] ?? [] : [];
  const modalEvents = modalDateKey ? eventsByDate[modalDateKey] ?? [] : [];
  const modalDay = modalDateKey ? Number(modalDateKey.split("-")[2]) : null;

  return (
    <div className="event-calendar">
      <div className="event-calendar__header">
        <button
          type="button"
          className="event-calendar__nav-btn"
          aria-label="이전 달"
          onClick={goToPrevMonth}
        >
          ‹
        </button>
        <p className="event-calendar__title">
          {viewYear}년 {viewMonth + 1}월
        </p>
        <button
          type="button"
          className="event-calendar__nav-btn"
          aria-label="다음 달"
          onClick={goToNextMonth}
        >
          ›
        </button>
      </div>

      <div className="event-calendar__weekdays">
        {WEEKDAY_LABELS.map((label, index) => (
          <span
            key={label}
            className={index === 0 ? "event-calendar__weekday--sun" : index === 6 ? "event-calendar__weekday--sat" : undefined}
          >
            {label}
          </span>
        ))}
      </div>

      <div className="event-calendar__grid">
        {cells.map((cell, index) => {
          const events = cell.dateKey ? eventsByDate[cell.dateKey] ?? [] : [];
          const hasEvents = events.length > 0;
          const isToday = cell.dateKey === todayKey;

          if (!cell.inCurrentMonth) {
            return <div key={index} className="event-calendar__cell event-calendar__cell--empty" />;
          }

          return (
            <div
              key={index}
              className={[
                "event-calendar__cell",
                isToday && "event-calendar__cell--today",
                hasEvents && "event-calendar__cell--has-events",
              ]
                .filter(Boolean)
                .join(" ")}
              onMouseEnter={() => hasEvents && setHoveredDateKey(cell.dateKey)}
              onMouseLeave={() => setHoveredDateKey(null)}
              onClick={() => handleCellClick(cell, events)}
            >
              <span className="event-calendar__day">{cell.day}</span>
              {hasEvents && (
                <span className="event-calendar__dotrow">
                  {events.slice(0, 3).map((event, i) => (
                    <span
                      key={event.id}
                      className="event-calendar__dot"
                      style={{ background: DOT_PALETTE[i % DOT_PALETTE.length] }}
                    />
                  ))}
                  {events.length > 3 && (
                    <span className="event-calendar__dot-more">+{events.length - 3}</span>
                  )}
                </span>
              )}
              {isToday && !hasEvents && <span className="event-calendar__dotrow"><span className="event-calendar__dot event-calendar__dot--today" /></span>}

              {hoveredDateKey === cell.dateKey && hasEvents && (
                <div className="event-calendar__tooltip">
                  {events.length > 1
                    ? `${events.length}개 일정 · 클릭해서 전체보기`
                    : `${events[0].name} · 클릭해서 보기`}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="event-calendar__legend">
        <span className="event-calendar__legend-item">
          <span className="event-calendar__legend-swatch event-calendar__legend-swatch--today" />
          오늘
        </span>
        <span className="event-calendar__legend-item">
          <span className="event-calendar__legend-swatch event-calendar__legend-swatch--event" />
          공연 있음
        </span>
      </div>

      <div
        className={`event-calendar__overlay${modalDateKey ? " event-calendar__overlay--show" : ""}`}
        onClick={(e) => {
          if (e.target === e.currentTarget) setModalDateKey(null);
        }}
      >
        <div className="event-calendar__modal">
          <div className="event-calendar__modal-head">
            <div>
              <p className="event-calendar__modal-title">
                {viewMonth + 1}월 {modalDay}일
              </p>
              <p className="event-calendar__modal-sub">{modalEvents.length}개의 공연 일정</p>
            </div>
            <button
              type="button"
              className="event-calendar__modal-close"
              aria-label="닫기"
              onClick={() => setModalDateKey(null)}
            >
              ✕
            </button>
          </div>
          <div className="event-calendar__event-list">
            {modalEvents.map((event, idx) => (
              <button
                type="button"
                key={event.id}
                className="event-calendar__event-item"
                onClick={() => {
                  setModalDateKey(null);
                  navigate(`/program/event/${event.id}`);
                }}
              >
                <span
                  className="event-calendar__event-bar"
                  style={{ background: DOT_PALETTE[idx % DOT_PALETTE.length] }}
                />
                <span className="event-calendar__event-info">
                  <span className="event-calendar__event-name">{event.name}</span>
                  <span className="event-calendar__event-meta">
                    {formatEventDate(event.startDate)}
                    {event.venueName ? ` · ${event.venueName}` : ""}
                  </span>
                </span>
                <span className="event-calendar__event-chev">›</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default EventCalendar;
