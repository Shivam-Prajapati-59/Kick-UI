import React from "react";

const TestStatsCard = () => {
  return (
    <section className="w-full px-6 py-20 bg-black">
      <div className="mx-auto max-w-7xl grid lg:grid-cols-2 gap-16 items-center">
        {/* Left Side */}
        <div className="space-y-8">
          <h1 className="text-5xl md:text-7xl font-light leading-[0.95]">
            <div>
              <span className="text-lime-300">Built</span> <span>To Be</span>
            </div>

            <div>
              <span>Your</span> <span className="text-lime-300">BackBone</span>
            </div>
          </h1>

          <p className="max-w-xl text-neutral-400 text-lg">
            Every chain, every token, out of the box. Integrate the entirety of
            crypto instantly, with fee share and real human support to aid in
            your integration.
          </p>

          <div className="flex flex-wrap gap-4">
            <button className="rounded-full bg-lime-300 px-6 py-3 text-black font-medium">
              Get Your API Key
            </button>

            <button className="rounded-full border border-white/20 px-6 py-3 font-medium hover:bg-white/5 transition-colors">
              Explore Docs
            </button>
          </div>
        </div>

        {/* Right Side */}
        <div className="grid grid-cols-3 gap-5 w-full">
          {/* Card 1 */}
          <div
            className="relative h-80 w-full border border-white/10 p-8 flex flex-col justify-between overflow-hidden"
            style={{
              background: "linear-gradient(359deg, #dce0d21a, #dce0d200)",
            }}
          >
            <h2 className="text-4xl font-bold text-lime-300 relative z-10">
              500+
            </h2>

            <div className="relative z-10">
              <p className="text-xl font-medium">Liquidity Pools</p>
            </div>
          </div>

          {/* Card 2 */}
          <div
            className="relative h-[320px] w-full border border-white/10 p-8 flex flex-col justify-between overflow-hidden"
            style={{
              background: "linear-gradient(359deg, #dce0d21a, #dce0d200)",
            }}
          >
            <h2 className="text-4xl font-bold relative z-10">200+</h2>

            <div className="relative z-10">
              <p className="text-xl font-medium">DeFi Ecosystems</p>
            </div>
          </div>

          {/* Card 3 */}
          <div
            className="relative h-[320px] w-full border border-white/10 p-8 flex flex-col justify-between overflow-hidden"
            style={{
              background: "linear-gradient(359deg, #dce0d21a, #dce0d200)",
            }}
          >
            <h2 className="text-4xl font-bold text-lime-300 relative z-10">
              $100B+
            </h2>

            <div className="relative z-10">
              <p className="text-xl font-medium">Token Support</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestStatsCard;
