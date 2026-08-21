import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Layout from '../../components/common/Layout/Layout'
import useCurrentMember from '../profile/hooks/useCurrentMember'
import RequireLogin from '../profile/components/RequireLogin'
import { fetchAttendedEvents } from '../profile/api/profileApi'
import {
  addRecordImage,
  createFestivalRecord,
  deleteRecordImage,
  fetchFestivalRecord,
  fetchFestivalRecords,
  reorderRecordImages,
  updateFestivalRecord,
} from './api/festivalRecordApi'
import RecordForm from './components/RecordForm'
import './festivalrecord.css'

export default function FestivalRecordFormPage() {
  const navigate = useNavigate()
  const { recordId } = useParams()
  const isEditMode = Boolean(recordId)

  const currentMember = useCurrentMember()
  const memberId = currentMember?.memberId
  const [eligibleEvents, setEligibleEvents] = useState([])
  const [recordedEventIds, setRecordedEventIds] = useState(() => new Set())
  const [initialValues, setInitialValues] = useState(isEditMode ? null : undefined)
  const [existingImages, setExistingImages] = useState([])
  const [loadError, setLoadError] = useState(null)

  useEffect(() => {
    if (!memberId) {
      return undefined
    }
    let cancelled = false

    async function load() {
      try {
        const [events, existingRecords, record] = await Promise.all([
          fetchAttendedEvents(memberId),
          fetchFestivalRecords(memberId),
          isEditMode ? fetchFestivalRecord(memberId, recordId) : Promise.resolve(undefined),
        ])
        if (!cancelled) {
          setEligibleEvents(events)
          // 편집 중인 기록 자신은 "이미 생성됨" 표시에서 제외한다.
          setRecordedEventIds(
            new Set(
              existingRecords
                .filter((r) => !isEditMode || r.recordId !== Number(recordId))
                .map((r) => r.eventId),
            ),
          )
          setInitialValues(record)
          setExistingImages(record?.images ?? [])
        }
      } catch (err) {
        if (!cancelled) setLoadError(err.message)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [memberId, isEditMode, recordId])

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

  async function handleSubmit(payload, photoFiles) {
    const result = isEditMode
      ? await updateFestivalRecord(memberId, recordId, payload)
      : await createFestivalRecord(memberId, payload)

    for (const file of photoFiles) {
      await addRecordImage(memberId, result.recordId, file)
    }

    navigate(`/festival-log/${result.recordId}`)
  }

  async function handleDeleteExistingImage(imageId) {
    await deleteRecordImage(memberId, recordId, imageId)
    setExistingImages((prev) => prev.filter((image) => image.imageId !== imageId))
  }

  async function handleReorderExistingImages(reorderedImages) {
    setExistingImages(reorderedImages)
    await reorderRecordImages(memberId, recordId, reorderedImages.map((image) => image.imageId))
  }

  const isLoadingInitialValues = initialValues === null

  return (
    <Layout>
      <div className="record-page">
        <div className="record-content">
          <h1>{isEditMode ? '기록 수정' : '새 기록 작성'}</h1>

          {loadError && <p className="record-error-text">불러오지 못했습니다: {loadError}</p>}

          {!loadError && isLoadingInitialValues && <p>불러오는 중입니다...</p>}

          {!loadError && !isLoadingInitialValues && eligibleEvents.length === 0 && (
            <p className="record-empty-text">다녀온 공연이 있어야 기록을 작성할 수 있어요.</p>
          )}

          {!loadError && !isLoadingInitialValues && eligibleEvents.length > 0 && (
            <RecordForm
              eligibleEvents={eligibleEvents}
              recordedEventIds={recordedEventIds}
              initialValues={initialValues}
              existingImages={existingImages}
              onDeleteExistingImage={isEditMode ? handleDeleteExistingImage : undefined}
              onReorderExistingImages={isEditMode ? handleReorderExistingImages : undefined}
              onSubmit={handleSubmit}
              onCancel={() => navigate(-1)}
              submitLabel={isEditMode ? '수정 완료' : '작성 완료'}
            />
          )}
        </div>
      </div>
    </Layout>
  )
}
