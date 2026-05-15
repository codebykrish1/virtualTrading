import { NextResponse } from "next/server";
import { demoStore } from "@/lib/demo-store";

export async function GET() {
  return NextResponse.json({
    portfolio: demoStore.portfolio,
    user: {
      balance: demoStore.user.balance,
      trades: demoStore.trades.length,
    },
  });
}
