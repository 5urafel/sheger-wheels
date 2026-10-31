"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { MapPin, Calendar, Car, ArrowRight, ShieldCheck, Award, Sparkles } from "lucide-react";
import { PICKUP_LOCATIONS } from "@/data/fleet";
import { GsapHeroEffects } from "./GsapHeroEffects";

export function Hero({ onSearch }) {
  const [today, setToday] = useState("");
  const [location, setLocation] = useState(PICKUP_LOCATIONS[0]);
  const [pickupDate, setPickupDate] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [category, setCategory] = useState("All");

  useEffect(() => {
    const formattedToday = new Date().toISOString().split("T")[0];
    const formattedNext = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0];
    setToday(formattedToday);
    setPickupDate(formattedToday);
    setReturnDate(formattedNext);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(location, pickupDate, returnDate, category);
    }
    const fleetSection = document.getElementById("fleet");
    if (fleetSection) {
      fleetSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section className="relative min-h-[92vh] lg:min-h-screen flex flex-col justify-center bg-zinc-950 text-white pt-28 pb-16 overflow-hidden">
      {/* High-res Hero Backdrop */}
      <div
        className="absolute inset-0 z-0 bg-cover bg-center opacity-45 scale-105 transition-transform duration-1000"
        style={{
          backgroundImage:
            'url("https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=2000&q=80")',
        }}
      />

      {/* Atmospheric Overlays */}
      <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/70 to-zinc-950/40 z-0" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-sky-500/15 rounded-full blur-3xl pointer-events-none z-0" />

      {/* Content Container */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center">
        {/* Eyebrow Badge */}
        <motion.div
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs sm:text-sm font-semibold text-amber-300 mb-6 shadow-glow"
        >
          <Award className="w-4 h-4 text-amber-400" />
          <span>#1 Rated Car Rental & Chauffeur Fleet in Addis Ababa</span>
        </motion.div>

        {/* Editorial Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="font-display text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight max-w-4xl leading-[1.12] text-white"
        >
          Drive Your Journey Across <br />
          Addis & All of Ethiopia
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-6 text-sm sm:text-lg text-slate-300 max-w-2xl font-light leading-relaxed"
        >
          From executive Land Cruisers to nimble city sedans — experience guaranteed Bole Airport delivery, comprehensive insurance, and 24/7 emergency roadside backup.
        </motion.p>

        {/* Floating Multi-Parameter Booking Bar */}
        <motion.div
          id="booking-widget"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="w-full max-w-5xl mt-10 bg-white text-zinc-900 rounded-2xl sm:rounded-3xl p-5 sm:p-7 shadow-2xl border border-slate-100"
        >
          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-left items-end"
          >
            {/* Field 1: Pickup Location */}
            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500">
                <MapPin className="w-4 h-4 text-sky-600" />
                Pickup Location
              </label>
              <select
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-3 text-sm font-semibold text-zinc-800 focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all cursor-pointer"
              >
                {PICKUP_LOCATIONS.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
              </select>
            </div>

            {/* Field 2: Pickup Date */}
            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500">
                <Calendar className="w-4 h-4 text-sky-600" />
                Pickup Date
              </label>
              <input
                type="date"
                min={today}
                value={pickupDate}
                onChange={(e) => setPickupDate(e.target.value)}
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-3 text-sm font-semibold text-zinc-800 focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all cursor-pointer"
              />
            </div>

            {/* Field 3: Return Date */}
            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500">
                <Calendar className="w-4 h-4 text-sky-600" />
                Return Date
              </label>
              <input
                type="date"
                min={pickupDate || today}
                value={returnDate}
                onChange={(e) => setReturnDate(e.target.value)}
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-3 text-sm font-semibold text-zinc-800 focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all cursor-pointer"
              />
            </div>

            {/* Field 4: Search Action Button */}
            <div>
              <button
                type="submit"
                className="w-full h-[48px] rounded-xl bg-zinc-950 hover:bg-sky-600 text-white font-bold text-sm flex items-center justify-center gap-2 transition-all duration-200 active:scale-95 shadow-md hover:shadow-lg cursor-pointer"
              >
                <span>Find Cars</span>
                <ArrowRight className="w-4 h-4 text-amber-400" />
              </button>
            </div>
          </form>

          {/* Quick Perks Line */}
          <div className="mt-5 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between text-xs text-slate-500 gap-3">
            <span className="flex items-center gap-1.5 font-medium">
              <ShieldCheck className="w-4 h-4 text-green-600" /> Free Cancellation up to 24 hours
            </span>
            <span className="flex items-center gap-1.5 font-medium">
              <Car className="w-4 h-4 text-sky-600" /> Free Bole Airport Delivery
            </span>
            <span className="flex items-center gap-1.5 font-semibold text-zinc-800">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Pay in ETB or USD
            </span>
          </div>
        </motion.div>

        {/* GSAP Crazy Animation Telemetry & Counters */}
        <GsapHeroEffects />
      </div>
    </section>
  );
}
