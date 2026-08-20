export async function getEventDetail(eventId) {
  const response = await fetch(`/api/home/events/${eventId}`)

  if (!response.ok) {
    const data = await response.json().catch(() => null)
    throw new Error(data?.message ?? '공연 정보를 불러오지 못했습니다.')
  }

  return response.json()
}
