import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Layout from "../components/common/Layout/Layout";
import RequireLogin from "../features/profile/components/RequireLogin";
import useCurrentMember from "../features/profile/hooks/useCurrentMember";
import { fetchProduct } from "../api/mdShopApi";
import { formatPrice } from "../utils/formatPrice";
import { formatDeadline, isDeadlinePassed, isSoldOut } from "../utils/mdPreorderStatus";
import "./MdProductDetailPage.css";

/**
 * MD 사전예약 상품 상세 페이지.
 * 예약 마감/품절 상품도 들어와서 어떤 상품인지 확인할 수 있고,
 * 이 경우 "예약 마감"/"품절" 버튼이 비활성화된 상태로 유지된다.
 */
function MdProductDetailPage() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const currentMember = useCurrentMember();

  const [product, setProduct] = useState(undefined);
  const [loadError, setLoadError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    fetchProduct(productId)
      .then((data) => {
        if (!cancelled) setProduct(data);
      })
      .catch((err) => {
        if (!cancelled) setLoadError(err.message);
      });

    return () => {
      cancelled = true;
    };
  }, [productId]);

  if (currentMember === undefined) {
    return (
      <Layout>
        <div className="md-product-detail">확인 중입니다...</div>
      </Layout>
    );
  }

  if (currentMember === null) {
    return <RequireLogin />;
  }

  if (loadError) {
    return (
      <Layout>
        <div className="md-product-detail">
          <p className="md-product-detail__empty">{loadError}</p>
          <Link to="/shop/preorder" className="md-product-detail__back-link">
            ‹ MD 사전예약으로 돌아가기
          </Link>
        </div>
      </Layout>
    );
  }

  if (product === undefined) {
    return (
      <Layout>
        <div className="md-product-detail">불러오는 중...</div>
      </Layout>
    );
  }

  const soldOut = isSoldOut(product);
  const deadlinePassed = isDeadlinePassed(product);
  const isClosed = soldOut || deadlinePassed;
  const deadlineLabel = soldOut ? "품절" : formatDeadline(product.preorderDeadline);

  function handleReserve() {
    if (!currentMember?.memberId) {
      navigate("/login");
      return;
    }
    navigate(`/shop/preorder/${product.productId}/order`);
  }

  return (
    <Layout>
      <div className="md-product-detail">
        <Link to="/shop/preorder" className="md-product-detail__back-link">
          ‹ MD 사전예약으로 돌아가기
        </Link>

        <div className="md-product-detail__body">
          <div className="md-product-detail__poster">
            {product.imageUrl ? <img src={product.imageUrl} alt={product.name} /> : "예시 이미지"}
            {deadlineLabel && (
              <span
                className={`md-product-detail__deadline${
                  isClosed ? " md-product-detail__deadline--closed" : ""
                }`}
              >
                {deadlineLabel}
              </span>
            )}
          </div>

          <div className="md-product-detail__info">
            <span className="md-product-detail__event">{product.eventName}</span>
            <h1 className="md-product-detail__name">{product.name}</h1>
            {product.category && (
              <span className="md-product-detail__category">{product.category}</span>
            )}
            <p className="md-product-detail__price">{formatPrice(product.price)}</p>
            <p className="md-product-detail__stock">남은 재고 {product.stock}개</p>

            {isClosed && (
              <p className="md-product-detail__closed-note">
                {soldOut
                  ? "이 상품은 품절되어 더 이상 예약할 수 없어요."
                  : "이 상품은 사전예약이 마감되어 더 이상 예약할 수 없어요."}
              </p>
            )}

            <button
              type="button"
              className="md-product-detail__cta"
              disabled={isClosed}
              onClick={handleReserve}
            >
              {soldOut ? "품절" : deadlinePassed ? "예약 마감" : "사전예약하기"}
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default MdProductDetailPage;
