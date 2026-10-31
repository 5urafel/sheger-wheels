"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import {
  signInAsDemo,
  safeReturnPath,
  getCurrentUser,
  signOut,
} from "@/lib/auth";
import { getUsers } from "@/lib/storage";
import {
  Car,
  User,
  Key,
  Shield,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
} from "lucide-react";

function SignInContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawNext = searchParams.get("next") || "/";
  const targetPath = safeReturnPath(rawNext, "/");

  const [selectedUser, setSelectedUser] = useState("user-renter-1");
  const [selectedRole, setSelectedRole] = useState("renter");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loginEmail, setLoginEmail] = useState("");
  const [registeredUsers, setRegisteredUsers] = useState([]);

  // Load all users from storage and find custom (non-demo) accounts
  useEffect(() => {
    const allUsers = getUsers();
    const demoIds = ["user-renter-1", "user-owner-1", "user-admin-1"];
    const custom = allUsers.filter((u) => !demoIds.includes(u.id));
    setRegisteredUsers(custom);
  }, []);

  const demoAccounts = [
    {
      id: "user-renter-1",
      name: "Alemayehu Tadesse",
      email: "alemayehu@example.com",
      role: "renter",
      roleLabel: "Visitor / Renter",
      icon: User,
      color: "sky",
      features: [
        "Search & filter full catalogue",
        "Request vehicle bookings",
        "Mock TeleBirr checkout & receipt",
        "Review past trip history & CSV export",
      ],
    },
    {
      id: "user-owner-1",
      name: "Dr. Henok Kebede",
      email: "henok@example.com",
      role: "owner",
      roleLabel: "Car Owner & Renter",
      icon: Key,
      color: "amber",
      features: [
        "Manage owned car listings (Active/Inactive)",
        "Approve or decline rental requests",
        "Set custom pricing & calendar blockouts",
        "View earnings & utilization summaries",
      ],
    },
    {
      id: "user-admin-1",
      name: "Selamawit Bekele",
      email: "admin@sheggarwheels.et",
      role: "admin",
      roleLabel: "Platform Administrator",
      icon: Shield,
      color: "purple",
      features: [
        "Moderate pending car listings (Approve/Reject)",
        "Review user accounts & suspension controls",
        "Resolve renter/owner disputes with notes",

      ],
    },
  ];

  const handleDemoSignIn = (userId, role) => {
    setErrorMessage("");
    const result = signInAsDemo(userId, role);
    if (result?.error) {
      setErrorMessage(result.error);
      return;
    }
    setSuccessMessage(`Signed in as ${result.userName} (${result.activeRole})! Redirecting...`);
    setTimeout(() => {
      router.push(targetPath);
    }, 400);
  };

  const handleEmailSignIn = (e) => {
    e.preventDefault();
    setErrorMessage("");
    if (!loginEmail.trim()) {
      setErrorMessage("Please enter your email address.");
      return;
    }
    const allUsers = getUsers();
    const found = allUsers.find(
      (u) => u.email.toLowerCase() === loginEmail.trim().toLowerCase()
    );
    if (!found) {
      setErrorMessage("No account found with that email. Please sign up first.");
      return;
    }
    handleDemoSignIn(found.id, found.roles[0]);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16">
      <div className="text-center max-w-xl mx-auto mb-12">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-500/10 text-amber-600 border border-amber-500/20 mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          Welcome Back
        </span>
        <h1 className="font-display text-3xl sm:text-4xl font-bold text-zinc-900">
          Sign In to Sheggar Wheels
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          Sign in with your email or choose one of the pre-configured accounts below.
        </p>

        {rawNext !== "/" && (
          <div className="mt-4 p-2.5 rounded-xl bg-sky-50 text-sky-800 text-xs font-medium border border-sky-200">
            Redirecting to <span className="font-bold underline">{targetPath}</span> after sign-in.
          </div>
        )}
      </div>

      {/* Error & Success Banners */}
      {errorMessage && (
        <div className="mb-6 p-4 rounded-2xl bg-rose-50 text-rose-800 border border-rose-200 flex items-center gap-3 text-sm">
          <AlertTriangle className="w-5 h-5 text-rose-600 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {successMessage && (
        <div className="mb-6 p-4 rounded-2xl bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-3 text-sm font-semibold">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Email Sign In Form */}
      <div className="mb-10 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm">
        <h2 className="text-sm font-bold text-zinc-900 mb-4">Sign in with email</h2>
        <form onSubmit={handleEmailSignIn} className="flex flex-col sm:flex-row gap-3">
          <input
            type="email"
            value={loginEmail}
            onChange={(e) => setLoginEmail(e.target.value)}
            placeholder="Enter your email address"
            className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 font-medium"
          />
          <button
            type="submit"
            className="px-6 py-3 rounded-xl bg-zinc-900 hover:bg-sky-600 text-white font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-95 shadow-sm cursor-pointer"
          >
            <span>Sign In</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>

      {/* Registered Accounts (custom accounts created via signup) */}
      {registeredUsers.length > 0 && (
        <div className="mb-10">
          <h2 className="text-sm font-bold text-zinc-900 mb-4">Your Registered Accounts</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {registeredUsers.map((user) => (
              <div
                key={user.id}
                className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-sky-100 text-sky-700 flex items-center justify-center font-bold text-sm">
                      {user.name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-bold text-sm text-zinc-900">{user.name}</div>
                      <div className="text-[11px] text-slate-500">{user.email}</div>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {user.roles.map((role) => (
                      <span
                        key={role}
                        className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200"
                      >
                        {role}
                      </span>
                    ))}
                  </div>
                </div>
                <button
                  onClick={() => handleDemoSignIn(user.id, user.roles[0])}
                  className="w-full py-2.5 rounded-xl bg-zinc-900 hover:bg-sky-600 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-95 shadow-sm cursor-pointer"
                >
                  <span>Sign In</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pre-configured Demo Accounts */}
      <div className="mb-2">
        <h2 className="text-sm font-bold text-zinc-900 mb-4">Pre-configured Accounts</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {demoAccounts.map((acc) => {
          const Icon = acc.icon;
          const isSelected = selectedUser === acc.id && selectedRole === acc.role;
          return (
            <div
              key={acc.id}
              onClick={() => {
                setSelectedUser(acc.id);
                setSelectedRole(acc.role);
              }}
              className={`p-6 rounded-3xl border transition-all duration-200 flex flex-col justify-between cursor-pointer ${
                isSelected
                  ? "bg-white border-zinc-900 shadow-xl ring-2 ring-zinc-900/10 scale-[1.02]"
                  : "bg-white/80 border-slate-200 hover:border-slate-300 shadow-sm"
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div
                    className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold ${
                      acc.color === "sky"
                        ? "bg-sky-100 text-sky-700"
                        : acc.color === "amber"
                        ? "bg-amber-100 text-amber-700"
                        : "bg-purple-100 text-purple-700"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <span
                    className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full ${
                      acc.color === "sky"
                        ? "bg-sky-50 text-sky-700 border border-sky-200"
                        : acc.color === "amber"
                        ? "bg-amber-50 text-amber-700 border border-amber-200"
                        : "bg-purple-50 text-purple-700 border border-purple-200"
                    }`}
                  >
                    {acc.role}
                  </span>
                </div>

                <h3 className="font-bold text-lg text-zinc-900">{acc.name}</h3>
                <div className="text-xs text-slate-500 mb-4">{acc.email}</div>

                <ul className="space-y-2 border-t border-slate-100 pt-4 mb-6">
                  {acc.features.map((feat, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-xs text-slate-600">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDemoSignIn(acc.id, acc.role);
                }}
                className={`w-full py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer shadow-sm ${
                  acc.color === "sky"
                    ? "bg-sky-600 hover:bg-sky-500 text-white"
                    : acc.color === "amber"
                    ? "bg-amber-500 hover:bg-amber-400 text-zinc-950 font-black"
                    : "bg-purple-600 hover:bg-purple-500 text-white"
                }`}
              >
                <span>Enter as {acc.roleLabel.split(" ")[0]}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>

      {/* Public Sign up link */}
      <div className="text-center mt-8 text-xs text-slate-500">
        Don&apos;t have an account?{" "}
        <Link href="/signup" className="text-sky-600 font-bold hover:underline">
          Create Account
        </Link>
      </div>
    </div>
  );
}

export default function SignInPage() {
  return (
    <main className="min-h-screen bg-slate-50 text-zinc-900 flex flex-col">
      <Navbar />
      <div className="pt-24 flex-1">
        <Suspense fallback={<div className="text-center py-24 text-sm text-slate-500">Loading sign in...</div>}>
          <SignInContent />
        </Suspense>
      </div>
      <Footer />
    </main>
  );
}
