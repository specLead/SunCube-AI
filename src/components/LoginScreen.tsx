
import React, { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { User, Shield, PenTool, Eye, EyeOff, Loader, ArrowRight } from 'lucide-react';
import { login, getDemoCredentials } from '../services/authService';
import { setAuth } from '../lib/authAdapter';

export const LoginScreen: React.FC = () => {
  const [role, setRole] = useState<'Customer' | 'Technician' | 'Admin'>('Customer');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Simple Entry Animation
    gsap.fromTo(cardRef.current, 
      { y: 20, opacity: 0 }, 
      { y: 0, opacity: 1, duration: 0.8, ease: "power3.out" }
    );
  }, []);

  const handleDemoFill = () => {
    const creds = getDemoCredentials(role);
    setEmail(creds.email);
    setPassword(creds.password);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await login({ email, password, role });
      
      // Save Auth to LocalStorage
      setAuth({
          token: response.token,
          role: response.role,
          user: response.user,
          expiresAt: response.expiresAt
      });

      // Redirect
      window.location.href = response.redirect;

    } catch (err: any) {
      setError(err.message || 'Authentication failed');
      // Shake animation on error
      gsap.fromTo(cardRef.current, { x: -5 }, { x: 5, duration: 0.1, repeat: 3, yoyo: true });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div ref={containerRef} className="min-h-screen bg-[#0D2218] flex items-center justify-center relative overflow-hidden font-sans text-gray-200">
      
      {/* Background Layer */}
      <div className="absolute inset-0 z-0 opacity-40 pointer-events-none">
         <div 
           className="absolute inset-0" 
           style={{ 
             backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px)', 
             backgroundSize: '40px 40px' 
           }}
         ></div>
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-suncube-orange/10 rounded-full blur-[80px] animate-pulse"></div>
      </div>

      {/* Main Card */}
      <div 
        ref={cardRef}
        className="relative z-10 w-full max-w-[480px] bg-[#15161A] border border-white/10 rounded-2xl shadow-2xl p-8 md:p-12 overflow-hidden"
      >
         <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-suncube-orange to-transparent opacity-70"></div>

         <div className="text-center mb-8">
             <div className="inline-flex items-center justify-center w-12 h-12 bg-suncube-orange/20 rounded-xl text-suncube-orange mb-4">
                 <Shield size={24} />
             </div>
             <h1 className="text-2xl font-bold text-white tracking-tight mb-2">Sign in to SunCube AI</h1>
             <p className="text-gray-400 text-sm">Choose your role and sign in</p>
         </div>

         {/* Role Selector */}
         <div className="bg-black/30 p-1 rounded-xl flex mb-8 border border-white/5">
             {(['Customer', 'Technician', 'Admin'] as const).map((r) => (
                 <button
                    key={r}
                    type="button"
                    onClick={() => { setRole(r); setError(null); }}
                    className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all duration-300 flex items-center justify-center gap-2 ${
                        role === r 
                        ? 'bg-white/10 text-white shadow-lg border border-white/10' 
                        : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
                    }`}
                 >
                     {r === 'Customer' && <User size={14} />}
                     {r === 'Technician' && <PenTool size={14} />}
                     {r === 'Admin' && <Shield size={14} />}
                     {r}
                 </button>
             ))}
         </div>

         <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-300 text-xs rounded-lg flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                    {error}
                </div>
            )}

            <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase ml-1">Email Address</label>
                <input 
                    type="email" 
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:border-suncube-orange focus:ring-1 focus:ring-suncube-orange/50 outline-none transition-all"
                    placeholder="name@company.com"
                />
            </div>

            <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase ml-1">Password</label>
                <div className="relative">
                    <input 
                        type={showPassword ? "text" : "password"} 
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:border-suncube-orange focus:ring-1 focus:ring-suncube-orange/50 outline-none transition-all"
                        placeholder="••••••••"
                    />
                    <button 
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3 text-gray-500 hover:text-white transition-colors"
                    >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                </div>
            </div>

            <div className="flex items-center justify-between text-xs text-gray-400">
                <label className="flex items-center gap-2 cursor-pointer hover:text-gray-300">
                    <input type="checkbox" className="rounded border-gray-600 bg-black/40 text-suncube-orange focus:ring-suncube-orange/50" />
                    Remember me
                </label>
                <button type="button" className="hover:text-suncube-orange transition-colors">Forgot password?</button>
            </div>

            <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-suncube-orange hover:bg-white text-black font-bold py-3.5 rounded-xl transition-all duration-300 shadow-[0_0_20px_rgba(255,122,24,0.3)] hover:shadow-[0_0_30px_rgba(255,255,255,0.5)] flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed group"
            >
                {loading ? <Loader className="animate-spin" size={20} /> : (
                    <>
                    Sign in <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    </>
                )}
            </button>
         </form>

         <div className="mt-6 pt-6 border-t border-white/5 text-center">
             <button 
                type="button"
                onClick={handleDemoFill}
                className="text-xs text-gray-500 hover:text-suncube-orange transition-colors flex items-center justify-center gap-1 mx-auto"
             >
                 Don't have an account? <span className="font-bold underline">Use demo account</span>
             </button>
         </div>

      </div>
    </div>
  );
};
