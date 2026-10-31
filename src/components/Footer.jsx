import Link from "next/link";
import { Car, MapPin, Mail, ShieldCheck } from "lucide-react";

export function Footer() {
  return (
    <footer id="locations" className="bg-zinc-950 text-slate-400 text-xs sm:text-sm border-t border-zinc-900 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Column 1: Brand Info & Simulation Tag */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-600 to-amber-500 flex items-center justify-center text-white font-bold group-hover:scale-105 transition-transform">
                <Car className="w-5 h-5" />
              </div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xl text-white tracking-tight">
                  SHEGGAR<span className="text-amber-500">WHEELS</span>
                </span>
                <span className="text-[9px] font-black uppercase tracking-wider bg-amber-400 text-zinc-950 px-1.5 py-0.5 rounded font-mono">
                  DEMO DATA
                </span>
              </div>
            </Link>

            <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
              Addis Ababa&apos;s peer-to-peer car rental marketplace. Connects verified local car hosts with travelers, executives, and residents seeking dependable 4x4s, sedans, and vans.
            </p>

            <div className="p-3 rounded-2xl bg-zinc-900 border border-zinc-800 text-[11px] text-slate-400 max-w-sm leading-relaxed">
              <strong className="text-amber-400 block mb-0.5">Capstone Portfolio Demo:</strong>
              This application operates entirely in browser storage (<code className="text-sky-300 font-mono">localStorage</code> & <code className="text-sky-300 font-mono">sessionStorage</code>). All bookings, reviews, coordinates, and TeleBirr transactions are simulated.
            </div>
          </div>

          {/* Column 2: Portals & Roles */}
          <div className="space-y-3">
            <h4 className="font-bold text-white tracking-wider uppercase text-xs">
              Platform Portals
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/cars" className="hover:text-amber-400 transition-colors">
                  Fleet Catalogue
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-amber-400 transition-colors">
                  Renter Dashboard
                </Link>
              </li>
              <li>
                <Link href="/owner" className="hover:text-amber-400 transition-colors">
                  Car Host Portal
                </Link>
              </li>
              <li>
                <Link href="/admin" className="hover:text-amber-400 transition-colors">
                  Admin Command Center
                </Link>
              </li>
              <li>
                <Link href="/signin" className="hover:text-amber-400 transition-colors">
                  Persona Switcher
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Regional Hubs in Addis Ababa */}
          <div className="space-y-3">
            <h4 className="font-bold text-white tracking-wider uppercase text-xs">
              Addis Rental Hubs
            </h4>
            <ul className="space-y-2 text-xs">
              <li className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                <span>Bole International Airport (Hub)</span>
              </li>
              <li className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                <span>Kazanchis UNECA District</span>
              </li>
              <li className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                <span>Piassa Historic Center</span>
              </li>
              <li className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                <span>Meskel Square Central Hub</span>
              </li>
              <li className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                <span>Sarbet / Old Airport</span>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="font-bold text-white tracking-wider uppercase text-xs">
              Contact Us
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <a
                  href="mailto:contact@sheggarwheels.et"
                  className="flex items-center gap-2 hover:text-white transition-colors"
                >
                  <Mail className="w-4 h-4 text-sky-500 flex-shrink-0" />
                  <span>contact@sheggarwheels.et</span>
                </a>
              </li>
              <li className="text-[11px] text-slate-500 pt-1 leading-relaxed">
                Emergency roadside assistance and airport key handover available 24 hours daily.
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-14 pt-8 border-t border-zinc-900 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© 2026 Sheggar Wheels (Addis Wheels P2P). Frontend Capstone Portfolio.</p>
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1 text-[11px] text-slate-400">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> Fully Insured Demo Fleet
            </span>
            <Link href="/signin" className="hover:text-slate-300 transition-colors">
              Demo Switcher
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
