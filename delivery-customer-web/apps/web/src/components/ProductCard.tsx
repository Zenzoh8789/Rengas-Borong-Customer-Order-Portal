import { useCallback, useEffect, useRef, useState } from "react";
import type { Product } from "../types";
import { useApp } from "../context/AppContext";
import { BrandLogo } from "./BrandLogo";

export function ProductCard({ product }: { product: Product }) {
  const uomTrack = useRef<HTMLDivElement>(null);
  const [scrollState, setScrollState] = useState({ visible: false, size: 100, left: 0 });
  const { cart, setQuantity } = useApp();
  const qty = (uomId: number) =>
    cart.find((x) => x.product.id === product.id && x.uom.id === uomId)
      ?.quantity || 0;
  const total = product.uoms.reduce((n, u) => n + qty(u.id), 0);
  const selected = product.uoms.filter((u) => qty(u.id) > 0).length;
  const totalPrice = product.uoms.reduce(
    (sum, u) => sum + qty(u.id) * Number(u.price),
    0,
  );
  const updateIndicator = useCallback(() => {
    const track = uomTrack.current;
    if (!track) return;
    const overflow = track.scrollWidth > track.clientWidth + 2;
    const size = overflow ? Math.max(24, (track.clientWidth / track.scrollWidth) * 100) : 100;
    const maxScroll = Math.max(1, track.scrollWidth - track.clientWidth);
    const left = overflow ? (track.scrollLeft / maxScroll) * (100 - size) : 0;
    setScrollState({ visible: overflow, size, left });
  }, []);

  useEffect(() => {
    updateIndicator();
    const observer = new ResizeObserver(updateIndicator);
    if (uomTrack.current) observer.observe(uomTrack.current);
    window.addEventListener("resize", updateIndicator);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", updateIndicator);
    };
  }, [product.uoms.length, updateIndicator]);
  return (
    <article className="product-card">
      <div className="product-head">
        <BrandLogo size={70} src={product.imageUrl} alt={product.name} />
        <div className="product-title">
          <h3>{product.name}</h3>
          <p>{product.subtitle}</p>
        </div>
        <div className="product-price">
          <strong>RM {totalPrice.toFixed(2)}</strong>
          <span>
            {selected ? `${selected} UOMs • ${total} Qty` : "Select a UOM"}
          </span>
        </div>
      </div>
      <div className="uom-label">
        <span>
          <b>AVAILABLE UOMS</b> (Select and set quantity)
        </span>
      </div>
      <div className="uom-scroll" ref={uomTrack} onScroll={updateIndicator}>
        {product.uoms.map((u) => (
          <div className={`uom-card ${qty(u.id) ? "selected" : ""}`} key={u.id}>
            <b>{u.name}</b>
            <small>
              RM {u.price.toFixed(2)} / {u.pack}
            </small>
            <div className="stepper">
              <button
                onClick={() =>
                  setQuantity(product, u, Math.max(0, qty(u.id) - 1))
                }
                aria-label={`Decrease ${u.name}`}
              >
                −
              </button>
              <span>{qty(u.id)}</span>
              <button
                onClick={() => setQuantity(product, u, qty(u.id) + 1)}
                aria-label={`Increase ${u.name}`}
              >
                +
              </button>
            </div>
          </div>
        ))}
      </div>
      {scrollState.visible && (
        <div className="uom-scroll-indicator" aria-hidden="true">
          <span style={{ width: `${scrollState.size}%`, left: `${scrollState.left}%` }} />
        </div>
      )}
      <div className="product-foot">
       <span>Available {product.uoms.length} UOMs</span>
        <b>Total Quantity: {total}</b>
      </div>
    </article>
  );
}
