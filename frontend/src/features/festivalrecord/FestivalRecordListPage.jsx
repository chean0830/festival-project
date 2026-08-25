import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import Layout from '../../components/common/Layout/Layout'
import useCurrentMember from '../profile/hooks/useCurrentMember'
import RequireLogin from '../profile/components/RequireLogin'
import { fetchFestivalRecords } from './api/festivalRecordApi'
import RecordCard from './components/RecordCard'
import './festivalrecord.css'

const SORT_OPTIONS = [
  { key: 'latest', label: '최신순' },
  { key: 'oldest', label: '오래된순' },
  { key: 'rating', label: '별점순' },
]

export default function FestivalRecordListPage() {
  const currentMember = useCurrentMember()
  const memberId = currentMember?.memberId
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(null)
  const [search, setSearch] = useState('')
  const [sortKey, setSortKey] = useState('latest')
  const [year, setYear] = useState('all')

  useEffect(() => {
    if (!memberId) {
      return undefined
    }
    let cancelled = false

    fetchFestivalRecords(memberId)
      .then((data) => {
        if (!cancelled) setRecords(data)
      })
      .catch((err) => {
        if (!cancelled) setLoadError(err.message)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [memberId])

  const years = useMemo(() => {
    const set = new Set(records.map((record) => new Date(record.createdAt).getFullYear()))
    return Array.from(set).sort((a, b) => b - a)
  }, [records])

  const visibleRecords = useMemo(() => {
    const keyword = search.trim().toLowerCase()

    const filtered = records.filter((record) => {
      const matchesKeyword =
        !keyword ||
        (record.title || '').toLowerCase().includes(keyword) ||
        (record.eventName || '').toLowerCase().includes(keyword)
      const matchesYear = year === 'all' || new Date(record.createdAt).getFullYear() === Number(year)
      return matchesKeyword && matchesYear
    })

    const sorted = [...filtered]
    if (sortKey === 'latest') {
      sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    } else if (sortKey === 'oldest') {
      sorted.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
    } else if (sortKey === 'rating') {
      sorted.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))
    }
    return sorted
  }, [records, search, sortKey, year])

  if (currentMember === undefined) {
    return (
      <Layout>
        <div className="record-page">확인 중입니다...</div>
      </Layout>
    )
  }

  if (currentMember === null) {
    return <RequireLogin />
  }

  return (
    <Layout>
      <div className="record-page">
        <div className="record-content">
          <div className="record-header-row">
            <h1>나의 페스티벌 기록</h1>
            <Link to="/festival-log/new" className="record-btn-primary">
              + 기록 작성
            </Link>
          </div>

          {loading && <p>기록을 불러오는 중입니다...</p>}
          {loadError && <p className="record-error-text">기록을 불러오지 못했습니다: {loadError}</p>}

          {!loading && !loadError && records.length === 0 && (
            <p className="record-empty-text">아직 작성한 페스티벌 기록이 없습니다.</p>
          )}

          {!loading && !loadError && records.length > 0 && (
            <>
              <div className="record-list-toolbar">
                <input
                  type="text"
                  className="record-list-search"
                  placeholder="제목 또는 공연명 검색"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <select value={year} onChange={(e) => setYear(e.target.value)}>
                  <option value="all">전체 연도</option>
                  {years.map((y) => (
                    <option key={y} value={y}>
                      {y}년
                    </option>
                  ))}
                </select>
                <select value={sortKey} onChange={(e) => setSortKey(e.target.value)}>
                  {SORT_OPTIONS.map((option) => (
                    <option key={option.key} value={option.key}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {visibleRecords.length === 0 ? (
                <p className="record-empty-text">조건에 맞는 기록이 없어요.</p>
              ) : (
                <div className="record-grid">
                  {visibleRecords.map((record) => (
                    <RecordCard key={record.recordId} record={record} />
                  ))}
                </div>
              )}
            </>
          )}

          {!loading && !loadError && (
            <div className="record-bottom-cta">
              <Link to="/festival-log/new" className="record-btn-primary">
                새로운 페스티벌 기록 만들기
              </Link>
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}
