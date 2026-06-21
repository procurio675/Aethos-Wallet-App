import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth";
import { prisma } from "@repo/db";
import DashboardNavbar from "@/components/dashboard/navbar";
import Sidebar from "@/components/dashboard/sidebar";
import AutoRefresh from "@/components/dashboard/auto-refresh";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/auth/signin");
  }

  const notifications = await prisma.notification.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  return (
    <div className="min-h-screen bg-[#080810] flex flex-col relative">
      <AutoRefresh intervalMs={20000} />
      <DashboardNavbar 
        userName={session.user.name || "User"} 
        notifications={notifications}
      />
      
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 py-8 md:ml-64">
          {children}
        </main>
      </div>
    </div>
  );
}
