// authApi.js와 동일한 방식(vite dev 서버의 /api 프록시 + 세션 쿠키 + CSRF)을 사용한다.
let csrfToken
let csrfHeaderName = 'X-XSRF-TOKEN'

async function ensureCsrfToken() {
  if (csrfToken) {
    return
  }
  const response = await fetch('/api/auth/csrf', { credentials: 'include' })
  if (!response.ok) {
    throw new Error('요청을 처리할 수 없습니다. 잠시 후 다시 시도해 주세요.')
  }
  const data = await response.json()
  csrfToken = data.token
  csrfHeaderName = data.headerName
}

async function handleResponse(response, fallbackMessage) {
  if (response.status === 204) return null
  const data = await response.json().catch(() => null)
  if (!response.ok) {
    throw new Error(data?.message ?? fallbackMessage)
  }
  return data
}

function getJson(path, fallbackMessage) {
  return fetch(path, { credentials: 'include' }).then((response) => handleResponse(response, fallbackMessage))
}

async function mutateJson(path, method, body, fallbackMessage) {
  await ensureCsrfToken()
  return fetch(path, {
    method,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      [csrfHeaderName]: csrfToken,
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  }).then((response) => handleResponse(response, fallbackMessage))
}

export function getPosts({ category, keyword } = {}) {
  const params = new URLSearchParams()
  if (category) params.set('category', category)
  if (keyword) params.set('keyword', keyword)
  const query = params.toString()

  return getJson(`/api/posts${query ? `?${query}` : ''}`, '게시글 목록을 불러오지 못했습니다.')
}

export function getPost(postId, memberId) {
  const query = memberId ? `?memberId=${memberId}` : ''
  return getJson(`/api/posts/${postId}${query}`, '게시글을 불러오지 못했습니다.')
}

export function createPost(memberId, { category, title, content, imageUrl }) {
  return mutateJson(
    `/api/members/${memberId}/posts`,
    'POST',
    { category, title, content, imageUrl },
    '게시글을 등록하지 못했습니다.'
  )
}

export function updatePost(memberId, postId, { category, title, content, imageUrl }) {
  return mutateJson(
    `/api/members/${memberId}/posts/${postId}`,
    'PATCH',
    { category, title, content, imageUrl },
    '게시글을 수정하지 못했습니다.'
  )
}

export function deletePost(memberId, postId) {
  return mutateJson(`/api/members/${memberId}/posts/${postId}`, 'DELETE', undefined, '게시글을 삭제하지 못했습니다.')
}

export function likePost(memberId, postId) {
  return mutateJson(`/api/members/${memberId}/posts/${postId}/like`, 'POST', undefined, '좋아요 처리에 실패했습니다.')
}

export function unlikePost(memberId, postId) {
  return mutateJson(`/api/members/${memberId}/posts/${postId}/like`, 'DELETE', undefined, '좋아요 취소에 실패했습니다.')
}

export function getComments(postId) {
  return getJson(`/api/posts/${postId}/comments`, '댓글을 불러오지 못했습니다.')
}

export function createComment(memberId, postId, { content, parentId }) {
  return mutateJson(
    `/api/members/${memberId}/posts/${postId}/comments`,
    'POST',
    { content, parentId: parentId ?? null },
    '댓글을 등록하지 못했습니다.'
  )
}

export function deleteComment(memberId, postId, commentId) {
  return mutateJson(
    `/api/members/${memberId}/posts/${postId}/comments/${commentId}`,
    'DELETE',
    undefined,
    '댓글을 삭제하지 못했습니다.'
  )
}
