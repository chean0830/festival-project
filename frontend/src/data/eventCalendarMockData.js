/**
 * 공연 캘린더 mock 데이터
 * 실제 공연 일정 API가 붙기 전까지, 날짜별 공연 목록을 이 데이터에서 찾아서 보여준다.
 * 나중에 API가 준비되면 getEventsByDate() 내부만 fetch 호출로 바꾸면 된다.
 */

const EVENTS_BY_DATE = {
  "2026-08-29": [
    { id: "cal-1", name: "OO 페스티벌 1일차", time: "18:00" },
  ],
  "2026-08-30": [
    { id: "cal-2", name: "OO 페스티벌 2일차", time: "19:30" },
    { id: "cal-3", name: "펜타포트 락 페스티벌 - 메인스테이지", time: "18:00" },
  ],
  "2026-08-31": [
    { id: "cal-4", name: "OO 페스티벌 3일차", time: "21:00" },
    { id: "cal-5", name: "그린플러그드 서울 - 잔디마당 공연", time: "17:00" },
  ],
  "2026-09-05": [
    { id: "cal-6", name: "자라섬 재즈페스티벌 1일차", time: "17:00" },
  ],
  "2026-09-06": [
    { id: "cal-7", name: "자라섬 재즈페스티벌 2일차", time: "17:00" },
  ],
};

/**
 * "YYYY-MM-DD" 형태의 날짜 키로 그 날의 공연 목록을 반환한다. 없으면 빈 배열.
 */
export function getEventsByDate(dateKey) {
  return EVENTS_BY_DATE[dateKey] ?? [];
}