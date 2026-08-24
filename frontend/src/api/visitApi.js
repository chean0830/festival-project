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

export async function checkInEvent(memberId, { eventId, latitude, longitude }) {
  await ensureCsrfToken();
  const response = await fetch(`/api/members/${memberId}/visits/check-in`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      [csrfHeaderName]: csrfToken,
    },
    body: JSON.stringify({ eventId, latitude, longitude }),
  });

  const data = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(data?.message ?? "체크인에 실패했습니다.");
  }
  return data;
}

export async function getVisitPins(memberId) {
  const response = await fetch(`/api/members/${memberId}/visits/map`, { credentials: "include" });

  if (!response.ok) {
    const data = await response.json().catch(() => null);
    throw new Error(data?.message ?? "방문 기록을 불러오지 못했습니다.");
  }

  return response.json();
}
