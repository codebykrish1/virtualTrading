import { NextResponse } from "next/server";
import { getStockQuote, getCompanyProfile, getStockCandles } from "@/lib/finnhub";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ symbol: string }> }
) {
  const { symbol: rawSymbol } = await params;
  const symbol = rawSymbol.toUpperCase();

  // Get timeframe from query params (default to daily)
  const { searchParams } = new URL(req.url);
  const resolution = searchParams.get("resolution") || "D";
  const days = parseInt(searchParams.get("days") || "30");

  try {
    const [quote, profile, candles] = await Promise.all([
      getStockQuote(symbol),
      getCompanyProfile(symbol),
      getStockCandles(symbol, resolution, days),
    ]);

    return NextResponse.json({
      symbol,
      price: {
        current: quote.c,
        open: quote.o,
        high: quote.h,
        low: quote.l,
        previousClose: quote.pc,
        change: quote.d,
        changePercent: quote.dp,
      },
      company: {
        name: profile.name,
        logo: profile.logo,
        industry: profile.finnhubIndustry,
        exchange: profile.exchange,
        marketCap: profile.marketCapitalization,
        website: profile.weburl,
      },
      history: {
        timestamps: candles.t,
        dates: candles.t?.map((t: number) =>
          new Date(t * 1000).toISOString().split("T")[0]
        ),
        close: candles.c,
        open: candles.o,
        high: candles.h,
        low: candles.l,
        volume: candles.v,
      },
    });
  } catch (error) {
    console.error("Stock API Error:", error);
    return NextResponse.json(
      { error: String(error) },
      { status: 500 }
    );
  }
}



// http://localhost:3000/api/stock/AAPL
// http://localhost:3000/api/stock/AAPL?resolution=1&days=1
// http://localhost:3000/api/stock/AAPL?resolution=5&days=7
// http://localhost:3000/api/stock/TSLA
// http://localhost:3000/api/stock/GOOGL