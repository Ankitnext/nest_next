"use client";

import Link from "next/link";
import { MagnifyingGlassIcon, MapPinIcon } from "@heroicons/react/24/outline";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[#7158E2] via-[#5a44cc] to-[#a855f7] px-6 py-20 text-center md:px-10 md:py-28">
      {/* Background decoration circles */}
      <div className="pointer-events-none absolute -top-32 -right-32 h-80 w-80 rounded-full bg-white/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" />

      <div className="relative z-10 mx-auto max-w-3xl">
        {/* Badge */}
        <span className="mb-6 inline-block rounded-full bg-white/20 px-5 py-1.5 text-sm font-semibold text-white backdrop-blur-sm">
          🏪 Your Local Marketplace
        </span>

        {/* Heading */}
        <h1 className="text-4xl font-extrabold leading-tight text-white md:text-6xl tracking-tight">
          Your Local Marketplace,{" "}
          <span className="text-[#F1C40F]">Delivered in Minutes</span>
        </h1>

        <p className="mx-auto mt-5 max-w-xl text-lg text-purple-100 leading-relaxed">
          Connect with shops and services right in your neighborhood. Order online, get it fast.
        </p>

        {/* Search Bar */}
        <div className="mt-10 flex w-full max-w-xl mx-auto overflow-hidden rounded-2xl bg-white shadow-xl shadow-purple-900/20">
          <div className="flex items-center gap-2 border-r border-gray-200 px-4 text-gray-400">
            <MapPinIcon className="h-5 w-5 text-[#7158E2]" />
            <span className="text-sm font-medium text-gray-500 whitespace-nowrap">Your Area</span>
          </div>
          <div className="flex flex-1 items-center gap-2 px-4">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search shops, services..."
              className="w-full bg-transparent py-4 text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none"
            />
          </div>
          <button className="m-1.5 rounded-xl bg-[#7158E2] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#5a44cc] transition shadow-md shadow-purple-400/30">
            Search
          </button>
        </div>

        {/* CTA Buttons */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/shop"
            className="rounded-xl bg-white px-8 py-3.5 text-sm font-bold text-[#7158E2] shadow-lg hover:shadow-xl hover:-translate-y-0.5 transform transition"
          >
            🛒 Browse Shops
          </Link>
          <Link
            href="/pricing"
            className="rounded-xl border-2 border-white/60 px-8 py-3.5 text-sm font-bold text-white backdrop-blur-sm hover:bg-white/20 transition"
          >
            🔧 Find Services
          </Link>
        </div>
      </div>
    </section>
  );
}
