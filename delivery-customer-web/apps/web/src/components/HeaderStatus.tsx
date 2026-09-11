import { Bell,MapPin,X } from "lucide-react";
import { useEffect,useRef,useState } from "react";
import { useLocation,useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { api } from "../services/api";
import type { Order } from "../types";

type RecentOrder = Pick<Order, "id" | "orderNo" | "date" | "status">;

const titles: Record<string, string> = {
  "/": "RENGAS",
  "/categories": "Categories",
  "/cart": "Your Cart",
  "/orders": "Order History",
  "/account": "My Account",
};
const NOTIFICATION_SEEN_KEY = "rengas-orders-seen";
const orderSignature = (items: RecentOrder[]) =>
  [...items]
    .sort((a, b) => Number(b.id) - Number(a.id))
    .map((order) => `${order.id}:${order.status}`)
    .join("|");

export function HeaderStatus() {
  const { profile } = useApp();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const dialog = useRef<HTMLDialogElement>(null);
  const requestId = useRef(0);
  const [loaded, setLoaded] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [orders, setOrders] = useState<RecentOrder[]>([]);
  const [hasUnread, setHasUnread] = useState(false);

  const seenKey = `${NOTIFICATION_SEEN_KEY}:${profile?.id || "customer"}`;
  const businessName = profile?.businessName?.trim();
  const address = profile?.address?.trim();

  const load = async (showLoading = true, markSeen = false) => {
    const id = ++requestId.current;
    if (showLoading) setBusy(true);
    setError("");

    try {
      const items = await api.recentOrders();
      if (id === requestId.current) {
        const recent = [...items]
            .sort(
              (a, b) =>
                (Date.parse(b.date) || 0) - (Date.parse(a.date) || 0),
            )
            .slice(0, 10);
        setOrders(recent);
        setLoaded(true);
        const signature = orderSignature(recent);
        let seen: string | null = null;
        try { seen = localStorage.getItem(seenKey); } catch { /* Optional seen marker. */ }
        if (markSeen || seen === null) {
          try { localStorage.setItem(seenKey, signature); } catch { /* Keep notifications usable without storage. */ }
          setHasUnread(false);
        } else {
          setHasUnread(signature !== seen);
        }
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

  useEffect(() => {
    void load(false);
    const timer = window.setInterval(() => { if (!document.hidden && !dialog.current?.open) void load(false); }, 30_000);
    return () => { window.clearInterval(timer); requestId.current += 1; };
  }, []);

  const open = () => {
    setError("");
    dialog.current?.showModal();
    void load(!loaded, true);
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
          <span className="header-shop-name" title={businessName || "Current Location"}>{businessName || "Current Location"}</span>
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
        {hasUnread && <b aria-label="New notification" />}
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

        {busy && !loaded && <p role="status">Loading recent order activity…</p>}
        {error && (
          <p role="alert" className="form-error">
            {error}
          </p>
        )}

{loaded &&
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
          onClick={() => void load(true, true)}
        >
          {error ? "Try again" : "Refresh"}
        </button>
      </dialog>
    </>
  );
}
