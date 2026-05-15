"use client";

import { useState } from "react";
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

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
  history: {
    timestamps: number[];
    dates: string[];
    close: number[];
    open: number[];
    high: number[];
    low: number[];
    volume: number[];
  };
}

type TimeframeOption = {
  label: string;
  resolution: string;
  days: number;
};

const TIMEFRAMES: TimeframeOption[] = [
  { label: "1M", resolution: "1", days: 1 },
  { label: "5M", resolution: "5", days: 1 },
  { label: "15M", resolution: "15", days: 3 },
  { label: "1H", resolution: "60", days: 7 },
  { label: "1D", resolution: "D", days: 30 },
];

export default function TradePage() {
  const [symbol, setSymbol] = useState("");
  const [quantity, setQuantity] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [stockData, setStockData] = useState<StockData | null>(null);
  const [fetchingStock, setFetchingStock] = useState(false);
  const [stockError, setStockError] = useState("");
  const [selectedTimeframe, setSelectedTimeframe] = useState<TimeframeOption>(TIMEFRAMES[4]); // Default to 1D

  const fetchStock = async (sym: string, timeframe: TimeframeOption = selectedTimeframe) => {
    if (!sym.trim()) return;
    setFetchingStock(true);
    setStockError("");
    setStockData(null);
    try {
      const res = await fetch(
        `/api/stock/${sym.toUpperCase()}?resolution=${timeframe.resolution}&days=${timeframe.days}`
      );
      const data = await res.json();
      
      // Check if the API returned an error or invalid data
      if (!res.ok || data.error || !data.company?.name || data.company.name === "") {
        setStockError(`Stock "${sym.toUpperCase()}" is not available or does not exist`);
        setStockData(null);
      } else {
        setStockData(data);
        setStockError("");
      }
    } catch (error) {
      setStockError(`Unable to fetch data for "${sym.toUpperCase()}". Please check the symbol and try again.`);
      setStockData(null);
    } finally {
      setFetchingStock(false);
    }
  };

  const handleTimeframeChange = (timeframe: TimeframeOption) => {
    setSelectedTimeframe(timeframe);
    if (symbol && stockData) {
      fetchStock(symbol, timeframe);
    }
  };

  const handleTrade = async (type: "BUY" | "SELL") => {
    if (!symbol || !quantity) {
      setMessage({ type: "error", text: "Please enter symbol and quantity" });
      return;
    }
    if (!stockData) {
      setMessage({ type: "error", text: "Please search for a stock first" });
      return;
    }

    try {
      setLoading(true);
      setMessage(null);

      const res = await fetch("/api/trade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          symbol: symbol.toUpperCase(),
          quantity: Number(quantity),
          price: stockData.price.current,
          type,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage({ type: "error", text: data.error || "Trade failed" });
      } else {
        setMessage({
          type: "success",
          text: `✅ ${type === "BUY" ? "Bought" : "Sold"} ${quantity} share${Number(quantity) > 1 ? "s" : ""} of ${symbol.toUpperCase()} at $${stockData.price.current.toFixed(2)}!`,
        });
        setQuantity("");
      }
    } catch {
      setMessage({ type: "error", text: "❌ Something went wrong" });
    } finally {
      setLoading(false);
    }
  };

  // Build candlestick chart data
  const candleData =
    stockData?.history?.timestamps?.map((timestamp, i) => {
      const open = stockData.history.open[i];
      const close = stockData.history.close[i];
      const high = stockData.history.high[i];
      const low = stockData.history.low[i];
      
      // Format time based on resolution
      let timeLabel = "";
      const date = new Date(timestamp * 1000);
      
      if (selectedTimeframe.resolution === "1" || selectedTimeframe.resolution === "5" || selectedTimeframe.resolution === "15") {
        timeLabel = date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
      } else if (selectedTimeframe.resolution === "60") {
        timeLabel = date.toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit" });
      } else {
        timeLabel = date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      }

      return {
        time: timeLabel,
        open,
        close,
        high,
        low,
        candleColor: close >= open ? "#22c55e" : "#ef4444",
        // For candlestick body
        candleTop: Math.max(open, close),
        candleBottom: Math.min(open, close),
        candleHeight: Math.abs(close - open),
      };
    }) ?? [];

  const isPositive = stockData ? stockData.price.change >= 0 : true;

  // Custom Candlestick component
  const CustomCandlestick = (props: any) => {
    const { x, y, width, payload } = props;
    const { high, low, candleTop, candleBottom, candleColor } = payload;
    
    if (!high || !low) return null;

    const yScale = props.yAxis.scale;
    const highY = yScale(high);
    const lowY = yScale(low);
    const topY = yScale(candleTop);
    const bottomY = yScale(candleBottom);

    return (
      <g>
        {/* Wick (high-low line) */}
        <line
          x1={x + width / 2}
          y1={highY}
          x2={x + width / 2}
          y2={lowY}
          stroke={candleColor}
          strokeWidth={1}
        />
        {/* Candle body */}
        <rect
          x={x + 1}
          y={topY}
          width={Math.max(width - 2, 1)}
          height={Math.max(bottomY - topY, 1)}
          fill={candleColor}
          stroke={candleColor}
          strokeWidth={1}
        />
      </g>
    );
  };

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent mb-2">
            Trade Stocks
          </h1>
          <p className="text-gray-400">Search for stocks and execute trades with real-time candlestick charts</p>
        </div>

        {/* Search Bar */}
        <div className="bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 mb-6 border border-gray-700">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xl">🔍</span>
            <p className="text-sm text-gray-300 font-semibold">Search Stock</p>
          </div>
          <div className="flex gap-3">
            <input
              type="text"
              placeholder="Enter symbol (e.g., AAPL, TSLA, GOOGL)"
              className="flex-1 border-2 border-gray-600 bg-gray-900 text-white p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent uppercase font-semibold placeholder-gray-500"
              value={symbol}
              onChange={(e) => setSymbol(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === "Enter" && fetchStock(symbol)}
            />
            <button
              onClick={() => fetchStock(symbol)}
              disabled={fetchingStock || !symbol.trim()}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-8 py-3 rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl"
            >
              {fetchingStock ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Searching...
                </span>
              ) : (
                "Search"
              )}
            </button>
          </div>
          {stockError && (
            <div className="mt-4 p-4 bg-red-900/50 border-2 border-red-700 rounded-xl">
              <div className="flex items-start gap-3">
                <span className="text-red-400 text-2xl">⚠️</span>
                <div className="flex-1">
                  <p className="text-red-300 font-bold mb-1">Stock Not Available</p>
                  <p className="text-red-400 text-sm">{stockError}</p>
                  <div className="mt-3">
                    <p className="text-red-400 text-xs font-semibold mb-2">Try these popular stocks:</p>
                    <div className="flex flex-wrap gap-2">
                      {["AAPL", "TSLA", "GOOGL", "MSFT", "AMZN", "NVDA", "META", "NFLX"].map((sym) => (
                        <button
                          key={sym}
                          onClick={() => {
                            setSymbol(sym);
                            fetchStock(sym);
                          }}
                          className="bg-gray-800 hover:bg-red-900/50 text-red-300 px-3 py-1 rounded-lg text-xs font-semibold border border-red-700 transition-all"
                        >
                          {sym}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Stock Info + Chart */}
        {stockData && (
          <div className="bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 mb-6 border border-gray-700">
            {/* Stock Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
              <div className="flex items-center gap-4">
                {stockData.company.logo ? (
                  <img
                    src={stockData.company.logo}
                    alt={stockData.symbol}
                    className="w-16 h-16 rounded-2xl shadow-md"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-2xl shadow-md">
                    {stockData.symbol[0]}
                  </div>
                )}
                <div>
                  <h2 className="text-3xl font-bold text-gray-100">{stockData.symbol}</h2>
                  <p className="text-gray-400 font-medium">{stockData.company.name}</p>
                  <p className="text-xs text-gray-500 mt-1">{stockData.company.industry}</p>
                </div>
              </div>
              <div className="text-left sm:text-right">
                <p className="text-4xl font-bold text-gray-100 mb-1">
                  ${stockData.price.current.toFixed(2)}
                </p>
                <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-bold ${
                  isPositive 
                    ? "bg-green-900/50 text-green-400 border border-green-700" 
                    : "bg-red-900/50 text-red-400 border border-red-700"
                }`}>
                  <span>{isPositive ? "▲" : "▼"}</span>
                  <span>{Math.abs(stockData.price.change).toFixed(2)}</span>
                  <span>({Math.abs(stockData.price.changePercent).toFixed(2)}%)</span>
                </div>
              </div>
            </div>

            {/* Price Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
              {[
                { label: "Open", value: stockData.price.open, icon: "🔓" },
                { label: "High", value: stockData.price.high, icon: "📈", color: "text-green-400" },
                { label: "Low", value: stockData.price.low, icon: "📉", color: "text-red-400" },
                { label: "Prev Close", value: stockData.price.previousClose, icon: "🔒" },
              ].map((stat) => (
                <div key={stat.label} className="bg-gray-900/60 rounded-xl p-4 text-center border border-gray-700 hover:shadow-md hover:border-gray-600 transition-all">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <span className="text-sm">{stat.icon}</span>
                    <p className="text-xs text-gray-400 font-medium">{stat.label}</p>
                  </div>
                  <p className={`font-bold text-lg ${stat.color || "text-gray-200"}`}>
                    ${stat.value.toFixed(2)}
                  </p>
                </div>
              ))}
            </div>

            {/* Timeframe Selector */}
            <div className="mb-4">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm text-gray-400 font-semibold">Timeframe:</span>
                {TIMEFRAMES.map((tf) => (
                  <button
                    key={tf.label}
                    onClick={() => handleTimeframeChange(tf)}
                    disabled={fetchingStock}
                    className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                      selectedTimeframe.label === tf.label
                        ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg"
                        : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                    } disabled:opacity-50`}
                  >
                    {tf.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Candlestick Chart */}
            {candleData.length > 0 && (
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-5 border border-blue-100">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">📊</span>
                    <p className="text-sm font-bold text-gray-700">
                      Candlestick Chart ({selectedTimeframe.label})
                    </p>
                  </div>
                  <div className="flex items-center gap-3 text-xs">
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 bg-green-500 rounded"></div>
                      <span className="text-gray-600">Bullish</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 bg-red-500 rounded"></div>
                      <span className="text-gray-600">Bearish</span>
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-xl p-4 shadow-inner">
                  <ResponsiveContainer width="100%" height={400}>
                    <ComposedChart data={candleData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis
                        dataKey="time"
                        tick={{ fontSize: 10, fill: "#6b7280" }}
                        tickLine={false}
                        interval={Math.floor(candleData.length / 10)}
                      />
                      <YAxis
                        domain={["auto", "auto"]}
                        tick={{ fontSize: 11, fill: "#6b7280" }}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(v) => `$${v.toFixed(2)}`}
                      />
                      <Tooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload;
                            return (
                              <div className="bg-white p-3 rounded-lg shadow-xl border border-gray-200">
                                <p className="text-xs text-gray-500 mb-2">{data.time}</p>
                                <div className="space-y-1 text-xs">
                                  <p className="flex justify-between gap-4">
                                    <span className="text-gray-600">Open:</span>
                                    <span className="font-bold">${data.open?.toFixed(2)}</span>
                                  </p>
                                  <p className="flex justify-between gap-4">
                                    <span className="text-gray-600">High:</span>
                                    <span className="font-bold text-green-600">${data.high?.toFixed(2)}</span>
                                  </p>
                                  <p className="flex justify-between gap-4">
                                    <span className="text-gray-600">Low:</span>
                                    <span className="font-bold text-red-600">${data.low?.toFixed(2)}</span>
                                  </p>
                                  <p className="flex justify-between gap-4">
                                    <span className="text-gray-600">Close:</span>
                                    <span className="font-bold">${data.close?.toFixed(2)}</span>
                                  </p>
                                </div>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Bar
                        dataKey="high"
                        shape={<CustomCandlestick />}
                        isAnimationActive={false}
                      />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
