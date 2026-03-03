/**
 * Client-side helpers for cart and order API calls.
 * All requests include the JWT stored in cookies as a Bearer token.
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api";

/** Read the JWT token from document.cookie */
function getToken(): string {
  const match = document.cookie.match(/(?:^|;\s*)novacart_token=([^;]+)/);
  return match ? match[1] : "";
}

function authHeaders(): HeadersInit {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${getToken()}`,
  };
}

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: { ...authHeaders(), ...(init?.headers ?? {}) },
  });
  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as { message?: string };
    throw new Error(err.message ?? `Request failed (${res.status})`);
  }
  return res.json() as Promise<T>;
}

// ── Types ─────────────────────────────────────────────────────────────────

export interface CartItem {
  id: number;
  product_id: number;
  product_name: string;
  product_image: string;
  product_store?: string;
  vendor_address?: string;
  price: number;
  currency: string;
  quantity: number;
  added_at: string;
}

export interface Order {
  id: number;
  order_number: string;   // e.g. ORD-20260228-A3F7K9Q2
  product_id: number;
  product_name: string;
  product_image: string;
  price: number;
  currency: string;
  quantity: number;
  status: string;
  ordered_at: string;
}

// ── Cart ──────────────────────────────────────────────────────────────────

export const getCart = () => apiFetch<CartItem[]>("/cart");

export const addToCart = (item: {
  product_id: number;
  product_name: string;
  product_image: string;
  product_store?: string;
  price: number;
  currency: string;
}) =>
  apiFetch<CartItem>("/cart", {
    method: "POST",
    body: JSON.stringify(item),
  });

export const removeFromCart = (productId: number) =>
  apiFetch<CartItem[]>(`/cart/${productId}`, { method: "DELETE" });

// ── Orders ────────────────────────────────────────────────────────────────

export const getOrders = () => apiFetch<Order[]>("/orders");

export const placeOrder = (cartItemId: number, paymentMethod?: "cod" | "card") =>
  apiFetch<Order>(`/orders/${cartItemId}`, {
    method: "POST",
    body: paymentMethod ? JSON.stringify({ paymentMethod }) : undefined,
  });
export const checkoutCart = (paymentMethod: string, fulfillmentType: string, fulfillmentDetails?: string, isPriority?: boolean) =>
  apiFetch<{ orderNumber: string, status: string }>(`/orders/checkout/all`, {
    method: "POST",
    body: JSON.stringify({ paymentMethod, fulfillmentType, fulfillmentDetails, isPriority }),
  });

export const getPriorityQueueCount = () =>
  apiFetch<{ count: number }>(`/orders/priority-queue-count`, { method: "GET" }).then(res => res.count);

export const initCartRazorpay = (fulfillmentType: string, isPriority: boolean = false) =>
  apiFetch<{ id: string, amount: number, currency: string }>(`/orders/checkout/razorpay-init`, {
    method: "POST",
    body: JSON.stringify({ fulfillmentType, isPriority }),
  });

export const verifyCartRazorpay = (
  fulfillmentType: string,
  fulfillmentDetails: string | undefined,
  isPriority: boolean,
  razorpayPaymentId: string,
  razorpayOrderId: string,
  razorpaySignature: string
) =>
  apiFetch<{ orderNumber: string, status: string }>(`/orders/checkout/razorpay-verify`, {
    method: "POST",
    body: JSON.stringify({
      fulfillmentType,
      fulfillmentDetails,
      isPriority,
      razorpayPaymentId,
      razorpayOrderId,
      razorpaySignature
    }),
  });

export const advanceStatus = (orderId: number) =>
  apiFetch<Order>(`/orders/${orderId}/advance`, { method: "PATCH" });

/** User marks their order as received → status becomes "delivered" */
export const markReceived = (orderId: number) =>
  apiFetch<Order>(`/orders/${orderId}/received`, { method: "PATCH" });

/** User pays for an order that is pending_payment → status becomes "pending" */
export const payForOrder = (orderId: number, razorpayPaymentId: string, razorpayOrderId: string, razorpaySignature: string) =>
  apiFetch<Order>(`/orders/${orderId}/pay`, {
    method: "POST",
    body: JSON.stringify({ razorpayPaymentId, razorpayOrderId, razorpaySignature }),
  });

export const createRazorpayOrder = (orderId: number) =>
  apiFetch<{ id: string; amount: number; currency: string }>(`/orders/${orderId}/create-razorpay-order`, { method: "POST" });

export interface CheckoutFulfillmentOptions {
  delivery: boolean;
  pickup: boolean;
  table: boolean;
  queue: boolean;
}

export const getCheckoutFulfillmentOptions = () =>
  apiFetch<CheckoutFulfillmentOptions>(`/checkout/fulfillment-options`, { method: "GET" });

export interface VendorSettings {
  payment_policy: string;
  allow_delivery: boolean;
  allow_pickup: boolean;
  allow_table: boolean;
  allow_queue: boolean;
  is_open: boolean;
  store_address?: string;
}

export const getVendorSettings = () =>
  apiFetch<VendorSettings>(`/vendor/settings`, { method: "GET" });

export const updateVendorSettings = (settings: Partial<VendorSettings>) =>
  apiFetch<{ success: boolean }>(`/vendor/settings`, {
    method: "PATCH",
    body: JSON.stringify(settings)
  });
