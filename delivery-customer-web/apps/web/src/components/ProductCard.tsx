import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { Product } from "../types";
import { useApp } from "../context/AppContext";
import { BrandLogo } from "./BrandLogo";

export function ProductCard({ product }: { product: Product }) {
  const navigate = useNavigate();
  const { cart, setQuantity } = useApp();
  const uom = product.uoms[0];
  const quantity = uom ? cart.find((x) => x.product.id === product.id && x.uom.id === uom.id)?.quantity || 0 : 0;
  return <article className="store-product-card" onClick={() => navigate(`/products/${product.id}`)} tabIndex={0}>
    <div className="store-product-image"><BrandLogo size={116} src={product.imageUrl} alt={product.name} /></div>
    <h3>{product.name}</h3>
    {product.description && <small className="store-product-description">{product.description}</small>}
    <div className="store-product-price"><span><b>RM {Number(uom?.price || 0).toFixed(2)}</b><small> / {uom?.name || uom?.pack || "unit"}</small></span>
      {uom && <button aria-label={`Add ${product.name}`} onClick={(event) => { event.stopPropagation(); setQuantity(product, uom, quantity + 1); }}><Plus /></button>}
    </div>
  </article>;
}
