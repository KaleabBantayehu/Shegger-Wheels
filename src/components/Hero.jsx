import SearchWidget from "./SearchWidget";

export default function Hero() {
  return (
    <section className="relative">
      {/* Dark Hero Container */}
      <div className="bg-[#0b1320] text-white pt-16 pb-20 px-4 sm:px-6 lg:px-8 text-center border-b border-gray-800">
        <div className="max-w-4xl mx-auto space-y-5">
          
          {/* Top Pill Badge */}
          <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-medium px-3 py-1 rounded-full">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Ethiopia&#39;s First National Peer-to-Peer Mobility Network
          </div>

          {/* Main Title */}
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
            Rent unique cars from trusted <br className="hidden sm:inline" />
            local hosts in <span className="text-emerald-400">Addis Ababa</span>
          </h1>

          {/* Description */}
          <p className="text-gray-400 text-xs sm:text-sm max-w-2xl mx-auto leading-relaxed">
            Skip the traditional rental counter. From Land Cruisers for Rift Valley getaways to fuel-efficient Corollas and executive sedans in Bole and Kazanchis[cite: 1].
          </p>

          {/* 4 Stats Cards Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-6 max-w-3xl mx-auto">
            <div className="bg-gray-900/60 border border-gray-800 p-3 rounded-xl text-left">
              <p className="text-emerald-400 font-extrabold text-lg">140+</p>
              <p className="text-gray-400 text-[10px]">Verified Host Vehicles</p>
            </div>
            <div className="bg-gray-900/60 border border-gray-800 p-3 rounded-xl text-left">
              <p className="text-emerald-400 font-extrabold text-lg">100%</p>
              <p className="text-gray-400 text-[10px]">Comprehensive Insurance</p>
            </div>
            <div className="bg-gray-900/60 border border-gray-800 p-3 rounded-xl text-left">
              <p className="text-emerald-400 font-extrabold text-lg">4.92 ★</p>
              <p className="text-gray-400 text-[10px]">Average Host Rating</p>
            </div>
            <div className="bg-gray-900/60 border border-gray-800 p-3 rounded-xl text-left">
              <p className="text-emerald-400 font-extrabold text-lg">Instant</p>
              <p className="text-gray-400 text-[10px]">Instant & Host Sanction</p>
            </div>
          </div>

        </div>
      </div>

      {/* Floating Search Bar */}
      <SearchWidget />
    </section>
  );
}