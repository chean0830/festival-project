import { useEffect, useState } from "react";
import { getUpcomingEvents } from "../../../api/eventApi";
import "./EventCalendar.css";

/**
 * 공연 캘린더 (월 단위)
 * - 이전/다음 달 이동
 * - 공연 있는 날짜에 점(dot) 표시
 * - 그 날짜에 마우스를 올리면(hover) 그 날 공연 목록이 툴팁으로 뜸
 * - GET /api/home/events로 받아온 실제 DB 데이터를 날짜별로 묶어서 씀
 */

// events를 날짜(dateKey)별로 묶는다. start~end 사이 모든 날짜에 표시한다.
function buildEventsByDate(events) {
  const map = {};

  events.forEach((event) => {
    const cursor = new Date(event.startDate);
    const end = new Date(event.endDate);

    while (cursor <= end) {
      const key = toDateKey(cursor.getFullYear(), cursor.getMonth(), cursor.getDate());
      (map[key] ??= []).push({ id: event.id, name: event.name });
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
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [hoveredDateKey, setHoveredDateKey] = useState(null);
  const [eventsByDate, setEventsByDate] = useState({});

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

  const hoveredEvents = hoveredDateKey ? eventsByDate[hoveredDateKey] ?? [] : [];

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
        {WEEKDAY_LABELS.map((label) => (
          <span key={label}>{label}</span>
        ))}
      </div>

      <div className="event-calendar__grid">
        {cells.map((cell, index) => {
          const events = cell.dateKey ? eventsByDate[cell.dateKey] ?? [] : [];
          const hasEvents = events.length > 0;

          return (
            <div
              key={index}
              className={[
                "event-calendar__cell",
                !cell.inCurrentMonth && "event-calendar__cell--muted",
                cell.dateKey === todayKey && "event-calendar__cell--today",
                hasEvents && "event-calendar__cell--has-events",
              ]
                .filter(Boolean)
                .join(" ")}
              onMouseEnter={() => hasEvents && setHoveredDateKey(cell.dateKey)}
              onMouseLeave={() => setHoveredDateKey(null)}
            >
              {cell.inCurrentMonth && (
                <span className="event-calendar__day">{cell.day}</span>
              )}
              {hasEvents && <span className="event-calendar__dot" />}

              {hoveredDateKey === cell.dateKey && (
                <div className="event-calendar__tooltip">
                  {hoveredEvents.map((event) => (
                    <p key={event.id} className="event-calendar__tooltip-item">
                      {event.name}
                    </p>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default EventCalendar;