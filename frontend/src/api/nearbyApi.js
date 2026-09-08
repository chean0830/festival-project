export async function getNearbyPlaces(lat, lng) {
  const response = await fetch(`/api/home/nearby-places?lat=${lat}&lng=${lng}`)

  if (!response.ok) {
    const data = await response.json().catch(() => null)
    throw new Error(data?.message ?? '주변 정보를 불러오지 못했습니다.')
  }

  return response.json()
}
