"use client";

import { useState, useEffect, use, Suspense } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import {
  getBookingById,
  updateBookingStatus,
  getCarById,
  getUserById,
  openDispute,
  getDisputes,
} from "@/lib/storage";
import { getCurrentUser, assertBookingOwnership } from "@/lib/auth";
import { formatETB, formatDate, formatRelativeTime } from "@/lib/format";
import {
  Car,
  Calendar,
  MapPin,
  Clock,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ArrowRight,
  ShieldAlert,
  ChevronLeft,
  Navigation,
  Star,
  Receipt,
  RotateCcw,
  MessageSquare,
} from "lucide-react";

function BookingDetailContent({ params }) {
  const unwrappedParams = use(params);
  const bookingId = unwrappedParams.id;
  const router = useRouter();

  const [currentUser, setCurrentUser] = useState(null);
  const [booking, setBooking] = useState(null);
  const [car, setCar] = useState(null);
  const [host, setHost] = useState(null);
  const [dispute, setDispute] = useState(null);

  // Guardrail access state
  const [accessDenied, setAccessDenied] = useState("");
  const [actionSuccess, setActionSuccess] = useState("");
  const [actionError, setActionError] = useState("");

  // Dispute Modal
  const [disputeModalOpen, setDisputeModalOpen] = useState(false);
  const [disputeReason, setDisputeReason] = useState("");
  const [disputeDescription, setDisputeDescription] = useState("");

  const refreshBooking = () => {
    const b = getBookingById(bookingId);
    setBooking(b);
    if (b) {
      setCar(getCarById(b.carId));
      setHost(getUserById(b.ownerId));

      const allDisputes = getDisputes();
      const matchDisp = allDisputes.find((d) => d.bookingId === b.id);
      setDispute(matchDisp || null);
    }
  };

  useEffect(() => {
    const user = getCurrentUser();
    if (!user) {
      router.push(`/signin?next=/bookings/${bookingId}`);
      return;
    }
    setCurrentUser(user);

    const b = getBookingById(bookingId);
    if (!b) {
      setAccessDenied("Booking record not found.");
      return;
    }

    // Enforce Negative Test #2 Ownership Check per Section 8.1
    const ownershipCheck = assertBookingOwnership(b, "view");
    if (!ownershipCheck.allowed) {
      setAccessDenied(ownershipCheck.error);
      return;
    }

    refreshBooking();

    window.addEventListener("sw_storage_update", refreshBooking);
    return () => {
      window.removeEventListener("sw_storage_update", refreshBooking);
    };
  }, [bookingId, router]);

  // Handle Lifecycle Action Transitions per Section 7
  const handleTransition = (newStatus, label) => {
    setActionError("");
    setActionSuccess("");

    // Re-verify action permissions before write
    const requiredAction =
      newStatus === "cancelled" ? "cancel" :
      newStatus === "confirmed" || newStatus === "declined" ? "approve" : "view";

    const permCheck = assertBookingOwnership(booking, requiredAction);
    if (!permCheck.allowed) {
      setActionError(permCheck.error);
      return;
    }

    const success = updateBookingStatus(booking.id, newStatus);
    if (!success) {
      setActionError(`Invalid state transition from ${booking.status} to ${newStatus}.`);
      return;
    }

    setActionSuccess(`Booking updated to ${newStatus.replace("_", " ")} successfully.`);
    refreshBooking();
  };

  // Submit Dispute
  const handleCreateDispute = (e) => {
    e.preventDefault();
    if (!disputeReason.trim() || !disputeDescription.trim()) return;

    openDispute({
      bookingId: booking.id,
      carId: booking.carId,
      openedBy: currentUser.id,
      reason: disputeReason.trim(),
      description: disputeDescription.trim(),
    });

    setDisputeModalOpen(false);
    setActionSuccess("Dispute opened. An administrator will review and resolve the case.");
    refreshBooking();
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
            Access Refused: Not Yours
          </h1>
          <p className="text-xs text-slate-600 mt-2 mb-6 leading-relaxed">
            {accessDenied}
          </p>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-zinc-900 text-white text-xs font-bold shadow-md hover:bg-sky-600 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Return to Your Dashboard</span>
          </Link>
        </div>
        <Footer />
      </main>
    );
  }

  if (!booking) return null;

  const isRenter = currentUser?.id === booking.renterId;
  const isOwner = currentUser?.id === booking.ownerId;
  const isAdmin = currentUser?.roles?.includes("admin");

  return (
    <main className="min-h-screen bg-slate-50 text-zinc-900 flex flex-col">
      <Navbar />

      <div className="pt-24 pb-16 max-w-4xl mx-auto px-4 sm:px-6 flex-1 w-full">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between pb-4 mb-4 text-xs">
          <Link
            href="/bookings"
            className="inline-flex items-center gap-1.5 text-slate-500 hover:text-zinc-900 font-semibold"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Back to Bookings</span>
          </Link>

          <span className="text-slate-400 font-mono text-[11px]">
            Ref: {booking.id}
          </span>
        </div>

        {/* Action Banners */}
        {actionSuccess && (
          <div className="mb-6 p-4 rounded-2xl bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-3 text-xs font-semibold">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>{actionSuccess}</span>
          </div>
        )}

        {actionError && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-50 text-rose-800 border border-rose-200 flex items-center gap-3 text-xs font-semibold">
            <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" />
            <span>{actionError}</span>
          </div>
        )}

        {/* Booking Card & State Machine */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xl space-y-8">
          {/* Header Summary */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-sky-50 text-sky-700 border border-sky-200">
                  Status: {booking.status.replace("_", " ")}
                </span>
                <span className="text-[10px] font-bold text-slate-400">
                  Updated {formatRelativeTime(booking.updatedAt)}
                </span>
              </div>
              <h1 className="font-display text-2xl sm:text-3xl font-bold text-zinc-900">
                {booking.carName || "Vehicle Reservation"}
              </h1>
              <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                <span>Pickup: <strong>{booking.pickupLocation}</strong></span>
                <span>•</span>
                <span>Host: <strong>{booking.ownerName || "Dr. Henok Kebede"}</strong></span>
              </div>
            </div>

            <div className="text-right sm:border-l sm:border-slate-100 sm:pl-6">
              <div className="text-[10px] text-slate-400 uppercase font-bold">
                Total Billed
              </div>
              <div className="text-2xl font-black text-sky-700">
                {formatETB(booking.total)}
              </div>
              <div className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1 justify-end mt-0.5">
                <CheckCircle2 className="w-3 h-3" />
                TeleBirr {booking.paymentStatus}
              </div>
            </div>
          </div>

          {/* Lifecycle State Actions Box per Section 7 */}
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Permitted Lifecycle Transitions
              </h3>
              <span className="text-[11px] text-slate-400">
                State: <strong className="text-zinc-900">{booking.status}</strong>
              </span>
            </div>

            <div className="flex flex-wrap gap-2.5">
              {/* If requested: Renter can cancel; Owner can approve or decline */}
              {booking.status === "requested" && (
                <>
                  {isOwner && (
                    <>
                      <button
                        onClick={() => handleTransition("confirmed", "Host Approved")}
                        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-sm cursor-pointer"
                      >
                        Approve Request
                      </button>
                      <button
                        onClick={() => handleTransition("declined", "Host Declined")}
                        className="px-4 py-2 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-bold cursor-pointer"
                      >
                        Decline Request
                      </button>
                    </>
                  )}
                  {isRenter && (
                    <button
                      onClick={() => handleTransition("cancelled", "Renter Cancelled")}
                      className="px-4 py-2 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-bold cursor-pointer"
                    >
                      Cancel Booking
                    </button>
                  )}
                </>
              )}

              {/* If confirmed: Start rental -> in_progress, or cancel */}
              {booking.status === "confirmed" && (
                <>
                  <button
                    onClick={() => handleTransition("in_progress", "Rental Started")}
                    className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold shadow-sm flex items-center gap-1.5 cursor-pointer"
                  >
                    <Navigation className="w-3.5 h-3.5" />
                    <span>Start Rental Simulation (In Progress)</span>
                  </button>

                  <button
                    onClick={() => handleTransition("cancelled", "Booking Cancelled")}
                    className="px-4 py-2 rounded-xl border border-slate-300 text-slate-600 hover:bg-slate-100 text-xs font-bold cursor-pointer"
                  >
                    Cancel Booking
                  </button>
                </>
              )}

              {/* If in_progress: Live tracking, complete trip, or raise dispute */}
              {booking.status === "in_progress" && (
                <>
                  <Link
                    href={`/bookings/${booking.id}/track`}
                    className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-zinc-950 font-black text-xs shadow-md flex items-center gap-1.5 cursor-pointer"
                  >
                    <Navigation className="w-3.5 h-3.5" />
                    <span>Open Live Trip Tracker</span>
                  </Link>

                  <button
                    onClick={() => handleTransition("completed", "Rental Completed")}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-sm cursor-pointer"
                  >
                    Mark Trip Completed & Returned
                  </button>

                  <button
                    onClick={() => setDisputeModalOpen(true)}
                    className="px-4 py-2 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-bold cursor-pointer"
                  >
                    Raise Issue / Dispute
                  </button>
                </>
              )}

              {/* If completed: Eligible renter can add review */}
              {booking.status === "completed" && (
                <>
                  {isRenter && (
                    <Link
                      href={`/bookings/${booking.id}/review`}
                      className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold shadow-sm flex items-center gap-1.5 cursor-pointer"
                    >
                      <Star className="w-3.5 h-3.5 fill-current" />
                      <span>Leave Renter Review</span>
                    </Link>
                  )}

                  <button
                    onClick={() => setDisputeModalOpen(true)}
                    className="px-4 py-2 rounded-xl border border-slate-300 text-slate-600 hover:bg-slate-100 text-xs font-bold cursor-pointer"
                  >
                    Raise Post-Trip Dispute
                  </button>
                </>
              )}

              {/* Terminal states */}
              {(booking.status === "cancelled" || booking.status === "declined") && (
                <div className="text-xs text-slate-500 italic">
                  This booking has concluded and is terminal. No further modifications permitted.
                </div>
              )}

              {booking.status === "reviewed" && (
                <div className="text-xs text-purple-700 font-semibold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-purple-600" />
                  <span>Review has been successfully submitted. Workflow closed.</span>
                </div>
              )}

              {booking.status === "disputed" && (
                <div className="text-xs text-rose-700 font-semibold flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                  <span>Dispute under active review by Platform Administrator.</span>
                </div>
              )}

              {booking.status === "resolved" && (
                <div className="text-xs text-teal-700 font-semibold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-teal-600" />
                  <span>Dispute resolved by administrator. Notes: {booking.resolutionNotes || "Resolution logged."}</span>
                </div>
              )}
            </div>
          </div>

          {/* Dispute Details Card if present */}
          {dispute && (
            <div className="p-5 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-950 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold uppercase tracking-wider text-rose-700">
                  Dispute Case: {dispute.id}
                </span>
                <span className="font-bold text-[10px] uppercase bg-rose-200 px-2 py-0.5 rounded-full">
                  Status: {dispute.status}
                </span>
              </div>
              <div>
                <strong>Reason:</strong> {dispute.reason}
              </div>
              <div className="text-slate-700">
                <strong>Description:</strong> {dispute.description}
              </div>
              {dispute.resolutionNotes && (
                <div className="mt-2 p-3 bg-white rounded-xl border border-rose-200 text-emerald-800">
                  <strong>Admin Resolution Notes:</strong> {dispute.resolutionNotes}
                </div>
              )}
            </div>
          )}

          {/* Receipt Breakdown */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <h3 className="font-bold text-sm text-zinc-900 flex items-center gap-2">
              <Receipt className="w-4 h-4 text-sky-600" />
              <span>Full Receipt & Financial Breakdown</span>
            </h3>

            <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 text-xs space-y-2.5 text-slate-600">
              <div className="flex justify-between">
                <span>Rental Dates:</span>
                <strong className="text-zinc-900 font-mono">
                  {formatDate(booking.startDate)} ➔ {formatDate(booking.endDate)} ({booking.days} days)
                </strong>
              </div>

              <div className="flex justify-between">
                <span>Daily Vehicle Rate:</span>
                <span className="font-semibold text-zinc-900">
                  {formatETB(booking.pricePerDay)} × {booking.days}d
                </span>
              </div>

              {booking.chauffeurIncluded && (
                <div className="flex justify-between">
                  <span>Chauffeur Service:</span>
                  <span className="font-semibold text-zinc-900">Included</span>
                </div>
              )}

              <div className="flex justify-between">
                <span>Mock Platform Commission (5%):</span>
                <span className="font-semibold text-zinc-900">
                  {formatETB(booking.fee)}
                </span>
              </div>

              <div className="flex justify-between">
                <span>TeleBirr Reference:</span>
                <span className="font-mono text-sky-700 font-bold">
                  {booking.paymentReference || "TB-DEMO-SIMULATED"}
                </span>
              </div>

              <div className="flex justify-between pt-3 border-t border-slate-200 text-sm font-bold text-zinc-900">
                <span>Total Amount:</span>
                <span className="text-base text-sky-700">
                  {formatETB(booking.total)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Dispute Modal Dialog */}
      {disputeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200">
            <h2 className="font-bold text-lg text-zinc-900 mb-2">
              Raise a Dispute for Booking {booking.id}
            </h2>
            <p className="text-xs text-slate-500 mb-4">
              Submit an issue regarding vehicle condition, mechanical issues, or billing discrepancy.
            </p>

            <form onSubmit={handleCreateDispute} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Reason for Issue
                </label>
                <input
                  type="text"
                  value={disputeReason}
                  onChange={(e) => setDisputeReason(e.target.value)}
                  placeholder="e.g. Air conditioning failure or delayed pickup"
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-zinc-800 focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Detailed Explanation
                </label>
                <textarea
                  rows={4}
                  value={disputeDescription}
                  onChange={(e) => setDisputeDescription(e.target.value)}
                  placeholder="Provide complete facts so the administrator can resolve fairly..."
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-zinc-800 focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setDisputeModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-md"
                >
                  Submit Dispute
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </main>
  );
}

export default function BookingDetailPage(props) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center text-xs text-slate-500">Loading booking receipt...</div>}>
      <BookingDetailContent {...props} />
    </Suspense>
  );
}
