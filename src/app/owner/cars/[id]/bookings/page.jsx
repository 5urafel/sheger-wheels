"use client";

import { useState, useEffect, use, Suspense } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { getCarById, getBookings, updateBookingStatus } from "@/lib/storage";
import { getCurrentUser, assertCarOwnership } from "@/lib/auth";
import { formatETB, formatDate } from "@/lib/format";
import {
  Car,
  ChevronLeft,
  Calendar,
  CheckCircle2,
  XCircle,
  ShieldAlert,
  ArrowRight,
} from "lucide-react";

function CarSpecificBookingsContent({ params }) {
  const unwrappedParams = use(params);
  const carId = unwrappedParams.id;
  const router = useRouter();

  const [car, setCar] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [accessDenied, setAccessDenied] = useState("");

  const refresh = () => {
    const c = getCarById(carId);
    if (!c) {
      setAccessDenied("Vehicle record not found.");
      return;
    }
    const ownership = assertCarOwnership(c);
    if (!ownership.allowed) {
      setAccessDenied(ownership.error);
      return;
    }
    setCar(c);

    const all = getBookings();
    setBookings(all.filter((b) => b.carId === c.id));
  };

  useEffect(() => {
    const user = getCurrentUser();
    if (!user) {
      router.push(`/signin?next=/owner/cars/${carId}/bookings`);
      return;
    }
    refresh();
  }, [carId, router]);

  const handleAction = (bookingId, status) => {
    updateBookingStatus(bookingId, status);
    refresh();
  };

  if (accessDenied) {
    return (
      <main className="min-h-screen bg-slate-50 flex flex-col justify-between">
        <Navbar />
        <div className="max-w-md mx-auto text-center py-32 px-4">
          <ShieldAlert className="w-12 h-12 text-rose-500 mx-auto mb-3" />
          <h2 className="text-xl font-bold text-zinc-900">Access Refused</h2>
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

  return (
    <main className="min-h-screen bg-slate-50 text-zinc-900 flex flex-col">
      <Navbar />

      <div className="pt-24 pb-16 max-w-5xl mx-auto px-4 sm:px-6 flex-1 w-full">
        <div className="mb-8">
          <Link
            href="/owner/cars"
            className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-zinc-900 font-semibold mb-3"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Back to My Fleet</span>
          </Link>
          <h1 className="font-display text-3xl font-bold text-zinc-900">
            Bookings for {car.make} {car.model}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Review incoming rental requests and confirmed trips for this specific vehicle.
          </p>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          {bookings.length === 0 ? (
            <div className="text-center py-16 text-slate-500 text-xs">
              <Calendar className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              No bookings recorded yet for this vehicle.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-zinc-700">
                <thead className="bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-4">Booking Ref</th>
                    <th className="px-6 py-4">Renter</th>
                    <th className="px-6 py-4">Dates</th>
                    <th className="px-6 py-4">Payout</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Host Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {bookings.map((b) => (
                    <tr key={b.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-6 py-4 font-mono font-bold text-zinc-900">
                        {b.id}
                      </td>
                      <td className="px-6 py-4 font-semibold text-zinc-900">
                        {b.renterName || "Verified Renter"}
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        {formatDate(b.startDate)} ➔ {formatDate(b.endDate)}
                      </td>
                      <td className="px-6 py-4 font-bold text-emerald-700">
                        {formatETB(b.subtotal)}
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-slate-100 text-slate-800">
                          {b.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        {b.status === "requested" ? (
                          <>
                            <button
                              onClick={() => handleAction(b.id, "confirmed")}
                              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] cursor-pointer"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleAction(b.id, "declined")}
                              className="px-3 py-1.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 font-bold text-[11px] cursor-pointer"
                            >
                              Decline
                            </button>
                          </>
                        ) : (
                          <Link
                            href={`/bookings/${b.id}`}
                            className="font-bold text-sky-600 hover:underline inline-flex items-center gap-1"
                          >
                            <span>Details</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Link>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </main>
  );
}

export default function CarSpecificBookingsPage(props) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center text-xs text-slate-500">Loading car reservations...</div>}>
      <CarSpecificBookingsContent {...props} />
    </Suspense>
  );
}
