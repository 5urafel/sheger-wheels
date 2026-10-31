"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Car,
  Menu,
  X,
  User,
  Shield,
  Key,
  LogOut,
  ChevronDown,
  Sparkles,
  Compass,
  RotateCcw,
  CheckCircle2,
  Calendar,
  Star,
  Tag,
  MessageSquareQuote,
} from "lucide-react";
import {
  getCurrentSession,
  getCurrentUser,
  signInAsDemo,
  signOut,
} from "@/lib/auth";
import { INITIAL_USERS, resetDemoData } from "@/lib/storage";



export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [navDropdownOpen, setNavDropdownOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const pathname = usePathname();
  const navDropdownRef = useRef(null);

  // Re-read active session on mount and upon session events
  useEffect(() => {
    const updateSession = () => {
      setCurrentUser(getCurrentUser());
    };
    updateSession();

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    handleScroll();

    window.addEventListener("scroll", handleScroll);
    window.addEventListener("sw_session_update", updateSession);
    window.addEventListener("sw_storage_update", updateSession);
    window.addEventListener("storage", updateSession);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("sw_session_update", updateSession);
      window.removeEventListener("sw_storage_update", updateSession);
      window.removeEventListener("storage", updateSession);
    };
  }, []);

  // Close dropdown on outside click or navigation
  useEffect(() => {
    setUserDropdownOpen(false);
    setMobileMenuOpen(false);
  }, [pathname]);

  // Close nav dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (navDropdownRef.current && !navDropdownRef.current.contains(e.target)) {
        setNavDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSwitchDemo = (userId, role = null) => {
    signInAsDemo(userId, role);
    setUserDropdownOpen(false);
    setMobileMenuOpen(false);
  };

  const handleSignOut = () => {
    signOut();
    setUserDropdownOpen(false);
    setMobileMenuOpen(false);
  };

  const handleResetData = () => {
    if (confirm("Reset all browser localStorage data back to original demo seeds?")) {
      resetDemoData();
      setUserDropdownOpen(false);
      window.location.reload();
    }
  };

  // Dynamic Navigation Links based on Active Role
  const isOwnerActive = currentUser?.activeRole === "owner";
  const isAdminActive = currentUser?.activeRole === "admin";
  const isRenterActive = currentUser?.activeRole === "renter";

  const exploreLinks = [
    { name: "Our Fleet", href: "/#fleet", icon: Car, desc: "Featured vehicles on the homepage" },
    { name: "Why Sheggar", href: "/#why-us", icon: Sparkles, desc: "What makes us different" },
    { name: "Special Deals", href: "/#offers", icon: Tag, desc: "Seasonal rates & discounts" },
    { name: "Testimonials", href: "/#testimonials", icon: MessageSquareQuote, desc: "What our renters say" },
  ];

  return (
    <>

      <header
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
          isScrolled || pathname !== "/"
            ? "bg-white/95 backdrop-blur-md shadow-sm py-2.5 text-zinc-900 border-b border-slate-200/80"
            : "bg-transparent py-3.5 text-white"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* Brand Logo & Demo Tag */}
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-600 to-amber-500 flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform duration-200">
                <Car className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold tracking-tight text-lg leading-none">
                    SHEGGAR<span className="text-amber-500">WHEELS</span>
                  </span>
                  {/* Visible Demo Data Tag per Section 6.1 */}
                  <span className="text-[9px] font-black uppercase tracking-wider bg-amber-400 text-zinc-950 px-1.5 py-0.5 rounded font-mono shadow-xs">
                    DEMO DATA
                  </span>
                </div>
                <span
                  className={`text-[9px] tracking-widest uppercase font-semibold mt-0.5 ${
                    isScrolled || pathname !== "/"
                      ? "text-slate-500"
                      : "text-white/80"
                  }`}
                >
                  P2P Car Rental Addis Ababa
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-5 lg:gap-7">
            {/* Fleet Catalogue — standalone link */}
            <Link
              href="/cars"
              className={`text-xs font-semibold transition-colors hover:text-amber-500 relative group py-1 ${
                isScrolled || pathname !== "/"
                  ? "text-zinc-700"
                  : "text-white/95"
              }`}
            >
              Fleet Catalogue
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-amber-500 group-hover:w-full transition-all duration-300 rounded-full" />
            </Link>

            {/* Explore Dropdown */}
            <div className="relative" ref={navDropdownRef}>
              <button
                onClick={() => setNavDropdownOpen(!navDropdownOpen)}
                className={`flex items-center gap-1 text-xs font-semibold transition-colors hover:text-amber-500 py-1 cursor-pointer ${
                  isScrolled || pathname !== "/"
                    ? "text-zinc-700"
                    : "text-white/95"
                }`}
              >
                <Compass className="w-3.5 h-3.5" />
                <span>Explore</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${navDropdownOpen ? "rotate-180" : ""}`} />
              </button>

              {navDropdownOpen && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-3 w-72 bg-white rounded-2xl border border-slate-200 shadow-xl p-2 animate-in fade-in slide-in-from-top-2 duration-150 z-50">
                  {exploreLinks.map((link) => {
                    const Icon = link.icon;
                    return (
                      <Link
                        key={link.name}
                        href={link.href}
                        onClick={() => setNavDropdownOpen(false)}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 transition-colors group/item"
                      >
                        <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center flex-shrink-0 group-hover/item:bg-sky-100 transition-colors">
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-zinc-900">{link.name}</div>
                          <div className="text-[11px] text-slate-500">{link.desc}</div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Role-Specific Shortcuts */}
            {isRenterActive && (
              <div className="flex items-center gap-2">
                <Link
                  href="/dashboard"
                  className="text-xs font-bold px-3 py-1.5 rounded-lg bg-sky-50 text-sky-700 hover:bg-sky-100 border border-sky-200 transition-colors"
                >
                  Renter Dashboard
                </Link>
                <Link
                  href="/bookings"
                  className="text-xs font-semibold text-slate-600 hover:text-zinc-900"
                >
                  My Bookings
                </Link>
              </div>
            )}

            {isOwnerActive && (
              <div className="flex items-center gap-2">
                <Link
                  href="/owner"
                  className="text-xs font-bold px-3 py-1.5 rounded-lg bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200 transition-colors flex items-center gap-1"
                >
                  <Key className="w-3.5 h-3.5" />
                  Host Portal
                </Link>
                <Link
                  href="/owner/cars"
                  className="text-xs font-semibold text-slate-600 hover:text-zinc-900"
                >
                  My Fleet
                </Link>
                <Link
                  href="/owner/earnings"
                  className="text-xs font-semibold text-slate-600 hover:text-zinc-900"
                >
                  Earnings
                </Link>
              </div>
            )}

            {isAdminActive && (
              <div className="flex items-center gap-2">
                <Link
                  href="/admin"
                  className="text-xs font-bold px-3 py-1.5 rounded-lg bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200 transition-colors flex items-center gap-1"
                >
                  <Shield className="w-3.5 h-3.5" />
                  Admin Center
                </Link>
                <Link
                  href="/admin/listings"
                  className="text-xs font-semibold text-slate-600 hover:text-zinc-900"
                >
                  Listings
                </Link>
                <Link
                  href="/admin/disputes"
                  className="text-xs font-semibold text-slate-600 hover:text-zinc-900"
                >
                  Disputes
                </Link>
              </div>
            )}
          </nav>

          {/* Right Cluster: Sign In / Account */}
          <div className="hidden md:flex items-center gap-2.5">

            {!currentUser ? (
              /* Direct Sign In link when not logged in */
              <Link
                href="/signin"
                className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-xs font-bold transition-all ${
                  isScrolled || pathname !== "/"
                    ? "bg-zinc-900 text-white border-zinc-800 hover:bg-sky-600 shadow-sm"
                    : "bg-white/10 text-white border-white/20 hover:bg-white/20"
                }`}
              >
                <User className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </Link>
            ) : (
            /* Account Switcher Dropdown (only when signed in) */
            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl border bg-slate-900 text-white border-zinc-800 shadow-sm text-xs font-semibold transition-all cursor-pointer"
              >
                <div className="w-5 h-5 rounded-full bg-amber-500 text-zinc-950 flex items-center justify-center font-bold text-[10px]">
                  {currentUser.name.charAt(0)}
                </div>
                <span className="max-w-[130px] truncate">
                  {`${currentUser.name.split(" ")[0]} (${currentUser.activeRole})`}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {/* Dropdown Menu */}
              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-80 rounded-2xl bg-white text-zinc-900 shadow-2xl border border-slate-200 p-3 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-3 py-2 border-b border-slate-100 mb-2">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Switch Account
                    </div>
                    <div className="text-xs text-slate-600 mt-0.5">
                      Sign in as a different user:
                    </div>
                  </div>

                  <div className="space-y-1">
                    {/* Renter Persona */}
                    <button
                      onClick={() => handleSwitchDemo("user-renter-1", "renter")}
                      className={`w-full flex items-center justify-between p-2 rounded-xl text-left text-xs transition-colors cursor-pointer ${
                        currentUser?.id === "user-renter-1" &&
                        currentUser?.activeRole === "renter"
                          ? "bg-sky-50 text-sky-900 font-bold border border-sky-200"
                          : "hover:bg-slate-50 text-zinc-800"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-sky-500 text-white flex items-center justify-center font-bold text-[10px]">
                          A
                        </div>
                        <div>
                          <div className="font-semibold">Alemayehu Tadesse</div>
                          <div className="text-[10px] text-slate-400">
                            Renter Account
                          </div>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold text-sky-600 uppercase">
                        Renter
                      </span>
                    </button>

                    {/* Owner Persona */}
                    <button
                      onClick={() => handleSwitchDemo("user-owner-1", "owner")}
                      className={`w-full flex items-center justify-between p-2 rounded-xl text-left text-xs transition-colors cursor-pointer ${
                        currentUser?.id === "user-owner-1" &&
                        currentUser?.activeRole === "owner"
                          ? "bg-amber-50 text-amber-900 font-bold border border-amber-200"
                          : "hover:bg-slate-50 text-zinc-800"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-amber-500 text-zinc-950 flex items-center justify-center font-bold text-[10px]">
                          H
                        </div>
                        <div>
                          <div className="font-semibold">Dr. Henok Kebede</div>
                          <div className="text-[10px] text-slate-400">
                            Car Owner (Multi-fleet)
                          </div>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold text-amber-600 uppercase">
                        Owner
                      </span>
                    </button>

                    {/* Admin Persona */}
                    <button
                      onClick={() => handleSwitchDemo("user-admin-1", "admin")}
                      className={`w-full flex items-center justify-between p-2 rounded-xl text-left text-xs transition-colors cursor-pointer ${
                        currentUser?.id === "user-admin-1"
                          ? "bg-purple-50 text-purple-900 font-bold border border-purple-200"
                          : "hover:bg-slate-50 text-zinc-800"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold text-[10px]">
                          S
                        </div>
                        <div>
                          <div className="font-semibold">Selamawit Bekele</div>
                          <div className="text-[10px] text-slate-400">
                            Platform Super-Admin
                          </div>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold text-purple-600 uppercase">
                        Admin
                      </span>
                    </button>
                  </div>

                  {/* Development Utilities */}
                  <div className="mt-3 pt-2 border-t border-slate-100 space-y-2 text-xs">


                    <button
                      onClick={handleResetData}
                      className="w-full text-left font-semibold text-slate-500 hover:text-zinc-900 flex items-center gap-1.5 cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
                      <span>Reset Demo Seed Data</span>
                    </button>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                      <Link
                        href="/signin"
                        className="text-sky-600 hover:underline font-semibold"
                      >
                        Sign In Screen
                      </Link>
                      {currentUser && (
                        <button
                          onClick={handleSignOut}
                          className="text-rose-600 hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          <span>Sign Out</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={`md:hidden p-2 rounded-lg transition-colors ${
              isScrolled || pathname !== "/"
                ? "text-zinc-900 hover:bg-slate-100"
                : "text-white hover:bg-white/10"
            }`}
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white text-zinc-900 border-b border-slate-200 shadow-2xl px-6 py-6 flex flex-col gap-4 animate-in fade-in slide-in-from-top-4 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                {currentUser ? "Signed In As" : "Account"}
              </span>
              <span className="text-xs font-bold text-amber-600">
                {currentUser
                  ? `${currentUser.name} (${currentUser.activeRole})`
                  : "Not signed in"}
              </span>
            </div>

            {!currentUser ? (
              <Link
                href="/signin"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full py-2.5 rounded-xl bg-zinc-900 text-white font-bold text-xs text-center"
              >
                Sign In
              </Link>
            ) : (
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => handleSwitchDemo("user-renter-1", "renter")}
                className="py-2 rounded-lg bg-sky-50 text-sky-800 text-xs font-bold text-center border border-sky-200"
              >
                Renter
              </button>
              <button
                onClick={() => handleSwitchDemo("user-owner-1", "owner")}
                className="py-2 rounded-lg bg-amber-50 text-amber-800 text-xs font-bold text-center border border-amber-200"
              >
                Owner
              </button>
              <button
                onClick={() => handleSwitchDemo("user-admin-1", "admin")}
                className="py-2 rounded-lg bg-purple-50 text-purple-800 text-xs font-bold text-center border border-purple-200"
              >
                Admin
              </button>
            </div>
            )}

            <div className="flex flex-col gap-2 pt-2 border-t border-slate-100">
              <Link
                href="/cars"
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-bold py-1.5 text-zinc-900"
              >
                Fleet Catalogue
              </Link>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mt-2 mb-1">Explore</span>
              <Link
                href="/#fleet"
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-semibold py-1.5 text-zinc-800"
              >
                Our Fleet
              </Link>
              <Link
                href="/#why-us"
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-semibold py-1.5 text-zinc-800"
              >
                Why Sheggar
              </Link>
              <Link
                href="/#offers"
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-semibold py-1.5 text-zinc-800"
              >
                Special Deals
              </Link>
              <Link
                href="/#testimonials"
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-semibold py-1.5 text-zinc-800"
              >
                Testimonials
              </Link>
              {isRenterActive && (
                <Link
                  href="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-sm font-semibold py-1.5 text-sky-700"
                >
                  Renter Dashboard & Trips
                </Link>
              )}
              {isOwnerActive && (
                <Link
                  href="/owner"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-sm font-semibold py-1.5 text-amber-700"
                >
                  Owner Fleet & Earnings
                </Link>
              )}
              {isAdminActive && (
                <Link
                  href="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-sm font-semibold py-1.5 text-purple-700"
                >
                  Admin Moderator Center
                </Link>
              )}
            </div>


          </div>
        )}
      </header>


    </>
  );
}
