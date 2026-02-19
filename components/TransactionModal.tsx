import React, { useRef, useEffect, useState } from 'react';
import gsap from 'gsap';
import { 
  X, ShieldCheck, Box, Zap, BarChart3, Database, Clock, AlertTriangle, Download, CheckCircle, ExternalLink
} from 'lucide-react';
import { Transaction, Ticket } from '../types';
import { verifyLedger } from '../services/mockApi';
import { paymentsApi } from '../services/paymentsApi';
import { DisputeFormModal } from './DisputeFormModal';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  tx: Transaction | null;
  onTicketCreated?: (ticket: Ticket) => void;
}

export const TransactionModal: React.FC<TransactionModalProps> = ({ isOpen, onClose, tx, onTicketCreated }) => {
  const overlayRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const [verifying, setVerifying] = useState(false);
  const [verified, setVerified] = useState(false);
  const [verifyDetails, setVerifyDetails] = useState<string | null>(null);
  const [showDisputeModal, setShowDisputeModal] = useState(false);
  const [disputeSuccessToast, setDisputeSuccessToast] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && tx) {
      setVerified(false);
      setVerifyDetails(null);
      setDisputeSuccessToast(null);
      
      const tl = gsap.timeline();
      tl.to(overlayRef.current, { display: 'flex', opacity: 1, duration: 0.3 })
        .fromTo(modalRef.current, 
          { scale: 0.94, opacity: 0, y: 30 },
          { scale: 1, opacity: 1, y: 0, duration: 0.5, ease: 'back.out(1.4)' }
        )
        .from(".tx-section", { 
          opacity: 0, 
          y: 20, 
          stagger: 0.06, 
          duration: 0.4,
          ease: 'power2.out'
        }, "-=0.3");
    } else {
      gsap.to(modalRef.current, { scale: 0.94, opacity: 0, duration: 0.2 });
      gsap.to(overlayRef.current, { opacity: 0, duration: 0.2, onComplete: () => {
         if (overlayRef.current) overlayRef.current.style.display = 'none';
      }});
    }
  }, [isOpen, tx]);

  const handleVerify = async () => {
      if(!tx) return;
      setVerifying(true);
      const res = await verifyLedger(tx.id);
      setVerifying(false);
      setVerified(res.verified);
      setVerifyDetails(res.details);
  };

  const handleDownloadInvoice = async () => {
      if (!tx || !tx.invoiceId) {
          alert("No invoice generated for this transaction yet.");
          return;
      }
      try {
          // Use paymentsApi to get secure URL
          const url = await paymentsApi.getInvoiceUrl(tx.id);
          window.open(url, '_blank');
      } catch (e) {
          console.error(e);
          alert('Could not download invoice. Please try again later.');
      }
  };

  const handleDisputeSuccess = (ticket: Ticket) => {
      if (onTicketCreated) onTicketCreated(ticket);
      setDisputeSuccessToast(`Dispute submitted — Ticket #${ticket.id} created`);
      
      setTimeout(() => setDisputeSuccessToast(null), 5000);
  };

  if (!tx) return null;

  return (
    <>
    <div 
      ref={overlayRef}
      className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md hidden items-center justify-center p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div 
        ref={modalRef}
        onClick={e => e.stopPropagation()}
        className="w-full max-w-4xl bg-[#0F1014] border border-white/10 rounded-3xl shadow-[0_0_80px_rgba(255,122,24,0.1)] relative overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="p-6 border-b border-white/10 relative z-10 flex justify-between items-start bg-[#0F1014]">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-suncube-orange/10 flex items-center justify-center text-suncube-orange border border-suncube-orange/20">
              <Box size={24} />
            </div>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h2 className="text-xl font-bold text-white tracking-wide">Transaction Details</h2>
                <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${
                    tx.status === 'Completed' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                    tx.status === 'Pending' ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' :
                    'bg-red-500/20 text-red-400 border-red-500/30'
                }`}>
                  {tx.status}
                </span>
              </div>
              <p className="text-gray-500 font-mono text-xs flex items-center gap-2">
                ID: <span className="text-gray-300 select-all">{tx.txHash}</span>
              </p>
            </div>
          </div>
          <div className="flex gap-2">
             <button onClick={handleDownloadInvoice} className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors flex items-center gap-2 text-xs border border-white/5">
                 <Download size={14} /> <span className="hidden sm:inline">Invoice</span>
             </button>
             <button onClick={onClose} className="p-2 bg-white/5 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors">
               <X size={20} />
             </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar relative">
          
          {disputeSuccessToast && (
              <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-20 flex items-center gap-2 px-4 py-2 bg-green-500/20 border border-green-500/30 text-green-400 text-sm rounded-full shadow-xl animate-in fade-in slide-in-from-top-4">
                  <CheckCircle size={16}/> {disputeSuccessToast}
              </div>
          )}

          {/* 1. Key Metrics Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 tx-section">
            <div className="p-4 bg-white/[0.02] border border-white/5 rounded-xl">
               <span className="text-xs text-gray-500 uppercase block mb-1">Total Amount</span>
               <div className="text-xl font-bold text-white">${tx.amount.toFixed(2)}</div>
            </div>
            <div className="p-4 bg-white/[0.02] border border-white/5 rounded-xl">
               <span className="text-xs text-gray-500 uppercase block mb-1">Energy Sold</span>
               <div className="text-xl font-bold text-suncube-orange">{tx.kwh} kWh</div>
            </div>
            <div className="p-4 bg-white/[0.02] border border-white/5 rounded-xl">
               <span className="text-xs text-gray-500 uppercase block mb-1">Tariff Rate</span>
               <div className="text-white font-bold">${tx.tariff}/kWh</div>
            </div>
            <div className="p-4 bg-white/[0.02] border border-white/5 rounded-xl">
               <span className="text-xs text-gray-500 uppercase block mb-1">Date</span>
               <div className="text-white font-bold text-sm">{tx.date}</div>
            </div>
          </div>

          {/* 2. Detailed Breakdown Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 tx-section">
            
            {/* Metering Data */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-gray-300 flex items-center gap-2">
                <Zap size={16} className="text-yellow-500" /> Metering Telemetry
              </h3>
              <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5 space-y-4">
                {tx.meterReadings ? (
                    <>
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-500">Import Reading</span>
                        <div className="text-right">
                            <div className="text-white font-mono">{tx.meterReadings.import.start} → {tx.meterReadings.import.end}</div>
                            <div className="text-[10px] text-green-400">Δ {tx.meterReadings.import.delta} kWh</div>
                        </div>
                    </div>
                    <div className="h-px bg-white/5"></div>
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-500">Export Reading</span>
                        <div className="text-right">
                            <div className="text-white font-mono">{tx.meterReadings.export.start} → {tx.meterReadings.export.end}</div>
                            <div className="text-[10px] text-suncube-orange">Δ {tx.meterReadings.export.delta} kWh</div>
                        </div>
                    </div>
                    <div className="text-[10px] text-gray-500 pt-2 flex items-center gap-1">
                         <Clock size={10}/> Telemetry Timestamp: {new Date().toISOString()}
                    </div>
                    </>
                ) : <div className="text-gray-500 text-sm italic">No raw telemetry attached.</div>}
              </div>
            </div>

            {/* Financial Breakdown */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-gray-300 flex items-center gap-2">
                <BarChart3 size={16} className="text-green-500" /> Fee Structure
              </h3>
              <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5 space-y-3">
                 <div className="flex justify-between items-center text-sm">
                     <span className="text-gray-500">Gross Amount</span>
                     <span className="text-white">${tx.subtotal?.toFixed(2)}</span>
                 </div>
                 {tx.fees && (
                     <>
                     <div className="flex justify-between items-center text-sm">
                         <span className="text-gray-500">Service Fee</span>
                         <span className="text-red-400">-${tx.fees.serviceFee.toFixed(2)}</span>
                     </div>
                     <div className="flex justify-between items-center text-sm">
                         <span className="text-gray-500">Network Fee</span>
                         <span className="text-red-400">-${tx.fees.networkFee.toFixed(2)}</span>
                     </div>
                     <div className="flex justify-between items-center text-sm">
                         <span className="text-gray-500">Tax</span>
                         <span className="text-red-400">-${tx.fees.tax.toFixed(2)}</span>
                     </div>
                     </>
                 )}
                 <div className="h-px bg-white/10 my-2"></div>
                 <div className="flex justify-between items-center">
                     <span className="text-sm font-bold text-white">Net Payout</span>
                     <span className="text-lg font-bold text-suncube-orange">${tx.amount.toFixed(2)}</span>
                 </div>
              </div>
            </div>
          </div>

          {/* 3. Ledger Proof */}
          <div className="tx-section bg-[#0B0C10] border border-white/10 rounded-xl overflow-hidden">
             <div className="p-4 border-b border-white/10 flex justify-between items-center bg-[#0F1014]">
                <h3 className="text-sm font-bold text-white flex items-center gap-2"><Database size={16} className="text-blue-500"/> Immutable Ledger Proof</h3>
                <button 
                    onClick={handleVerify}
                    disabled={verifying || verified}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 border transition-all ${
                        verified 
                        ? 'bg-green-500/10 text-green-400 border-green-500/30' 
                        : 'bg-white/5 text-gray-300 border-white/10 hover:bg-white/10'
                    }`}
                >
                    {verifying ? <div className="animate-spin w-3 h-3 border-2 border-current border-t-transparent rounded-full"/> : verified ? <CheckCircle size={14}/> : <ShieldCheck size={14}/>}
                    {verified ? 'Verified On-Chain' : 'Verify Ledger'}
                </button>
             </div>
             
             {verifyDetails && (
                 <div className="px-4 py-2 bg-green-500/10 border-b border-green-500/20 text-xs text-green-400 flex items-center gap-2">
                     <CheckCircle size={12}/> {verifyDetails}
                 </div>
             )}

             <div className="p-4 grid grid-cols-2 gap-4 text-xs font-mono">
                 <div>
                     <span className="text-gray-500 block mb-1">Transaction Hash</span>
                     <span className="text-suncube-cyan break-all">{tx.txHash}</span>
                 </div>
                 <div>
                     <span className="text-gray-500 block mb-1">Block Height</span>
                     <span className="text-white">{tx.blockHeight}</span>
                 </div>
                 {tx.ledgerProofSnippet && (
                     <div className="col-span-2 mt-2">
                         <span className="text-gray-500 block mb-1">Cryptographic Proof</span>
                         <div className="bg-black/50 p-3 rounded border border-white/5 text-gray-400 break-all whitespace-pre-wrap font-mono text-[10px] leading-tight max-h-32 overflow-y-auto custom-scrollbar">
                             {tx.ledgerProofSnippet}
                         </div>
                     </div>
                 )}
                 <div className="col-span-2 flex justify-end">
                     <a href={`https://etherscan.io/tx/${tx.txHash}`} target="_blank" rel="noreferrer" className="text-blue-400 hover:text-white flex items-center gap-1 transition-colors">View on Block Explorer <ExternalLink size={12}/></a>
                 </div>
             </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-5 border-t border-white/10 bg-[#0B0C10] flex justify-between items-center z-10">
            <button 
                onClick={() => setShowDisputeModal(true)}
                className="text-red-400 hover:text-red-300 text-sm font-medium flex items-center gap-2 transition-colors px-3 py-2 rounded-lg hover:bg-white/5"
            >
                <AlertTriangle size={16} /> Raise Billing Dispute
            </button>
            <div className="text-xs text-gray-500">
                Processed by {tx.validator || 'Suncube Node'}
            </div>
        </div>
      </div>
    </div>
    
    <DisputeFormModal 
        isOpen={showDisputeModal}
        onClose={() => setShowDisputeModal(false)}
        transaction={tx}
        onSuccess={handleDisputeSuccess}
    />
    </>
  );
};
