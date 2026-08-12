import {
  Grid3X3,
  History,
  Home,
  Menu,
  Search,
  ShoppingCart,
  X,
  LogOut,
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { useState, type ReactNode } from "react";
import { useApp } from "../context/AppContext";
import { BrandLogo } from "./BrandLogo";

const titles: Record<string, string> = {
  "/": "RENGAS",
  "/categories": "Categories",
  "/cart": "Your Cart",
  "/orders": "Order History",
};
export function SearchBox({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) {
  return (
    <label className="search-box">
      <Search size={25} aria-hidden />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
      />
    </label>
  );
}
export function AppShell({ children }: { children: ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { cart, logout } = useApp();
  const { pathname } = useLocation();
  const count = cart.reduce((n, x) => n + x.quantity, 0);
  const nav = [
    { to: "/", label: "Home", Icon: Home },
    { to: "/categories", label: "Category", Icon: Grid3X3 },
    { to: "/cart", label: "Cart", Icon: ShoppingCart },
    { to: "/orders", label: "Order", Icon: History },
  ];
  return (
    <div className="phone-shell">
      <header className="topbar">
        <button
          className="icon-btn"
          onClick={() => setMenuOpen(true)}
          aria-label="Open menu"
        >
          <Menu />
        </button>
        <h1>{titles[pathname] || "RENGAS BORONG"}</h1>
        
      </header>
      <main className="screen-content">{children}</main>
      <nav className="bottom-nav" aria-label="Main navigation">
        {nav.map(({ to, label, Icon }) => (
          <NavLink key={to} to={to} end={to === "/"}>
            <span className="nav-icon">
              <Icon />
              {label === "Cart" && count > 0 && <b>{count}</b>}
            </span>
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
      {menuOpen && (
        <>
          <button
            className="scrim"
            aria-label="Close menu"
            onClick={() => setMenuOpen(false)}
          />
          <aside className="drawer">
            <button
              className="drawer-close"
              onClick={() => setMenuOpen(false)}
              aria-label="Close"
            >
              <X />
            </button>
            <BrandLogo />
            <h2>RENGAS Customer</h2>
            <p>Wholesale Buyer Account</p>
            {nav.map(({ to, label, Icon }) => (
              <NavLink key={to} to={to} onClick={() => setMenuOpen(false)}>
                <Icon />
                {label}
              </NavLink>
            ))}
            <button className="logout" onClick={logout}>
              <LogOut /> Logout
            </button>
          </aside>
        </>
      )}
    </div>
  );
}
