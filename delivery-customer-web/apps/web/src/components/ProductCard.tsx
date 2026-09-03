import { Plus, ShoppingCart } from "lucide-react";
import { Link } from "react-router-dom";
import type { Product } from "../types";
import { useApp } from "../context/AppContext";
import { BrandLogo } from "./BrandLogo";

export function ProductCard({ product }: { product: Product }) {
  const { cart, setQuantity } = useApp();
  const uom = product.uoms[0];

  const quantity = uom
    ? cart.find(
        (item) =>
          item.product.id === product.id &&
          item.uom.id === uom.id,
      )?.quantity || 0
    : 0;

  const inCart = quantity > 0;

  const toggleCart = () => {
    if (!uom) return;

    setQuantity(product, uom, inCart ? 0 : 1);
  };

  return (
    <article className="store-product-card">
      <div className="store-product-image">
        <Link
          className="store-product-image-link"
          to={`/products/${product.id}`}
          aria-label={`View ${product.name}`}
        >
          <BrandLogo
            size={116}
            src={product.imageUrl}
            alt={product.name}
          />
        </Link>

        {uom && (
          <button
            type="button"
            className={`store-product-add${
              inCart ? " is-in-cart" : ""
            }`}
            aria-label={
              inCart
                ? `Remove ${product.name} from cart`
                : `Add ${product.name} to cart`
            }
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

      <h3>
        <Link to={`/products/${product.id}`}>
          {product.name}
        </Link>
      </h3>

      {product.description && (
        <small className="store-product-description">
          {product.description}
        </small>
      )}

      <div className="store-product-price">
        <span>
          <b>RM {Number(uom?.price || 0).toFixed(2)}</b>
          <small>
            {" "}
            / {uom?.name || uom?.pack || "unit"}
          </small>
        </span>
      </div>
    </article>
  );
}