"use client";

import Link from "next/link";
import { useState } from "react";
import { MagnifyingGlassIcon, FunnelIcon, MapPinIcon, StarIcon } from "@heroicons/react/24/outline";
import { CheckBadgeIcon } from "@heroicons/react/24/solid";

const categories = ["All", "Electrician", "Plumber", "Carpenter", "Painter", "AC Repair", "Cleaner"];

const professionals = [
  {
    id: 1,
    name: "Rajesh Kumar",
    category: "Electrician",
    description: "Home & Commercial Wiring",
    rating: 4.9,
    reviews: 156,
    experience: "8 years",
    distance: "0.7 km",
    price: "₹300/hr",
    available: true,
    image: "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?q=80&w=800&auto=format&fit=crop",
  },
  {
    id: 2,
    name: "Suresh Patel",
    category: "Plumber",
    description: "Pipe Repair & Installation",
    rating: 4.8,
    reviews: 203,
    experience: "10 years",
    distance: "1.2 km",
    price: "₹250/hr",
    available: true,
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=800&auto=format&fit=crop",
  },
  {
    id: 3,
    name: "Vikram Sharma",
    category: "Carpenter",
    description: "Furniture & Woodwork",
    rating: 4.7,
    reviews: 89,
    experience: "6 years",
    distance: "2.0 km",
    price: "₹350/hr",
    available: true,
    image: "https://images.unsplash.com/photo-1504148455328-c376907d081c?q=80&w=800&auto=format&fit=crop",
  },
  {
    id: 4,
    name: "Amit Singh",
    category: "AC Repair",
    description: "AC Service & Gas Refilling",
    rating: 4.6,
    reviews: 134,
    experience: "5 years",
    distance: "0.9 km",
    price: "₹400/hr",
    available: false,
    image: "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?q=80&w=800&auto=format&fit=crop",
  },
  {
    id: 5,
    name: "Deepak Mehta",
    category: "Painter",
    description: "Interior & Exterior Painting",
    rating: 4.8,
    reviews: 112,
    experience: "7 years",
    distance: "1.5 km",
    price: "₹280/hr",
    available: true,
    image: "https://images.unsplash.com/photo-1562259929-b4e1fd3aef09?q=80&w=800&auto=format&fit=crop",
  },
  {
    id: 6,
    name: "Priya Nair",
    category: "Cleaner",
    description: "Home Deep Cleaning",
    rating: 4.9,
    reviews: 278,
    experience: "4 years",
    distance: "0.5 km",
    price: "₹200/hr",
    available: true,
    image: "https://images.unsplash.com/photo-1529220502050-f15e570c634e?q=80&w=800&auto=format&fit=crop",
  },
  {
    id: 7,
    name: "Mohan Das",
    category: "Electrician",
    description: "Solar Panel Installation",
    rating: 4.7,
    reviews: 67,
    experience: "12 years",
    distance: "3.1 km",
    price: "₹450/hr",
    available: false,
    image: "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?q=80&w=800&auto=format&fit=crop",
  },
  {
    id: 8,
    name: "Kavya Reddy",
    category: "Plumber",
    description: "Water Heater & Bathroom Fitting",
    rating: 4.5,
    reviews: 45,
    experience: "3 years",
    distance: "1.8 km",
    price: "₹220/hr",
    available: true,
    image: "https://images.unsplash.com/photo-1607473129014-0afb53b5d27f?q=80&w=800&auto=format&fit=crop",
  },
];

export default function ServicesPage() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [search, setSearch] = useState("");

  const filtered = professionals.filter((p) => {
    const matchCat = activeCategory === "All" || p.category === activeCategory;
    const matchSearch =
      search === "" ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="min-h-screen bg-[#F3F4F9]">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-r from-[#7158E2] via-[#9333ea] to-[#ec4899] px-6 py-14 md:px-12">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute right-0 top-0 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute bottom-0 left-0 h-48 w-48 rounded-full bg-white/10 blur-3xl" />
        </div>
        <div className="relative z-10 mx-auto max-w-4xl">
          <h1 className="text-4xl font-extrabold text-white md:text-5xl">Local Service Providers</h1>
          <p className="mt-3 text-lg text-white/80">
            Find verified professionals for all your home service needs
          </p>
          {/* Search Bar */}
          <div className="mt-8 flex w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-xl">
            <div className="flex flex-1 items-center gap-3 px-5">
              <MagnifyingGlassIcon className="h-5 w-5 flex-shrink-0 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search for services, professionals..."
                className="w-full bg-transparent py-4 text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none"
              />
            </div>
            <button
              onClick={() => {}}
              className="m-2 rounded-xl bg-[#ec4899] px-6 py-3 text-sm font-bold text-white hover:bg-[#db2777] transition shadow-md"
            >
              Search
            </button>
          </div>
        </div>
      </section>

      {/* Filters Row */}
      <div className="sticky top-[60px] z-30 border-b border-gray-200 bg-white px-6 py-4 shadow-sm md:px-12">
        <div className="mx-auto max-w-7xl flex flex-wrap items-center gap-3">
          <button className="flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:border-[#7158E2] hover:text-[#7158E2] transition">
            <FunnelIcon className="h-4 w-4" />
            Filters
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`rounded-xl px-5 py-2 text-sm font-semibold transition ${
                activeCategory === cat
                  ? "bg-gray-900 text-white shadow-sm"
                  : "border border-gray-200 bg-white text-gray-600 hover:border-gray-900 hover:text-gray-900"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      <div className="mx-auto max-w-7xl px-6 py-10 md:px-12">
        <p className="mb-6 text-sm font-medium text-gray-500">
          <span className="font-bold text-gray-900">{filtered.length}</span> professional{filtered.length !== 1 ? "s" : ""} found
        </p>

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl bg-white py-20 text-center shadow-sm">
            <span className="mb-4 text-5xl">🔍</span>
            <h3 className="text-xl font-bold text-gray-900">No professionals found</h3>
            <p className="mt-2 text-sm text-gray-500">Try a different search or category</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {filtered.map((pro) => (
              <div
                key={pro.id}
                className="group overflow-hidden rounded-2xl bg-white shadow-sm hover:shadow-xl hover:-translate-y-1 transition"
              >
                {/* Card Image */}
                <div className="relative h-44 overflow-hidden bg-gray-100">
                  <img
                    src={pro.image}
                    alt={pro.name}
                    className="h-full w-full object-cover group-hover:scale-105 transition duration-500"
                  />
                  {/* Badges */}
                  <div className="absolute inset-x-3 top-3 flex items-center justify-between">
                    <span className="flex items-center gap-1 rounded-full bg-blue-500 px-2.5 py-1 text-xs font-bold text-white shadow-md">
                      <CheckBadgeIcon className="h-3.5 w-3.5" />
                      Verified
                    </span>
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-bold text-white shadow-md ${
                        pro.available ? "bg-green-500" : "bg-red-500"
                      }`}
                    >
                      {pro.available ? "Available" : "Busy"}
                    </span>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-bold text-gray-900">{pro.name}</h3>
                      <span className="mt-1 inline-block rounded-lg bg-gray-100 px-2.5 py-0.5 text-xs font-semibold text-gray-600">
                        {pro.category}
                      </span>
                    </div>
                    <p className="text-base font-extrabold text-blue-600">{pro.price}</p>
                  </div>

                  <p className="mt-2 text-sm text-gray-500">{pro.description}</p>

                  {/* Rating */}
                  <div className="mt-3 flex items-center gap-1 text-sm">
                    <StarIcon className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-bold text-gray-900">{pro.rating}</span>
                    <span className="text-gray-400">({pro.reviews} reviews)</span>
                  </div>

                  {/* Stats */}
                  <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      💼 {pro.experience} exp.
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPinIcon className="h-3.5 w-3.5" />
                      {pro.distance} away
                    </span>
                  </div>

                  {/* Book Now */}
                  <button
                    className={`mt-4 w-full rounded-xl py-2.5 text-sm font-bold text-white transition ${
                      pro.available
                        ? "bg-gradient-to-r from-[#ec4899] to-[#9333ea] hover:opacity-90 shadow-md"
                        : "bg-gray-300 cursor-not-allowed"
                    }`}
                    disabled={!pro.available}
                  >
                    {pro.available ? "Book Now" : "Currently Busy"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bottom CTA — Are You a Service Professional? */}
      <section className="bg-gradient-to-r from-[#7158E2] via-[#9333ea] to-[#ec4899] px-6 py-16 text-center">
        <div className="mx-auto max-w-2xl">
          <h2 className="text-3xl font-extrabold text-white md:text-4xl">
            Are You a Service Professional?
          </h2>
          <p className="mx-auto mt-4 text-white/80 leading-relaxed">
            Join Baazaarse and connect with customers in your area. Grow your service business today!
          </p>
          <Link
            href="/create-store"
            className="mt-8 inline-flex items-center gap-2 rounded-2xl bg-white px-10 py-4 text-base font-bold text-gray-900 shadow-xl hover:shadow-2xl hover:-translate-y-0.5 transition"
          >
            🔧 Register as Service Provider
          </Link>
        </div>
      </section>
    </div>
  );
}
