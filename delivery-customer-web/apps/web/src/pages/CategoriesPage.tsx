import { ChevronRight } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { SearchBox } from "../components/AppShell";
import { BrandLogo } from "../components/BrandLogo";
import { api } from "../services/api";
import type { Product, ProductCategory } from "../types";

const categoryName = (category: ProductCategory) =>
  typeof category === "string"
    ? category
    : category?.name || "Uncategorised";

const displayCategoryName = (name: string) =>
  name.replace(/\s+products$/i, "").trim();

export function CategoriesPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    let active = true;

    api
      .products()
      .then((data) => {
        if (active) {
          setProducts(data);
        }
      })
      .catch(() => {
        if (active) {
          setProducts([]);
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  const categories = useMemo(() => {
    const grouped = new Map<
      string,
      {
        name: string;
        count: number;
        imageUrl?: string | null;
      }
    >();

    for (const product of products) {
      const name = categoryName(product.category);
      const current = grouped.get(name);

      if (current) {
        current.count += 1;

        if (!current.imageUrl && product.imageUrl) {
          current.imageUrl = product.imageUrl;
        }
      } else {
        grouped.set(name, {
          name,
          count: 1,
          imageUrl: product.imageUrl,
        });
      }
    }

    const searchValue = search.trim().toLowerCase();

    return [...grouped.values()]
      .filter(
        (item) =>
          !searchValue ||
          displayCategoryName(item.name)
            .toLowerCase()
            .includes(searchValue),
      )
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [products, search]);

  const openCategory = (category: string) => {
    navigate({
      pathname: "/",
      search: `?category=${encodeURIComponent(category)}`,
    });
  };

  return (
    <div className="categories-page">
      <div className="categories-controls">
        <SearchBox
          value={search}
          onChange={setSearch}
          placeholder="Search categories..."
        />
      </div>

      <div className="categories-list">
        {loading && (
          <div className="empty">Loading categories...</div>
        )}

        {!loading &&
          categories.map((item) => (
            <button
              type="button"
              className="category-card"
              key={item.name}
              onClick={() => openCategory(item.name)}
              aria-label={`View ${displayCategoryName(item.name)} products`}
            >
              <BrandLogo
                size={68}
                src={item.imageUrl}
                alt={displayCategoryName(item.name)}
              />

              <span className="category-card-content">
                <b>{displayCategoryName(item.name)}</b>
                <small>
                  {item.count} {item.count === 1 ? "Product" : "Products"}
                </small>
              </span>

              <ChevronRight className="category-chevron" />
            </button>
          ))}

        {!loading && !categories.length && (
          <div className="empty">No categories found.</div>
        )}
      </div>
    </div>
  );
}