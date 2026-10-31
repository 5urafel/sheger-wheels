"use client";
import { useState, useEffect, use, Suspense } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { getCarById, saveCar } from "@/lib/storage";
import { getCurrentUser, assertCarOwnership } from "@/lib/auth";
import { formatETB } from "@/lib/format";
import {
  Car,
  ChevronLeft,
  ArrowRight,
  ShieldAlert,
  CheckCircle2,
  Save,
} from "lucide-react";

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

function EditCarContent({ params }) {
  const unwrappedParams = use(params);
  const carId = unwrappedParams.id;
  const router = useRouter();

  const [car, setCar] = useState(null);
  const [accessDenied, setAccessDenied] = useState("");
  const [success, setSuccess] = useState(false);

  // Form State
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState(2023);
  const [category, setCategory] = useState("Luxury SUV");
  const [transmission, setTransmission] = useState("Automatic");
  const [seats, setSeats] = useState(5);
  const [neighbourhood, setNeighbourhood] = useState("Bole");
  const [pricePerDay, setPricePerDay] = useState(6000);
  const [description, setDescription] = useState("");

  useEffect(() => {
    const user = getCurrentUser();
    if (!user) {
      router.push(`/signin?next=/owner/cars/${carId}/edit`);
      return;
    }

    const c = getCarById(carId);
    if (!c) {
      setAccessDenied("Vehicle record not found.");
      return;
    }

    // Negative Test #2: Enforce car ownership check per Section 8.1
    const ownership = assertCarOwnership(c);
    if (!ownership.allowed) {
      setAccessDenied(ownership.error);
      return;
    }

    setCar(c);
    setMake(c.make);
    setModel(c.model);
    setYear(c.year);
    setCategory(c.category);
    setTransmission(c.transmission);
    setSeats(c.seats);
    setNeighbourhood(c.neighbourhood);
    setPricePerDay(c.pricePerDay);
    setDescription(c.description);
  }, [carId, router]);

  const handleSubmit = (e) => {
    e.preventDefault();

    // Re-verify ownership before write
    const ownership = assertCarOwnership(car);
    if (!ownership.allowed) {
      setAccessDenied(ownership.error);
      return;
    }

    saveCar({
      ...car,
      make: make.trim(),
      model: model.trim(),
      year: Number(year),
      category,
      transmission,
      seats: Number(seats),
      neighbourhood,
      pricePerDay: Number(pricePerDay),
      description: description.trim(),
    });

    setSuccess(true);
    setTimeout(() => {
      router.push("/owner/cars");
    }, 700);
  };

  if (accessDenied) {
    return (
      <main className="min-h-screen bg-slate-50 flex flex-col justify-between">
        <Navbar />
        <div className="max-w-md mx-auto text-center py-32 px-4">
          <div className="w-16 h-16 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-4 font-bold shadow-md">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-rose-700 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200">
            Frontend Guardrail Refusal
          </span>
          <h1 className="font-display text-2xl font-bold text-zinc-900 mt-3">
            Not Yours: Edit Forbidden
          </h1>
          <p className="text-xs text-slate-600 mt-2 mb-6 leading-relaxed">
            {accessDenied}
          </p>
          <Link
            href="/owner/cars"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-zinc-900 text-white text-xs font-bold shadow-md hover:bg-sky-600 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Return to Your Fleet</span>
          </Link>
        </div>
        <Footer />
      </main>
    );
  }

  if (!car) return null;

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
            Edit Vehicle Listing
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Update pricing, specifications, or description for {car.make} {car.model}.
          </p>
        </div>

        {success ? (
          <div className="bg-white rounded-3xl p-8 border border-slate-200 text-center shadow-lg">
            <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto mb-3" />
            <h2 className="font-bold text-lg text-zinc-900">Changes Saved!</h2>
            <p className="text-xs text-slate-500 mt-1">
              Your vehicle listing has been updated. Redirecting...
            </p>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xl space-y-6"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Make
                </label>
                <input
                  type="text"
                  value={make}
                  onChange={(e) => setMake(e.target.value)}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-zinc-800"
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
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-zinc-800"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Year
                </label>
                <input
                  type="number"
                  value={year}
                  onChange={(e) => setYear(Number(e.target.value))}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-zinc-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-semibold text-zinc-800"
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
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-semibold text-zinc-800"
                >
                  <option value="Automatic">Automatic</option>
                  <option value="Manual">Manual</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Seats
                </label>
                <input
                  type="number"
                  value={seats}
                  onChange={(e) => setSeats(Number(e.target.value))}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-zinc-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Neighbourhood
                </label>
                <select
                  value={neighbourhood}
                  onChange={(e) => setNeighbourhood(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-semibold text-zinc-800"
                >
                  {NEIGHBOURHOODS.map((h) => (
                    <option key={h} value={h}>
                      {h}
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
                  step={500}
                  value={pricePerDay}
                  onChange={(e) => setPricePerDay(Number(e.target.value))}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-zinc-800"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Description
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs sm:text-sm text-zinc-800"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-xl bg-zinc-900 hover:bg-sky-600 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Save Changes</span>
            </button>
          </form>
        )}
      </div>

      <Footer />
    </main>
  );
}

export default function EditCarListingPage(props) {
  return (
    <Suspense fallback={<div className="py-24 text-center text-xs text-slate-500">Loading editor...</div>}>
      <EditCarContent {...props} />
    </Suspense>
  );
}

