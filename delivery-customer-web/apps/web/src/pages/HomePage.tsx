import {
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

const categoryName = (category: ProductCategory): string =>
  typeof category === "string"
    ? category
    : category?.name || "Uncategorised";

export function HomePage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const categoryTilesRef = useRef<HTMLDivElement>(null);
  const selectedCategoryRef = useRef<HTMLButtonElement>(null);

  const [products, setProducts] = useState<Product[]>(
    () => api.cachedProducts() || [],
  );
  const [loading, setLoading] = useState(() => !api.cachedProducts());
  const [error, setError] = useState(false);
  const [retry, setRetry] = useState(0);
  const [search, setSearch] = useState("");

  const requested = params.get("category") || "All";
  const query = search.trim().toLowerCase();
  const isFiltered = requested !== "All" || query.length > 0;

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

  const indexedProducts = useMemo(
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

  // Bring the selected category into view without scrolling the page.
  useLayoutEffect(() => {
    const container = categoryTilesRef.current;
    const selected = selectedCategoryRef.current;

    if (!container || !selected) return;

    const centerSelectedCategory = () => {
      const containerRect = container.getBoundingClientRect();
      const selectedRect = selected.getBoundingClientRect();

      const targetLeft =
        container.scrollLeft +
        selectedRect.left -
        containerRect.left -
        container.clientLeft -
        (container.clientWidth - selectedRect.width) / 2;

      const maxScrollLeft = Math.max(
        0,
        container.scrollWidth - container.clientWidth,
      );

      container.scrollTo({
        left: Math.max(0, Math.min(targetLeft, maxScrollLeft)),
        behavior: "instant",
      });
    };

    centerSelectedCategory();

    // Reposition when the viewport or category dimensions change.
    const observer = new ResizeObserver(centerSelectedCategory);
    observer.observe(container);

    for (const child of Array.from(container.children)) {
      observer.observe(child);
    }

    return () => {
      observer.disconnect();
    };
  }, [requested, categories]);

  const grouped = useMemo(() => {
    const result = new Map<string, Product[]>();

    for (const { product, category } of indexedProducts) {
      const group = result.get(category);

      if (!group) {
        result.set(category, [product]);
      } else if (group.length < 3) {
        group.push(product);
      }
    }

    return result;
  }, [indexedProducts]);

  const matching = useMemo(
    () =>
      indexedProducts
        .filter(
          (item) =>
            (requested === "All" || item.category === requested) &&
            (!query || item.searchText.includes(query)),
        )
        .map((item) => item.product),
    [indexedProducts, requested, query],
  );

  const sections = useMemo(() => {
    if (isFiltered) {
      return [
        [
          requested === "All" ? "Search results" : requested,
          matching,
        ] as const,
      ];
    }

    return categories
      .slice(1)
      .map((name) => [name, grouped.get(name) || []] as const);
  }, [isFiltered, requested, matching, categories, grouped]);

  const openCategory = (name: string) => {
    navigate(
      name === "All"
        ? "/"
        : `/?category=${encodeURIComponent(name)}`,
    );
  };

  return (
    <div className="home-page storefront-page">
      <div className="home-controls storefront-controls">
        <SearchBox
          value={search}
          onChange={setSearch}
          placeholder="Search products..."
        />

        <div className="category-tiles" ref={categoryTilesRef}>
          {categories.map((name) => {
            const isSelected = requested === name;

            return (
              <button
                type="button"
                key={name}
                ref={isSelected ? selectedCategoryRef : null}
                className={isSelected ? "active" : ""}
                aria-pressed={isSelected}
                onClick={() => openCategory(name)}
              >
                <span>
                  <CategoryIcon name={name} />
                </span>
                <b>{name}</b>
              </button>
            );
          })}
        </div>
      </div>

      <div className="storefront-scroll">
        {loading && <p role="status">Loading…</p>}

        {error && (
          <div role="alert">
            Unable to load.{" "}
            <button
              type="button"
              onClick={() => setRetry((value) => value + 1)}
            >
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
                    onClick={() => openCategory(name)}
                  >
                    See more
                  </button>
                )}
              </header>

              <div className="product-row">
                {items.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                  />
                ))}
              </div>
            </section>
          ) : null,
        )}

        {!loading &&
          !error &&
          isFiltered &&
          matching.length === 0 && (
            <div className="empty" role="status">
              No products found.
            </div>
          )}
      </div>
    </div>
  );
}