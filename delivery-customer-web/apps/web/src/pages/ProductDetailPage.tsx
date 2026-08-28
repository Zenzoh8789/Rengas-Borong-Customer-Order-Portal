import { ArrowLeft, Star } from "lucide-react";
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
  const { cart, setQuantity, notify } = useApp();
  const [products, setProducts] = useState<Product[]>([]);
  const [quantity, setLocalQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  useLayoutEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, []);
  useEffect(() => {
    let active = true;
    let timer: ReturnType<typeof setTimeout>;
    // A short transition makes cached product switches visible too.
    const transition = new Promise<void>((resolve) => {
      timer = setTimeout(resolve, 180);
    });
    Promise.all([api.products(), transition])
      .then(([items]) => {
        if (active) setProducts(items);
      })
      .catch(() => {
        if (active) setLoadError(true);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
      clearTimeout(timer);
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
  const add = () => {
    if (!uom) return;
    const current =
      cart.find((x) => x.product.id === product.id && x.uom.id === uom.id)
        ?.quantity || 0;
    setQuantity(product, uom, current + quantity);
    notify(`${quantity} × ${product.name} added to cart.`, "success");
  };
  return (
    <div className="product-detail-page">
      <button className="detail-back" onClick={() => navigate(-1)}>
        <ArrowLeft /> Product details
      </button>
      <div className="detail-scroll">
        <div className="detail-image">
          <BrandLogo size={260} src={product.imageUrl} alt={product.name} />
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
      <div className="detail-cart-bar">
        <div className="detail-stepper">
          <button onClick={() => setLocalQuantity(Math.max(1, quantity - 1))}>
            −
          </button>
          <b>{quantity}</b>
          <button onClick={() => setLocalQuantity(quantity + 1)}>+</button>
        </div>
        <button className="detail-add" disabled={!uom} onClick={add}>
          Add to Cart · RM {(Number(uom?.price || 0) * quantity).toFixed(2)}
        </button>
      </div>
    </div>
  );
}
