import { NextResponse } from "next/server";
import { demoStore } from "@/lib/demo-store";

export async function POST(req: Request) {
  try {
    const { balance } = await req.json();
    const newBalance = Number(balance);
    if (isNaN(newBalance) || newBalance < 0) {
      return NextResponse.json({ error: "Invalid balance" }, { status: 400 });
    }
    demoStore.user.balance = newBalance;
    return NextResponse.json({ success: true, balance: demoStore.user.balance });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
