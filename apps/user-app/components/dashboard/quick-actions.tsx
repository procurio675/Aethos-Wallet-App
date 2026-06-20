import { Plus, Send, ArrowDownToLine } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";

export default function QuickActions() {
  const actions = [
    {
      name: "Add Money",
      icon: <Plus className="w-6 h-6 text-emerald-400" />,
      desc: "From bank to wallet",
      hoverStyle: "hover:bg-emerald-500/10 hover:border-emerald-500/30",
      href: "/dashboard/add-money",
    },
    {
      name: "Send Money",
      icon: <Send className="w-6 h-6 text-violet-400" />,
      desc: "P2P transfer",
      hoverStyle: "hover:bg-violet-500/10 hover:border-violet-500/30",
      href: "/dashboard/send-money",
    },
    {
      name: "Withdraw",
      icon: <ArrowDownToLine className="w-6 h-6 text-blue-400" />,
      desc: "Wallet to bank",
      hoverStyle: "hover:bg-blue-500/10 hover:border-blue-500/30",
      href: "/dashboard/withdraw",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {actions.map((action) => (
        <Link key={action.name} href={action.href}>
          <Card
            className={`bg-white/[0.02] border-white/5 cursor-pointer transition-all duration-300 group ${action.hoverStyle} h-full`}
          >
            <CardContent className="p-6 flex flex-col items-center justify-center text-center h-full">
              <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110">
                {action.icon}
              </div>
              <h3 className="text-sm font-semibold text-white mb-1">{action.name}</h3>
              <p className="text-xs text-white/40">{action.desc}</p>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}
