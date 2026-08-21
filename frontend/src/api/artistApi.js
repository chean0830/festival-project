export async function getArtist(artistId) {
  const response = await fetch(`/api/artists/${artistId}`)

  if (!response.ok) {
    const data = await response.json().catch(() => null)
    throw new Error(data?.message ?? '아티스트 정보를 불러오지 못했습니다.')
  }

  return response.json()
}
