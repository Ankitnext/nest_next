import { fallbackCategories, fallbackProducts } from "@/lib/mock-data";
import type { Product } from "@/types/product";
import { getApiBaseUrl } from "./config";

const API_BASE = getApiBaseUrl();

async function fetchWithFallback<T>(path: string, fallback: T): Promise<T> {
  try {
    const response = await fetch(`${API_BASE}${path}`, { cache: "no-store" });
    if (!response.ok) {
      throw new Error(`API request failed for ${path}`);
    }
    return (await response.json()) as T;
  } catch {
    return fallback;
  }
}

export async function fetchProducts(): Promise<Product[]> {
  return fetchWithFallback<Product[]>("/products", fallbackProducts);
}

export async function fetchProductById(id: number): Promise<Product | null> {
  const fallback = fallbackProducts.find((product) => product.id === id) ?? null;
  return fetchWithFallback<Product | null>(`/products/${id}`, fallback);
}

export async function fetchCategories(): Promise<string[]> {
  return fetchWithFallback<string[]>("/categories", fallbackCategories);
}

export async function fetchProductsByStore(store: string): Promise<Product[]> {
  const fallback = fallbackProducts.filter((product) => product.store === store);
  return fetchWithFallback<Product[]>(
    `/stores/${encodeURIComponent(store)}/products`,
    fallback,
  );
}

