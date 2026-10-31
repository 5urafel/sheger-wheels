"use client";

import { useState, useEffect, use, Suspense } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { AddisMap } from "@/components/AddisMap";
import {
  getCarById,
  getUserById,
  getReviews,
  writeSession,
  STORAGE_KEYS,
  hasBookingConflict,
} from "@/lib/storage";
import { getCurrentUser } from "@/lib/auth";
import { formatETB, formatUSD, formatDate } from "@/lib/format";
import {
  Car,
  MapPin,
  Calendar,
  Users,
  Fuel,
  Gauge,
  Star,
  ShieldCheck,
  Award,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ChevronLeft,
  Share2,
  Clock,
  Sparkles,
} from "lucide-react";

function CarDetailContent({ params }) {
  const unwrappedParams = use(params);
  const carId = unwrappedParams.id;
  const router = useRouter();

  const [car, setCar] = useState(null);
  const [owner, setOwner] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);
  const [currentUser, setCurrentUser] = useState(null);

  // Booking Calculator State
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [chauffeurIncluded, setChauffeurIncluded] = useState(false);
  const [dateError, setDateError] = useState("");
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    const loadedCar = getCarById(carId);
    setCar(loadedCar);

    if (loadedCar) {
      const loadedOwner = getUserById(loadedCar.ownerId);
      setOwner(loadedOwner);

      const allReviews = getReviews();
      const carReviews = allReviews.filter((r) => r.carId === loadedCar.id);
      setReviews(carReviews);
    }

    setCurrentUser(getCurrentUser());

    // Default dates: tomorrow to +3 days
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const threeDays = new Date(Date.now() + 4 * 24 * 60 * 60 * 1000);
    setStartDate(tomorrow.toISOString().split("T")[0]);
    setEndDate(threeDays.toISOString().split("T")[0]);
  }, [carId]);

  if (!car) {
    return (
      <main className="min-h-screen bg-slate-50 flex flex-col justify-between">
        <Navbar />
        <div className="max-w-xl mx-auto text-center py-32 px-4">
          <div className="w-16 h-16 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center mx-auto mb-4">
            <Car className="w-8 h-8" />
          </div>
          <h1 className="font-display text-2xl font-bold text-zinc-900">
            Vehicle Not Found
          </h1>
          <p className="text-sm text-slate-500 mt-2 mb-6">
            The car listing you requested could not be located. It may have been deactivated or removed.
          </p>
          <Link
            href="/cars"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-zinc-900 text-white text-xs font-bold shadow-md hover:bg-sky-600 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Return to Fleet Catalogue</span>
          </Link>
        </div>
        <Footer />
      </main>
    );
  }

  // Calculate Days & Pricing
  const start = startDate ? new Date(startDate) : null;
  const end = endDate ? new Date(endDate) : null;
  const diffTime = start && end ? end.getTime() - start.getTime() : 0;
  const days = Math.max(1, Math.round(diffTime / (1000 * 60 * 60 * 24)));
  const dailyPrice = car.pricePerDay || 5000;
  const chauffeurFee = chauffeurIncluded ? 1500 * days : 0;
  const subtotal = dailyPrice * days + chauffeurFee;
  const platformFee = Math.round(subtotal * 0.05); // 5% mock fee per spec
  const grandTotal = subtotal + platformFee;

  // Handle Booking Proceed
  const handleProceedToCheckout = () => {
    setDateError("");

    if (!startDate || !endDate) {
      setDateError("Please select both pickup and return dates.");
      return;
    }

    if (new Date(startDate) > new Date(endDate)) {
      setDateError("Return date must be after pickup date.");
      return;
    }

    // Check conflict
    const conflictCheck = hasBookingConflict(car.id, startDate, endDate);
    if (conflictCheck.conflict) {
      setDateError(`Unavailable: ${conflictCheck.reason}`);
      return;
    }

    // Prepare checkout draft in sessionStorage
    const draft = {
      carId: car.id,
      carName: `${car.make} ${car.model}`,
      carPhoto: car.photos?.[0] || car.image,
      ownerId: car.ownerId,
      ownerName: owner?.name || "Dr. Henok Kebede",
      startDate,
      endDate,
      days,
      pricePerDay: dailyPrice,
      subtotal,
      fee: platformFee,
      total: grandTotal,
      chauffeurIncluded,
      neighbourhood: car.neighbourhood,
    };
    writeSession(STORAGE_KEYS.CHECKOUT_DRAFT, draft);

    // If not authenticated, redirect to signin with return URL
    if (!currentUser) {
      router.push(`/signin?next=/checkout`);
    } else {
      router.push(`/checkout`);
    }
  };

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  // Structured Data (JSON-LD) for SEO / Concept #22
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Car",
    name: `${car.make} ${car.model}`,
    vehicleModelDate: String(car.year),
    itemCondition: "https://schema.org/UsedCondition",
    fuelType: "Diesel",
    numberOfDoors: 5,
    seatingCapacity: car.seats,
    vehicleTransmission: car.transmission,
    offers: {
      "@type": "Offer",
      price: car.pricePerDay,
      priceCurrency: "ETB",
      availability: "https://schema.org/InStock",
    },
  };

  return (
    <main className="min-h-screen bg-slate-50 text-zinc-900 flex flex-col">
      <Navbar />

      {/* JSON-LD Script tag for Search Engines */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="pt-24 pb-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex-1">
        {/* Breadcrumb & Quick Actions */}
        <div className="flex items-center justify-between py-4 mb-2 text-xs">
          <Link
            href="/cars"
            className="inline-flex items-center gap-1.5 text-slate-500 hover:text-zinc-900 font-semibold"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Back to All Vehicles</span>
          </Link>

          <button
            onClick={handleCopyLink}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 font-semibold cursor-pointer shadow-sm"
          >
            <Share2 className="w-3.5 h-3.5 text-sky-600" />
            <span>{copiedLink ? "Link Copied!" : "Share Listing"}</span>
          </button>
        </div>

        {/* Title & Location Header */}
        <div className="mb-6">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-sky-700 bg-sky-50 px-2.5 py-1 rounded-full border border-sky-100">
              {car.category}
            </span>
            <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
              Model Year {car.year}
            </span>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Verified Inspection
            </span>
          </div>

          <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-zinc-900">
            {car.make} {car.model}
          </h1>

          <div className="flex items-center gap-4 mt-2 text-xs sm:text-sm text-slate-600">
            <span className="flex items-center gap-1">
              <MapPin className="w-4 h-4 text-sky-600" />
              {car.neighbourhood}, Addis Ababa
            </span>
            <span className="flex items-center gap-1 font-bold text-zinc-900">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              {(car.rating || 5.0).toFixed(1)}
              <span className="text-slate-400 font-normal">
                ({car.reviewsCount || 0} reviews)
              </span>
            </span>
          </div>
        </div>

        {/* Photo Gallery Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-10">
          <div className="lg:col-span-2 relative aspect-[16/10] rounded-3xl overflow-hidden bg-slate-900 shadow-md">
            <img
              src={car.photos?.[selectedPhotoIndex] || car.photos?.[0] || car.image}
              alt={`${car.make} ${car.model}`}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="flex flex-col gap-4">
            {car.photos?.map((photo, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedPhotoIndex(idx)}
                className={`relative aspect-[16/9] rounded-2xl overflow-hidden border-2 transition-all cursor-pointer ${
                  selectedPhotoIndex === idx
                    ? "border-sky-600 ring-2 ring-sky-600/30 scale-[1.02]"
                    : "border-transparent opacity-80 hover:opacity-100"
                }`}
              >
                <img
                  src={photo}
                  alt={`Gallery ${idx + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>

        {/* Content & Sidebar Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
          {/* Left Column: Specs, Description, Map, Reviews */}
          <div className="lg:col-span-2 space-y-10">
            {/* Key Specs Row */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
              <h2 className="font-bold text-base text-zinc-900 mb-4">
                Vehicle Specifications
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                  <Gauge className="w-5 h-5 text-sky-600 mx-auto mb-1.5" />
                  <div className="text-[10px] text-slate-400 uppercase font-bold">
                    Transmission
                  </div>
                  <div className="font-bold text-xs sm:text-sm text-zinc-900 mt-0.5">
                    {car.transmission}
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                  <Users className="w-5 h-5 text-sky-600 mx-auto mb-1.5" />
                  <div className="text-[10px] text-slate-400 uppercase font-bold">
                    Seating
                  </div>
                  <div className="font-bold text-xs sm:text-sm text-zinc-900 mt-0.5">
                    {car.seats} Passengers
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                  <Fuel className="w-5 h-5 text-sky-600 mx-auto mb-1.5" />
                  <div className="text-[10px] text-slate-400 uppercase font-bold">
                    Fuel
                  </div>
                  <div className="font-bold text-xs sm:text-sm text-zinc-900 mt-0.5">
                    Diesel / Turbo
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                  <ShieldCheck className="w-5 h-5 text-emerald-600 mx-auto mb-1.5" />
                  <div className="text-[10px] text-slate-400 uppercase font-bold">
                    Insurance
                  </div>
                  <div className="font-bold text-xs sm:text-sm text-zinc-900 mt-0.5">
                    Comprehensive
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
              <h2 className="font-bold text-lg text-zinc-900">About this Vehicle</h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                {car.description}
              </p>
              <div className="pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Free cancellation up to 24 hours before pickup</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Bole International Airport pickup available</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>24/7 Roadside emergency assistance included</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Full tank on pickup guaranteed</span>
                </div>
              </div>
            </div>

            {/* Host Profile */}
            {owner && (
              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <img
                    src={owner.avatar}
                    alt={owner.name}
                    className="w-14 h-14 rounded-2xl object-cover border border-slate-200 shadow-sm"
                  />
                  <div>
                    <div className="text-xs font-bold uppercase tracking-wider text-amber-600">
                      Vehicle Host
                    </div>
                    <h3 className="font-bold text-base text-zinc-900">
                      {owner.name}
                    </h3>
                    <div className="text-xs text-slate-500 mt-0.5">
                      Verified Host • Joined Jan 2026 • 100% Response Rate
                    </div>
                  </div>
                </div>
                <span className="hidden sm:inline-flex items-center gap-1 text-xs font-bold text-sky-700 bg-sky-50 px-3 py-1.5 rounded-xl border border-sky-200">
                  <Award className="w-4 h-4 text-sky-600" />
                  Superhost
                </span>
              </div>
            )}

            {/* Interactive Leaflet Map per Section 12 */}
            <div className="space-y-3">
              <h2 className="font-bold text-lg text-zinc-900">
                Pickup Area & Station Coordinates
              </h2>
              <AddisMap
                latitude={car.latitude || 8.995}
                longitude={car.longitude || 38.789}
                title={`${car.make} ${car.model}`}
                neighbourhood={car.neighbourhood}
                height="320px"
              />
            </div>

            {/* Renter Reviews Section */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <h2 className="font-bold text-lg text-zinc-900 flex items-center gap-2">
                  <span>Customer Reviews</span>
                  <span className="text-sm font-semibold text-slate-400">
                    ({reviews.length})
                  </span>
                </h2>
                <div className="flex items-center gap-1 font-bold text-zinc-900">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span>{(car.rating || 5.0).toFixed(1)}</span>
                </div>
              </div>

              {reviews.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-500">
                  No reviews submitted yet for this vehicle. Be the first to rent and leave feedback!
                </div>
              ) : (
                <div className="space-y-6">
                  {reviews.map((rev) => (
                    <div key={rev.id} className="space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <div className="font-bold text-zinc-900">
                          Verified Renter
                        </div>
                        <div className="text-slate-400">
                          {formatDate(rev.createdAt)}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-amber-400">
                        {Array.from({ length: rev.rating || 5 }).map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 fill-current" />
                        ))}
                      </div>
                      <p className="text-slate-600 leading-relaxed">
                        {rev.comment}
                      </p>

                      {/* Owner Reply */}
                      {rev.ownerReply && (
                        <div className="mt-3 ml-4 p-3 rounded-xl bg-slate-50 border-l-2 border-amber-500 text-slate-700">
                          <span className="font-bold text-zinc-900 block mb-0.5">
                            Response from Host:
                          </span>
                          <span>{rev.ownerReply}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Sticky Booking Calculator Card */}
          <div className="sticky top-24">
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-xl space-y-6">
              {/* Daily Rate Header */}
              <div className="flex items-baseline justify-between pb-4 border-b border-slate-100">
                <div>
                  <span className="text-2xl sm:text-3xl font-extrabold text-zinc-900">
                    {formatETB(car.pricePerDay)}
                  </span>
                  <span className="text-xs text-slate-500 font-semibold"> / day</span>
                </div>
                <div className="text-xs text-slate-400 font-medium">
                  ~{formatUSD(car.pricePerDay)}/day
                </div>
              </div>

              {/* Error Message */}
              {dateError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                  <span>{dateError}</span>
                </div>
              )}

              {/* Date Inputs */}
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Pickup Date
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-zinc-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Return Date
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    min={startDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-zinc-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              </div>

              {/* Chauffeur Add-on Checkbox */}
              <label className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-200 bg-slate-50 cursor-pointer hover:bg-slate-100 transition-colors">
                <input
                  type="checkbox"
                  checked={chauffeurIncluded}
                  onChange={(e) => setChauffeurIncluded(e.target.checked)}
                  className="w-4 h-4 mt-0.5 text-sky-600 rounded accent-sky-600"
                />
                <div>
                  <div className="font-semibold text-xs text-zinc-900">
                    Add Chauffeur (+1,500 ETB/day)
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Bilingual chauffeur experienced in Addis traffic
                  </div>
                </div>
              </label>

              {/* Price Breakdown Calculation */}
              <div className="space-y-2 text-xs pt-4 border-t border-slate-100 text-slate-600">
                <div className="flex justify-between">
                  <span>
                    {formatETB(dailyPrice)} × {days} {days === 1 ? "day" : "days"}
                  </span>
                  <span className="font-semibold text-zinc-900">
                    {formatETB(dailyPrice * days)}
                  </span>
                </div>

                {chauffeurIncluded && (
                  <div className="flex justify-between">
                    <span>Chauffeur service ({days} days)</span>
                    <span className="font-semibold text-zinc-900">
                      {formatETB(chauffeurFee)}
                    </span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span className="flex items-center gap-1">
                    Platform Service Fee (5%)
                    <span className="text-[10px] text-slate-400">(demo)</span>
                  </span>
                  <span className="font-semibold text-zinc-900">
                    {formatETB(platformFee)}
                  </span>
                </div>

                <div className="flex justify-between pt-3 border-t border-slate-200 text-sm font-bold text-zinc-900">
                  <span>Total (ETB)</span>
                  <span className="text-base text-sky-700">
                    {formatETB(grandTotal)}
                  </span>
                </div>
              </div>

              {/* Reserve Button */}
              <button
                type="button"
                onClick={handleProceedToCheckout}
                className="w-full py-3.5 rounded-xl bg-zinc-900 hover:bg-sky-600 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all active:scale-95 shadow-md cursor-pointer"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4 text-amber-400" />
              </button>

              <div className="text-center text-[11px] text-slate-400">
                You won&apos;t be charged yet. Mock TeleBirr simulation.
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}

export default function CarDetailPage(props) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center text-xs text-slate-500">Loading car details...</div>}>
      <CarDetailContent {...props} />
    </Suspense>
  );
}
