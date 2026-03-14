"use client";

import { useState, useEffect } from "react";
import { MagnifyingGlassIcon, FunnelIcon } from "@heroicons/react/24/outline";
import { ShoppingCartIcon } from "@heroicons/react/24/solid";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

// Define the Product interface matching the API response
interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  oldPrice?: number;
  currency: string;
  image: string;
  category: string;
  store: string;
  inStock: boolean;
  rating?: number;
}

export default function AreaMarketplacePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [addingToCart, setAddingToCart] = useState<number | null>(null);
  const { isLoggedIn } = useAuth();
  const router = useRouter();

  // Categories derived from products
  const categories = ["All", ...Array.from(new Set(products.map(p => p.category)))];

  useEffect(() => {
    async function fetchProducts() {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products`);
        if (!res.ok) throw new Error("Failed to load products");
        const data = await res.json();
        setProducts(data);
      } catch (err) {
        console.error("Error loading area products:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, []);

  const handleAddToCart = async (product: Product) => {
    if (!isLoggedIn) {
      router.push("/login");
      return;
    }

    setAddingToCart(product.id);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/cart`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ productId: product.id, quantity: 1 }),
      });

      if (!res.ok) {
        throw new Error("Failed to add to cart");
      }
      
      // Optionally show a success toast here
    } catch (error) {
      console.error("Cart error:", error);
      alert("Failed to add item to cart. Please try again.");
    } finally {
      setAddingToCart(null);
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.store.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All" || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Generate a consistent pseudo-random distance based on the store name
  const getMockDistance = (storeName: string) => {
    let hash = 0;
    for (let i = 0; i < storeName.length; i++) {
      hash = storeName.charCodeAt(i) + ((hash << 5) - hash);
    }
    const dist = (Math.abs(hash) % 50 + 5) / 10; // returns 0.5 to 5.4 
    return `${dist.toFixed(1)} km`;
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] pb-24">
      {/* Hero Header */}
      <div className="bg-[#7158E2] px-6 py-12 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#7158E2]/90 to-transparent"></div>
        
        <div className="relative z-10 max-w-2xl mx-auto space-y-4">
          <span className="inline-block rounded-full bg-white/20 px-4 py-1.5 text-xs font-semibold tracking-wider text-white backdrop-blur-sm shadow-sm ring-1 ring-white/30 uppercase">
            Your Area
          </span>
          <h1 className="text-4xl font-extrabold text-white tracking-tight sm:text-5xl leading-tight">
            Discover Local Favorites
          </h1>
          <p className="text-lg text-purple-100 font-medium">
            Browse products from all vendors near you in one place.
          </p>

          {/* Search Bar */}
          <div className="mt-8 mx-auto max-w-lg">
            <div className="relative flex items-center shadow-2xl rounded-2xl bg-white/10 backdrop-blur-md p-1.5 ring-1 ring-white/30 transition-all focus-within:ring-white/60 focus-within:bg-white/20">
              <div className="pl-4 pr-3 text-white/70">
                <MagnifyingGlassIcon className="h-6 w-6" />
              </div>
              <input
                type="text"
                placeholder="Search products, stores, or categories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent py-3 text-white placeholder:text-white/60 focus:outline-none sm:text-lg font-medium"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-8">
        
        {/* Category Filters */}
        <div className="mb-8 flex items-center gap-3 overflow-x-auto pb-4 scrollbar-hide">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-gray-400 shadow-sm ring-1 ring-gray-100">
            <FunnelIcon className="h-5 w-5" />
          </div>
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`shrink-0 rounded-xl px-5 py-2.5 text-sm font-semibold transition-all duration-300 shadow-sm
                ${
                  selectedCategory === category
                    ? "bg-[#7158E2] text-white ring-2 ring-[#7158E2] ring-offset-2 scale-105"
                    : "bg-white text-gray-600 hover:bg-purple-50 hover:text-[#7158E2] ring-1 ring-gray-200"
                }
              `}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 space-y-4">
            <div className="w-12 h-12 border-4 border-purple-200 border-t-[#7158E2] rounded-full animate-spin"></div>
            <p className="text-gray-500 font-medium animate-pulse">Scanning your area for products...</p>
          </div>
        ) : (
          /* Products Grid */
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredProducts.map((product) => (
              <div 
                key={product.id} 
                className="group relative flex flex-col rounded-3xl bg-white shadow-sm ring-1 ring-gray-100 overflow-hidden hover:shadow-xl hover:ring-purple-100 transition-all duration-300 hover:-translate-y-1"
              >
                {/* Image Section */}
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-gray-100">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(product.name)}&background=f3f4f6&color=9ca3af&size=400`;
                    }}
                  />
                  {!product.inStock && (
                    <div className="absolute inset-0 bg-white/60 backdrop-blur-sm flex items-center justify-center">
                      <span className="px-4 py-1.5 rounded-full bg-red-100 text-red-600 font-bold text-sm shadow-sm ring-1 ring-red-200">Out of Stock</span>
                    </div>
                  )}
                  <div className="absolute top-3 right-3 flex flex-col items-end gap-2">
                    <span className="inline-flex items-center rounded-lg bg-white/90 px-2.5 py-1 text-xs font-bold text-gray-900 shadow-sm backdrop-blur-md">
                      ⭐ {product.rating?.toFixed(1) || "4.5"}
                    </span>
                  </div>
                </div>

                {/* Content Section */}
                <div className="flex flex-col flex-1 p-5">
                  <div className="flex items-start justify-between gap-3 mb-1">
                    <div className="min-w-0">
                      <p className="text-xs font-semibold uppercase tracking-wider text-[#7158E2] truncate">
                        {product.category}
                      </p>
                      <h3 className="mt-1 text-lg font-bold text-gray-900 leading-tight">
                        {product.name}
                      </h3>
                      <p className="mt-1.5 text-sm text-gray-500 flex items-center gap-1.5 truncate">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                        <span className="font-medium text-gray-700">{product.store}</span>
                        <span className="text-gray-400">•</span>
                        <span className="text-orange-500 font-medium">{getMockDistance(product.store)} away</span>
                      </p>
                    </div>
                  </div>
                  
                  <div className="mt-3 flex items-center justify-between mt-auto pt-4 border-t border-gray-100">
                    <div className="flex flex-col">
                      {product.oldPrice ? (
                        <span className="text-xs font-medium text-gray-400 line-through">
                          {product.currency} {product.oldPrice.toFixed(2)}
                        </span>
                      ) : null}
                      <span className="text-xl font-extrabold text-gray-900">
                        {product.currency} {product.price.toFixed(2)}
                      </span>
                    </div>
                    
                    <button
                      onClick={() => handleAddToCart(product)}
                      disabled={!product.inStock || addingToCart === product.id}
                      className="flex h-11 items-center justify-center gap-2 rounded-xl bg-[#7158E2] px-5 text-sm font-bold text-white transition-all shadow-md shadow-purple-200 hover:bg-[#5D46C9] hover:shadow-lg hover:shadow-purple-300 disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-95"
                    >
                      {addingToCart === product.id ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      ) : (
                        <>
                          <ShoppingCartIcon className="h-4 w-4" />
                          Add
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredProducts.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="h-24 w-24 rounded-full bg-purple-50 flex items-center justify-center mb-6 ring-8 ring-purple-50/50">
              <ShoppingBagIcon className="h-10 w-10 text-purple-200" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900">No products found</h3>
            <p className="mt-2 text-gray-500 max-w-sm mx-auto">
              We couldn't find anything matching your current filters. Try adjusting your search or category.
            </p>
            <button
              onClick={() => { setSearchQuery(""); setSelectedCategory("All"); }}
              className="mt-8 rounded-xl bg-gray-900 px-6 py-3 text-sm font-bold text-white shadow-lg hover:bg-gray-800 transition"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// Ensure the ShoppingBagIcon is imported
function ShoppingBagIcon(props: React.ComponentProps<"svg">) {
  return (
    <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
    </svg>
  );
}
