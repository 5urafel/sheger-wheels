"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { saveCar } from "@/lib/storage";
import { getCurrentUser } from "@/lib/auth";
import {
  Car,
  ChevronLeft,
  ArrowRight,
  Upload,
  CheckCircle2,
  AlertCircle,
  Sparkles,
} from "lucide-react";

const PRESET_PHOTOS = [
  { label: "Toyota Prado TXL", url: "https://images.unsplash.com/photo-1594502184342-2e12f877aa73?auto=format&fit=crop&w=1000&q=80" },
  { label: "Hyundai Tucson", url: "https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=1000&q=80" },
  { label: "Suzuki Dzire Sedan", url: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1000&q=80" },
  { label: "Toyota Land Cruiser 300", url: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=1000&q=80" },
  { label: "Mercedes-Benz E-Class", url: "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=1000&q=80" },
  { label: "Mitsubishi Pajero Sport", url: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1000&q=80" },
];

const NEIGHBOURHOODS = [
  "Bole",
  "Kazanchis",
  "Piassa",
  "Sarbet",
  "Ayat",
  "CMC",
  "Meskel Square",
];

const CATEGORIES = [
  "Luxury SUV",
  "4x4 Off-Road",
  "Economy Sedan",
  "VIP Van",
  "Luxury Sedan",
];

export default function NewCarListingPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState(null);

  const [make, setMake] = useState("Toyota");
  const [model, setModel] = useState("RAV4 Hybrid");
  const [year, setYear] = useState(2023);
  const [category, setCategory] = useState("Luxury SUV");
  const [transmission, setTransmission] = useState("Automatic");
  const [seats, setSeats] = useState(5);
  const [neighbourhood, setNeighbourhood] = useState("Bole");
  const [pricePerDay, setPricePerDay] = useState(6500);
  const [description, setDescription] = useState("Well-maintained hybrid crossover, perfect for city drives and trips to Entoto Park. Excellent fuel economy.");
  const [selectedPhoto, setSelectedPhoto] = useState(PRESET_PHOTOS[0].url);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const user = getCurrentUser();
    if (!user) {
      router.push("/signin?next=/owner/cars/new");
      return;
    }
    setCurrentUser(user);
  }, [router]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const newCar = {
      id: `car-${Date.now()}`,
      ownerId: currentUser.id,
      make: make.trim(),
      model: model.trim(),
      year: Number(year),
      category,
      transmission,
      seats: Number(seats),
      city: "Addis Ababa",
      neighbourhood,
      latitude: 9.001,
      longitude: 38.785,
      pricePerDay: Number(pricePerDay),
      photos: [selectedPhoto],
      description: description.trim(),
      status: "pending", // Default to pending for Admin approval demo per Section 6!
      unavailableDates: [],
      rating: 0,
      reviewsCount: 0,
      createdAt: new Date().toISOString(),
    };

    saveCar(newCar);
    setSuccess(true);
    setTimeout(() => {
      router.push("/owner/cars");
    }, 700);
  };

  if (!currentUser) return null;

  return (
    <main className="min-h-screen bg-slate-50 text-zinc-900 flex flex-col">
      <Navbar />

      <div className="pt-24 pb-16 max-w-3xl mx-auto px-4 sm:px-6 flex-1 w-full">
        <div className="mb-8">
          <Link
            href="/owner/cars"
            className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-zinc-900 font-semibold mb-3"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Back to My Fleet</span>
          </Link>
          <h1 className="font-display text-3xl font-bold text-zinc-900">
            List a New Vehicle
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Publish your car on the Sheggar Wheels marketplace for verified renters in Addis Ababa.
          </p>
        </div>

        {success ? (
          <div className="bg-white rounded-3xl p-8 border border-slate-200 text-center shadow-lg">
            <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto mb-3" />
            <h2 className="font-bold text-lg text-zinc-900">
              Vehicle Listing Submitted!
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Your car has been submitted with status &quot;pending&quot; for administrator moderation review.
            </p>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xl space-y-6"
          >
            {/* Make & Model */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Make / Manufacturer
                </label>
                <input
                  type="text"
                  value={make}
                  onChange={(e) => setMake(e.target.value)}
                  required
                  placeholder="e.g. Toyota"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-zinc-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Model
                </label>
                <input
                  type="text"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  required
                  placeholder="e.g. Land Cruiser Prado"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-zinc-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
            </div>

            {/* Year & Category */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Year
                </label>
                <input
                  type="number"
                  min={2010}
                  max={2026}
                  value={year}
                  onChange={(e) => setYear(Number(e.target.value))}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-zinc-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-semibold text-zinc-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Transmission
                </label>
                <select
                  value={transmission}
                  onChange={(e) => setTransmission(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-semibold text-zinc-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
                >
                  <option value="Automatic">Automatic</option>
                  <option value="Manual">Manual</option>
                </select>
              </div>
            </div>

            {/* Seats, Hub & Daily Price */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Seating Capacity
                </label>
                <input
                  type="number"
                  min={2}
                  max={15}
                  value={seats}
                  onChange={(e) => setSeats(Number(e.target.value))}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-zinc-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Addis Hub
                </label>
                <select
                  value={neighbourhood}
                  onChange={(e) => setNeighbourhood(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-semibold text-zinc-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
                >
                  {NEIGHBOURHOODS.map((hood) => (
                    <option key={hood} value={hood}>
                      {hood}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Daily Price (ETB)
                </label>
                <input
                  type="number"
                  min={1000}
                  step={500}
                  value={pricePerDay}
                  onChange={(e) => setPricePerDay(Number(e.target.value))}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-zinc-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
            </div>

            {/* Demo Photo Selector */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                Select Vehicle Photo (Demo Presets)
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {PRESET_PHOTOS.map((p, idx) => (
                  <div
                    key={idx}
                    onClick={() => setSelectedPhoto(p.url)}
                    className={`relative rounded-xl overflow-hidden border-2 cursor-pointer transition-all aspect-[16/10] ${
                      selectedPhoto === p.url
                        ? "border-sky-600 ring-2 ring-sky-600/30 scale-102"
                        : "border-transparent opacity-75 hover:opacity-100"
                    }`}
                  >
                    <img
                      src={p.url}
                      alt={p.label}
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute bottom-1 left-1 right-1 bg-black/60 text-white text-[10px] px-1 py-0.5 rounded truncate">
                      {p.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Description & Amenities
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs sm:text-sm text-zinc-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 rounded-xl bg-zinc-900 hover:bg-sky-600 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-all active:scale-95 cursor-pointer"
            >
              <span>{isSubmitting ? "Submitting Listing..." : "Publish Vehicle Listing"}</span>
              <ArrowRight className="w-4 h-4 text-amber-400" />
            </button>
          </form>
        )}
      </div>

      <Footer />
    </main>
  );
}
