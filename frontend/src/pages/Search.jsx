import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import Layout from "../components/common/Layout/Layout";
import { SEARCH_TYPE_LABEL, search } from "../api/searchApi";
import "./Search.css";

// 결과를 어떤 순서로 묶어서 보여줄지
const SECTION_TYPES = ["artist", "festival", "event"];

function Search() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") ?? "";
  const [results, setResults] = useState([]);

  useEffect(() => {
    let cancelled = false;

    if (!query.trim()) {
      setResults([]);
      return undefined;
    }

    search(query)
      .then((data) => {
        if (!cancelled) setResults(data);
      })
      .catch(() => {
        if (!cancelled) setResults([]);
      });

    return () => {
      cancelled = true;
    };
  }, [query]);

  return (
    <Layout>
      <section className="search-page">
        <h1 className="search-page__title">'{query}' 검색 결과</h1>

        {results.length === 0 ? (
          <p className="search-page__empty">
            '{query}'에 대한 검색결과가 없어요
          </p>
        ) : (
          SECTION_TYPES.map((type) => {
            const items = results.filter((item) => item.type === type);
            if (items.length === 0) return null;

            return (
              <div key={type} className="search-page__section">
                <h2 className="search-page__section-title">
                  {SEARCH_TYPE_LABEL[type]}
                </h2>
                <ul className="search-page__list">
                  {items.map((item) => (
                    <li key={item.id} className="search-page__item">
                      <span className="search-page__item-thumb">
                        {item.image && <img src={item.image} alt="" />}
                      </span>
                      <span className="search-page__item-name">{item.name}</span>
                      <span className="search-page__item-subtitle">
                        {item.subtitle}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })
        )}
      </section>
    </Layout>
  );
}

export default Search;
