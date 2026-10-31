"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { getBookings } from "@/lib/storage";
import { getCurrentUser } from "@/lib/auth";
import { formatETB, formatDate, generateCSV, downloadCSV } from "@/lib/format";
import {
  Car,
  Search,
  Filter,
  Download,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  FileSpreadsheet,
} from "lucide-react";

const STATUS_FILTERS = [
  "All",
  "confirmed",
  "requested",
  "in_progress",
  "completed",
  "disputed",
  "cancelled",
];

export default function BookingsHistoryPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("All");

  useEffect(() => {
    const user = getCurrentUser();
    if (!user) {
      router.push("/signin?next=/bookings");
      return;
    }
    setCurrentUser(user);

    const load = () => {
      const all = getBookings();
      // Filter only current user's bookings (ownership boundary)
      setBookings(all.filter((b) => b.renterId === user.id));
    };

    load();
    window.addEventListener("sw_storage_update", load);
    window.addEventListener("storage", load);
    return () => {
      window.removeEventListener("sw_storage_update", load);
      window.removeEventListener("storage", load);
    };
  }, [router]);

  // Filter & Search Logic
  const filteredBookings = useMemo(() => {
    return bookings.filter((b) => {
      if (selectedStatus !== "All" && b.status !== selectedStatus) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchCar = (b.carName || "").toLowerCase().includes(q);
        const matchId = (b.id || "").toLowerCase().includes(q);
        const matchLoc = (b.pickupLocation || "").toLowerCase().includes(q);
        if (!matchCar && !matchId && !matchLoc) return false;
      }
      return true;
    });
  }, [bookings, selectedStatus, searchQuery]);

  // Handle RFC 4180 CSV Export per Section 12 & 15 Concept #33
  const handleExportCSV = () => {
    if (!filteredBookings.length) return;

    const headers = [
      { key: "id", label: "Booking ID" },
      { key: "carName", label: "Vehicle" },
      { key: "startDate", label: "Pickup Date" },
      { key: "endDate", label: "Return Date" },
      { key: "days", label: "Duration (Days)" },
      { key: "pricePerDay", label: "Rate (ETB)" },
      { key: "subtotal", label: "Subtotal (ETB)" },
      { key: "fee", label: "Platform Fee (ETB)" },
      { key: "total", label: "Total Paid (ETB)" },
      { key: "status", label: "Booking Status" },
      { key: "paymentReference", label: "TeleBirr Ref" },
      { key: "pickupLocation", label: "Pickup Hub" },
      { key: "createdAt", label: "Created Timestamp" },
    ];

    const csvData = generateCSV(headers, filteredBookings);
    const dateStamp = new Date().toISOString().split("T")[0];
    downloadCSV(`sheggar_wheels_bookings_${currentUser.id}_${dateStamp}.csv`, csvData);
  };

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

  if (!currentUser) return null;

  return (
    <main className="min-h-screen bg-slate-50 text-zinc-900 flex flex-col">
      <Navbar />

      <div className="pt-24 pb-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex-1 w-full">
        {/* Header Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-sky-50 text-sky-700 border border-sky-100 mb-2">
              <Calendar className="w-3.5 h-3.5" />
              Renter Booking History
            </div>
            <h1 className="font-display text-3xl font-bold text-zinc-900">
              My Rental Reservations
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Search, filter, and export your personal trip records in Addis Ababa.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleExportCSV}
              disabled={filteredBookings.length === 0}
              className="px-4 py-2.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-zinc-800 text-xs font-bold shadow-sm flex items-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              <Download className="w-4 h-4 text-emerald-600" />
              <span>Export CSV (RFC 4180)</span>
            </button>

            <Link
              href="/cars"
              className="px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-sky-600 text-white text-xs font-bold shadow-md flex items-center gap-1.5 transition-all"
            >
              <Car className="w-4 h-4 text-amber-400" />
              <span>Book Car</span>
            </Link>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Status Tabs */}
          <div className="flex flex-wrap gap-1.5 w-full sm:w-auto">
            {STATUS_FILTERS.map((s) => (
              <button
                key={s}
                onClick={() => setSelectedStatus(s)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedStatus === s
                    ? "bg-zinc-900 text-white shadow-sm"
                    : "bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200"
                }`}
              >
                {s === "All" ? "All Trips" : s.replace("_", " ")}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search vehicle or booking ID..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs font-medium text-zinc-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>
        </div>

        {/* Bookings Table */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          {filteredBookings.length === 0 ? (
            <div className="text-center py-16 px-4">
              <Car className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="font-bold text-base text-zinc-900">
                No Bookings Found
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4 leading-relaxed">
                No reservations match your active filter criteria. Try changing the status filter or clearing search keywords.
              </p>
              <button
                onClick={() => {
                  setSelectedStatus("All");
                  setSearchQuery("");
                }}
                className="text-xs font-bold text-sky-600 hover:underline"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-zinc-700">
                <thead className="bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-4">Booking Ref</th>
                    <th className="px-6 py-4">Vehicle</th>
                    <th className="px-6 py-4">Rental Duration</th>
                    <th className="px-6 py-4">Pickup Hub</th>
                    <th className="px-6 py-4">Total (ETB)</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredBookings.map((b) => (
                    <tr key={b.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-6 py-4 font-mono font-bold text-zinc-900">
                        {b.id}
                      </td>
                      <td className="px-6 py-4 font-semibold text-zinc-900">
                        {b.carName || "Vehicle"}
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        {formatDate(b.startDate)} ➔ {formatDate(b.endDate)}
                        <span className="block text-[10px] text-slate-400">
                          {b.days} {b.days === 1 ? "day" : "days"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-600 truncate max-w-xs">
                        {b.pickupLocation}
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
                          className="inline-flex items-center gap-1 font-bold text-sky-600 hover:text-sky-700 hover:underline"
                        >
                          <span>Manage</span>
                          <ArrowRight className="w-3.5 h-3.5" />
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
