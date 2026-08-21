// ISO datetime -> "방금 전" / "3시간 전" / "2일 전" / "3월 4일" 같은 상대 시간 문자열로 변환
export function relativeTime(dateString) {
  const date = new Date(dateString);
  const diffMs = Date.now() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);

  if (diffMin < 1) return "방금 전";
  if (diffMin < 60) return `${diffMin}분 전`;

  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour}시간 전`;

  const diffDay = Math.floor(diffHour / 24);
  if (diffDay < 7) return `${diffDay}일 전`;

  return `${date.getMonth() + 1}월 ${date.getDate()}일`;
}
