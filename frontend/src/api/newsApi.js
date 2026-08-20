export async function getRecentNews() {
  const response = await fetch('/api/home/news')

  if (!response.ok) {
    const data = await response.json().catch(() => null)
    throw new Error(data?.message ?? '뉴스를 불러오지 못했습니다.')
  }

  return response.json()
}
