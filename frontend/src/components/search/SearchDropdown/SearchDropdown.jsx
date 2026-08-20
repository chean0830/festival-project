import { SEARCH_TYPE_LABEL } from "../../../api/searchApi";
import "./SearchDropdown.css";

/**
 * 헤더 검색창 아래에 뜨는 실시간 미리보기 드롭다운
 * - results: 최대 6개까지만 잘라서 보여줌
 * - 항목 클릭 시 onSelect(item), 맨 아래 "전체 결과 보기" 클릭 시 onViewAll()
 */

const MAX_VISIBLE = 6;

function SearchDropdown({ results, query, onSelect, onViewAll }) {
  const visibleResults = results.slice(0, MAX_VISIBLE);

  return (
    <div className="search-dropdown">
      {visibleResults.length === 0 ? (
        <p className="search-dropdown__empty">검색 결과가 없어요</p>
      ) : (
        <ul className="search-dropdown__list">
          {visibleResults.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                className="search-dropdown__item"
                onClick={() => onSelect(item)}
              >
                <span className="search-dropdown__item-thumb">
                  {item.image && <img src={item.image} alt="" />}
                </span>
                <span
                  className={`search-dropdown__item-type search-dropdown__item-type--${item.type}`}
                >
                  {SEARCH_TYPE_LABEL[item.type]}
                </span>
                <span className="search-dropdown__item-name">{item.name}</span>
                <span className="search-dropdown__item-subtitle">
                  {item.subtitle}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}

      <button
        type="button"
        className="search-dropdown__view-all"
        onClick={onViewAll}
      >
        '{query}' 전체 결과 보기 ›
      </button>
    </div>
  );
}

export default SearchDropdown;