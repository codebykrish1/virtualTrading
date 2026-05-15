// Shared in-memory storage for demo mode
export const demoStore = {
  user: {
    id: "demo-user-id",
    email: "demo@user.com",
    balance: 1000000,
  },
  portfolio: [] as Array<{
    id: string;
    symbol: string;
    quantity: number;
    avgPrice: number;
    userId: string;
  }>,
  trades: [] as Array<{
    id: string;
    symbol: string;
    quantity: number;
    price: number;
    type: string;
    userId: string;
    createdAt: Date;
  }>,
};
