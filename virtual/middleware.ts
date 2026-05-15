import { withAuth } from "@kinde-oss/kinde-auth-nextjs/middleware";
import { NextRequest } from "next/server";

export default withAuth(
  function middleware(req: NextRequest) {
    // Additional middleware logic can go here
  },
  {
    isReturnToCurrentPage: true,
  }
);

export const config = {
  matcher: ["/dashboard", "/trade", "/portfolio", "/performance"],
};
