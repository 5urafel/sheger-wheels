import { Star, Quote, CheckCircle2, Car } from "lucide-react";

const REVIEWS = [
  {
    name: "Dr. Henok Tadesse",
    role: "NGO Field Coordinator, Bole",
    comment:
      "Renting the Land Cruiser Prado for our field assessment across Hawassa was completely seamless. The vehicle was delivered to Bole Airport right on time, spotless and in immaculate mechanical condition.",
    rating: 5,
    vehicle: "Toyota Prado TXL",
  },
  {
    name: "Sarah Jenkins",
    role: "International Traveler, UK",
    comment:
      "First time visiting Ethiopia. The driver they assigned was courteous, spoke fluent English, and navigated Addis Ababa traffic effortlessly. Will definitely book with Addis Wheels every time I return.",
    rating: 5,
    vehicle: "Hyundai Tucson (Chauffeur)",
  },
  {
    name: "Alemayehu Bekele",
    role: "Tech Entrepreneur",
    comment:
      "Fair and transparent pricing with no ridiculous deposit demands. Booking online and paying with Telebirr made this the smoothest car rental experience I have had in Addis.",
    rating: 5,
    vehicle: "Suzuki Dzire Sedan",
  },
];

export function Testimonials() {
  return (
    <section id="testimonials" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-wider text-sky-600 bg-sky-50 px-3.5 py-1.5 rounded-full border border-sky-100">
            Client Stories
          </span>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-zinc-900 mt-4 leading-tight">
            Trusted by Travelers, Diplomats & Locals
          </h2>
          <p className="mt-4 text-slate-600 text-sm sm:text-base leading-relaxed">
            Read firsthand experiences from travelers who explored Ethiopia behind the wheel of our vehicles.
          </p>
        </div>

        {/* 3-Column Reviews Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {REVIEWS.map((rev, idx) => (
            <div
              key={idx}
              className="p-7 rounded-3xl bg-slate-50 border border-slate-200/80 shadow-sm hover:shadow-card transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                {/* Star Ratings */}
                <div className="flex items-center gap-1 mb-4">
                  {Array.from({ length: rev.rating }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>

                <Quote className="w-8 h-8 text-sky-600/20 mb-3" />
                <p className="text-slate-700 text-sm sm:text-base leading-relaxed italic">
                  "{rev.comment}"
                </p>
              </div>

              {/* Renter Profile & Car Badge */}
              <div className="mt-8 pt-4 border-t border-slate-200">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h4 className="font-bold text-sm text-zinc-900">{rev.name}</h4>
                    <p className="text-xs text-slate-500">{rev.role}</p>
                  </div>
                  <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Verified</span>
                  </div>
                </div>

                <div className="inline-flex items-center gap-1 text-[11px] text-slate-500 font-medium bg-white px-2.5 py-1 rounded-lg border border-slate-200">
                  <Car className="w-3 h-3 text-sky-600" />
                  <span>Rented: {rev.vehicle}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
