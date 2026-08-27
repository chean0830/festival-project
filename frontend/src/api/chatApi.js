let csrfToken;
let csrfHeaderName = "X-XSRF-TOKEN";

async function ensureCsrfToken() {
  if (csrfToken) return;
  const response = await fetch("/api/auth/csrf", { credentials: "include" });
  if (!response.ok) {
    throw new Error("요청을 처리할 수 없습니다. 잠시 후 다시 시도해 주세요.");
  }
  const data = await response.json();
  csrfToken = data.token;
  csrfHeaderName = data.headerName;
}

async function postWithCsrf(path) {
  await ensureCsrfToken();
  const response = await fetch(path, {
    method: "POST",
    credentials: "include",
    headers: { [csrfHeaderName]: csrfToken },
  });

  if (!response.ok) {
    const data = await response.json().catch(() => null);
    throw new Error(data?.message ?? "요청 처리 중 오류가 발생했습니다.");
  }

  return response.json().catch(() => null);
}

export async function getChatRoomByEvent(eventId, memberId) {
  const query = memberId != null ? `?memberId=${memberId}` : "";
  const response = await fetch(`/api/chat-rooms/by-event/${eventId}${query}`, { credentials: "include" });

  if (!response.ok) {
    const data = await response.json().catch(() => null);
    throw new Error(data?.message ?? "채팅방을 불러오지 못했습니다.");
  }

  return response.json();
}

export async function getChatMessages(roomId) {
  const response = await fetch(`/api/chat-rooms/${roomId}/messages`, { credentials: "include" });

  if (!response.ok) {
    const data = await response.json().catch(() => null);
    throw new Error(data?.message ?? "메시지를 불러오지 못했습니다.");
  }

  return response.json();
}

export async function fetchMyOpenChatRooms(memberId) {
  const response = await fetch(`/api/members/${memberId}/chat-rooms`, { credentials: "include" });

  if (!response.ok) {
    const data = await response.json().catch(() => null);
    throw new Error(data?.message ?? "채팅방 목록을 불러오지 못했습니다.");
  }

  return response.json();
}

export async function getLatestChatMessage(roomId) {
  const response = await fetch(`/api/chat-rooms/${roomId}/messages/latest`, { credentials: "include" });
  if (!response.ok) return null;
  return response.json();
}

export function joinChatRoom(memberId, roomId) {
  return postWithCsrf(`/api/members/${memberId}/chat-rooms/${roomId}/join`);
}

export function leaveChatRoom(memberId, roomId) {
  return postWithCsrf(`/api/members/${memberId}/chat-rooms/${roomId}/leave`);
}

export function blockChatMember(memberId, roomId, targetMemberId) {
  return postWithCsrf(`/api/members/${memberId}/chat-rooms/${roomId}/block/${targetMemberId}`);
}

export async function reportChatMessage(memberId, messageId, reason) {
  await ensureCsrfToken();
  const response = await fetch(`/api/members/${memberId}/reports`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      [csrfHeaderName]: csrfToken,
    },
    body: JSON.stringify({ targetType: "MESSAGE", targetId: messageId, reason }),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => null);
    throw new Error(data?.message ?? "신고 처리 중 오류가 발생했습니다.");
  }
}
