import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Layout from "../components/common/Layout/Layout";
import ProgramCard from "../components/program/ProgramCard/ProgramCard";
import { CATEGORIES, sortPrograms } from "../data/programListMockData";
import { getUpcomingEvents, toProgramItem } from "../api/eventApi";
import "./Program.css";

const SORT_OPTIONS = [
  { key: "latest", label: "최신" },
  { key: "popularity", label: "인기" },
];

const PREVIEW_COUNT = 3;

function previewByCategory(items, category, sortBy) {
  const filtered = items.filter(
    (item) => item.region === category.region && item.kind === category.kind
  );
  return sortPrograms(filtered, sortBy).slice(0, PREVIEW_COUNT);
}

/**
 * 공연일정 메인 개요 페이지
 * - 오른쪽 위: 캘린더 링크 + 최신/인기 정렬
 * - 탭 4개: 누르면 해당 카테고리 전용 페이지로 이동
 * - 아래: 국내공연/내한공연/국내페스티벌/해외페스티벌 2x2 그리드로 미리보기 카드
 *
 * 목록은 GET /api/home/events로 받아온 실제 DB 데이터를 씀.
 * (인기순 정렬은 아직 DB에 인기도 데이터가 없어서 실질적으로는 최신순과 동일하게 동작함)
 */
function Program() {
  const [sortBy, setSortBy] = useState("latest");
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

  return (
    <Layout>
      <section className="program-page">
        <div className="program-page__header">
          <h1>공연일정</h1>
        </div>

        <nav className="program-page__tabs">
          <div className="program-page__tab-list">
            {CATEGORIES.map((category) => (
              <Link
                key={category.key}
                to={`/program/${category.key}`}
                className="program-page__tab"
              >
                {category.label}
              </Link>
            ))}
          </div>

          <Link to="/program/calendar" className="program-page__calendar-link">
            <span aria-hidden="true">📅</span> 캘린더
          </Link>
        </nav>

        <div className="program-page__sort">
          {SORT_OPTIONS.map((option) => (
            <button
              key={option.key}
              type="button"
              className={`program-page__sort-btn${
                sortBy === option.key ? " program-page__sort-btn--active" : ""
              }`}
              onClick={() => setSortBy(option.key)}
            >
              {option.label}
            </button>
          ))}
        </div>

        <div className="program-page__grid">
          {CATEGORIES.map((category) => (
            <div key={category.key} className="program-page__group">
              <Link
                to={`/program/${category.key}`}
                className="program-page__group-label"
              >
                <span className="program-page__group-dot" />
                {category.label}
              </Link>
              <div className="program-page__cards">
                {previewByCategory(items, category, sortBy).map((item) => (
                  <ProgramCard key={item.id} item={item} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </Layout>
  );
}

export default Program;
