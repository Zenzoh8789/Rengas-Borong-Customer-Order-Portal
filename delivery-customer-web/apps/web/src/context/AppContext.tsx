import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { api, type CustomerProfile, type CustomerRegistration } from "../services/api";
import type { CartItem, Product, ProductUom } from "../types";

type Notice = { type: "success" | "error" | "info"; message: string };
type AppState = {
  authenticated: boolean;
  profile: CustomerProfile | null;
  cart: CartItem[];
  login: (username: string, password: string) => Promise<boolean>;
  loginCustomerWithPassword: (phoneNumber: string, password: string) => Promise<boolean>;
  signUp: (customer: CustomerRegistration) => Promise<boolean>;
  sendOtp: (phoneNumber: string) => Promise<boolean>;
  verifyOtp: (phoneNumber: string, otp: string) => Promise<boolean>;
  logout: () => void;
  notify: (message: string, type?: Notice["type"]) => void;
  setQuantity: (product: Product, uom: ProductUom, quantity: number) => void;
  clearCart: () => void;
};

const Context = createContext<AppState | null>(null);
const errorMessage = (error: unknown, fallback: string) => error instanceof Error ? error.message : fallback;

export function AppProvider({ children }: { children: ReactNode }) {
  const [authenticated, setAuthenticated] = useState(() => sessionStorage.getItem("rengas-auth") === "1");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [profile, setProfile] = useState<CustomerProfile | null>(null);
  const [notice, setNotice] = useState<Notice | null>(null);
  const notify = (message: string, type: Notice["type"] = "info") => setNotice({ message, type });

  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(null), 3500);
    return () => window.clearTimeout(timer);
  }, [notice]);

  useEffect(() => {
    let active = true;
    api.me()
      .then((result) => {
        if (!active) return;
        setAuthenticated(result.authenticated);
        setProfile(result.customer ?? null);
        if (result.authenticated) sessionStorage.setItem("rengas-auth", "1");
        else sessionStorage.removeItem("rengas-auth");
      })
      .catch(() => {
        if (!active) return;
        setAuthenticated(false);
        setProfile(null);
        sessionStorage.removeItem("rengas-auth");
      });
    return () => { active = false; };
  }, []);

  const login = async (username: string, password: string) => {
    try {
      const result = await api.login(username.trim(), password);
      if (result.accessToken) localStorage.setItem("rengas-token", result.accessToken);
      if (!result.accessToken && !result.user) throw new Error("Invalid login response.");
      sessionStorage.setItem("rengas-auth", "1");
      sessionStorage.setItem("rengas-show-welcome", "1");
      setAuthenticated(true);
      notify("Login successful. Welcome to RENGAS.", "success");
      return true;
    } catch (error) {
      notify(errorMessage(error, "Login failed."), "error");
      return false;
    }
  };

  const signUp = async (customer: CustomerRegistration) => {
    try {
      const result = await api.customerSignUp(customer);
      setProfile(result.customer);
      notify("Account created. Verify your phone number to continue.", "success");
      return true;
    } catch (error) {
      notify(errorMessage(error, "Account creation failed."), "error");
      return false;
    }
  };

  const loginCustomerWithPassword = async (phoneNumber: string, password: string) => {
    try {
      const result = await api.customerPasswordLogin(phoneNumber.trim(), password);
      localStorage.setItem("rengas-token", result.accessToken);
      sessionStorage.setItem("rengas-auth", "1");
      sessionStorage.setItem("rengas-show-welcome", "1");
      setProfile(result.customer);
      setAuthenticated(true);
      notify(`Welcome to ${result.customer.businessName}.`, "success");
      return true;
    } catch (error) {
      notify(errorMessage(error, "Invalid phone number or password."), "error");
      return false;
    }
  };

  const sendOtp = async (phoneNumber: string) => {
    try {
      const result = await api.sendCustomerOtp(phoneNumber.trim());
      notify(result.developmentOtp ? `${result.message} Development code: ${result.developmentOtp}` : result.message, "info");
      return true;
    } catch (error) {
      notify(errorMessage(error, "Unable to send OTP."), "error");
      return false;
    }
  };

  const verifyOtp = async (phoneNumber: string, otp: string) => {
    try {
      const result = await api.verifyCustomerOtp(phoneNumber.trim(), otp);
      localStorage.setItem("rengas-token", result.accessToken);
      sessionStorage.setItem("rengas-auth", "1");
      sessionStorage.setItem("rengas-show-welcome", "1");
      setProfile(result.customer);
      setAuthenticated(true);
      notify(`Welcome to ${result.customer.businessName}.`, "success");
      return true;
    } catch (error) {
      notify(errorMessage(error, "The OTP is incorrect or expired."), "error");
      return false;
    }
  };

  const logout = () => {
    sessionStorage.removeItem("rengas-auth");
    localStorage.removeItem("rengas-token");
    setAuthenticated(false);
    setProfile(null);
    setCart([]);
    notify("You have been logged out.", "info");
  };

  const setQuantity = (product: Product, uom: ProductUom, quantity: number) => {
    setCart((current) => {
      const rest = current.filter((line) => !(line.product.id === product.id && line.uom.id === uom.id));
      return quantity > 0 ? [...rest, { product, uom, quantity }] : rest;
    });
  };

  const value = useMemo(() => ({
    authenticated, profile, cart, login, loginCustomerWithPassword, signUp, sendOtp, verifyOtp, logout, notify, setQuantity,
    clearCart: () => setCart([]),
  }), [authenticated, cart, profile]);

  return (
    <Context.Provider value={value}>
      {children}
      {notice && (
        <div className={`app-toast ${notice.type}`} role="status" aria-live="polite">
          <span>{notice.type === "success" ? "✓" : notice.type === "error" ? "!" : "i"}</span>
          <p>{notice.message}</p>
          <button type="button" onClick={() => setNotice(null)} aria-label="Close notification">×</button>
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
