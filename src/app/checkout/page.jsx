"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import {
  readSession,
  writeSession,
  saveBooking,
  getCarById,
  STORAGE_KEYS,
} from "@/lib/storage";
import { getCurrentUser } from "@/lib/auth";
import { formatETB, formatUSD, formatDate } from "@/lib/format";
import {
  CreditCard,
  ShieldCheck,
  CheckCircle2,
  Lock,
  ArrowRight,
  Car,
  Calendar,
  MapPin,
  Sparkles,
  Phone,
  QrCode,
  AlertTriangle,
} from "lucide-react";

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlCarId = searchParams.get("carId");

  const [currentUser, setCurrentUser] = useState(null);
  const [draft, setDraft] = useState(null);
  const [telebirrPhone, setTelebirrPhone] = useState("+251 911 234 567");
  const [isProcessing, setIsProcessing] = useState(false);
  const [completedBooking, setCompletedBooking] = useState(null);
  const [demoTxId, setDemoTxId] = useState("");

  useEffect(() => {
    const user = getCurrentUser();
    if (!user) {
      router.push(`/signin?next=/checkout`);
      return;
    }
    setCurrentUser(user);

    // Read draft from sessionStorage
    let storedDraft = readSession(STORAGE_KEYS.CHECKOUT_DRAFT);
    if (!storedDraft && urlCarId) {
      const car = getCarById(urlCarId);
      if (car) {
        storedDraft = {
          carId: car.id,
          carName: `${car.make} ${car.model}`,
          carPhoto: car.photos?.[0] || car.image,
          ownerId: car.ownerId,
          ownerName: "Dr. Henok Kebede",
          startDate: new Date(Date.now() + 86400000).toISOString().split("T")[0],
          endDate: new Date(Date.now() + 86400000 * 3).toISOString().split("T")[0],
          days: 2,
          pricePerDay: car.pricePerDay,
          subtotal: car.pricePerDay * 2,
          fee: Math.round(car.pricePerDay * 2 * 0.05),
          total: car.pricePerDay * 2 + Math.round(car.pricePerDay * 2 * 0.05),
          chauffeurIncluded: false,
          neighbourhood: car.neighbourhood,
        };
      }
    }

    setDraft(storedDraft);
    // Generate clearly fake transaction ID per spec
    const randDigits = Math.floor(100000 + Math.random() * 900000);
    setDemoTxId(`TB-DEMO-${randDigits}`);
  }, [router, urlCarId]);

  if (!currentUser) return null;

  if (!draft) {
    return (
      <div className="max-w-xl mx-auto text-center py-24 px-4">
        <Car className="w-12 h-12 text-slate-400 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-zinc-900">No Active Checkout Draft</h2>
        <p className="text-xs text-slate-500 mt-1 mb-6">
          Please select a vehicle from our fleet catalogue before initiating payment.
        </p>
        <Link
          href="/cars"
          className="px-5 py-2.5 rounded-xl bg-zinc-900 text-white font-bold text-xs"
        >
          Browse Fleet
        </Link>
      </div>
    );
  }

  // Finalize Mock Payment
  const handleCompletePayment = (e) => {
    e.preventDefault();
    setIsProcessing(true);

    setTimeout(() => {
      const newBooking = {
        id: `bk-${Date.now().toString().slice(-5)}`,
        carId: draft.carId,
        carName: draft.carName,
        carPhoto: draft.carPhoto,
        renterId: currentUser.id,
        renterName: currentUser.name,
        renterPhone: currentUser.phone || telebirrPhone,
        ownerId: draft.ownerId,
        ownerName: draft.ownerName,
        startDate: draft.startDate,
        endDate: draft.endDate,
        days: draft.days,
        pricePerDay: draft.pricePerDay,
        subtotal: draft.subtotal,
        fee: draft.fee,
        total: draft.total,
        pickupLocation: `${draft.neighbourhood || "Bole"}, Addis Ababa`,
        chauffeurIncluded: draft.chauffeurIncluded || false,
        paymentStatus: "paid",
        paymentReference: demoTxId,
        status: "confirmed", // Confirmed upon payment completion per Section 7!
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      saveBooking(newBooking);
      writeSession(STORAGE_KEYS.CHECKOUT_DRAFT, null);
      setCompletedBooking(newBooking);
      setIsProcessing(false);
    }, 800);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      {/* Success Receipt View */}
      {completedBooking ? (
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200 shadow-2xl text-center max-w-xl mx-auto animate-in zoom-in-95 duration-200">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4 font-bold shadow-md">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            Payment Confirmed (Simulation)
          </span>

          <h1 className="font-display text-3xl font-bold text-zinc-900 mt-3">
            Booking Confirmed!
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Your reservation for the {completedBooking.carName} has been recorded in browser storage.
          </p>

          {/* Receipt Breakdown Box */}
          <div className="my-6 p-5 rounded-2xl bg-slate-50 border border-slate-200 text-left text-xs space-y-2.5">
            <div className="flex justify-between pb-2 border-b border-slate-200 text-slate-500">
              <span>Booking Reference:</span>
              <strong className="text-zinc-900 font-mono">{completedBooking.id}</strong>
            </div>

            <div className="flex justify-between text-slate-500">
              <span>Mock TeleBirr Tx ID:</span>
              <span className="text-sky-700 font-bold font-mono">{completedBooking.paymentReference}</span>
            </div>

            <div className="flex justify-between text-slate-500">
              <span>Dates:</span>
              <span className="text-zinc-900 font-medium">
                {formatDate(completedBooking.startDate)} ➔ {formatDate(completedBooking.endDate)} ({completedBooking.days} days)
              </span>
            </div>

            <div className="flex justify-between text-slate-500">
              <span>Pickup Hub:</span>
              <span className="text-zinc-900 font-medium">{completedBooking.pickupLocation}</span>
            </div>

            <div className="flex justify-between pt-2 border-t border-slate-200 text-sm font-bold text-zinc-900">
              <span>Total Paid (ETB):</span>
              <span className="text-emerald-700">{formatETB(completedBooking.total)}</span>
            </div>
          </div>

          {/* Action Navigation */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href={`/bookings/${completedBooking.id}`}
              className="px-5 py-3 rounded-xl bg-zinc-900 hover:bg-sky-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md transition-colors"
            >
              <span>View Booking Receipt</span>
              <ArrowRight className="w-4 h-4 text-amber-400" />
            </Link>

            <Link
              href="/dashboard"
              className="px-5 py-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-zinc-800 font-bold text-xs flex items-center justify-center"
            >
              <span>Go to Renter Dashboard</span>
            </Link>
          </div>
        </div>
      ) : (
        /* Checkout Form View */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Left Column: TeleBirr Payment Simulation */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-sky-600 bg-sky-50 px-3 py-1 rounded-full border border-sky-100">
                Mock Payment Gateway
              </span>
              <h1 className="font-display text-3xl font-bold text-zinc-900 mt-2">
                TeleBirr Checkout Simulation
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                Complete your reservation via simulated TeleBirr mobile money.
              </p>
            </div>

            {/* Clearly Fake TeleBirr Simulation Card */}
            <div className="bg-gradient-to-br from-sky-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
              <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-amber-400 text-zinc-950 font-black flex items-center justify-center text-xs">
                    TB
                  </div>
                  <div>
                    <span className="font-bold text-sm tracking-wide">
                      telebirr <span className="text-amber-400">SuperApp</span>
                    </span>
                    <span className="block text-[9px] text-slate-400 uppercase tracking-widest">
                      Ethio Telecom P2P Gateway
                    </span>
                  </div>
                </div>

                <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-400/20 text-amber-300 border border-amber-400/30 px-2 py-0.5 rounded-full">
                  Mock Gateway
                </span>
              </div>

              <form onSubmit={handleCompletePayment} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                    TeleBirr Registered Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={telebirrPhone}
                      onChange={(e) => setTelebirrPhone(e.target.value)}
                      required
                      placeholder="+251 911 000 000"
                      className="w-full bg-white/10 border border-white/20 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-slate-400 font-mono focus:outline-none focus:ring-2 focus:ring-amber-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                    Simulated 4-Digit PIN
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      maxLength={4}
                      defaultValue="1234"
                      className="w-full bg-white/10 border border-white/20 rounded-xl pl-10 pr-4 py-3 text-sm text-white font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-amber-400"
                    />
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Any mock digits accepted. No actual PIN or charge is verified.
                  </span>
                </div>

                {/* Simulated Transaction Reference */}
                <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between text-xs">
                  <span className="text-slate-400">Generated Reference:</span>
                  <span className="font-mono font-bold text-amber-300">{demoTxId}</span>
                </div>

                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full py-4 rounded-xl bg-amber-400 hover:bg-amber-300 active:scale-95 text-zinc-950 font-black text-sm flex items-center justify-center gap-2 transition-all shadow-lg cursor-pointer"
                >
                  {isProcessing ? (
                    <span>Processing Demo Payment...</span>
                  ) : (
                    <>
                      <span>Complete Demo Payment ({formatETB(draft.total)})</span>
                      <ArrowRight className="w-4 h-4 text-zinc-950" />
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Guardrail Disclaimer per Section 12 */}
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                <strong>Demonstration Guardrail:</strong> This is a mock TeleBirr integration for capstone evaluation. It strictly records a simulated booking state in browser <code className="bg-white px-1 py-0.5 rounded border font-mono">localStorage</code>. No financial credentials or bank connections exist.
              </p>
            </div>
          </div>

          {/* Right Column: Order Summary Card */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-md space-y-5">
            <h3 className="font-bold text-base text-zinc-900 pb-3 border-b border-slate-100">
              Trip Summary
            </h3>

            {/* Car Preview */}
            <div className="flex items-center gap-3">
              <img
                src={draft.carPhoto}
                alt={draft.carName}
                className="w-16 h-12 rounded-xl object-cover border border-slate-200"
              />
              <div>
                <h4 className="font-bold text-sm text-zinc-900">{draft.carName}</h4>
                <span className="text-xs text-slate-500">{draft.neighbourhood}, Addis Ababa</span>
              </div>
            </div>

            {/* Dates */}
            <div className="space-y-1 text-xs text-slate-600 pt-2 border-t border-slate-100">
              <div className="flex justify-between">
                <span>Pickup:</span>
                <strong className="text-zinc-900">{formatDate(draft.startDate)}</strong>
              </div>
              <div className="flex justify-between">
                <span>Return:</span>
                <strong className="text-zinc-900">{formatDate(draft.endDate)}</strong>
              </div>
              <div className="flex justify-between">
                <span>Duration:</span>
                <span className="font-semibold text-zinc-900">{draft.days} Days</span>
              </div>
            </div>

            {/* Breakdown */}
            <div className="space-y-2 text-xs pt-3 border-t border-slate-100 text-slate-600">
              <div className="flex justify-between">
                <span>Daily rate × {draft.days}d</span>
                <span className="font-semibold text-zinc-900">
                  {formatETB(draft.pricePerDay * draft.days)}
                </span>
              </div>

              {draft.chauffeurIncluded && (
                <div className="flex justify-between">
                  <span>Chauffeur service</span>
                  <span className="font-semibold text-zinc-900">
                    {formatETB(1500 * draft.days)}
                  </span>
                </div>
              )}

              <div className="flex justify-between">
                <span>Platform commission (5%)</span>
                <span className="font-semibold text-zinc-900">
                  {formatETB(draft.fee)}
                </span>
              </div>

              <div className="flex justify-between pt-3 border-t border-slate-200 text-base font-bold text-zinc-900">
                <span>Total Due:</span>
                <span className="text-sky-700">{formatETB(draft.total)}</span>
              </div>
            </div>

            <div className="text-center text-[10px] text-slate-400">
              Host: {draft.ownerName || "Dr. Henok Kebede"}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <main className="min-h-screen bg-slate-50 text-zinc-900 flex flex-col">
      <Navbar />
      <div className="pt-24 flex-1">
        <Suspense fallback={<div className="text-center py-24 text-xs text-slate-500">Loading checkout...</div>}>
          <CheckoutContent />
        </Suspense>
      </div>
      <Footer />
    </main>
  );
}
