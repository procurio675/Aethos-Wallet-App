import * as dotenv from "dotenv";
import * as path from "path";
dotenv.config({ path: path.resolve(__dirname, "../.env") });
import { prisma } from "./index.js";

async function main() {
  console.log("Seeding database...");

  // 1. Clear existing data
  console.log("Clearing existing data...");
  await prisma.transaction.deleteMany();
  await prisma.bankAccount.deleteMany();
  await prisma.mockBankLedger.deleteMany();
  await prisma.user.deleteMany();

  const REAL_PASSWORD_HASH = "$2b$10$JNY2aoa2bakoEXWW0O9mnO4AyRJzJbZ8f1jaq8J.p5zo8cNWN17tq"; // "[REDACTED]"
  const MOCK_PIN_HASH = "1234-hash"; // Representing PIN '1234'

  // User 1
  const user1 = await prisma.user.create({
    data: {
      email: "user1@example.com",
      phone: "1111111111",
      name: "User One",
      passwordHash: REAL_PASSWORD_HASH,
      walletBalance: 5000000, // ₹50,000
      bankAccounts: {
        create: [
          {
            bankName: "HDFC Bank",
            accountNo: "USER1_001",
            last4: "0001",
            ifsc: "HDFC0001234",
            isPrimary: true,
          },
          {
            bankName: "ICICI Bank",
            accountNo: "USER1_002",
            last4: "0002",
            ifsc: "ICIC0005678",
            isPrimary: false,
          },
        ],
      },
    },
    include: { bankAccounts: true },
  });

  // User 2
  const user2 = await prisma.user.create({
    data: {
      email: "user2@example.com",
      phone: "2222222222",
      name: "User Two",
      passwordHash: REAL_PASSWORD_HASH,
      walletBalance: 5000000, // ₹50,000
      bankAccounts: {
        create: [
          {
            bankName: "SBI Bank",
            accountNo: "USER2_001",
            last4: "2001",
            ifsc: "SBIN0001234",
            isPrimary: true,
          },
          {
            bankName: "Axis Bank",
            accountNo: "USER2_002",
            last4: "2002",
            ifsc: "UTIB0003456",
            isPrimary: false,
          },
        ],
      },
    },
    include: { bankAccounts: true },
  });

  // Mock Bank Ledgers — one per account, all with ₹50,000
  await prisma.mockBankLedger.createMany({
    data: [
      { accountNumber: "USER1_001", pinHash: MOCK_PIN_HASH, bankBalance: 5000000 },
      { accountNumber: "USER1_002", pinHash: MOCK_PIN_HASH, bankBalance: 5000000 },
      { accountNumber: "USER2_001", pinHash: MOCK_PIN_HASH, bankBalance: 5000000 },
      { accountNumber: "USER2_002", pinHash: MOCK_PIN_HASH, bankBalance: 5000000 },
    ],
  });

  // Seed Transactions for Visualization
  console.log("Seeding dummy transactions...");
  const pastDate = (daysAgo: number) => new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);

  const user1PrimaryBank = user1.bankAccounts.find((b) => b.isPrimary)!;

  if (user1PrimaryBank) {
    await prisma.transaction.createMany({
      data: [
        { type: "DEPOSIT",    amount: 500000,  status: "SUCCESS", receiverId: user1.id, bankAccountId: user1PrimaryBank.id, createdAt: pastDate(0) },
        { type: "WITHDRAWAL", amount: 150000,  status: "SUCCESS", senderId: user1.id,   bankAccountId: user1PrimaryBank.id, createdAt: pastDate(1) },
        { type: "TRANSFER",   amount: 200000,  status: "SUCCESS", senderId: user1.id,   receiverId: user2.id,            createdAt: pastDate(2) },
        { type: "DEPOSIT",    amount: 1000000, status: "PENDING", receiverId: user1.id, bankAccountId: user1PrimaryBank.id, createdAt: pastDate(3) },
        { type: "TRANSFER",   amount: 50000,   status: "FAILED",  senderId: user2.id,   receiverId: user1.id, failureReason: "Insufficient Funds", createdAt: pastDate(4) },
        ...Array.from({ length: 20 }).map((_, i) => ({
          type: "DEPOSIT" as any, amount: 10000 * (i + 1), status: "SUCCESS" as any,
          receiverId: user1.id, bankAccountId: user1PrimaryBank.id, createdAt: pastDate(i + 5),
        })),
      ],
    });
  }

  console.log("✅ Seed completed!");
  console.log("   User 1    → HDFC Bank (USER1_001) + ICICI Bank (USER1_002)");
  console.log("   User 2    → SBI Bank  (USER2_001) + Axis Bank  (USER2_002)");
  console.log("   All 4 bank accounts seeded with ₹50,000 in the Mock Bank Ledger.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
