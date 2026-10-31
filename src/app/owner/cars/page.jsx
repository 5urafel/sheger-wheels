"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { getCars, saveCar, deleteCar } from "@/lib/storage";
import { getCurrentUser } from "@/lib/auth";
import { formatETB } from "@/lib/format";
import {
  Car,
  PlusCircle,
  Calendar,
  Edit,
  Trash2,
  ChevronLeft,
  Power,
  CheckCircle2,
  AlertCircle,
  Eye,
  Clock,
} from "lucide-react";

export default function OwnerCarsListPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState(null);
  const [cars, setCars] = useState([]);
  const [feedback, setFeedback] = useState("");

  const refreshCars = () => {
    const user = getCurrentUser();
    if (!user) {
      router.push("/signin?next=/owner/cars");
      return;
    }
    setCurrentUser(user);
    const all = getCars();
    setCars(all.filter((c) => c.ownerId === user.id));
  };

  useEffect(() => {
    refreshCars();
    window.addEventListener("sw_storage_update", refreshCars);
    return () => {
      window.removeEventListener("sw_storage_update", refreshCars);
    };
  }, [router]);

  // Toggle Active / Inactive status per Section 4 & 6
  const handleToggleStatus = (car) => {
    const nextStatus = car.status === "inactive" ? "approved" : "inactive";
    saveCar({ ...car, status: nextStatus });
    setFeedback(`Vehicle ${car.make} ${car.model} is now marked ${nextStatus}.`);
    setTimeout(() => setFeedback(""), 3000);
    refreshCars();
  };

  if (!currentUser) return null;

  return (
    <main className="min-h-screen bg-slate-50 text-zinc-900 flex flex-col">
      <Navbar />

      <div className="pt-24 pb-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex-1 w-full">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-50 text-amber-800 border border-amber-200 mb-2">
              <Car className="w-3.5 h-3.5" />
              Owner Fleet Management
            </div>
            <h1 className="font-display text-3xl font-bold text-zinc-900">
              My Listed Vehicles ({cars.length})
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Toggle availability status, edit vehicle details, or block rental dates.
            </p>
          </div>

          <Link
            href="/owner/cars/new"
            className="px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-sky-600 text-white text-xs font-bold shadow-md flex items-center gap-2 transition-all cursor-pointer"
          >
            <PlusCircle className="w-4 h-4 text-amber-400" />
            <span>List New Car</span>
          </Link>
        </div>

        {feedback && (
          <div className="mb-6 p-4 rounded-2xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{feedback}</span>
          </div>
        )}

        {/* Cars Table */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          {cars.length === 0 ? (
            <div className="text-center py-16 px-4">
              <Car className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="font-bold text-base text-zinc-900">
                No Vehicles Listed
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4 leading-relaxed">
                You haven&apos;t added any cars to the Sheggar Wheels marketplace yet.
              </p>
              <Link
                href="/owner/cars/new"
                className="px-5 py-2.5 rounded-xl bg-zinc-900 text-white text-xs font-bold shadow-sm"
              >
                Add Your First Vehicle
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-zinc-700">
                <thead className="bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-4">Car Details</th>
                    <th className="px-6 py-4">Category</th>
                    <th className="px-6 py-4">Neighbourhood</th>
                    <th className="px-6 py-4">Daily Rate</th>
                    <th className="px-6 py-4">Moderation / State</th>
                    <th className="px-6 py-4">Toggle Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {cars.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-6 py-4 font-bold text-zinc-900 flex items-center gap-3">
                        <img
                          src={c.photos?.[0] || c.image}
                          alt={c.model}
                          className="w-12 h-9 rounded-lg object-cover border"
                        />
                        <div>
                          <div>{c.make} {c.model}</div>
                          <div className="text-[10px] text-slate-400 font-normal">
                            {c.year} • {c.transmission} • {c.seats} Seats
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-600">{c.category}</td>
                      <td className="px-6 py-4 text-slate-600">{c.neighbourhood}</td>
                      <td className="px-6 py-4 font-bold text-zinc-900">{formatETB(c.pricePerDay)}</td>
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
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleToggleStatus(c)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold border transition-colors cursor-pointer ${
                            c.status === "inactive"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                              : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                          }`}
                        >
                          <Power className="w-3.5 h-3.5" />
                          <span>{c.status === "inactive" ? "Activate" : "Deactivate"}</span>
                        </button>
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
                        <span className="text-slate-300">|</span>
                        <Link
                          href={`/owner/cars/${c.id}/bookings`}
                          className="font-bold text-amber-600 hover:underline"
                        >
                          Bookings
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
