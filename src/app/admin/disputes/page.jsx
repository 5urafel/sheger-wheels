"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { getDisputes } from "@/lib/storage";
import { getCurrentUser } from "@/lib/auth";
import { formatDate } from "@/lib/format";
import {
  AlertTriangle,
  ChevronLeft,
  CheckCircle2,
  Clock,
  ArrowRight,
  Shield,
} from "lucide-react";

export default function AdminDisputesPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState(null);
  const [disputes, setDisputes] = useState([]);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    const user = getCurrentUser();
    if (!user || !user.roles?.includes("admin")) {
      router.push("/signin?next=/admin/disputes");
      return;
    }
    setCurrentUser(user);
    setDisputes(getDisputes());
  }, [router]);

  if (!currentUser) return null;

  const filtered = filter === "all" ? disputes : disputes.filter((d) => d.status === filter);

  return (
    <main className="min-h-screen bg-slate-50 text-zinc-900 flex flex-col">
      <Navbar />

      <div className="pt-24 pb-16 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex-1 w-full">
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
              Platform Dispute Resolution Center
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Review issues raised by renters and car owners, record resolutions, and mediate claims.
            </p>
          </div>

          <div className="flex gap-1.5 bg-white p-1 rounded-xl border border-slate-200">
            {["all", "opened", "resolved"].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all cursor-pointer ${
                  filter === f
                    ? "bg-purple-600 text-white shadow-sm"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Disputes Grid */}
        <div className="space-y-4">
          {filtered.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 text-xs text-slate-500">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
              No disputes found in this view.
            </div>
          ) : (
            filtered.map((d) => (
              <div
                key={d.id}
                className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-zinc-900">
                      Case #{d.id}
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        d.status === "resolved"
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-rose-100 text-rose-800"
                      }`}
                    >
                      {d.status}
                    </span>
                    <span className="text-slate-400">
                      Opened {formatDate(d.createdAt)}
                    </span>
                  </div>

                  <h3 className="font-bold text-base text-zinc-900">{d.reason}</h3>
                  <p className="text-slate-600 line-clamp-2 max-w-2xl leading-relaxed">
                    {d.description}
                  </p>
                </div>

                <Link
                  href={`/admin/disputes/${d.id}`}
                  className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all"
                >
                  <span>{d.status === "resolved" ? "View Notes" : "Resolve Case"}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ))
          )}
        </div>
      </div>

      <Footer />
    </main>
  );
}
