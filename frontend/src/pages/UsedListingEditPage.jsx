import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Layout from "../components/common/Layout/Layout";
import RequireLogin from "../features/profile/components/RequireLogin";
import useCurrentMember from "../features/profile/hooks/useCurrentMember";
import {
  changeUsedListingStatus,
  fetchUsedListing,
  updateUsedListing,
  uploadUsedListingImage,
} from "../api/usedTradeApi";
import { CATEGORY_LABEL, USED_TRADE_CATEGORIES } from "../components/usedtrade/usedTradeCategories";
import UsedImagePicker from "../components/usedtrade/UsedImagePicker/UsedImagePicker";
import "./UsedListingCreatePage.css";

/**
 * MD 중고거래 매물 수정 페이지. "/shop/used/:listingId/edit" 라우트.
 * 판매 상태(판매중/예약중/판매완료)는 삭제된 매물이 아니면 언제든 바꿀 수 있고,
 * 상품 정보(제목/가격/사진 등) 수정은 판매중 상태에서만 가능하다.
 */
function UsedListingEditPage() {
  const { listingId } = useParams();
  const navigate = useNavigate();
  const currentMember = useCurrentMember();
  const memberId = currentMember?.memberId;

  const [listing, setListing] = useState(undefined);
  const [loadError, setLoadError] = useState(null);

  const [category, setCategory] = useState(USED_TRADE_CATEGORIES[0]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [condition, setCondition] = useState("");
  const [tradeMethod, setTradeMethod] = useState("");
  const [region, setRegion] = useState("");
  const [imageUrls, setImageUrls] = useState([]);
  const [tags, setTags] = useState("");

  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [statusBusy, setStatusBusy] = useState(false);
  const [statusError, setStatusError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    fetchUsedListing(listingId)
      .then((data) => {
        if (cancelled) return;
        setListing(data);
        setCategory(data.category);
        setTitle(data.title);
        setDescription(data.description ?? "");
        setPrice(String(data.price));
        setCondition(data.condition ?? "");
        setTradeMethod(data.tradeMethod ?? "");
        setRegion(data.region ?? "");
        setImageUrls(data.imageUrls ?? []);
        setTags(data.tags ?? "");
      })
      .catch((err) => {
        if (!cancelled) setLoadError(err.message);
      });
    return () => {
      cancelled = true;
    };
  }, [listingId]);

  if (currentMember === undefined || listing === undefined) {
    return (
      <Layout>
        <div className="used-listing-create">확인 중입니다...</div>
      </Layout>
    );
  }

  if (currentMember === null) {
    return <RequireLogin />;
  }

  if (loadError) {
    return (
      <Layout>
        <div className="used-listing-create">
          <p className="used-listing-create__error">{loadError}</p>
        </div>
      </Layout>
    );
  }

  if (listing.sellerId !== memberId) {
    return (
      <Layout>
        <div className="used-listing-create">본인 매물만 수정할 수 있어요.</div>
      </Layout>
    );
  }

  if (listing.status === "CANCELED") {
    return (
      <Layout>
        <div className="used-listing-create">삭제된 매물은 수정할 수 없어요.</div>
      </Layout>
    );
  }

  const isEditableStatus = listing.status === "ON_SALE";

  async function handleStatusChange(nextStatus) {
    if (nextStatus === listing.status || statusBusy) return;
    setStatusBusy(true);
    setStatusError(null);
    try {
      const updated = await changeUsedListingStatus(memberId, listingId, nextStatus);
      setListing(updated);
    } catch (err) {
      setStatusError(err.message);
    } finally {
      setStatusBusy(false);
    }
  }

  async function handleImageUpload(file) {
    const result = await uploadUsedListingImage(memberId, file);
    setImageUrls((prev) => [...prev, result.imageUrl]);
  }

  function handleRemoveImage(index) {
    setImageUrls((prev) => prev.filter((_, i) => i !== index));
  }

  function handleMoveImage(index, direction) {
    setImageUrls((prev) => {
      const target = index + direction;
      if (target < 0 || target >= prev.length) return prev;
      const next = [...prev];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  function handleSubmit(event) {
    event.preventDefault();

    const nextErrors = {};
    if (!title.trim()) nextErrors.title = "상품명을 입력해주세요.";
    if (!price || Number(price) <= 0) nextErrors.price = "가격을 입력해주세요.";
    if (imageUrls.length < 2) nextErrors.imageUrls = "사진을 최소 2장 등록해주세요.";

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setSubmitting(true);
    setSubmitError(null);

    updateUsedListing(memberId, listingId, {
      title: title.trim(),
      description: description.trim() || null,
      price: Number(price),
      condition: condition || null,
      tradeMethod: tradeMethod || null,
      region: region.trim() || null,
      imageUrls,
      category,
      tags: tags.trim() || null,
    })
      .then((updated) => {
        navigate(`/shop/used/${updated.listingId}`);
      })
      .catch((err) => {
        setSubmitError(err.message);
      })
      .finally(() => {
        setSubmitting(false);
      });
  }

  return (
    <Layout>
      <div className="used-listing-create">
        <h1>MD 중고거래 매물 수정</h1>

        <div className="used-listing-create__field">
          <label>판매 상태</label>
          <div className="used-listing-create__status-row">
            {[
              { value: "ON_SALE", label: "판매중" },
              { value: "RESERVED", label: "예약중" },
              { value: "SOLD", label: "판매완료" },
            ].map((option) => (
              <button
                key={option.value}
                type="button"
                className={`used-listing-create__status-btn${listing.status === option.value ? " used-listing-create__status-btn--active" : ""}`}
                disabled={statusBusy}
                onClick={() => handleStatusChange(option.value)}
              >
                {option.label}
              </button>
            ))}
          </div>
          {statusError && <p className="used-listing-create__error">{statusError}</p>}
        </div>

        {!isEditableStatus && (
          <p className="used-listing-create__hint">
            판매중 상태일 때만 상품 정보(상품명/가격/사진 등)를 수정할 수 있어요. 지금은 상태만 바꿀 수 있어요.
          </p>
        )}

        <form className="used-listing-create__form" onSubmit={handleSubmit}>
          <fieldset disabled={!isEditableStatus} className="used-listing-create__fieldset">
          <div className="used-listing-create__field">
            <label htmlFor="used-listing-category">카테고리</label>
            <select id="used-listing-category" value={category} onChange={(event) => setCategory(event.target.value)}>
              {USED_TRADE_CATEGORIES.map((value) => (
                <option key={value} value={value}>
                  {CATEGORY_LABEL[value]}
                </option>
              ))}
            </select>
          </div>

          <div className="used-listing-create__field">
            <label htmlFor="used-listing-title">상품명</label>
            <input
              id="used-listing-title"
              type="text"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
            />
            {errors.title && <p className="used-listing-create__error">{errors.title}</p>}
          </div>

          <div className="used-listing-create__field">
            <label htmlFor="used-listing-description">설명</label>
            <textarea
              id="used-listing-description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              rows={4}
            />
          </div>

          <div className="used-listing-create__field">
            <label htmlFor="used-listing-price">가격 (원)</label>
            <input
              id="used-listing-price"
              type="number"
              min="0"
              value={price}
              onChange={(event) => setPrice(event.target.value)}
            />
            {errors.price && <p className="used-listing-create__error">{errors.price}</p>}
          </div>

          <div className="used-listing-create__field">
            <label htmlFor="used-listing-tags">해시태그</label>
            <input
              id="used-listing-tags"
              type="text"
              value={tags}
              onChange={(event) => setTags(event.target.value)}
              placeholder="예: #넬 #후드티 #페스티벌MD"
            />
            <p className="used-listing-create__hint">공백으로 구분해서 여러 개 입력할 수 있어요.</p>
          </div>

          <div className="used-listing-create__row">
            <div className="used-listing-create__field">
              <label htmlFor="used-listing-condition">상품 상태</label>
              <input
                id="used-listing-condition"
                type="text"
                value={condition}
                onChange={(event) => setCondition(event.target.value)}
              />
            </div>

            <div className="used-listing-create__field">
              <label htmlFor="used-listing-trade-method">거래 방식</label>
              <input
                id="used-listing-trade-method"
                type="text"
                value={tradeMethod}
                onChange={(event) => setTradeMethod(event.target.value)}
              />
            </div>
          </div>

          <div className="used-listing-create__field">
            <label htmlFor="used-listing-region">지역</label>
            <input
              id="used-listing-region"
              type="text"
              value={region}
              onChange={(event) => setRegion(event.target.value)}
            />
          </div>

          <div className="used-listing-create__field">
            <label>사진</label>
            <UsedImagePicker
              imageUrls={imageUrls}
              onUpload={handleImageUpload}
              onRemove={handleRemoveImage}
              onMove={handleMoveImage}
            />
            {errors.imageUrls && <p className="used-listing-create__error">{errors.imageUrls}</p>}
          </div>
          </fieldset>

          {submitError && <p className="used-listing-create__error">{submitError}</p>}

          <div className="used-listing-create__actions">
            <button type="button" className="used-listing-create__btn-ghost" onClick={() => navigate(-1)}>
              취소
            </button>
            {isEditableStatus && (
              <button type="submit" className="used-listing-create__btn-primary" disabled={submitting}>
                저장하기
              </button>
            )}
          </div>
        </form>
      </div>
    </Layout>
  );
}

export default UsedListingEditPage;
