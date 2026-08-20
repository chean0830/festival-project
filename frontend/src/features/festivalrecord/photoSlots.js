// 사진 순서(= 책 페이지 순서)가 그대로 어느 페이지에 쓰이는지를 결정한다.
// 1번째: 대표(공연 정보) 페이지, 2번째: 들은 노래 페이지, 3번째: 먹은 음식 페이지, 이후: 사진 갤러리 페이지.
// FestivalRecordBookPage의 EventInfoContent/SongsContent/FoodMemoContent가 이 순서를 그대로 읽는다.
export function photoSlotLabel(index) {
  if (index === 0) return '대표'
  if (index === 1) return '노래'
  if (index === 2) return '음식'
  return '갤러리'
}
