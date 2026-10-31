"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { getBookings } from "@/lib/storage";
import { getCurrentUser } from "@/lib/auth";
import { formatETB, formatDate } from "@/lib/format";
import {
  Calendar,
  ChevronLeft,
  Search,
  Filter,
  ArrowRight,
  Shield,
} from "lucide-react";

export default function AdminBookingsPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [query, setQuery] = useState("");

  useEffect(() => {
    const user = getCurrentUser();
    if (!user || !user.roles?.includes("admin")) {
      router.push("/signin?next=/admin/bookings");
      return;
    }
    setCurrentUser(user);
    setBookings(getBookings());
  }, [router]);

  const filtered = useMemo(() => {
    return bookings.filter((b) => {
      if (statusFilter !== "all" && b.status !== statusFilter) return false;
      if (query.trim()) {
        const q = query.toLowerCase();
        const matchCar = (b.carName || "").toLowerCase().includes(q);
        const matchId = (b.id || "").toLowerCase().includes(q);
        const matchRenter = (b.renterName || "").toLowerCase().includes(q);
        if (!matchCar && !matchId && !matchRenter) return false;
      }
      return true;
    });
  }, [bookings, statusFilter, query]);

  if (!currentUser) return null;

  return (
    <main className="min-h-screen bg-slate-50 text-zinc-900 flex flex-col">
      <Navbar />

      <div className="pt-24 pb-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex-1 w-full">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <Link
              href="/admin"
              className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-zinc-900 font-semibold mb-2"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back to Admin Center</span>
            </Link>
            <h1 className="font-display text-3xl font-bold text-zinc-900">
              Master Platform Bookings ({bookings.length})
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Global booking register across all renters and vehicle hosts in Addis Ababa.
            </p>
          </div>

          {/* Search */}
          <div className="w-full sm:w-72">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search car, booking ref, or renter..."
              className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs font-semibold text-zinc-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-sm"
            />
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap gap-1.5 mb-6">
          {["all", "requested", "confirmed", "in_progress", "completed", "disputed", "resolved", "cancelled"].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all cursor-pointer ${
                statusFilter === st
                  ? "bg-purple-600 text-white shadow-sm"
                  : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        {/* Bookings Table */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-zinc-700">
              <thead className="bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4">Booking Ref</th>
                  <th className="px-6 py-4">Vehicle</th>
                  <th className="px-6 py-4">Rental Duration</th>
                  <th className="px-6 py-4">Total Amount</th>
                  <th className="px-6 py-4">Platform Fee (5%)</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4 font-mono font-bold text-zinc-900">
                      {b.id}
                    </td>
                    <td className="px-6 py-4 font-semibold text-zinc-900">
                      {b.carName}
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {formatDate(b.startDate)} ➔ {formatDate(b.endDate)} ({b.days}d)
                    </td>
                    <td className="px-6 py-4 font-bold text-zinc-900">
                      {formatETB(b.total)}
                    </td>
                    <td className="px-6 py-4 font-semibold text-purple-700">
                      {formatETB(b.fee)}
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-slate-100 text-slate-800">
                        {b.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/bookings/${b.id}`}
                        className="inline-flex items-center gap-1 font-bold text-purple-600 hover:underline"
                      >
                        <span>Inspect</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
