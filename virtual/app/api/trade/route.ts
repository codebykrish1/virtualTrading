import { NextResponse } from "next/server";
import { demoStore } from "@/lib/demo-store";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { symbol, quantity, price, type } = body;

    if (!symbol || !quantity || !price || !type) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const qty = Number(quantity);
    const tradePrice = Number(price);
    const totalCost = qty * tradePrice;

    if (type === "BUY") {
      if (demoStore.user.balance < totalCost) {
        return NextResponse.json({ error: "Insufficient balance" }, { status: 400 });
      }

      demoStore.user.balance -= totalCost;

      const existing = demoStore.portfolio.find((p) => p.symbol === symbol);
      if (existing) {
        const newQty = existing.quantity + qty;
        existing.avgPrice = (existing.avgPrice * existing.quantity + tradePrice * qty) / newQty;
        existing.quantity = newQty;
      } else {
        demoStore.portfolio.push({
          id: `portfolio-${Date.now()}`,
          symbol,
          quantity: qty,
          avgPrice: tradePrice,
          userId: demoStore.user.id,
        });
      }
    } else if (type === "SELL") {
      const holding = demoStore.portfolio.find((p) => p.symbol === symbol);
      if (!holding || holding.quantity < qty) {
        return NextResponse.json({ error: "Not enough shares to sell" }, { status: 400 });
      }

      demoStore.user.balance += totalCost;
      holding.quantity -= qty;

      if (holding.quantity === 0) {
        const idx = demoStore.portfolio.indexOf(holding);
        demoStore.portfolio.splice(idx, 1);
      }
    }

    demoStore.trades.push({
      id: `trade-${Date.now()}`,
      symbol,
      quantity: qty,
      price: tradePrice,
      type,
      userId: demoStore.user.id,
      createdAt: new Date(),
    });

    return NextResponse.json({ success: true, message: "Trade executed successfully 🚀" });
  } catch (err) {
    console.error("Trade error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
