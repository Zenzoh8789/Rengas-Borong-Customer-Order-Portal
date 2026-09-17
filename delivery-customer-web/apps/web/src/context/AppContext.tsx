import { createContext,useContext,useEffect,useMemo,useState,type ReactNode } from "react";
import { api,type CustomerProfile,type CustomerRegistration } from "../services/api";
import type { CartItem,Product,ProductUom } from "../types";

type Notice = { type: "success" | "error" | "info"; message: string };
type AppState = {
  authenticated: boolean;
  authLoading: boolean;
  authError: string;
  retryAuth: () => void;
  profile: CustomerProfile | null;
  cart: CartItem[];
  refreshProfile: () => Promise<void>;
  updateProfile: (details: Omit<CustomerProfile, "id">) => Promise<void>;
  login: (username: string, password: string) => Promise<boolean>;
  loginCustomerWithPassword: (phoneNumber: string, password: string) => Promise<boolean>;
  signUp: (customer: CustomerRegistration) => Promise<boolean>;
  sendOtp: (phoneNumber: string) => Promise<boolean>;
  verifyOtp: (phoneNumber: string, otp: string) => Promise<boolean>;
  requestPasswordReset: (phoneNumber: string) => Promise<{ developmentOtp?: string } | null>;
  verifyPasswordResetOtp: (phoneNumber: string, otp: string) => Promise<string | null>;
  resetPassword: (resetToken: string, newPassword: string) => Promise<boolean>;
  logout: () => void;
  notify: (message: string, type?: Notice["type"]) => void;
  setQuantity: (product: Product, uom: ProductUom, quantity: number) => void;
  clearCart: () => void;
};

const Context = createContext<AppState | null>(null);
const errorMessage = (error: unknown, fallback: string) => error instanceof Error ? error.message : fallback;

export function AppProvider({ children }: { children: ReactNode }) {
  const [authError, setAuthError] = useState("");
  const [authAttempt, setAuthAttempt] = useState(0);
  const [authLoading, setAuthLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(() => sessionStorage.getItem("rengas-auth") === "1");
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem("rengas-cart");
      const parsed: unknown = saved ? JSON.parse(saved) : [];
      return Array.isArray(parsed) ? parsed.filter((item) => item?.product?.id && item?.uom?.id && Number.isFinite(item.quantity) && item.quantity > 0) : [];
    } catch {
      return [];
    }
  });
  const [profile, setProfile] = useState<CustomerProfile | null>(null);
  const [notice, setNotice] = useState<Notice | null>(null);
  const notify = (message: string, type: Notice["type"] = "info") => setNotice({ message, type });

  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(null), 3500);
    return () => window.clearTimeout(timer);
  }, [notice]);

  useEffect(() => {
    try { localStorage.setItem("rengas-cart", JSON.stringify(cart)); } catch { /* Storage may be unavailable. */ }
  }, [cart]);

  useEffect(() => {
    let active = true;
    api.me()
      .then((result) => {
        if (!active) return;
        const isCustomer = result.authenticated && result.role === "CUSTOMER" && !!result.customer;
        setAuthenticated(isCustomer);
        setProfile(isCustomer ? result.customer ?? null : null);
        if (isCustomer) sessionStorage.setItem("rengas-auth", "1");
        else sessionStorage.removeItem("rengas-auth");
      })
      .catch(() => {
        if (!active) return;
        setAuthenticated(false);
        setProfile(null);
        sessionStorage.removeItem("rengas-auth");
      }).finally(() => {
        if (active) setAuthLoading(false);
      });
    return () => { active = false; };
  }, []);

  const refreshProfile = async () => {
    const result = await api.me();
    if (!result.authenticated || result.role !== "CUSTOMER" || !result.customer) {
      setAuthenticated(false);
      setProfile(null);
      sessionStorage.removeItem("rengas-auth");
      throw new Error("Please sign in with your registered customer phone number to load your shop details.");
    }
    setProfile(result.customer);
  };

  const updateProfile = async (details: Omit<CustomerProfile, "id">) => {
    const updated = await api.updateCustomerProfile(details);
    setProfile(updated.customer);
    notify("Profile saved successfully.", "success");
  };

  const login = async (username: string, password: string) => {
    try {
      const result = await api.login(username.trim(), password);
      if (result.accessToken) localStorage.setItem("rengas-token", result.accessToken);
      else localStorage.removeItem("rengas-token");
      if (!result.accessToken && !result.user) throw new Error("Invalid login response.");
      await refreshProfile();
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

  const requestPasswordReset = async (phoneNumber: string) => {
    try {
      const result = await api.requestCustomerPasswordReset(phoneNumber.trim());
      notify(result.message, "info");
      return result;
    } catch (error) {
      notify(errorMessage(error, "Unable to send password reset OTP."), "error");
      return null;
    }
  };

  const verifyPasswordResetOtp = async (phoneNumber: string, otp: string) => {
    try {
      const result = await api.verifyCustomerPasswordResetOtp(phoneNumber.trim(), otp);
      notify("OTP verified. You can now create a new password.", "success");
      return result.resetToken;
    } catch (error) {
      notify(errorMessage(error, "The password reset OTP is incorrect or expired."), "error");
      return null;
    }
  };

  const resetPassword = async (resetToken: string, newPassword: string) => {
    try {
      await api.resetCustomerPassword(resetToken, newPassword);
      notify("Password changed successfully. Please sign in with your new password.", "success");
      return true;
    } catch (error) {
      notify(errorMessage(error, "Unable to reset your password."), "error");
      return false;
    }
  };

  const logout = () => {
    sessionStorage.removeItem("rengas-auth");
    localStorage.removeItem("rengas-token");
    setAuthenticated(false);
    setProfile(null);
    setCart([]);
    localStorage.removeItem("rengas-cart");
    notify("You have been logged out.", "info");
  };

  const setQuantity = (product: Product, uom: ProductUom, quantity: number) => {
    setCart((current) => {
      const matches = (line: CartItem) =>
        line.product.id === product.id && line.uom.id === uom.id;

      if (quantity <= 0) return current.filter((line) => !matches(line));

      const existingIndex = current.findIndex(matches);
      if (existingIndex < 0) return [...current, { product, uom, quantity }];

      return current.map((line, index) =>
        index === existingIndex ? { ...line, quantity } : line,
      );
    });
  };

  const value = useMemo(() => ({
    authenticated, authLoading, authError, retryAuth: () => setAuthAttempt(value => value + 1), profile, cart, refreshProfile, updateProfile, login, loginCustomerWithPassword, signUp, sendOtp, verifyOtp, requestPasswordReset, verifyPasswordResetOtp, resetPassword, logout, notify, setQuantity,
    clearCart: () => setCart([]),
  }), [authenticated, authLoading, authError, cart, profile]);

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

