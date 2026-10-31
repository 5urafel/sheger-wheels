import { ArrowRight, Tag } from "lucide-react";

const PROMOTIONS = [
  {
    id: 1,
    title: "Bishoftu Weekend Escape",
    discount: "20% OFF",
    desc: "Rent any SUV for 3+ days and enjoy special weekend discount rates plus free mileage for lake resorts.",
    expiry: "Expires Sunday",
    image: "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 2,
    title: "Chauffeur Executive Package",
    discount: "15% OFF",
    desc: "Professional English-speaking drivers for international delegates, AU summits, and business conferences.",
    expiry: "Valid all month",
    image: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 3,
    title: "Long-Term Monthly Lease",
    discount: "30% OFF",
    desc: "Special discounted corporate rates for NGOs, embassies, and extended project teams across Ethiopia.",
    expiry: "Limited slots",
    image: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80",
  },
];

export function Offers() {
  return (
    <section id="offers" className="py-24 bg-slate-50 border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-sky-600 bg-sky-50 px-3.5 py-1.5 rounded-full border border-sky-100">
              Limited-Time Promotions
            </span>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-zinc-900 mt-4 leading-tight">
              Exclusive Rental Packages
            </h2>
            <p className="mt-2 text-slate-600 text-sm sm:text-base">
              Take advantage of our curated packages to get the best value for your upcoming road trip or project.
            </p>
          </div>
          <a
            href="#booking-widget"
            className="mt-4 md:mt-0 inline-flex items-center gap-1.5 text-sm font-bold text-sky-600 hover:text-sky-700 transition-colors group cursor-pointer"
          >
            <span>Browse All Promo Rates</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </a>
        </div>

        {/* 3-Column Promo Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {PROMOTIONS.map((promo) => (
            <div
              key={promo.id}
              className="relative rounded-3xl overflow-hidden min-h-[360px] flex flex-col justify-between p-6 sm:p-7 text-white group shadow-card hover:shadow-card-hover transition-all duration-300"
            >
              {/* Image Background */}
              <div
                className="absolute inset-0 bg-cover bg-center group-hover:scale-105 transition-transform duration-700"
                style={{ backgroundImage: `url(${promo.image})` }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/60 to-zinc-950/20" />

              {/* Discount Tag */}
              <div className="relative z-10 flex items-center gap-1.5 bg-amber-500 text-zinc-950 text-xs font-black px-3 py-1 rounded-full w-fit shadow-md">
                <Tag className="w-3.5 h-3.5" />
                <span>{promo.discount}</span>
              </div>

              {/* Text Body */}
              <div className="relative z-10 mt-auto">
                <h3 className="font-display text-2xl font-bold leading-snug">
                  {promo.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 mt-2 line-clamp-2 leading-relaxed">
                  {promo.desc}
                </p>
                <div className="mt-4 pt-4 border-t border-white/20 flex items-center justify-between text-xs">
                  <span className="text-amber-300 font-semibold">{promo.expiry}</span>
                  <a
                    href="#booking-widget"
                    className="flex items-center gap-1.5 font-bold text-white group-hover:text-amber-400 transition-colors"
                  >
                    <span>Claim Offer</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
