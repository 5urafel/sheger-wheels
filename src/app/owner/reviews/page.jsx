"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { getCars, getReviews, replyToReview } from "@/lib/storage";
import { getCurrentUser } from "@/lib/auth";
import { formatDate } from "@/lib/format";
import {
  Star,
  MessageSquare,
  ChevronLeft,
  CheckCircle2,
  Send,
  Car,
} from "lucide-react";

export default function OwnerReviewsPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [replyInputs, setReplyInputs] = useState({});
  const [feedback, setFeedback] = useState("");

  const refreshReviews = () => {
    const user = getCurrentUser();
    if (!user) {
      router.push("/signin?next=/owner/reviews");
      return;
    }
    setCurrentUser(user);

    const ownerCars = getCars().filter((c) => c.ownerId === user.id);
    const ownerCarIds = ownerCars.map((c) => c.id);

    const allReviews = getReviews();
    const relevant = allReviews.filter((r) => ownerCarIds.includes(r.carId));
    setReviews(relevant);
  };

  useEffect(() => {
    refreshReviews();
    window.addEventListener("sw_storage_update", refreshReviews);
    return () => {
      window.removeEventListener("sw_storage_update", refreshReviews);
    };
  }, [router]);

  const handleReplySubmit = (reviewId) => {
    const text = replyInputs[reviewId];
    if (!text || !text.trim()) return;

    replyToReview(reviewId, text.trim());
    setFeedback("Host response published.");
    setReplyInputs((prev) => ({ ...prev, [reviewId]: "" }));
    refreshReviews();
    setTimeout(() => setFeedback(""), 3000);
  };

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
            Reviews & Customer Feedback
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Read renter impressions and publish official host replies to maintain Superhost status.
          </p>
        </div>

        {feedback && (
          <div className="mb-6 p-4 rounded-2xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{feedback}</span>
          </div>
        )}

        {/* Reviews List */}
        <div className="space-y-6">
          {reviews.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 text-xs text-slate-500">
              <Star className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              No reviews recorded for your vehicles yet.
            </div>
          ) : (
            reviews.map((rev) => (
              <div
                key={rev.id}
                className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-amber-400">
                    {Array.from({ length: rev.rating || 5 }).map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-current" />
                    ))}
                    <span className="text-xs font-bold text-zinc-900 ml-1.5">
                      {rev.rating}.0
                    </span>
                  </div>
                  <span className="text-xs text-slate-400">
                    {formatDate(rev.createdAt)}
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
                  &quot;{rev.comment}&quot;
                </p>

                {/* Published Host Reply */}
                {rev.ownerReply ? (
                  <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200 text-xs text-amber-950 space-y-1">
                    <div className="font-bold text-amber-900">
                      Your Host Reply:
                    </div>
                    <p className="leading-relaxed">{rev.ownerReply}</p>
                  </div>
                ) : (
                  /* Reply Form */
                  <div className="pt-3 border-t border-slate-100">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                      Write a Public Host Reply
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={replyInputs[rev.id] || ""}
                        onChange={(e) =>
                          setReplyInputs({ ...replyInputs, [rev.id]: e.target.value })
                        }
                        placeholder="Thank the renter or provide context..."
                        className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs text-zinc-800 focus:outline-none focus:ring-2 focus:ring-sky-500 font-medium"
                      />
                      <button
                        onClick={() => handleReplySubmit(rev.id)}
                        className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-sky-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Reply</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      <Footer />
    </main>
  );
}
