// iTunes Search API: 별도 API 키/인증 없이 브라우저에서 바로 호출 가능하고 CORS를 허용해서
// 곡 자동완성 + 앨범 커버 아트를 붙이는 용도로 사용한다.
// https://developer.apple.com/library/archive/documentation/AudioVideo/Conceptual/iTuneSearchAPI/
export async function searchSongs(query) {
  const trimmed = query.trim()
  if (!trimmed) {
    return []
  }

  const url = `https://itunes.apple.com/search?term=${encodeURIComponent(trimmed)}&entity=song&limit=6`
  const response = await fetch(url)
  if (!response.ok) {
    return []
  }

  const data = await response.json()
  return (data.results ?? []).map((track) => ({
    songTitle: track.trackName,
    artistName: track.artistName,
    // 100x100 썸네일을 600x600으로 업스케일
    albumCoverUrl: track.artworkUrl100 ? track.artworkUrl100.replace('100x100', '600x600') : null,
  }))
}
