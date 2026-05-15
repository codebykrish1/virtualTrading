"use client";
import { useEffect, useState } from "react";

interface Trade {
  id: string;
  symbol: string;
  quantity: number;
  price: number;
  type: string;
  createdAt: string;
}

interface PortfolioItem {
  id: string;
  symbol: string;
  quantity: number;
  avgPrice: number;
}

interface PerfData {
  trades: Trade[];
  portfolio: PortfolioItem[];
  user: { balance: number; trades: number };
}

export default function PerformancePage() {
  const [data, setData] = useState<PerfData | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"ALL" | "BUY" | "SELL">("ALL");

  useEffect(() => {
    fetch("/api/performance")
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false); });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0d0d0d] flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  const trades = data?.trades ?? [];
  const filtered = filter === "ALL" ? trades : trades.filter((t) => t.type === filter);

  const totalBought = trades.filter((t) => t.type === "BUY").reduce((s, t) => s + t.price * t.quantity, 0);
  const totalSold = trades.filter((t) => t.type === "SELL").reduce((s, t) => s + t.price * t.quantity, 0);
  const totalTrades = trades.length;

  // Group by symbol for summary
  const symbolMap: Record<string, { buys: number; sells: number; spent: number; earned: number }> = {};
  trades.forEach((t) => {
    if (!symbolMap[t.symbol]) symbolMap[t.symbol] = { buys: 0, sells: 0, spent: 0, earned: 0 };
    if (t.type === "BUY") { symbolMap[t.symbol].buys += t.quantity; symbolMap[t.symbol].spent += t.price * t.quantity; }
    else { symbolMap[t.symbol].sells += t.quantity; symbolMap[t.symbol].earned += t.price * t.quantity; }
  });

  return (
    <div className="min-h-screen bg-[#0d0d0d] text-white p-8">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-1">📈 Performance</h1>
          <p className="text-gray-400">Your complete trading history and statistics</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total Trades", value: totalTrades.toString(), color: "text-blue-400" },
            { label: "Total Bought", value: `$${totalBought.toLocaleString("en-US", { minimumFractionDigits: 2 })}`, color: "text-red-400" },
            { label: "Total Sold", value: `$${totalSold.toLocaleString("en-US", { minimumFractionDigits: 2 })}`, color: "text-green-400" },
            { label: "Net P&L", value: `${(totalSold - totalBought) >= 0 ? "+" : ""}$${(totalSold - totalBought).toLocaleString("en-US", { minimumFractionDigits: 2 })}`, color: (totalSold - totalBought) >= 0 ? "text-green-400" : "text-red-400" },
          ].map((card) => (
            <div key={card.label} className="bg-[#1a1a1a] border border-gray-800 rounded-xl p-5">
              <p className="text-xs text-gray-500 mb-1">{card.label}</p>
              <p className={`text-xl font-bold ${card.color}`}>{card.value}</p>
            </div>
          ))}
        </div>

        {/* Per-symbol summary */}
        {Object.keys(symbolMap).length > 0 && (
          <div className="bg-[#1a1a1a] border border-gray-800 rounded-xl mb-8 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-800">
              <h2 className="font-bold text-white">Stock Summary</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#111] text-xs text-gray-500">
                  <tr>
                    <th className="px-6 py-3 text-left">Symbol</th>
                    <th className="px-6 py-3 text-left">Shares Bought</th>
                    <th className="px-6 py-3 text-left">Shares Sold</th>
                    <th className="px-6 py-3 text-left">Total Spent</th>
                    <th className="px-6 py-3 text-left">Total Earned</th>
                    <th className="px-6 py-3 text-left">Net</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {Object.entries(symbolMap).map(([sym, s]) => {
                    const net = s.earned - s.spent;
                    return (
                      <tr key={sym} className="hover:bg-gray-800/30 transition">
                        <td className="px-6 py-4 font-bold text-white">{sym}</td>
                        <td className="px-6 py-4 text-gray-300">{s.buys}</td>
                        <td className="px-6 py-4 text-gray-300">{s.sells}</td>
                        <td className="px-6 py-4 text-red-400">${s.spent.toFixed(2)}</td>
                        <td className="px-6 py-4 text-green-400">${s.earned.toFixed(2)}</td>
                        <td className={`px-6 py-4 font-semibold ${net >= 0 ? "text-green-400" : "text-red-400"}`}>
                          {net >= 0 ? "+" : ""}${net.toFixed(2)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Trade History */}
        <div className="bg-[#1a1a1a] border border-gray-800 rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-800 flex items-center justify-between">
            <h2 className="font-bold text-white">Trade History</h2>
            <div className="flex gap-2">
              {(["ALL", "BUY", "SELL"] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                    filter === f
                      ? f === "BUY" ? "bg-green-500 text-white" : f === "SELL" ? "bg-red-500 text-white" : "bg-blue-500 text-white"
                      : "bg-gray-800 text-gray-400 hover:text-white"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-500">
              <span className="text-4xl mb-3">📭</span>
              <p>No trades yet. Start trading from the Dashboard!</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#111] text-xs text-gray-500">
                  <tr>
                    <th className="px-6 py-3 text-left">Type</th>
                    <th className="px-6 py-3 text-left">Symbol</th>
                    <th className="px-6 py-3 text-left">Quantity</th>
                    <th className="px-6 py-3 text-left">Price</th>
                    <th className="px-6 py-3 text-left">Total</th>
                    <th className="px-6 py-3 text-left">Date & Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {[...filtered].reverse().map((trade) => (
                    <tr key={trade.id} className="hover:bg-gray-800/30 transition">
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded text-xs font-bold ${
                          trade.type === "BUY" ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"
                        }`}>
                          {trade.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-bold text-white">{trade.symbol}</td>
                      <td className="px-6 py-4 text-gray-300">{trade.quantity}</td>
                      <td className="px-6 py-4 text-gray-300">${trade.price.toFixed(2)}</td>
                      <td className="px-6 py-4 font-semibold text-white">${(trade.price * trade.quantity).toFixed(2)}</td>
                      <td className="px-6 py-4 text-gray-500 text-sm">
                        {new Date(trade.createdAt).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
