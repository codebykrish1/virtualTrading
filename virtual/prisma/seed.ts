import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Create demo user if it doesn't exist
  const existingUser = await prisma.user.findUnique({
    where: { email: "demo@user.com" },
  });

  if (!existingUser) {
    const user = await prisma.user.create({
      data: {
        email: "demo@user.com",
        balance: 1000000,
      },
    });
    console.log("✅ Created demo user:", user.email);
  } else {
    console.log("✅ Demo user already exists:", existingUser.email);
  }
}

main()
  .catch((e) => {
    console.error("❌ Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
