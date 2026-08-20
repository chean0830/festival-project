import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Layout from '../../components/common/Layout/Layout'
import useCurrentMember from '../profile/hooks/useCurrentMember'
import RequireLogin from '../profile/components/RequireLogin'
import { fetchFestivalRecords } from './api/festivalRecordApi'
import RecordCard from './components/RecordCard'
import './festivalrecord.css'

export default function FestivalRecordListPage() {
  const currentMember = useCurrentMember()
  const memberId = currentMember?.memberId
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(null)

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
            <div className="record-grid">
              {records.map((record) => (
                <RecordCard key={record.recordId} record={record} />
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}
