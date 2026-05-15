const API_KEY = process.env.FINNHUB_API_KEY!;
const BASE_URL = "https://finnhub.io/api/v1";

export async function getStockQuote(symbol: string) {
  const res = await fetch(`${BASE_URL}/quote?symbol=${symbol}&token=${API_KEY}`);
  return res.json();
}

export async function getCompanyProfile(symbol: string) {
  const res = await fetch(`${BASE_URL}/stock/profile2?symbol=${symbol}&token=${API_KEY}`);
  return res.json();
}

export async function getStockCandles(
  symbol: string,
  resolution: string = "D",
  days: number = 30
) {
  const to = Math.floor(Date.now() / 1000);
  let from: number;

  // Calculate 'from' based on resolution and days
  switch (resolution) {
    case "1": // 1 minute
      from = to - days * 24 * 60 * 60; // days worth of 1-min data
      break;
    case "5": // 5 minutes
      from = to - days * 24 * 60 * 60;
      break;
    case "15": // 15 minutes
      from = to - days * 24 * 60 * 60;
      break;
    case "60": // 1 hour
      from = to - days * 24 * 60 * 60;
      break;
    case "D": // Daily
      from = to - days * 24 * 60 * 60;
      break;
    default:
      from = to - 30 * 24 * 60 * 60;
  }

  const res = await fetch(
    `${BASE_URL}/stock/candle?symbol=${symbol}&resolution=${resolution}&from=${from}&to=${to}&token=${API_KEY}`
  );
  return res.json();
}