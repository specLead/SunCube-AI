# Payments & Revenue QA Checklist

**Version:** 1.0.0
**Tester:** ___________________
**Date:** ___________________

| ID | Category | Test Step | Expected Result | Pass/Fail | Notes |
|---|---|---|---|---|---|
| **PAY-01** | **KPIs** | Load Payments Screen (clean state). | Total Revenue, Energy Sold, and Pending Payouts load with values. "Verified on Ledger" badge appears if applicable. | [ ] | |
| **PAY-02** | **Multi-Site** | Switch "Select Site" dropdown between specific sites. | KPIs, Transaction Table, and Invoice list refresh to show *only* data for the selected site. | [ ] | |
| **PAY-03** | **Transactions** | Click "Details" on a transaction. | Modal opens with Metering, Fees, and Ledger Proof sections populated. | [ ] | |
| **PAY-04** | **Disputes** | In Transaction Modal, click "Raise Billing Dispute". Submit form. | Success toast appears. New ticket appears in Dashboard > Open Tickets immediately. | [ ] | |
| **PAY-05** | **AI Forecast** | In Simulator, enter units and click "Run Forecast". | Confidence score, Payout Estimate, and Recommended Tariff appear. | [ ] | |
| **PAY-06** | **Invoicing** | Click "Generate Invoice Draft" in AI panel. | Toast confirms creation. New "Draft" invoice appears at top of Invoices list. | [ ] | |
| **PAY-07** | **Ledger** | Open "View Ledger Proof". Click "Verify" on a row. | Spinner appears, then green "Verified" badge with details. | [ ] | |
| **PAY-08** | **Tariffs** | Expand "Tariff Info" panel. | Shows current region's base rate and Time-of-Use breakdown table. | [ ] | |
| **PAY-09** | **Export** | Click "Export Report" -> "Transactions CSV". | File downloads. CSV contains `ledger_txId` and `tariff_per_kwh` columns. | [ ] | |
| **PAY-10** | **RBAC** | Log in as non-admin (Customer). | "Admin Controls" panel is NOT visible. Settlement actions on invoices are hidden. | [ ] | |
| **PAY-11** | **Error Handling** | Simulate network offline (DevTools) and refresh transactions. | UI shows friendly "Unable to load" error with Retry button. | [ ] | |
| **PAY-12** | **Accessibility** | Navigate Transaction Modal using Tab key only. | Focus stays within modal. Esc key closes modal. | [ ] | |

**Sign-off:** ___________________
