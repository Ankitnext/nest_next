"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";

export function SearchBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") ?? "";
  
  const [query, setQuery] = useState(initialQuery);

  // Sync state if URL changes externally
  useEffect(() => {
    setQuery(searchParams.get("q") ?? "");
  }, [searchParams]);

  // Debounce the search input
  useEffect(() => {
    const handler = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (query.trim()) {
        params.set("q", query.trim());
      } else {
        params.delete("q");
      }
      
      const newUrl = params.toString() ? `?${params.toString()}` : "/shop";
      router.push(newUrl, { scroll: false });
    }, 500); // 500ms debounce

    return () => clearTimeout(handler);
  }, [query, router, searchParams]);

  return (
    <div className="relative w-full max-w-md">
      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
        <MagnifyingGlassIcon className="h-5 w-5 text-slate-400" aria-hidden="true" />
      </div>
      <input
        type="text"
        className="block w-full rounded-full border-0 py-2.5 pl-10 pr-4 text-slate-900 ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-orange-500 sm:text-sm sm:leading-6"
        placeholder="Search menu items..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
    </div>
  );
}
