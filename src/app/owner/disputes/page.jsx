"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { getCars, getDisputes, getBookings } from "@/lib/storage";
import { getCurrentUser } from "@/lib/auth";
import { formatDate } from "@/lib/format";
import {
  AlertTriangle,
  ChevronLeft,
  CheckCircle2,
  Clock,
  Car,
} from "lucide-react";

export default function OwnerDisputesPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState(null);
  const [disputes, setDisputes] = useState([]);

  useEffect(() => {
    const user = getCurrentUser();
    if (!user) {
      router.push("/signin?next=/owner/disputes");
      return;
    }
    setCurrentUser(user);

    const ownerCars = getCars().filter((c) => c.ownerId === user.id);
    const ownerCarIds = ownerCars.map((c) => c.id);

    const allDisputes = getDisputes();
    const relevant = allDisputes.filter((d) => ownerCarIds.includes(d.carId));
    setDisputes(relevant);
  }, [router]);

  if (!currentUser) return null;

  return (
    <main className="min-h-screen bg-slate-50 text-zinc-900 flex flex-col">
      <Navbar />

      <div className="pt-24 pb-16 max-w-4xl mx-auto px-4 sm:px-6 flex-1 w-full">
        <div className="mb-8">
          <Link
            href="/owner"
            className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-zinc-900 font-semibold mb-2"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Back to Host Overview</span>
          </Link>
          <h1 className="font-display text-3xl font-bold text-zinc-900">
            Disputes & Resolutions
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Issues filed for your vehicle bookings reviewed by platform administrators.
          </p>
        </div>

        <div className="space-y-4">
          {disputes.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 text-xs text-slate-500">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
              No disputes filed against any of your rentals. Clean operational record!
            </div>
          ) : (
            disputes.map((d) => (
              <div
                key={d.id}
                className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-3 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-zinc-900">
                    Dispute ID: {d.id}
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      d.status === "resolved"
                        ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                        : "bg-rose-100 text-rose-800 border border-rose-200"
                    }`}
                  >
                    {d.status}
                  </span>
                </div>

                <div>
                  <span className="font-bold text-zinc-900 text-sm block">
                    {d.reason}
                  </span>
                  <p className="text-slate-600 mt-1 leading-relaxed">
                    {d.description}
                  </p>
                </div>

                {d.resolutionNotes && (
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-emerald-800">
                    <strong>Admin Resolution:</strong> {d.resolutionNotes}
                  </div>
                )}

                <div className="flex justify-between pt-2 border-t border-slate-100 text-[11px] text-slate-400">
                  <span>Booking Ref: {d.bookingId}</span>
                  <span>Filed: {formatDate(d.createdAt)}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <Footer />
    </main>
  );
}
