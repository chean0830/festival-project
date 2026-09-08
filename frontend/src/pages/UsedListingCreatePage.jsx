import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/common/Layout/Layout";
import RequireLogin from "../features/profile/components/RequireLogin";
import useCurrentMember from "../features/profile/hooks/useCurrentMember";
import { createUsedListing, uploadUsedListingImage } from "../api/usedTradeApi";
import { CATEGORY_LABEL, USED_TRADE_CATEGORIES } from "../components/usedtrade/usedTradeCategories";
import UsedImagePicker from "../components/usedtrade/UsedImagePicker/UsedImagePicker";
import "./UsedListingCreatePage.css";

/**
 * MD 중고거래 매물 등록 페이지. "/shop/used/new" 라우트.
 * 아티스트/공연 테이블과 정식으로 연결하지 않고, 해시태그(자유 입력)로 검색만 지원한다.
 */
function UsedListingCreatePage() {
  const navigate = useNavigate();
  const currentMember = useCurrentMember();
  const memberId = currentMember?.memberId;

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

  if (currentMember === undefined) {
    return (
      <Layout>
        <div className="used-listing-create">확인 중입니다...</div>
      </Layout>
    );
  }

  if (currentMember === null) {
    return <RequireLogin />;
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

    createUsedListing(memberId, {
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
      .then((created) => {
        navigate(`/shop/used/${created.listingId}`);
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
        <h1>MD 중고거래 매물 등록</h1>

        <form className="used-listing-create__form" onSubmit={handleSubmit}>
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
              placeholder="예: 2026 OO페스티벌 공식 후드티 L"
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
              placeholder="상품 상태, 구성품 등을 적어주세요"
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
              placeholder="30000"
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
                placeholder="예: 새상품, 사용감 적음"
              />
            </div>

            <div className="used-listing-create__field">
              <label htmlFor="used-listing-trade-method">거래 방식</label>
              <input
                id="used-listing-trade-method"
                type="text"
                value={tradeMethod}
                onChange={(event) => setTradeMethod(event.target.value)}
                placeholder="예: 택배, 직거래"
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
              placeholder="예: 서울 강남구"
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

          {submitError && <p className="used-listing-create__error">{submitError}</p>}

          <div className="used-listing-create__actions">
            <button type="button" className="used-listing-create__btn-ghost" onClick={() => navigate(-1)}>
              취소
            </button>
            <button type="submit" className="used-listing-create__btn-primary" disabled={submitting}>
              등록하기
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
}

export default UsedListingCreatePage;
