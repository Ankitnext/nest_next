"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getCart, checkoutCart, getPriorityQueueCount, initCartRazorpay, verifyCartRazorpay, getCheckoutFulfillmentOptions } from "@/lib/shop-api";
import { asCurrency } from "@/lib/format";
import type { CartItem } from "@/lib/shop-api";
import {
  CreditCardIcon,
  BanknotesIcon,
  MapPinIcon,
  BuildingStorefrontIcon,
  HashtagIcon,
  QueueListIcon,
  BoltIcon
} from "@heroicons/react/24/outline";

export default function CheckoutPage() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<string>("");
  const [placingOrder, setPlacingOrder] = useState(false);
  const router = useRouter();

  const [fulfillmentType, setFulfillmentType] = useState<"delivery" | "pickup" | "table" | "queue" | null>(null);
  const [fulfillmentDetails, setFulfillmentDetails] = useState<string>("");
  const [allowedFulfillment, setAllowedFulfillment] = useState<{ delivery: boolean; pickup: boolean; table: boolean; queue: boolean } | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<"cod" | "card">("cod");

  // Delivery distance state
  const [deliveryDistanceKm, setDeliveryDistanceKm] = useState<number | null>(null);
  const [calculatingDistance, setCalculatingDistance] = useState(false);

  // Priority feature
  const [isPriority, setIsPriority] = useState(false);
  const [priorityCount, setPriorityCount] = useState<number>(0);
  const [priorityLoading, setPriorityLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getCart(),
      getPriorityQueueCount().catch(() => 0),
      getCheckoutFulfillmentOptions().catch(() => ({ delivery: true, pickup: true, table: true, queue: true }))
    ])
      .then(([cartData, count, options]) => {
        setItems(cartData);
        setPriorityCount(count);
        setAllowedFulfillment(options);
        
        // Auto-select the first available option if none is selected
        if (!fulfillmentType) {
          if (options.delivery) setFulfillmentType("delivery");
          else if (options.pickup) setFulfillmentType("pickup");
          else if (options.table) setFulfillmentType("table");
          else if (options.queue) setFulfillmentType("queue");
        }
      })
      .catch(() => setFeedback("Could not load checkout data."))
      .finally(() => {
        setLoading(false);
        setPriorityLoading(false);
      });
  }, []);

  const subtotal = items.reduce((s, i) => s + Number(i.price) * i.quantity, 0);
  const shipping = fulfillmentType === "delivery" && deliveryDistanceKm !== null 
    ? deliveryDistanceKm * 10 
    : 0;
  const tax = subtotal * 0.08;
  const priorityFee = isPriority ? 5 : 0;
  const total = subtotal + shipping + tax + priorityFee;

  function loadGoogleMapsScript(): Promise<boolean> {
    return new Promise((resolve) => {
      if ((window as any).google?.maps) return resolve(true);
      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''}&libraries=places`;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  }

  async function calculateDistance() {
    if (!fulfillmentDetails.trim()) {
      setFeedback("Please enter a valid delivery address first.");
      return;
    }
    
    // Get unique vendor addresses
    const vendorAddresses = Array.from(new Set(items.map(i => i.vendor_address).filter(Boolean))) as string[];
    
    if (vendorAddresses.length === 0) {
      setDeliveryDistanceKm(5.0); // Fallback: 5km if no vendors have addresses attached yet
      setFeedback("Vendors have no physical address listed. Default 5km delivery fee applied.");
      return;
    }

    setCalculatingDistance(true);
    setFeedback("Calculating delivery distance using Google Maps...");

    const isLoaded = await loadGoogleMapsScript();
    if (!isLoaded || !(window as any).google) {
      setCalculatingDistance(false);
      setFeedback("Google Maps failed to load. Please check your network or API key.");
      return;
    }

    const service = new (window as any).google.maps.DistanceMatrixService();
    try {
      const response = await new Promise<any>((resolve, reject) => {
        service.getDistanceMatrix({
          origins: vendorAddresses,
          destinations: [fulfillmentDetails],
          travelMode: (window as any).google.maps.TravelMode.DRIVING
        }, (res: any, status: any) => {
          if (status === "OK") resolve(res);
          else reject(new Error(status));
        });
      });

      let totalMeters = 0;
      let allValid = true;
      
      response.rows.forEach((row: any) => {
        const element = row.elements[0];
        if (element.status === "OK") {
          totalMeters += element.distance.value;
        } else {
          allValid = false;
        }
      });

      if (!allValid) {
        setFeedback("Could not calculate a driving route to this address. Please try a more specific address.");
        setDeliveryDistanceKm(null);
      } else {
        const km = totalMeters / 1000;
        setDeliveryDistanceKm(km);
        setFeedback(`Delivery distance calculated: ${km.toFixed(1)} km`);
      }
    } catch (err) {
      setFeedback("Error calculating distance. Please verify the address.");
    } finally {
      setCalculatingDistance(false);
    }
  }

  function loadRazorpayScript(): Promise<boolean> {
    return new Promise((resolve) => {
      if ((window as any).Razorpay) return resolve(true);
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  }

  async function handlePlaceOrder() {
    if (fulfillmentType === "delivery") {
      if (!fulfillmentDetails.trim()) {
        setFeedback("Please enter a delivery address.");
        return;
      }
      if (deliveryDistanceKm === null) {
        setFeedback("Please calculate the delivery fee first.");
        return;
      }
    }
    if (fulfillmentType === "table" && !fulfillmentDetails.trim()) {
      setFeedback("Please enter your table number.");
      return;
    }

    setPlacingOrder(true);
    setFeedback("");

    try {
      if (paymentMethod === "card") {
        setFeedback("Initializing secure payment...");
        if (!fulfillmentType) throw new Error("Please select a fulfillment method.");
        
        const isLoaded = await loadRazorpayScript();
        if (!isLoaded) {
          throw new Error("Razorpay SDK failed to load. Please check your internet connection and try again.");
        }

        const orderData = await initCartRazorpay(fulfillmentType, isPriority);

        const options = {
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_placeholder",
          amount: orderData.amount,
          currency: orderData.currency,
          name: "Baazaarse Checkout",
          description: `Total for ${items.length} items`,
          order_id: orderData.id,
          handler: async function (response: any) {
            setFeedback("Payment successful! Verifying...");
            try {
              if (!fulfillmentType) throw new Error("Please select a fulfillment method.");
              const res = await verifyCartRazorpay(
                fulfillmentType,
                fulfillmentDetails,
                isPriority,
                response.razorpay_payment_id,
                response.razorpay_order_id,
                response.razorpay_signature
              );
              if (res.status === "pending_payment") {
                router.push("/orders");
              } else {
                router.push("/orders?success=true");
              }
            } catch (verifyErr) {
              setFeedback(verifyErr instanceof Error ? verifyErr.message : "Payment verification failed.");
              setPlacingOrder(false);
            }
          },
          modal: {
            ondismiss: function() {
              setPlacingOrder(false);
              setFeedback("Payment cancelled.");
            }
          },
          theme: {
            color: "#10b981" // orange-600
          }
        };

        const rzp = new (window as any).Razorpay(options);
        rzp.on("payment.failed", function (response: any) {
          setFeedback(response.error.description || "Payment failed");
          setPlacingOrder(false);
        });
        rzp.open();

      } else {
        // Cash on delivery / traditional flow
        if (!fulfillmentType) throw new Error("Please select a fulfillment method.");
        const res = await checkoutCart(paymentMethod, fulfillmentType, fulfillmentDetails, isPriority);
        if (res.status === "pending_payment") {
          router.push("/orders");
        } else {
          router.push("/orders?success=true");
        }
      }
    } catch (err) {
      setFeedback(err instanceof Error ? err.message : "Failed to place order.");
      setPlacingOrder(false);
    }
  }

  if (loading || !allowedFulfillment) {
    return <p className="text-slate-500">Loading checkout…</p>;
  }

  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white/80 p-10 text-center space-y-3">
        <p className="text-slate-600 text-lg">Your cart is empty.</p>
        <Link href="/shop" className="inline-block rounded-full bg-orange-500 px-5 py-2 text-sm font-semibold text-white hover:bg-orange-500 transition">
          Return to Shop
        </Link>
      </div>
    );
  }

  return (
    <section className="space-y-6 max-w-5xl mx-auto">
      <h1 className="text-3xl font-semibold text-slate-900 mb-6">Checkout</h1>

      {feedback && (
        <p className="rounded-xl bg-orange-500/10 px-4 py-3 text-sm text-orange-300 border border-orange-500/20">
          {feedback}
        </p>
      )}

      <div className="grid gap-6 lg:grid-cols-[1.8fr_1fr]">
        <div className="space-y-6">
          
          {/* FULFILLMENT SECTION */}
          <div className="rounded-2xl border border-slate-200 bg-white/80 p-6 space-y-5">
            <h2 className="text-xl font-semibold text-white">How would you like your order?</h2>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {allowedFulfillment?.delivery && (
                <button
                  onClick={() => setFulfillmentType("delivery")}
                  className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${
                    fulfillmentType === "delivery" 
                      ? "border-orange-600 bg-orange-600/10 text-orange-500 shadow-md shadow-orange-600/10" 
                      : "border-slate-200 bg-slate-50 text-slate-500 hover:border-slate-300"
                  }`}
                >
                  <MapPinIcon className="w-6 h-6" />
                  <span className="text-sm font-medium">Delivery</span>
                </button>
              )}
              {allowedFulfillment?.pickup && (
                <button
                  onClick={() => setFulfillmentType("pickup")}
                  className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${
                    fulfillmentType === "pickup" 
                      ? "border-orange-600 bg-orange-600/10 text-orange-500 shadow-md shadow-orange-600/10" 
                      : "border-slate-200 bg-slate-50 text-slate-500 hover:border-slate-300"
                  }`}
                >
                  <BuildingStorefrontIcon className="w-6 h-6" />
                  <span className="text-sm font-medium">Pickup</span>
                </button>
              )}
              {allowedFulfillment?.table && (
                <button
                  onClick={() => setFulfillmentType("table")}
                  className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${
                    fulfillmentType === "table" 
                      ? "border-orange-600 bg-orange-600/10 text-orange-500 shadow-md shadow-orange-600/10" 
                      : "border-slate-200 bg-slate-50 text-slate-500 hover:border-slate-300"
                  }`}
                >
                  <HashtagIcon className="w-6 h-6" />
                  <span className="text-sm font-medium">On Table</span>
                </button>
              )}
              {allowedFulfillment?.queue && (
                <button
                  onClick={() => setFulfillmentType("queue")}
                  className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${
                    fulfillmentType === "queue" 
                      ? "border-orange-600 bg-orange-600/10 text-orange-500 shadow-md shadow-orange-600/10" 
                      : "border-slate-200 bg-slate-50 text-slate-500 hover:border-slate-300"
                  }`}
                >
                  <QueueListIcon className="w-6 h-6" />
                  <span className="text-sm font-medium">In Queue</span>
                </button>
              )}
            </div>

            <div className="pt-2">
              {fulfillmentType === "delivery" && (
                <div className="space-y-3">
                  <label className="text-sm font-medium text-slate-600">Delivery Address</label>
                  <textarea
                    rows={2}
                    placeholder="123 Main St, Apt 4B, City, ZIP"
                    value={fulfillmentDetails}
                    onChange={(e) => {
                      setFulfillmentDetails(e.target.value);
                      setDeliveryDistanceKm(null);
                    }}
                    className="w-full rounded-xl border border-slate-200 bg-white/50 p-3 text-sm text-white placeholder-slate-500 focus:border-orange-600 focus:outline-none focus:ring-1 focus:ring-orange-600"
                  />
                  
                  <div className="flex items-center gap-4">
                    <button
                      type="button"
                      onClick={calculateDistance}
                      disabled={calculatingDistance || !fulfillmentDetails.trim()}
                      className="px-4 py-2 bg-slate-50 hover:bg-slate-700 text-slate-600 rounded-xl border border-slate-200 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {calculatingDistance ? "Calculating..." : "Calculate Fee"}
                    </button>
                    {deliveryDistanceKm !== null && (
                      <p className="text-sm font-medium text-orange-500">
                        {deliveryDistanceKm.toFixed(1)} km • {asCurrency(deliveryDistanceKm * 10)}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {fulfillmentType === "pickup" && (
                <div className="rounded-xl bg-slate-50/50 p-4 border border-slate-200/50">
                  <p className="text-sm text-slate-600">
                    Your order will be prepared for pickup at the store locations. You will receive an estimated completion time once the order is accepted.
                  </p>
                </div>
              )}

              {fulfillmentType === "table" && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-600">Table Number</label>
                  <input
                    type="text"
                    placeholder="e.g., Table 12, Window seat"
                    value={fulfillmentDetails}
                    onChange={(e) => setFulfillmentDetails(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white/50 p-3 text-sm text-white placeholder-slate-500 focus:border-orange-600 focus:outline-none focus:ring-1 focus:ring-orange-600"
                  />
                </div>
              )}
              
              {fulfillmentType === "queue" && (
                <div className="rounded-xl bg-slate-50/50 p-4 border border-slate-200/50 flex flex-col gap-2">
                  <p className="text-sm text-slate-600">
                    You'll be placed into the physical service queue. Be near the store counters to receive your item when your name/order is called.
                  </p>
                  <p className="text-xs text-yellow-500 opacity-90 font-medium">
                    Pro tip: Enable Priority Processing below to skip the normal queue!
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* PAYMENT SECTION */}
          <div className="rounded-2xl border border-slate-200 bg-white/80 p-6 space-y-5">
            <h2 className="text-xl font-semibold text-white">Payment Method</h2>
            
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setPaymentMethod("card")}
                className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${
                  paymentMethod === "card" 
                    ? "border-cyan-500 bg-cyan-500/10 text-cyan-300 shadow-md shadow-cyan-500/10" 
                    : "border-slate-200 bg-slate-50 text-slate-500 hover:border-slate-300"
                }`}
              >
                <CreditCardIcon className="w-6 h-6" />
                <span className="text-sm font-medium">Pay Now (Card)</span>
              </button>
              <button
                onClick={() => setPaymentMethod("cod")}
                className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${
                  paymentMethod === "cod" 
                    ? "border-orange-600 bg-orange-600/10 text-orange-500 shadow-md shadow-orange-600/10" 
                    : "border-slate-200 bg-slate-50 text-slate-500 hover:border-slate-300"
                }`}
              >
                <BanknotesIcon className="w-6 h-6" />
                <span className="text-sm font-medium">Cash on Delivery</span>
              </button>
            </div>
          </div>
          
        </div>

        {/* ORDER SUMMARY */}
        <aside className="h-fit rounded-2xl border border-slate-200 bg-white/80 p-5 space-y-4 sticky top-24">
          <h2 className="text-lg font-semibold text-white">Order Summary</h2>
          
          <div className="max-h-60 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
            {items.map(item => (
              <div key={item.id} className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-3 overflow-hidden">
                  <img src={item.product_image} alt="" className="w-10 h-10 rounded-md object-cover flex-shrink-0" />
                  <span className="text-slate-600 truncate">{item.quantity}x {item.product_name}</span>
                </div>
                <span className="text-slate-800 font-medium ml-2">{asCurrency(Number(item.price) * item.quantity)}</span>
              </div>
            ))}
          </div>

          <div className="border-t border-slate-200 pt-3 space-y-2 text-sm text-slate-600">
            <div className="flex justify-between"><span>Subtotal</span><span>{asCurrency(subtotal)}</span></div>
            <div className="flex justify-between">
              <span>Delivery Fee</span>
              {fulfillmentType === "delivery" ? (
                <span>
                  {deliveryDistanceKm !== null ? asCurrency(shipping) : <span className="text-orange-400 text-xs text-right">Requires Calculation</span>}
                </span>
              ) : (
                <span className="text-slate-500">—</span>
              )}
            </div>
            
            {!priorityLoading && (
              <label className={`mt-2 flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition ${
                isPriority ? "border-amber-500 bg-amber-500/10 text-amber-200" : "border-slate-200 hover:border-slate-300 bg-slate-50/50"
              } ${priorityCount >= 5 ? "opacity-50 cursor-not-allowed" : ""}`}>
                <div className="pt-0.5">
                  <input
                    type="checkbox"
                    checked={isPriority}
                    disabled={priorityCount >= 5}
                    onChange={(e) => setIsPriority(e.target.checked)}
                    className="form-checkbox h-4 w-4 bg-white border-slate-200 rounded text-amber-500 focus:ring-amber-500 focus:ring-offset-slate-900"
                  />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-1 font-semibold text-sm">
                    <BoltIcon className="w-4 h-4" /> Priority Processing (+{asCurrency(5)})
                  </div>
                  <div className="text-xs opacity-75 mt-0.5">
                    {priorityCount >= 5 
                      ? "Priority queue is currently full (5/5)." 
                      : `Skip the line (${priorityCount}/5 slots taken)`}
                  </div>
                </div>
              </label>
            )}

            <div className="flex justify-between pt-2"><span>Tax (8%)</span><span>{asCurrency(tax)}</span></div>
            <div className="mt-3 flex justify-between border-t border-slate-200 pt-3 text-base font-bold text-orange-500">
              <span>Total</span><span>{asCurrency(total)}</span>
            </div>
          </div>
          
          <button
            onClick={handlePlaceOrder}
            disabled={placingOrder}
            className="w-full rounded-full bg-orange-500 px-4 py-3.5 text-center text-sm font-bold text-white hover:bg-orange-500 transition shadow-lg shadow-orange-600/20 disabled:opacity-50 disabled:cursor-not-allowed mt-4"
          >
            {placingOrder ? "Processing..." : `Place Order • ${asCurrency(total)}`}
          </button>
        </aside>
      </div>
    </section>
  );
}
