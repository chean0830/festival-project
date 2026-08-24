import scheduleChangeImg from "../assets/news/schedule-change.svg";

export const NEWS_TYPE_ICON = {
  LINEUP: "🎤",
  SCHEDULE: "📢",
  NOTICE: "📢",
  PERFORMANCE: "🎪",
  MD: "🛍️",
  ARTIST: "🎵",
};

// 사진(imageUrl)이 없는 소식일 때 이모지 대신 보여줄 전용 일러스트. 타입별로 준비되는 대로 여기에 추가한다.
export const NEWS_TYPE_IMAGE = {
  SCHEDULE: scheduleChangeImg,
};
