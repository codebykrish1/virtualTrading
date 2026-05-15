import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    clientId: process.env.KINDE_CLIENT_ID ? "✓ Set" : "✗ Missing",
    clientSecret: process.env.KINDE_CLIENT_SECRET ? "✓ Set" : "✗ Missing",
    issuerUrl: process.env.KINDE_ISSUER_URL || "✗ Missing",
    siteUrl: process.env.KINDE_SITE_URL || "✗ Missing",
    postLoginRedirect: process.env.KINDE_POST_LOGIN_REDIRECT_URL || "✗ Missing",
  });
}
