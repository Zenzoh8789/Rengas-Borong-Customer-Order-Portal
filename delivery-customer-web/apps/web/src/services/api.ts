import type { Order, Product } from "../types";

const BASE = (
  import.meta.env.VITE_API_URL || "http://localhost:3002/api"
).replace(/\/$/, "");

const API_ORIGIN = new URL(BASE, window.location.origin).origin;

export function resolveApiAssetUrl(value?: string | null) {
  if (!value) {
    return undefined;
  }

  const url = new URL(value, `${API_ORIGIN}/`);

  if (["localhost", "127.0.0.1"].includes(url.hostname)) {
    return `${API_ORIGIN}${url.pathname}${url.search}`;
  }

  return url.toString();
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const token = localStorage.getItem("rengas-token");

  const response = await fetch(`${BASE}${path}`, {
    credentials: "include",
    ...init,

    headers: {
      "Content-Type": "application/json",

      ...(token
        ? {
            Authorization: `Bearer ${token}`,
          }
        : {}),

      ...(init?.headers || {}),
    },
  });

  if (!response.ok) {
    let message = `API request failed (${response.status})`;

    try {
      const responseBody = await response.json();

      if (responseBody?.message) {
        message = Array.isArray(responseBody.message)
          ? responseBody.message.join(", ")
          : responseBody.message;
      }
    } catch {
      // Response does not contain JSON.
    }

    throw new Error(message);
  }

  return response.json();
}

let productsRequest: Promise<Product[]> | undefined;

export const api = {
  login: (username: string, password: string) =>
    request<{
      accessToken?: string;

      user?: {
        username: string;
        role: string;
      };
    }>("/auth/login", {
      method: "POST",
      credentials: "include",

      body: JSON.stringify({
        username,
        password,
        role: "CUSTOMER",
      }),
    }),

  products: () =>
    (productsRequest ??= request<Product[]>("/store/products").catch(
      (error) => {
        productsRequest = undefined;
        throw error;
      },
    )),

  orders: () => request<Order[]>("/store/orders"),

  createOrder: (
    customer: {
      name: string;
      companyName?: string;
      tinNumber: string;
      phoneNumber?: string;
      whatsappNumber?: string;
      address?: string;
    },

    items: {
      productId: number;
      quantity: number;
    }[],
  ) =>
    request<Order>("/store/orders", {
      method: "POST",

      body: JSON.stringify({
        customer,
        items,
      }),
    }),
};
