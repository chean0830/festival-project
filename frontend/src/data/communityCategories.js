// post.category 값과 화면 표시 라벨/포인트 컬러 매핑.
// REVIEW(공연후기)는 공연 후기뿐 아니라 앨범/굿즈 리뷰까지 포괄해서 씀.
// EVENT(이벤트), TRANSFER(양도)는 DB festival.sql의 COMMENT에는 없지만
// category 컬럼이 VARCHAR라 자유롭게 추가 가능해서 새로 씀.
export const COMMUNITY_CATEGORIES = [
  { key: "REVIEW", label: "공연후기", color: "#1e9e52" },
  { key: "COMPANION", label: "동행", color: "#ff8a3d" },
  { key: "QUESTION", label: "질문", color: "#3a7bd5" },
  { key: "INFORMATION", label: "정보", color: "#1e9e52" },
  { key: "EVENT", label: "이벤트", color: "#e6516b" },
  { key: "TRANSFER", label: "양도", color: "#9b6fe0" },
  { key: "FREE", label: "자유게시판", color: "#7a8a80" },
];

export function categoryLabel(categoryKey) {
  return COMMUNITY_CATEGORIES.find((c) => c.key === categoryKey)?.label ?? categoryKey;
}

export function categoryColor(categoryKey) {
  return COMMUNITY_CATEGORIES.find((c) => c.key === categoryKey)?.color ?? "#6b6879";
}
