// 로컬 타임존 기준 오늘 날짜를 "yyyy-MM-dd"로 반환한다.
// 백엔드 LocalDate가 같은 형식으로 직렬화되므로 문자열 비교로 날짜 전후를 판단할 수 있다.
export function todayIso() {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}
