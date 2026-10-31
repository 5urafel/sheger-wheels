"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import {
  Car,
  Play,
  Pause,
  RotateCcw,
  Navigation,
  Compass,
  Gauge,
  MapPin,
  Clock,
  ShieldAlert,
  CheckCircle2,
} from "lucide-react";

const TRIP_WAYPOINTS = [
  { name: "Bole International Airport (Terminal 2)", coords: "8.995° N, 38.789° E", progress: 0, speed: 30, street: "Airport Exit Road" },
  { name: "Bole Medhanialem Cathedral", coords: "9.000° N, 38.785° E", progress: 25, speed: 45, street: "Cameroon Street" },
  { name: "Meskel Square Hub", coords: "9.011° N, 38.761° E", progress: 50, speed: 35, street: "Africa Avenue" },
  { name: "Kazanchis Executive District", coords: "9.019° N, 38.766° E", progress: 75, speed: 52, street: "Menelik II Avenue" },
  { name: "Piassa Cultural Square", coords: "9.034° N, 38.752° E", progress: 100, speed: 20, street: "Churchill Avenue" },
];

export function GsapTripTracker({ booking }) {
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentWaypointIndex, setCurrentWaypointIndex] = useState(0);
  const [speed, setSpeed] = useState(38);
  const [distanceKm, setDistanceKm] = useState(2.4);

  const trackerRef = useRef(null);
  const carMarkerRef = useRef(null);
  const progressPathRef = useRef(null);
  const timelineRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Create GSAP Timeline for vehicle route progress
      const tl = gsap.timeline({
        repeat: -1,
        paused: !isPlaying,
        onUpdate: () => {
          const prog = tl.progress();
          const wpIdx = Math.min(
            TRIP_WAYPOINTS.length - 1,
            Math.floor(prog * TRIP_WAYPOINTS.length)
          );
          setCurrentWaypointIndex(wpIdx);
          setDistanceKm(Number((prog * 11.2).toFixed(1)));
          // Vary speed dynamically based on progress
          const dynamicSpeed = Math.round(
            TRIP_WAYPOINTS[wpIdx].speed + Math.sin(prog * 20) * 8
          );
          setSpeed(dynamicSpeed);
        },
      });

      // Animate along route path
      tl.to(carMarkerRef.current, {
        x: "480px",
        duration: 12,
        ease: "none",
      });

      timelineRef.current = tl;
    }, trackerRef);

    return () => ctx.revert();
  }, []);

  const togglePlay = () => {
    if (timelineRef.current) {
      if (isPlaying) {
        timelineRef.current.pause();
      } else {
        timelineRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleRestart = () => {
    if (timelineRef.current) {
      timelineRef.current.restart();
      setIsPlaying(true);
    }
  };

  const currentWp = TRIP_WAYPOINTS[currentWaypointIndex];

  return (
    <div
      ref={trackerRef}
      className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xl space-y-6"
    >
      {/* Tracker Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              Active Trip Simulation
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
              GSAP Motion Engine
            </span>
          </div>
          <h2 className="font-display text-2xl font-bold text-zinc-900 mt-2">
            Live Addis Route Telemetry
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Simulated transit between Bole Airport and Central Addis Ababa.
          </p>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={togglePlay}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-zinc-900 hover:bg-sky-600 text-white text-xs font-bold shadow-sm transition-all active:scale-95 cursor-pointer"
          >
            {isPlaying ? (
              <>
                <Pause className="w-3.5 h-3.5" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Resume</span>
              </>
            )}
          </button>

          <button
            onClick={handleRestart}
            className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
            title="Restart route simulation"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Live Telemetry KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider">
              Speed
            </span>
            <Gauge className="w-3.5 h-3.5 text-sky-600" />
          </div>
          <div className="text-xl font-black text-zinc-900 font-mono">
            {speed} <span className="text-xs font-normal text-slate-500">km/h</span>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider">
              Distance
            </span>
            <Navigation className="w-3.5 h-3.5 text-amber-500" />
          </div>
          <div className="text-xl font-black text-zinc-900 font-mono">
            {distanceKm} <span className="text-xs font-normal text-slate-500">/ 11.2 km</span>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider">
              Current Road
            </span>
            <Compass className="w-3.5 h-3.5 text-purple-600" />
          </div>
          <div className="text-xs font-bold text-zinc-900 truncate">
            {currentWp.street}
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider">
              Est. Arrival
            </span>
            <Clock className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <div className="text-xl font-black text-zinc-900 font-mono">
            {Math.max(1, Math.round(18 - (distanceKm / 11.2) * 18))} <span className="text-xs font-normal text-slate-500">mins</span>
          </div>
        </div>
      </div>

      {/* Interactive Animated Route Corridor */}
      <div className="p-6 rounded-2xl bg-zinc-950 text-white relative overflow-hidden shadow-inner">
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-sky-400" />
            Route Corridor: Bole Airport ➔ Piassa Historic Hub
          </span>
          <span className="text-[10px] font-black uppercase tracking-wider bg-white/10 text-amber-300 px-2 py-0.5 rounded-full">
            Simulation
          </span>
        </div>

        {/* Route Track with Animated Moving Car */}
        <div className="relative h-16 flex items-center my-4 overflow-hidden px-4">
          {/* Background track line */}
          <div className="absolute left-4 right-4 h-2 bg-zinc-800 rounded-full" />
          {/* Active progress track */}
          <div
            ref={progressPathRef}
            className="absolute left-4 h-2 bg-gradient-to-r from-sky-500 to-amber-400 rounded-full transition-all duration-300"
            style={{ width: `${(distanceKm / 11.2) * 92}%` }}
          />

          {/* GSAP Animated Car Marker */}
          <div
            ref={carMarkerRef}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-amber-400 text-zinc-950 flex items-center justify-center shadow-glow font-bold z-10 transition-transform"
          >
            <Car className="w-5 h-5" />
          </div>
        </div>

        {/* Waypoint Markers */}
        <div className="grid grid-cols-5 gap-1 text-center pt-2 border-t border-zinc-800 text-[10px]">
          {TRIP_WAYPOINTS.map((wp, idx) => (
            <div
              key={idx}
              className={`p-1.5 rounded-lg transition-colors ${
                currentWaypointIndex === idx
                  ? "bg-sky-500/20 text-sky-300 font-bold border border-sky-500/30"
                  : idx < currentWaypointIndex
                  ? "text-slate-500"
                  : "text-slate-600"
              }`}
            >
              <div className="truncate font-semibold">{wp.name.split(" ")[0]}</div>
              <div className="text-[9px] opacity-75">{wp.speed} km/h</div>
            </div>
          ))}
        </div>
      </div>

      {/* Safety Notice per Section 12 */}
      <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2.5">
        <ShieldAlert className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong>Notice:</strong> Vehicle coordinates and route progress are seeded sample points. In compliance with the project brief, no real GPS tracking hardware is active.
        </p>
      </div>
    </div>
  );
}
