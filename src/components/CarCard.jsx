"use client";

import { motion } from "framer-motion";
import { Users, Fuel, Gauge, Star, CheckCircle2, ArrowUpRight } from "lucide-react";
import { formatCurrency } from "@/data/fleet";

export function CarCard({ car, onBookNow }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
      className="group relative bg-white rounded-2xl overflow-hidden border border-slate-200/80 shadow-sm hover:shadow-card-hover transition-all duration-300 flex flex-col justify-between"
    >
      <div>
        {/* Top Image Container */}
        <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
          <img
            src={car.image}
            alt={car.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />

          {/* Badge */}
          {car.badge && (
            <span className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm text-zinc-900 text-xs font-bold px-3 py-1 rounded-full shadow-sm">
              {car.badge}
            </span>
          )}

          {/* Model Year Badge */}
          <span className="absolute top-3 right-3 bg-zinc-900/80 backdrop-blur-sm text-white text-xs font-semibold px-2.5 py-1 rounded-full">
            {car.modelYear}
          </span>
        </div>

        {/* Content Body */}
        <div className="p-5">
          {/* Category & Rating */}
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span className="font-semibold uppercase tracking-wider text-sky-600">
              {car.category}
            </span>
            <div className="flex items-center gap-1 font-semibold text-zinc-800">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>{car.rating.toFixed(1)}</span>
              <span className="text-slate-400">({car.reviewsCount})</span>
            </div>
          </div>

          {/* Car Name */}
          <h3 className="text-lg font-bold text-zinc-900 group-hover:text-sky-600 transition-colors line-clamp-1">
            {car.name}
          </h3>

          {/* Vehicle Key Specs (Transmission, Seats, Fuel) */}
          <div className="grid grid-cols-3 gap-2 py-3 my-3 border-y border-slate-100 text-xs text-slate-600 font-medium">
            <div className="flex items-center gap-1.5">
              <Gauge className="w-4 h-4 text-slate-400" />
              <span>{car.specs.transmission}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Users className="w-4 h-4 text-slate-400" />
              <span>{car.specs.seats} Seats</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Fuel className="w-4 h-4 text-slate-400" />
              <span>{car.specs.fuelType}</span>
            </div>
          </div>

          {/* Highlights */}
          <ul className="space-y-1.5 mb-2">
            {car.features.slice(0, 2).map((feat, idx) => (
              <li key={idx} className="flex items-center gap-1.5 text-xs text-slate-500">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                <span>{feat}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Pricing & CTA Button */}
      <div className="px-5 pb-5 pt-3 flex items-center justify-between border-t border-slate-100 bg-slate-50/50">
        <div>
          <div className="text-[11px] text-slate-400 font-medium">Daily Rate</div>
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-bold text-zinc-900" suppressHydrationWarning>
              {formatCurrency(car.pricePerDayETB)}
            </span>
            <span className="text-xs font-semibold text-slate-500">ETB</span>
          </div>
          <div className="text-[11px] text-slate-400">~${car.pricePerDayUSD} USD/day</div>
        </div>

        <button
          onClick={() => onBookNow(car)}
          className="flex items-center gap-1.5 bg-zinc-900 hover:bg-sky-600 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-all duration-200 active:scale-95 shadow-sm cursor-pointer"
        >
          <span>Book Now</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </motion.div>
  );
}
