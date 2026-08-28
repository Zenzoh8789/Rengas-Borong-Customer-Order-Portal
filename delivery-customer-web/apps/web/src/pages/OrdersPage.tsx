import { RefreshCw } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { SearchBox } from "../components/AppShell";
import { BrandLogo } from "../components/BrandLogo";
import { api } from "../services/api";
import type { Order, OrderLine } from "../types";

// The order API must return items to display purchased products.
interface DisplayOrder extends Order {
  items?: OrderLine[];
}
const stages = ["Accepted", "Packed", "Shipped", "Delivered"];

export function OrdersPage() {
  const [orders, setOrders] = useState<DisplayOrder[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const loadOrders = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setOrders(await api.orders());
    } catch {
      setError("Unable to load orders. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    void loadOrders();
  }, [loadOrders]);
  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return orders.filter((order) =>
      [order.orderNo, order.date, order.status]
        .join(" ")
        .toLowerCase()
        .includes(query),
    );
  }, [orders, search]);

  return (
    <div className="orders-page orders-redesign">
      <div className="orders-controls">
        <SearchBox
          value={search}
          onChange={setSearch}
          placeholder="Search orders..."
        />
        <header className="tracking-heading">
          <h1>Orders ({filtered.length})</h1>
          <button
            type="button"
            className="tracking-refresh"
            onClick={() => void loadOrders()}
            disabled={loading}
            aria-label="Refresh orders"
          >
            <RefreshCw size={18} />
          </button>
        </header>
      </div>
      <div className="orders-scroll">
        {loading ? (
          <p role="status">Loading orders...</p>
        ) : error ? (
          <div role="alert">
            <p>{error}</p>
            <button type="button" onClick={() => void loadOrders()}>
              Try again
            </button>
          </div>
        ) : !filtered.length ? (
          <p>No orders found.</p>
        ) : (
          filtered.map((order) => {
            const stage = stages.findIndex(
              (label) =>
                label.toLowerCase() ===
                (order.status || "").trim().toLowerCase(),
            );
            const items = Array.isArray(order.items) ? order.items : [];
            return (
              <article className="tracking-card" key={order.id}>
                <header className="tracking-card-header">
                  <div>
                    <h2>{order.orderNo}</h2>
                    <p>
                      {order.date} · {order.itemCount} items
                    </p>
                  </div>
                  <strong>RM {Number(order.total).toFixed(2)}</strong>
                </header>
                {items.length ? (
                  <ul
                    className="tracking-products"
                    aria-label={`Products in order ${order.orderNo}`}
                  >
                    {items.map((item) => (
                      <li
                        key={item.id}
                        title={`${item.product.name} × ${item.quantity}`}
                      >
                        <BrandLogo
                          size={68}
                          src={item.product.imageUrl}
                          alt={item.product.name}
                        />
                        <span
                          className="tracking-quantity"
                          aria-label={`Quantity ${item.quantity}`}
                        >
                          {item.quantity}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="tracking-unavailable">
                    Product items are not available for this order.
                  </p>
                )}
                <section
                  className="tracking-section"
                  aria-label={`Tracking for ${order.orderNo}`}
                >
                  <h3>Track</h3>
                  <ol className="tracking-steps">
                    {stages.map((label, index) => (
                      <li
                        key={label}
                        className={index <= stage ? "reached" : ""}
                        aria-current={index === stage ? "step" : undefined}
                      >
                        <span className="tracking-dot" aria-hidden="true" />
                        <span>{label}</span>
                      </li>
                    ))}
                  </ol>
                  {stage < 0 && (
                    <p className="tracking-unavailable">
                      Delivery tracking is not available yet.
                    </p>
                  )}
                </section>
              </article>
            );
          })
        )}
      </div>
    </div>
  );
}
