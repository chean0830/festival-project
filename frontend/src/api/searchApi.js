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
