import express from "express";
import { prisma } from "@repo/db";
import "dotenv/config";
import crypto from "crypto";

const app = express();
app.use(express.json());

app.post("/webhook", async (req, res) => {
  const { token, status } = req.body;
  const receivedSignature = req.headers["x-bank-signature"] as string | undefined;

  if (!token || !status) {
    return res.status(400).json({ error: "Missing required fields: token, status" });
  }

  // 1. Verify HMAC Signature
  const secret = process.env.BANK_WEBHOOK_SECRET;
  if (!secret) {
    console.error("❌ BANK_WEBHOOK_SECRET is not configured");
    return res.status(500).json({ error: "Webhook secret not configured" });
  }

  if (!receivedSignature) {
    console.error("❌ Missing x-bank-signature header");
    return res.status(401).json({ error: "Missing signature" });
  }

  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(JSON.stringify({ token, status }))
    .digest("hex");

  if (receivedSignature !== expectedSignature) {
    console.error(`❌ Signature mismatch for token: ${token}`);
    return res.status(401).json({ error: "Invalid signature — request rejected" });
  }

  console.log(`🔐 Signature verified for token: ${token}`);

  try {
    await prisma.$transaction(async (tx) => {
      // Step 3: LOCK 2 (The Transaction Lock)
      // Opens atomic DB transaction and applies Pessimistic Row Lock on the Transaction row.
      // If the bank sent two webhooks, the second is frozen here.
      const transactions = await tx.$queryRaw<any[]>`
        SELECT * FROM "Transaction"
        WHERE token = ${token}
        FOR UPDATE
      `;

      if (transactions.length === 0) {
        throw new Error("Transaction not found");
      }

      const transaction = transactions[0];

      // Step 4: Idempotency Check
      // Verify row is still PENDING. If already SUCCESS, safely terminate.
      if (transaction.status === "SUCCESS") {
        console.log(`Webhook already processed for token: ${token}. Safely terminating.`);
        return; // Safely terminates
      }

      if (transaction.status === "FAILED") {
        throw new Error("Transaction already failed");
      }

      if (transaction.type !== "DEPOSIT") {
        throw new Error("Webhook handles deposits only");
      }

      // Extract details from locked DB row securely
      const userId = transaction.receiverId;
      const amount = Number(transaction.amount);

      // Step 5: State Update
      // Changes the transaction status to SUCCESS
      await tx.transaction.update({
        where: { id: transaction.id },
        data: {
          status: 'SUCCESS'
        }
      });

      // Step 6: LOCK 3 (The Wallet Increment)
      // Applies a lock to the User row via Prisma's native atomic increment and adds the money
      await tx.user.update({
        where: { id: userId },
        data: {
          walletBalance: {
            increment: amount
          }
        }
      });
      
      // Step 7: Commit
      // The Prisma $transaction block ends here, naturally committing the database transaction
      // and releasing all locks (Transaction lock and User lock).
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
