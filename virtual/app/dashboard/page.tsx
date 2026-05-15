// app/dashboard/page.tsx
"use client";
import { useEffect, useState } from "react";

interface StockData {
  symbol: string;
  price: {
    current: number;
    change: number;
    changePercent: number;
    high: number;
    low: number;
    open: number;
    previousClose: number;
  };
  company: {
    name: string;
    logo: string;
    industry: string;
  };
}

interface PortfolioItem {
  id: string;
  symbol: string;
  quantity: number;
  avgPrice: number;
}

interface UserData {
  balance: number;
  trades: { id: string }[];
}

const SYMBOLS = ["AAPL", "TSLA", "GOOGL", "MSFT", "AMZN", "NVDA", "META", "NFLX"];

export default function DashboardPage() {
  const [stocks, setStocks] = useState<Record<string, StockData>>({});
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
  const [user, setUser] = useState<UserData | null>(null);
  const [loadingStocks, setLoadingStocks] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResult, setSearchResult] = useState<StockData | null>(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  // Change balance modal
  const [showBalanceModal, setShowBalanceModal] = useState(false);
  const [newBalance, setNewBalance] = useState("");
  const [balanceMsg, setBalanceMsg] = useState<string | null>(null);

  // Buy modal state
  const [showBuy, setShowBuy] = useState(false);
  const [selectedSymbol, setSelectedSymbol] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [buying, setBuying] = useState(false);
  const [buyMessage, setBuyMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const fetchStocks = async () => {
    try {
      const results = await Promise.all(
        SYMBOLS.map(async (sym) => {
          const res = await fetch(`/api/stock/${sym}`);
          if (!res.ok) return null;
          const data = await res.json();
          return { sym, data };
        })
      );
      const map: Record<string, StockData> = {};
      results.forEach((r) => { if (r) map[r.sym] = r.data; });
      setStocks(map);
      setLastUpdated(new Date());
    } catch (err) {
      console.error("Failed to fetch stocks:", err);
    } finally {
      setLoadingStocks(false);
    }
  };

  const fetchPortfolioAndUser = async () => {
    try {
      const res = await fetch("/api/portfolio");
      const data = await res.json();
      setPortfolio(data.portfolio ?? []);
      setUser(data.user ?? null);
    } catch (err) {
      console.error("Failed to fetch portfolio:", err);
    }
  };

  useEffect(() => {
    fetchStocks();
    fetchPortfolioAndUser();
    const interval = setInterval(fetchStocks, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleSearch = async () => {
    const sym = searchQuery.trim().toUpperCase();
    if (!sym) return;
    setSearchLoading(true);
    setSearchError(null);
    setSearchResult(null);
    try {
      const res = await fetch(`/api/stock/${sym}`);
      const data = await res.json();
      if (!res.ok || !data?.price?.current) {
        setSearchError(`"${sym}" not found or unavailable.`);
      } else {
        setSearchResult(data);
      }
    } catch {
      setSearchError("Failed to fetch stock data.");
    } finally {
      setSearchLoading(false);
    }
  };

  const handleChangeBalance = async () => {
    const val = Number(newBalance);
    if (isNaN(val) || val < 0) { setBalanceMsg("Enter a valid amount."); return; }
    const res = await fetch("/api/balance", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ balance: val }),
    });
    if (res.ok) {
      setBalanceMsg("✅ Balance updated!");
      fetchPortfolioAndUser();
      setTimeout(() => { setShowBalanceModal(false); setBalanceMsg(null); setNewBalance(""); }, 1500);
    } else {
      setBalanceMsg("Failed to update balance.");
    }
  };

  const handleBuyClick = (symbol: string) => {    setSelectedSymbol(symbol);
    setQuantity(1);
    setBuyMessage(null);
    setShowBuy(true);
  };

  const handleBuy = async () => {
    if (!selectedSymbol || !stocks[selectedSymbol]?.price?.current) return;
    setBuying(true);
    setBuyMessage(null);
    try {
      const res = await fetch("/api/trade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          symbol: selectedSymbol,
          quantity,
          price: stocks[selectedSymbol].price.current,
          type: "BUY",
        }),
      });
      const result = await res.json();
      if (!res.ok) {
        setBuyMessage({ type: "error", text: result.error });
      } else {
        setBuyMessage({
          type: "success",
          text: `✅ Bought ${quantity} share${quantity > 1 ? "s" : ""} of ${selectedSymbol}!`,
        });
        fetchPortfolioAndUser();
        setTimeout(() => {
          setShowBuy(false);
          setSelectedSymbol(null);
          setQuantity(1);
          setBuyMessage(null);
        }, 2000);
      }
    } catch {
      setBuyMessage({ type: "error", text: "Something went wrong. Try again." });
    } finally {
      setBuying(false);
    }
  };

  const totalInvested = portfolio.reduce((sum, item) => sum + item.avgPrice * item.quantity, 0);
  const totalCurrent = portfolio.reduce((sum, item) => {
    const price = stocks[item.symbol]?.price.current ?? item.avgPrice;
    return sum + price * item.quantity;
  }, 0);
  const totalPnL = totalCurrent - totalInvested;

  const selectedStock = selectedSymbol ? stocks[selectedSymbol] : null;
  const totalCost = selectedStock ? (selectedStock.price?.current ?? 0) * quantity : 0;

  return (
    <div className="min-h-screen bg-[#0d0d0d] text-white">
      <div className="max-w-7xl mx-auto p-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-white">📊 Trading Dashboard</h1>
          <div className="flex items-center gap-3">
            {lastUpdated && (
              <span className="text-xs text-gray-500">
                Updated {lastUpdated.toLocaleTimeString()}
              </span>
            )}
            <button
              onClick={() => { setShowBalanceModal(true); setNewBalance(String(user?.balance ?? 1000000)); }}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
            >
              💳 Change Balance
            </button>
            <button
              onClick={fetchStocks}
              className="bg-[#1a1a1a] hover:bg-[#222] border border-gray-700 text-gray-300 px-4 py-2 rounded-lg text-sm font-medium transition"
            >
              🔄 Refresh
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-[#1a1a1a] border border-gray-800 rounded-2xl p-5 mb-8">
          <p className="text-sm font-semibold text-gray-400 mb-3">🔍 Search Any Stock</p>
          <div className="flex gap-3">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="Enter symbol (e.g. AAPL, TSLA, GOOGL)"
              className="flex-1 bg-[#0d0d0d] border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleSearch}
              disabled={searchLoading}
              className="bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white px-6 py-2.5 rounded-xl text-sm font-semibold transition"
            >
              {searchLoading ? "..." : "Search"}
            </button>
          </div>
          {searchError && (
            <div className="mt-3 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-2">⚠️ {searchError}</div>
          )}
          {searchResult && (
            <div className="mt-4 flex items-center justify-between bg-[#0d0d0d] rounded-xl p-4 border border-gray-700">
              <div className="flex items-center gap-3">
                {searchResult.company?.logo ? (
                  <img src={searchResult.company.logo} alt={searchResult.symbol} className="w-10 h-10 rounded" />
                ) : (
                  <div className="w-10 h-10 rounded bg-blue-500/20 flex items-center justify-center font-bold text-blue-400">
                    {searchResult.symbol?.[0]}
                  </div>
                )}
                <div>
                  <p className="font-bold text-white">{searchResult.symbol}</p>
                  <p className="text-xs text-gray-500">{searchResult.company?.name}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold text-white">${searchResult.price?.current?.toFixed(2)}</p>
                <p className={`text-sm font-semibold ${(searchResult.price?.change ?? 0) >= 0 ? "text-green-400" : "text-red-400"}`}>
                  {(searchResult.price?.change ?? 0) >= 0 ? "▲" : "▼"} {Math.abs(searchResult.price?.changePercent ?? 0).toFixed(2)}%
                </p>
              </div>
              <button
                onClick={() => {
                  const sym = searchResult.symbol;
                  const stockCopy = { ...searchResult };
                  setStocks(prev => ({ ...prev, [sym]: stockCopy }));
                  setSearchResult(null);
                  setSearchQuery("");
                  handleBuyClick(sym);
                }}
                className="bg-green-500 hover:bg-green-600 text-white px-5 py-2 rounded-xl text-sm font-semibold transition"
              >
                Buy
              </button>
            </div>
          )}
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-[#1a1a1a] border border-gray-800 rounded-2xl p-5">
            <p className="text-sm text-gray-500 mb-1">💰 Total Balance</p>
            <p className="text-2xl font-bold text-green-400">
              ${(user?.balance ?? 1000000).toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </p>
          </div>
          <div className="bg-[#1a1a1a] border border-gray-800 rounded-2xl p-5">
            <p className="text-sm text-gray-500 mb-1">📦 Portfolio Value</p>
            <p className="text-2xl font-bold text-blue-400">
              ${totalCurrent.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </p>
          </div>
          <div className={`border rounded-2xl p-5 ${totalPnL >= 0 ? "bg-green-500/10 border-green-500/20" : "bg-red-500/10 border-red-500/20"}`}>
            <p className="text-sm text-gray-500 mb-1">📈 Total P&L</p>
            <p className={`text-2xl font-bold ${totalPnL >= 0 ? "text-green-400" : "text-red-400"}`}>
              {totalPnL >= 0 ? "+" : ""}${totalPnL.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </p>
          </div>
          <div className="bg-[#1a1a1a] border border-gray-800 rounded-2xl p-5">
            <p className="text-sm text-gray-500 mb-1">🔁 Holdings</p>
            <p className="text-2xl font-bold text-white">{portfolio.length} stocks</p>
          </div>
        </div>

        {/* Live Stock Prices */}
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-800">📡 Live Stock Prices</h2>
          <span className="text-xs text-gray-400 bg-gray-100 px-3 py-1 rounded-full">
            🔄 Auto-refreshes every 30s
          </span>
        </div>

        {loadingStocks ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {SYMBOLS.map((sym) => (
              <div key={sym} className="bg-white rounded-2xl shadow p-5 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-3" />
                <div className="h-8 bg-gray-200 rounded w-3/4 mb-2" />
                <div className="h-3 bg-gray-200 rounded w-1/3" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {SYMBOLS.map((sym) => {
              const stock = stocks[sym];
              if (!stock || !stock.price?.current) return null;
              const isPositive = (stock.price.change ?? 0) >= 0;
              const inPortfolio = portfolio.find((p) => p.symbol === sym);

              return (
                <div
                  key={sym}
                  className="bg-white rounded-2xl shadow hover:shadow-lg transition p-5 flex flex-col gap-2"
                >
                  {/* Stock Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {stock.company?.logo ? (
                        <img src={stock.company.logo} alt={sym} className="w-8 h-8 rounded" />
                      ) : (
                        <div className="w-8 h-8 rounded bg-gray-200 flex items-center justify-center text-xs font-bold">
                          {sym[0]}
                        </div>
                      )}
                      <div>
                        <p className="font-bold text-gray-800">{sym}</p>
                        <p className="text-xs text-gray-400 truncate w-24">{stock.company?.name ?? sym}</p>
                      </div>
                    </div>
                    {inPortfolio && (
                      <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full font-medium">
                        Owned
                      </span>
                    )}
                  </div>

                  {/* Price */}
                  <p className="text-2xl font-bold text-gray-900">
                    ${stock.price.current.toFixed(2)}
                  </p>
                  <p className={`text-sm font-semibold ${isPositive ? "text-green-500" : "text-red-500"}`}>
                    {isPositive ? "▲" : "▼"} {Math.abs(stock.price.change ?? 0).toFixed(2)} ({Math.abs(stock.price.changePercent ?? 0).toFixed(2)}%)
                  </p>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-x-2 text-xs text-gray-400 border-t pt-2 mt-1">
                    <span>Open: <span className="text-gray-600">${(stock.price.open ?? 0).toFixed(2)}</span></span>
                    <span>High: <span className="text-green-600">${(stock.price.high ?? 0).toFixed(2)}</span></span>
                    <span>Low: <span className="text-red-500">${(stock.price.low ?? 0).toFixed(2)}</span></span>
                    <span>Prev: <span className="text-gray-600">${(stock.price.previousClose ?? 0).toFixed(2)}</span></span>
                  </div>

                  {/* Buy Button */}
                  <button
                    onClick={() => handleBuyClick(sym)}
                    className="mt-1 w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-2 rounded-xl transition text-sm"
                  >
                    Buy {sym}
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* Portfolio Holdings Table */}
        {portfolio.length > 0 && (
          <div className="mt-10">
            <h2 className="text-xl font-bold text-gray-800 mb-4">📁 My Holdings</h2>
            <div className="bg-white rounded-2xl shadow overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 text-sm text-gray-500">
                  <tr>
                    <th className="px-6 py-3 text-left font-medium">Stock</th>
                    <th className="px-6 py-3 text-left font-medium">Qty</th>
                    <th className="px-6 py-3 text-left font-medium">Avg Price</th>
                    <th className="px-6 py-3 text-left font-medium">Current</th>
                    <th className="px-6 py-3 text-left font-medium">Value</th>
                    <th className="px-6 py-3 text-left font-medium">P&L</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {portfolio.map((item) => {
                    const currentPrice = stocks[item.symbol]?.price.current ?? item.avgPrice;
                    const pnl = (currentPrice - item.avgPrice) * item.quantity;
                    const pnlPct = ((currentPrice - item.avgPrice) / item.avgPrice) * 100;
                    return (
                      <tr key={item.id} className="hover:bg-gray-50 transition">
                        <td className="px-6 py-4 font-bold text-gray-800">{item.symbol}</td>
                        <td className="px-6 py-4 text-gray-600">{item.quantity}</td>
                        <td className="px-6 py-4 text-gray-600">${item.avgPrice.toFixed(2)}</td>
                        <td className="px-6 py-4 font-medium">${currentPrice.toFixed(2)}</td>
                        <td className="px-6 py-4">${(currentPrice * item.quantity).toFixed(2)}</td>
                        <td className="px-6 py-4">
                          <span className={`font-semibold ${pnl >= 0 ? "text-green-600" : "text-red-600"}`}>
                            {pnl >= 0 ? "+" : ""}${pnl.toFixed(2)}
                          </span>
                          <span className={`ml-1 text-xs ${pnl >= 0 ? "text-green-400" : "text-red-400"}`}>
                            ({pnlPct >= 0 ? "+" : ""}{pnlPct.toFixed(2)}%)
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Change Balance Modal */}
      {showBalanceModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-80">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg">💳 Change Balance</h3>
              <button onClick={() => { setShowBalanceModal(false); setBalanceMsg(null); }} className="text-gray-400 hover:text-gray-600 text-xl font-bold">✕</button>
            </div>
            <p className="text-sm text-gray-500 mb-3">Current: <span className="font-bold text-gray-800">${(user?.balance ?? 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}</span></p>
            <input
              type="number"
              value={newBalance}
              onChange={(e) => setNewBalance(e.target.value)}
              placeholder="Enter new balance"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 mb-3"
            />
            <div className="flex gap-2 mb-3">
              {[100000, 500000, 1000000].map((amt) => (
                <button key={amt} onClick={() => setNewBalance(String(amt))} className="flex-1 bg-gray-100 hover:bg-gray-200 text-xs font-semibold py-1.5 rounded-lg transition">
                  ${(amt / 1000).toFixed(0)}K
                </button>
              ))}
            </div>
            {balanceMsg && <p className={`text-sm text-center mb-3 ${balanceMsg.startsWith("✅") ? "text-green-600" : "text-red-500"}`}>{balanceMsg}</p>}
            <button onClick={handleChangeBalance} className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2.5 rounded-xl transition">
              Update Balance
            </button>
          </div>
        </div>
      )}

      {/* Buy Modal */}
      {showBuy && selectedStock && (        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-80">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                {selectedStock.company?.logo && (
                  <img src={selectedStock.company.logo} alt={selectedSymbol!} className="w-8 h-8 rounded" />
                )}
                <div>
                  <h3 className="font-bold text-lg">{selectedSymbol}</h3>
                  <p className="text-xs text-gray-400">{selectedStock.company?.name ?? selectedSymbol}</p>
                </div>
              </div>
              <button
                onClick={() => { setShowBuy(false); setBuyMessage(null); setQuantity(1); }}
                className="text-gray-400 hover:text-gray-600 text-xl font-bold"
              >
                ✕
              </button>
            </div>

            <div className="bg-gray-50 rounded-xl p-3 mb-4">
              <p className="text-xs text-gray-400">Current Price</p>
              <p className="text-2xl font-bold">${(selectedStock.price?.current ?? 0).toFixed(2)}</p>
              <p className={`text-xs font-medium ${(selectedStock.price?.change ?? 0) >= 0 ? "text-green-500" : "text-red-500"}`}>
                {(selectedStock.price?.change ?? 0) >= 0 ? "▲" : "▼"} {Math.abs(selectedStock.price?.changePercent ?? 0).toFixed(2)}% today
              </p>
            </div>

            <label className="text-sm text-gray-500 font-medium">Quantity</label>
            <div className="flex items-center gap-2 mt-1 mb-3">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="w-9 h-9 rounded-lg bg-gray-100 hover:bg-gray-200 text-lg font-bold"
              >−</button>
              <input
                type="number"
                min={1}
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                className="flex-1 border rounded-lg px-3 py-2 text-center font-bold text-lg focus:outline-none focus:ring-2 focus:ring-green-300"
              />
              <button
                onClick={() => setQuantity((q) => q + 1)}
                className="w-9 h-9 rounded-lg bg-gray-100 hover:bg-gray-200 text-lg font-bold"
              >+</button>
            </div>

            <div className="flex justify-between items-center mb-4 bg-green-50 rounded-xl px-4 py-3">
              <span className="text-sm text-gray-500">Total Cost</span>
              <span className="text-lg font-bold text-green-700">${totalCost.toFixed(2)}</span>
            </div>

            {buyMessage && (
              <div className={`text-sm rounded-lg px-3 py-2 mb-3 text-center font-medium ${
                buyMessage.type === "success" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
              }`}>
                {buyMessage.text}
              </div>
            )}

            <button
              onClick={handleBuy}
              disabled={buying}
              className="w-full bg-green-500 hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl transition"
            >
              {buying ? "Processing..." : `Buy ${quantity} Share${quantity > 1 ? "s" : ""}`}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}