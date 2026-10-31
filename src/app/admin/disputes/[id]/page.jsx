"use client";

import { useState, useEffect, use, Suspense } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { getDisputes, resolveDispute, getBookingById, getCarById, getUserById } from "@/lib/storage";
import { getCurrentUser } from "@/lib/auth";
import { formatDate, formatETB } from "@/lib/format";
import {
  AlertTriangle,
  ChevronLeft,
  CheckCircle2,
  Shield,
  Save,
  Receipt,
  Car,
} from "lucide-react";

function AdminResolveDisputeContent({ params }) {
  const unwrappedParams = use(params);
  const disputeId = unwrappedParams.id;
  const router = useRouter();

  const [currentUser, setCurrentUser] = useState(null);
  const [dispute, setDispute] = useState(null);
  const [booking, setBooking] = useState(null);
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const refresh = () => {
    const admin = getCurrentUser();
    if (!admin || !admin.roles?.includes("admin")) {
      router.push(`/signin?next=/admin/disputes/${disputeId}`);
      return;
    }
    setCurrentUser(admin);

    const all = getDisputes();
    const d = all.find((item) => item.id === disputeId);
    setDispute(d || null);

    if (d) {
      setNotes(d.resolutionNotes || "");
      if (d.bookingId) {
        setBooking(getBookingById(d.bookingId));
      }
    }
  };

  useEffect(() => {
    refresh();
  }, [disputeId, router]);

  const handleResolve = (e) => {
    e.preventDefault();
    if (!notes.trim()) return;

    setIsSubmitting(true);
    resolveDispute(dispute.id, notes.trim(), currentUser.id);
    setSuccess(true);
    setTimeout(() => {
      router.push("/admin/disputes");
    }, 800);
  };

  if (!dispute) {
    return (
      <main className="min-h-screen bg-slate-50 flex flex-col justify-between">
        <Navbar />
        <div className="max-w-md mx-auto text-center py-32 px-4">
          <AlertTriangle className="w-12 h-12 text-slate-400 mx-auto mb-2" />
          <h2 className="text-xl font-bold text-zinc-900">Dispute Not Found</h2>
          <Link
            href="/admin/disputes"
            className="px-5 py-2.5 rounded-xl bg-zinc-900 text-white font-bold text-xs inline-block mt-4"
          >
            Back to Disputes
          </Link>
        </div>
        <Footer />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 text-zinc-900 flex flex-col">
      <Navbar />

      <div className="pt-24 pb-16 max-w-3xl mx-auto px-4 sm:px-6 flex-1 w-full">
        <div className="mb-8">
          <Link
            href="/admin/disputes"
            className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-zinc-900 font-semibold mb-2"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Back to Disputes Center</span>
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="font-display text-3xl font-bold text-zinc-900">
              Dispute Resolution Workbench
            </h1>
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                dispute.status === "resolved"
                  ? "bg-emerald-100 text-emerald-800"
                  : "bg-rose-100 text-rose-800"
              }`}
            >
              {dispute.status}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Case Ref #{dispute.id} • Opened {formatDate(dispute.createdAt)}
          </p>
        </div>

        {success ? (
          <div className="bg-white rounded-3xl p-8 border border-slate-200 text-center shadow-lg">
            <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto mb-3" />
            <h2 className="font-bold text-lg text-zinc-900">
              Dispute Marked as Resolved!
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Official admin resolution notes have been recorded. Redirecting...
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Case Details Card */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4 text-xs">
              <div>
                <span className="text-slate-400 uppercase font-bold text-[10px] block mb-1">
                  Issue Summary
                </span>
                <h3 className="font-bold text-base text-zinc-900">
                  {dispute.reason}
                </h3>
              </div>

              <div>
                <span className="text-slate-400 uppercase font-bold text-[10px] block mb-1">
                  Renter / Host Statement
                </span>
                <p className="text-slate-700 bg-slate-50 p-4 rounded-2xl border border-slate-200 leading-relaxed font-medium">
                  {dispute.description}
                </p>
              </div>

              {booking && (
                <div className="p-4 rounded-2xl bg-slate-100 border border-slate-200 flex justify-between items-center">
                  <div>
                    <span className="font-bold text-zinc-900 block">
                      Linked Booking: {booking.id}
                    </span>
                    <span className="text-slate-500">
                      Vehicle: {booking.carName} • Total: {formatETB(booking.total)}
                    </span>
                  </div>
                  <Link
                    href={`/bookings/${booking.id}`}
                    target="_blank"
                    className="text-purple-700 font-bold hover:underline"
                  >
                    View Receipt ➔
                  </Link>
                </div>
              )}
            </div>

            {/* Resolution Notes Form */}
            <form
              onSubmit={handleResolve}
              className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4"
            >
              <h3 className="font-bold text-sm text-zinc-900">
                Official Resolution Notes & Mediation Decision
              </h3>
              <p className="text-xs text-slate-500">
                Record the outcome (e.g. partial refund approved via TeleBirr reference, vehicle inspection cleared).
              </p>

              <textarea
                rows={5}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                required
                placeholder="Detail the mediation findings and resolution instructions..."
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs sm:text-sm text-zinc-800 focus:outline-none focus:ring-2 focus:ring-purple-500 leading-relaxed font-medium"
              />

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>
                  {dispute.status === "resolved"
                    ? "Update Resolution Notes"
                    : "Confirm & Resolve Dispute"}
                </span>
              </button>
            </form>
          </div>
        )}
      </div>

      <Footer />
    </main>
  );
}

export default function AdminResolveDisputePage(props) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center text-xs text-slate-500">Loading dispute workbench...</div>}>
      <AdminResolveDisputeContent {...props} />
    </Suspense>
  );
}
