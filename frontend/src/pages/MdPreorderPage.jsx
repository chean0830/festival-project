import { useEffect, useMemo, useState } from "react";
import Layout from "../components/common/Layout/Layout";
import MdProductCard from "../components/mdshop/MdProductCard/MdProductCard";
import { fetchPreorderProducts } from "../api/mdShopApi";
import "./MdPreorderPage.css";

const ALL_CATEGORY = "전체";

/**
 * MD 사전예약 페이지.
 * GET /api/md/products (status=PREORDER인 상품만 내려옴)로 실제 DB 데이터를 받아온다.
 */
function MdPreorderPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [activeCategory, setActiveCategory] = useState(ALL_CATEGORY);

  useEffect(() => {
    let cancelled = false;

    fetchPreorderProducts()
      .then((data) => {
        if (!cancelled) setProducts(data);
      })
      .catch((err) => {
        if (!cancelled) setLoadError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const categories = useMemo(
    () => [ALL_CATEGORY, ...new Set(products.map((product) => product.category).filter(Boolean))],
    [products]
  );

  const visibleProducts =
    activeCategory === ALL_CATEGORY
      ? products
      : products.filter((product) => product.category === activeCategory);

  return (
    <Layout>
      <section className="md-preorder-page">
        <div className="md-preorder-page__header">
          <h1>MD 사전예약</h1>
          <p className="md-preorder-page__subtitle">
            좋아하는 아티스트의 굿즈를 마감 전에 미리 예약해보세요.
          </p>
        </div>

        {loading && <p className="md-preorder-page__empty">불러오는 중...</p>}
        {loadError && <p className="md-preorder-page__empty">{loadError}</p>}

        {!loading && !loadError && (
          <>
            <nav className="md-preorder-page__tabs">
              {categories.map((category) => (
                <button
                  key={category}
                  type="button"
                  className={`md-preorder-page__tab${
                    category === activeCategory ? " md-preorder-page__tab--active" : ""
                  }`}
                  onClick={() => setActiveCategory(category)}
                >
                  {category}
                </button>
              ))}
            </nav>

            {visibleProducts.length === 0 ? (
              <p className="md-preorder-page__empty">사전예약 가능한 상품이 없어요.</p>
            ) : (
              <div className="md-preorder-page__grid">
                {visibleProducts.map((product) => (
                  <MdProductCard key={product.productId} product={product} />
                ))}
              </div>
            )}
          </>
        )}
      </section>
    </Layout>
  );
}

export default MdPreorderPage;
