import { prisma } from "@repo/db";
import PinForm from "./pin-form";
import crypto from "crypto";

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function PayPage({ searchParams }: Props) {
  const resolvedParams = await searchParams;
  const token = typeof resolvedParams.token === "string" ? resolvedParams.token : undefined;
  const amount = typeof resolvedParams.amount === "string" ? resolvedParams.amount : undefined;
  const signature = typeof resolvedParams.signature === "string" ? resolvedParams.signature : undefined;

  if (!token || !amount || !signature) {
    return <ErrorUI message="400 Bad Request: Missing transaction token, amount, or signature." />;
  }

  const secret = process.env.BANK_WEBHOOK_SECRET;
  if (!secret) {
    console.error("BANK_WEBHOOK_SECRET is not configured on the mock bank");
    return <ErrorUI message="500 Internal Server Error: Bank configuration missing." />;
  }

  // 1. Verify HMAC Signature
  const expectedSignature = crypto.createHmac("sha256", secret)
                                  .update(`${token}:${amount}`)
                                  .digest("hex");

  if (signature !== expectedSignature) {
    return <ErrorUI message="400 Bad Request: Invalid cryptographic signature. Request tampered." />;
  }

  // 1. Verify token exists and is PENDING in the shared DB
  const tx = await prisma.transaction.findUnique({
    where: { token },
  });

  if (!tx) {
    return <ErrorUI message="400 Bad Request: Invalid or fake transaction token." />;
  }

  if (tx.status !== "PENDING") {
    return <ErrorUI message="400 Bad Request: Transaction has already been processed or is expired." />;
  }

  // 2. Fetch Bank details for UI using the bankAccountId from the transaction
  const bankAccount = await prisma.bankAccount.findUnique({
    where: { id: tx.bankAccountId! },
  });

  // Valid Token: Render PIN screen
  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", backgroundColor: "#f9fafb", fontFamily: "sans-serif" }}>
      <div style={{ background: "white", padding: "40px", borderRadius: "16px", boxShadow: "0 10px 25px rgba(0,0,0,0.05)", width: "100%", maxWidth: "400px", textAlign: "center" }}>
        <div style={{ marginBottom: "24px" }}>
          <div style={{ width: "48px", height: "48px", background: "#10b981", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
            </svg>
          </div>
          <h1 style={{ fontSize: "24px", fontWeight: "600", color: "#111827", marginBottom: "8px", lineHeight: "1.2" }}>
            {bankAccount?.bankName || "Secure Bank Gateway"}
          </h1>
          <p style={{ color: "#6b7280", fontSize: "15px" }}>
            Authorize payment of <b style={{ color: "#111827" }}>₹{(Number(amount) / 100).toLocaleString("en-IN")}</b>
          </p>
        </div>

        <PinForm token={token} amount={amount!} signature={signature} />
      </div>
      
    </div>
  );
}

function ErrorUI({ message }: { message: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", backgroundColor: "#fef2f2", color: "#991b1b", fontFamily: "sans-serif" }}>
      <div style={{ textAlign: "center", background: "white", padding: "40px", borderRadius: "16px", boxShadow: "0 10px 25px rgba(0,0,0,0.05)", maxWidth: "400px" }}>
        <div style={{ width: "48px", height: "48px", background: "#fee2e2", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
        </div>
        <h1 style={{ fontSize: "20px", fontWeight: "600", marginBottom: "8px", color: "#991b1b" }}>Payment Error</h1>
        <p style={{ fontSize: "15px", color: "#b91c1c" }}>{message}</p>
      </div>
    </div>
  );
}
