# Aethos | Digital Wallet Application

**Aethos** is a high-performance, highly concurrent digital wallet application built to demonstrate financial engineering. It utilizes a distributed microservices architecture within a Turborepo monorepo, focusing on ACID-compliant transactions, database deadlock prevention, and cryptographic webhook security.

**Live Demo:** https://aethos-wallet-app-user-app-delta.vercel.app/

---

## 🛡️ Core Engineering & Security Highlights

This project was made to solve the four major vulnerabilities found in standard CRUD financial applications, making it robust enough to handle real-world concurrent transaction scenarios.

### 1. Database Deadlock Prevention (P2P Transfers)
In a highly concurrent system, simultaneous cross-transfers (User A sends to B, while User B sends to A) can crash a PostgreSQL database via a Thread Deadlock. Aethos prevents this by utilizing **Lexicographical Lock Ordering**. The system mathematically sorts the UUIDs of the sender and receiver, ensuring the database always locks the lower-value ID first. This forces competing threads into a clean waiting queue instead of a cyclic dependency.

### 2. Double-Spend & Lost Update Neutralization
To prevent users from exploiting race conditions by double-clicking or firing parallel API requests, all monetary movements are secured using **Pessimistic Row Locking** (`SELECT ... FOR UPDATE`).
*   **Withdrawals (Push):** Employs an "Instant Hold" pattern, locking and deducting the wallet balance *before* dispatching the network request to the bank, preventing double-spend exploits.
*   **Deposits (Pull):** Applies locks to the receiver's row to prevent the "Lost Update Anomaly" during concurrent inbound transfers.

### 3. Cryptographic Webhook Integrity (HMAC SHA-256)
To prevent malicious actors from using API testing tools to hit the webhook endpoint and artificially inflate their wallet balances, the `mock-bank` and `webhook-handler` establish Server-to-Server trust. Every webhook payload is signed using an **HMAC SHA-256** hash of the raw JSON body and a shared `.env` secret. The handler recalculates and verifies this signature before processing the ledger.

### 4. Idempotency & Network Failure Recovery
If a network connection drops while the bank is processing a transaction, standard systems might lose the transaction state. Aethos utilizes Prisma-generated **CUIDs as Idempotency Keys**. 
*   If a bank webhook fails to arrive, the continuous `sweeper` daemon detects the stale `PENDING` state, attaches the original Idempotency Key, and queries the bank for the definitive status, safely executing a rollback or settlement without ever double-charging the user.

---

## 🏗 System Architecture

The project is structured as a full-stack monorepo separating the user-facing interfaces from the secure backend background workers.

*   **`user-app` (Next.js):** The primary frontend dashboard and synchronous API routes for the wallet.
*   **`mock-bank` (Next.js):** An isolated payment gateway simulating an external core banking system with built-in network failure simulation (Chaos Monkey).
*   **`webhook-handler` (Express/Node):** A dedicated, standalone server handling incoming bank settlement webhooks.
*   **`sweeper` (Node Daemon):** A continuous background polling worker that resolves network drops, orphaned transactions, and asynchronous push payouts.
*   **`db` (Prisma/PostgreSQL):** The shared source of truth, enforcing strict relational integrity across all microservices.

---

## 💻 Tech Stack

*   **Frameworks:** Next.js (App Router), Express.js, Node.js
*   **Language:** TypeScript
*   **Database:** PostgreSQL (Hosted on Neon Serverless)
*   **ORM:** Prisma
*   **Architecture:** Turborepo (Monorepo)
*   **Authentication:** NextAuth.js
*   **Deployment:** Vercel (Frontends) & Render (Background Workers)

---

## Local Development Setup

To run this distributed system locally, you will need to start multiple services simultaneously.

### Prerequisites
- Node.js (v18+)
- PostgreSQL (Local or remote)

### 1. Clone the repository
```bash
git clone https://github.com/your-username/aethos.git
cd aethos
```

### 2. Install dependencies
```bash
npm install
```

### 3. Environment Variables
Create a `.env` file in the root directory (or in the respective packages) based on `.env.example`:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/aethos"
NEXTAUTH_SECRET="your-super-secret-key"
WEBHOOK_SECRET="your-hmac-secret-key"
```

### 4. Database Setup
Initialize the Prisma client and run migrations:
```bash
cd packages/db
npx prisma migrate dev
```

### 5. Start all services
From the root directory, start the development server:
```bash
npm run dev
```
*(This command leverages concurrently/turbo to boot the user-app, mock-bank, webhook-handler, and sweeper simultaneously).*

---

## Why I Built This

I built Aethos as my flagship portfolio project to move beyond standard CRUD applications and tackle the real-world challenges of distributed systems. It served as a deep dive into:
- Concurrency and Race Conditions in databases.
- The importance of ACID properties when handling financial ledgers.
- System design patterns for resilience (Idempotency, Polling daemons).
- Managing complex monorepo structures using Turborepo.

---
*Developed by **Krutant Jethva***
