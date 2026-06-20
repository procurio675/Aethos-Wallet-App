"use client";

import { useState } from "react";

type Outcome = "SUCCESS" | "BANK_REJECTED" | "NETWORK_CRASH" | "INSUFFICIENT_FUNDS" | null;

export default function PinForm({ token, amount, signature }: { token: string; amount: string; signature: string }) {
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [outcome, setOutcome] = useState<Outcome>(null);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/authorize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, amount, pin, signature }),
      });

      const data = await res.json();

      if (res.status === 401) {
        // Wrong PIN
        setError(data.error || "Incorrect PIN");
        setPin("");
        setLoading(false);
        return;
      }

      if (!res.ok && !data.outcome) {
        setError(data.error || "An unexpected error occurred");
        setLoading(false);
        return;
      }

      // We have an outcome
      setOutcome(data.outcome);
      setMessage(data.message);

      // Redirect to wallet-app dashboard after a delay
      const redirectDelay = data.outcome === "SUCCESS" ? 2000 : 3000;
      setTimeout(() => {
        window.location.href = "http://localhost:3000/dashboard";
      }, redirectDelay);
    } catch (err) {
      setError("Network error. Please try again.");
      setLoading(false);
    }
  };

  // Outcome screens
  if (outcome === "SUCCESS") {
    return (
      <div style={{ textAlign: "center", padding: "20px 0" }}>
        <div style={{ width: "64px", height: "64px", background: "#d1fae5", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        </div>
        <h2 style={{ fontSize: "20px", fontWeight: "600", color: "#065f46", marginBottom: "8px" }}>Payment Successful!</h2>
        <p style={{ color: "#6b7280", fontSize: "14px" }}>{message}</p>
        <p style={{ color: "#9ca3af", fontSize: "13px", marginTop: "16px" }}>Redirecting to your wallet...</p>
        <div style={{ width: "100%", height: "4px", background: "#e5e7eb", borderRadius: "2px", marginTop: "12px", overflow: "hidden" }}>
          <div style={{ width: "100%", height: "100%", background: "#10b981", borderRadius: "2px", animation: "shrink 2s linear forwards" }}></div>
        </div>
        <style>{`@keyframes shrink { from { width: 100%; } to { width: 0%; } }`}</style>
      </div>
    );
  }

  if (outcome === "BANK_REJECTED" || outcome === "INSUFFICIENT_FUNDS") {
    return (
      <div style={{ textAlign: "center", padding: "20px 0" }}>
        <div style={{ width: "64px", height: "64px", background: "#fee2e2", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </div>
        <h2 style={{ fontSize: "20px", fontWeight: "600", color: "#991b1b", marginBottom: "8px" }}>Payment Failed</h2>
        <p style={{ color: "#6b7280", fontSize: "14px" }}>{message}</p>
        <p style={{ color: "#9ca3af", fontSize: "13px", marginTop: "16px" }}>Redirecting to your wallet...</p>
        <div style={{ width: "100%", height: "4px", background: "#e5e7eb", borderRadius: "2px", marginTop: "12px", overflow: "hidden" }}>
          <div style={{ width: "100%", height: "100%", background: "#ef4444", borderRadius: "2px", animation: "shrink 3s linear forwards" }}></div>
        </div>
        <style>{`@keyframes shrink { from { width: 100%; } to { width: 0%; } }`}</style>
      </div>
    );
  }

  if (outcome === "NETWORK_CRASH") {
    return (
      <div style={{ textAlign: "center", padding: "20px 0" }}>
        <div style={{ width: "64px", height: "64px", background: "#fef3c7", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
            <line x1="12" y1="9" x2="12" y2="13"></line>
            <line x1="12" y1="17" x2="12.01" y2="17"></line>
          </svg>
        </div>
        <h2 style={{ fontSize: "20px", fontWeight: "600", color: "#92400e", marginBottom: "8px" }}>Network Error</h2>
        <p style={{ color: "#6b7280", fontSize: "14px" }}>{message}</p>
        <p style={{ color: "#9ca3af", fontSize: "13px", marginTop: "16px" }}>Redirecting to your wallet...</p>
        <div style={{ width: "100%", height: "4px", background: "#e5e7eb", borderRadius: "2px", marginTop: "12px", overflow: "hidden" }}>
          <div style={{ width: "100%", height: "100%", background: "#f59e0b", borderRadius: "2px", animation: "shrink 3s linear forwards" }}></div>
        </div>
        <style>{`@keyframes shrink { from { width: 100%; } to { width: 0%; } }`}</style>
      </div>
    );
  }

  // Default: PIN Entry Form
  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: "8px", textAlign: "left" }}>
        <label htmlFor="pin" style={{ fontSize: "14px", fontWeight: "500", color: "#374151" }}>
          Enter 4-Digit Bank PIN
        </label>
        <input
          id="pin"
          type="password"
          maxLength={4}
          placeholder="••••"
          value={pin}
          onChange={(e) => setPin(e.target.value.replace(/[^0-9]/g, ""))}
          style={{
            padding: "16px",
            borderRadius: "12px",
            border: error ? "1px solid #ef4444" : "1px solid #e5e7eb",
            fontSize: "24px",
            textAlign: "center",
            letterSpacing: "12px",
            background: "#f9fafb",
            color: "#111827",
            outline: "none",
            transition: "all 0.2s ease",
          }}
          required
        />
        {error && (
          <p style={{ color: "#ef4444", fontSize: "13px", marginTop: "4px" }}>{error}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={pin.length !== 4 || loading}
        style={{
          padding: "16px",
          borderRadius: "12px",
          background: "#10b981",
          color: "white",
          fontSize: "16px",
          fontWeight: "600",
          border: "none",
          cursor: pin.length === 4 && !loading ? "pointer" : "not-allowed",
          opacity: pin.length === 4 && !loading ? 1 : 0.5,
          transition: "all 0.2s ease",
          boxShadow: "0 4px 6px -1px rgba(16, 185, 129, 0.2)",
        }}
      >
        {loading ? "Authorizing..." : "Authorize Payment"}
      </button>

      <p style={{ fontSize: "12px", color: "#9ca3af", marginTop: "8px" }}>
        Protected by bank-grade encryption. Do not share your PIN with anyone.
      </p>
    </form>
  );
}
