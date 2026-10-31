"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import {
  getUsers,
  getCars,
  getBookings,
  getDisputes,
  saveCar,
} from "@/lib/storage";
import { getCurrentUser, signInAsDemo } from "@/lib/auth";
import { formatETB, formatDate } from "@/lib/format";
import {
  Shield,
  Users,
  Car,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  TrendingUp,
  FileSpreadsheet,

  ArrowRight,
  DollarSign,
  Activity,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  LineChart,
  Line,
} from "recharts";

const MONTHLY_PLATFORM_STATS = [
  { month: "Jan", bookings: 12, commission: 14500 },
  { month: "Feb", bookings: 18, commission: 19800 },
  { month: "Mar", bookings: 24, commission: 26500 },
  { month: "Apr", bookings: 21, commission: 22400 },
  { month: "May", bookings: 32, commission: 38000 },
  { month: "Jun", bookings: 29, commission: 34200 },
  { month: "Jul", bookings: 38, commission: 44500 },
  { month: "Aug", bookings: 46, commission: 53000 },
  { month: "Sep", bookings: 55, commission: 62500 },
  { month: "Oct", bookings: 68, commission: 78000 },
];

export default function AdminDashboardPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [cars, setCars] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [disputes, setDisputes] = useState([]);

  const refreshData = () => {
    const user = getCurrentUser();
    if (!user) {
      router.push("/signin?next=/admin");
      return;
    }
    setCurrentUser(user);

    setUsers(getUsers());
    setCars(getCars());
    setBookings(getBookings());
    setDisputes(getDisputes());
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

  // Verify Admin Role per Section 4 & 8
  const isAdmin = currentUser.roles?.includes("admin");
  if (!isAdmin) {
    return (
      <main className="min-h-screen bg-slate-50 flex flex-col justify-between">
        <Navbar />
        <div className="max-w-md mx-auto text-center py-32 px-4">
          <Shield className="w-12 h-12 text-purple-600 mx-auto mb-3" />
          <h2 className="text-xl font-bold text-zinc-900">Admin Clearance Required</h2>
          <p className="text-xs text-slate-500 mt-1 mb-6 leading-relaxed">
            The platform admin portal is restricted to seed administrator accounts. Sign in as Selamawit Bekele to proceed.
          </p>
          <button
            onClick={() => {
              signInAsDemo("user-admin-1", "admin");
              refreshData();
            }}
            className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md cursor-pointer"
          >
            Switch to Admin (Selamawit)
          </button>
        </div>
        <Footer />
      </main>
    );
  }

  // Calculate Metrics per Section 11 of PDF
  const totalUsers = users.length;
  const activeUsers = users.filter((u) => u.status === "active").length;
  const approvedCars = cars.filter((c) => c.status === "approved").length;
  const pendingCars = cars.filter((c) => c.status === "pending");
  const openDisputes = disputes.filter((d) => d.status === "opened");
  const platformFeeEarned = bookings
    .filter((b) => b.status !== "cancelled" && b.status !== "declined")
    .reduce((acc, curr) => acc + (curr.fee || 0), 0);

  // Quick Action: Approve Car
  const handleQuickApproveCar = (car) => {
    saveCar({ ...car, status: "approved" });
    refreshData();
  };

  return (
    <main className="min-h-screen bg-slate-50 text-zinc-900 flex flex-col">
      <Navbar />

      <div className="pt-24 pb-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex-1 w-full">
        {/* Admin Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-purple-50 text-purple-800 border border-purple-200 mb-2">
              <Shield className="w-3.5 h-3.5 text-purple-600" />
              Platform Administration
            </div>
            <h1 className="font-display text-3xl sm:text-4xl font-bold text-zinc-900">
              Moderator Command Center
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Addis Ababa marketplace metrics, listing moderations, user accounts, and dispute resolutions.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/admin/listings"
              className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-zinc-800 text-xs font-bold shadow-sm"
            >
              Listings ({pendingCars.length} pending)
            </Link>
            <Link
              href="/admin/users"
              className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-zinc-800 text-xs font-bold shadow-sm"
            >
              Users ({totalUsers})
            </Link>
            <Link
              href="/admin/disputes"
              className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-zinc-800 text-xs font-bold shadow-sm"
            >
              Disputes ({openDisputes.length})
            </Link>
            <Link
              href="/admin/reports"
              className="px-3.5 py-2 rounded-xl bg-zinc-900 hover:bg-purple-600 text-white text-xs font-bold shadow-md flex items-center gap-1.5"
            >
              <FileSpreadsheet className="w-4 h-4 text-amber-400" />
              <span>Platform CSV</span>
            </Link>
          </div>
        </div>

        {/* 4 Primary KPI Cards per Section 11 */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">
                Total Demo Users
              </span>
              <Users className="w-4 h-4 text-purple-600" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-zinc-900">
              {totalUsers}{" "}
              <span className="text-xs text-slate-400 font-normal">
                ({activeUsers} active)
              </span>
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              Renters, hosts & admins
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">
                Approved Fleet
              </span>
              <Car className="w-4 h-4 text-sky-600" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-zinc-900">
              {approvedCars}{" "}
              <span className="text-xs text-slate-400 font-normal">
                / {cars.length} total
              </span>
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              Active in public catalogue
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">
                Total Bookings
              </span>
              <Calendar className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-zinc-900">
              {bookings.length}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              All lifetime demo trips
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">
                Mock Platform Fee (5%)
              </span>
              <DollarSign className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-zinc-900">
              {formatETB(platformFeeEarned)}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              Retained platform commission
            </div>
          </div>
        </div>

        {/* Quick Moderation Queue (Pending Cars & Disputes) */}
        {(pendingCars.length > 0 || openDisputes.length > 0) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Pending Cars Card */}
            {pendingCars.length > 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-3xl p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping" />
                    <h3 className="font-bold text-xs uppercase tracking-wider text-amber-950">
                      Pending Listing Approvals ({pendingCars.length})
                    </h3>
                  </div>
                  <Link
                    href="/admin/listings"
                    className="text-xs font-bold text-amber-800 hover:underline"
                  >
                    View All ➔
                  </Link>
                </div>

                <div className="space-y-2">
                  {pendingCars.slice(0, 2).map((pc) => (
                    <div
                      key={pc.id}
                      className="bg-white p-3.5 rounded-2xl border border-amber-200 flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="font-bold text-zinc-900">
                          {pc.make} {pc.model} ({pc.year})
                        </div>
                        <div className="text-slate-500">
                          {pc.neighbourhood} • {formatETB(pc.pricePerDay)}/day
                        </div>
                      </div>
                      <button
                        onClick={() => handleQuickApproveCar(pc)}
                        className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] shadow-sm cursor-pointer"
                      >
                        Approve Now
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Open Disputes Card */}
            {openDisputes.length > 0 && (
              <div className="bg-rose-50 border border-rose-200 rounded-3xl p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-rose-600" />
                    <h3 className="font-bold text-xs uppercase tracking-wider text-rose-950">
                      Open Renter Disputes ({openDisputes.length})
                    </h3>
                  </div>
                  <Link
                    href="/admin/disputes"
                    className="text-xs font-bold text-rose-800 hover:underline"
                  >
                    Resolve Disputes ➔
                  </Link>
                </div>

                <div className="space-y-2">
                  {openDisputes.slice(0, 2).map((od) => (
                    <div
                      key={od.id}
                      className="bg-white p-3.5 rounded-2xl border border-rose-200 flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="font-bold text-zinc-900">{od.reason}</div>
                        <div className="text-slate-500">Booking: {od.bookingId}</div>
                      </div>
                      <Link
                        href={`/admin/disputes/${od.id}`}
                        className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-[11px] shadow-sm"
                      >
                        Review
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Recharts Platform Monthly Volume Chart */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
            <div>
              <h3 className="font-bold text-base text-zinc-900">
                Monthly Booking Volume & Fee Revenue (2026)
              </h3>
              <p className="text-xs text-slate-500">
                Demonstrating Recharts area/line analytics per Section 11 & 15.
              </p>
            </div>
            <Link
              href="/admin/reports"
              className="text-xs font-bold text-purple-700 hover:underline"
            >
              Export Report ➔
            </Link>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={MONTHLY_PLATFORM_STATS} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                <Tooltip
                  formatter={(value, name) => [
                    name === "commission" ? formatETB(value) : `${value} trips`,
                    name === "commission" ? "5% Platform Fee" : "Volume",
                  ]}
                  contentStyle={{ backgroundColor: "#09090b", color: "#fff", borderRadius: "12px", border: "none", fontSize: "12px" }}
                />
                <Bar dataKey="commission" fill="#7c3aed" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Admin Navigation Quick Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

          <Link
            href="/admin/bookings"
            className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm hover:border-purple-300 transition-all flex items-center justify-between group"
          >
            <div>
              <div className="flex items-center gap-2 font-bold text-sm text-zinc-900">
                <Calendar className="w-4 h-4 text-sky-600" />
                <span>Master Bookings Log</span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Inspect all platform transactions and receipts
              </p>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
          </Link>

          <Link
            href="/admin/reports"
            className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm hover:border-purple-300 transition-all flex items-center justify-between group"
          >
            <div>
              <div className="flex items-center gap-2 font-bold text-sm text-zinc-900">
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                <span>Financial Audit & CSV</span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Full platform CSV export and commission report
              </p>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>

      <Footer />
    </main>
  );
}
