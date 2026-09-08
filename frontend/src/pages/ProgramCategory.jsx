import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Layout from "../components/common/Layout/Layout";
import ProgramCard from "../components/program/ProgramCard/ProgramCard";
import { CATEGORIES, sortPrograms } from "../data/programListMockData";
import { getUpcomingEvents, toProgramItem } from "../api/eventApi";
import "./ProgramCategory.css";

const SORT_OPTIONS = [
  { key: "latest", label: "최신" },
  { key: "popularity", label: "인기" },
];

/**
 * 카테고리 전용 페이지 (국내공연 / 내한공연 / 국내페스티벌 / 해외페스티벌)
 * 공연일정 페이지 위쪽 탭을 누르면 여기로 온다.
 * 목록은 GET /api/home/events로 받아온 실제 DB 데이터를 씀.
 * 정렬(최신/인기)은 개요 페이지(Program.jsx)와 동일하게 지원한다.
 */
function ProgramCategory() {
  const { category: categoryKey } = useParams();
  const category = CATEGORIES.find((c) => c.key === categoryKey);
  const [allItems, setAllItems] = useState([]);
  const [sortBy, setSortBy] = useState("latest");

  useEffect(() => {
    let cancelled = false;

    getUpcomingEvents()
      .then((events) => {
        if (!cancelled) setAllItems(events.map(toProgramItem));
      })
      .catch(() => {
        if (!cancelled) setAllItems([]);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (!category) {
    return (
      <Layout>
        <section className="program-category-page">
          <p>존재하지 않는 카테고리예요.</p>
          <Link to="/program" className="program-category-page__back">
            ‹ 공연일정으로 돌아가기
          </Link>
        </section>
      </Layout>
    );
  }

  const filtered = allItems.filter(
    (item) => item.region === category.region && item.kind === category.kind
  );
  const items = sortPrograms(filtered, sortBy);

  return (
    <Layout>
      <section className="program-category-page">
        <Link to="/program" className="program-category-page__back">
          ‹ 공연일정
        </Link>

        <div className="program-category-page__header">
          <h1>{category.label}</h1>

          <div className="program-category-page__sort">
            {SORT_OPTIONS.map((option) => (
              <button
                key={option.key}
                type="button"
                className={`program-category-page__sort-btn${
                  sortBy === option.key ? " program-category-page__sort-btn--active" : ""
                }`}
                onClick={() => setSortBy(option.key)}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div className="program-category-page__grid">
          {items.map((item) => (
            <ProgramCard key={item.id} item={item} />
          ))}
        </div>
      </section>
    </Layout>
  );
}

export default ProgramCategory;
