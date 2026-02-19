import React, { useRef, useEffect, useState } from 'react';
import gsap from 'gsap';
import { X, Send, Paperclip, AlertTriangle, Loader, CheckCircle, FileText } from 'lucide-react';
import { createTicket } from '../services/mockApi';
import { Ticket, Transaction } from '../types';

interface DisputeFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (ticket: Ticket) => void;
  transaction: Transaction | null;
}

export const DisputeFormModal: React.FC<DisputeFormModalProps> = ({ isOpen, onClose, onSuccess, transaction }) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const [formData, setFormData] = useState({ subject: '', description: '' });
  const [attachments, setAttachments] = useState<{name: string, size: string}[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && transaction) {
      // Pre-fill
      setFormData({
          subject: `Billing dispute for ${transaction.invoiceId || 'Transaction ' + transaction.txHash.substring(0,8)}`,
          description: `I am disputing transaction ${transaction.id} because...`
      });
      setAttachments([]);
      setError(null);

      // Animation
      gsap.to(overlayRef.current, { display: 'flex', opacity: 1, duration: 0.3 });
      gsap.fromTo(modalRef.current, 
        { scale: 0.95, opacity: 0, y: 20 },
        { scale: 1, opacity: 1, y: 0, duration: 0.4, ease: 'back.out(1.2)' }
      );
    } else {
      gsap.to(modalRef.current, { scale: 0.95, opacity: 0, duration: 0.2 });
      gsap.to(overlayRef.current, { opacity: 0, duration: 0.2, onComplete: () => {
          if (overlayRef.current) overlayRef.current.style.display = 'none';
      }});
    }
  }, [isOpen, transaction]);

  const handleFileUpload = () => {
      // Simulating file upload
      const newFile = { name: `screenshot_${Date.now()}.png`, size: '1.2 MB' };
      setAttachments([...attachments, newFile]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.description) {
      setError("Please provide a description of the dispute.");
      return;
    }
    if (!transaction) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const ticketData: Partial<Ticket> = {
          title: formData.subject,
          category: 'Billing',
          description: formData.description,
          priority: 'Medium',
          linkedTransactionId: transaction.id,
          linkedInvoiceId: transaction.invoiceId,
          attachments: attachments.map(a => ({ name: a.name, url: '#' }))
      };

      const newTicket = await createTicket(ticketData);
      
      // Success sequence
      setIsSubmitting(false);
      onSuccess(newTicket);
      onClose();
    } catch (err) {
      setError("Failed to create dispute ticket. Please try again.");
      setIsSubmitting(false);
    }
  };

  if (!transaction) return null;

  return (
    <div 
      ref={overlayRef} 
      className="fixed inset-0 z-[110] bg-black/80 backdrop-blur-sm hidden items-center justify-center p-4"
    >
      <div 
        ref={modalRef}
        className="w-full max-w-lg bg-[#15161A] border border-red-500/30 rounded-2xl shadow-2xl relative overflow-hidden"
      >
        {/* Header */}
        <div className="p-5 border-b border-white/10 flex justify-between items-center bg-[#0B0C10]">
          <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <AlertTriangle className="text-red-500" size={20} /> Raise Billing Dispute
              </h2>
              <div className="text-xs text-gray-500 font-mono mt-1">Ref: {transaction.txHash}</div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-full">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-200 text-xs flex items-center gap-2">
              <AlertTriangle size={14} /> {error}
            </div>
          )}

          <div>
            <label className="block text-xs text-gray-500 uppercase font-medium mb-1">Subject</label>
            <input 
              type="text" 
              className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white text-sm focus:border-red-500 focus:ring-1 focus:ring-red-500/50 outline-none transition-all"
              value={formData.subject}
              onChange={e => setFormData({...formData, subject: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-xs text-gray-500 uppercase font-medium mb-1">Description</label>
            <textarea 
              rows={5}
              className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white text-sm focus:border-red-500 focus:ring-1 focus:ring-red-500/50 outline-none transition-all resize-none"
              placeholder="Please explain the issue with this transaction..."
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
            />
          </div>

          <div>
              <div className="flex justify-between items-center mb-2">
                  <label className="block text-xs text-gray-500 uppercase font-medium">Attachments</label>
                  <button type="button" onClick={handleFileUpload} className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1">
                      <Paperclip size={12}/> Add File
                  </button>
              </div>
              {attachments.length > 0 ? (
                  <div className="space-y-2">
                      {attachments.map((file, i) => (
                          <div key={i} className="flex items-center justify-between p-2 bg-white/5 rounded border border-white/5">
                              <div className="flex items-center gap-2 text-xs text-gray-300">
                                  <FileText size={14}/> {file.name} <span className="text-gray-500">({file.size})</span>
                              </div>
                              <button type="button" onClick={() => setAttachments(attachments.filter((_, idx) => idx !== i))} className="text-gray-500 hover:text-white">
                                  <X size={14}/>
                              </button>
                          </div>
                      ))}
                  </div>
              ) : (
                  <div className="p-4 border border-dashed border-white/10 rounded-lg text-center text-xs text-gray-500">
                      No files attached.
                  </div>
              )}
          </div>

          <div className="pt-2 flex justify-end gap-3">
             <button 
               type="button" 
               onClick={onClose}
               disabled={isSubmitting}
               className="px-4 py-2 rounded-lg text-gray-400 hover:bg-white/5 transition-colors text-sm"
             >
               Cancel
             </button>
             <button 
               type="submit" 
               disabled={isSubmitting}
               className={`px-6 py-2 rounded-lg bg-red-500 text-white font-bold flex items-center gap-2 hover:bg-red-600 transition-colors text-sm shadow-[0_0_15px_rgba(239,68,68,0.3)] ${isSubmitting ? 'opacity-70 cursor-wait' : ''}`}
             >
               {isSubmitting ? <Loader className="animate-spin" size={16} /> : <Send size={16} />}
               Submit Dispute
             </button>
          </div>
        </form>
      </div>
    </div>
  );
};