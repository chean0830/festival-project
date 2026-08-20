/**
 * 검색 mock 데이터
 * 실제 검색 API가 붙기 전까지 아티스트/페스티벌/공연을 이 배열에서 찾아서 보여준다.
 * 나중에 백엔드 API가 준비되면 searchItems() 내부만 fetch 호출로 바꾸면 된다.
 */

export const SEARCH_ITEMS = [
  { id: "artist-1", type: "artist", name: "아이유", subtitle: "가수" },
  { id: "artist-2", type: "artist", name: "데이식스", subtitle: "밴드" },
  { id: "artist-3", type: "artist", name: "잔나비", subtitle: "밴드" },
  { id: "artist-4", type: "artist", name: "혁오", subtitle: "밴드" },
  { id: "artist-5", type: "artist", name: "선우정아", subtitle: "가수" },
  { id: "festival-1", type: "festival", name: "그린플러그드 서울", subtitle: "페스티벌" },
  { id: "festival-2", type: "festival", name: "펜타포트 락 페스티벌", subtitle: "페스티벌" },
  { id: "festival-3", type: "festival", name: "부산국제록페스티벌", subtitle: "페스티벌" },
  { id: "festival-4", type: "festival", name: "자라섬 재즈페스티벌", subtitle: "페스티벌" },
  { id: "event-1", type: "event", name: "OO 페스티벌 1일차", subtitle: "8/29 (토) 18:00" },
  { id: "event-2", type: "event", name: "OO 페스티벌 2일차", subtitle: "8/29 (토) 19:30" },
  { id: "event-3", type: "event", name: "OO 페스티벌 3일차", subtitle: "8/29 (토) 21:00" },
  { id: "event-4", type: "event", name: "펜타포트 락 페스티벌 - 메인스테이지", subtitle: "8/30 (일) 18:00" },
  { id: "event-5", type: "event", name: "그린플러그드 서울 - 잔디마당 공연", subtitle: "8/31 (월) 17:00" },
];

export const SEARCH_TYPE_LABEL = {
  artist: "아티스트",
  festival: "페스티벌",
  event: "공연",
};

/**
 * query와 name/subtitle이 대소문자 구분 없이 부분일치하는 항목을 찾는다.
 */
export function searchItems(query) {
  const trimmed = query.trim().toLowerCase();
  if (!trimmed) return [];

  return SEARCH_ITEMS.filter(
    (item) =>
      item.name.toLowerCase().includes(trimmed) ||
      item.subtitle.toLowerCase().includes(trimmed)
  );
}
