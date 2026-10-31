"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { getCars, saveCar } from "@/lib/storage";
import { getCurrentUser } from "@/lib/auth";
import { formatETB } from "@/lib/format";
import {
  Car,
  ChevronLeft,
  CheckCircle2,
  XCircle,
  Filter,
  Shield,
  Eye,
} from "lucide-react";

export default function AdminListingsPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState(null);
  const [cars, setCars] = useState([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [feedback, setFeedback] = useState("");

  const refreshCars = () => {
    const user = getCurrentUser();
    if (!user || !user.roles?.includes("admin")) {
      router.push("/signin?next=/admin/listings");
      return;
    }
    setCurrentUser(user);
    setCars(getCars());
  };

  useEffect(() => {
    refreshCars();
    window.addEventListener("sw_storage_update", refreshCars);
    return () => {
      window.removeEventListener("sw_storage_update", refreshCars);
    };
  }, [router]);

  const handleSetStatus = (car, nextStatus) => {
    saveCar({ ...car, status: nextStatus });
    setFeedback(`Listing for ${car.make} ${car.model} is now ${nextStatus}.`);
    refreshCars();
    setTimeout(() => setFeedback(""), 3000);
  };

  if (!currentUser) return null;

  const filtered = statusFilter === "all" ? cars : cars.filter((c) => c.status === statusFilter);

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
              Vehicle Listings Moderation
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Approve, reject, or inspect peer-to-peer car listings in Addis Ababa.
            </p>
          </div>

          <div className="flex gap-1.5 bg-white p-1.5 rounded-2xl border border-slate-200">
            {["all", "pending", "approved", "rejected", "inactive"].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize cursor-pointer transition-colors ${
                  statusFilter === st
                    ? "bg-purple-600 text-white shadow-sm"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {feedback && (
          <div className="mb-6 p-4 rounded-2xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{feedback}</span>
          </div>
        )}

        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-zinc-700">
              <thead className="bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4">Vehicle</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Neighbourhood</th>
                  <th className="px-6 py-4">Daily Price</th>
                  <th className="px-6 py-4">Moderation Status</th>
                  <th className="px-6 py-4 text-right">Moderator Controls</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((car) => (
                  <tr key={car.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4 font-bold text-zinc-900 flex items-center gap-3">
                      <img
                        src={car.photos?.[0] || car.image}
                        alt={car.model}
                        className="w-12 h-9 rounded-lg object-cover border"
                      />
                      <div>
                        <div>{car.make} {car.model}</div>
                        <div className="text-[10px] text-slate-400 font-normal">
                          {car.year} • {car.transmission}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600">{car.category}</td>
                    <td className="px-6 py-4 text-slate-600">{car.neighbourhood}</td>
                    <td className="px-6 py-4 font-bold text-zinc-900">{formatETB(car.pricePerDay)}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          car.status === "approved"
                            ? "bg-emerald-100 text-emerald-800"
                            : car.status === "pending"
                            ? "bg-amber-100 text-amber-800"
                            : car.status === "rejected"
                            ? "bg-rose-100 text-rose-800"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {car.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      {car.status !== "approved" && (
                        <button
                          onClick={() => handleSetStatus(car, "approved")}
                          className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] cursor-pointer"
                        >
                          Approve
                        </button>
                      )}
                      {car.status !== "rejected" && (
                        <button
                          onClick={() => handleSetStatus(car, "rejected")}
                          className="px-3 py-1.5 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 font-bold text-[11px] cursor-pointer"
                        >
                          Reject
                        </button>
                      )}
                      <Link
                        href={`/cars/${car.id}`}
                        target="_blank"
                        className="p-1.5 inline-flex text-slate-400 hover:text-zinc-900"
                        title="View Public Listing"
                      >
                        <Eye className="w-4 h-4" />
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
