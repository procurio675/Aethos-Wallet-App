import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import SendMoneyForm from "./send-money-form";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { prisma } from "@repo/db";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function SendMoneyPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/auth/signin");
  }

  const userId = session.user.id;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { walletBalance: true },
  });

  const balanceInRupees = (user?.walletBalance ?? 0) / 100;

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-2 text-sm text-white/50 hover:text-white transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Dashboard
      </Link>

      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-white">Send Money</h1>
          <p className="text-white/50 text-sm mt-1">
            Transfer funds instantly to another wallet user via their phone number.
          </p>
        </div>

        <SendMoneyForm currentBalance={balanceInRupees} />
      </div>
    </div>
  );
}
