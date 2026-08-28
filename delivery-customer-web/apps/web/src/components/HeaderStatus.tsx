import { Bell, MapPin, X } from "lucide-react";
import { useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { api } from "../services/api";
import type { Order } from "../types";

const titles: Record<string, string> = {
  "/": "RENGAS",
  "/categories": "Categories",
  "/cart": "Your Cart",
  "/orders": "Order History",
  "/account": "My Account",
};

export function HeaderStatus() {
  const { profile } = useApp();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const dialog = useRef<HTMLDialogElement>(null);
  const requestId = useRef(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [orders, setOrders] = useState<Order[]>([]);

  const businessName = profile?.businessName?.trim();
  const address = profile?.address?.trim();

  const load = async () => {
    const id = ++requestId.current;
    setBusy(true);
    setError("");

    try {
      const items = await api.orders();
      if (id === requestId.current) {
        setOrders(
          [...items]
            .sort(
              (a, b) =>
                (Date.parse(b.date) || 0) - (Date.parse(a.date) || 0),
            )
            .slice(0, 10),
        );
      }
    } catch (cause) {
      if (id === requestId.current) {
        setError(
          cause instanceof Error
            ? cause.message
            : "Unable to load. Please try again.",
        );
      }
    } finally {
      if (id === requestId.current) {
        setBusy(false);
      }
    }
  };

  const open = () => {
    setOrders([]);
    setError("");
    dialog.current?.showModal();
    void load();
  };

  const close = () => {
    requestId.current += 1;
    setBusy(false);
    dialog.current?.close();
  };

  return (
    <>
      <div className="topbar-title header-location">
        <small>
          <MapPin size={16} aria-hidden />
          {businessName || "Current Location"}
        </small>
        <span className="header-address">
          {address || titles[pathname] || "RENGAS BORONG"}
        </span>
      </div>

      <button
        type="button"
        className="icon-btn notification-btn"
        aria-label="Notifications"
        aria-haspopup="dialog"
        onClick={open}
      >
        <Bell />
      </button>

      <dialog
        ref={dialog}
        className="header-status-dialog"
        aria-labelledby="header-status-title"
        onCancel={(event) => {
          event.preventDefault();
          close();
        }}
      >
        <header>
          <h2 id="header-status-title">Notifications</h2>
          <button
            type="button"
            className="icon-btn"
            aria-label="Close panel"
            onClick={close}
          >
            <X />
          </button>
        </header>

        {busy && <p role="status">Loading recent order activity…</p>}
        {error && (
          <p role="alert" className="form-error">
            {error}
          </p>
        )}

        <p className="header-status-hint">
          Recent order activity. This view is not a push-notification inbox.
        </p>

        {!busy &&
          !error &&
          (orders.length > 0 ? (
            <ul className="header-order-list">
              {orders.map((order) => (
                <li key={order.id}>
                  <strong>{order.orderNo}</strong>
                  <span>{order.status}</span>
                  <small>
                    {Number.isNaN(Date.parse(order.date))
                      ? "Date unavailable"
                      : new Date(order.date).toLocaleDateString()}
                  </small>
                </li>
              ))}
            </ul>
          ) : (
            <p>No recent order activity.</p>
          ))}

        <button
          type="button"
          className="header-status-action"
          onClick={() => {
            close();
            navigate("/orders");
          }}
        >
          View all orders
        </button>

        <button
          type="button"
          className="header-status-action"
          disabled={busy}
          onClick={() => void load()}
        >
          {error ? "Try again" : "Refresh"}
        </button>
      </dialog>
    </>
  );
}
