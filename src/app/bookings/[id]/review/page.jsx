"use client";

import { useState, useEffect, use, Suspense } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { getBookingById, addReview } from "@/lib/storage";
import { getCurrentUser, assertBookingOwnership } from "@/lib/auth";
import { Star, ChevronLeft, CheckCircle2, ShieldAlert, ArrowRight } from "lucide-react";

function BookingReviewContent({ params }) {
  const unwrappedParams = use(params);
  const bookingId = unwrappedParams.id;
  const router = useRouter();

  const [currentUser, setCurrentUser] = useState(null);
  const [booking, setBooking] = useState(null);
  const [accessDenied, setAccessDenied] = useState("");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const user = getCurrentUser();
    if (!user) {
      router.push(`/signin?next=/bookings/${bookingId}/review`);
      return;
    }
    setCurrentUser(user);

    const b = getBookingById(bookingId);
    if (!b) {
      setAccessDenied("Booking record not found.");
      return;
    }

    // Ownership check: must be renter
    const ownership = assertBookingOwnership(b, "review");
    if (!ownership.allowed) {
      setAccessDenied(ownership.error);
      return;
    }

    // Must be completed
    if (b.status !== "completed") {
      setAccessDenied(`Only completed trips can be reviewed. Current status is ${b.status}.`);
      return;
    }

    setBooking(b);
  }, [bookingId, router]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!comment.trim()) return;

    setIsSubmitting(true);
    addReview({
      bookingId: booking.id,
      carId: booking.carId,
      renterId: currentUser.id,
      ownerId: booking.ownerId,
      rating: Number(rating),
      comment: comment.trim(),
    });

    setSuccess(true);
    setTimeout(() => {
      router.push(`/bookings/${booking.id}`);
    }, 800);
  };

  if (accessDenied) {
    return (
      <main className="min-h-screen bg-slate-50 flex flex-col justify-between">
        <Navbar />
        <div className="max-w-md mx-auto text-center py-32 px-4">
          <ShieldAlert className="w-12 h-12 text-rose-500 mx-auto mb-3" />
          <h2 className="text-xl font-bold text-zinc-900">Review Ineligible</h2>
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

      <div className="pt-24 pb-16 max-w-xl mx-auto px-4 sm:px-6 flex-1 w-full">
        <div className="mb-6">
          <Link
            href={`/bookings/${booking.id}`}
            className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-zinc-900 font-semibold mb-3"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Back to Booking</span>
          </Link>
          <h1 className="font-display text-3xl font-bold text-zinc-900">
            Leave Renter Review
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Share your experience driving the {booking.carName} in Addis Ababa.
          </p>
        </div>

        {success ? (
          <div className="bg-white rounded-3xl p-8 border border-slate-200 text-center shadow-lg animate-in zoom-in-95">
            <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto mb-3" />
            <h2 className="font-bold text-lg text-zinc-900">
              Review Submitted!
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Your feedback is now visible on the vehicle listing. Redirecting...
            </p>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xl space-y-6"
          >
            {/* Star Rating Selector */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                Overall Rating
              </label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="p-1 rounded-lg hover:scale-110 transition-transform cursor-pointer"
                  >
                    <Star
                      className={`w-7 h-7 ${
                        star <= rating
                          ? "fill-amber-400 text-amber-400"
                          : "text-slate-200 fill-slate-100"
                      }`}
                    />
                  </button>
                ))}
                <span className="text-sm font-bold text-zinc-900 ml-2">
                  {rating} of 5 Stars
                </span>
              </div>
            </div>

            {/* Comment Textarea */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                Your Feedback
              </label>
              <textarea
                rows={5}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                required
                placeholder="How was the vehicle condition, cleanliness, fuel efficiency, and pickup coordination?"
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs sm:text-sm text-zinc-800 focus:outline-none focus:ring-2 focus:ring-sky-500 leading-relaxed"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 rounded-xl bg-zinc-900 hover:bg-sky-600 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-all active:scale-95 cursor-pointer"
            >
              <span>{isSubmitting ? "Publishing Review..." : "Publish Review"}</span>
              <ArrowRight className="w-4 h-4 text-amber-400" />
            </button>
          </form>
        )}
      </div>

      <Footer />
    </main>
  );
}

export default function BookingReviewPage(props) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center text-xs text-slate-500">Loading review form...</div>}>
      <BookingReviewContent {...props} />
    </Suspense>
  );
}
