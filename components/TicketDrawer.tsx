
import React, { useRef, useEffect, useState } from 'react';
import gsap from 'gsap';
import { X, Clock, CheckCircle, RefreshCcw } from 'lucide-react';
import { Ticket } from '../types';
import { fetchTickets } from '../services/mockApi';

interface TicketDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  newTicket?: Ticket | null;
  onTicketClick: (ticket: Ticket) => void;
}

export const TicketDrawer: React.FC<TicketDrawerProps> = ({ isOpen, onClose, newTicket, onTicketClick }) => {
  const drawerRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      fetchTickets().then(data => {
        const list = newTicket ? [newTicket, ...data.filter(t => t.id !== newTicket.id)] : data;
        setTickets(list);
        setLoading(false);
      });
      
      gsap.to(backdropRef.current, { opacity: 1, duration: 0.3, pointerEvents: 'auto' });
      gsap.fromTo(drawerRef.current, 
        { x: '100%' }, 
        { x: '0%', duration: 0.4, ease: 'power3.out' }
      );
    } else {
      gsap.to(backdropRef.current, { opacity: 0, duration: 0.3, pointerEvents: 'none' });
      gsap.to(drawerRef.current, { x: '100%', duration: 0.3, ease: 'power3.in' });
    }
  }, [isOpen, newTicket]);

  return (
    <>
      <div 
        ref={backdropRef} 
        className="fixed inset-0 bg-black/60 z-[55] opacity-0 pointer-events-none backdrop-blur-sm"
        onClick={onClose}
      />
      
      <div 
        ref={drawerRef}
        className="fixed top-0 right-0 h-full w-full md:w-[450px] bg-[#15161A] border-l border-white/10 z-[60] shadow-2xl flex flex-col transform translate-x-full"
      >
        <div className="p-6 border-b border-white/10 flex justify-between items-center bg-[#0B0C10]">
          <h2 className="text-xl font-bold text-white">Support Tickets</h2>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <X size={20} className="text-gray-400" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
            {loading ? (
                <div className="flex items-center justify-center h-40 text-suncube-orange">
                    <RefreshCcw className="animate-spin" />
                </div>
            ) : (
                tickets.map((ticket, i) => (
                    <div 
                        key={ticket.id} 
                        onClick={() => onTicketClick(ticket)}
                        className="p-4 bg-white/5 border border-white/5 rounded-xl hover:bg-white/10 transition-colors cursor-pointer group animate-in fade-in slide-in-from-bottom-2"
                        style={{ animationDelay: `${i * 0.05}s` }}
                    >
                        <div className="flex justify-between items-start mb-2">
                            <span className={`text-xs font-bold px-2 py-0.5 rounded border ${
                                ticket.priority === 'Critical' ? 'bg-red-500/10 text-red-400 border-red-500/30' :
                                ticket.priority === 'Medium' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30' :
                                'bg-blue-500/10 text-blue-400 border-blue-500/30'
                            }`}>{ticket.priority}</span>
                            <span className="text-xs text-gray-500 flex items-center gap-1">
                                <Clock size={12} /> {new Date(ticket.createdAt).toLocaleDateString()}
                            </span>
                        </div>
                        <h3 className="text-white font-medium mb-1 group-hover:text-suncube-orange transition-colors">{ticket.title}</h3>
                        <div className="flex justify-between items-center mt-3">
                            <span className="text-xs text-gray-500">{ticket.category}</span>
                            <div className="flex items-center gap-1.5 text-xs font-medium">
                                {ticket.status === 'Resolved' && <CheckCircle size={14} className="text-green-500" />}
                                {ticket.status === 'Pending' && <RefreshCcw size={14} className="text-gray-400 animate-spin" />}
                                <span className={
                                    ticket.status === 'Resolved' ? 'text-green-500' : 
                                    ticket.status === 'Pending' ? 'text-gray-400 italic' : 'text-suncube-cyan'
                                }>{ticket.status}</span>
                            </div>
                        </div>
                    </div>
                ))
            )}
        </div>
      </div>
    </>
  );
};
