import {
  memo,
  useCallback,
  useDeferredValue,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { SearchBox } from "../components/AppShell";
import { CategoryIcon } from "../components/CategoryIcon";
import { ProductCard } from "../components/ProductCard";
import { api } from "../services/api";
import type { Product, ProductCategory } from "../types";

const PAGE_SIZE = 30;
const MemoProductCard = memo(ProductCard);

type IndexedProduct = {
  product: Product;
  category: string;
  searchText: string;
};

const categoryName = (category: ProductCategory): string =>
  typeof category === "string"
    ? category
    : category?.name || "Uncategorised";

const CategoryMenu = memo(function CategoryMenu({
  categories,
  selected,
  onSelect,
}: {
  categories: string[];
  selected: string;
  onSelect: (name: string) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const selectedRef = useRef<HTMLButtonElement>(null);

  useLayoutEffect(() => {
    const container = containerRef.current;
    const button = selectedRef.current;

    if (!container || !button) return;

    const centerSelected = () => {
      const containerRect = container.getBoundingClientRect();
      const buttonRect = button.getBoundingClientRect();

      const left =
        container.scrollLeft +
        buttonRect.left -
        containerRect.left -
        container.clientLeft -
        (container.clientWidth - buttonRect.width) / 2;

      const maxLeft = Math.max(
        0,
        container.scrollWidth - container.clientWidth,
      );

      container.scrollTo({
        left: Math.max(0, Math.min(left, maxLeft)),
        behavior: "instant",
      });
    };

    centerSelected();

    const observer = new ResizeObserver(centerSelected);
    observer.observe(container);

    for (const child of Array.from(container.children)) {
      observer.observe(child);
    }

    return () => observer.disconnect();
  }, [categories, selected]);

  return (
    <div className="category-tiles" ref={containerRef}>
      {categories.map((name) => {
        const active = selected === name;

        return (
          <button
            type="button"
            key={name}
            ref={active ? selectedRef : null}
            className={active ? "active" : ""}
            aria-pressed={active}
            onClick={() => onSelect(name)}
          >
            <span>
              <CategoryIcon name={name} />
            </span>
            <b>{name}</b>
          </button>
        );
      })}
    </div>
  );
});

const ProductResults = memo(function ProductResults({
  indexedProducts,
  query,
  category,
  loading,
  error,
  onRetry,
  onSelectCategory,
}: {
  indexedProducts: IndexedProduct[];
  query: string;
  category: string;
  loading: boolean;
  error: boolean;
  onRetry: () => void;
  onSelectCategory: (name: string) => void;
}) {
  const sentinelRef = useRef<HTMLDivElement>(null);
  const [limit, setLimit] = useState(PAGE_SIZE);

  const isFiltered = category !== "All" || query.length > 0;

  const matching = useMemo(() => {
    if (!isFiltered) return [];

    return indexedProducts
      .filter(
        (item) =>
          (category === "All" || item.category === category) &&
          (!query || item.searchText.includes(query)),
      )
      .map((item) => item.product);
  }, [indexedProducts, category, query, isFiltered]);

  const overview = useMemo(() => {
    const groups = new Map<string, Product[]>();

    for (const { product, category: name } of indexedProducts) {
      const group = groups.get(name);

      if (!group) {
        groups.set(name, [product]);
      } else if (group.length < 3) {
        group.push(product);
      }
    }

    return Array.from(groups).sort(([a], [b]) => a.localeCompare(b));
  }, [indexedProducts]);

  const sections = useMemo(
    () =>
      isFiltered
        ? [
            [
              category === "All" ? "Search results" : category,
              matching.slice(0, limit),
            ] as const,
          ]
        : overview,
    [isFiltered, category, matching, limit, overview],
  );

  const hasMore = isFiltered && limit < matching.length;

  useEffect(() => {
    const sentinel = sentinelRef.current;

    if (!sentinel || !hasMore || loading || error) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;

        // One batch per observer, including when callbacks are queued.
        observer.disconnect();

        setLimit((current) =>
          Math.min(current + PAGE_SIZE, matching.length),
        );
      },
      {
        root: null,
        rootMargin: "200px",
        threshold: 0,
      },
    );

    observer.observe(sentinel);

    return () => observer.disconnect();
  }, [hasMore, limit, matching.length, loading, error]);

  return (
    <>
      {loading && <p role="status">Loading…</p>}

      {error && (
        <div role="alert">
          Unable to load.{" "}
          <button type="button" onClick={onRetry}>
            Try again
          </button>
        </div>
      )}

      {sections.map(([name, items]) =>
        items.length > 0 ? (
          <section className="product-section" key={name}>
            <header>
              <div>
                <h2>{name}</h2>
              </div>

              {!isFiltered && (
                <button
                  type="button"
                  onClick={() => onSelectCategory(name)}
                >
                  See more
                </button>
              )}
            </header>

            <div className="product-row">
              {items.map((product) => (
                <MemoProductCard
                  key={product.id}
                  product={product}
                />
              ))}

              {hasMore && (
                <div
                  ref={sentinelRef}
                  className="product-load-sentinel"
                  aria-hidden="true"
                />
              )}
            </div>
          </section>
        ) : null,
      )}

      {!loading && !error && isFiltered && matching.length === 0 && (
        <div className="empty" role="status">
          No products found.
        </div>
      )}
    </>
  );
});

export function HomePage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const [products, setProducts] = useState<Product[]>(
    () => api.cachedProducts() || [],
  );
  const [loading, setLoading] = useState(() => !api.cachedProducts());
  const [error, setError] = useState(false);
  const [retry, setRetry] = useState(0);
  const [search, setSearch] = useState("");

  const requested = params.get("category") || "All";

  // Keep the input responsive while React updates the result list.
  const deferredQuery = useDeferredValue(search.trim().toLowerCase());

  useEffect(() => {
    let active = true;

    setLoading(!api.cachedProducts());
    setError(false);

    api.products()
      .then((items) => {
        if (active) setProducts(items);
      })
      .catch(() => {
        if (active) setError(true);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [retry]);

  const indexedProducts = useMemo<IndexedProduct[]>(
    () =>
      products.map((product) => ({
        product,
        category: categoryName(product.category),
        searchText: [
          product.name,
          product.code,
          product.subtitle,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase(),
      })),
    [products],
  );

  const categories = useMemo(
    () => [
      "All",
      ...Array.from(
        new Set(indexedProducts.map((item) => item.category)),
      ).sort(),
    ],
    [indexedProducts],
  );

  const openCategory = useCallback(
    (name: string) => {
      navigate(
        name === "All"
          ? "/"
          : `/?category=${encodeURIComponent(name)}`,
      );
    },
    [navigate],
  );

  const retryLoading = useCallback(() => {
    setRetry((value) => value + 1);
  }, []);

  return (
    <div className="home-page storefront-page">
      <div className="home-controls storefront-controls">
        <SearchBox
          value={search}
          onChange={setSearch}
          placeholder="Search products..."
        />

        <CategoryMenu
          categories={categories}
          selected={requested}
          onSelect={openCategory}
        />
      </div>

      <div className="storefront-scroll">
        <ProductResults
          key={JSON.stringify([requested, deferredQuery])}
          indexedProducts={indexedProducts}
          query={deferredQuery}
          category={requested}
          loading={loading}
          error={error}
          onRetry={retryLoading}
          onSelectCategory={openCategory}
        />
      </div>
    </div>
  );
}