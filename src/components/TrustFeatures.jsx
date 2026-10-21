"use client";

export default function TrustFeatures() {
  const features = [
    {
      icon: "🛡️",
      title: "100% Comprehensive Coverage",
      description: "Underwritten by Nyala Insurance S.C. Full collision, third-party liability, and theft protection included in every quoted rate.",
      tag: "Zero Host Liability",
    },
    {
      icon: "🪪",
      title: "Government ID & Libre Vetted",
      description: "Hosts submit verified Kebele IDs or passports alongside official vehicle ownership certificates (Libre) before listing.",
      tag: "Verified Ownership",
    },
    {
      icon: "🚨",
      title: "24/7 Addis Roadside Rescue",
      description: "Flat tire or engine trouble? Our dedicated rapid-dispatch patrol arrives within 30 minutes across all Addis sub-cities.",
      tag: "Hotline 8890",
    },
    {
      icon: "🔒",
      title: "Telebirr & CBE Escrow Protection",
      description: "Rental fees remain safely held in platform escrow until vehicle keys are in your hand and condition is inspected.",
      tag: "NBE Regulated",
    },
  ];

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 border-t border-gray-800">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
        <p className="text-emerald-400 text-xs font-bold uppercase tracking-widest">
          Uncompromised Security
        </p>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
          Why rent with Sheggar Wheels?
        </h2>
        <p className="text-xs text-gray-400">
          Every reservation is backed by industry-first digital safeguards built specifically for the Ethiopian mobility ecosystem.
        </p>
      </div>

      {/* 4 Card Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {features.map((feature, idx) => (
          <div
            key={idx}
            className="bg-[#131d2e] border border-gray-800 rounded-2xl p-5 space-y-3 flex flex-col justify-between hover:border-gray-700 transition"
          >
            <div className="space-y-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 text-lg">
                {feature.icon}
              </div>
              <h3 className="font-bold text-sm text-white">
                {feature.title}
              </h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                {feature.description}
              </p>
            </div>

            <div className="pt-2">
              <span className="text-[10px] text-emerald-400 font-semibold bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20 inline-block">
                ✓ {feature.tag}
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}