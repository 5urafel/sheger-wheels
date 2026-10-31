"use client";

import { useState } from "react";
import { Send, Sparkles } from "lucide-react";

export function CTA() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail("");
    }
  };

  return (
    <section className="py-20 bg-slate-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl bg-zinc-950 text-white p-8 sm:p-14 md:p-16 overflow-hidden shadow-2xl text-center flex flex-col items-center">
          {/* Subtle Ambient Radial Glows */}
          <div className="absolute -top-20 -right-20 w-80 h-80 bg-sky-600/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

          {/* Eyebrow */}
          <span className="relative z-10 inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-amber-400 bg-white/5 border border-white/10 px-3.5 py-1 rounded-full">
            <Sparkles className="w-3.5 h-3.5" />
            Seasonal Rates & Updates
          </span>

          {/* Headline */}
          <h2 className="relative z-10 font-display text-3xl sm:text-5xl font-bold mt-4 max-w-2xl leading-tight">
            Ready to Explore Ethiopia on Your Own Terms?
          </h2>

          <p className="relative z-10 text-slate-300 text-sm sm:text-base max-w-xl mt-4 font-light leading-relaxed">
            Subscribe to receive exclusive off-peak rental rates, newly added luxury safari vehicles, and curated road trip guides.
          </p>

          {/* Subscription Form */}
          <form
            onSubmit={handleSubmit}
            className="relative z-10 mt-8 w-full max-w-md flex flex-col sm:flex-row gap-3"
          >
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
              required
              className="flex-1 bg-white/10 border border-white/20 rounded-xl px-4 py-3.5 text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400 transition-all font-medium"
            />
            <button
              type="submit"
              className="px-6 py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg cursor-pointer"
            >
              <span>{subscribed ? "Subscribed!" : "Subscribe"}</span>
              <Send className="w-4 h-4" />
            </button>
          </form>


        </div>
      </div>
    </section>
  );
}
