import { CategoryIcon } from "../components/CategoryIcon";
import { useDeferredValue, useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ProductCard } from "../components/ProductCard";
import { SearchBox } from "../components/AppShell";
import { api } from "../services/api";
import type { Product, ProductCategory } from "../types";
const categoryName = (category: ProductCategory) =>
  typeof category === "string" ? category : category?.name || "Uncategorised";
export function HomePage() {
  const [products, setProducts] = useState<Product[]>(() => api.cachedProducts() || []);
  const [loading, setLoading] = useState(() => !api.cachedProducts());
  const [error, setError] = useState(false);
  const [retry, setRetry] = useState(0);
  const [search, setSearch] = useState("");
  const [params] = useSearchParams();
  const navigate = useNavigate();
  useEffect(() => {
    let active = true;
    setLoading(!api.cachedProducts()); setError(false);
    api.products().then(items => { if (active) setProducts(items); })
      .catch(() => { if (active) setError(true); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [retry]);
  const categories = useMemo(
    () => [
      "All",
      ...Array.from(
        new Set(products.map((p) => categoryName(p.category))),
      ).sort(),
    ],
    [products],
  );
  const deferredSearch = useDeferredValue(search);
  const grouped = useMemo(() => {
    const result = new Map<string, Product[]>();
    for (const product of products) {
      const name = categoryName(product.category);
      const group = result.get(name) || [];
      if (group.length < 3) group.push(product);
      result.set(name, group);
    }
    return result;
  }, [products]);
  const requested = params.get("category") || "All";
  const matching = products.filter(
    (p) =>
      (requested === "All" || categoryName(p.category) === requested) &&
      `${p.name} ${p.code} ${p.subtitle || ""}`
        .toLowerCase()
        .includes(deferredSearch.toLowerCase()),
  );
  const sections =
    requested !== "All" || search
      ? [
          [
            requested === "All" ? "Search results" : requested,
            matching,
          ] as const,
        ]
      : categories
          .slice(1)
          .map(
            (name) =>
              [
                name,
                grouped.get(name) || [],
              ] as const,
          );
  const open = (name: string) =>
    navigate(name === "All" ? "/" : `/?category=${encodeURIComponent(name)}`);
  return (
    <div className="home-page storefront-page">
      <div className="home-controls storefront-controls">
        <SearchBox
          value={search}
          onChange={setSearch}
          placeholder="Search products..."
        />
        <div className="category-tiles">
          {categories.map((name) => (
            <button
              key={name}
              className={requested === name ? "active" : ""}
              onClick={() => open(name)}
            >
              <span>
                <CategoryIcon name={name} />
              </span>
              <b>{name.replace(/\s+products$/i, "")}</b>
            </button>
          ))}
        </div>
      </div>
      <div className="storefront-scroll">
        {loading && <p role="status">Loading…</p>}
        {error && <div role="alert">Unable to load. <button onClick={() => setRetry(value => value + 1)}>Try again</button></div>}
        {sections.map(
          ([name, items]) =>
            items.length > 0 && (
              <section className="product-section" key={name}>
                <header>
                  <div>
                    <h2>{name.replace(/\s+products$/i, "")}</h2>
                  </div>
                  <button onClick={() => open(name)}>See more</button>
                </header>
                <div className="product-row">
                  {items.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              </section>
            ),
        )}
        {!loading && !error && !matching.length && (search || requested !== "All") && (
          <div className="empty">No products found.</div>
        )}
      </div>
    </div>
  );
}
