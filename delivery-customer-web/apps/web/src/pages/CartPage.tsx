import { useMemo, useState } from "react";
import { SearchBox } from "../components/AppShell";
import { BrandLogo } from "../components/BrandLogo";
import { useApp } from "../context/AppContext";
import { api } from "../services/api";
import "../checkout.css";

export function CartPage() {
  const [search, setSearch] = useState("");

  const [name, setName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [tinNumber, setTinNumber] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [address, setAddress] = useState("");

  const [submitting, setSubmitting] = useState(false);

  const {
    cart,
    setQuantity,
    clearCart,
    notify,
  } = useApp();

  const shown = useMemo(() => {
    const searchValue = search.trim().toLowerCase();

    return cart.filter((item) =>
      [
        item.product.name,
        item.product.code,
        item.uom.name,
        item.uom.pack,
      ]
        .join(" ")
        .toLowerCase()
        .includes(searchValue),
    );
  }, [cart, search]);

  const totalItems = cart.reduce(
    (total, item) => total + item.quantity,
    0,
  );

  const totalAmount = cart.reduce(
    (total, item) =>
      total +
      item.quantity * Number(item.uom.price),
    0,
  );

  const resetForm = () => {
    setName("");
    setCompanyName("");
    setTinNumber("");
    setPhoneNumber("");
    setWhatsappNumber("");
    setAddress("");
  };

  const submit = async () => {
    if (!name.trim()) {
      notify(
        "Please enter the customer name.",
        "error",
      );
      return;
    }

    if (!companyName.trim()) {
      notify(
        "Please enter the company name.",
        "error",
      );
      return;
    }
    if (!tinNumber.trim()) {
      notify("Please enter the TIN number.", "error");
      return;
    }

    if (!phoneNumber.trim()) {
      notify(
        "Please enter the phone number.",
        "error",
      );
      return;
    }

    if (!whatsappNumber.trim()) {
      notify(
        "Please enter the WhatsApp number.",
        "error",
      );
      return;
    }

    if (!address.trim()) {
      notify(
        "Please enter the delivery address.",
        "error",
      );
      return;
    }

    if (!cart.length) {
      notify(
        "Your cart is empty. Add products before submitting.",
        "error",
      );
      return;
    }

    setSubmitting(true);

    try {
      await api.createOrder(
        {
          name: name.trim(),
          companyName: companyName.trim(),
          tinNumber: tinNumber.trim(),
          phoneNumber: phoneNumber.trim(),
          whatsappNumber: whatsappNumber.trim(),
          address: address.trim(),
        },
        cart.map((item) => ({
          productId: item.uom.id,
          quantity: item.quantity,
        })),
      );

      clearCart();
      resetForm();

      notify(
        "Order submitted successfully to RENGAS.",
        "success",
      );
    } catch (error) {
      console.error(
        "Order submission failed:",
        error,
      );

      notify(
        "Order submission failed. Please check the connection and try again.",
        "error",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="cart-page">
      <div className="cart-controls">
        <SearchBox
          value={search}
          onChange={setSearch}
          placeholder="Search cart items..."
        />
      </div>

      <div className="cart-scroll">
        {!cart.length ? (
          <div className="empty">
            Cart empty. Add products first.
          </div>
        ) : (
          <>
            <div className="cart-list">
              {shown.map((item) => (
                <div
                  className="cart-item"
                  key={`${item.product.id}-${item.uom.id}`}
                >
                  <BrandLogo
                    size={48}
                    src={item.product.imageUrl}
                    alt={item.product.name}
                  />

                  <span className="cart-item-details">
                    <b>{item.product.name}</b>

                    <small>
                      {item.uom.name} • RM{" "}
                      {Number(
                        item.uom.price,
                      ).toFixed(2)}
                    </small>
                  </span>

                  <div className="mini-stepper">
                    <button
                      type="button"
                      onClick={() =>
                        setQuantity(
                          item.product,
                          item.uom,
                          Math.max(
                            0,
                            item.quantity - 1,
                          ),
                        )
                      }
                      aria-label={`Decrease ${item.product.name}`}
                    >
                      −
                    </button>

                    <b>{item.quantity}</b>

                    <button
                      type="button"
                      onClick={() =>
                        setQuantity(
                          item.product,
                          item.uom,
                          item.quantity + 1,
                        )
                      }
                      aria-label={`Increase ${item.product.name}`}
                    >
                      +
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {!shown.length && (
              <div className="empty">
                No matching cart items.
              </div>
            )}
          </>
        )}

        <div className="totals">
          <div className="total-row">
            <span>Total Items</span>
            <b>{totalItems}</b>
          </div>

          <div className="total-row">
            <span>Total Amount</span>
            <b>
              RM {totalAmount.toFixed(2)}
            </b>
          </div>

          {totalItems > 0 && (
            <div className="checkout-form">
              <label className="checkout-field">
                <span>Customer Name *</span>

                <input
                  className="checkout-input"
                  value={name}
                  onChange={(event) =>
                    setName(event.target.value)
                  }
                  placeholder="Enter customer name"
                  autoComplete="name"
                />
              </label>

              <label className="checkout-field">
                <span>Company Name *</span>

                <input
                  className="checkout-input"
                  value={companyName}
                  onChange={(event) =>
                    setCompanyName(
                      event.target.value,
                    )
                  }
                  placeholder="Enter company name"
                  autoComplete="organization"
                />
              </label>

              <label className="checkout-field">
                <span>TIN Number *</span>

                <input
                  className="checkout-input"
                  value={tinNumber}
                  onChange={(event) =>
                    setTinNumber(event.target.value)
                  }
                  placeholder="Enter TIN number"
                  autoComplete="off"
                />
              </label>

              <label className="checkout-field">
                <span>Phone Number *</span>

                <input
                  className="checkout-input"
                  type="tel"
                  inputMode="tel"
                  value={phoneNumber}
                  onChange={(event) =>
                    setPhoneNumber(
                      event.target.value,
                    )
                  }
                  placeholder="Enter phone number"
                  autoComplete="tel"
                />
              </label>

              <label className="checkout-field">
                <span>WhatsApp Number *</span>

                <input
                  className="checkout-input"
                  type="tel"
                  inputMode="tel"
                  value={whatsappNumber}
                  onChange={(event) =>
                    setWhatsappNumber(
                      event.target.value,
                    )
                  }
                  placeholder="Enter WhatsApp number"
                  autoComplete="tel"
                />
              </label>

              <label className="checkout-field">
                <span>Delivery Address *</span>

                <textarea
                  className="checkout-input checkout-address"
                  value={address}
                  onChange={(event) =>
                    setAddress(event.target.value)
                  }
                  placeholder="Enter delivery address"
                  autoComplete="street-address"
                  rows={4}
                />
              </label>

              <button
                type="button"
                className="checkout"
                onClick={submit}
                disabled={submitting}
              >
                {submitting
                  ? "SUBMITTING..."
                  : "SUBMIT ORDER"}
              </button>

              <button
                type="button"
                className="clear"
                onClick={() => {
                  clearCart();

                  notify(
                    "Cart cleared.",
                    "success",
                  );
                }}
                disabled={submitting}
              >
                Clear cart
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}