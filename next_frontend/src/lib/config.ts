"use client";

/**
 * Utility to get the base API URL dynamically.
 * Priority: 
 * 1. window.location (if in browser and on production domain)
 * 2. NEXT_PUBLIC_API_URL env var
 * 3. Default localhost
 */
export function getApiBaseUrl(): string {
  if (typeof window !== "undefined") {
    const host = window.location.hostname;
    if (host.includes("baazaarse.online") || host.includes("baazaarse.com")) {
      // Use production API if we are on the production domain
      return "https://baazaarse.online/api";
    }
  }

  // Fallback to env var or localhost
  return process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";
}

export const API_BASE = getApiBaseUrl();
