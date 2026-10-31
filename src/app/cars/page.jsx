"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { getPublicCars } from "@/lib/storage";
import { formatETB, formatUSD } from "@/lib/format";
import {
  Search,
  SlidersHorizontal,
  MapPin,
  Car,
  Fuel,
  Users,
  Gauge,
  Star,
  ArrowRight,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Filter,
  X,
  Sparkles,
} from "lucide-react";

const NEIGHBOURHOODS = [
  "All",
  "Bole",
  "Kazanchis",
  "Piassa",
  "Sarbet",
  "Ayat",
  "CMC",
  "Meskel Square",
];

const CATEGORIES = [
  "All",
  "Luxury SUV",
  "4x4 Off-Road",
  "Economy Sedan",
  "VIP Van",
  "Luxury Sedan",
];

const TRANSMISSIONS = ["All", "Automatic", "Manual"];
const SEAT_OPTIONS = [
  { label: "All Seats", value: 0 },
  { label: "5+ Seats", value: 5 },
  { label: "7+ Seats", value: 7 },
  { label: "12+ Seats", value: 12 },
];

const SORT_OPTIONS = [
  { label: "Recommended / Popular", value: "popularity" },
  { label: "Price: Low to High", value: "price-asc" },
  { label: "Price: High to Low", value: "price-desc" },
  { label: "Newest Model", value: "newest" },
  { label: "Highest Rated", value: "rating" },
];

const ITEMS_PER_PAGE = 6;

function CarsCatalogueContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Read initial filter values from URL search parameters
  const [allCars, setAllCars] = useState([]);
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const [selectedNeighbourhood, setSelectedNeighbourhood] = useState(
    searchParams.get("neighbourhood") || "All"
  );
  const [selectedCategory, setSelectedCategory] = useState(
    searchParams.get("category") || "All"
  );
  const [selectedTransmission, setSelectedTransmission] = useState(
    searchParams.get("transmission") || "All"
  );
  const [minSeats, setMinSeats] = useState(Number(searchParams.get("seats")) || 0);
  const [maxPrice, setMaxPrice] = useState(
    Number(searchParams.get("maxPrice")) || 20000
  );
  const [sortBy, setSortBy] = useState(searchParams.get("sort") || "popularity");
  const [currentPage, setCurrentPage] = useState(
    Number(searchParams.get("page")) || 1
  );
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Load cars from storage on mount
  useEffect(() => {
    const cars = getPublicCars();
    setAllCars(cars);

    const handleStorageUpdate = () => {
      setAllCars(getPublicCars());
    };
    window.addEventListener("sw_storage_update", handleStorageUpdate);
    window.addEventListener("storage", handleStorageUpdate);
    return () => {
      window.removeEventListener("sw_storage_update", handleStorageUpdate);
      window.removeEventListener("storage", handleStorageUpdate);
    };
  }, []);

  // Sync state back to URL query parameters
  useEffect(() => {
    const params = new URLSearchParams();
    if (searchQuery.trim()) params.set("q", searchQuery.trim());
    if (selectedNeighbourhood !== "All") params.set("neighbourhood", selectedNeighbourhood);
    if (selectedCategory !== "All") params.set("category", selectedCategory);
    if (selectedTransmission !== "All") params.set("transmission", selectedTransmission);
    if (minSeats > 0) params.set("seats", String(minSeats));
    if (maxPrice < 20000) params.set("maxPrice", String(maxPrice));
    if (sortBy !== "popularity") params.set("sort", sortBy);
    if (currentPage > 1) params.set("page", String(currentPage));

    const newQuery = params.toString();
    const targetUrl = newQuery ? `/cars?${newQuery}` : "/cars";
    router.replace(targetUrl, { scroll: false });
  }, [
    searchQuery,
    selectedNeighbourhood,
    selectedCategory,
    selectedTransmission,
    minSeats,
    maxPrice,
    sortBy,
    currentPage,
    router,
  ]);

  // Reset to page 1 whenever filters change
  const handleFilterChange = (setter, value) => {
    setter(value);
    setCurrentPage(1);
  };

  // Reset all filters to default
  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedNeighbourhood("All");
    setSelectedCategory("All");
    setSelectedTransmission("All");
    setMinSeats(0);
    setMaxPrice(20000);
    setSortBy("popularity");
    setCurrentPage(1);
  };

  // Filter & Sort Logic
  const filteredCars = useMemo(() => {
    return allCars
      .filter((car) => {
        // Search query (make, model, description)
        if (searchQuery.trim()) {
          const query = searchQuery.toLowerCase();
          const matchTitle = `${car.make} ${car.model}`.toLowerCase().includes(query);
          const matchDesc = (car.description || "").toLowerCase().includes(query);
          const matchNeighbourhood = (car.neighbourhood || "").toLowerCase().includes(query);
          if (!matchTitle && !matchDesc && !matchNeighbourhood) return false;
        }

        // Neighbourhood filter
        if (selectedNeighbourhood !== "All" && car.neighbourhood !== selectedNeighbourhood) {
          return false;
        }

        // Category filter
        if (selectedCategory !== "All" && car.category !== selectedCategory) {
          return false;
        }

        // Transmission filter
        if (selectedTransmission !== "All" && car.transmission !== selectedTransmission) {
          return false;
        }

        // Seats filter
        if (minSeats > 0 && car.seats < minSeats) {
          return false;
        }

        // Max price filter
        if (car.pricePerDay > maxPrice) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === "price-asc") return a.pricePerDay - b.pricePerDay;
        if (sortBy === "price-desc") return b.pricePerDay - a.pricePerDay;
        if (sortBy === "newest") return b.year - a.year;
        if (sortBy === "rating") return (b.rating || 0) - (a.rating || 0);
        return 0; // default order
      });
  }, [
    allCars,
    searchQuery,
    selectedNeighbourhood,
    selectedCategory,
    selectedTransmission,
    minSeats,
    maxPrice,
    sortBy,
  ]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredCars.length / ITEMS_PER_PAGE) || 1;
  const paginatedCars = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredCars.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredCars, currentPage]);

  const activeFiltersCount = [
    searchQuery.trim() !== "",
    selectedNeighbourhood !== "All",
    selectedCategory !== "All",
    selectedTransmission !== "All",
    minSeats > 0,
    maxPrice < 20000,
  ].filter(Boolean).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Top Banner / Heading */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-sky-50 text-sky-700 border border-sky-100 mb-2">
            <Car className="w-3.5 h-3.5" />
            Verified P2P Fleet
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-zinc-900">
            Browse Car Rentals in Addis Ababa
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Showing <strong className="text-zinc-900">{filteredCars.length}</strong> available vehicles across Bole, Kazanchis, Piassa, and regional hubs.
          </p>
        </div>

        {/* Quick Search & Mobile Filter Toggle */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleFilterChange(setSearchQuery, e.target.value)}
              placeholder="Search make, model, or area..."
              className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 text-xs sm:text-sm font-medium text-zinc-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all shadow-sm"
            />
            {searchQuery && (
              <button
                onClick={() => handleFilterChange(setSearchQuery, "")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-zinc-700"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <button
            onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
            className="lg:hidden flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-zinc-800 shadow-sm"
          >
            <Filter className="w-4 h-4 text-sky-600" />
            <span>Filters {activeFiltersCount > 0 && `(${activeFiltersCount})`}</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Filters Sidebar + Car Listings */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        {/* Filters Sidebar (Desktop + Mobile Drawer) */}
        <aside
          className={`lg:block ${
            mobileFilterOpen ? "fixed inset-0 z-50 bg-black/50 p-4 flex items-center justify-center backdrop-blur-sm" : "hidden"
          }`}
        >
          <div
            className={`bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-6 w-full ${
              mobileFilterOpen ? "max-w-md max-h-[90vh] overflow-y-auto" : ""
            }`}
          >
            {/* Filter Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-sky-600" />
                <h3 className="font-bold text-sm text-zinc-900">Filters</h3>
                {activeFiltersCount > 0 && (
                  <span className="w-5 h-5 rounded-full bg-sky-100 text-sky-700 text-[10px] font-bold flex items-center justify-center">
                    {activeFiltersCount}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3">
                {activeFiltersCount > 0 && (
                  <button
                    onClick={handleResetFilters}
                    className="text-[11px] font-bold text-sky-600 hover:underline flex items-center gap-1"
                  >
                    <RotateCcw className="w-3 h-3" />
                    Reset
                  </button>
                )}
                {mobileFilterOpen && (
                  <button
                    onClick={() => setMobileFilterOpen(false)}
                    className="p-1 rounded-full text-slate-400 hover:text-zinc-900 lg:hidden"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>

            {/* 1. Neighbourhood Filter */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Neighbourhood / Hub
              </label>
              <select
                value={selectedNeighbourhood}
                onChange={(e) => handleFilterChange(setSelectedNeighbourhood, e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs sm:text-sm font-semibold text-zinc-800 focus:outline-none focus:ring-2 focus:ring-sky-500 cursor-pointer"
              >
                {NEIGHBOURHOODS.map((hood) => (
                  <option key={hood} value={hood}>
                    {hood}
                  </option>
                ))}
              </select>
            </div>

            {/* 2. Vehicle Category Filter */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Category
              </label>
              <div className="flex flex-wrap gap-1.5">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => handleFilterChange(setSelectedCategory, cat)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                      selectedCategory === cat
                        ? "bg-zinc-900 text-white shadow-sm"
                        : "bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Transmission */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Transmission
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {TRANSMISSIONS.map((t) => (
                  <button
                    key={t}
                    onClick={() => handleFilterChange(setSelectedTransmission, t)}
                    className={`py-1.5 text-center rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                      selectedTransmission === t
                        ? "bg-sky-600 text-white font-bold"
                        : "bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* 4. Minimum Seats */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Seating Capacity
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {SEAT_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => handleFilterChange(setMinSeats, opt.value)}
                    className={`py-1.5 px-2 text-center rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                      minSeats === opt.value
                        ? "bg-zinc-900 text-white"
                        : "bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 5. Max Daily Rate Slider */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Max Daily Rate
                </label>
                <span className="text-xs font-bold text-sky-700">
                  {formatETB(maxPrice)}
                </span>
              </div>
              <input
                type="range"
                min={3000}
                max={20000}
                step={500}
                value={maxPrice}
                onChange={(e) => handleFilterChange(setMaxPrice, Number(e.target.value))}
                className="w-full accent-sky-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                <span>3,000 ETB</span>
                <span>20,000+ ETB</span>
              </div>
            </div>

            {mobileFilterOpen && (
              <button
                onClick={() => setMobileFilterOpen(false)}
                className="w-full py-3 rounded-xl bg-zinc-900 text-white font-bold text-xs"
              >
                Apply & View ({filteredCars.length})
              </button>
            )}
          </div>
        </aside>

        {/* Listings Section */}
        <div className="lg:col-span-3 space-y-6">
          {/* Sorting Bar */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <span className="text-slate-500 font-medium">
              Showing page <strong className="text-zinc-900">{currentPage}</strong> of{" "}
              <strong className="text-zinc-900">{totalPages}</strong>
            </span>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-slate-400 uppercase tracking-wider font-bold text-[10px]">
                Sort by:
              </span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-zinc-800 focus:outline-none focus:ring-2 focus:ring-sky-500 cursor-pointer"
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Empty State when no cars match */}
          {paginatedCars.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm space-y-4">
              <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                <Car className="w-8 h-8" />
              </div>
              <h3 className="font-display text-2xl font-bold text-zinc-900">
                No Vehicles Match Your Filters
              </h3>
              <p className="text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
                We couldn't find any approved cars matching your current criteria. Try expanding your search radius or clearing specific filters.
              </p>
              <button
                onClick={handleResetFilters}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-zinc-900 hover:bg-sky-600 text-white text-xs font-bold shadow-md transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset All Filters</span>
              </button>
            </div>
          ) : (
            /* Vehicle Cards Grid */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginatedCars.map((car) => (
                <div
                  key={car.id}
                  className="group relative bg-white rounded-2xl overflow-hidden border border-slate-200/80 shadow-sm hover:shadow-card-hover transition-all duration-300 flex flex-col justify-between"
                >
                  <div>
                    {/* Top Photo */}
                    <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
                      <img
                        src={car.photos?.[0] || car.image}
                        alt={`${car.make} ${car.model}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />

                      {/* Neighbourhood Badge */}
                      <span className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm text-zinc-900 text-xs font-bold px-3 py-1 rounded-full shadow-sm flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-sky-600" />
                        <span>{car.neighbourhood}</span>
                      </span>

                      {/* Year Badge */}
                      <span className="absolute top-3 right-3 bg-zinc-900/80 backdrop-blur-sm text-white text-xs font-semibold px-2.5 py-1 rounded-full">
                        {car.year}
                      </span>
                    </div>

                    {/* Content Details */}
                    <div className="p-5">
                      <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
                        <span className="font-bold uppercase tracking-wider text-sky-600 text-[11px]">
                          {car.category}
                        </span>
                        <div className="flex items-center gap-1 font-bold text-zinc-800">
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          <span>{(car.rating || 5.0).toFixed(1)}</span>
                          <span className="text-slate-400">({car.reviewsCount || 0})</span>
                        </div>
                      </div>

                      <h3 className="text-base font-bold text-zinc-900 group-hover:text-sky-600 transition-colors line-clamp-1">
                        {car.make} {car.model}
                      </h3>

                      <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                        {car.description}
                      </p>

                      {/* Specs */}
                      <div className="grid grid-cols-3 gap-1.5 py-3 my-3 border-y border-slate-100 text-xs text-slate-600 font-medium">
                        <div className="flex items-center gap-1">
                          <Gauge className="w-3.5 h-3.5 text-slate-400" />
                          <span className="truncate">{car.transmission}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="w-3.5 h-3.5 text-slate-400" />
                          <span>{car.seats} Seats</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Fuel className="w-3.5 h-3.5 text-slate-400" />
                          <span>Diesel</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Pricing & Link */}
                  <div className="px-5 pb-5 pt-2 flex items-center justify-between border-t border-slate-100 bg-slate-50/50">
                    <div>
                      <div className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">
                        Daily Price
                      </div>
                      <div className="flex items-baseline gap-1">
                        <span className="text-lg font-bold text-zinc-900">
                          {formatETB(car.pricePerDay)}
                        </span>
                        <span className="text-[10px] text-slate-400 font-normal">/day</span>
                      </div>
                      <div className="text-[10px] text-slate-400">
                        ~{formatUSD(car.pricePerDay)}/day
                      </div>
                    </div>

                    <Link
                      href={`/cars/${car.id}`}
                      className="flex items-center gap-1 bg-zinc-900 hover:bg-sky-600 text-white text-xs font-semibold px-3.5 py-2 rounded-xl transition-all active:scale-95 shadow-sm"
                    >
                      <span>View</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="mt-10 flex items-center justify-between border-t border-slate-200 pt-6">
              <button
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="flex items-center gap-1 px-4 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold text-zinc-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Previous</span>
              </button>

              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-8 h-8 rounded-xl text-xs font-bold transition-all ${
                      currentPage === page
                        ? "bg-zinc-900 text-white shadow-md scale-105"
                        : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>

              <button
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="flex items-center gap-1 px-4 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold text-zinc-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
              >
                <span>Next</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function CarsPage() {
  return (
    <main className="min-h-screen bg-slate-50 text-zinc-900 flex flex-col">
      <Navbar />
      <div className="pt-24 flex-1">
        <Suspense fallback={<div className="text-center py-24 text-sm text-slate-500">Loading car catalogue...</div>}>
          <CarsCatalogueContent />
        </Suspense>
      </div>
      <Footer />
    </main>
  );
}
