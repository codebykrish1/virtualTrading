# Virtual Trading Platform

A web-based virtual stock trading application built with Next.js. It lets users explore stock information and practice buying and selling shares with a simulated balance, without placing real trades or using real money.

## Features

- **Authentication:** Kinde authentication integration.
- **Dashboard:** A central page for accessing the trading experience.
- **Stock information:** Fetches stock quotes, company profiles, and historical candle data through the Finnhub API.
- **Virtual trading:** Buy and sell shares using a simulated account balance.
- **Portfolio tracking:** View current holdings and average purchase prices.
- **Trade history and performance:** Retrieve recorded trades and portfolio information.
- **Charts:** Recharts is available for displaying market or performance data.
- **Database foundation:** Prisma schema models users, portfolios, and trades with MongoDB.
- **Responsive UI:** Built with the Next.js App Router and global styling.

> **Important:** This is a practice/simulation project, not a brokerage. The current trading API routes use an in-memory demo store, so trades and balances are not durable and may reset when the server restarts. The Prisma/MongoDB schema is present, but the demo trading routes need to be connected to persistent storage before the application is used as a multi-user platform.

## Tech Stack

- **Framework:** Next.js 16, React 19
- **Language:** TypeScript and JavaScript
- **Authentication:** Kinde Auth for Next.js
- **Market data:** Finnhub API
- **Database layer:** MongoDB with Prisma ORM
- **Charts:** Recharts
- **Styling:** Tailwind CSS 4 and global CSS
- **Code quality:** ESLint

## Project Structure

```text
virtual/
├── app/
│   ├── api/
│   │   ├── auth/[kindeAuth]/   # Kinde authentication route
│   │   ├── balance/            # Simulated balance endpoint
│   │   ├── performance/        # Trade/performance data endpoint
│   │   ├── portfolio/           # Portfolio endpoint
│   │   ├── stock/[symbol]/     # Quote, company and historical data
│   │   └── trade/               # Simulated buy/sell endpoint
│   ├── components/
│   │   ├── NavClient.tsx
│   │   └── StockPrice.tsx
│   ├── dashboard/
│   ├── performance/
│   ├── portfolio/
│   ├── trade/
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── lib/
│   ├── demo-store.ts            # In-memory demo account and trading data
│   ├── finnhub.ts               # Finnhub API helpers
│   └── prisma.ts                # Prisma client
├── prisma/
│   ├── schema.prisma            # MongoDB data models
│   └── seed.ts
├── middleware.ts                # Kinde route protection
├── next.config.ts
├── package.json
└── tsconfig.json
```

## Prerequisites

Install these before starting:

- Node.js compatible with the installed Next.js version
- npm
- A Kinde application configured for Next.js
- A Finnhub API key
- MongoDB, if you plan to connect the Prisma models to persistent storage

## Getting Started

### 1. Extract and enter the project

Open a terminal in the `virtual` directory (the directory containing `package.json`).

```bash
cd virtual
```

If you cloned the repository, use the appropriate repository path before entering this directory.

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file in the `virtual` project directory. Add the values required by your own services:

```env
# Market data
FINNHUB_API_KEY=your_finnhub_api_key

# MongoDB / Prisma
DATABASE_URL="your_mongodb_connection_string"

# Kinde authentication
KINDE_CLIENT_ID=your_kinde_client_id
KINDE_CLIENT_SECRET=your_kinde_client_secret
KINDE_ISSUER_URL=https://your-kinde-domain
KINDE_SITE_URL=http://localhost:3000
KINDE_POST_LOGOUT_REDIRECT_URL=http://localhost:3000
KINDE_POST_LOGIN_REDIRECT_URL=http://localhost:3000/dashboard
```

Use the exact environment variable names and callback settings required by the Kinde SDK configuration in your project and Kinde dashboard. Configure the matching allowed callback and logout URLs in Kinde. Never commit `.env` or real credentials to source control.

### 4. Generate the Prisma client

After setting `DATABASE_URL`, run:

```bash
npx prisma generate
```

The project uses MongoDB with Prisma. If you change the Prisma schema, regenerate the client. Follow Prisma's MongoDB setup requirements for your database deployment.

### 5. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 6. Create a production build

```bash
npm run build
npm run start
```

## Available Scripts

Run these commands from the `virtual` directory:

| Command | Description |
|---|---|
| `npm run dev` | Starts the Next.js development server. |
| `npm run build` | Builds the app for production. |
| `npm run start` | Starts the production server. |
| `npm run lint` | Runs ESLint. |

## API Endpoints

The application exposes these Next.js route handlers:

| Method | Endpoint | Purpose |
|---|---|---|
| `GET` | `/api/stock/:symbol` | Returns a stock quote, company profile, and historical price data from Finnhub. |
| `GET` | `/api/portfolio` | Returns the demo portfolio and summary information. |
| `POST` | `/api/trade` | Records a simulated `BUY` or `SELL` trade and updates the demo balance/holdings. |
| `POST` | `/api/balance` | Sets the demo account balance. |
| `GET` | `/api/performance` | Returns demo trades, portfolio holdings, and account summary data. |
| `/api/auth/[kindeAuth]` | Kinde route | Handles authentication callbacks and related Kinde actions. |

### Stock API examples

```text
GET http://localhost:3000/api/stock/AAPL
GET http://localhost:3000/api/stock/AAPL?resolution=1&days=1
GET http://localhost:3000/api/stock/AAPL?resolution=5&days=7
GET http://localhost:3000/api/stock/TSLA
GET http://localhost:3000/api/stock/GOOGL
```

Supported candle resolutions depend on Finnhub's API, such as `1`, `5`, `15`, `60`, and `D`.

### Trade request example

`POST /api/trade` expects JSON similar to:

```json
{
  "symbol": "AAPL",
  "quantity": 2,
  "price": 190,
  "type": "BUY"
}
```

Use `type: "SELL"` to simulate selling shares. The current implementation performs basic balance and holding checks. Validate positive quantities/prices and allowed trade types before relying on it.

## Database Models

The Prisma schema defines three MongoDB-backed models:

- **User:** Email and simulated account balance.
- **Portfolio:** Stock symbol, quantity, average purchase price, and associated user.
- **Trade:** Symbol, quantity, trade price, type, user association, and timestamp.

Although these models are defined in `prisma/schema.prisma`, the current portfolio, trade, balance, and performance route handlers use `lib/demo-store.ts`. To persist data, replace the in-memory operations with Prisma queries and associate every request with the authenticated user.

## Authentication and Route Protection

Kinde middleware is configured to protect the dashboard, trade, portfolio, and performance pages. Configure the Kinde application URLs and environment variables for your local and deployed environments. API route handlers should also independently verify the current user and authorize access to that user's data.

## Known Limitations and Suggested Improvements

- **In-memory data:** Demo trades and balances are not persistent and are shared by the running server process.
- **Multi-user isolation:** Connect all trading endpoints to the authenticated user's database records.
- **Trade validation:** Reject invalid trade types, non-positive quantities/prices, malformed symbols, and invalid numeric values.
- **Market data errors:** Handle Finnhub rate limits, invalid symbols, missing data, and API errors gracefully.
- **Financial calculations:** Add realized/unrealized profit and loss, transaction timestamps, and a clear fee/slippage policy if desired.
- **Testing:** Add unit and integration tests for buying, selling, balance updates, and portfolio calculations.
- **Production readiness:** Add appropriate logging, rate limiting, security checks, and deployment configuration.

## Disclaimer

This application is for educational and demonstration purposes only. It simulates stock trades and does not execute real orders. Market data may be delayed, limited, or subject to Finnhub plan restrictions. Nothing in this project is financial advice.

## License

No license is specified in the project files. Add a `LICENSE` file if you intend to distribute the project publicly.
