import { useEffect, useRef, useState } from "react";
import { Check, Minus, Plus, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { BrandLogo } from "../components/BrandLogo";
import { useApp } from "../context/AppContext";
import { api } from "../services/api";

function playOrderSuccessSound() {
  try {
    const AudioContextClass =
      window.AudioContext ||
      (window as typeof window & { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!AudioContextClass) return;

    const context = new AudioContextClass();
    const start = context.currentTime + 0.02;
    const strikeBell = (time: number, fundamental: number) => {
      [
        { ratio: 1, volume: 0.24, decay: 1.25 },
        { ratio: 2.01, volume: 0.12, decay: 0.95 },
        { ratio: 2.72, volume: 0.07, decay: 0.7 },
      ].forEach(({ ratio, volume, decay }) => {
        const oscillator = context.createOscillator();
        const gain = context.createGain();
        oscillator.type = "sine";
        oscillator.frequency.setValueAtTime(fundamental * ratio, time);
        gain.gain.setValueAtTime(volume, time);
        gain.gain.exponentialRampToValueAtTime(0.0001, time + decay);
        oscillator.connect(gain);
        gain.connect(context.destination);
        oscillator.start(time);
        oscillator.stop(time + decay);
      });
    };

    strikeBell(start, 784);
    strikeBell(start + 0.22, 987.77);
    window.setTimeout(() => void context.close(), 1800);
  } catch {
    // Order submission must still succeed when browser audio is unavailable.
  }
}

export function CartPage() {
  const navigate = useNavigate();
  const { cart, setQuantity, clearCart, notify } = useApp();
  const [submitting, setSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const submittingRef = useRef(false);
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = cart.reduce(
    (sum, item) => sum + item.quantity * Number(item.uom.price),
    0,
  );

  useEffect(() => {
    if (!orderSuccess) return;
    const timer = window.setTimeout(() => navigate("/orders"), 2400);
    return () => window.clearTimeout(timer);
  }, [navigate, orderSuccess]);

  const submit = async () => {
    if (submittingRef.current || !cart.length) return;
    submittingRef.current = true;
    setSubmitting(true);
    try {
      // Fetch the registered customer's latest details; no duplicate checkout form.
      const result = await api.me();
      if (
        !result.authenticated ||
        result.role !== "CUSTOMER" ||
        !result.customer
      ) {
        notify("Please sign in again to submit your order.", "error");
        return;
      }
      const profile = result.customer;
      const customer = {
        name: profile.fullName?.trim() || "",
        companyName: profile.businessName?.trim() || "",
        tinNumber: profile.tinNumber?.trim() || "",
        phoneNumber: profile.phoneNumber?.trim() || "",
        whatsappNumber: profile.whatsappNumber?.trim() || "",
        address: profile.address?.trim() || "",
      };
      if (Object.values(customer).some((value) => !value)) {
        notify(
          "Your saved signup details are incomplete. Please update your account details or contact support before ordering.",
          "error",
        );
        return;
      }
      await api.createOrder(
        customer,
        cart.map((item) => ({
          productId: item.product.id,
          quantity: item.quantity,
        })),
      );
      clearCart();
      playOrderSuccessSound();
      setOrderSuccess(true);
    } catch {
      notify(
        "Order submission failed. Please check the connection and try again.",
        "error",
      );
    } finally {
      submittingRef.current = false;
      setSubmitting(false);
    }
  };

  return (
    <div className="cart-page cart-redesign" aria-busy={submitting}>
      {orderSuccess && (
        <div className="order-success-screen" role="status" aria-live="assertive">
          <div className="order-success-check" aria-hidden="true">
            <Check />
          </div>
          <h1>Order Placed!</h1>
          <p>Thank you! We’ve received your order and will start preparing it shortly.</p>
          <span>Opening order tracking…</span>
        </div>
      )}
      <header className="cart-title">
        <h1>My Cart ({cart.length})</h1>
      </header>
      {!cart.length ? (
        <div className="empty">Cart empty. Add products first.</div>
      ) : (
        <>
          <div className="cart-lines">
            {cart.map((item) => (
              <article
                className="cart-line"
                key={`${item.product.id}-${item.uom.id}`}
              >
                <button
                  className="cart-remove"
                  type="button"
                  disabled={submitting}
                  aria-label={`Remove ${item.product.name}`}
                  onClick={() => setQuantity(item.product, item.uom, 0)}
                >
                  <X  size={24} strokeWidth={4}  aria-hidden="true" />
                </button>
                <BrandLogo
                  size={64}
                  src={item.product.imageUrl}
                  alt={item.product.name}
                />
                <div className="cart-line-info">
                  <h2>{item.product.name}</h2>
                  <p>{item.uom.pack || item.uom.name}</p>
                  <div className="cart-line-price">
                    <strong>RM {Number(item.uom.price).toFixed(2)}</strong>
                    <span> / {item.uom.name || "unit"}</span>
                  </div>
                </div>
                <div className="cart-line-actions">
                  <div className="cart-quantity">
                    <button
                      type="button"
                      disabled={submitting}
                      aria-label={`Decrease ${item.product.name}`}
                      onClick={() =>
                        setQuantity(
                          item.product,
                          item.uom,
                          Math.max(0, item.quantity - 1),
                        )
                      }
                    >
                      <Minus aria-hidden="true" />
                    </button>
                    <span
                      aria-live="polite"
                      aria-label={`Quantity for ${item.product.name}`}
                    >
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      disabled={submitting}
                      aria-label={`Increase ${item.product.name}`}
                      onClick={() =>
                        setQuantity(item.product, item.uom, item.quantity + 1)
                      }
                    >
                      <Plus aria-hidden="true" />
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
          <section className="cart-summary" aria-label="Order summary">
            <div>
              <span>Total Items</span>
              <strong>{totalItems}</strong>
            </div>
            <div>
              <span>Total Amount</span>
              <strong>RM {totalAmount.toFixed(2)}</strong>
            </div>
            <button
              type="button"
              className="checkout"
              disabled={submitting}
              onClick={submit}
            >
              {submitting ? "SUBMITTING..." : "SUBMIT ORDER"}
            </button>
          </section>
        </>
      )}
    </div>
  );
}
