import { prisma } from "./index.js";

async function main() {
  console.log("Applying CHECK constraints for non-negative balances...");
  
  try {
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "User" ADD CONSTRAINT "wallet_balance_non_negative" CHECK ("walletBalance" >= 0);
    `);
    console.log("✅ Added wallet_balance_non_negative constraint on User table.");
  } catch (error: any) {
    if (error.message.includes("already exists")) {
      console.log("⚠️ wallet_balance_non_negative constraint already exists.");
    } else {
      console.error("❌ Failed to add User constraint:", error.message);
    }
  }

  try {
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "MockBankLedger" ADD CONSTRAINT "bank_balance_non_negative" CHECK ("bankBalance" >= 0);
    `);
    console.log("✅ Added bank_balance_non_negative constraint on MockBankLedger table.");
  } catch (error: any) {
    if (error.message.includes("already exists")) {
      console.log("⚠️ bank_balance_non_negative constraint already exists.");
    } else {
      console.error("❌ Failed to add MockBankLedger constraint:", error.message);
    }
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
