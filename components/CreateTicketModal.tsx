
import React, { useRef, useEffect, useState } from 'react';
import gsap from 'gsap';
import { X, Send, Paperclip, AlertTriangle, Loader, BrainCircuit } from 'lucide-react';
import { createTicket } from '../services/mockApi';
import { Ticket } from '../types';

interface CreateTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (ticket: Ticket) => void;
}

export const CreateTicketModal: React.FC<CreateTicketModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const [formData, setFormData] = useState({ title: '', category: 'Hardware', description: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      // Entry Animation
      const tl = gsap.timeline();
      tl.to(overlayRef.current, { opacity: 1, duration: 0.3, display: 'flex' })
        .fromTo(modalRef.current, 
          { scale: 0.9, opacity: 0, y: 20 },
          { scale: 1, opacity: 1, y: 0, duration: 0.4, ease: 'back.out(1.2)' }, 
          "-=0.2"
        );
    } else {
      // Exit Animation
      const tl = gsap.timeline({ onComplete: () => {
         if (overlayRef.current) overlayRef.current.style.display = 'none';
      }});
      tl.to(modalRef.current, { scale: 0.95, opacity: 0, duration: 0.2 })
        .to(overlayRef.current, { opacity: 0, duration: 0.2 }, "-=0.1");
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.description) {
      setError("Please fill in all required fields.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const newTicket = await createTicket(formData);
      
      // Success Animation
      const btn = document.getElementById('submit-ticket-btn');
      if (btn) {
        gsap.to(btn, { scale: 1.1, duration: 0.1, yoyo: true, repeat: 1 });
      }

      setTimeout(() => {
        onSuccess(newTicket);
        setFormData({ title: '', category: 'Hardware', description: '' });
        setIsSubmitting(false);
        onClose();
      }, 500); // Slight delay to show loading state
    } catch (err) {
      setError("Failed to create ticket. System offline? Queued for retry.");
      setIsSubmitting(false);
    }
  };

  return (
    <div 
      ref={overlayRef} 
      className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm hidden items-center justify-center p-4"
    >
      <div 
        ref={modalRef}
        className="w-full max-w-lg bg-[#15161A] border border-white/10 rounded-2xl shadow-2xl relative overflow-hidden"
      >
        {/* Holographic Top Border */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-suncube-orange to-transparent opacity-50"></div>

        <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <AlertTriangle className="text-suncube-orange" size={20} /> Raise Support Ticket
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-200 text-sm flex items-center gap-2">
              <AlertTriangle size={14} /> {error}
            </div>
          )}

          <div>
            <label className="block text-xs text-gray-500 uppercase font-medium mb-1">Issue Title</label>
            <input 
              type="text" 
              className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:border-suncube-orange focus:ring-1 focus:ring-suncube-orange outline-none transition-all"
              placeholder="e.g., Inverter Output Low"
              value={formData.title}
              onChange={e => setFormData({...formData, title: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-500 uppercase font-medium mb-1">Category</label>
              <select 
                className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white outline-none"
                value={formData.category}
                onChange={e => setFormData({...formData, category: e.target.value})}
              >
                <option>Hardware</option>
                <option>Software / App</option>
                <option>Billing</option>
                <option>Maintenance</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 uppercase font-medium mb-1">Priority</label>
              <div className="w-full bg-black/20 border border-white/5 rounded-lg p-3 flex items-center gap-2 text-gray-400 text-sm">
                  <BrainCircuit size={14} className="text-suncube-cyan" /> Auto-detected
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs text-gray-500 uppercase font-medium mb-1">Description</label>
            <textarea 
              rows={4}
              className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:border-suncube-orange focus:ring-1 focus:ring-suncube-orange outline-none transition-all resize-none"
              placeholder="Describe the issue in detail..."
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
            />
          </div>

          <div className="flex items-center gap-2 text-gray-400 text-sm cursor-pointer hover:text-suncube-orange transition-colors">
            <Paperclip size={16} /> Attach Screenshots
          </div>

          <div className="pt-4 flex justify-end gap-3">
             <button 
               type="button" 
               onClick={onClose}
               className="px-4 py-2 rounded-lg text-gray-400 hover:bg-white/5 transition-colors"
             >
               Cancel
             </button>
             <button 
               id="submit-ticket-btn"
               type="submit" 
               disabled={isSubmitting}
               className={`px-6 py-2 rounded-lg bg-suncube-orange text-black font-bold flex items-center gap-2 hover:bg-white transition-colors ${isSubmitting ? 'opacity-70 cursor-wait' : ''}`}
             >
               {isSubmitting ? <Loader className="animate-spin" size={18} /> : <Send size={18} />}
               Submit Ticket
             </button>
          </div>
        </form>
      </div>
    </div>
  );
};
