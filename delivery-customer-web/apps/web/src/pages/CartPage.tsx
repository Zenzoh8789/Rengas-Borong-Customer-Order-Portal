import { useRef, useState } from "react";
import { Minus, Plus, Trash2 } from "lucide-react";
import { BrandLogo } from "../components/BrandLogo";
import { useApp } from "../context/AppContext";
import { api } from "../services/api";

export function CartPage() {
  const { cart, setQuantity, clearCart, notify } = useApp();
  const [submitting, setSubmitting] = useState(false);
  const submittingRef = useRef(false);
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = cart.reduce(
    (sum, item) => sum + item.quantity * Number(item.uom.price),
    0,
  );

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
          productId: item.uom.id,
          quantity: item.quantity,
        })),
      );
      clearCart();
      notify("Order submitted successfully to RENGAS.", "success");
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
                  <button
                    className="cart-remove"
                    type="button"
                    disabled={submitting}
                    aria-label={`Remove ${item.product.name}`}
                    onClick={() => setQuantity(item.product, item.uom, 0)}
                  >
                    <Trash2 aria-hidden="true" />
                  </button>
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
