"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { getUsers, setUserStatus, getBookings, getCars } from "@/lib/storage";
import { getCurrentUser } from "@/lib/auth";
import { formatDate } from "@/lib/format";
import {
  Users,
  ChevronLeft,
  CheckCircle2,
  Ban,
  ShieldAlert,
  ArrowRight,
  Shield,
  Key,
  User,
} from "lucide-react";

export default function AdminUsersPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [feedback, setFeedback] = useState("");

  const refreshUsers = () => {
    const user = getCurrentUser();
    if (!user || !user.roles?.includes("admin")) {
      router.push("/signin?next=/admin/users");
      return;
    }
    setCurrentUser(user);
    setUsers(getUsers());
  };

  useEffect(() => {
    refreshUsers();
    window.addEventListener("sw_storage_update", refreshUsers);
    return () => {
      window.removeEventListener("sw_storage_update", refreshUsers);
    };
  }, [router]);

  const handleToggleStatus = (u) => {
    // Prevent suspending the main admin account
    if (u.id === "user-admin-1") {
      setFeedback("Cannot suspend platform super-admin account.");
      return;
    }

    const nextStatus = u.status === "suspended" ? "active" : "suspended";
    setUserStatus(u.id, nextStatus);
    setFeedback(`Account status for ${u.name} set to ${nextStatus}.`);
    refreshUsers();
    setTimeout(() => setFeedback(""), 3000);
  };

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
              Demo Users & Account Moderation
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Inspect user roles, enforce platform guardrails, and suspend or reinstate demo accounts.
            </p>
          </div>
        </div>

        {feedback && (
          <div className="mb-6 p-4 rounded-2xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{feedback}</span>
          </div>
        )}

        {/* Users Table */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-zinc-700">
              <thead className="bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4">User</th>
                  <th className="px-6 py-4">Contact</th>
                  <th className="px-6 py-4">Assigned Roles</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Created</th>
                  <th className="px-6 py-4 text-right">Moderation Controls</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4 font-bold text-zinc-900 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-200 text-zinc-800 flex items-center justify-center font-bold text-xs">
                        {u.name.charAt(0)}
                      </div>
                      <div>
                        <div>{u.name}</div>
                        <div className="text-[10px] text-slate-400 font-mono font-normal">
                          {u.id}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      <div>{u.email}</div>
                      <div className="text-[10px] text-slate-400">{u.phone}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {u.roles?.map((r) => (
                          <span
                            key={r}
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                              r === "admin"
                                ? "bg-purple-100 text-purple-800"
                                : r === "owner"
                                ? "bg-amber-100 text-amber-800"
                                : "bg-sky-100 text-sky-800"
                            }`}
                          >
                            {r}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          u.status === "active"
                            ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                            : "bg-rose-100 text-rose-800 border border-rose-200"
                        }`}
                      >
                        {u.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      {formatDate(u.createdAt)}
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button
                        onClick={() => handleToggleStatus(u)}
                        disabled={u.id === "user-admin-1"}
                        className={`px-3 py-1.5 rounded-xl font-bold text-[11px] transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed ${
                          u.status === "suspended"
                            ? "bg-emerald-600 hover:bg-emerald-500 text-white"
                            : "border border-rose-200 text-rose-600 hover:bg-rose-50"
                        }`}
                      >
                        {u.status === "suspended" ? "Reinstate" : "Suspend"}
                      </button>

                      <Link
                        href={`/admin/users/${u.id}`}
                        className="font-bold text-sky-600 hover:underline"
                      >
                        Details
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
