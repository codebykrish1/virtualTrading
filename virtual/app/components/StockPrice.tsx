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

export default function StockPrice({ symbol }: { symbol: string }) {
  const [data, setData] = useState<StockData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchStock = () => {
      fetch(`/api/stock/${symbol}`)
        .then((res) => res.json())
        .then((data) => {
          setData(data);
          setLoading(false);
        })
        .catch(() => {
          setError("Failed to load stock data");
          setLoading(false);
        });
    };

    fetchStock(); // fetch immediately

    const interval = setInterval(fetchStock, 30000); // refresh every 30 seconds

    return () => clearInterval(interval); // cleanup on unmount
  }, [symbol]);

  if (loading) return <div>Loading {symbol}...</div>;
  if (error) return <div>{error}</div>;
  if (!data) return null;

  const isPositive = data.price.change >= 0;

  return (
    <div className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-2xl p-5 w-72 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
      <div className="flex items-center gap-3 mb-4">
        {data.company.logo ? (
          <img src={data.company.logo} alt={symbol} className="w-12 h-12 rounded-xl shadow-md" />
        ) : (
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-md">
            {symbol[0]}
          </div>
        )}
        <div className="flex-1">
          <h2 className="font-bold text-xl text-gray-900">{symbol}</h2>
          <p className="text-xs text-gray-500 truncate">{data.company.name}</p>
        </div>
      </div>

      <div className="mb-4">
        <p className="text-4xl font-bold text-gray-900 mb-1">
          ${data.price.current.toFixed(2)}
        </p>
        <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold ${
          isPositive 
            ? "bg-green-100 text-green-700" 
            : "bg-red-100 text-red-700"
        }`}>
          <span>{isPositive ? "▲" : "▼"}</span>
          <span>{Math.abs(data.price.change).toFixed(2)}</span>
          <span>({Math.abs(data.price.changePercent).toFixed(2)}%)</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 text-sm border-t border-gray-200 pt-3">
        <div className="bg-gray-50 rounded-lg p-2">
          <p className="text-xs text-gray-400">Open</p>
          <p className="font-semibold text-gray-800">${data.price.open.toFixed(2)}</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-2">
          <p className="text-xs text-gray-400">High</p>
          <p className="font-semibold text-green-600">${data.price.high.toFixed(2)}</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-2">
          <p className="text-xs text-gray-400">Low</p>
          <p className="font-semibold text-red-600">${data.price.low.toFixed(2)}</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-2">
          <p className="text-xs text-gray-400">Prev Close</p>
          <p className="font-semibold text-gray-800">${data.price.previousClose.toFixed(2)}</p>
        </div>
      </div>

      <div className="flex items-center justify-center gap-1 text-xs text-gray-400 mt-3 pt-3 border-t border-gray-100">
        <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
        <span>Auto-refreshes every 30s</span>
      </div>
    </div>
  );
}