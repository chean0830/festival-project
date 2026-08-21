import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Layout from "../components/common/Layout/Layout";
import EventCalendar from "../components/home/EventCalendar/EventCalendar";
import { getUpcomingEvents, toProgramItem } from "../api/eventApi";
import "./ProgramCalendar.css";

const TOP_FESTIVAL_COUNT = 4;
const UPCOMING_COUNT = 3;

/**
 * 공연 캘린더 전용 페이지
 * 공연일정 페이지 오른쪽 위 "캘린더" 링크를 누르면 여기로 온다.
 * 인기 페스티벌 / 다가오는 공연 목록은 GET /api/home/events로 받아온 실제 DB 데이터를 씀.
 * (인기 페스티벌은 DB에 인기도 데이터가 없어서, 페스티벌 중 최신순 상위 N개를 보여줌)
 */
function ProgramCalendar() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    let cancelled = false;

    getUpcomingEvents()
      .then((events) => {
        if (!cancelled) setItems(events.map(toProgramItem));
      })
      .catch(() => {
        if (!cancelled) setItems([]);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const topFestivals = items
    .filter((item) => item.kind === "festival")
    .slice(0, TOP_FESTIVAL_COUNT);
  const upcomingItems = items.slice(0, UPCOMING_COUNT);

  return (
    <Layout>
      <section className="program-calendar-page">
        <h1>공연 캘린더</h1>

        <div className="program-calendar-page__lower">
          <div className="program-calendar-page__calendar">
            <EventCalendar />
          </div>

          <div className="program-calendar-page__side">
            <div className="program-calendar-page__hot">
              <h3 className="program-calendar-page__hot-title">
                인기 페스티벌 <span aria-hidden="true">🔥</span>
              </h3>
              <ul className="program-calendar-page__hot-list">
                {topFestivals.map((festival, index) => (
                  <li key={festival.id} className="program-calendar-page__hot-item">
                    <Link
                      to={`/program/event/${festival.id}`}
                      className="program-calendar-page__hot-link"
                    >
                      <span className="program-calendar-page__hot-rank">{index + 1}</span>
                      {festival.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="program-calendar-page__hot">
              <h3 className="program-calendar-page__hot-title program-calendar-page__hot-title--nudge">
                다가오는 공연
              </h3>
              <ul className="program-calendar-page__hot-list">
                {upcomingItems.map((item) => (
                  <li key={item.id} className="program-calendar-page__hot-item">
                    <Link
                      to={`/program/event/${item.id}`}
                      className="program-calendar-page__hot-link"
                    >
                      <span className="program-calendar-page__hot-item-name">{item.name}</span>
                      <span className="program-calendar-page__hot-item-time">{item.time}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}

export default ProgramCalendar;
