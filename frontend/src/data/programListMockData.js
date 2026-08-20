/**
 * 공연일정 페이지의 mock 데이터
 * 실제 공연 API가 붙기 전까지 여기서 카테고리별로 걸러서 보여준다.
 * eventCalendarMockData.js의 날짜들과 겹치게 만들어 놨음 — 나중에는 결국
 * 같은 공연 데이터 소스(백엔드 Event/EventSchedule)에서 나올 값들이라서.
 */

// 국내공연 / 내한공연 / 국내페스티벌 / 해외페스티벌 — 탭, 라우트, 필터링에서 공통으로 씀
export const CATEGORIES = [
  { key: "domestic-performance", label: "국내공연", region: "domestic", kind: "performance" },
  { key: "international-performance", label: "내한공연", region: "international", kind: "performance" },
  { key: "domestic-festival", label: "국내페스티벌", region: "domestic", kind: "festival" },
  { key: "international-festival", label: "해외페스티벌", region: "international", kind: "festival" },
];

export const PROGRAM_ITEMS = [
  // 국내공연
  { id: 1, name: "선우정아 단독 콘서트", time: "8/29 (토) 19:00", dateKey: "2026-08-29", popularity: 82, region: "domestic", kind: "performance" },
  { id: 2, name: "잔나비 전국투어 - 서울", time: "8/30 (일) 19:30", dateKey: "2026-08-30", popularity: 95, region: "domestic", kind: "performance" },
  { id: 3, name: "혁오 단독 콘서트", time: "8/31 (월) 20:00", dateKey: "2026-08-31", popularity: 67, region: "domestic", kind: "performance" },
  { id: 4, name: "데이식스 앙코르 콘서트", time: "9/5 (토) 18:00", dateKey: "2026-09-05", popularity: 74, region: "domestic", kind: "performance" },

  // 내한공연
  { id: 5, name: "콜드플레이 내한공연", time: "8/30 (일) 18:00", dateKey: "2026-08-30", popularity: 120, region: "international", kind: "performance" },
  { id: 6, name: "포스트 말론 내한공연", time: "8/31 (월) 19:00", dateKey: "2026-08-31", popularity: 88, region: "international", kind: "performance" },
  { id: 7, name: "두아 리파 내한공연", time: "9/6 (일) 19:00", dateKey: "2026-09-06", popularity: 101, region: "international", kind: "performance" },

  // 국내페스티벌
  { id: 8, name: "펜타포트 락 페스티벌 - 메인스테이지", time: "8/30 (일) 18:00", dateKey: "2026-08-30", popularity: 92, region: "domestic", kind: "festival" },
  { id: 9, name: "그린플러그드 서울 - 잔디마당 공연", time: "8/31 (월) 17:00", dateKey: "2026-08-31", popularity: 78, region: "domestic", kind: "festival" },
  { id: 10, name: "자라섬 재즈페스티벌 1일차", time: "9/5 (토) 17:00", dateKey: "2026-09-05", popularity: 58, region: "domestic", kind: "festival" },
  { id: 11, name: "부산국제록페스티벌", time: "9/6 (일) 16:00", dateKey: "2026-09-06", popularity: 63, region: "domestic", kind: "festival" },

  // 해외페스티벌
  { id: 12, name: "코첼라 밸리 뮤직 페스티벌", time: "4/10 (금) 12:00", dateKey: "2027-04-10", popularity: 150, region: "international", kind: "festival" },
  { id: 13, name: "글래스톤베리 페스티벌", time: "6/24 (목) 12:00", dateKey: "2027-06-24", popularity: 140, region: "international", kind: "festival" },
  { id: 14, name: "프라이머베라 사운드", time: "5/29 (토) 15:00", dateKey: "2027-05-29", popularity: 96, region: "international", kind: "festival" },
];

/**
 * category.key를 기준으로 해당 카테고리의 항목만 골라서 반환한다.
 */
export function getItemsByCategory(category) {
  return PROGRAM_ITEMS.filter(
    (item) => item.region === category.region && item.kind === category.kind
  );
}

/**
 * sortBy: "popularity"(인기순, 내림차순) | "latest"(최신순, 날짜 빠른 순)
 * 원본 배열은 건드리지 않고 정렬된 새 배열을 반환한다.
 */
export function sortPrograms(items, sortBy) {
  const sorted = [...items];

  if (sortBy === "popularity") {
    return sorted.sort((a, b) => b.popularity - a.popularity);
  }

  return sorted.sort((a, b) => a.dateKey.localeCompare(b.dateKey));
}

/**
 * 국내/해외 페스티벌 중 인기도(popularity) 기준 상위 count개를 반환한다.
 */
export function getTopFestivals(count) {
  const festivals = PROGRAM_ITEMS.filter((item) => item.kind === "festival");
  return sortPrograms(festivals, "popularity").slice(0, count);
}

/**
 * 날짜(dateKey)가 가장 빠른 순으로 상위 count개를 반환한다.
 */
export function getUpcomingItems(count) {
  return sortPrograms(PROGRAM_ITEMS, "latest").slice(0, count);
}
