import { ChevronRight } from "lucide-react";
import { useEffect,useMemo,useState } from "react";
import { useNavigate } from "react-router-dom";
import { SearchBox } from "../components/AppShell";
import { CategoryIcon } from "../components/CategoryIcon";
import { api } from "../services/api";
import type { Product,ProductCategory } from "../types";
const categoryName = (c: ProductCategory) =>
  typeof c === "string" ? c : c?.name || "Uncategorised";
export function CategoriesPage() {
  const [products, setProducts] = useState<Product[]>(() => api.cachedProducts() || []);
  const [loading, setLoading] = useState(() => !api.cachedProducts());
  const [error, setError] = useState(false);
  const [retry, setRetry] = useState(0);
  const [search, setSearch] = useState("");
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
    () =>
      Array.from(
        products.reduce((m, p) => {
          const n = categoryName(p.category);
          m.set(n, (m.get(n) || 0) + 1);
          return m;
        }, new Map<string, number>()),
      )
        .filter(([n]) => n.toLowerCase().includes(search.toLowerCase()))
        .sort(([a], [b]) => a.localeCompare(b)),
    [products, search],
  );
  return (
    <div className="categories-page">
      <div className="categories-controls">
        <SearchBox
          value={search}
          onChange={setSearch}
          placeholder="Search categories..."
        />
      </div>
      <div className="categories-list category-list-modern">
        {loading && <p role="status">Loading…</p>}
        {error && <div role="alert">Unable to load. <button onClick={() => setRetry(value => value + 1)}>Try again</button></div>}
        {categories.map(([name, count]) => (
          <button
            className="category-card"
            key={name}
            onClick={() => navigate(`/?category=${encodeURIComponent(name)}`)}
          >
            <span className="category-list-icon">
              <CategoryIcon name={name} />
            </span>
            <span className="category-card-content">
              <b>{name}</b>
              <small>
                {count} {count === 1 ? "Product" : "Products"}
              </small>
            </span>
            <ChevronRight className="category-chevron" />
          </button>
        ))}
        {!loading && !error && !categories.length && (
          <div className="empty">No categories found.</div>
        )}
      </div>
    </div>
  );
}
