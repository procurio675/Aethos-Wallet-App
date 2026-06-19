export default function MockBankHome() {
  return (
    <main style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h1>Mock Bank Gateway</h1>
      <p>Use <code>/pay?token=&lt;tx_token&gt;&amp;amount=&lt;amount&gt;</code> to initiate a payment.</p>
    </main>
  );
}
