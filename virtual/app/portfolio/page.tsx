// app/portfolio/page.tsx
"use client";
import { useEffect, useState } from "react";

interface PortfolioItem {
  id: string;
  symbol: string;
  quantity: number;
  avgPrice: number;
}

interface StockPrice {
  [symbol: string]: number;
}

export default function PortfolioPage() {
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
  const [prices, setPrices] = useState<StockPrice>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Trade modal state
  const [showTradeModal, setShowTradeModal] = useState(false);
  const [selectedStock, setSelectedStock] = useState<string | null>(null);
  const [tradeType, setTradeType] = useState<"BUY" | "SELL">("BUY");
  const [quantity, setQuantity] = useState(1);
  const [trading, setTrading] = useState(false);
  const [tradeMessage, setTradeMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const fetchPortfolio = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch("/api/portfolio");
      const data = await res.json();

      // Handle both success and error responses
      const items: PortfolioItem[] = data.portfolio ?? [];
      setPortfolio(items);

      if (items.length > 0) {
        const priceMap: StockPrice = {};

        await Promise.all(
          items.map(async (item) => {
            try {
              const r = await fetch(`/api/stock/${item.symbol}`);
              if (r.ok) {
                const stockData = await r.json();
                priceMap[item.symbol] = stockData?.price?.current ?? item.avgPrice;
              } else {
                priceMap[item.symbol] = item.avgPrice;
              }
            } catch {
              priceMap[item.symbol] = item.avgPrice;
            }
          })
        );

        setPrices(priceMap);
      }
    } catch (err) {
      console.error("Failed to load portfolio:", err);
      setError("Failed to load portfolio. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const openTradeModal = (symbol: string, type: "BUY" | "SELL") => {
    setSelectedStock(symbol);
    setTradeType(type);
    setQuantity(1);
    setTradeMessage(null);
    setShowTradeModal(true);
  };

  const closeTradeModal = () => {
    setShowTradeModal(false);
    setSelectedStock(null);
    setQuantity(1);
    setTradeMessage(null);
  };

  const handleTrade = async () => {
    if (!selectedStock) return;
    
    setTrading(true);
    setTradeMessage(null);

    try {
      const currentPrice = prices[selectedStock];
      const res = await fetch("/api/trade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          symbol: selectedStock,
          quantity,
          price: currentPrice,
          type: tradeType,
        }),
      });

      const result = await res.json();

      if (!res.ok) {
        setTradeMessage({ type: "error", text: result.error || "Trade failed" });
      } else {
        setTradeMessage({
          type: "success",
          text: `✅ ${tradeType === "BUY" ? "Bought" : "Sold"} ${quantity} share${quantity > 1 ? "s" : ""} of ${selectedStock}!`,
        });
        
        // Refresh portfolio after successful trade
        setTimeout(() => {
          fetchPortfolio();
          closeTradeModal();
        }, 1500);
      }
    } catch {
      setTradeMessage({ type: "error", text: "Something went wrong. Try again." });
    } finally {
      setTrading(false);
    }
  };

  useEffect(() => {
    fetchPortfolio();
    window.addEventListener("focus", fetchPortfolio);
    return () => window.removeEventListener("focus", fetchPortfolio);
  }, []);

  if (loading) {
    return (
      <div className="p-8 flex items-center gap-3 text-gray-500">
        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v8z"
          />
        </svg>
        Loading portfolio...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 flex items-center justify-between">
          <span>⚠️ {error}</span>
          <button
            onClick={fetchPortfolio}
            className="ml-4 bg-red-100 hover:bg-red-200 text-red-800 px-3 py-1 rounded-lg text-sm font-medium"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const totalInvested = portfolio.reduce(
    (sum, item) => sum + item.avgPrice * item.quantity,
    0
  );
  const totalCurrent = portfolio.reduce(
    (sum, item) =>
      sum + (prices[item.symbol] ?? item.avgPrice) * item.quantity,
    0
  );
  const totalPnL = totalCurrent - totalInvested;
  const pnlPercent =
    totalInvested > 0 ? (totalPnL / totalInvested) * 100 : 0;

  const currentStockPrice = selectedStock ? prices[selectedStock] : 0;
  const totalCost = currentStockPrice * quantity;

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
              My Portfolio
            </h1>
            <p className="text-gray-600">Track your investments and performance</p>
          </div>
          <button
            onClick={fetchPortfolio}
            className="flex items-center gap-2 bg-white hover:bg-gray-50 px-5 py-3 rounded-xl text-sm font-semibold transition-all shadow-md hover:shadow-lg border border-gray-200"
          >
            <span className="text-lg">🔄</span>
            <span>Refresh</span>
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-gray-200 hover:shadow-xl transition-all">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-2xl">
                💵
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">Total Invested</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${totalInvested.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-gray-200 hover:shadow-xl transition-all">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center text-2xl">
                💎
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">Current Value</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${totalCurrent.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          </div>

          <div className={`rounded-2xl shadow-lg p-6 border-2 hover:shadow-xl transition-all ${
            totalPnL >= 0 
              ? "bg-gradient-to-br from-green-50 to-emerald-50 border-green-200" 
              : "bg-gradient-to-br from-red-50 to-rose-50 border-red-200"
          }`}>
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${
                totalPnL >= 0 ? "bg-green-100" : "bg-red-100"
              }`}>
                {totalPnL >= 0 ? "📈" : "📉"}
              </div>
              <div>
                <p className="text-sm text-gray-600 font-medium">Total P&L</p>
                <p className={`text-2xl font-bold ${
                  totalPnL >= 0 ? "text-green-700" : "text-red-700"
                }`}>
                  {totalPnL >= 0 ? "+" : ""}${totalPnL.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </p>
                <p className={`text-sm font-semibold ${
                  totalPnL >= 0 ? "text-green-600" : "text-red-600"
                }`}>
                  {pnlPercent >= 0 ? "+" : ""}
                  {pnlPercent.toFixed(2)}%
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Holdings Table */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg overflow-hidden border border-gray-200">
          <div className="px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
            <h2 className="text-xl font-bold text-gray-900">Holdings</h2>
            <p className="text-sm text-gray-600 mt-1">{portfolio.length} stock{portfolio.length !== 1 ? "s" : ""} in portfolio</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr className="text-left text-sm text-gray-600">
                  <th className="px-6 py-4 font-semibold">Stock</th>
                  <th className="px-6 py-4 font-semibold">Quantity</th>
                  <th className="px-6 py-4 font-semibold">Avg Buy Price</th>
                  <th className="px-6 py-4 font-semibold">Current Price</th>
                  <th className="px-6 py-4 font-semibold">Current Value</th>
                  <th className="px-6 py-4 font-semibold">P&L</th>
                  <th className="px-6 py-4 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {portfolio.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="text-center py-20"
                    >
                      <div className="flex flex-col items-center gap-4">
                        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center text-4xl">
                          📭
                        </div>
                        <div>
                          <p className="text-xl font-semibold text-gray-800 mb-1">No stocks yet</p>
                          <p className="text-gray-500">
                            Head over to <a href="/trade" className="text-blue-600 hover:underline font-medium">Trade</a> to buy your first stock!
                          </p>
                        </div>
                      </div>
                    </td>
                  </tr>
                ) : (
                  portfolio.map((item) => {
                    const currentPrice =
                      prices[item.symbol] ?? item.avgPrice;
                    const pnl =
                      (currentPrice - item.avgPrice) * item.quantity;
                    const pnlPct =
                      ((currentPrice - item.avgPrice) / item.avgPrice) * 100;
                    const currentValue = currentPrice * item.quantity;

                    return (
                      <tr
                        key={item.id}
                        className="hover:bg-blue-50/50 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <span className="font-bold text-lg text-gray-900">
                            {item.symbol}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-gray-700 font-medium">
                          {item.quantity}
                        </td>
                        <td className="px-6 py-4 text-gray-700">
                          ${item.avgPrice.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 text-gray-900 font-semibold">
                          ${currentPrice.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 text-gray-900 font-medium">
                          ${currentValue.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-6 py-4">
                          <div className={`inline-flex flex-col items-start px-3 py-2 rounded-lg ${
                            pnl >= 0 ? "bg-green-50" : "bg-red-50"
                          }`}>
                            <span className={`font-bold text-base ${
                              pnl >= 0 ? "text-green-700" : "text-red-700"
                            }`}>
                              {pnl >= 0 ? "+" : ""}${pnl.toFixed(2)}
                            </span>
                            <span className={`text-xs font-semibold ${
                              pnl >= 0 ? "text-green-600" : "text-red-600"
                            }`}>
                              {pnlPct >= 0 ? "+" : ""}
                              {pnlPct.toFixed(2)}%
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            <button
                              onClick={() => openTradeModal(item.symbol, "BUY")}
                              className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-4 py-2 rounded-lg font-semibold text-sm transition-all shadow-md hover:shadow-lg"
                            >
                              Buy
                            </button>
                            <button
                              onClick={() => openTradeModal(item.symbol, "SELL")}
                              className="bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white px-4 py-2 rounded-lg font-semibold text-sm transition-all shadow-md hover:shadow-lg"
                            >
                              Sell
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Trade Modal */}
      {showTradeModal && selectedStock && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-bold text-2xl text-gray-900">{tradeType} {selectedStock}</h3>
                <p className="text-sm text-gray-500 mt-1">Current Price: ${currentStockPrice.toFixed(2)}</p>
              </div>
              <button
                onClick={closeTradeModal}
                className="text-gray-400 hover:text-gray-600 text-2xl font-bold w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100"
              >
                ✕
              </button>
            </div>

            <div className="mb-5">
              <label className="text-sm text-gray-600 font-semibold mb-2 block">Quantity</label>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="w-10 h-10 rounded-lg bg-gray-100 hover:bg-gray-200 text-lg font-bold transition"
                >
                  −
                </button>
                <input
                  type="number"
                  min={1}
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="flex-1 border-2 border-gray-200 rounded-lg px-4 py-2 text-center font-bold text-xl focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
                <button
                  onClick={() => setQuantity((q) => q + 1)}
                  className="w-10 h-10 rounded-lg bg-gray-100 hover:bg-gray-200 text-lg font-bold transition"
                >
                  +
                </button>
              </div>
            </div>

            <div className={`flex justify-between items-center mb-5 rounded-xl px-4 py-3 ${
              tradeType === "BUY" 
                ? "bg-green-50 border-2 border-green-200" 
                : "bg-red-50 border-2 border-red-200"
            }`}>
              <span className="text-sm text-gray-600 font-semibold">Total {tradeType === "BUY" ? "Cost" : "Value"}</span>
              <span className={`text-xl font-bold ${
                tradeType === "BUY" ? "text-green-700" : "text-red-700"
              }`}>
                ${totalCost.toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </span>
            </div>

            {tradeMessage && (
              <div className={`text-sm rounded-lg px-4 py-3 mb-4 text-center font-semibold border-2 ${
                tradeMessage.type === "success" 
                  ? "bg-green-50 text-green-700 border-green-200" 
                  : "bg-red-50 text-red-700 border-red-200"
              }`}>
                {tradeMessage.text}
              </div>
            )}

            <button
              onClick={handleTrade}
              disabled={trading}
              className={`w-full py-3 rounded-xl font-bold transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed ${
                tradeType === "BUY"
                  ? "bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white"
                  : "bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white"
              }`}
            >
              {trading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Processing...
                </span>
              ) : (
                `${tradeType} ${quantity} Share${quantity > 1 ? "s" : ""}`
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
