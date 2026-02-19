import React from 'react';
import { describe, test, expect, beforeEach, jest } from '@jest/globals';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import { PaymentsScreen } from '../../components/PaymentsScreen';
import * as mockApi from '../../services/mockApi';
import { paymentsApi } from '../../services/paymentsApi';

// Mock API modules
jest.mock('../../services/mockApi');
jest.mock('../../services/paymentsApi');

const mockTx = {
  id: 't1', date: '2023-10-24', kwh: 100, tariff: 0.12, amount: 12.00, txHash: '0x123', status: 'Completed', siteName: 'Site A'
};

const mockSummary = {
  totalRevenue: 1000, totalKwhSold: 5000, pendingPayouts: 100, lastPaymentDate: '2023-10-01', nextPayoutDate: '2023-11-01', verifiedOnLedger: true
};

describe('Payments & Revenue Acceptance Tests', () => {

  beforeEach(() => {
    (mockApi.fetchPaymentSummary as any).mockResolvedValue(mockSummary);
    (mockApi.fetchInvoices as any).mockResolvedValue([]);
    (mockApi.fetchLedger as any).mockResolvedValue([]);
    (mockApi.fetchCurrentUser as any).mockResolvedValue({ role: 'customer', id: 'u1' });
    
    // Mock the real API client wrapper
    (paymentsApi.fetchTransactions as any).mockResolvedValue([mockTx]);
    (paymentsApi.getInvoiceUrl as any).mockResolvedValue('http://mock-invoice.pdf');
  });

  test('KPIS_LOADS: Displays revenue summary on mount', async () => {
    render(React.createElement(PaymentsScreen));
    
    await waitFor(() => {
      expect(screen.getByText(/Total Revenue/i)).toBeInTheDocument();
      expect(screen.getByText(/\$1,000/)).toBeInTheDocument(); 
    });
  });

  test('TRANSACTIONS_TABLE: Renders fetched customer transactions', async () => {
    render(React.createElement(PaymentsScreen));
    
    // Check if loading state appears
    // expect(screen.getByText(/loading/i)).toBeInTheDocument();

    await waitFor(() => {
        expect(paymentsApi.fetchTransactions).toHaveBeenCalledWith('7d', '');
        expect(screen.getByText('Site A')).toBeInTheDocument();
        expect(screen.getByText('$12.00')).toBeInTheDocument();
    });
  });

  test('TRANSACTIONS_FILTER: Filtering updates the table', async () => {
    render(React.createElement(PaymentsScreen));
    
    await waitFor(() => screen.getByText('Site A'));

    // Change filter
    const filterBtn = screen.getByText('30d');
    fireEvent.click(filterBtn);

    // Assert API called with new filter
    await waitFor(() => {
      expect(paymentsApi.fetchTransactions).toHaveBeenCalledWith('30d', '');
    });
  });

  test('TRANSACTION_MODAL: Clicking row opens modal with details', async () => {
    render(React.createElement(PaymentsScreen));
    
    await waitFor(() => screen.getByText('Site A'));
    
    // Find row and click
    const row = screen.getByText('Site A').closest('tr');
    fireEvent.click(row!);

    // Modal should appear
    await waitFor(() => {
      expect(screen.getByText('Transaction Details')).toBeInTheDocument();
      expect(screen.getByText('0x123')).toBeInTheDocument(); // txHash
    });
  });

  test('EMPTY_STATE: Shows message when no transactions found', async () => {
    (paymentsApi.fetchTransactions as any).mockResolvedValue([]);
    render(React.createElement(PaymentsScreen));

    await waitFor(() => {
        expect(screen.getByText(/No transactions found/i)).toBeInTheDocument();
    });
  });

});