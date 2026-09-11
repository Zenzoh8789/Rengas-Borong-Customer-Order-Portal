import { ChevronRight } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { SearchBox } from "../components/AppShell";
import { CategoryIcon } from "../components/CategoryIcon";
import { api, type StoreCategory } from "../services/api";
import type { Product, ProductCategory } from "../types";

const categoryName = (category: ProductCategory): string =>
  typeof category === "string"
    ? category
    : category?.name || "Uncategorised";

export function CategoriesPage() {
  const navigate = useNavigate();

  const [products, setProducts] = useState<Product[]>([]);
  const [allCategories, setAllCategories] = useState<StoreCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retry, setRetry] = useState(0);
  const [search, setSearch] = useState("");

  useEffect(() => {
    let active = true;

    setLoading(true);
    setError(null);

    Promise.all([api.categories(), api.products()])
      .then(([categoryItems, productItems]) => {
        if (!active) return;

        setAllCategories(categoryItems);
        setProducts(productItems);
      })
      .catch((error: unknown) => {
        if (!active) return;

        setError(
          error instanceof Error
            ? error.message
            : "Unable to load categories. Please try again.",
        );
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [retry]);

  const productCounts = useMemo(() => {
    const counts = new Map<string, number>();

    for (const product of products) {
      const name = categoryName(product.category);
      counts.set(name, (counts.get(name) ?? 0) + 1);
    }

    return counts;
  }, [products]);

  const categories = useMemo(() => {
    const query = search.trim().toLowerCase();

    return allCategories
      .filter((category) =>
        category.name.toLowerCase().includes(query),
      )
      .map((category) => ({
        ...category,
        count: productCounts.get(category.name) ?? 0,
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [allCategories, productCounts, search]);

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

        {!loading && error && (
          <div role="alert">
            <p>{error}</p>

            <button
              type="button"
              onClick={() => setRetry((value) => value + 1)}
            >
              Try again
            </button>
          </div>
        )}

        {!loading &&
          !error &&
          categories.map(({ id, name, count }) => (
            <button
              type="button"
              className="category-card"
              key={id}
              onClick={() =>
                navigate(`/?category=${encodeURIComponent(name)}`)
              }
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

              <ChevronRight
                className="category-chevron"
                aria-hidden="true"
              />
            </button>
          ))}

        {!loading && !error && categories.length === 0 && (
          <div className="empty" role="status">
            No categories found.
          </div>
        )}
      </div>
    </div>
  );
}