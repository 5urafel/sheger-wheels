"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { Gauge, ShieldCheck, Award, Zap, Sparkles } from "lucide-react";

export function GsapHeroEffects() {
  const containerRef = useRef(null);
  const counterTripsRef = useRef(null);
  const counterRatingRef = useRef(null);
  const counterFleetRef = useRef(null);
  const needleRef = useRef(null);
  const speedValRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // 1. Staggered reveal of stats cards
      gsap.from(".gsap-stat-card", {
        y: 40,
        opacity: 0,
        duration: 0.8,
        stagger: 0.15,
        ease: "back.out(1.7)",
      });

      // 2. Rolling counter numbers
      const stats = { trips: 0, rating: 0, fleet: 0, speed: 0 };

      gsap.to(stats, {
        trips: 580,
        fleet: 24,
        duration: 2.2,
        ease: "power2.out",
        onUpdate: () => {
          if (counterTripsRef.current) {
            counterTripsRef.current.innerText = `${Math.floor(stats.trips)}+`;
          }
          if (counterFleetRef.current) {
            counterFleetRef.current.innerText = `${Math.floor(stats.fleet)}+`;
          }
        },
      });

      gsap.to(stats, {
        rating: 4.9,
        duration: 2,
        ease: "power1.out",
        onUpdate: () => {
          if (counterRatingRef.current) {
            counterRatingRef.current.innerText = stats.rating.toFixed(1);
          }
        },
      });

      // 3. Interactive Speedometer Needle Rev-up
      const needleTl = gsap.timeline({ repeat: -1, yoyo: true, repeatDelay: 1.5 });
      needleTl
        .to(needleRef.current, {
          rotation: 85,
          duration: 1.4,
          ease: "elastic.out(1, 0.4)",
          transformOrigin: "bottom center",
          onUpdate: function () {
            const rot = gsap.getProperty(needleRef.current, "rotation") || 0;
            const currentSpeed = Math.round((rot / 120) * 160);
            if (speedValRef.current) {
              speedValRef.current.innerText = `${Math.max(0, currentSpeed)} km/h`;
            }
          },
        })
        .to(needleRef.current, {
          rotation: 45,
          duration: 1.8,
          ease: "power2.inOut",
        });

      // 4. Subtle continuous floating badge
      gsap.to(".gsap-floating-badge", {
        y: -6,
        duration: 2.5,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="w-full max-w-5xl mx-auto mt-8 px-4">
      {/* 4 Staggered Telemetry Stat Cards with GSAP Animated Counters */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Card 1: Completed Trips */}
        <div className="gsap-stat-card bg-zinc-900/80 backdrop-blur-md border border-white/10 rounded-2xl p-4 text-left shadow-lg hover:border-sky-500/50 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Completed Trips
            </span>
            <div className="w-7 h-7 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <div
            ref={counterTripsRef}
            className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight"
          >
            0+
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            Across Bole, Piassa & Oromia
          </div>
        </div>

        {/* Card 2: Average Rating */}
        <div className="gsap-stat-card bg-zinc-900/80 backdrop-blur-md border border-white/10 rounded-2xl p-4 text-left shadow-lg hover:border-amber-500/50 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Renter Rating
            </span>
            <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-1">
            <span
              ref={counterRatingRef}
              className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight"
            >
              0.0
            </span>
            <span className="text-amber-400 font-bold text-sm">★ / 5.0</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            100% verified renter reviews
          </div>
        </div>

        {/* Card 3: Verified Fleet */}
        <div className="gsap-stat-card bg-zinc-900/80 backdrop-blur-md border border-white/10 rounded-2xl p-4 text-left shadow-lg hover:border-emerald-500/50 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Verified Vehicles
            </span>
            <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div
            ref={counterFleetRef}
            className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight"
          >
            0+
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            4x4s, VIP Vans, Electric EVs
          </div>
        </div>

        {/* Card 4: Live GSAP Dynamic Speedometer Widget */}
        <div className="gsap-stat-card bg-zinc-900/80 backdrop-blur-md border border-white/10 rounded-2xl p-4 text-left shadow-lg relative overflow-hidden group hover:border-amber-400/50 transition-colors">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              GSAP Telemetry
            </span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          </div>

          <div className="flex items-center gap-3 mt-1">
            {/* Speedometer Gauge Visual */}
            <div className="relative w-12 h-10 flex items-end justify-center">
              {/* Semi-circle arc */}
              <div className="w-12 h-6 border-t-2 border-x-2 border-slate-600 rounded-t-full relative">
                <div
                  ref={needleRef}
                  className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0.5 h-5 bg-amber-400 origin-bottom"
                  style={{ transform: "rotate(-40deg)" }}
                />
              </div>
            </div>

            <div>
              <div
                ref={speedValRef}
                className="text-xl sm:text-2xl font-black text-amber-300 font-mono tracking-tight"
              >
                0 km/h
              </div>
              <div className="text-[9px] text-slate-400 uppercase tracking-widest font-semibold">
                Live Acceleration
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
