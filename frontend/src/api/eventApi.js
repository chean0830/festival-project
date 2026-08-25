const WEEKDAY_LABEL = ['일', '월', '화', '수', '목', '금', '토']

export function formatEventDate(dateStr) {
  const date = new Date(dateStr)
  return `${date.getMonth() + 1}/${date.getDate()} (${WEEKDAY_LABEL[date.getDay()]})`
}

// EventSummaryDto -> ProgramCard/캐러셀에서 쓰는 item 모양으로 변환
export function toProgramItem(event) {
  return {
    id: event.id,
    name: event.name,
    time: formatEventDate(event.startDate),
    dateKey: event.startDate,
    poster: event.posterImage,
    region: event.region,
    kind: event.kind,
    popularity: event.popularity,
    genres: event.genres ?? [],
  }
}

export async function getUpcomingEvents() {
  const response = await fetch('/api/home/events')

  if (!response.ok) {
    const data = await response.json().catch(() => null)
    throw new Error(data?.message ?? '공연 목록을 불러오지 못했습니다.')
  }

  return response.json()
}

export async function getEventDetail(eventId) {
  const response = await fetch(`/api/home/events/${eventId}`)

  if (!response.ok) {
    const data = await response.json().catch(() => null)
    throw new Error(data?.message ?? '공연 정보를 불러오지 못했습니다.')
  }

  return response.json()
}

export async function getEventLineup(eventId) {
  const response = await fetch(`/api/home/events/${eventId}/lineup`)

  if (!response.ok) {
    const data = await response.json().catch(() => null)
    throw new Error(data?.message ?? '라인업 정보를 불러오지 못했습니다.')
  }

  return response.json()
}

export async function getEventWeather(eventId) {
  const response = await fetch(`/api/home/events/${eventId}/weather`)

  if (!response.ok) {
    const data = await response.json().catch(() => null)
    throw new Error(data?.message ?? '날씨 정보를 불러오지 못했습니다.')
  }

  return response.json()
}

export async function getEventNews(eventId) {
  const response = await fetch(`/api/home/events/${eventId}/news`)

  if (!response.ok) {
    const data = await response.json().catch(() => null)
    throw new Error(data?.message ?? '공연 소식을 불러오지 못했습니다.')
  }

  return response.json()
}
