import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { ProductCard } from "../components/ProductCard";
import { SearchBox } from "../components/AppShell";
import { api } from "../services/api";
import type { Product, ProductCategory } from "../types";

const categoryName = (category: ProductCategory) =>
  typeof category === "string" ? category : category?.name || "Uncategorised";

export function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryTrack = useRef<HTMLDivElement>(null);

  useEffect(() => {
    api
      .products()
      .then(setProducts)
      .catch(() => setProducts([]));
  }, []);

  const categories = useMemo(
    () => [
      "All",
      ...Array.from(
        new Set(products.map((product) => categoryName(product.category))),
      ).sort((a, b) => a.localeCompare(b)),
    ],
    [products],
  );

  useEffect(() => {
    const requested = searchParams.get("category");
    if (requested && categories.includes(requested)) setCategory(requested);
  }, [categories, searchParams]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      const track = categoryTrack.current;
      if (!track || track.scrollWidth <= track.clientWidth) return;
      const atEnd =
        track.scrollLeft + track.clientWidth >= track.scrollWidth - 8;
      track.scrollTo({
        left: atEnd
          ? 0
          : track.scrollLeft + Math.max(180, track.clientWidth * 0.7),
        behavior: "smooth",
      });
    }, 3500);
    return () => window.clearInterval(timer);
  }, [categories.length]);

  const filtered = useMemo(
    () =>
      products.filter(
        (product) =>
          (category === "All" || categoryName(product.category) === category) &&
          `${product.name} ${product.code} ${product.uoms.map((uom) => uom.name)}`
            .toLowerCase()
            .includes(search.toLowerCase()),
      ),
    [products, search, category],
  );

  return (
    <div className="home-page">
      <div className="home-controls">
        <SearchBox
          value={search}
          onChange={setSearch}
          placeholder="Search name / code / UOM / price..."
        />
        <div className="category-slider category-slider-no-arrows">
          <div className="chips" ref={categoryTrack}>
            {categories.map((name) => (
              <button
                key={name}
                className={category === name ? "active" : ""}
                onClick={() => {
                  setCategory(name);
                  setSearchParams(name === "All" ? {} : { category: name });
                }}
              >
                {name}
              </button>
            ))}
          </div>
        </div>
        <div className="section-title">
          <h2>{category === "All" ? "All Products" : category}</h2>
          <span>{filtered.length} items</span>
        </div>
      </div>
      <div className="products-list">
        {filtered.map((product) => (
          <ProductCard product={product} key={product.id} />
        ))}
        {!filtered.length && <div className="empty">No products found.</div>}
      </div>
    </div>
  );
}
