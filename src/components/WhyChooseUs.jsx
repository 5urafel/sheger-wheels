import { Plane, ShieldCheck, Headphones, KeyRound } from "lucide-react";

const FEATURES = [
  {
    icon: Plane,
    title: "Free Airport Delivery",
    desc: "Step off your flight at Bole International Airport and into your pristine vehicle within minutes at no extra charge.",
  },
  {
    icon: ShieldCheck,
    title: "Comprehensive Insurance",
    desc: "Full collision and third-party protection designed specifically for peace of mind across Addis and regional expressways.",
  },
  {
    icon: Headphones,
    title: "24/7 Highway Assistance",
    desc: "Dedicated roadside response mechanics available around the clock throughout Addis Ababa and major routes to Bishoftu, Adama, and Hawassa.",
  },
  {
    icon: KeyRound,
    title: "Zero Hidden Fees",
    desc: "Clear upfront daily rates with no surprises. Simple digital payments via Telebirr, CBE Birr, or International Credit Cards.",
  },
];

export function WhyChooseUs() {
  return (
    <section id="why-us" className="py-24 bg-white border-y border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-wider text-sky-600 bg-sky-50 px-3.5 py-1.5 rounded-full border border-sky-100">
            Why Addis Wheels
          </span>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-zinc-900 mt-4 leading-tight">
            The Gold Standard in Ethiopian Car Rentals
          </h2>
          <p className="mt-4 text-slate-600 text-sm sm:text-base leading-relaxed">
            We eliminate the hassle of traditional car rentals with transparent pricing, airport handovers, and dedicated support.
          </p>
        </div>

        {/* 4-Column Feature Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {FEATURES.map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={index}
                className="p-6 rounded-2xl bg-slate-50 hover:bg-slate-100/80 transition-all duration-300 border border-slate-100 hover:border-slate-200 group flex flex-col justify-between"
              >
                <div>
                  <div className="w-12 h-12 rounded-xl bg-sky-500/10 text-sky-600 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-sky-600 group-hover:text-white transition-all duration-200">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-zinc-900 mb-2">
                    {item.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                    {item.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
