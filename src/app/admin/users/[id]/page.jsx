"use client";

import { useState, useEffect, use, Suspense } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { getUserById, setUserStatus, getCars, getBookings } from "@/lib/storage";
import { getCurrentUser } from "@/lib/auth";
import { formatDate, formatETB } from "@/lib/format";
import {
  User,
  ChevronLeft,
  CheckCircle2,
  Ban,
  ShieldAlert,
  Car,
  Calendar,
} from "lucide-react";

function AdminUserDetailContent({ params }) {
  const unwrappedParams = use(params);
  const userId = unwrappedParams.id;
  const router = useRouter();

  const [targetUser, setTargetUser] = useState(null);
  const [userCars, setUserCars] = useState([]);
  const [userBookings, setUserBookings] = useState([]);
  const [feedback, setFeedback] = useState("");

  const refreshUser = () => {
    const admin = getCurrentUser();
    if (!admin || !admin.roles?.includes("admin")) {
      router.push(`/signin?next=/admin/users/${userId}`);
      return;
    }

    const u = getUserById(userId);
    setTargetUser(u);

    if (u) {
      const allCars = getCars();
      setUserCars(allCars.filter((c) => c.ownerId === u.id));

      const allBookings = getBookings();
      setUserBookings(
        allBookings.filter((b) => b.renterId === u.id || b.ownerId === u.id)
      );
    }
  };

  useEffect(() => {
    refreshUser();
  }, [userId, router]);

  const handleToggleStatus = () => {
    if (targetUser.id === "user-admin-1") {
      setFeedback("Super-admin account cannot be suspended.");
      return;
    }

    const next = targetUser.status === "suspended" ? "active" : "suspended";
    setUserStatus(targetUser.id, next);
    setFeedback(`Account marked as ${next}.`);
    refreshUser();
    setTimeout(() => setFeedback(""), 3000);
  };

  if (!targetUser) {
    return (
      <main className="min-h-screen bg-slate-50 flex flex-col justify-between">
        <Navbar />
        <div className="max-w-md mx-auto text-center py-32 px-4">
          <User className="w-12 h-12 text-slate-400 mx-auto mb-2" />
          <h2 className="text-xl font-bold text-zinc-900">User Not Found</h2>
          <Link
            href="/admin/users"
            className="px-5 py-2.5 rounded-xl bg-zinc-900 text-white font-bold text-xs inline-block mt-4"
          >
            Back to Users
          </Link>
        </div>
        <Footer />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 text-zinc-900 flex flex-col">
      <Navbar />

      <div className="pt-24 pb-16 max-w-4xl mx-auto px-4 sm:px-6 flex-1 w-full">
        <div className="mb-8">
          <Link
            href="/admin/users"
            className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-zinc-900 font-semibold mb-2"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Back to Users List</span>
          </Link>
          <h1 className="font-display text-3xl font-bold text-zinc-900">
            User Account Details
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Audit profile, roles, linked fleet, and booking activity for {targetUser.name}.
          </p>
        </div>

        {feedback && (
          <div className="mb-6 p-4 rounded-2xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{feedback}</span>
          </div>
        )}

        {/* Profile Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 text-zinc-800 flex items-center justify-center font-bold text-2xl border">
                {targetUser.name.charAt(0)}
              </div>
              <div>
                <h2 className="text-xl font-bold text-zinc-900">
                  {targetUser.name}
                </h2>
                <div className="text-xs text-slate-500 font-mono mt-0.5">
                  ID: {targetUser.id}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                  targetUser.status === "active"
                    ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                    : "bg-rose-100 text-rose-800 border border-rose-200"
                }`}
              >
                {targetUser.status}
              </span>

              <button
                onClick={handleToggleStatus}
                disabled={targetUser.id === "user-admin-1"}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer disabled:opacity-30 ${
                  targetUser.status === "suspended"
                    ? "bg-emerald-600 text-white hover:bg-emerald-500"
                    : "border border-rose-200 text-rose-600 hover:bg-rose-50"
                }`}
              >
                {targetUser.status === "suspended" ? "Reinstate User" : "Suspend User"}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <span className="text-slate-400 uppercase font-bold block mb-1">
                Email Address
              </span>
              <span className="font-semibold text-zinc-900">{targetUser.email}</span>
            </div>
            <div>
              <span className="text-slate-400 uppercase font-bold block mb-1">
                Phone Number
              </span>
              <span className="font-semibold text-zinc-900">{targetUser.phone}</span>
            </div>
            <div>
              <span className="text-slate-400 uppercase font-bold block mb-1">
                Member Since
              </span>
              <span className="font-semibold text-zinc-900">
                {formatDate(targetUser.createdAt)}
              </span>
            </div>
          </div>
        </div>

        {/* Owned Vehicles if any */}
        {userCars.length > 0 && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm mb-8 space-y-4">
            <h3 className="font-bold text-sm text-zinc-900">
              Host Fleet ({userCars.length} vehicles)
            </h3>
            <div className="divide-y divide-slate-100">
              {userCars.map((c) => (
                <div key={c.id} className="py-3 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-zinc-900">{c.make} {c.model}</span>
                    <span className="text-slate-400 ml-2">({c.neighbourhood})</span>
                  </div>
                  <span className="font-bold text-emerald-700">{formatETB(c.pricePerDay)}/day</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Bookings Activity */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
          <h3 className="font-bold text-sm text-zinc-900">
            Booking Records ({userBookings.length})
          </h3>
          {userBookings.length === 0 ? (
            <div className="text-xs text-slate-400 py-4">No bookings recorded yet.</div>
          ) : (
            <div className="divide-y divide-slate-100">
              {userBookings.map((b) => (
                <div key={b.id} className="py-3 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-zinc-900">{b.carName}</span>
                    <span className="text-slate-400 ml-2">({formatDate(b.startDate)})</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-zinc-900">{formatETB(b.total)}</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] uppercase font-bold bg-slate-100">
                      {b.status}
                    </span>
                  </div>
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

export default function AdminUserDetailPage(props) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center text-xs text-slate-500">Loading user profile...</div>}>
      <AdminUserDetailContent {...props} />
    </Suspense>
  );
}
