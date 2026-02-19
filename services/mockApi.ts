







import { Ticket, UserPreferences, Notification, Transaction, AIInsight, DeviceHealth, MaintenanceAlert, SiteDetail, DeviceTelemetry, DiagnosticReport, MetricDetails, MetricKey, ClusterNode, PaymentSummary, Invoice, LedgerRecord, PayoutForecast, UserProfile, TariffStructure, Site, ExportJob, ExportRequest, UserSession } from '../types';

// --- CONSTANTS ---
const API_DELAY = 800; // Simulated network latency

// --- MOCK DATA STORE ---
let TICKETS: Ticket[] = [
  { 
    id: 't1', title: 'Inverter #4 Connectivity', status: 'In Progress', priority: 'Critical', category: 'Hardware', createdAt: '2023-10-24T10:00:00Z', assignedTo: 'Tech. Mike', eta: '2h',
    diagnosis: { confidence: 92, rootCause: 'Network card failure', partsNeeded: ['Comms Module V2'] },
    timeline: [
        { status: 'Created', date: '2023-10-24T10:00:00Z' },
        { status: 'Assigned', date: '2023-10-24T10:15:00Z', note: 'Assigned to Mike' },
        { status: 'In Progress', date: '2023-10-24T11:00:00Z' }
    ],
    lastTelemetry: '2023-10-24T09:55:00Z'
  },
  { 
    id: 't2', title: 'Low Voltage Sector B', status: 'Open', priority: 'Medium', category: 'Performance', createdAt: '2023-10-23T14:30:00Z', assignedTo: 'Unassigned',
    diagnosis: { confidence: 75, rootCause: 'Potential shading', partsNeeded: [] },
    timeline: [{ status: 'Created', date: '2023-10-23T14:30:00Z' }],
    lastTelemetry: '2023-10-23T14:25:00Z'
  },
  { id: 't3', title: 'Billing Inquiry Oct', status: 'Resolved', priority: 'Low', category: 'Billing', createdAt: '2023-10-20T09:15:00Z' },
  { id: 't4', title: 'Panel Cleaning Request', status: 'Open', priority: 'Low', category: 'Maintenance', createdAt: '2023-10-18T11:00:00Z' },
];

let PREFERENCES: UserPreferences = {
  notifications: {
    criticalAlerts: true,
    maintenanceAlerts: true,
    dailyReport: false,
    weeklySummary: true,
    monthlyStatement: false,
    billing: {
        invoiceIssued: true,
        paymentCredited: true,
        payoutProcessed: true,
        disputeUpdates: true
    },
    ai: {
        forecast: true,
        tariffChange: true,
        weatherImpact: false
    }
  },
  display: {
      largeText: false
  },
  charts: {
      autoRefresh: true,
      animationLevel: 'full',
      preferredUnits: 'kWh'
  },
  billing: {
      autoSettleSmallPayouts: true,
      consolidatedMonthlyInvoice: false
  }
};

let SESSIONS: UserSession[] = [
    { id: 's1', device: 'Chrome on MacOS', ip: '192.168.1.42', lastActive: 'Just now', current: true },
    { id: 's2', device: 'Safari on iPhone 14', ip: '10.0.0.5', lastActive: '2 days ago', current: false },
    { id: 's3', device: 'Firefox on Windows', ip: '172.16.0.2', lastActive: '1 week ago', current: false },
];

let NOTIFICATIONS: Notification[] = [
  { id: 'n1', title: 'Payment Received', message: '$540.00 credited to wallet', read: false, timestamp: '10m ago', type: 'success' },
  { id: 'n2', title: 'System Alert', message: 'Inverter #4 communication lost', read: false, timestamp: '1h ago', type: 'alert' },
];

let PAYOUTS: Transaction[] = [
  { 
    id: 't1', date: '2023-10-24', kwh: 4500, tariff: 0.12, amount: 540.00, txHash: '0x8f2a...3a21', status: 'Completed', siteName: 'Sector A',
    blockHeight: 18452301, gasFee: 0.0042, validator: 'Suncube Validator Node 4', exportStart: '06:00 AM', exportEnd: '06:00 PM',
    peakType: 'Peak', aiVariance: 1.24, tariffClass: 'Dynamic', subtotal: 538.50, aiEstimated: 535.00, tax: 1.50,
    settlementBatchId: 'BATCH-2023-10-24-A', co2Saved: 3200, verificationStage: 'Verified', contractVersion: 'v2.1.4', confirmations: 128, network: 'Mainnet',
    meterReadings: { import: { start: 12450, end: 16950, delta: 4500 }, export: { start: 450, end: 450, delta: 0 } },
    fees: { serviceFee: 5.00, networkFee: 2.50, tax: 1.50 }, invoiceId: 'INV-2023-001',
    ledgerProofSnippet: '-----BEGIN LEDGER PROOF-----\nMIIC5jCCAc6gAwIBAgIIJ7...\n-----END LEDGER PROOF-----'
  },
  { 
    id: 't2', date: '2023-09-24', kwh: 4200, tariff: 0.12, amount: 504.00, txHash: '0x7b9c...99c2', status: 'Completed', siteName: 'Sector B',
    blockHeight: 18345100, gasFee: 0.0038, validator: 'Suncube Validator Node 1', exportStart: '06:30 AM', exportEnd: '06:15 PM',
    peakType: 'Off-Peak', aiVariance: 0.8, tariffClass: 'Fixed', subtotal: 504.00, aiEstimated: 504.00, tax: 0,
    settlementBatchId: 'BATCH-2023-09-24-B', co2Saved: 2950, verificationStage: 'Verified', contractVersion: 'v2.1.0', confirmations: 4500, network: 'Mainnet',
    meterReadings: { import: { start: 8250, end: 12450, delta: 4200 }, export: { start: 400, end: 450, delta: 50 } },
    fees: { serviceFee: 4.50, networkFee: 2.20, tax: 0 }, invoiceId: 'INV-2023-002',
    ledgerProofSnippet: '-----BEGIN LEDGER PROOF-----\nMIIC5jCCAc6gAwIBAgIIJ7...\n-----END LEDGER PROOF-----'
  },
  { 
    id: 't3', date: '2023-08-24', kwh: 4800, tariff: 0.11, amount: 528.00, txHash: '0x1c4d...ff41', status: 'Completed', siteName: 'Sector A',
    blockHeight: 18230999, gasFee: 0.0045, validator: 'Suncube Validator Node 2', exportStart: '05:45 AM', exportEnd: '07:00 PM',
    peakType: 'Peak', aiVariance: -0.5, tariffClass: 'Dynamic', subtotal: 528.00, aiEstimated: 530.00, tax: 0,
    settlementBatchId: 'BATCH-2023-08-24-A', co2Saved: 3400, verificationStage: 'Verified', contractVersion: 'v2.1.0', confirmations: 8900, network: 'Mainnet',
    meterReadings: { import: { start: 4000, end: 8800, delta: 4800 }, export: { start: 300, end: 400, delta: 100 } },
    fees: { serviceFee: 5.20, networkFee: 2.60, tax: 0 }, invoiceId: 'INV-2023-002', // Shared invoice example
    ledgerProofSnippet: '-----BEGIN LEDGER PROOF-----\nMIIC5jCCAc6gAwIBAgIIJ7...\n-----END LEDGER PROOF-----'
  },
  {
    id: 't4', date: '2023-11-01', kwh: 1200, tariff: 0.14, amount: 168.00, txHash: 'Pending', status: 'Pending', siteName: 'Sector A',
    tariffClass: 'Dynamic', network: 'Mainnet', subtotal: 168.00, tax: 0, peakType: 'Peak',
    fees: { serviceFee: 1.50, networkFee: 0.80, tax: 0 },
    meterReadings: { import: { start: 16950, end: 18150, delta: 1200 }, export: { start: 450, end: 460, delta: 10 } }
  }
];

let INVOICES: Invoice[] = [
  { id: 'INV-2023-001', customerId: 'C-8821', siteId: 'S-A', periodFrom: '2023-10-01', periodTo: '2023-10-31', amount: 540.00, units: 4500, status: 'Paid', createdAt: '2023-11-01', pdfUrl: '#' },
  { id: 'INV-2023-002', customerId: 'C-8821', siteId: 'S-B', periodFrom: '2023-09-01', periodTo: '2023-09-30', amount: 1032.00, units: 9000, status: 'Paid', createdAt: '2023-10-01', pdfUrl: '#' },
  { id: 'INV-2023-003', customerId: 'C-8821', siteId: 'S-A', periodFrom: '2023-11-01', periodTo: '2023-11-07', amount: 168.00, units: 1200, status: 'Draft', createdAt: '2023-11-08', pdfUrl: '#' },
];

let LEDGER: LedgerRecord[] = [
  { 
      txId: '0x8f2a...3a21', timestamp: '2023-10-24T18:00:00Z', dataHash: 'a1b2...c3d4', invoiceId: 'INV-2023-001', verified: true, metadata: 'Block #18452301',
      network: 'Mainnet', confirmations: 128, blockHeight: 18452301, verifierNode: 'Suncube Val-04', status: 'Verified'
  },
  { 
      txId: '0x7b9c...99c2', timestamp: '2023-09-24T18:15:00Z', dataHash: 'e5f6...g7h8', invoiceId: 'INV-2023-002', verified: true, metadata: 'Block #18345100',
      network: 'Mainnet', confirmations: 4500, blockHeight: 18345100, verifierNode: 'Suncube Val-01', status: 'Verified'
  },
  { 
      txId: '0x1c4d...ff41', timestamp: '2023-08-24T18:30:00Z', dataHash: 'i9j0...k1l2', invoiceId: 'INV-2023-002', verified: true, metadata: 'Block #18230999',
      network: 'Mainnet', confirmations: 8900, blockHeight: 18230999, verifierNode: 'Suncube Val-02', status: 'Verified'
  },
  { 
      txId: '0x9d8e...aa12', timestamp: '2023-11-05T09:00:00Z', dataHash: 'k9l1...m2n3', invoiceId: undefined, verified: false, metadata: 'Pending',
      network: 'Mainnet', confirmations: 0, blockHeight: 18500100, verifierNode: 'Pending', status: 'Pending'
  }
];

// --- NEW MOCK DATA ---
const AI_INSIGHTS: AIInsight[] = [
  {
    id: 'ai1', title: 'Efficiency Drop Detected', confidence: 87, rootCause: 'Partial shading or dust accumulation on String B.',
    recommendation: 'Schedule Cleaning',
    details: 'Telemetry analysis indicates a 15% variance from expected output based on current irradiance levels of 940 W/m².'
  }
];

let MAINTENANCE_DATA: MaintenanceAlert[] = [
  { id: 'm1', component: 'Inverter #2 Cooling Fan', issue: 'RPM fluctuation', probability: 78, daysToFailure: 14, trend: [20, 25, 30, 45, 60, 78], acknowledged: false },
  { id: 'm2', component: 'String B Connector', issue: 'Thermal hotspot', probability: 45, daysToFailure: 30, trend: [10, 12, 15, 18, 25, 45], acknowledged: false }
];

const DEVICES: DeviceHealth[] = [
  { id: 'd1', name: 'Inverter #01', type: 'Inverter', status: 'OK', temp: 58, load: 85, lastUpdate: 'Just now' },
  { id: 'd2', name: 'Inverter #02', type: 'Inverter', status: 'Warning', temp: 68, load: 92, lastUpdate: '30s ago' },
  { id: 'd3', name: 'String A', type: 'MPPT', status: 'OK', temp: 45, load: 78, lastUpdate: 'Just now' },
  { id: 'd4', name: 'String B', type: 'MPPT', status: 'Fault', temp: 82, load: 40, lastUpdate: '2m ago' },
  { id: 'd5', name: 'Battery Bank', type: 'Battery', status: 'OK', temp: 32, load: 98, lastUpdate: 'Just now' },
];

let SITES: Site[] = [
    { id: 'S-A', name: 'Sector A (Industrial)', location: 'Nevada, USA', capacity: 250 },
    { id: 'S-B', name: 'Sector B (Commercial)', location: 'Nevada, USA', capacity: 150 },
];

// --- API METHODS ---

export const fetchSites = async (): Promise<Site[]> => {
    return new Promise(resolve => setTimeout(() => resolve(SITES), 400));
}

export const fetchCurrentUser = async (): Promise<UserProfile> => {
  return new Promise(resolve => setTimeout(() => resolve({
    id: 'u8821',
    name: 'John Solar',
    email: 'john@suncube.ai',
    phone: '+1 (555) 019-2834',
    organization: 'Solar Tech Industries',
    siteName: 'Main Campus',
    role: 'customer',
    plan: 'Premium'
  }), 300));
};

export const fetchAIInsights = async (): Promise<AIInsight[]> => {
  return new Promise(resolve => setTimeout(() => resolve(AI_INSIGHTS), 500));
};

export const fetchMaintenanceData = async (): Promise<MaintenanceAlert[]> => {
  return new Promise(resolve => setTimeout(() => resolve(MAINTENANCE_DATA), 500));
};

export const fetchDeviceHealth = async (): Promise<DeviceHealth[]> => {
  return new Promise(resolve => setTimeout(() => resolve(DEVICES), 500));
};

export const fetchSiteDetails = async (siteId: string): Promise<SiteDetail> => {
    return new Promise(resolve => setTimeout(() => resolve({
        id: siteId,
        name: `Sector ${siteId.toUpperCase()}`,
        health: Math.floor(Math.random() * 20) + 80,
        todayEnergy: 124.5,
        lastTelemetry: 'Just now',
        activeFaults: Math.random() > 0.7 ? 1 : 0,
        trend: [10, 45, 30, 60, 55, 80]
    }), 600));
}

// Simulate GET Payouts (Legacy)
export const fetchPayouts = async (): Promise<Transaction[]> => {
  return new Promise((resolve) => setTimeout(() => resolve([...PAYOUTS]), 500));
};

export const fetchPaymentSummary = async (siteId?: string): Promise<PaymentSummary> => {
    return new Promise(resolve => {
        setTimeout(() => {
            const multi = siteId ? 0.6 : 1;
            resolve({
                totalRevenue: 15480.50 * multi,
                totalKwhSold: 128500 * multi,
                pendingPayouts: 168.00 * multi,
                lastPaymentDate: '2023-10-24',
                nextPayoutDate: '2023-11-24',
                verifiedOnLedger: true
            });
        }, 500);
    });
};

export const fetchTransactions = async (page: number, filter: string, siteId?: string): Promise<Transaction[]> => {
    return new Promise(resolve => {
        setTimeout(() => {
            let filtered = [...PAYOUTS];
            if (siteId) {
                // Mock filter: if siteId is S-B, show only S-B transactions
                const siteName = siteId === 'S-B' ? 'Sector B' : 'Sector A';
                filtered = filtered.filter(t => t.siteName === siteName);
            }
            if (filter.includes('failed')) {
                // mock filtering
            }
            resolve(filtered); 
        }, 600);
    });
};

export const fetchInvoices = async (siteId?: string): Promise<Invoice[]> => {
    return new Promise(resolve => {
        setTimeout(() => {
            let filtered = [...INVOICES];
            if (siteId) {
                filtered = filtered.filter(i => i.siteId === siteId);
            }
            resolve(filtered);
        }, 400);
    });
};

// Simulate GET Settlement by ID (for modal)
export const fetchSettlement = async (id: string): Promise<Transaction | null> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // Find or return mock
      const found = PAYOUTS.find(p => p.id === id);
      resolve(found || PAYOUTS[0]); // Fallback to first for demo if not found
    }, 400);
  });
};

// Simulate GET Tickets
export const fetchTickets = async (): Promise<Ticket[]> => {
  return new Promise((resolve) => {
    setTimeout(() => resolve([...TICKETS]), API_DELAY);
  });
};

// Simulate POST Ticket
export const createTicket = async (ticketData: Partial<Ticket>): Promise<Ticket> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (Math.random() < 0.05) {
        reject(new Error('Network Error'));
        return;
      }
      const newTicket: Ticket = {
        id: `t${Date.now()}`,
        title: ticketData.title || 'Untitled Ticket',
        status: 'Open', 
        priority: ticketData.priority || 'Medium',
        category: ticketData.category || 'General',
        createdAt: new Date().toISOString(),
        description: ticketData.description,
        assignedTo: 'Support Team',
        linkedTransactionId: ticketData.linkedTransactionId,
        linkedInvoiceId: ticketData.linkedInvoiceId,
        attachments: ticketData.attachments
      };
      TICKETS = [newTicket, ...TICKETS];
      resolve(newTicket);
    }, API_DELAY);
  });
};

// Simulate GET Preferences
export const fetchPreferences = async (): Promise<UserPreferences> => {
  return new Promise((resolve) => setTimeout(() => resolve(JSON.parse(JSON.stringify(PREFERENCES))), 400));
};

// Simulate PATCH Preferences (Partial Update Deep Merge)
export const updateUserPreferences = async (partial: any): Promise<UserPreferences> => {
  return new Promise((resolve) => {
    setTimeout(() => {
        // Simple deep merge for mock
        const merge = (target: any, source: any) => {
            for (const key in source) {
                if (source[key] instanceof Object && key in target) {
                    Object.assign(source[key], merge(target[key], source[key]));
                }
            }
            Object.assign(target || {}, source);
            return target;
        };
        merge(PREFERENCES, partial);
        resolve(JSON.parse(JSON.stringify(PREFERENCES)));
    }, 400);
  });
};

// Legacy support
export const updatePreference = async (key: keyof UserPreferences, value: boolean): Promise<UserPreferences> => {
    // This is legacy, but we'll map it if needed or just use the new one.
    return updateUserPreferences({ [key]: value });
};

// Simulate GET Notifications
export const fetchNotifications = async (): Promise<Notification[]> => {
  return new Promise(resolve => setTimeout(() => resolve([...NOTIFICATIONS]), 300));
};

export const markNotificationsRead = async (): Promise<void> => {
  NOTIFICATIONS = NOTIFICATIONS.map(n => ({ ...n, read: true }));
};

// Simulate Generation Graph Data (24h/7d/30d)
export const fetchGenerationData = async (range: '24h' | '7d' | '30d'): Promise<any[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const count = range === '24h' ? 24 : range === '7d' ? 7 : 30;
      const data = Array.from({ length: count }, (_, i) => ({
        time: range === '24h' ? `${i}:00` : range === '7d' ? `Day ${i+1}` : `${i+1} Oct`,
        power: Math.abs(Math.sin((i) / 4) * 50) + Math.random() * 10,
        expected: Math.abs(Math.sin((i) / 4) * 45)
      }));
      resolve(data);
    }, 600);
  });
};

// --- NEW ACTION HANDLERS ---

export const acknowledgeAlert = async (id: string): Promise<boolean> => {
  return new Promise(resolve => {
    setTimeout(() => {
      MAINTENANCE_DATA = MAINTENANCE_DATA.map(m => m.id === id ? { ...m, acknowledged: true } : m);
      resolve(true);
    }, 500);
  });
};

export const fetchDeviceTelemetry = async (deviceId: string): Promise<DeviceTelemetry> => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve({
        deviceId,
        timestamp: new Date().toISOString(),
        firmwareVersion: 'v3.4.1-stable',
        model: 'SunInv-X2000 Pro',
        temperature: 62.4,
        voltageDC: 420.5,
        voltageAC: 230.1,
        efficiency: 98.2,
        errorCodes: deviceId === 'd4' ? ['E-401 Overheat'] : [],
        recentLogs: ['Startup sequence completed', 'Grid synchronization OK', 'MPPT tracking active']
      });
    }, 800);
  });
};

export const fetchDiagnostic = async (deviceId: string): Promise<DiagnosticReport> => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve({
        id: `diag-${Date.now()}`,
        deviceId,
        status: 'Completed',
        timestamp: new Date().toISOString(),
        checks: [
          { name: 'Self-Test', status: 'Pass' },
          { name: 'Fan RPM', status: 'Pass' },
          { name: 'Grid Sync', status: 'Pass' },
          { name: 'Internal Temp', status: deviceId === 'm2' ? 'Warn' : 'Pass', message: 'Higher than optimal' }
        ],
        summary: 'All core systems operational. Minor thermal variance detected.',
        recommendedAction: 'Monitor fan filters.'
      });
    }, 1500);
  });
};

export const applyAiRecommendation = async (recId: string): Promise<{ success: boolean; message: string }> => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve({ success: true, message: 'Action executed successfully.' });
    }, 1000);
  });
};

// --- METRIC DETAILS FETCHING ---
export const fetchMetricDetails = async (metricKey: MetricKey): Promise<MetricDetails> => {
  return new Promise(resolve => {
    setTimeout(() => {
      switch(metricKey) {
        case 'livePower':
            resolve({
                type: 'livePower',
                currentKW: 42.8,
                trend1m: 1.2,
                trend5m: -0.5,
                chartData: Array.from({length: 15}, (_, i) => ({ time: `${15-i}m`, kw: 40 + Math.random() * 5 })),
                devices: [
                    { name: 'Inverter #01', kw: 22.1, percent: 52 },
                    { name: 'Inverter #02', kw: 20.7, percent: 48 },
                ],
                alerts: [],
                insight: { text: 'Inverter #2 throttling at 14:34 — expected output -3%', confidence: 88 }
            });
            break;
        case 'todayEnergy':
            resolve({
                type: 'todayEnergy',
                totalKwh: 245.8,
                deltaYesterday: 12.5,
                chartData: Array.from({length: 14}, (_, i) => ({ hour: `${i+6}h`, kwh: Math.sin(i/3)*20 + 5 })),
                peakWindow: { start: '11:00', end: '15:00', tariff: 0.18 },
                topContributors: [
                    { name: 'Sector A', kwh: 124.5 },
                    { name: 'Sector B', kwh: 121.3 }
                ],
                insight: { text: 'Peak generation window: 11:00–15:00. Potential loss due to dust on String B.', confidence: 92 }
            });
            break;
        case 'monthlyEarnings':
            resolve({
                type: 'monthlyEarnings',
                earnings: 1240.50,
                pending: 124.00,
                chartData: Array.from({length: 24}, (_, i) => ({ day: `${i+1}`, amount: 40 + Math.random() * 20 })),
                tariffs: [
                    { period: 'Peak (10am-4pm)', rate: 0.18 },
                    { period: 'Off-Peak', rate: 0.12 }
                ],
                forecast: 1580.00,
                insight: { text: 'Projected earnings +4% vs last month due to tariff changes on weekends.', confidence: 85 }
            });
            break;
        case 'uptime':
            resolve({
                type: 'uptime',
                uptimePercent: 99.85,
                lastChecked: 'Just now',
                downtimeEvents: [
                    { date: 'Oct 20', duration: '12m', cause: 'Grid Instability', mttr: 'Auto-Recovery' },
                    { date: 'Oct 12', duration: '45m', cause: 'Inverter Sync Fail', mttr: '15m' }
                ],
                affectedDevices: ['Inverter #02', 'Grid Tie Relay'],
                healthScore: 94,
                insight: { text: 'MTTR trending down, but string B shows repeated intermittent faults — schedule inspection.', confidence: 91 }
            });
            break;
      }
    }, 600);
  });
}

// --- CLUSTER MAP FETCH ---
export const fetchClusterMapData = async (): Promise<ClusterNode[]> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
        // Mock data logic with potential states for testing if we wanted, but defaulted to success here
        const mockData: ClusterNode[] = [
           { id: 'c1', x: 20, y: 30, count: 54, status: 'ok', subPoints: Array(5).fill(0).map((_,i) => ({ id:`p1_${i}`, x: 20 + Math.random()*10 - 5, y: 30 + Math.random()*10 - 5, status: Math.random() > 0.9 ? 'fault' : 'ok' })) },
           { id: 'c2', x: 60, y: 50, count: 210, status: 'warning', subPoints: Array(8).fill(0).map((_,i) => ({ id:`p2_${i}`, x: 60 + Math.random()*10 - 5, y: 50 + Math.random()*10 - 5, status: 'ok' })) },
           { id: 'c3', x: 75, y: 25, count: 12, status: 'ok', subPoints: Array(3).fill(0).map((_,i) => ({ id:`p3_${i}`, x: 75 + Math.random()*10 - 5, y: 25 + Math.random()*10 - 5, status: 'ok' })) },
           { id: 'c4', x: 40, y: 70, count: 86, status: 'ok', subPoints: Array(6).fill(0).map((_,i) => ({ id:`p4_${i}`, x: 40 + Math.random()*10 - 5, y: 70 + Math.random()*10 - 5, status: 'warning' })) },
        ];
        resolve(mockData);
    }, 1500);
  });
};

// --- TARIFF & PAYMENTS APIs ---

export const fetchTariffStructure = async (region: string): Promise<TariffStructure> => {
    return new Promise(resolve => setTimeout(() => resolve({
        region: region || 'Nevada',
        currency: 'USD',
        baseRate: 0.12,
        touRates: [
            { start: "00:00", end: "06:00", rate: 0.08, label: "Off-Peak" },
            { start: "06:00", end: "16:00", rate: 0.12, label: "Standard" },
            { start: "16:00", end: "21:00", rate: 0.18, label: "Peak" },
            { start: "21:00", end: "24:00", rate: 0.10, label: "Mid-Peak" }
        ],
        fees: {
            taxPercent: 5.5,
            gridFee: 0.02,
            serviceFee: 10.00
        },
        upcomingChanges: {
            date: "2024-01-01",
            estimatedIncrease: 2.4,
            details: "Annual inflation adjustment and grid modernization levy."
        }
    }), 500));
};

export const createInvoice = async (units: number): Promise<Invoice> => {
    return new Promise(resolve => {
        setTimeout(() => {
            const newInv: Invoice = {
                id: `INV-2023-${Math.floor(Math.random()*1000)}`,
                customerId: 'C-8821',
                siteId: 'S-New',
                periodFrom: '2023-11-01',
                periodTo: '2023-11-15',
                amount: units * 0.14,
                units: units,
                status: 'Draft',
                createdAt: new Date().toISOString(),
                pdfUrl: '#'
            };
            INVOICES = [newInv, ...INVOICES];
            resolve(newInv);
        }, 800);
    });
};

export const runPayoutSimulation = async (units: number, tariffType: string, siteId?: string): Promise<PayoutForecast> => {
    return new Promise(resolve => {
        setTimeout(() => {
            const baseRate = tariffType === 'dynamic' ? 0.14 : 0.12;
            const predictedUnits = units;
            // Enhanced AI mock response
            resolve({
                predictedUnits: predictedUnits,
                confidence: 94,
                bestSellWindow: '13:00 - 15:00',
                estimatedPayout: predictedUnits * baseRate,
                recommendedTariff: 'Dynamic Peak'
            });
        }, 1200);
    });
};

export const fetchLedger = async (siteId?: string): Promise<LedgerRecord[]> => {
    return new Promise(resolve => setTimeout(() => resolve([...LEDGER]), 500));
};

export const verifyLedger = async (txId: string): Promise<{ verified: boolean, details: string, confirmations: number, blockHeight: number }> => {
    return new Promise(resolve => {
        setTimeout(() => {
            const rec = LEDGER.find(l => l.txId === txId);
            if(rec && rec.verified) {
                resolve({ 
                    verified: true, 
                    details: 'Cryptographic signature matched. Merkle root valid.', 
                    confirmations: rec.confirmations || 10, 
                    blockHeight: rec.blockHeight || 180000 
                });
            } else {
                 resolve({ 
                    verified: false, 
                    details: 'Hash mismatch or transaction pending.', 
                    confirmations: 0, 
                    blockHeight: 0 
                });
            }
        }, 1500)
    });
};

export const requestExport = async (req: ExportRequest): Promise<ExportJob> => {
    return new Promise(resolve => setTimeout(() => resolve({
        jobId: `job-${Date.now()}`,
        status: 'queued',
        progress: 0
    }), 300));
};

export const checkExportStatus = async (jobId: string): Promise<ExportJob> => {
    return new Promise(resolve => {
        setTimeout(() => {
             // Mock completion
             resolve({
                 jobId,
                 status: 'ready',
                 fileUrl: 'https://example.com/report.csv',
                 progress: 100
             });
        }, 2000);
    });
};

export const exportData = async (type: 'csv' | 'pdf'): Promise<string> => {
    // Legacy export (keep for compatibility if needed)
    return new Promise(resolve => setTimeout(() => resolve('https://example.com/export-file'), 2000));
};

export const createDispute = async (txId: string, message: string): Promise<Ticket> => {
    return createTicket({ 
        title: `Billing Dispute - Tx: ${txId}`, 
        category: 'Billing', 
        description: message, 
        priority: 'Medium',
        linkedTransactionId: txId
    });
};

export const requestPayout = async (amount: number): Promise<boolean> => {
    return new Promise(resolve => setTimeout(() => resolve(true), 1000));
};

export const adminSettleInvoice = async (invId: string): Promise<boolean> => {
    return new Promise(resolve => setTimeout(() => {
        INVOICES = INVOICES.map(inv => inv.id === invId ? {...inv, status: 'Paid'} : inv);
        resolve(true);
    }, 1000));
};

// --- SETTINGS APIS ---

export const fetchUserSessions = async (): Promise<UserSession[]> => {
    return new Promise(resolve => setTimeout(() => resolve([...SESSIONS]), 400));
};

export const deleteUserSession = async (sessionId: string): Promise<void> => {
    return new Promise(resolve => setTimeout(() => {
        SESSIONS = SESSIONS.filter(s => s.id !== sessionId);
        resolve();
    }, 400));
};

export const changePassword = async (curr: string, next: string): Promise<void> => {
    return new Promise(resolve => setTimeout(() => resolve(), 800));
};

export const toggle2FA = async (enabled: boolean): Promise<void> => {
    return new Promise(resolve => setTimeout(() => resolve(), 600));
};

export const updateUserProfile = async (profile: Partial<UserProfile>): Promise<void> => {
    return new Promise(resolve => setTimeout(() => resolve(), 500));
};

export const requestAccountDeletion = async (reason: string): Promise<void> => {
    return new Promise(resolve => setTimeout(() => resolve(), 500));
};

export const recordAuditEvent = async (event: { userId: string, action: string, key: string, value: any }): Promise<void> => {
    // Mock audit recording
    console.log("Audit Event:", event);
    return new Promise(resolve => setTimeout(() => resolve(), 300));
};

// --- WEBSOCKET SIMULATION ---
type WSCallback = (data: any) => void;
const subscribers: WSCallback[] = [];

setInterval(() => {
  if (subscribers.length === 0) return;
  const fluctuation = (Math.random() - 0.5) * 2; 
  const payload = {
    type: 'kpi_update',
    data: {
      livePower: 42.5 + fluctuation,
      todayEnergy: 284 + (Math.random() * 0.1), 
      monthlyEarnings: 1240, 
      timestamp: new Date().toISOString()
    }
  };
  subscribers.forEach(cb => cb(payload));
}, 5000); 

export const subscribeToRealtime = (callback: WSCallback) => {
  subscribers.push(callback);
  return () => {
    const index = subscribers.indexOf(callback);
    if (index > -1) subscribers.splice(index, 1);
  };
};