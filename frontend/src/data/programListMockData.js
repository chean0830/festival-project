/**
 * 공연일정 페이지에서 카테고리 탭/필터링에 공통으로 쓰는 정의.
 * 실제 목록 데이터는 GET /api/home/events에서 받아온다.
 */

// 국내공연 / 내한공연 / 국내페스티벌 / 해외페스티벌 — 탭, 라우트, 필터링에서 공통으로 씀
export const CATEGORIES = [
  { key: "domestic-performance", label: "국내공연", region: "domestic", kind: "performance" },
  { key: "international-performance", label: "내한공연", region: "international", kind: "performance" },
  { key: "domestic-festival", label: "국내페스티벌", region: "domestic", kind: "festival" },
  { key: "international-festival", label: "해외페스티벌", region: "international", kind: "festival" },
];

/**
 * sortBy: "popularity"(인기순, 찜 수 내림차순) | "latest"(최신순, 날짜 빠른 순)
 * 원본 배열은 건드리지 않고 정렬된 새 배열을 반환한다.
 */
export function sortPrograms(items, sortBy) {
  const sorted = [...items];

  if (sortBy === "popularity" && sorted.every((item) => item.popularity !== undefined)) {
    return sorted.sort((a, b) => b.popularity - a.popularity);
  }

  return sorted.sort((a, b) => a.dateKey.localeCompare(b.dateKey));
}
