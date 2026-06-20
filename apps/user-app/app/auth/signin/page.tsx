"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function SignInPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (res?.error) {
      setError("Invalid email or password");
    } else {
      router.push("/dashboard");
      router.refresh();
    }
  };

  return (
    <div className="min-h-screen bg-[#080810] flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-violet-600/20 blur-[120px] rounded-full pointer-events-none" />

      <Link href="/" className="absolute top-8 left-8 flex items-center gap-2 text-white/80 hover:text-white transition-colors z-10">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m15 18-6-6 6-6"/>
        </svg>
        Back to Home
      </Link>

      <Card className="w-full max-w-md bg-[#0a0a16]/80 border-white/[0.05] backdrop-blur-xl z-10 animate-fade-in-slow">
        <CardHeader className="space-y-2 text-center pb-6">
          <div className="w-12 h-12 mx-auto bg-gradient-to-br from-violet-500 to-indigo-600 rounded-xl flex items-center justify-center mb-4">
            <svg width="24" height="24" viewBox="0 0 14 14" fill="none">
              <path d="M2 4h10M2 7h6M2 10h8" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
          <CardTitle className="text-2xl font-semibold tracking-tight text-white">Sign in to PayFlow</CardTitle>
          <CardDescription className="text-white/60">
            Welcome back. Please enter your details.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm text-center">
                {error}
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="email" className="text-white/80">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="m@example.com"
                required
                className="bg-white/[0.03] border-white/[0.1] text-white placeholder:text-white/30 focus-visible:ring-violet-500"
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-white/80">Password</Label>
              </div>
              <Input
                id="password"
                name="password"
                type="password"
                required
                className="bg-white/[0.03] border-white/[0.1] text-white focus-visible:ring-violet-500"
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-white text-black hover:bg-white/90 mt-2"
            >
              {loading ? "Signing in..." : "Sign in"}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-white/60">
            Don&apos;t have an account?{" "}
            <Link href="/auth/signup" className="text-violet-400 hover:text-violet-300 font-medium">
              Sign up
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
