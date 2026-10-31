"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { getUsers, getCars, getBookings, getDisputes } from "@/lib/storage";
import { getCurrentUser } from "@/lib/auth";
import { formatETB, formatDate, generateCSV, downloadCSV } from "@/lib/format";
import {
  FileSpreadsheet,
  Download,
  ChevronLeft,
  DollarSign,
  TrendingUp,
  Shield,
  Activity,
  Users,
  Car,
} from "lucide-react";

export default function AdminReportsPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [cars, setCars] = useState([]);
  const [users, setUsers] = useState([]);
  const [disputes, setDisputes] = useState([]);

  useEffect(() => {
    const user = getCurrentUser();
    if (!user || !user.roles?.includes("admin")) {
      router.push("/signin?next=/admin/reports");
      return;
    }
    setCurrentUser(user);

    setBookings(getBookings());
    setCars(getCars());
    setUsers(getUsers());
    setDisputes(getDisputes());
  }, [router]);

  if (!currentUser) return null;

  // Platform Metrics
  const grossVolume = bookings
    .filter((b) => b.status !== "cancelled" && b.status !== "declined")
    .reduce((a, b) => a + (b.total || 0), 0);

  const platformCommission = bookings
    .filter((b) => b.status !== "cancelled" && b.status !== "declined")
    .reduce((a, b) => a + (b.fee || 0), 0);

  const resolvedDisputes = disputes.filter((d) => d.status === "resolved").length;
  const resolutionRate = disputes.length > 0 ? Math.round((resolvedDisputes / disputes.length) * 100) : 100;

  // RFC 4180 CSV Master Export
  const handleExportMasterCSV = () => {
    const headers = [
      { key: "id", label: "Booking ID" },
      { key: "carName", label: "Car" },
      { key: "renterId", label: "Renter ID" },
      { key: "ownerId", label: "Owner ID" },
      { key: "startDate", label: "Start Date" },
      { key: "endDate", label: "End Date" },
      { key: "days", label: "Days" },
      { key: "pricePerDay", label: "Daily Rate (ETB)" },
      { key: "subtotal", label: "Host Subtotal (ETB)" },
      { key: "fee", label: "Platform Fee 5% (ETB)" },
      { key: "total", label: "Gross Total (ETB)" },
      { key: "status", label: "Lifecycle Status" },
      { key: "paymentReference", label: "TeleBirr Ref" },
      { key: "pickupLocation", label: "Pickup Hub" },
    ];

    const csv = generateCSV(headers, bookings);
    const date = new Date().toISOString().split("T")[0];
    downloadCSV(`sheggar_wheels_master_audit_${date}.csv`, csv);
  };

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
              Platform Financial & Operational Audit
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              End-to-end ledger of booking commissions, host payouts, and dispute performance metrics.
            </p>
          </div>

          <button
            onClick={handleExportMasterCSV}
            className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-md flex items-center gap-2 transition-all cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Export Master Platform CSV</span>
          </button>
        </div>

        {/* 4 Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Gross Rental Volume
            </span>
            <div className="text-2xl sm:text-3xl font-black text-zinc-900 mt-1">
              {formatETB(grossVolume)}
            </div>
            <span className="text-[11px] text-slate-500 mt-1 block">
              Cumulative gross transaction flow
            </span>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Retained Platform Fee (5%)
            </span>
            <div className="text-2xl sm:text-3xl font-black text-purple-700 mt-1">
              {formatETB(platformCommission)}
            </div>
            <span className="text-[11px] text-emerald-600 font-semibold mt-1 block">
              Net platform commission revenue
            </span>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Dispute Resolution Rate
            </span>
            <div className="text-2xl sm:text-3xl font-black text-emerald-600 mt-1">
              {resolutionRate}%
            </div>
            <span className="text-[11px] text-slate-500 mt-1 block">
              {resolvedDisputes} of {disputes.length} disputes closed
            </span>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Registered Demo Accounts
            </span>
            <div className="text-2xl sm:text-3xl font-black text-sky-700 mt-1">
              {users.length} Users
            </div>
            <span className="text-[11px] text-slate-500 mt-1 block">
              Active accounts across all roles
            </span>
          </div>
        </div>

        {/* Comprehensive Financial Ledger Table */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base text-zinc-900">
                Platform Transactions Ledger
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Every booking and payout record stored in the local data layer.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-zinc-700">
              <thead className="bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4">Booking Ref</th>
                  <th className="px-6 py-4">Vehicle</th>
                  <th className="px-6 py-4">Rental Duration</th>
                  <th className="px-6 py-4">Host Subtotal</th>
                  <th className="px-6 py-4">5% Commission</th>
                  <th className="px-6 py-4">Gross Billed</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {bookings.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4 font-mono font-bold text-zinc-900">
                      {b.id}
                    </td>
                    <td className="px-6 py-4 font-semibold text-zinc-900">
                      {b.carName}
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {formatDate(b.startDate)} ➔ {formatDate(b.endDate)}
                    </td>
                    <td className="px-6 py-4 text-slate-700">
                      {formatETB(b.subtotal)}
                    </td>
                    <td className="px-6 py-4 font-bold text-purple-700">
                      {formatETB(b.fee)}
                    </td>
                    <td className="px-6 py-4 font-bold text-zinc-900">
                      {formatETB(b.total)}
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-slate-100 text-slate-800">
                        {b.status}
                      </span>
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
