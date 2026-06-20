import express from "express";
import { prisma } from "@repo/db";
import "dotenv/config";

const app = express();
app.use(express.json());

app.post("/webhook", async (req, res) => {
  const { token, userId, amount } = req.body;

  if (!token || !userId || !amount) {
    return res.status(400).json({ error: "Missing required fields: token, userId, amount" });
  }

  try {
    await prisma.$transaction(async (tx) => {
      // 1. Pessimistic Row Lock (FOR UPDATE)
      // Locks the specific transaction row to prevent concurrent webhook calls
      // from processing the same deposit twice.
      const transactions = await tx.$queryRaw<any[]>`
        SELECT * FROM "Transaction"
        WHERE token = ${token}
        FOR UPDATE
      `;

      if (transactions.length === 0) {
        throw new Error("Transaction not found");
      }

      const transaction = transactions[0];

      // 2. Idempotency Check
      if (transaction.status === "SUCCESS") {
        console.log(`Webhook already processed for token: ${token}`);
        return; // Safe idempotency return
      }

      if (transaction.status === "FAILED") {
        throw new Error("Transaction already failed");
      }

      if (transaction.type !== "DEPOSIT") {
        throw new Error("Webhook handles deposits only");
      }

      // 3. Update wallet balance safely
      // The CHECK ("walletBalance" >= 0) constraint in the DB ensures we never go negative
      // (even though this is a credit, it's good practice)
      await tx.$executeRaw`
        UPDATE "User"
        SET "walletBalance" = "walletBalance" + ${amount}
        WHERE id = ${userId}
      `;

      // 4. Update transaction status
      await tx.$executeRaw`
        UPDATE "Transaction"
        SET status = 'SUCCESS', "updatedAt" = NOW()
        WHERE id = ${transaction.id}
      `;
    });

    console.log(`✅ Successfully processed webhook for deposit token: ${token}`);
    res.json({ message: "Webhook processed successfully" });
  } catch (error: any) {
    console.error("❌ Webhook processing error:", error.message);
    res.status(400).json({ error: error.message });
  }
});

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
  console.log(`Webhook Handler running on port ${PORT}`);
});
