export default function HomePage() {
  return (
    <>
    <div className="min-h-[calc(100vh-57px)] bg-[#0d0d0d] flex items-center overflow-hidden relative">
      {/* Background gradient glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[120px]" />
        <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-[100px]" />
      </div>

      <div className="max-w-7xl mx-auto px-6 w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center py-16 relative z-10">
        {/* Left: Text Content */}
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold leading-tight mb-6">
            <span className="text-blue-400">Paper Trading</span>
            <br />
            <span className="text-white">Practice and Perfect</span>
            <br />
            <span className="text-white">Your Trading Skills</span>
            <br />
            <span className="text-gray-300 text-2xl md:text-3xl font-bold">
              &amp; Investment Strategies
            </span>
            <br />
            <span className="text-white">with{" "}
              <span className="text-blue-400">ZERO</span>
            </span>
            <br />
            <span className="text-white">Risk.</span>
          </h1>

          <a
            href="/api/auth/login?post_login_redirect_url=/dashboard"
            className="inline-flex items-center gap-2 bg-transparent border-2 border-blue-400 text-blue-400 hover:bg-blue-400 hover:text-black font-bold px-8 py-4 rounded-lg text-base transition-all duration-200 mt-4"
          >
            Click Here to Start Practicing →
          </a>

          {/* Stats row */}
          <div className="flex gap-8 mt-12">
            {[
              { value: "$1,000,000", label: "Virtual Balance" },
              { value: "8+", label: "Live Stocks" },
              { value: "0%", label: "Risk" },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="text-2xl font-bold text-white">{stat.value}</p>
                <p className="text-sm text-gray-500">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Mock Trading UI Screenshot */}
        <div className="relative hidden lg:block">
          {/* Main dashboard mockup */}
          <div className="bg-[#1a1a2e] rounded-2xl border border-gray-700 shadow-2xl overflow-hidden">
            {/* Mockup top bar */}
            <div className="bg-[#16213e] px-4 py-2 flex items-center gap-2 border-b border-gray-700">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span className="ml-3 text-xs text-gray-400">VirtualTrade — Dashboard</span>
            </div>

            {/* Mockup content */}
            <div className="p-4">
              {/* Balance row */}
              <div className="flex gap-3 mb-4">
                {[
                  { label: "Balance", value: "$1,000,000", color: "text-green-400" },
                  { label: "Portfolio", value: "$24,350", color: "text-blue-400" },
                  { label: "P&L", value: "+$1,240", color: "text-green-400" },
                ].map((card) => (
                  <div key={card.label} className="flex-1 bg-[#0d0d0d] rounded-lg p-3 border border-gray-800">
                    <p className="text-xs text-gray-500 mb-1">{card.label}</p>
                    <p className={`text-sm font-bold ${card.color}`}>{card.value}</p>
                  </div>
                ))}
              </div>

              {/* Fake candlestick chart */}
              <div className="bg-[#0d0d0d] rounded-lg p-3 border border-gray-800 mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-white">AAPL</span>
                  <span className="text-xs text-green-400">+1.24%</span>
                </div>
                <div className="flex items-end gap-[3px] h-20">
                  {[40,55,45,60,50,65,55,70,60,75,65,58,72,68,80,72,85,78,90,82,88,76,92,85,95].map((h, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-[1px]">
                      <div
                        className={`w-full rounded-sm ${i % 3 === 0 ? "bg-red-500" : "bg-green-500"}`}
                        style={{ height: `${h}%` }}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Stock list */}
              <div className="space-y-2">
                {[
                  { sym: "AAPL", price: "182.63", chg: "+1.24%", up: true },
                  { sym: "TSLA", price: "248.50", chg: "-0.87%", up: false },
                  { sym: "NVDA", price: "495.22", chg: "+2.31%", up: true },
                  { sym: "MSFT", price: "378.91", chg: "+0.54%", up: true },
                ].map((s) => (
                  <div key={s.sym} className="flex items-center justify-between bg-[#0d0d0d] rounded-lg px-3 py-2 border border-gray-800">
                    <span className="text-xs font-bold text-white">{s.sym}</span>
                    <span className="text-xs text-gray-300">${s.price}</span>
                    <span className={`text-xs font-semibold ${s.up ? "text-green-400" : "text-red-400"}`}>{s.chg}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Floating mobile card */}
          <div className="absolute -bottom-6 -right-6 w-44 bg-[#1a1a2e] rounded-2xl border border-gray-700 shadow-2xl p-4">
            <p className="text-xs text-gray-400 mb-1">Portfolio Value</p>
            <p className="text-lg font-bold text-white">$98,111.47</p>
            <div className="flex gap-2 mt-2">
              <div className="flex-1 bg-[#0d0d0d] rounded p-1 text-center">
                <p className="text-[10px] text-gray-500">Stocks</p>
                <p className="text-xs font-bold text-blue-400">5</p>
              </div>
              <div className="flex-1 bg-[#0d0d0d] rounded p-1 text-center">
                <p className="text-[10px] text-gray-500">P&L</p>
                <p className="text-xs font-bold text-green-400">+0.30</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* Section 2 — "Paper Trading is for You" */}
    <div className="bg-[#f5f5f5] py-20 px-6">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

        {/* Left: Two phone mockups */}
        <div className="relative flex justify-center items-end gap-4 h-80">
          {/* Back phone (slightly behind) */}
          <div className="relative w-36 h-72 bg-white rounded-3xl border border-gray-300 shadow-xl overflow-hidden -mb-4 -mr-6 z-0">
            <div className="bg-gray-800 h-6 flex items-center justify-center">
              <div className="w-12 h-1 bg-gray-600 rounded-full" />
            </div>
            <div className="p-2 bg-[#1a1a2e] h-full">
              <p className="text-[8px] text-gray-400 mb-1">paper trade</p>
              <div className="space-y-1">
                {["SPY", "AAPL", "TSLA", "NVDA"].map((s) => (
                  <div key={s} className="flex justify-between bg-gray-800 rounded px-1 py-0.5">
                    <span className="text-[7px] text-white">{s}</span>
                    <span className="text-[7px] text-green-400">+1.2%</span>
                  </div>
                ))}
              </div>
              <div className="mt-2 bg-orange-500 rounded py-1 text-center">
                <span className="text-[7px] text-white font-bold">SUBMIT</span>
              </div>
            </div>
          </div>

          {/* Front phone (main) */}
          <div className="relative w-44 h-80 bg-white rounded-3xl border border-gray-200 shadow-2xl overflow-hidden z-10">
            <div className="bg-gray-100 h-7 flex items-center justify-between px-3">
              <span className="text-[8px] text-gray-500">9:41</span>
              <div className="w-16 h-1.5 bg-gray-300 rounded-full" />
            </div>
            <div className="p-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[9px] text-blue-500 font-bold">paper Trade</span>
                <span className="text-[8px] text-blue-400">Refuel</span>
              </div>
              <p className="text-xs text-gray-400 mb-0.5">Paper Account Value</p>
              <p className="text-xl font-bold text-gray-900">$100,000.00</p>
              <div className="flex gap-3 mt-1 mb-2">
                <div>
                  <p className="text-[7px] text-gray-400">Open P&L</p>
                  <p className="text-[8px] text-red-500">-$0.00 0.00%</p>
                </div>
                <div>
                  <p className="text-[7px] text-gray-400">Buying Power</p>
                  <p className="text-[8px] text-gray-700">100,000.00</p>
                </div>
                <div>
                  <p className="text-[7px] text-gray-400">Today P&L</p>
                  <p className="text-[8px] text-gray-700">$0.00</p>
                </div>
              </div>
              {/* Nav icons */}
              <div className="flex justify-around mb-2">
                {["📊","🔍","📈","⚙️"].map((icon, i) => (
                  <div key={i} className="w-6 h-6 bg-blue-50 rounded-full flex items-center justify-center text-[10px]">{icon}</div>
                ))}
              </div>
              {/* Positions */}
              <div className="bg-gray-50 rounded-lg p-2">
                <p className="text-[8px] font-bold text-gray-700 mb-1">My Positions (0) Open Orders (0)</p>
                <div className="flex flex-col items-center justify-center py-3">
                  <div className="w-8 h-8 bg-gray-200 rounded-full mb-1" />
                  <p className="text-[7px] text-gray-400 text-center">No trading positions</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Text content */}
        <div>
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-8">
            VirtualTrade's Paper Trading<br />is for You
          </h2>
          <div className="space-y-5">
            {[
              "You have the capital to trade but are not sure where to begin.",
              "You want to use VirtualTrade's Paper Trading feature to test new and experimental strategies.",
              "You want to try VirtualTrade's Trading and Investing tools, but don't have enough funds yet.",
            ].map((text, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-gray-700 text-base leading-relaxed">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </>
  );
}
