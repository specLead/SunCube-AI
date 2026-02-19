
import React, { useRef, useEffect, useState } from 'react';
import gsap from 'gsap';
import { X, Activity, CheckCircle, AlertTriangle, Play } from 'lucide-react';
import { DiagnosticReport } from '../types';
import { fetchDiagnostic } from '../services/mockApi';

interface DiagnosticDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  targetId: string | null;
}

export const DiagnosticDrawer: React.FC<DiagnosticDrawerProps> = ({ isOpen, onClose, targetId }) => {
  const drawerRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
  const [report, setReport] = useState<DiagnosticReport | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && targetId) {
      setLoading(true);
      fetchDiagnostic(targetId).then(data => {
        setReport(data);
        setLoading(false);
      });
      gsap.to(backdropRef.current, { opacity: 1, duration: 0.3, pointerEvents: 'auto' });
      gsap.fromTo(drawerRef.current, { x: '100%' }, { x: '0%', duration: 0.4, ease: 'power3.out' });
    } else {
      gsap.to(backdropRef.current, { opacity: 0, duration: 0.3, pointerEvents: 'none' });
      gsap.to(drawerRef.current, { x: '100%', duration: 0.3 });
      setReport(null);
    }
  }, [isOpen, targetId]);

  return (
    <>
      <div ref={backdropRef} className="fixed inset-0 bg-black/60 z-[75] opacity-0 pointer-events-none backdrop-blur-sm" onClick={onClose} />
      <div ref={drawerRef} className="fixed top-0 right-0 h-full w-full md:w-[400px] bg-[#15161A] border-l border-white/10 z-[80] shadow-2xl flex flex-col transform translate-x-full">
         <div className="p-6 border-b border-white/10 flex justify-between items-center bg-[#0B0C10]">
           <h2 className="text-xl font-bold text-white flex items-center gap-2"><Activity className="text-suncube-orange"/> Diagnostics</h2>
           <button onClick={onClose}><X className="text-gray-400 hover:text-white"/></button>
         </div>
         <div className="flex-1 overflow-y-auto p-6">
            {loading ? (
                <div className="flex flex-col items-center justify-center h-40 space-y-4">
                    <div className="w-12 h-12 border-4 border-suncube-orange border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-suncube-orange text-sm animate-pulse">Running Diagnostic Sequence...</p>
                </div>
            ) : report ? (
                <div className="space-y-6">
                    <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                        <div className="text-xs text-gray-500 uppercase mb-1">Status</div>
                        <div className="text-lg font-bold text-green-400 flex items-center gap-2"><CheckCircle size={18}/> {report.status}</div>
                        <div className="text-xs text-gray-400 mt-1">{new Date(report.timestamp).toLocaleString()}</div>
                    </div>

                    <div className="space-y-3">
                        <h3 className="text-sm font-bold text-white">System Checks</h3>
                        {report.checks.map((check, i) => (
                            <div key={i} className="flex justify-between items-center p-3 bg-black/30 rounded-lg border border-white/5">
                                <span className="text-sm text-gray-300">{check.name}</span>
                                <span className={`text-xs px-2 py-0.5 rounded ${
                                    check.status === 'Pass' ? 'bg-green-500/10 text-green-400' : 'bg-amber-500/10 text-amber-400'
                                }`}>{check.status}</span>
                            </div>
                        ))}
                    </div>

                    <div className="p-4 bg-suncube-orange/5 rounded-xl border border-suncube-orange/20">
                         <h3 className="text-sm font-bold text-suncube-orange mb-2">AI Summary</h3>
                         <p className="text-sm text-gray-300 mb-2">{report.summary}</p>
                         {report.recommendedAction && (
                             <div className="text-xs text-suncube-cyan flex items-center gap-1">
                                 Recommended: {report.recommendedAction}
                             </div>
                         )}
                    </div>
                </div>
            ) : null}
         </div>
         <div className="p-4 border-t border-white/10 bg-[#0B0C10]">
             <button className="w-full py-3 bg-white/10 hover:bg-white/20 rounded-xl text-white font-medium transition-colors flex items-center justify-center gap-2">
                 <Play size={16}/> Re-run Diagnostic
             </button>
         </div>
      </div>
    </>
  );
};
