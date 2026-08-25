const STORAGE_PREFIX = "festlog:chat:lastSeen:";

export function getLastSeenAt(roomId) {
  try {
    return localStorage.getItem(`${STORAGE_PREFIX}${roomId}`);
  } catch {
    return null;
  }
}

export function markChatSeen(roomId, isoTimestamp) {
  try {
    localStorage.setItem(`${STORAGE_PREFIX}${roomId}`, isoTimestamp ?? new Date().toISOString());
  } catch {
    // localStorage 접근 불가(프라이빗 모드 등) — 배지가 계속 뜨는 정도라 무시해도 됨
  }
}

export function hasUnseenMessage(roomId, latestMessage) {
  if (!latestMessage) return false;
  const lastSeen = getLastSeenAt(roomId);
  if (!lastSeen) return true;
  return new Date(latestMessage.createdAt).getTime() > new Date(lastSeen).getTime();
}
