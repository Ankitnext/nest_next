"use client";

import Link from "next/link";
import { StarIcon, MapPinIcon, ClockIcon } from "@heroicons/react/24/outline";

export interface Shop {
  id: number | string;
  name: string;
  category: string;
  description: string;
  image: string;
  rating: number;
  reviews: number;
  distance: string;
  deliveryTime: string;
  /** Hours open today, e.g. "09:00-22:00". Used to compute Open/Closed automatically. */
  hoursToday?: string;
  /** Override auto-computed status. True = Open, False = Closed. */
  isOpen?: boolean;
  href: string;
}

/** Determine if a shop is open given a "HH:MM-HH:MM" string and the current time */
export function computeIsOpen(hoursToday?: string, override?: boolean): boolean {
  if (override !== undefined) return override;
  if (!hoursToday) return true; // default: assume open

  const now = new Date();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();

  const [openStr, closeStr] = hoursToday.split("-");
  const [openH, openM] = (openStr ?? "").split(":").map(Number);
  const [closeH, closeM] = (closeStr ?? "").split(":").map(Number);

  if (isNaN(openH) || isNaN(closeH)) return true;

  const openMinutes = openH * 60 + openM;
  const closeMinutes = closeH * 60 + closeM;

  return nowMinutes >= openMinutes && nowMinutes < closeMinutes;
}

type ShopCardProps = {
  shop: Shop;
};

export function ShopCard({ shop }: ShopCardProps) {
  const isOpen = computeIsOpen(shop.hoursToday, shop.isOpen);

  return (
    <Link
      href={shop.href}
      className="group block overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm hover:shadow-xl hover:-translate-y-1 transition"
    >
      {/* Image with status and category badges */}
      <div className="relative h-44 overflow-hidden bg-gray-100">
        <img
          src={shop.image}
          alt={shop.name}
          className="h-full w-full object-cover group-hover:scale-105 transition duration-500"
        />
        {/* Open / Closed badge — top left */}
        <span
          className={`absolute top-3 left-3 flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold text-white shadow-md ${
            isOpen ? "bg-green-500" : "bg-red-500"
          }`}
        >
          <span className={`h-1.5 w-1.5 rounded-full ${isOpen ? "bg-green-200" : "bg-red-200"} animate-pulse`} />
          {isOpen ? "Open" : "Closed"}
        </span>
        {/* Category badge — top right */}
        <span className="absolute top-3 right-3 rounded-full bg-[#7158E2] px-2.5 py-1 text-xs font-bold text-white shadow-md">
          {shop.category}
        </span>
      </div>

      {/* Card details */}
      <div className="p-4">
        <h3 className="text-base font-bold text-gray-900 group-hover:text-[#7158E2] transition">
          {shop.name}
        </h3>
        <p className="mt-1 text-sm text-gray-500 line-clamp-1">{shop.description}</p>

        {/* Rating row */}
        <div className="mt-3 flex items-center gap-1.5 text-sm">
          <StarIcon className="h-4 w-4 fill-yellow-400 text-yellow-400" />
          <span className="font-bold text-gray-900">{shop.rating}</span>
          <span className="text-gray-400">({shop.reviews}+ reviews)</span>
        </div>

        {/* Distance + Delivery time */}
        <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <MapPinIcon className="h-3.5 w-3.5" />
            {shop.distance}
          </span>
          <span className="flex items-center gap-1">
            <ClockIcon className="h-3.5 w-3.5" />
            {shop.deliveryTime} min
          </span>
        </div>

        {/* View Shop button */}
        <button
          className={`mt-4 w-full rounded-xl py-2.5 text-sm font-bold transition ${
            isOpen
              ? "bg-gradient-to-r from-[#7158E2] to-[#9333ea] text-white hover:opacity-90 shadow-sm"
              : "border border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed"
          }`}
          disabled={!isOpen}
        >
          {isOpen ? "View Shop" : "Currently Closed"}
        </button>
      </div>
    </Link>
  );
}
