import express from "express";
import { z } from "zod";

const app = express();
const PORT = process.env.PORT ?? 3002;

app.use(express.json());

/**
 * POST /webhook
 * Receives payment callbacks from mock-bank.
 *
 * Security model:
 *  1. Validate the incoming payload with Zod
 *  2. Open a Prisma transaction
 *  3. Apply SELECT ... FOR UPDATE (pessimistic row lock) on the transaction row
 *  4. Verify the transaction is still PENDING
 *  5. Set status to SUCCESS / FAILURE and credit the user's wallet atomically
 *  6. Commit — lock releases automatically
 *
 * Idempotency guarantee: if a duplicate webhook arrives while the lock is held,
 * it waits, then sees the status is already SUCCESS and terminates safely.
 */

const webhookPayloadSchema = z.object({
  token: z.string().min(1),
  status: z.enum(["SUCCESS", "FAILURE"]),
  amount: z.number().positive().optional(),
});

app.post("/webhook", async (req, res) => {
  const parsed = webhookPayloadSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({ error: "Invalid payload", issues: parsed.error.issues });
    return;
  }

  const { token, status } = parsed.data;

  try {
    // TODO: Implement pessimistic row lock logic with @repo/db (prisma.$transaction + raw SELECT FOR UPDATE)
    console.log(`[webhook-handler] Received callback — token: ${token}, status: ${status}`);

    // Placeholder response — real implementation will use @repo/db
    res.status(200).json({ message: "Webhook received", token, status });
  } catch (error) {
    console.error("[webhook-handler] Error processing webhook:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "webhook-handler" });
});

app.listen(PORT, () => {
  console.log(`[webhook-handler] Listening on port ${PORT}`);
});
