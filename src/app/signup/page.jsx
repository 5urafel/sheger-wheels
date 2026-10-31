"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { saveUser, getUsers } from "@/lib/storage";
import { signInAsDemo, safeReturnPath } from "@/lib/auth";
import { UserPlus, ArrowRight, AlertCircle, CheckCircle2 } from "lucide-react";

function SignUpContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawNext = searchParams.get("next") || "/dashboard";
  const targetPath = safeReturnPath(rawNext, "/dashboard");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("+251 9");
  const [isOwnerRole, setIsOwnerRole] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (!name.trim() || !email.trim() || !phone.trim()) {
      setErrorMessage("Please fill in all required fields.");
      return;
    }

    // Check duplicate email
    const users = getUsers();
    const existing = users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
    if (existing) {
      setErrorMessage("A demo user with this email address already exists. Please choose another or sign in.");
      return;
    }

    const roles = isOwnerRole ? ["owner"] : ["renter"];

    const newUser = {
      id: `user-${Date.now()}`,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      roles,
      status: "active",
      avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80",
      createdAt: new Date().toISOString(),
    };

    saveUser(newUser);
    signInAsDemo(newUser.id, roles[0]);

    setSuccessMessage(`Account created for ${newUser.name}! Redirecting...`);
    setTimeout(() => {
      router.push(targetPath);
    }, 500);
  };

  return (
    <div className="max-w-xl mx-auto px-4 sm:px-6 py-16">
      <div className="text-center mb-8">
        <div className="w-12 h-12 rounded-2xl bg-sky-100 text-sky-700 flex items-center justify-center mx-auto mb-4 font-bold shadow-sm">
          <UserPlus className="w-6 h-6" />
        </div>
        <h1 className="font-display text-3xl font-bold text-zinc-900">
          Create Demo Account
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          Register a demo profile to test renting and hosting on Sheggar Wheels.
        </p>
      </div>

      {errorMessage && (
        <div className="mb-6 p-4 rounded-2xl bg-rose-50 text-rose-800 border border-rose-200 flex items-center gap-3 text-sm">
          <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {successMessage && (
        <div className="mb-6 p-4 rounded-2xl bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-3 text-sm font-semibold">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xl space-y-5"
      >
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
            Full Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Dawit Haile"
            required
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 font-medium"
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
            Email Address
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="e.g. dawit@example.com"
            required
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 font-medium"
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
            Phone Number
          </label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+251 911 000 000"
            required
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 font-medium"
          />
        </div>

        {/* Account Type Toggle */}
        <div className="space-y-2">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
            Account Type
          </div>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setIsOwnerRole(false)}
              className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                !isOwnerRole
                  ? "border-sky-500 bg-sky-50 ring-2 ring-sky-500/20"
                  : "border-slate-200 bg-slate-50 hover:bg-slate-100"
              }`}
            >
              <div className={`font-semibold text-xs ${!isOwnerRole ? "text-sky-700" : "text-zinc-700"}`}>
                Renter
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                Browse and book vehicles
              </div>
            </button>
            <button
              type="button"
              onClick={() => setIsOwnerRole(true)}
              className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                isOwnerRole
                  ? "border-amber-500 bg-amber-50 ring-2 ring-amber-500/20"
                  : "border-slate-200 bg-slate-50 hover:bg-slate-100"
              }`}
            >
              <div className={`font-semibold text-xs ${isOwnerRole ? "text-amber-700" : "text-zinc-700"}`}>
                Owner
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                List cars, set prices & manage bookings
              </div>
            </button>
          </div>
        </div>



        <button
          type="submit"
          className="w-full py-3.5 rounded-xl bg-zinc-900 hover:bg-sky-600 text-white font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-95 shadow-md cursor-pointer"
        >
          <span>Complete Demo Registration</span>
          <ArrowRight className="w-4 h-4 text-amber-400" />
        </button>
      </form>

      <div className="text-center mt-6 text-xs text-slate-500">
        Already have an account?{" "}
        <Link href="/signin" className="text-sky-600 font-bold hover:underline">
          Sign in via Persona Picker
        </Link>
      </div>
    </div>
  );
}

export default function SignUpPage() {
  return (
    <main className="min-h-screen bg-slate-50 text-zinc-900 flex flex-col">
      <Navbar />
      <div className="pt-24 flex-1">
        <Suspense fallback={<div className="text-center py-24 text-sm text-slate-500">Loading sign up...</div>}>
          <SignUpContent />
        </Suspense>
      </div>
      <Footer />
    </main>
  );
}
