import type { Order, Product } from "../types";

const BASE = (import.meta.env.VITE_API_URL || "http://localhost:3000/api").replace(/\/$/, "");
const API_ORIGIN = new URL(BASE, window.location.origin).origin;

export type CustomerProfile = {
  id: number;
  fullName: string;
  businessName: string;
  whatsappNumber: string;
  phoneNumber: string;
  email: string;
  tinNumber: string;
  address: string;
};

export type CustomerRegistration = Omit<CustomerProfile, "id"> & { password: string };

export function resolveApiAssetUrl(value?: string | null) {
  if (!value) return undefined;
  let url: URL;
  try { url = new URL(value, `${API_ORIGIN}/`); } catch { return undefined; }
  if (!["http:", "https:"].includes(url.protocol)) return undefined;
  if (["localhost", "127.0.0.1"].includes(url.hostname)) {
    return `${API_ORIGIN}${url.pathname}${url.search}`;
  }
  return url.toString();
}

const pendingGets = new Map<string, Promise<unknown>>();

function request<T>(path: string, init?: RequestInit): Promise<T> {
  if (init?.method && init.method !== "GET") return performRequest<T>(path, init);
  const key = `${localStorage.getItem("rengas-token") || ""}:${path}`;
  const existing = pendingGets.get(key);
  if (existing) return existing as Promise<T>;
  const pending = performRequest<T>(path, init).finally(() => pendingGets.delete(key));
  pendingGets.set(key, pending);
  return pending;
}

async function performRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const token = localStorage.getItem("rengas-token");
  const response = await fetch(`${BASE}${path}`, {
    ...(!init?.method || init.method === "GET" ? { signal: AbortSignal.timeout(20000) } : {}),
    credentials: "include",
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init?.headers || {}),
    },
  });
  if (!response.ok) {
    let message = `API request failed (${response.status})`;
    try {
      const responseBody = await response.json();
      if (responseBody?.message) {
        message = Array.isArray(responseBody.message) ? responseBody.message.join(", ") : responseBody.message;
      }
    } catch { /* Response did not contain JSON. */ }
    throw new Error(message);
  }
  return response.json() as Promise<T>;
}

let productsRequest: Promise<Product[]> | undefined;
let productsKey = "";
let productsLoadedAt = 0;
let orderSnapshot: { key: string; items: Order[] } | undefined;
let productSnapshot: { key: string; items: Product[] } | undefined;

export const api = {
  me: () =>
    request<{
      authenticated: boolean;
      role: string | null;
      customer?: CustomerProfile | null;
    }>("/auth/me"),
  login: (username: string, password: string) =>
    request<{ accessToken?: string; user?: { username: string; role: string } }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ username, password, role: "CUSTOMER" }),
    }),
  customerSignUp: (customer: CustomerRegistration) =>
    request<{ customer: CustomerProfile }>("/auth/customer/signup", {
      method: "POST",
      body: JSON.stringify(customer),
    }),
  customerPasswordLogin: (phoneNumber: string, password: string) =>
    request<{ accessToken: string; customer: CustomerProfile }>("/auth/customer/login", {
      method: "POST",
      body: JSON.stringify({ phoneNumber, password }),
    }),
  sendCustomerOtp: (phoneNumber: string) =>
    request<{ message: string; developmentOtp?: string }>("/auth/customer/send-otp", {
      method: "POST",
      body: JSON.stringify({ phoneNumber }),
    }),
  verifyCustomerOtp: (phoneNumber: string, otp: string) =>
    request<{ accessToken: string; customer: CustomerProfile }>("/auth/customer/verify-otp", {
      method: "POST",
      body: JSON.stringify({ phoneNumber, otp }),
    }),
  updateCustomerProfile: (customer: Omit<CustomerProfile, "id">) =>
    request<{ customer: CustomerProfile }>("/auth/customer/profile", {
      method: "PATCH",
      body: JSON.stringify(customer),
    }),
  cachedProducts: () => productSnapshot?.key === (localStorage.getItem("rengas-token") || "") ? productSnapshot.items : undefined,
  products: () => {
    const key = localStorage.getItem("rengas-token") || "";
    if (!productsRequest || key !== productsKey || Date.now() - productsLoadedAt > 60_000) {
      productsKey = key;
      productsLoadedAt = Date.now();
      productsRequest = request<Product[]>("/store/products").then(items => {
        if (productsKey === key) productSnapshot = { key, items };
        return items;
      }).catch((error) => {
        productsRequest = undefined;
        throw error;
      });
    }
    return productsRequest;
  },
  recentOrders: () => request<Pick<Order, "id" | "orderNo" | "date" | "status">[]>("/store/orders/recent"),
  cachedOrders: () => orderSnapshot?.key === (localStorage.getItem("rengas-token") || "") ? orderSnapshot.items : undefined,
  orders: async () => {
    const key = localStorage.getItem("rengas-token") || "";
    const items = await request<Order[]>("/store/orders");
    if (key === (localStorage.getItem("rengas-token") || "")) orderSnapshot = { key, items };
    return items;
  },
  createOrder: (
    customer: { name: string; companyName?: string; tinNumber: string; phoneNumber?: string; whatsappNumber?: string; address?: string },
    items: { productId: number; quantity: number }[],
  ) => request<Order>("/store/orders", { method: "POST", body: JSON.stringify({ customer, items }) }).then(order => {
    orderSnapshot = undefined;
    return order;
  }),
};
