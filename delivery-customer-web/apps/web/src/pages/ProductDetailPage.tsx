import { ArrowLeft, Plus, ShoppingCart, Star } from "lucide-react";
import { useEffect, useLayoutEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { BrandLogo } from "../components/BrandLogo";
import { ProductCard } from "../components/ProductCard";
import { useApp } from "../context/AppContext";
import { api } from "../services/api";
import type { Product, ProductCategory } from "../types";
const categoryName = (c: ProductCategory) =>
  typeof c === "string" ? c : c?.name || "Uncategorised";
export function ProductDetailPage() {
  const { productId } = useParams();
  // Remount only the details content when selecting another related product.
  return <ProductDetails key={productId} />;
}

function ProductDetails() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { cart, setQuantity } = useApp();
  const [products, setProducts] = useState<Product[]>(() => api.cachedProducts() || []);
  const [loading, setLoading] = useState(() => !api.cachedProducts());
  const [loadError, setLoadError] = useState(false);
  useLayoutEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, []);
  useEffect(() => {
    let active = true;
    api.products()
      .then((items) => {
        if (active) setProducts(items);
      })
      .catch(() => {
        if (active && !api.cachedProducts()) setLoadError(true);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;

    };
  }, []);
  const product = products.find((p) => p.id === Number(productId));
  const uom = product?.uoms[0];
  const related = useMemo(
    () =>
      product
        ? products
            .filter(
              (p) =>
                p.id !== product.id &&
                categoryName(p.category) === categoryName(product.category),
            )
            .slice(0, 6)
        : [],
    [product, products],
  );
  if (loading)
    return (
      <div className="detail-loading" role="status" aria-live="polite">
        <span className="detail-loading-spinner" aria-hidden="true" />
        Opening product…
      </div>
    );
  if (loadError || !product)
    return (
      <div className="empty" role="status">
        <p>
          {loadError
            ? "Unable to load this product. Please try again."
            : "Product not found."}
        </p>
        <button className="detail-back" onClick={() => navigate("/")}>
          Back to products
        </button>
      </div>
    );
  const inCart = !!uom && cart.some(
    (item) => item.product.id === product.id && item.uom.id === uom.id && item.quantity > 0,
  );
  const toggleCart = () => {
    if (!uom) return;
    setQuantity(product, uom, inCart ? 0 : 1);
  };
  return (
    <div className="product-detail-page">
      <button className="detail-back" onClick={() => navigate(-1)}>
        <ArrowLeft /> Product details
      </button>
      <div className="detail-scroll">
        <div className="detail-image">
          <BrandLogo size={260} src={product.imageUrl} alt={product.name} />
          {uom && (
            <button
              type="button"
              className={`store-product-add${inCart ? " is-in-cart" : ""}`}
              aria-label={`${inCart ? "Remove" : "Add"} ${product.name} ${inCart ? "from" : "to"} cart`}
              aria-pressed={inCart}
              onClick={toggleCart}
            >
              {inCart ? <ShoppingCart aria-hidden="true" /> : <Plus aria-hidden="true" />}
            </button>
          )}
        </div>
        <div className="detail-info">
          <small>{categoryName(product.category)}</small>
          <h1>{product.name}</h1>
          {product.rating != null && (
            <div className="detail-rating">
              <Star fill="currentColor" /> {product.rating.toFixed(1)}
            </div>
          )}
          <div className="detail-price">
            RM {Number(uom?.price || 0).toFixed(2)}{" "}
            <span>/ {uom?.pack || uom?.name || "unit"}</span>
          </div>
        </div>
        {related.length > 0 && (
          <section className="more-products">
            <header>
              <h2>More Products</h2>
              <button
                onClick={() =>
                  navigate(
                    `/?category=${encodeURIComponent(categoryName(product.category))}`,
                  )
                }
              >
                See more
              </button>
            </header>
            <div className="product-row">
              {related.map((item) => (
                <ProductCard product={item} key={item.id} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
