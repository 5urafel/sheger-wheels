"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getPublicCars } from "@/lib/storage";
import { formatETB, formatUSD } from "@/lib/format";
import {
  MapPin,
  Star,
  Gauge,
  Users,
  Fuel,
  ArrowRight,
  Sparkles,
} from "lucide-react";

export function FleetSection() {
  const [cars, setCars] = useState([]);

  useEffect(() => {
    const load = () => {
      const all = getPublicCars();
      setCars(all.slice(0, 3));
    };
    load();

    window.addEventListener("sw_storage_update", load);
    window.addEventListener("storage", load);
    return () => {
      window.removeEventListener("sw_storage_update", load);
      window.removeEventListener("storage", load);
    };
  }, []);

  return (
    <section id="fleet" className="py-24 bg-slate-50 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-sky-600 bg-sky-50 px-3.5 py-1.5 rounded-full border border-sky-100">
            Our Certified Fleet
          </span>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-zinc-900 mt-4 leading-tight">
            Engineered for City Elegance &amp; Rugged Exploration
          </h2>
          <p className="mt-4 text-slate-600 text-sm sm:text-base leading-relaxed">
            Every vehicle in our fleet is thoroughly inspected, fully insured,
            and maintained to the highest safety standards. Pick up anywhere in
            Addis Ababa.
          </p>
        </div>

        {/* Vehicle Cards Grid — same card design as fleet catalogue */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {cars.map((car) => (
            <div
              key={car.id}
              className="group relative bg-white rounded-2xl overflow-hidden border border-slate-200/80 shadow-sm hover:shadow-card-hover transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                {/* Top Photo */}
                <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
                  <img
                    src={car.photos?.[0] || car.image}
                    alt={`${car.make} ${car.model}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />

                  {/* Neighbourhood Badge */}
                  <span className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm text-zinc-900 text-xs font-bold px-3 py-1 rounded-full shadow-sm flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-sky-600" />
                    <span>{car.neighbourhood}</span>
                  </span>

                  {/* Year Badge */}
                  <span className="absolute top-3 right-3 bg-zinc-900/80 backdrop-blur-sm text-white text-xs font-semibold px-2.5 py-1 rounded-full">
                    {car.year}
                  </span>
                </div>

                {/* Content Details */}
                <div className="p-5">
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
                    <span className="font-bold uppercase tracking-wider text-sky-600 text-[11px]">
                      {car.category}
                    </span>
                    <div className="flex items-center gap-1 font-bold text-zinc-800">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span>{(car.rating || 5.0).toFixed(1)}</span>
                      <span className="text-slate-400">
                        ({car.reviewsCount || 0})
                      </span>
                    </div>
                  </div>

                  <h3 className="text-base font-bold text-zinc-900 group-hover:text-sky-600 transition-colors line-clamp-1">
                    {car.make} {car.model}
                  </h3>

                  <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                    {car.description}
                  </p>

                  {/* Specs */}
                  <div className="grid grid-cols-3 gap-1.5 py-3 my-3 border-y border-slate-100 text-xs text-slate-600 font-medium">
                    <div className="flex items-center gap-1">
                      <Gauge className="w-3.5 h-3.5 text-slate-400" />
                      <span className="truncate">{car.transmission}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-slate-400" />
                      <span>{car.seats} Seats</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Fuel className="w-3.5 h-3.5 text-slate-400" />
                      <span>Diesel</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Pricing & Link */}
              <div className="px-5 pb-5 pt-2 flex items-center justify-between border-t border-slate-100 bg-slate-50/50">
                <div>
                  <div className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">
                    Daily Price
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-lg font-bold text-zinc-900">
                      {formatETB(car.pricePerDay)}
                    </span>
                    <span className="text-[10px] text-slate-400 font-normal">
                      /day
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400">
                    ~{formatUSD(car.pricePerDay)}/day
                  </div>
                </div>

                <Link
                  href={`/cars/${car.id}`}
                  className="flex items-center gap-1 bg-zinc-900 hover:bg-sky-600 text-white text-xs font-semibold px-3.5 py-2 rounded-xl transition-all active:scale-95 shadow-sm"
                >
                  <span>View</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* View All CTA */}
        <div className="text-center mt-12">
          <Link
            href="/cars"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-zinc-900 hover:bg-sky-600 text-white text-sm font-bold transition-all active:scale-95 shadow-lg"
          >
            <Sparkles className="w-4 h-4" />
            <span>View Full Fleet Catalogue</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
