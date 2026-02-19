import React, { useState, useEffect, useRef } from 'react';
import { 
  DollarSign, Zap, Clock, ShieldCheck, Download, Search, Filter, 
  ExternalLink, FileText, Plus, AlertTriangle, CheckCircle, BrainCircuit,
  ChevronRight, ArrowUpRight, BarChart3, Database, RefreshCw, Calendar, Send, Settings, X, Link, Server, Eye
} from 'lucide-react';
import gsap from 'gsap';
import { 
  Transaction, Invoice, PaymentSummary, PayoutForecast, LedgerRecord, Ticket, UserProfile 
} from '../types';
import { 
  fetchPaymentSummary, fetchInvoices, createInvoice, 
  runPayoutSimulation, fetchLedger, verifyLedger, fetchCurrentUser
} from '../services/mockApi'; 
import { paymentsApi } from '../services/paymentsApi';
import { TransactionModal } from './TransactionModal';

// --- ANIMATED NUMBER COMPONENT ---
const CountUp: React.FC<{ end: number; decimals?: number; prefix?: string }> = ({ end, decimals = 2, prefix = '' }) => {
  const spanRef = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    if (!spanRef.current) return;
    const obj = { val: 0 };
    gsap.to(obj, {
      val: end,
      duration: 1.5,
      ease: "power2.out",
      onUpdate: () => {
        if (spanRef.current) spanRef.current.innerText = prefix + obj.val.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
      }
    });
  }, [end, decimals, prefix]);
  return <span ref={spanRef}>{prefix}0.00</span>;
};

// --- 1. SUMMARY CARD ---
const SummaryCard = ({ summary, onOpenLedger, onRequestPayout }: { summary: PaymentSummary | null, onOpenLedger: () => void, onRequestPayout: () => void }) => {
  const ref = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (summary) {
       gsap.fromTo(ref.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6 });
    }
  }, [summary]);

  if (!summary) return <div className="h-32 bg-white/5 animate-pulse rounded-2xl mb-6"></div>;

  return (
    <div ref={ref} className="glass-panel p-6 rounded-2xl border border-white/10 mb-6 flex flex-col lg:flex-row justify-between items-center gap-6 relative overflow-hidden group">
       <div className="absolute -right-20 -top-20 w-64 h-64 bg-suncube-orange/5 rounded-full blur-3xl pointer-events-none group-hover:bg-suncube-orange/10 transition-colors duration-500"></div>

       <div className="flex flex-col md:flex-row gap-8 w-full lg:w-auto text-center md:text-left">
          <div>
             <div className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">Total Revenue</div>
             <div className="text-4xl font-bold text-white tracking-tight flex items-baseline justify-center md:justify-start gap-1">
                <CountUp end={summary.totalRevenue} prefix="$" />
             </div>
             {summary.verifiedOnLedger && (
                <div className="text-xs text-suncube-orange mt-1 flex items-center justify-center md:justify-start gap-1">
                    <ShieldCheck size={12} /> Verified on Ledger
                </div>
             )}
          </div>
          <div className="w-px bg-white/10 h-16 hidden md:block"></div>
          <div>
             <div className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">Total Energy Sold</div>
             <div className="text-2xl font-bold text-white flex items-center justify-center md:justify-start gap-1">
                <CountUp end={summary.totalKwhSold / 1000} decimals={1} /> <span className="text-sm font-normal text-gray-500">MWh</span>
             </div>
          </div>
          <div className="w-px bg-white/10 h-16 hidden md:block"></div>
          <div>
             <div className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">Pending Payout</div>
             <div className="text-2xl font-bold text-amber-400"><CountUp end={summary.pendingPayouts} prefix="$" /></div>
             <div className="text-[10px] text-gray-500 mt-1">Next Cycle: {new Date(summary.nextPayoutDate).toLocaleDateString()}</div>
          </div>
       </div>

       <div className="flex gap-3">
          <button 
             onClick={onOpenLedger}
             className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm hover:bg-white/10 transition-colors flex items-center gap-2 text-gray-300 hover:text-white"
          >
             <Database size={16} className="text-suncube-cyan" /> View Ledger Proof
          </button>
          <button 
             onClick={onRequestPayout}
             className="px-4 py-2 bg-suncube-orange text-black font-bold rounded-lg text-sm hover:bg-white transition-colors shadow-[0_0_15px_rgba(255,122,24,0.3)] hover:shadow-[0_0_25px_rgba(255,122,24,0.5)]"
          >
             Request Payout
          </button>
       </div>
    </div>
  );
};

// --- 2. TRANSACTIONS TABLE ---
const TransactionsTable = ({ 
  transactions, onViewDetails, onFilterChange, filter, onSearch, loading, error 
}: { 
  transactions: Transaction[], onViewDetails: (t: Transaction) => void, onFilterChange: (f: string) => void, filter: string, onSearch: (s:string) => void, loading: boolean, error: string | null
}) => {
  return (
    <div className="glass-panel rounded-2xl border border-white/10 overflow-hidden flex flex-col h-[500px]">
       <div className="p-4 border-b border-white/10 flex flex-col sm:flex-row justify-between items-center bg-[#0B0C10] gap-3">
          <h3 className="text-white font-bold flex items-center gap-2"><Clock size={16}/> Transaction History</h3>
          <div className="flex gap-2 w-full sm:w-auto">
             <div className="relative flex-1 sm:flex-none">
                <Search size={14} className="absolute left-3 top-2.5 text-gray-500" />
                <input 
                    type="text" 
                    onChange={(e) => onSearch(e.target.value)}
                    placeholder="Search site, hash..." 
                    className="w-full sm:w-48 bg-white/5 border border-white/10 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white focus:border-suncube-orange outline-none transition-colors" 
                />
             </div>
             <div className="flex bg-white/5 rounded-lg border border-white/10 p-1">
                 {['7d', '30d', 'all'].map(r => (
                     <button 
                        key={r}
                        onClick={() => onFilterChange(r)}
                        className={`px-3 py-1 rounded text-xs transition-colors ${filter === r ? 'bg-white/10 text-white font-medium' : 'text-gray-500 hover:text-gray-300'}`}
                     >
                         {r}
                     </button>
                 ))}
             </div>
          </div>
       </div>
       <div className="flex-1 overflow-auto custom-scrollbar relative bg-[#0B0C10]">
          {loading && (
             <div className="absolute inset-0 bg-black/60 z-20 flex items-center justify-center backdrop-blur-sm">
                 <div className="flex flex-col items-center gap-3">
                     <RefreshCw className="animate-spin text-suncube-orange" size={24} />
                     <span className="text-xs text-gray-400">Loading transactions...</span>
                 </div>
             </div>
          )}
          {error ? (
              <div className="p-12 text-center text-red-400 flex flex-col items-center gap-2">
                  <AlertTriangle size={24}/>
                  <p>{error}</p>
              </div>
          ) : (
            <table className="w-full text-left border-collapse">
                <thead className="bg-[#15161A] text-xs text-gray-500 uppercase font-medium sticky top-0 backdrop-blur-md z-10 shadow-sm">
                    <tr>
                    <th className="p-3 font-semibold">Date</th>
                    <th className="p-3 font-semibold">Site</th>
                    <th className="p-3 font-semibold">Units</th>
                    <th className="p-3 font-semibold">Tariff</th>
                    <th className="p-3 font-semibold">Net Amount</th>
                    <th className="p-3 font-semibold">Status</th>
                    <th className="p-3 font-semibold text-right">Action</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-sm">
                    {!loading && transactions.length === 0 ? (
                        <tr><td colSpan={7} className="p-12 text-center text-gray-500 flex flex-col items-center gap-2"><div className="p-3 bg-white/5 rounded-full"><Search size={20}/></div>No transactions found matching your criteria.</td></tr>
                    ) : transactions.map(tx => (
                    <tr key={tx.id} className="hover:bg-white/5 transition-colors group cursor-pointer" onClick={() => onViewDetails(tx)}>
                        <td className="p-3 text-gray-300 whitespace-nowrap">{new Date(tx.date).toLocaleDateString()}</td>
                        <td className="p-3 text-white font-medium">{tx.siteName}</td>
                        <td className="p-3 text-gray-400">{tx.kwh} kWh</td>
                        <td className="p-3 text-gray-400">${tx.tariff}</td>
                        <td className="p-3 font-mono font-bold text-white">${tx.amount.toFixed(2)}</td>
                        <td className="p-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold border ${
                                tx.status === 'Completed' ? 'bg-green-500/10 text-green-400 border-green-500/30' :
                                tx.status === 'Pending' ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' :
                                'bg-red-500/10 text-red-400 border-red-500/30'
                            }`}>
                                {tx.status}
                            </span>
                        </td>
                        <td className="p-3 text-right">
                            <button 
                                className="text-xs px-3 py-1.5 rounded-lg border border-white/10 hover:bg-suncube-orange hover:text-black hover:border-suncube-orange transition-all"
                                onClick={(e) => { e.stopPropagation(); onViewDetails(tx); }}
                            >
                                Details
                            </button>
                        </td>
                    </tr>
                    ))}
                </tbody>
            </table>
          )}
       </div>
    </div>
  );
};

// --- 3. AI PAYOUT SIMULATOR ---
const SimulatorPanel = ({ onSimulate, onDraft, result, loading }: { 
    onSimulate: (u:number) => void, onDraft: () => void, result: PayoutForecast | null, loading: boolean 
}) => {
   const [units, setUnits] = useState<string>('1500');

   return (
      <div className="glass-panel rounded-2xl border border-white/10 p-5 flex flex-col gap-4 relative overflow-hidden">
         <div className="absolute top-0 right-0 p-12 bg-gradient-to-br from-suncube-cyan/5 to-transparent rounded-full blur-2xl pointer-events-none"></div>
         
         <div className="flex items-center gap-2 mb-1">
            <div className="p-1.5 bg-suncube-orange/20 text-suncube-orange rounded-lg"><BrainCircuit size={18}/></div>
            <h3 className="font-bold text-white">AI Revenue Forecast</h3>
         </div>
         
         <div className="space-y-4 relative z-10">
            <div>
                <label className="text-xs text-gray-500 uppercase block mb-1 font-bold">Projected Generation (kWh)</label>
                <div className="flex gap-2">
                    <input 
                        type="number" 
                        value={units} 
                        onChange={e => setUnits(e.target.value)}
                        className="w-full bg-black/40 border border-white/10 rounded-lg p-2.5 text-white text-sm focus:border-suncube-orange outline-none transition-colors"
                    />
                    <button 
                        onClick={() => onSimulate(Number(units))}
                        disabled={loading}
                        className="px-4 bg-white/10 hover:bg-white/20 rounded-lg text-white disabled:opacity-50 transition-colors border border-white/5"
                    >
                        {loading ? <RefreshCw className="animate-spin" size={18}/> : <ArrowUpRight size={18}/>}
                    </button>
                </div>
            </div>

            {result ? (
                <div className="bg-suncube-orange/5 border border-suncube-orange/20 rounded-xl p-4 animate-in fade-in slide-in-from-top-2">
                    <div className="flex justify-between items-start mb-3">
                        <div>
                            <div className="text-xs text-gray-400 font-medium">Estimated Payout</div>
                            <div className="text-2xl font-bold text-white">${result.estimatedPayout.toFixed(2)}</div>
                        </div>
                        <div className="text-[10px] font-bold bg-green-500/20 text-green-400 px-2 py-0.5 rounded border border-green-500/30 uppercase tracking-wide">
                            {result.confidence}% Confidence
                        </div>
                    </div>
                    <button 
                        onClick={onDraft}
                        className="w-full py-2.5 bg-suncube-orange text-black font-bold text-xs rounded-lg hover:bg-white transition-colors flex items-center justify-center gap-2"
                    >
                        <FileText size={14}/> Generate Invoice Draft
                    </button>
                </div>
            ) : (
                <div className="p-4 rounded-xl border border-white/5 bg-white/[0.02] text-center">
                    <p className="text-xs text-gray-500">Enter expected volume to calculate revenue.</p>
                </div>
            )}
         </div>
      </div>
   );
};

// --- 4. INVOICES LIST ---
const InvoicesList = ({ invoices, onView }: { invoices: Invoice[], onView: (i: Invoice) => void }) => {
    return (
        <div className="glass-panel rounded-2xl border border-white/10 p-5 flex flex-col flex-1 min-h-[300px]">
            <h3 className="font-bold text-white mb-4 flex items-center justify-between">
                <span className="flex items-center gap-2"><FileText size={16}/> Invoices</span>
            </h3>
            <div className="space-y-2 flex-1 overflow-y-auto custom-scrollbar">
                {invoices.length === 0 ? <div className="text-gray-500 text-xs text-center py-8">No invoices generated.</div> : 
                 invoices.map(inv => (
                    <div key={inv.id} className="p-3 bg-white/5 rounded-lg border border-white/5 flex justify-between items-center group hover:bg-white/10 transition-colors cursor-pointer" onClick={() => onView(inv)}>
                        <div>
                            <div className="text-xs font-bold text-white mb-0.5">{inv.id}</div>
                            <div className="text-[10px] text-gray-500">{inv.periodFrom}</div>
                        </div>
                        <div className="text-right flex items-center gap-3">
                            <div className="text-sm font-bold text-white">${inv.amount.toFixed(2)}</div>
                            <ChevronRight size={14} className="text-gray-600 group-hover:text-white transition-colors"/>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

// --- 5. LEDGER MODAL ---
const LedgerModal = ({ isOpen, onClose, ledger, onExport }: { isOpen: boolean, onClose: () => void, ledger: LedgerRecord[], onExport: () => void }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-4" onClick={onClose}>
            <div onClick={e => e.stopPropagation()} className="w-full max-w-6xl bg-[#15161A] border border-white/10 rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">
                <div className="p-6 border-b border-white/10 flex justify-between items-center bg-[#0B0C10]">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2"><Database size={20}/> Blockchain Ledger Audit</h2>
                    <div className="flex gap-2">
                        <button onClick={onExport} className="px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-xs text-gray-300 border border-white/5 flex items-center gap-2">
                            <Download size={14}/> Export CSV
                        </button>
                        <button onClick={onClose}><X size={20}/></button>
                    </div>
                </div>
                <div className="p-8 text-center text-gray-500">
                    <p>Ledger data populated via API.</p>
                </div>
            </div>
        </div>
    );
};

// --- 6. INVOICE PDF MODAL ---
const InvoiceModal = ({ invoice, onClose }: { invoice: Invoice | null, onClose: () => void }) => {
    if (!invoice) return null;
    const handleDownload = async () => {
         try {
             const url = await paymentsApi.getInvoiceUrl(invoice.id); 
             window.open(url, '_blank');
         } catch(e) {
             alert('Invoice not available yet. Please check back later.');
         }
    };

    return (
        <div className="fixed inset-0 z-[110] bg-black/90 backdrop-blur-md flex items-center justify-center p-4" onClick={onClose}>
             <div onClick={e => e.stopPropagation()} className="w-full max-w-3xl bg-[#15161A] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[80vh]">
                 <div className="p-5 border-b border-white/10 flex justify-between items-center bg-[#0B0C10]">
                     <h2 className="text-white font-bold flex items-center gap-2"><FileText size={18}/> {invoice.id}</h2>
                     <div className="flex gap-2">
                         <button onClick={handleDownload} className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white"><Download size={18}/></button>
                         <button onClick={onClose} className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white"><X size={18}/></button>
                     </div>
                 </div>
                 <div className="flex-1 bg-[#222] flex items-center justify-center text-gray-500">
                     PDF Viewer Placeholder
                 </div>
             </div>
        </div>
    );
};

// --- MAIN COMPONENT ---
interface PaymentsScreenProps {
    onTicketCreated?: (ticket: Ticket) => void;
}

export const PaymentsScreen: React.FC<PaymentsScreenProps> = ({ onTicketCreated }) => {
    const [summary, setSummary] = useState<PaymentSummary | null>(null);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [ledger, setLedger] = useState<LedgerRecord[]>([]);
    const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
    
    // UI State
    const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
    const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
    const [isLedgerOpen, setIsLedgerOpen] = useState(false);
    const [filter, setFilter] = useState('7d');
    const [search, setSearch] = useState('');
    const [loadingTx, setLoadingTx] = useState(false);
    const [errorTx, setErrorTx] = useState<string | null>(null);
    
    // Sim State
    const [simResult, setSimResult] = useState<PayoutForecast | null>(null);
    const [simLoading, setSimLoading] = useState(false);

    // Fetch Data
    useEffect(() => {
        fetchCurrentUser().then(setCurrentUser);
        fetchPaymentSummary().then(setSummary);
        fetchInvoices().then(setInvoices);
        fetchLedger().then(setLedger);
    }, []);

    // Filter/Search Effect
    useEffect(() => {
        const loadTx = async () => {
            setLoadingTx(true);
            setErrorTx(null);
            try {
                // Use real API which includes user role filtering
                const data = await paymentsApi.fetchTransactions(filter, search);
                setTransactions(data);
            } catch (err) {
                console.error("Failed to load transactions", err);
                setErrorTx("Unable to load transactions. Check your connection.");
            } finally {
                setLoadingTx(false);
            }
        };
        const debounce = setTimeout(loadTx, 400);
        return () => clearTimeout(debounce);
    }, [filter, search]);

    // Handlers
    const handleSimulate = async (u: number) => {
        setSimLoading(true);
        const res = await runPayoutSimulation(u, 'dynamic');
        setSimResult(res);
        setSimLoading(false);
    };

    const handleCreateDraft = async () => {
        if(simResult) {
            try {
                const res = await paymentsApi.generateInvoiceDraft('dummy-payment-id');
                if (res.success) {
                    alert(`Draft ${res.draftId} created! Processing PDF...`);
                    const newInvs = await fetchInvoices(); 
                    setInvoices(newInvs);
                }
            } catch (e) {
                alert('Failed to generate draft.');
            }
        }
    };

    const handleExport = async () => {
        await paymentsApi.exportTransactions(filter, search);
    };

    const handleExportLedger = async () => {
        await paymentsApi.exportLedger();
    }

    const handleRequestPayout = async () => {
        if(summary && currentUser) {
            try {
                await paymentsApi.requestPayout(currentUser.id, summary.pendingPayouts);
                alert("Payout request submitted.");
            } catch (e) {
                alert("Failed to request payout.");
            }
        }
    }

    return (
        <div className="w-full animate-in fade-in zoom-in-95 duration-500 pb-12">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <h1 className="text-3xl font-bold text-white tracking-tight">Payments & Revenue</h1>
                <div className="flex flex-wrap gap-3">
                    <button 
                       onClick={handleExport}
                       className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-gray-300 hover:bg-white/10 hover:text-white transition-colors flex items-center gap-2 text-sm"
                    >
                        <Download size={16}/> Export Report
                    </button>
                </div>
            </div>

            <SummaryCard summary={summary} onOpenLedger={() => setIsLedgerOpen(true)} onRequestPayout={handleRequestPayout} />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 flex flex-col gap-6">
                    <TransactionsTable 
                        transactions={transactions} 
                        onViewDetails={(tx) => {
                            console.log('[Transactions] row clicked', tx.id);
                            setSelectedTx(tx);
                        }} 
                        filter={filter}
                        onFilterChange={setFilter}
                        onSearch={setSearch}
                        loading={loadingTx}
                        error={errorTx}
                    />
                </div>
                <div className="flex flex-col gap-6">
                    <SimulatorPanel 
                        onSimulate={handleSimulate} 
                        onDraft={handleCreateDraft} 
                        result={simResult} 
                        loading={simLoading} 
                    />
                    <InvoicesList invoices={invoices} onView={setSelectedInvoice} />
                </div>
            </div>

            <TransactionModal 
                isOpen={!!selectedTx} 
                onClose={() => setSelectedTx(null)} 
                tx={selectedTx} 
                onTicketCreated={onTicketCreated}
            />
            
            <LedgerModal 
                isOpen={isLedgerOpen} 
                onClose={() => setIsLedgerOpen(false)} 
                ledger={ledger} 
                onExport={handleExportLedger}
            />

            <InvoiceModal 
                invoice={selectedInvoice} 
                onClose={() => setSelectedInvoice(null)} 
            />
        </div>
    );
};
