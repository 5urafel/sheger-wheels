"use client";

import { useState, useEffect, use, Suspense } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { GsapTripTracker } from "@/components/GsapTripTracker";
import { getBookingById } from "@/lib/storage";
import { getCurrentUser, assertBookingOwnership } from "@/lib/auth";
import { ChevronLeft, ShieldAlert, Car, Compass } from "lucide-react";

function BookingTrackContent({ params }) {
  const unwrappedParams = use(params);
  const bookingId = unwrappedParams.id;
  const router = useRouter();

  const [booking, setBooking] = useState(null);
  const [accessDenied, setAccessDenied] = useState("");

  useEffect(() => {
    const user = getCurrentUser();
    if (!user) {
      router.push(`/signin?next=/bookings/${bookingId}/track`);
      return;
    }

    const b = getBookingById(bookingId);
    if (!b) {
      setAccessDenied("Booking record not found.");
      return;
    }

    // Negative Test #2 Ownership check
    const ownership = assertBookingOwnership(b, "view");
    if (!ownership.allowed) {
      setAccessDenied(ownership.error);
      return;
    }

    setBooking(b);
  }, [bookingId, router]);

  if (accessDenied) {
    return (
      <main className="min-h-screen bg-slate-50 flex flex-col justify-between">
        <Navbar />
        <div className="max-w-md mx-auto text-center py-32 px-4">
          <ShieldAlert className="w-12 h-12 text-rose-500 mx-auto mb-3" />
          <h2 className="text-xl font-bold text-zinc-900">Access Refused</h2>
          <p className="text-xs text-slate-500 mt-1 mb-6">{accessDenied}</p>
          <Link
            href="/dashboard"
            className="px-5 py-2.5 rounded-xl bg-zinc-900 text-white font-bold text-xs"
          >
            Go to Dashboard
          </Link>
        </div>
        <Footer />
      </main>
    );
  }

  if (!booking) return null;

  return (
    <main className="min-h-screen bg-slate-50 text-zinc-900 flex flex-col">
      <Navbar />

      <div className="pt-24 pb-16 max-w-4xl mx-auto px-4 sm:px-6 flex-1 w-full">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between pb-4 mb-4 text-xs">
          <Link
            href={`/bookings/${booking.id}`}
            className="inline-flex items-center gap-1.5 text-slate-500 hover:text-zinc-900 font-semibold"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Back to Booking Details</span>
          </Link>

          <span className="text-slate-400 font-mono text-[11px]">
            Vehicle: <strong>{booking.carName}</strong>
          </span>
        </div>

        {/* GSAP Trip Tracker Component */}
        <GsapTripTracker booking={booking} />
      </div>

      <Footer />
    </main>
  );
}

export default function BookingTrackPage(props) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center text-xs text-slate-500">Loading trip tracking telemetry...</div>}>
      <BookingTrackContent {...props} />
    </Suspense>
  );
}
