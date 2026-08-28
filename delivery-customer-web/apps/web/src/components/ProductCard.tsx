import { Plus, ShoppingCart } from "lucide-react";
import { Link } from "react-router-dom";
import type { Product } from "../types";
import { useApp } from "../context/AppContext";
import { BrandLogo } from "./BrandLogo";

export function ProductCard({ product }: { product: Product }) {
  const { cart, setQuantity } = useApp();
  const uom = product.uoms[0];
  const quantity = uom
    ? cart.find((x) => x.product.id === product.id && x.uom.id === uom.id)
        ?.quantity || 0
    : 0;
  const inCart = cart.some(
    (line) => line.product.id === product.id && line.quantity > 0,
  );
  return (
    <article className="store-product-card">
      <div className="store-product-image">
        <Link
          className="store-product-image-link"
          to={`/products/${product.id}`}
          aria-label={`View ${product.name}`}
        >
          <BrandLogo size={116} src={product.imageUrl} alt={product.name} />
        </Link>
        {uom && (
          <button
            type="button"
            className={`store-product-add${inCart ? " is-in-cart" : ""}`}
            aria-label={
              inCart
                ? `Add another ${product.name} (in cart)`
                : `Add ${product.name} to cart`
            }
            onClick={() => setQuantity(product, uom, quantity + 1)}
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
        <Link to={`/products/${product.id}`}>{product.name}</Link>
      </h3>
      {product.description && (
        <small className="store-product-description">
          {product.description}
        </small>
      )}
      <div className="store-product-price">
        <span>
          <b>RM {Number(uom?.price || 0).toFixed(2)}</b>
          <small> / {uom?.name || uom?.pack || "unit"}</small>
        </span>
      </div>
    </article>
  );
}
