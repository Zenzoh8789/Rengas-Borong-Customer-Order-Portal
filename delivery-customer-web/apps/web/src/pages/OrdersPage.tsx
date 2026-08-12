import { RefreshCw } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { SearchBox } from "../components/AppShell";
import { api } from "../services/api";
import type { Order } from "../types";

export function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadOrders = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const result = await api.orders();
      setOrders(result);
    } catch (requestError) {
      setOrders([]);
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to load orders.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadOrders();
  }, [loadOrders]);

  const filteredOrders = useMemo(() => {
    const value = search.trim().toLowerCase();

    if (!value) {
      return orders;
    }

    return orders.filter((order) =>
      [
        order.orderNo,
        order.date,
        order.status,
        order.customer?.name,
        order.customer?.companyName,
        order.customer?.tinNumber,
        order.customer?.phoneNumber,
        order.customer?.whatsappNumber,
        order.customer?.address,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(value),
    );
  }, [orders, search]);

  return (
    <div className="orders-page">
      <div className="orders-controls">
        <SearchBox
          value={search}
          onChange={setSearch}
          placeholder="Search order number / customer / status..."
        />

        <div className="orders-heading">
          <span>
            <b>Orders</b>
            <small>{filteredOrders.length} orders</small>
          </span>

          <button
            type="button"
            className="orders-refresh"
            onClick={() => void loadOrders()}
            disabled={loading}
            aria-label="Refresh orders"
          >
            <RefreshCw className={loading ? "spinning" : ""} size={18} />
          </button>
        </div>
      </div>

      <div className="orders-scroll">
        {loading && <div className="empty">Loading orders...</div>}

        {!loading && error && (
          <div className="orders-error">
            <p>{error}</p>
            <button type="button" onClick={() => void loadOrders()}>
              Try again
            </button>
          </div>
        )}

        {!loading && !error && !filteredOrders.length && (
          <div className="empty">
            {search ? "No matching orders found." : "No orders found."}
          </div>
        )}

        {!loading &&
          !error &&
          filteredOrders.map((order) => (
            <article className="order-card" key={order.id}>
              <div className="order-main">
                <span>
                  <b>{order.orderNo}</b>
                  <small>
                    {order.date} • {order.itemCount} items
                  </small>
                </span>

                <span className="order-summary">
                  <b>RM {Number(order.total).toFixed(2)}</b>
                  <em className={`status status-${order.status.toLowerCase()}`}>
                    {order.status}
                  </em>
                </span>
              </div>

              {order.customer && (
                <div className="order-customer">
                  <b>{order.customer.name}</b>

                  {order.customer.companyName && (
                    <span>{order.customer.companyName}</span>
                  )}

                {order.customer.tinNumber && (
                  <span>TIN: {order.customer.tinNumber}</span>
                )}

                {order.customer.phoneNumber && (
                  <span>Phone: {order.customer.phoneNumber}</span>
                )}

                {order.customer.whatsappNumber && (
                  <span>
                    WhatsApp: {order.customer.whatsappNumber}
                  </span>
                )}

                {order.customer.address && (
                  <span className="customer-address">
                    {order.customer.address}
                  </span>
                )}
                </div>
              )}
            </article>
          ))}
      </div>
    </div>
  );
}