import { prisma } from "./packages/db/src/index.ts";

async function debug() {
  const stuckTx = await prisma.transaction.findFirst({
    where: { status: 'PROCESSING' }
  });
  console.log("Stuck TX:", stuckTx);

  if (stuckTx && stuckTx.token) {
    const idempotencyLog = await prisma.idempotencyKey.findUnique({
      where: { key: stuckTx.token }
    });
    console.log("Idempotency Log for token:", idempotencyLog);
  }
}

debug().catch(console.error).finally(() => prisma.$disconnect());
