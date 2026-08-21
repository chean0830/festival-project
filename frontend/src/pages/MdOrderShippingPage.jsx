import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Layout from "../components/common/Layout/Layout";
import RequireLogin from "../features/profile/components/RequireLogin";
import useCurrentMember from "../features/profile/hooks/useCurrentMember";
import { fetchMyMdOrders, fetchProduct } from "../api/mdShopApi";
import { formatPrice } from "../utils/formatPrice";
import { formatPhoneNumber } from "../utils/formatPhoneNumber";
import "./MdOrderPage.css";

const PHONE_PATTERN = /^01[016789]-?\d{3,4}-?\d{4}$/;
const MAX_QUANTITY_PER_PERSON = 4;

/**
 * MD 사전예약 - 배송지(받는 사람) 입력 페이지.
 * 여기서는 아직 주문을 만들지 않고, 입력값을 다음 페이지(결제/예약 확정)로 라우터
 * state로 넘긴다. 실제 주문 생성(POST /api/members/{memberId}/md/orders)은
 * 결제 페이지에서 "예약 완료하기"를 눌렀을 때 일어난다.
 */
function MdOrderShippingPage() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const currentMember = useCurrentMember();

  const [product, setProduct] = useState(undefined);
  const [alreadyOrdered, setAlreadyOrdered] = useState(0);
  const [loadError, setLoadError] = useState(null);
  const memberId = currentMember?.memberId;

  useEffect(() => {
    if (!memberId) {
      return undefined;
    }

    let cancelled = false;

    Promise.all([fetchProduct(productId), fetchMyMdOrders(memberId)])
      .then(([productData, orders]) => {
        if (cancelled) return;
        setProduct(productData);
        const sum = orders
          .filter((order) => order.productId === productData.productId && order.status !== "CANCELED")
          .reduce((total, order) => total + order.quantity, 0);
        setAlreadyOrdered(sum);
      })
      .catch((err) => {
        if (!cancelled) setLoadError(err.message);
      });

    return () => {
      cancelled = true;
    };
  }, [productId, memberId]);

  const detailAddressRef = useRef(null);
  const [quantity, setQuantity] = useState(1);
  const [recipientName, setRecipientName] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [roadAddress, setRoadAddress] = useState("");
  const [detailAddress, setDetailAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [errors, setErrors] = useState({});

  const stockLimit = product?.stock ?? MAX_QUANTITY_PER_PERSON;
  const remainingQuantity = Math.max(0, Math.min(MAX_QUANTITY_PER_PERSON - alreadyOrdered, stockLimit));

  useEffect(() => {
    setQuantity((prev) => {
      if (remainingQuantity <= 0) return 0;
      return Math.min(Math.max(prev, 1), remainingQuantity);
    });
  }, [remainingQuantity]);

  if (currentMember === undefined) {
    return (
      <Layout>
        <div className="md-order-page">확인 중입니다...</div>
      </Layout>
    );
  }

  if (currentMember === null) {
    return <RequireLogin />;
  }

  if (loadError) {
    return (
      <Layout>
        <div className="md-order-page">
          <p className="md-order-page__empty">{loadError}</p>
          <Link to="/shop/preorder" className="md-order-page__back-link">
            ‹ MD 사전예약으로 돌아가기
          </Link>
        </div>
      </Layout>
    );
  }

  if (product === undefined) {
    return (
      <Layout>
        <div className="md-order-page">불러오는 중...</div>
      </Layout>
    );
  }

  const totalPrice = product.price * quantity;

  function clearError(name) {
    setErrors((current) => {
      const next = { ...current };
      delete next[name];
      return next;
    });
  }

  function openPostcodeSearch() {
    if (!window.kakao?.Postcode) {
      setErrors((current) => ({
        ...current,
        address: "주소 검색 서비스를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.",
      }));
      return;
    }

    new window.kakao.Postcode({
      oncomplete: (data) => {
        const selectedAddress = data.userSelectedType === "R" ? data.roadAddress : data.jibunAddress;
        setPostalCode(data.zonecode);
        setRoadAddress(selectedAddress);
        clearError("address");
        window.setTimeout(() => detailAddressRef.current?.focus(), 0);
      },
    }).open();
  }

  function handleSubmit(event) {
    event.preventDefault();
    if (remainingQuantity <= 0) return;

    const nextErrors = {};
    if (!recipientName.trim()) nextErrors.recipientName = "받는 사람 이름을 입력해주세요.";
    if (!postalCode || !roadAddress) nextErrors.address = "주소 검색으로 도로명 주소를 찾아주세요.";
    if (!detailAddress.trim()) nextErrors.detailAddress = "상세 주소를 입력해주세요.";
    if (!phone.trim()) nextErrors.phone = "연락처를 입력해주세요.";
    else if (!PHONE_PATTERN.test(phone)) nextErrors.phone = "연락처 형식이 올바르지 않아요.";

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    navigate(`/shop/preorder/${product.productId}/payment`, {
      state: {
        product,
        quantity,
        totalPrice,
        recipientName: recipientName.trim(),
        address: `(${postalCode}) ${roadAddress} ${detailAddress.trim()}`,
        phone,
      },
    });
  }

  return (
    <Layout>
      <div className="md-order-page">
        <h1>사전예약 - 배송지 입력</h1>

        <div className="md-order-page__summary">
          <div className="md-order-page__summary-thumb">
            {product.imageUrl ? <img src={product.imageUrl} alt={product.name} /> : "예시 이미지"}
          </div>
          <div className="md-order-page__summary-info">
            <span className="md-order-page__summary-event">{product.eventName}</span>
            <p className="md-order-page__summary-name">{product.name}</p>
            <p className="md-order-page__summary-price">{formatPrice(product.price)}</p>
            <p className="md-order-page__summary-stock">남은 재고 {product.stock}개</p>
          </div>
        </div>

        <div className="md-order-page__field">
          <label htmlFor="md-order-quantity">수량 (1인당 최대 {MAX_QUANTITY_PER_PERSON}개)</label>
          <div className="md-order-page__quantity">
            <button
              type="button"
              onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
              disabled={quantity <= 1}
            >
              −
            </button>
            <span id="md-order-quantity">{quantity}</span>
            <button
              type="button"
              onClick={() => setQuantity((prev) => Math.min(remainingQuantity, prev + 1))}
              disabled={quantity >= remainingQuantity}
            >
              +
            </button>
          </div>
          {alreadyOrdered > 0 && (
            <p className="md-order-page__quantity-note">
              이미 {alreadyOrdered}개 예약하셨어요. {remainingQuantity}개까지 추가로 예약할 수 있어요.
            </p>
          )}
          {remainingQuantity <= 0 && (
            <p className="md-order-page__error">이 상품은 1인당 최대 수량({MAX_QUANTITY_PER_PERSON}개)을 이미 예약하셨어요.</p>
          )}
        </div>

        <form className="md-order-page__form" onSubmit={handleSubmit}>
          <div className="md-order-page__field">
            <label htmlFor="md-order-recipient">받는 사람</label>
            <input
              id="md-order-recipient"
              type="text"
              value={recipientName}
              onChange={(event) => setRecipientName(event.target.value)}
              placeholder="이름을 입력해주세요"
            />
            {errors.recipientName && <p className="md-order-page__error">{errors.recipientName}</p>}
          </div>

          <div className="md-order-page__field">
            <label htmlFor="md-order-postal">배송지 주소</label>
            <div className="md-order-page__address-search-row">
              <input
                id="md-order-postal"
                type="text"
                placeholder="우편번호"
                value={postalCode}
                readOnly
                aria-invalid={Boolean(errors.address)}
              />
              <button type="button" className="md-order-page__address-search-btn" onClick={openPostcodeSearch}>
                주소 검색
              </button>
            </div>
            <input
              className="md-order-page__stacked-input"
              type="text"
              placeholder="주소 검색 후 자동으로 입력됩니다"
              value={roadAddress}
              readOnly
              aria-invalid={Boolean(errors.address)}
            />
            {errors.address && <p className="md-order-page__error">{errors.address}</p>}
            <input
              ref={detailAddressRef}
              className="md-order-page__stacked-input"
              type="text"
              value={detailAddress}
              onChange={(event) => {
                setDetailAddress(event.target.value);
                clearError("detailAddress");
              }}
              placeholder="상세 주소 (동/호수 등)"
            />
            {errors.detailAddress && <p className="md-order-page__error">{errors.detailAddress}</p>}
          </div>

          <div className="md-order-page__field">
            <label htmlFor="md-order-phone">연락처</label>
            <input
              id="md-order-phone"
              type="tel"
              value={phone}
              onChange={(event) => setPhone(formatPhoneNumber(event.target.value))}
              placeholder="010-0000-0000"
            />
            {errors.phone && <p className="md-order-page__error">{errors.phone}</p>}
          </div>

          <div className="md-order-page__total">
            <span>총 결제 금액</span>
            <strong>{formatPrice(totalPrice)}</strong>
          </div>

          <div className="md-order-page__actions">
            <button type="button" className="md-order-page__btn-ghost" onClick={() => navigate(-1)}>
              취소
            </button>
            <button type="submit" className="md-order-page__btn-primary" disabled={remainingQuantity <= 0}>
              다음
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
}

export default MdOrderShippingPage;
