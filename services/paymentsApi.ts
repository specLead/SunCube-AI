import { getToken } from '../src/lib/authAdapter';
import { Transaction, Invoice, LedgerRecord } from '../types';
import { fetchTransactions as mockFetchTransactions, fetchInvoices as mockFetchInvoices, createInvoice as mockCreateInvoice, fetchLedger as mockFetchLedger } from './mockApi';

const API_BASE = 'http://localhost:3000'; // Or use env variable

async function fetchWithAuth(endpoint: string, options: RequestInit = {}) {
    const token = getToken();
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...options.headers as any
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    try {
        const res = await fetch(`${API_BASE}${endpoint}`, { ...options, headers });
        if (!res.ok) {
            throw new Error(`API Error: ${res.statusText}`);
        }
        return res;
    } catch (e) {
        console.warn(`Fetch error for ${endpoint}:`, e);
        throw e;
    }
}

export const paymentsApi = {
    // Transactions
    fetchTransactions: async (range: string = '7d', search: string = ''): Promise<Transaction[]> => {
        try {
            const res = await fetchWithAuth(`/admin/transactions?range=${range}&search=${encodeURIComponent(search)}`);
            const data = await res.json();
            
            const rows = data.rows || [];
            
            return rows.map((row: any) => ({
                id: row.id,
                date: row.created_at,
                kwh: row.units_sold_kwh || 0,
                tariff: row.tariff_per_kwh || 0,
                amount: Number(row.amount),
                status: row.status,
                txHash: row.payout_tx_hash || row.transaction_hash || 'Pending',
                siteName: row.site_name || 'Main Site', 
                blockHeight: row.block_height,
                invoiceId: row.invoice_id,
                ...row
            }));
        } catch (error) {
            console.warn("Backend unavailable. Falling back to mock transactions.");
            // Fallback to mock data if API fails
            return mockFetchTransactions(1, search);
        }
    },

    exportTransactions: async (range: string, search: string) => {
        try {
            const res = await fetchWithAuth(`/admin/transactions/export?range=${range}&search=${encodeURIComponent(search)}`);
            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `transactions_${range}.csv`;
            document.body.appendChild(a);
            a.click();
            a.remove();
        } catch (error) {
            console.error(error);
            alert("Export failed: Backend unavailable.");
        }
    },

    // Ledger
    exportLedger: async () => {
        try {
            const res = await fetchWithAuth(`/admin/ledger/export`);
            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `ledger_export_${Date.now()}.csv`;
            document.body.appendChild(a);
            a.click();
            a.remove();
        } catch (error) {
            console.error(error);
            alert("Export failed: Backend unavailable.");
        }
    },

    // Payouts
    requestPayout: async (customerId: string, amount: number) => {
        try {
            const res = await fetchWithAuth(`/payments/${customerId}/request-payout`, {
                method: 'POST',
                body: JSON.stringify({ amount })
            });
            return res.json();
        } catch (error) {
            console.warn("Backend unavailable. Simulating payout request.");
            return { status: 'queued', message: 'Payout request received (Simulation)' };
        }
    },

    // Invoices
    generateInvoiceDraft: async (paymentId: string) => {
        try {
            const res = await fetchWithAuth(`/payments/generate-invoice`, {
                method: 'POST',
                body: JSON.stringify({ paymentId })
            });
            return res.json();
        } catch (error) {
             console.warn("Backend unavailable. Simulating invoice draft.");
             return { success: true, draftId: 'DRAFT-SIM', message: 'Invoice draft generated (Simulation)' };
        }
    },

    getInvoiceUrl: async (paymentId: string) => {
        try {
            const res = await fetchWithAuth(`/payments/${paymentId}/invoice-url`);
            const data = await res.json();
            return data.url;
        } catch (error) {
            console.warn("Backend unavailable. Returning placeholder URL.");
            return '#';
        }
    }
};