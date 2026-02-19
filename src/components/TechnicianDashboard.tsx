
import React from 'react';
import { PenTool, LogOut } from 'lucide-react';
import { logout } from '../services/authService';

export const TechnicianDashboard: React.FC = () => {
  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  return (
    <div className="min-h-screen bg-[#0B0C10] flex items-center justify-center p-4 font-sans">
       <div className="bg-[#15161A] border border-white/10 p-8 rounded-2xl text-center max-w-md w-full shadow-2xl">
           <div className="w-16 h-16 bg-blue-500/10 text-blue-400 rounded-full flex items-center justify-center mx-auto mb-6">
               <PenTool size={32} />
           </div>
           <h1 className="text-2xl font-bold text-white mb-2">Technician Dashboard</h1>
           <p className="text-gray-400 mb-8">This portal is under construction. Please check back later for site diagnostic tools.</p>
           
           <button 
             onClick={handleLogout}
             className="flex items-center justify-center gap-2 w-full py-3 bg-white/5 hover:bg-white/10 text-white font-bold rounded-xl transition-colors"
           >
               <LogOut size={18} /> Sign Out
           </button>
       </div>
    </div>
  );
};
