import Layout from "../components/common/Layout/Layout";
import EventCalendar from "../components/home/EventCalendar/EventCalendar";
import { getTopFestivals, getUpcomingItems } from "../data/programListMockData";
import "./ProgramCalendar.css";

const TOP_FESTIVAL_COUNT = 4;
const UPCOMING_COUNT = 3;

/**
 * 공연 캘린더 전용 페이지
 * 공연일정 페이지 오른쪽 위 "캘린더" 링크를 누르면 여기로 온다.
 */
function ProgramCalendar() {
  const topFestivals = getTopFestivals(TOP_FESTIVAL_COUNT);
  const upcomingItems = getUpcomingItems(UPCOMING_COUNT);

  return (
    <Layout>
      <section className="program-calendar-page">
        <h1>공연 캘린더</h1>

        <div className="program-calendar-page__lower">
          <div className="program-calendar-page__calendar">
            <EventCalendar />
            <div className="program-calendar-page__legend">
              <span className="program-calendar-page__legend-item">
                <span className="program-calendar-page__legend-dot program-calendar-page__legend-dot--today" />
                오늘
              </span>
              <span className="program-calendar-page__legend-item">
                <span className="program-calendar-page__legend-dot program-calendar-page__legend-dot--event" />
                공연 있음
              </span>
            </div>
          </div>

          <div className="program-calendar-page__side">
            <div className="program-calendar-page__hot">
              <h3 className="program-calendar-page__hot-title">
                인기 페스티벌 <span aria-hidden="true">🔥</span>
              </h3>
              <ul className="program-calendar-page__hot-list">
                {topFestivals.map((festival, index) => (
                  <li key={festival.id} className="program-calendar-page__hot-item">
                    <span className="program-calendar-page__hot-rank">{index + 1}</span>
                    {festival.name}
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
                    <span className="program-calendar-page__hot-item-name">{item.name}</span>
                    <span className="program-calendar-page__hot-item-time">{item.time}</span>
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
