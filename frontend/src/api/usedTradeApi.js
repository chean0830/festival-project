// mdShopApi.js와 동일한 방식(vite dev 서버의 /api 프록시 + 세션 쿠키)을 사용한다.
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

async function handleResponse(response) {
  if (response.status === 204) {
    return null
  }
  const data = await response.json().catch(() => null)
  if (!response.ok) {
    const message = data?.message || data?.error || '요청 처리 중 오류가 발생했습니다.'
    throw new Error(message)
  }
  return data
}

function getJson(path) {
  return fetch(path, { credentials: 'include' }).then(handleResponse)
}

async function postAction(path) {
  await ensureCsrfToken()
  return fetch(path, {
    method: 'POST',
    credentials: 'include',
    headers: { [csrfHeaderName]: csrfToken },
  }).then(handleResponse)
}

async function deleteAction(path) {
  await ensureCsrfToken()
  return fetch(path, {
    method: 'DELETE',
    credentials: 'include',
    headers: { [csrfHeaderName]: csrfToken },
  }).then(handleResponse)
}

export function fetchUsedListings({ category, tag, keyword, minPrice, maxPrice, onSaleOnly, sellerId, sort, page, size } = {}) {
  const params = new URLSearchParams()
  if (category) params.set('category', category)
  if (tag) params.set('tag', tag)
  if (keyword) params.set('keyword', keyword)
  if (minPrice != null && minPrice !== '') params.set('minPrice', minPrice)
  if (maxPrice != null && maxPrice !== '') params.set('maxPrice', maxPrice)
  if (onSaleOnly) params.set('onSaleOnly', 'true')
  if (sellerId != null) params.set('sellerId', sellerId)
  if (sort) params.set('sort', sort)
  if (page != null) params.set('page', page)
  if (size != null) params.set('size', size)
  const query = params.toString()
  return getJson(`/api/used/listings${query ? `?${query}` : ''}`)
}

export function fetchUsedListing(listingId) {
  return getJson(`/api/used/listings/${listingId}`)
}

export async function uploadUsedListingImage(memberId, file) {
  await ensureCsrfToken()
  const formData = new FormData()
  formData.append('file', file)
  return fetch(`/api/members/${memberId}/used/listings/image`, {
    method: 'POST',
    credentials: 'include',
    headers: { [csrfHeaderName]: csrfToken },
    body: formData,
  }).then(handleResponse)
}

export async function createUsedListing(memberId, payload) {
  await ensureCsrfToken()
  return fetch(`/api/members/${memberId}/used/listings`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      [csrfHeaderName]: csrfToken,
    },
    body: JSON.stringify(payload),
  }).then(handleResponse)
}

export function fetchMyUsedListings(memberId) {
  return getJson(`/api/members/${memberId}/used/listings`)
}

export async function updateUsedListing(memberId, listingId, payload) {
  await ensureCsrfToken()
  return fetch(`/api/members/${memberId}/used/listings/${listingId}`, {
    method: 'PUT',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      [csrfHeaderName]: csrfToken,
    },
    body: JSON.stringify(payload),
  }).then(handleResponse)
}

export function deleteUsedListing(memberId, listingId) {
  return deleteAction(`/api/members/${memberId}/used/listings/${listingId}`)
}

export async function changeUsedListingStatus(memberId, listingId, status) {
  await ensureCsrfToken()
  return fetch(`/api/members/${memberId}/used/listings/${listingId}/status`, {
    method: 'PATCH',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      [csrfHeaderName]: csrfToken,
    },
    body: JSON.stringify({ status }),
  }).then(handleResponse)
}

export function fetchLikeStatus(memberId, listingId) {
  return getJson(`/api/members/${memberId}/used/listings/${listingId}/like`)
}

export function likeUsedListing(memberId, listingId) {
  return postAction(`/api/members/${memberId}/used/listings/${listingId}/like`)
}

export function unlikeUsedListing(memberId, listingId) {
  return deleteAction(`/api/members/${memberId}/used/listings/${listingId}/like`)
}

export function fetchMyLikedUsedListings(memberId) {
  return getJson(`/api/members/${memberId}/used/likes`)
}

export function requestUsedPurchase(memberId, listingId) {
  return postAction(`/api/members/${memberId}/used/transactions/${listingId}`)
}

export function fetchMyPurchaseRequests(memberId) {
  return getJson(`/api/members/${memberId}/used/transactions/buying`)
}

export function fetchReceivedPurchaseRequests(memberId) {
  return getJson(`/api/members/${memberId}/used/transactions/selling`)
}

export async function confirmUsedTransactionPayment(memberId, transactionId, { paymentKey, orderId: tossOrderId, amount }) {
  await ensureCsrfToken()
  return fetch(`/api/members/${memberId}/used/transactions/${transactionId}/payments/confirm`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      [csrfHeaderName]: csrfToken,
    },
    body: JSON.stringify({ paymentKey, orderId: tossOrderId, amount }),
  }).then(handleResponse)
}

export function approveUsedTransaction(memberId, transactionId) {
  return postAction(`/api/members/${memberId}/used/transactions/${transactionId}/approve`)
}

export function completeUsedTransaction(memberId, transactionId) {
  return postAction(`/api/members/${memberId}/used/transactions/${transactionId}/complete`)
}

export function cancelUsedTransaction(memberId, transactionId) {
  return postAction(`/api/members/${memberId}/used/transactions/${transactionId}/cancel`)
}
