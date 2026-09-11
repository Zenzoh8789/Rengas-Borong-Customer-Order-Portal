import { ArrowLeft, Plus, ShoppingCart, Star } from "lucide-react";
import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useNavigate, useParams } from "react-router-dom";
import { BrandLogo } from "../components/BrandLogo";
import { ProductCard } from "../components/ProductCard";
import { useApp } from "../context/AppContext";
import { api } from "../services/api";
import type { Product, ProductCategory } from "../types";

const categoryName = (category: ProductCategory): string =>
  typeof category === "string"
    ? category
    : category?.name || "Uncategorised";

const formatUomLabel = (uom?: Product["uoms"][number]): string => {
  const label = uom?.pack?.trim() || uom?.name?.trim() || "unit";

  // Remove additional text such as "• AJI".
  return label.split("•")[0].trim() || "unit";
};

export function ProductDetailPage() {
  const { productId } = useParams();

  return <ProductDetails key={productId} />;
}

function ProductDetails() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { cart, setQuantity } = useApp();

  const detailScrollRef = useRef<HTMLDivElement>(null);

  const [products, setProducts] = useState<Product[]>(
    () => api.cachedProducts() || [],
  );
  const [loading, setLoading] = useState(() => !api.cachedProducts());
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    let active = true;

    api.products()
      .then((items) => {
        if (!active) return;

        setProducts(items);
        setLoadError(false);
      })
      .catch(() => {
        if (active && !api.cachedProducts()) {
          setLoadError(true);
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  useLayoutEffect(() => {
    if (loading) return;

    // Reset the product container and any scrolling layout parents.
    // This supports layouts with different scroll containers on mobile.
    let element: HTMLElement | null = detailScrollRef.current;

    while (element) {
      element.scrollTo({
        top: 0,
        left: 0,
        behavior: "instant",
      });

      element = element.parentElement;
    }

    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "instant",
    });
  }, [productId, loading]);

  const product = products.find((item) => item.id === Number(productId));
  const uom = product?.uoms[0];

  const related = useMemo(() => {
    if (!product) return [];

    return products
      .filter(
        (item) =>
          item.id !== product.id &&
          categoryName(item.category) === categoryName(product.category),
      )
      .slice(0, 6);
  }, [product, products]);

  if (loading) {
    return (
      <div className="detail-loading" role="status" aria-live="polite">
        <span className="detail-loading-spinner" aria-hidden="true" />
        Opening product…
      </div>
    );
  }

  if (loadError || !product) {
    return (
      <div className="empty" role="status">
        <p>
          {loadError
            ? "Unable to load this product. Please try again."
            : "Product not found."}
        </p>

        <button
          type="button"
          className="detail-back"
          onClick={() => navigate("/")}
        >
          Back to products
        </button>
      </div>
    );
  }

  const inCart =
    !!uom &&
    cart.some(
      (item) =>
        item.product.id === product.id &&
        item.uom.id === uom.id &&
        item.quantity > 0,
    );

  const toggleCart = () => {
    if (!uom) return;

    setQuantity(product, uom, inCart ? 0 : 1);
  };

  return (
    <div className="product-detail-page">
      <button
        type="button"
        className="detail-back"
        onClick={() => navigate(-1)}
      >
        <ArrowLeft aria-hidden="true" />
        Product details
      </button>

      <div className="detail-scroll" ref={detailScrollRef}>
        <div className="detail-image">
          <BrandLogo
            size={260}
            src={product.imageUrl}
            alt={product.name}
          />

          {uom && (
            <button
              type="button"
              className={`store-product-add${inCart ? " is-in-cart" : ""}`}
              aria-label={`${inCart ? "Remove" : "Add"} ${product.name} ${
                inCart ? "from" : "to"
              } cart`}
              aria-pressed={inCart}
              onClick={toggleCart}
            >
              {inCart ? (
                <ShoppingCart aria-hidden="true" />
              ) : (
                <Plus aria-hidden="true" />
              )}
            </button>
          )}
        </div>

        <div className="detail-info">
          <small>{categoryName(product.category)}</small>

          <h1>{product.name}</h1>

          {product.rating != null && (
            <div className="detail-rating">
              <Star fill="currentColor" aria-hidden="true" />
              {product.rating.toFixed(1)}
            </div>
          )}

          <div className="detail-price">
            RM {Number(uom?.price ?? 0).toFixed(2)}
            <span> / {formatUomLabel(uom)}</span>
          </div>
        </div>

        {related.length > 0 && (
          <section className="more-products">
            <header>
              <h2>More Products</h2>

              <button
                type="button"
                onClick={() =>
                  navigate(
                    `/?category=${encodeURIComponent(
                      categoryName(product.category),
                    )}`,
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