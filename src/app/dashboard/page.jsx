"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { getBookings, getCarById } from "@/lib/storage";
import { getCurrentUser } from "@/lib/auth";
import { formatETB, formatDate } from "@/lib/format";
import {
  Car,
  Calendar,
  Clock,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ArrowRight,
  TrendingUp,
  MapPin,
  Compass,
  FileSpreadsheet,
  ShieldAlert,
} from "lucide-react";

export default function RenterDashboardPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState(null);
  const [userBookings, setUserBookings] = useState([]);

  useEffect(() => {
    const user = getCurrentUser();
    if (!user) {
      router.push("/signin?next=/dashboard");
      return;
    }
    setCurrentUser(user);

    const loadBookings = () => {
      const all = getBookings();
      // Filter only bookings for this renter (Negative Test #2 ownership isolation)
      const filtered = all.filter((b) => b.renterId === user.id);
      setUserBookings(filtered);
    };

    loadBookings();

    window.addEventListener("sw_storage_update", loadBookings);
    window.addEventListener("storage", loadBookings);
    return () => {
      window.removeEventListener("sw_storage_update", loadBookings);
      window.removeEventListener("storage", loadBookings);
    };
  }, [router]);

  if (!currentUser) return null;

  // Calculate Renter Metrics per Section 11 of brief
  const upcomingTrips = userBookings.filter(
    (b) => b.status === "confirmed" || b.status === "requested"
  );
  const inProgressTrips = userBookings.filter((b) => b.status === "in_progress");
  const completedTrips = userBookings.filter(
    (b) => b.status === "completed" || b.status === "reviewed"
  );
  const cancelledTrips = userBookings.filter(
    (b) => b.status === "cancelled" || b.status === "declined"
  );
  const totalSpend = userBookings
    .filter((b) => b.status !== "cancelled" && b.status !== "declined")
    .reduce((acc, curr) => acc + (curr.total || 0), 0);

  // Next booking
  const nextBooking = upcomingTrips[0] || inProgressTrips[0] || null;

  const getStatusBadge = (status) => {
    switch (status) {
      case "confirmed":
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800 border border-emerald-200">Confirmed</span>;
      case "requested":
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-amber-100 text-amber-800 border border-amber-200">Pending Host</span>;
      case "in_progress":
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-sky-100 text-sky-800 border border-sky-200 animate-pulse">In Progress</span>;
      case "completed":
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-slate-100 text-slate-800 border border-slate-200">Completed</span>;
      case "reviewed":
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-purple-100 text-purple-800 border border-purple-200">Reviewed</span>;
      case "disputed":
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-rose-100 text-rose-800 border border-rose-200">Disputed</span>;
      case "resolved":
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-teal-100 text-teal-800 border border-teal-200">Resolved</span>;
      case "cancelled":
      case "declined":
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-zinc-100 text-zinc-600 border border-zinc-200">Cancelled</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-slate-100 text-slate-600">{status}</span>;
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 text-zinc-900 flex flex-col">
      <Navbar />

      <div className="pt-24 pb-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex-1 w-full">
        {/* Welcome Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-sky-50 text-sky-700 border border-sky-100 mb-2">
              <Compass className="w-3.5 h-3.5" />
              Renter Command Center
            </div>
            <h1 className="font-display text-3xl sm:text-4xl font-bold text-zinc-900">
              Welcome back, {currentUser.name.split(" ")[0]}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Track your reservations, view receipts, and monitor active road trips across Addis Ababa.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/bookings"
              className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-zinc-800 shadow-sm flex items-center gap-2"
            >
              <FileSpreadsheet className="w-4 h-4 text-sky-600" />
              <span>All Bookings & CSV</span>
            </Link>

            <Link
              href="/cars"
              className="px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-sky-600 text-white text-xs font-bold shadow-md flex items-center gap-2 transition-all active:scale-95"
            >
              <Car className="w-4 h-4 text-amber-400" />
              <span>Book Another Car</span>
            </Link>
          </div>
        </div>

        {/* 4 Metric Cards per Section 11 */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">
                Upcoming Trips
              </span>
              <Calendar className="w-4 h-4 text-sky-600" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-zinc-900">
              {upcomingTrips.length}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              Confirmed & requested rentals
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">
                Completed Trips
              </span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-zinc-900">
              {completedTrips.length}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              Safely returned vehicles
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">
                Cancelled / Declined
              </span>
              <XCircle className="w-4 h-4 text-zinc-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-zinc-900">
              {cancelledTrips.length}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              Past cancelled reservations
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">
                Total Demo Spend
              </span>
              <TrendingUp className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-zinc-900">
              {formatETB(totalSpend)}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              Across all booked trips
            </div>
          </div>
        </div>

        {/* Active / Next Booking Spotlight Banner */}
        {nextBooking && (
          <div className="bg-gradient-to-r from-zinc-900 via-slate-900 to-zinc-950 text-white rounded-3xl p-6 sm:p-8 mb-8 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider bg-amber-400 text-zinc-950 px-2.5 py-0.5 rounded-full">
                  Next Scheduled Trip
                </span>
                {getStatusBadge(nextBooking.status)}
              </div>
              <h2 className="text-xl sm:text-2xl font-bold">
                {nextBooking.carName || "Toyota Land Cruiser Prado"}
              </h2>
              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-amber-400" />
                  {formatDate(nextBooking.startDate)} ➔ {formatDate(nextBooking.endDate)}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-sky-400" />
                  {nextBooking.pickupLocation}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {nextBooking.status === "in_progress" && (
                <Link
                  href={`/bookings/${nextBooking.id}/track`}
                  className="px-4 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-bold text-xs flex items-center gap-2 shadow-glow"
                >
                  <Compass className="w-4 h-4" />
                  <span>Live Trip Tracker</span>
                </Link>
              )}

              <Link
                href={`/bookings/${nextBooking.id}`}
                className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-zinc-900 font-bold text-xs flex items-center gap-1.5 shadow-md"
              >
                <span>View Details</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}

        {/* Recent Bookings Table */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base text-zinc-900">
                Recent Bookings History
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Showing all bookings associated with your demo renter profile.
              </p>
            </div>
            <Link
              href="/bookings"
              className="text-xs font-bold text-sky-600 hover:text-sky-700 hover:underline"
            >
              View Full History ➔
            </Link>
          </div>

          {userBookings.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-xs">
              <Car className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              You have no bookings yet. Explore our fleet to reserve your first ride.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-zinc-700">
                <thead className="bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-3.5">Booking ID</th>
                    <th className="px-6 py-3.5">Vehicle</th>
                    <th className="px-6 py-3.5">Dates</th>
                    <th className="px-6 py-3.5">Total (ETB)</th>
                    <th className="px-6 py-3.5">Status</th>
                    <th className="px-6 py-3.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {userBookings.slice(0, 5).map((b) => (
                    <tr key={b.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-6 py-4 font-mono font-bold text-zinc-900">
                        {b.id}
                      </td>
                      <td className="px-6 py-4 font-semibold text-zinc-900">
                        {b.carName || "Reserved Car"}
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        {formatDate(b.startDate)}
                      </td>
                      <td className="px-6 py-4 font-bold text-zinc-900">
                        {formatETB(b.total)}
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(b.status)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link
                          href={`/bookings/${b.id}`}
                          className="font-bold text-sky-600 hover:text-sky-700 hover:underline"
                        >
                          Manage
                        </Link>
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
