import { useEffect, useState } from 'react'
import { getCurrentMember } from '../../../api/authApi'

/**
 * 로그인한 사용자 정보를 가져온다.
 * member === undefined : 조회 중
 * member === null      : 로그인 안 됨
 * member === {...}     : 로그인된 사용자
 */
export default function useCurrentMember() {
  const [member, setMember] = useState(undefined)

  useEffect(() => {
    let cancelled = false

    getCurrentMember()
      .then((data) => {
        if (!cancelled) setMember(data)
      })
      .catch(() => {
        if (!cancelled) setMember(null)
      })

    return () => {
      cancelled = true
    }
  }, [])

  return member
}
