"use client";

import { useState, useEffect, use, Suspense } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { getCarById, saveCar } from "@/lib/storage";
import { getCurrentUser, assertCarOwnership } from "@/lib/auth";
import { formatDate } from "@/lib/format";
import {
  Calendar,
  ChevronLeft,
  Plus,
  Trash2,
  ShieldAlert,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

function CarAvailabilityContent({ params }) {
  const unwrappedParams = use(params);
  const carId = unwrappedParams.id;
  const router = useRouter();

  const [car, setCar] = useState(null);
  const [accessDenied, setAccessDenied] = useState("");
  const [blockDate, setBlockDate] = useState("");
  const [feedback, setFeedback] = useState("");

  const refreshCar = () => {
    const c = getCarById(carId);
    if (!c) {
      setAccessDenied("Vehicle not found.");
      return;
    }

    const ownership = assertCarOwnership(c);
    if (!ownership.allowed) {
      setAccessDenied(ownership.error);
      return;
    }

    setCar(c);
  };

  useEffect(() => {
    const user = getCurrentUser();
    if (!user) {
      router.push(`/signin?next=/owner/cars/${carId}/availability`);
      return;
    }
    refreshCar();
  }, [carId, router]);

  const handleAddBlockedDate = (e) => {
    e.preventDefault();
    if (!blockDate) return;

    const currentDates = car.unavailableDates || [];
    if (currentDates.includes(blockDate)) {
      setFeedback("This date is already blocked on your calendar.");
      return;
    }

    const updatedDates = [...currentDates, blockDate].sort();
    saveCar({ ...car, unavailableDates: updatedDates });
    setFeedback(`Blocked date ${blockDate} added.`);
    setBlockDate("");
    refreshCar();
    setTimeout(() => setFeedback(""), 3000);
  };

  const handleRemoveBlockedDate = (dateToRemove) => {
    const currentDates = car.unavailableDates || [];
    const updatedDates = currentDates.filter((d) => d !== dateToRemove);
    saveCar({ ...car, unavailableDates: updatedDates });
    setFeedback(`Date ${dateToRemove} unblocked.`);
    refreshCar();
    setTimeout(() => setFeedback(""), 3000);
  };

  if (accessDenied) {
    return (
      <main className="min-h-screen bg-slate-50 flex flex-col justify-between">
        <Navbar />
        <div className="max-w-md mx-auto text-center py-32 px-4">
          <ShieldAlert className="w-12 h-12 text-rose-500 mx-auto mb-3" />
          <h2 className="text-xl font-bold text-zinc-900">Access Denied</h2>
          <p className="text-xs text-slate-500 mt-1 mb-6">{accessDenied}</p>
          <Link
            href="/owner/cars"
            className="px-5 py-2.5 rounded-xl bg-zinc-900 text-white font-bold text-xs"
          >
            Go to My Fleet
          </Link>
        </div>
        <Footer />
      </main>
    );
  }

  if (!car) return null;

  const blockedList = car.unavailableDates || [];

  return (
    <main className="min-h-screen bg-slate-50 text-zinc-900 flex flex-col">
      <Navbar />

      <div className="pt-24 pb-16 max-w-2xl mx-auto px-4 sm:px-6 flex-1 w-full">
        <div className="mb-8">
          <Link
            href="/owner/cars"
            className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-zinc-900 font-semibold mb-3"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Back to My Fleet</span>
          </Link>
          <h1 className="font-display text-3xl font-bold text-zinc-900">
            Manage Availability
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Block out maintenance days or personal reservation dates for {car.make} {car.model}.
          </p>
        </div>

        {feedback && (
          <div className="mb-6 p-4 rounded-2xl bg-sky-50 text-sky-800 border border-sky-200 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-sky-600" />
            <span>{feedback}</span>
          </div>
        )}

        {/* Add Blockout Date Form */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-md mb-8">
          <h2 className="font-bold text-base text-zinc-900 mb-3">
            Block Out a Specific Date
          </h2>
          <form onSubmit={handleAddBlockedDate} className="flex gap-3">
            <input
              type="date"
              value={blockDate}
              onChange={(e) => setBlockDate(e.target.value)}
              required
              className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-semibold text-zinc-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-zinc-900 hover:bg-sky-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Block Date</span>
            </button>
          </form>
        </div>

        {/* Currently Blocked Dates List */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="font-bold text-sm text-zinc-900">
              Blocked Dates ({blockedList.length})
            </h3>
            <span className="text-[11px] text-slate-400">
              Renters cannot book on these days
            </span>
          </div>

          {blockedList.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-500">
              No dates currently blocked out. Vehicle is open for all unreserved calendar dates.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {blockedList.map((d) => (
                <div
                  key={d}
                  className="py-3 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2 font-semibold text-zinc-900">
                    <Calendar className="w-4 h-4 text-amber-500" />
                    <span>{formatDate(d)}</span>
                    <span className="text-slate-400 font-mono text-[11px]">({d})</span>
                  </div>

                  <button
                    onClick={() => handleRemoveBlockedDate(d)}
                    className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 transition-colors cursor-pointer"
                    title="Remove blockout"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </main>
  );
}

export default function CarAvailabilityPage(props) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center text-xs text-slate-500">Loading availability calendar...</div>}>
      <CarAvailabilityContent {...props} />
    </Suspense>
  );
}
