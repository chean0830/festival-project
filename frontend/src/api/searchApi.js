export const SEARCH_TYPE_LABEL = {
  artist: "아티스트",
  festival: "페스티벌",
  event: "공연",
}

export async function search(query) {
  const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`)

  if (!response.ok) {
    const data = await response.json().catch(() => null)
    throw new Error(data?.message ?? '검색 결과를 불러오지 못했습니다.')
  }

  return response.json()
}

// item.id는 "artist-5", "festival-4", "event-14"처럼 타입 접두사가 붙어서 오므로
// 뒤쪽 숫자만 뽑아서 상세 페이지 경로를 만든다.
export function getSearchResultPath(item) {
  const numericId = item.id.slice(item.id.lastIndexOf('-') + 1)
  return item.type === 'artist' ? `/artists/${numericId}` : `/program/event/${numericId}`
}
