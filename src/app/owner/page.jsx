"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import {
  getCars,
  getBookings,
  updateBookingStatus,
  saveCar,
} from "@/lib/storage";
import { getCurrentUser, signInAsDemo } from "@/lib/auth";
import { formatETB, formatDate } from "@/lib/format";
import {
  Car,
  Key,
  PlusCircle,
  Calendar,
  CheckCircle2,
  XCircle,
  DollarSign,
  TrendingUp,
  FileSpreadsheet,
  Star,
  ShieldAlert,
  ArrowRight,
  MessageSquare,
  AlertTriangle,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

const MONTHLY_REVENUE_DATA = [
  { month: "Jan", earnings: 18500 },
  { month: "Feb", earnings: 24000 },
  { month: "Mar", earnings: 32500 },
  { month: "Apr", earnings: 28000 },
  { month: "May", earnings: 45000 },
  { month: "Jun", earnings: 38000 },
  { month: "Jul", earnings: 52000 },
  { month: "Aug", earnings: 61000 },
  { month: "Sep", earnings: 74500 },
  { month: "Oct", earnings: 82000 },
];

export default function OwnerDashboardPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState(null);
  const [ownerCars, setOwnerCars] = useState([]);
  const [ownerBookings, setOwnerBookings] = useState([]);

  const refreshData = () => {
    const user = getCurrentUser();
    if (!user) {
      router.push("/signin?next=/owner");
      return;
    }
    setCurrentUser(user);

    const allCars = getCars();
    const cars = allCars.filter((c) => c.ownerId === user.id);
    setOwnerCars(cars);

    const allBookings = getBookings();
    const bookings = allBookings.filter((b) => b.ownerId === user.id);
    setOwnerBookings(bookings);
  };

  useEffect(() => {
    refreshData();
    window.addEventListener("sw_storage_update", refreshData);
    window.addEventListener("storage", refreshData);
    return () => {
      window.removeEventListener("sw_storage_update", refreshData);
      window.removeEventListener("storage", refreshData);
    };
  }, [router]);

  if (!currentUser) return null;

  // Verify Owner Role
  const hasOwnerRole = currentUser.roles?.includes("owner");
  if (!hasOwnerRole) {
    return (
      <main className="min-h-screen bg-slate-50 flex flex-col justify-between">
        <Navbar />
        <div className="max-w-md mx-auto text-center py-32 px-4">
          <Key className="w-12 h-12 text-amber-500 mx-auto mb-3" />
          <h2 className="text-xl font-bold text-zinc-900">Owner Access Required</h2>
          <p className="text-xs text-slate-500 mt-1 mb-6 leading-relaxed">
            Your current demo persona ({currentUser.name}) is in Renter mode. Switch to Dr. Henok Kebede (Owner) to manage listings and bookings.
          </p>
          <button
            onClick={() => {
              signInAsDemo("user-owner-1", "owner");
              refreshData();
            }}
            className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs shadow-md cursor-pointer"
          >
            Switch to Dr. Henok (Host)
          </button>
        </div>
        <Footer />
      </main>
    );
  }

  // Calculate Metrics per Section 11 of PDF
  const approvedCars = ownerCars.filter((c) => c.status === "approved").length;
  const pendingRequests = ownerBookings.filter((b) => b.status === "requested");
  const confirmedRentals = ownerBookings.filter((b) => b.status === "confirmed" || b.status === "in_progress").length;
  const totalEarnings = ownerBookings
    .filter((b) => b.status !== "cancelled" && b.status !== "declined")
    .reduce((acc, curr) => acc + (curr.subtotal || 0), 0);

  // Quick Action: Approve / Decline
  const handleQuickAction = (bookingId, newStatus) => {
    updateBookingStatus(bookingId, newStatus);
    refreshData();
  };

  return (
    <main className="min-h-screen bg-slate-50 text-zinc-900 flex flex-col">
      <Navbar />

      <div className="pt-24 pb-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex-1 w-full">
        {/* Top Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-50 text-amber-800 border border-amber-200 mb-2">
              <Key className="w-3.5 h-3.5 text-amber-600" />
              Owner Fleet Operations
            </div>
            <h1 className="font-display text-3xl sm:text-4xl font-bold text-zinc-900">
              Host Dashboard: {currentUser.name}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Manage your fleet listings, review customer requests, and track monthly earnings in Addis Ababa.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/owner/cars/new"
              className="px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-sky-600 text-white text-xs font-bold shadow-md flex items-center gap-2 transition-all cursor-pointer"
            >
              <PlusCircle className="w-4 h-4 text-amber-400" />
              <span>List New Vehicle</span>
            </Link>

            <Link
              href="/owner/earnings"
              className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-zinc-800 text-xs font-bold shadow-sm flex items-center gap-1.5"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>Earnings CSV</span>
            </Link>
          </div>
        </div>

        {/* 4 Metric Cards per Section 11 of brief */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">
                Approved Cars
              </span>
              <Car className="w-4 h-4 text-sky-600" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-zinc-900">
              {approvedCars} <span className="text-xs text-slate-400 font-normal">/ {ownerCars.length} total</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              Active in public catalogue
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">
                Pending Requests
              </span>
              <Calendar className="w-4 h-4 text-amber-600" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-amber-600">
              {pendingRequests.length}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              Require host confirmation
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">
                Active & Confirmed
              </span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-zinc-900">
              {confirmedRentals}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              Confirmed rentals in progress
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">
                Total Revenue
              </span>
              <DollarSign className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-zinc-900">
              {formatETB(totalEarnings)}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              Net earnings (before platform fee)
            </div>
          </div>
        </div>

        {/* Pending Requests Alert Banner */}
        {pendingRequests.length > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-3xl p-6 mb-8 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping" />
              <h2 className="font-bold text-sm text-amber-950 uppercase tracking-wider">
                Action Required: {pendingRequests.length} Pending Booking Requests
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pendingRequests.map((req) => (
                <div
                  key={req.id}
                  className="bg-white p-4 rounded-2xl border border-amber-200 shadow-sm flex flex-col justify-between"
                >
                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between font-bold text-zinc-900">
                      <span>{req.carName}</span>
                      <span className="text-amber-700 font-mono">{req.id}</span>
                    </div>
                    <div className="text-slate-600">
                      Dates: <strong>{formatDate(req.startDate)} ➔ {formatDate(req.endDate)}</strong> ({req.days} days)
                    </div>
                    <div className="text-slate-500">
                      Pickup Hub: {req.pickupLocation}
                    </div>
                    <div className="text-emerald-700 font-bold">
                      Payout: {formatETB(req.subtotal)}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-3 mt-3 border-t border-slate-100">
                    <button
                      onClick={() => handleQuickAction(req.id, "confirmed")}
                      className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-sm transition-all cursor-pointer"
                    >
                      Approve Request
                    </button>
                    <button
                      onClick={() => handleQuickAction(req.id, "declined")}
                      className="px-4 py-2 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 font-bold text-xs cursor-pointer"
                    >
                      Decline
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recharts Monthly Earnings Visual per Section 11 & Concept #26 */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
            <div>
              <h3 className="font-bold text-base text-zinc-900">
                Monthly Earnings Overview (2026)
              </h3>
              <p className="text-xs text-slate-500">
                Revenue generated from vehicle bookings across Addis Ababa (ETB)
              </p>
            </div>
            <Link
              href="/owner/earnings"
              className="text-xs font-bold text-sky-600 hover:underline"
            >
              Detailed Breakdown ➔
            </Link>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={MONTHLY_REVENUE_DATA} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} tickFormatter={(val) => `${val / 1000}k`} />
                <Tooltip
                  formatter={(value) => [`${formatETB(value)}`, "Earnings"]}
                  contentStyle={{ backgroundColor: "#09090b", color: "#fff", borderRadius: "12px", border: "none", fontSize: "12px" }}
                />
                <Bar dataKey="earnings" fill="#0284c7" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Owner's Vehicle Fleet Table */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base text-zinc-900">
                My Listed Vehicles
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Manage status, edit pricing, or configure calendar blocked dates.
              </p>
            </div>
            <Link
              href="/owner/cars"
              className="text-xs font-bold text-sky-600 hover:underline"
            >
              Manage Fleet ➔
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-zinc-700">
              <thead className="bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4">Vehicle</th>
                  <th className="px-6 py-4">Neighbourhood</th>
                  <th className="px-6 py-4">Daily Rate</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Quick Links</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {ownerCars.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4 font-bold text-zinc-900 flex items-center gap-3">
                      <img
                        src={c.photos?.[0] || c.image}
                        alt={c.model}
                        className="w-12 h-9 rounded-lg object-cover border"
                      />
                      <div>
                        <div>{c.make} {c.model}</div>
                        <div className="text-[10px] text-slate-400 font-normal">{c.category} • {c.year}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {c.neighbourhood}
                    </td>
                    <td className="px-6 py-4 font-bold text-zinc-900">
                      {formatETB(c.pricePerDay)}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          c.status === "approved"
                            ? "bg-emerald-100 text-emerald-800"
                            : c.status === "pending"
                            ? "bg-amber-100 text-amber-800"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {c.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <Link
                        href={`/owner/cars/${c.id}/edit`}
                        className="font-bold text-sky-600 hover:underline"
                      >
                        Edit
                      </Link>
                      <span className="text-slate-300">|</span>
                      <Link
                        href={`/owner/cars/${c.id}/availability`}
                        className="font-bold text-zinc-700 hover:underline"
                      >
                        Calendar
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
