# Payments & Revenue UI Module

## 1. Overview
The Payments & Revenue module allows customers to track solar energy earnings, manage invoices, view blockchain-verified ledger proofs, simulate future revenue using AI, and raise billing disputes. It supports multi-site filtering and Role-Based Access Control (RBAC).

## 2. Component Map
The module is composed of the following React components (located in `components/`):

| Component ID | Description |
|---|---|
| **PaymentsScreen** | Main container route. Handles state for `selectedSiteId`, `filter`, and data orchestration. |
| **SiteSelector** | Dropdown for switching context between specific sites or "All Sites". |
| **PaymentsSummaryCard** | Top KPI row showing Revenue, Energy Sold, Pending Payouts, and Ledger Verification status. |
| **TariffInfoPanel** | Displays current tariff rates, Time-of-Use (TOU) breakdown, and fee structures. |
| **TransactionsTable** | Paginated table of payment history with filters for Date, Status, and Search. |
| **TransactionModal** | Detail view for a transaction including Metering, Fees, Ledger Proof, and Dispute actions. |
| **SimulatorPanel** | (AiPayoutSimulator) AI-driven forecasting tool for estimating revenue and generating draft invoices. |
| **InvoiceDraftModal** | Confirmation modal for AI-generated invoice drafts. |
| **InvoicesList** | List of invoices with status (Draft, Sent, Paid) and PDF viewer triggers. |
| **InvoiceModal** | PDF viewer wrapper with Admin settlement controls. |
| **LedgerModal** | Full-screen blockchain audit table with verification tools and CSV export. |
| **DisputeFormModal** | Form to raise tickets linked to specific transactions. |

## 3. API Endpoints
The UI consumes the following endpoints (mocked in `services/mockApi.ts`):

| Method | Endpoint | Purpose |
|---|---|---|
| `GET` | `/api/v1/sites` | List sites for selector. |
| `GET` | `/api/v1/payments/summary` | Fetch KPIs (Revenue, Pending, etc). Params: `siteId`. |
| `GET` | `/api/v1/payments` | Fetch transactions. Params: `siteId`, `from`, `to`, `q`. |
| `GET` | `/api/v1/payments/{id}` | Fetch full transaction details (metering, fees, proof). |
| `GET` | `/api/v1/invoices` | Fetch invoice list. Params: `siteId`. |
| `POST` | `/api/v1/invoices` | Create invoice (manual or AI draft). |
| `POST` | `/api/v1/ai/forecast` | Run payout simulation. Params: `siteId`, `units`. |
| `GET` | `/api/v1/ledger` | Fetch ledger records. Params: `siteId`. |
| `POST` | `/api/v1/verify-ledger` | Verify a transaction hash on-chain. |
| `POST` | `/api/v1/tickets` | Create a billing dispute ticket. |
| `POST` | `/api/v1/reports/payments/export`| Trigger async export job. |

## 4. Running Acceptance Tests
To run the automated acceptance suite locally:

```bash
# Install dependencies
npm install

# Run payments specific tests
npm test tests/payments/acceptance.test.ts

# Run with watch mode
npm test -- --watch tests/payments
```

## 5. Simulating Real-time Events
The Dashboard listens for WebSocket/SSE events. To simulate these manually in development:
1. Open browser console.
2. Trigger the mock emitter:
   ```javascript
   // Simulate KPI Update
   window.mockEmit('kpi_update', { livePower: 50.2, totalRevenue: 15500 });
   
   // Simulate Ticket Creation (Optimistic)
   window.mockEmit('ticket_created', { id: 't-new', title: 'New Dispute' });
   ```

## 6. Rollback Instructions
If a regression occurs in the Payments module:
1. Revert the last commit modifying `components/PaymentsScreen.tsx` or related modals.
2. Verify `services/mockApi.ts` hasn't introduced breaking schema changes.
3. Check `types.ts` for interface mismatches.

**Critical Path:** `PaymentsScreen` -> `TransactionsTable` -> `TransactionModal` -> `verifyLedger`.
