import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { api } from "../services/api";
import type { CartLine, Product, Uom } from "../types";

type Notice = { type: "success" | "error" | "info"; message: string };

type AppState = {
  authenticated: boolean;
  cart: CartLine[];
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  notify: (message: string, type?: Notice["type"]) => void;
  setQuantity: (product: Product, uom: Uom, quantity: number) => void;
  clearCart: () => void;
};

const Context = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [authenticated, setAuthenticated] = useState(
    () => sessionStorage.getItem("rengas-auth") === "1",
  );
  const [cart, setCart] = useState<CartLine[]>([]);
  const [notice, setNotice] = useState<Notice | null>(null);

  const notify = (message: string, type: Notice["type"] = "info") => {
    setNotice({ message, type });
  };

  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(null), 3500);
    return () => window.clearTimeout(timer);
  }, [notice]);

  const login = async (username: string, password: string) => {
    try {
      const result = await api.login(username.trim(), password);
      if (result.accessToken) {
        localStorage.setItem("rengas-token", result.accessToken);
      }
      const ok = Boolean(result.accessToken || result.user);
      if (!ok) throw new Error("Login response did not contain a user.");
      sessionStorage.setItem("rengas-auth", "1");
      setAuthenticated(true);
      notify("Login successful. Welcome to RENGAS.", "success");
      return true;
    } catch {
      notify("Login failed. Check your username and password.", "error");
      return false;
    }
  };

  const logout = () => {
    sessionStorage.removeItem("rengas-auth");
    localStorage.removeItem("rengas-token");
    setAuthenticated(false);
    setCart([]);
    notify("You have been logged out.", "info");
  };

  const setQuantity = (product: Product, uom: Uom, quantity: number) => {
    setCart((current) => {
      const rest = current.filter(
        (line) => !(line.product.id === product.id && line.uom.id === uom.id),
      );
      return quantity > 0 ? [...rest, { product, uom, quantity }] : rest;
    });
  };

  const value = useMemo(
    () => ({
      authenticated,
      cart,
      login,
      logout,
      notify,
      setQuantity,
      clearCart: () => setCart([]),
    }),
    [authenticated, cart],
  );

  return (
    <Context.Provider value={value}>
      {children}
      {notice && (
        <div className={`app-toast ${notice.type}`} role="status" aria-live="polite">
          <span>{notice.type === "success" ? "✓" : notice.type === "error" ? "!" : "i"}</span>
          <p>{notice.message}</p>
          <button onClick={() => setNotice(null)} aria-label="Close notification">×</button>
        </div>
      )}
    </Context.Provider>
  );
}

export const useApp = () => {
  const value = useContext(Context);
  if (!value) throw new Error("AppProvider missing");
  return value;
};
