import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth";
import DashboardNavbar from "@/components/dashboard/navbar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/auth/signin");
  }

  return (
    <div className="min-h-screen bg-[#080810] flex flex-col">
      <DashboardNavbar userName={session.user.name || "User"} />
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {children}
      </main>
    </div>
  );
}
