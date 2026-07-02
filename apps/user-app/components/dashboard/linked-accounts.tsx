"use client";

import { Building2, Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const mockAccounts = [
  {
    id: "acc_1",
    bankName: "HDFC Bank",
    last4: "0001",
    isPrimary: true,
  },
  {
    id: "acc_2",
    bankName: "State Bank of India",
    last4: "0002",
    isPrimary: false,
  },
];

export default function LinkedAccounts() {
  return (
    <Card
      className="backdrop-blur-xl h-fit transition-colors duration-300"
      style={{ backgroundColor: "var(--surface-raised)", borderColor: "var(--border-subtle)" }}
    >
      <CardHeader className="flex flex-row items-center justify-between pb-4" style={{ borderBottom: "1px solid var(--border-subtle)" }}>
        <CardTitle className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>Bank Accounts</CardTitle>
        <button style={{ color: "var(--text-secondary)" }} className="hover:opacity-80 transition-opacity">
          <Plus className="w-5 h-5" />
        </button>
      </CardHeader>
      <CardContent className="p-0">
        <div className="flex flex-col">
          {mockAccounts.map((acc, i) => (
            <div
              key={acc.id}
              className="flex items-center gap-4 p-4 transition-colors cursor-pointer"
              style={{ borderBottom: i !== mockAccounts.length - 1 ? "1px solid var(--border-subtle)" : "none" }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "var(--surface-hover)"}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
            >
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                style={{ backgroundColor: "var(--surface-active)" }}
              >
                <Building2 className="w-5 h-5" style={{ color: "var(--text-secondary)" }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate" style={{ color: "var(--text-primary)" }}>{acc.bankName}</p>
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>•••• {acc.last4}</p>
              </div>
              {acc.isPrimary && (
                <Badge variant="outline" className="bg-violet-500/10 text-violet-400 border-violet-500/20 text-[10px] uppercase">
                  Primary
                </Badge>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
