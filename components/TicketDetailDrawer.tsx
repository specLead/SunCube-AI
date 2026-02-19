
import React, { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { X, BrainCircuit } from 'lucide-react';
import { Ticket } from '../types';

interface TicketDetailDrawerProps {
  ticket: Ticket | null;
  onClose: () => void;
}

export const TicketDetailDrawer: React.FC<TicketDetailDrawerProps> = ({ ticket, onClose }) => {
    const drawerRef = useRef<HTMLDivElement>(null);
    const backdropRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (ticket) {
            gsap.to(backdropRef.current, { opacity: 1, duration: 0.3, display: 'block' });
            gsap.fromTo(drawerRef.current, { x: '100%' }, { x: '0%', duration: 0.4, ease: 'power3.out' });
        } else {
            gsap.to(backdropRef.current, { opacity: 0, duration: 0.3, display: 'none' });
            gsap.to(drawerRef.current, { x: '100%', duration: 0.3 });
        }
    }, [ticket]);

    if (!ticket) return null;

    return (
        <div className="fixed inset-0 z-[80] pointer-events-none">
            <div 
                ref={backdropRef} 
                className="absolute inset-0 bg-black/60 backdrop-blur-sm hidden pointer-events-auto" 
                onClick={onClose}
            />
            <div 
                ref={drawerRef} 
                className="absolute right-0 top-0 h-full w-full max-w-xl bg-[#15161A] border-l border-white/10 shadow-2xl flex flex-col pointer-events-auto transform translate-x-full"
            >
                {/* Header */}
                <div className="p-6 border-b border-white/10 flex justify-between items-start bg-[#0B0C10]">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <h2 className="text-xl font-bold text-white">{ticket.title}</h2>
                            <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${
                                ticket.priority === 'Critical' ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'
                            }`}>{ticket.priority}</span>
                        </div>
                        <p className="text-xs text-gray-500 font-mono">ID: {ticket.id} • Created {new Date(ticket.createdAt).toLocaleDateString()}</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full text-gray-400 hover:text-white"><X size={20}/></button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {/* Description */}
                    <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                        <h3 className="text-xs text-gray-500 uppercase font-bold mb-2">Issue Summary</h3>
                        <p className="text-sm text-gray-300 leading-relaxed">{ticket.description || 'No description provided.'}</p>
                    </div>

                    {/* AI Diagnosis */}
                    <div className="p-4 bg-suncube-orange/5 rounded-xl border border-suncube-orange/20">
                        <h3 className="text-xs text-suncube-orange uppercase font-bold mb-2 flex items-center gap-2"><BrainCircuit size={14}/> AI Diagnosis</h3>
                        {ticket.diagnosis ? (
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm"><span className="text-gray-400">Root Cause:</span> <span className="text-white">{ticket.diagnosis.rootCause}</span></div>
                                <div className="flex justify-between text-sm"><span className="text-gray-400">Confidence:</span> <span className="text-suncube-cyan">{ticket.diagnosis.confidence}%</span></div>
                                <div className="flex justify-between text-sm"><span className="text-gray-400">Parts Needed:</span> <span className="text-white">{ticket.diagnosis.partsNeeded.join(', ') || 'None'}</span></div>
                            </div>
                        ) : <div className="text-sm text-gray-500 italic">Analysis pending...</div>}
                    </div>

                    {/* Assignment & Timeline */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                            <h3 className="text-xs text-gray-500 uppercase font-bold mb-2">Assignment</h3>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 font-bold">TM</div>
                                <div>
                                    <div className="text-sm font-bold text-white">{ticket.assignedTo || 'Unassigned'}</div>
                                    <div className="text-xs text-gray-500">ETA: {ticket.eta || 'TBD'}</div>
                                </div>
                            </div>
                        </div>
                        <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                            <h3 className="text-xs text-gray-500 uppercase font-bold mb-2">Timeline</h3>
                            <div className="space-y-3 relative before:absolute before:left-1.5 before:top-2 before:bottom-2 before:w-px before:bg-white/10">
                                {ticket.timeline?.map((event, i) => (
                                    <div key={i} className="flex items-start gap-3 relative pl-4">
                                        <div className="absolute left-0 top-1.5 w-3 h-3 rounded-full bg-suncube-orange border-2 border-[#15161A]"></div>
                                        <div>
                                            <div className="text-xs font-bold text-white">{event.status}</div>
                                            <div className="text-[10px] text-gray-500">{new Date(event.date).toLocaleTimeString()}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="p-4 border-t border-white/10 bg-[#0B0C10] flex justify-end gap-3">
                    <button className="px-4 py-2 rounded-lg bg-suncube-orange text-black text-sm font-bold hover:bg-white transition-colors">Acknowledge</button>
                    <button className="px-4 py-2 rounded-lg text-red-400 hover:bg-red-500/10 text-sm font-bold transition-colors">Close Ticket</button>
                </div>
            </div>
        </div>
    );
};
