## ⚠️ DB-PRESERVE PROJECT

This project uses DB-Preserve mode.

**Before starting any phase, read: `DB_CONNECTION_SPEC.md`**
- All database access must go through existing stored procedures
- Do NOT create new database tables or run schema migrations
- Connect to the existing database using the connection details in DB_CONNECTION_SPEC.md

---

# IMPLEMENTATION_PLAN.md
## Build Instructions

---

## INSTRUCTIONS FOR THE LLM

You are a senior full stack software engineer. Your job is to build the complete application described in the specification files by following these steps exactly.

All specification files and phase prompt files are in the same folder as this file. Read them as instructed below.

This project has **15 build phases** (Phase 1 to Phase 15).

---

## STEP 1 — READ PROGRESS FILE FIRST

Before doing anything else, read `PROJECT_PHASE_PROGRESS.md` now.
It tells you exactly which phases are complete and where to continue from.

```
Find the first phase whose Status is NOT COMPLETE → start there.
If all 15 phases are COMPLETE → output the final sign-off.
```

---

## STEP 2 — SCORING RULES

After completing every phase you MUST:

```
1. Run the score card from that phase prompt file
2. Calculate score out of 10
3. Count total tokens used in this phase (input + output)
4. Update PROJECT_PHASE_PROGRESS.md with: score, token count, status, any failed items
5. Then:
   Score >= 9.5 → automatically continue to next phase
   Score < 9.5  → fix ALL failed items → re-score → update PROJECT_PHASE_PROGRESS.md → continue
```

Never stop between phases to ask the user anything.
Never skip a phase.
Never move to next phase if score is below 9.5.

---

## STEP 3 — BUILD PHASES IN ORDER

### PHASE 1 — Foundation & Authentication
Read: `IMPLEMENTATION_PHASE1.md`, `PROJECT_OVERVIEW.md`, `API_SPEC.md`, `FRONTEND_SPEC.md`, `STANDARDS.md`, `AGENT_REVIEW_PROTOCOL.md`, `DB_CONNECTION_SPEC.md`
Build → Score → Update PROJECT_PHASE_PROGRESS.md → Continue

### PHASE 2 — User, Role & Employee Management
Read: `IMPLEMENTATION_PHASE2.md`, `PROJECT_OVERVIEW.md`, `API_SPEC.md`, `FRONTEND_SPEC.md`, `STANDARDS.md`, `AGENT_REVIEW_PROTOCOL.md`, `DB_CONNECTION_SPEC.md`
Build → Score → Update PROJECT_PHASE_PROGRESS.md → Continue

### PHASE 3 — Customer, Supplier, Contact & Vehicle Management
Read: `IMPLEMENTATION_PHASE3.md`, `PROJECT_OVERVIEW.md`, `API_SPEC.md`, `FRONTEND_SPEC.md`, `STANDARDS.md`, `AGENT_REVIEW_PROTOCOL.md`, `DB_CONNECTION_SPEC.md`
Build → Score → Update PROJECT_PHASE_PROGRESS.md → Continue

### PHASE 4 — Document & Attachment Management
Read: `IMPLEMENTATION_PHASE4.md`, `PROJECT_OVERVIEW.md`, `API_SPEC.md`, `FRONTEND_SPEC.md`, `STANDARDS.md`, `AGENT_REVIEW_PROTOCOL.md`, `DB_CONNECTION_SPEC.md`
Build → Score → Update PROJECT_PHASE_PROGRESS.md → Continue

### PHASE 5 — Jobs, Work Orders & Estimation Management
Read: `IMPLEMENTATION_PHASE5.md`, `PROJECT_OVERVIEW.md`, `API_SPEC.md`, `FRONTEND_SPEC.md`, `STANDARDS.md`, `AGENT_REVIEW_PROTOCOL.md`, `DB_CONNECTION_SPEC.md`
Build → Score → Update PROJECT_PHASE_PROGRESS.md → Continue

### PHASE 6 — Sales, Orders & Delivery Management
Read: `IMPLEMENTATION_PHASE6.md`, `PROJECT_OVERVIEW.md`, `API_SPEC.md`, `FRONTEND_SPEC.md`, `STANDARDS.md`, `AGENT_REVIEW_PROTOCOL.md`, `DB_CONNECTION_SPEC.md`
Build → Score → Update PROJECT_PHASE_PROGRESS.md → Continue

### PHASE 7 — Purchase, Procurement & Supplier Billing
Read: `IMPLEMENTATION_PHASE7.md`, `PROJECT_OVERVIEW.md`, `API_SPEC.md`, `FRONTEND_SPEC.md`, `STANDARDS.md`, `AGENT_REVIEW_PROTOCOL.md`, `DB_CONNECTION_SPEC.md`
Build → Score → Update PROJECT_PHASE_PROGRESS.md → Continue

### PHASE 8 — Inventory, Stock & Item Management
Read: `IMPLEMENTATION_PHASE8.md`, `PROJECT_OVERVIEW.md`, `API_SPEC.md`, `FRONTEND_SPEC.md`, `STANDARDS.md`, `AGENT_REVIEW_PROTOCOL.md`, `DB_CONNECTION_SPEC.md`
Build → Score → Update PROJECT_PHASE_PROGRESS.md → Continue

### PHASE 9 — Banking, Reconciliation & Financial Transactions
Read: `IMPLEMENTATION_PHASE9.md`, `PROJECT_OVERVIEW.md`, `API_SPEC.md`, `FRONTEND_SPEC.md`, `STANDARDS.md`, `AGENT_REVIEW_PROTOCOL.md`, `DB_CONNECTION_SPEC.md`
Build → Score → Update PROJECT_PHASE_PROGRESS.md → Continue

### PHASE 10 — Accounts, Ledgers & Chart of Accounts
Read: `IMPLEMENTATION_PHASE10.md`, `PROJECT_OVERVIEW.md`, `API_SPEC.md`, `FRONTEND_SPEC.md`, `STANDARDS.md`, `AGENT_REVIEW_PROTOCOL.md`, `DB_CONNECTION_SPEC.md`
Build → Score → Update PROJECT_PHASE_PROGRESS.md → Continue

### PHASE 11 — Receipts, Payments, Petty Cash & Journal Vouchers
Read: `IMPLEMENTATION_PHASE11.md`, `PROJECT_OVERVIEW.md`, `API_SPEC.md`, `FRONTEND_SPEC.md`, `STANDARDS.md`, `AGENT_REVIEW_PROTOCOL.md`, `DB_CONNECTION_SPEC.md`
Build → Score → Update PROJECT_PHASE_PROGRESS.md → Continue

### PHASE 12 — Reporting, Statements & Analytics
Read: `IMPLEMENTATION_PHASE12.md`, `PROJECT_OVERVIEW.md`, `API_SPEC.md`, `FRONTEND_SPEC.md`, `STANDARDS.md`, `AGENT_REVIEW_PROTOCOL.md`, `DB_CONNECTION_SPEC.md`
Build → Score → Update PROJECT_PHASE_PROGRESS.md → Continue

### PHASE 13 — System Admin, Audit Logs & Change Tracking
Read: `IMPLEMENTATION_PHASE13.md`, `PROJECT_OVERVIEW.md`, `API_SPEC.md`, `FRONTEND_SPEC.md`, `STANDARDS.md`, `AGENT_REVIEW_PROTOCOL.md`, `DB_CONNECTION_SPEC.md`
Build → Score → Update PROJECT_PHASE_PROGRESS.md → Continue

### PHASE 14 — Notifications, Messaging & Utilities
Read: `IMPLEMENTATION_PHASE14.md`, `PROJECT_OVERVIEW.md`, `API_SPEC.md`, `FRONTEND_SPEC.md`, `STANDARDS.md`, `AGENT_REVIEW_PROTOCOL.md`, `DB_CONNECTION_SPEC.md`
Build → Score → Update PROJECT_PHASE_PROGRESS.md → Continue

### PHASE 15 — Security, Final Review & Acceptance
Read: `IMPLEMENTATION_PHASE15.md`, `PROJECT_OVERVIEW.md`, `API_SPEC.md`, `FRONTEND_SPEC.md`, `STANDARDS.md`, `AGENT_REVIEW_PROTOCOL.md`, `DB_CONNECTION_SPEC.md`
Build → Score → Update PROJECT_PHASE_PROGRESS.md → Continue

---

## FINAL OUTPUT

When all 15 phases score 9.5 or above, output this:

```
🎉 PROJECT COMPLETE
===================
| Phase | Description | Score  | Tokens | Status |
|-------|-------------|--------|--------|--------|
|   1   | Foundation & Authentication | __ /10 | __     |  PASS  |
|   2   | User, Role & Employee Manageme | __ /10 | __     |  PASS  |
|   3   | Customer, Supplier, Contact &  | __ /10 | __     |  PASS  |
|   4   | Document & Attachment Manageme | __ /10 | __     |  PASS  |
|   5   | Jobs, Work Orders & Estimation | __ /10 | __     |  PASS  |
|   6   | Sales, Orders & Delivery Manag | __ /10 | __     |  PASS  |
|   7   | Purchase, Procurement & Suppli | __ /10 | __     |  PASS  |
|   8   | Inventory, Stock & Item Manage | __ /10 | __     |  PASS  |
|   9   | Banking, Reconciliation & Fina | __ /10 | __     |  PASS  |
|   10   | Accounts, Ledgers & Chart of A | __ /10 | __     |  PASS  |
|   11   | Receipts, Payments, Petty Cash | __ /10 | __     |  PASS  |
|   12   | Reporting, Statements & Analyt | __ /10 | __     |  PASS  |
|   13   | System Admin, Audit Logs & Cha | __ /10 | __     |  PASS  |
|   14   | Notifications, Messaging & Uti | __ /10 | __     |  PASS  |
|   15   | Security, Final Review & Accep | __ /10 | __     |  PASS  |
Overall: READY FOR PRODUCTION ✅
Run: docker-compose up
```

---

## IF TOKEN RUNS OUT

1. `PROJECT_PHASE_PROGRESS.md` shows exactly which phases are done
2. Start a new chat
3. Say: `"Read IMPLEMENTATION_PLAN.md and PROJECT_PHASE_PROGRESS.md and continue"`
4. LLM reads progress file and continues from where it stopped
