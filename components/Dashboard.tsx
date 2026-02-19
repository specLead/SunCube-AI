import React, { useRef, useLayoutEffect, useState, useEffect } from 'react';
import gsap from 'gsap';
import { 
  Zap, Sun, TrendingUp, Activity, Bell, Settings as SettingsIcon, User, 
  Wind, AlertTriangle, ArrowRight, Leaf, ChevronRight, LogOut,
  Download, Filter, RefreshCw, Calendar, DollarSign, PieChart, FileText, CheckCircle, Clock,
  BrainCircuit, ChevronDown, PenTool, Battery, Layers, Monitor, MessageSquare, Wallet, Globe, X, MapPin, Wrench, Check, Shield, Info, Smartphone, Laptop, Lock, Moon, Sun as SunIcon, Type
} from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar 
} from 'recharts';
import { MapCluster } from './MapCluster';
// import { AIChatModal } from './AIChatModal';
import { CreateTicketModal } from './CreateTicketModal';
import { TicketDrawer } from './TicketDrawer';
import { TicketDetailDrawer } from './TicketDetailDrawer';
import { TransactionModal } from './TransactionModal';
import { DiagnosticDrawer } from './DiagnosticDrawer';
import { DeviceDetailModal } from './DeviceDetailModal';
import { MetricDetailsModal } from './MetricDetailsModal';
import { PaymentsScreen } from './PaymentsScreen';
import ToggleSwitch from './ToggleSwitch';
import { KPI, Alert, Transaction, UserPreferences, Notification, Ticket, AIInsight, DeviceHealth, MaintenanceAlert, SiteDetail, MetricKey, UserProfile, UserSession } from '../types';
import { 
  subscribeToRealtime, fetchGenerationData, fetchPreferences, updateUserPreferences, fetchNotifications, 
  markNotificationsRead, fetchPayouts, fetchAIInsights, fetchDeviceHealth, fetchMaintenanceData, fetchTickets, fetchSiteDetails, fetchSettlement, acknowledgeAlert, applyAiRecommendation, fetchCurrentUser, fetchUserSessions, deleteUserSession, changePassword, toggle2FA, updateUserProfile, requestAccountDeletion, recordAuditEvent
} from '../services/mockApi';

// --- ANIMATED NUMBER COMPONENT ---
const CountUp: React.FC<{ end: number; decimals?: number; duration?: number; suffix?: string; prefix?: string }> = ({ end, decimals = 0, duration = 2, suffix = '', prefix = '' }) => {
  const spanRef = useRef<HTMLSpanElement>(null);
  const prevVal = useRef(end);
  
  useEffect(() => {
    if (!spanRef.current) return;
    const isUp = end > prevVal.current;
    const color = isUp ? '#00F0FF' : '#EF4444'; 
    
    // Number Tween
    const obj = { val: prevVal.current };
    gsap.to(obj, {
      val: end,
      duration: 1.2,
      ease: "expo.out",
      onUpdate: () => {
        if (spanRef.current) spanRef.current.innerText = prefix + obj.val.toFixed(decimals) + suffix;
      }
    });

    // Color Flash if changed
    if (prevVal.current !== end) {
        gsap.fromTo(spanRef.current, 
            { color: color, scale: 1.05 },
            { color: "#FFFFFF", scale: 1, duration: 0.8, ease: "power2.out" }
        );
    }
    prevVal.current = end;
  }, [end, decimals, suffix, prefix]);

  return <span ref={spanRef} className="inline-block origin-left font-mono">{prefix}{end.toFixed(decimals)}{suffix}</span>;
};

// --- KPI CARD ---
const KPICard: React.FC<{ kpi: KPI; index: number; onClick: (key: MetricKey) => void }> = ({ kpi, index, onClick }) => (
  <button 
    onClick={() => kpi.metricKey && onClick(kpi.metricKey)}
    className="kpi-card glass-panel rounded-2xl p-5 relative overflow-hidden group holo-border transition-transform hover:-translate-y-1 duration-300 w-full text-left focus:outline-none focus:ring-2 focus:ring-suncube-orange/50"
  >
    <div className="flex justify-between items-start mb-2">
      <span className="text-gray-400 text-sm font-medium">{kpi.label}</span>
      <div className={`flex items-center text-xs ${kpi.trendUp ? 'text-suncube-cyan' : 'text-red-400'}`}>
        {kpi.trendUp ? '+' : ''}{kpi.trend}%
        <TrendingUp size={12} className={`ml-1 ${!kpi.trendUp && 'rotate-180'}`} />
      </div>
    </div>
    <div className="text-3xl font-bold text-white tracking-tight mb-2 flex items-baseline gap-1">
       <CountUp end={kpi.value} decimals={kpi.unit === '%' ? 1 : kpi.unit === '$' ? 0 : 1} suffix="" prefix={kpi.unit === '$' ? '$' : ''} />
       <span className="text-base text-gray-500 font-normal">{kpi.unit !== '$' ? kpi.unit : ''}</span>
    </div>
    <div className="absolute bottom-0 left-0 right-0 h-8 opacity-20 group-hover:opacity-40 transition-opacity pointer-events-none">
       <ResponsiveContainer width="100%" height="100%">
         <AreaChart data={[{v:0},{v:5},{v:2},{v:8},{v:4},{v:10}]}>
           <defs>
             <linearGradient id={`grad${index}`} x1="0" y1="0" x2="0" y2="1">
               <stop offset="5%" stopColor="#FF7A18" stopOpacity={0.8}/>
               <stop offset="95%" stopColor="#FF7A18" stopOpacity={0}/>
             </linearGradient>
           </defs>
           <Area type="monotone" dataKey="v" stroke="#FF7A18" fill={`url(#grad${index})`} strokeWidth={2} />
         </AreaChart>
       </ResponsiveContainer>
    </div>
  </button>
);

const SettingsCard: React.FC<{ title: string; children: React.ReactNode; icon?: React.ReactNode; id?: string }> = ({ title, children, icon, id }) => (
  <div id={id} className="glass-panel rounded-2xl p-6 border border-white/10 mb-6 animate-in fade-in slide-in-from-bottom-4">
    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
      {icon} {title}
    </h3>
    <div className="space-y-1">{children}</div>
  </div>
);

// --- SITE DETAIL DRAWER ---
const SiteDetailDrawer: React.FC<{ siteId: string | null; onClose: () => void }> = ({ siteId, onClose }) => {
    const drawerRef = useRef<HTMLDivElement>(null);
    const [site, setSite] = useState<SiteDetail | null>(null);

    useEffect(() => {
        if (siteId) {
            setSite(null); // Reset
            fetchSiteDetails(siteId).then(setSite);
            gsap.fromTo(drawerRef.current, { x: '100%' }, { x: '0%', duration: 0.4, ease: 'power3.out' });
        } else {
             gsap.to(drawerRef.current, { x: '100%', duration: 0.3 });
        }
    }, [siteId]);

    if (!siteId) return null;

    return (
        <div className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm flex justify-end" onClick={onClose}>
            <div 
                ref={drawerRef} 
                className="w-full max-w-md bg-[#15161A] border-l border-white/10 h-full shadow-2xl flex flex-col" 
                onClick={e => e.stopPropagation()}
            >
                {site ? (
                    <>
                    <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
                         <h2 className="text-xl font-bold text-white flex items-center gap-2"><MapPin size={20} className="text-suncube-orange"/> {site.name}</h2>
                         <button onClick={onClose}><X className="text-gray-400 hover:text-white"/></button>
                    </div>
                    <div className="p-6 space-y-6 flex-1 overflow-y-auto">
                         <div className="grid grid-cols-2 gap-4">
                             <div className="p-4 bg-white/5 rounded-xl border border-white/5 text-center">
                                 <div className="text-xs text-gray-500 uppercase">Health Score</div>
                                 <div className={`text-2xl font-bold ${site.health > 90 ? 'text-green-500' : 'text-amber-500'}`}>{site.health}%</div>
                             </div>
                             <div className="p-4 bg-white/5 rounded-xl border border-white/5 text-center">
                                 <div className="text-xs text-gray-500 uppercase">Today's Energy</div>
                                 <div className="text-2xl font-bold text-white">{site.todayEnergy}<span className="text-sm font-normal text-gray-500">kWh</span></div>
                             </div>
                         </div>
                         
                         <div>
                             <h3 className="text-sm font-bold text-white mb-3">Performance Trend</h3>
                             <div className="h-24 w-full bg-white/5 rounded-xl p-2">
                                 <ResponsiveContainer>
                                    <LineChart data={site.trend.map((v,i) => ({v}))}>
                                        <Line type="monotone" dataKey="v" stroke="#FF7A18" strokeWidth={2} dot={false} />
                                    </LineChart>
                                 </ResponsiveContainer>
                             </div>
                         </div>

                         <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                             <div className="flex justify-between items-center mb-2">
                                 <span className="text-sm text-gray-400">Active Faults</span>
                                 <span className={`px-2 py-0.5 rounded text-xs font-bold ${site.activeFaults > 0 ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}`}>
                                     {site.activeFaults} Issues
                                 </span>
                             </div>
                             <div className="flex justify-between items-center">
                                 <span className="text-sm text-gray-400">Last Telemetry</span>
                                 <span className="text-sm text-white">{site.lastTelemetry}</span>
                             </div>
                         </div>
                    </div>
                    <div className="p-4 border-t border-white/10">
                        <button className="w-full py-3 bg-suncube-orange text-black font-bold rounded-xl hover:bg-white transition-colors">
                            Open Full Site Report
                        </button>
                    </div>
                    </>
                ) : (
                    <div className="flex items-center justify-center h-full text-suncube-orange"><RefreshCw className="animate-spin" size={32}/></div>
                )}
            </div>
        </div>
    );
}

// --- MAIN DASHBOARD COMPONENT ---
export const Dashboard: React.FC = () => {
  const container = useRef<HTMLDivElement>(null);
  
  // -- UI STATE --
  const [activeTab, setActiveTab] = useState<'dashboard' | 'payments' | 'settings'>('dashboard');
  const [isAIChatOpen, setAIChatOpen] = useState(false);
  const [isTicketModalOpen, setTicketModalOpen] = useState(false);
  const [isTicketDrawerOpen, setTicketDrawerOpen] = useState(false);
  const [isProfileOpen, setProfileOpen] = useState(false);
  const [isNotifOpen, setNotifOpen] = useState(false);
  const [aiExpanded, setAiExpanded] = useState(false);
  const [isDiagnosticDrawerOpen, setDiagnosticDrawerOpen] = useState(false);
  const [diagnosticTarget, setDiagnosticTarget] = useState<string | null>(null);
  const [isDeviceModalOpen, setDeviceModalOpen] = useState(false);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  
  // -- NEW STATE FOR UPGRADE --
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [selectedSiteId, setSelectedSiteId] = useState<string | null>(null);
  const [selectedSettlementId, setSelectedSettlementId] = useState<string | null>(null);
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  
  // -- SETTINGS STATE --
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [sessions, setSessions] = useState<UserSession[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  // Modals state (simplified for this modification)
  const [isProfileEditOpen, setIsProfileEditOpen] = useState(false);
  const [isChangePassOpen, setIsChangePassOpen] = useState(false);
  const [is2FAOpen, setIs2FAOpen] = useState(false);

  // -- METRIC MODAL STATE --
  const [selectedMetric, setSelectedMetric] = useState<MetricKey | null>(null);
  
  // Debounce refs
  const debounceTimers = useRef<{[key: string]: ReturnType<typeof setTimeout>}>({});

  // -- DATA STATE --
  const [kpis, setKpis] = useState<KPI[]>([
    { id: '1', label: 'Live Power', value: 0, unit: 'kW', trend: 12, trendUp: true, metricKey: 'livePower' },
    { id: '2', label: 'Today Energy', value: 0, unit: 'kWh', trend: 8, trendUp: true, metricKey: 'todayEnergy' },
    { id: '3', label: 'Mo. Earnings', value: 0, unit: '$', trend: 5, trendUp: true, metricKey: 'monthlyEarnings' },
    { id: '4', label: 'Uptime', value: 99.8, unit: '%', trend: 0, trendUp: true, metricKey: 'uptime' },
  ]);
  const [graphRange, setGraphRange] = useState<'24h' | '7d' | '30d'>('24h');
  const [chartData, setChartData] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [maintenance, setMaintenance] = useState<MaintenanceAlert[]>([]);
  const [devices, setDevices] = useState<DeviceHealth[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [payouts, setPayouts] = useState<Transaction[]>([]);

  // -- 1. DATA FETCHING & KPI INTERVALS --
  useEffect(() => {
    // Initial Load
    fetchCurrentUser().then(setCurrentUser);
    fetchGenerationData('24h').then(setChartData);
    fetchNotifications().then(setNotifications);
    fetchPayouts().then(setPayouts);
    fetchAIInsights().then(setInsights);
    fetchMaintenanceData().then(setMaintenance);
    fetchDeviceHealth().then(setDevices);
    fetchTickets().then(t => setTickets(t.slice(0, 3))); // Preview only 3
    
    // Load Settings Data
    setSettingsLoading(true);
    fetchPreferences().then(p => {
        setPreferences(p);
        setSettingsLoading(false);
    });
    fetchUserSessions().then(setSessions);

    // Real-time Power (Websocket Sim) - 5s
    const unsubRealtime = subscribeToRealtime((payload) => {
       if (payload.type === 'kpi_update') {
          setKpis(prev => prev.map(k => {
             if (k.label === 'Live Power') return { ...k, value: payload.data.livePower };
             return k;
          }));
       }
    });

    // Intervals... (omitted to save space, assuming they run as before)
    return () => { unsubRealtime(); };
  }, []);

  // -- SETTINGS HANDLERS --
  const handlePrefChange = async (path: string, value: any) => {
      if (!preferences) return;
      
      // 1. Optimistic Update
      const prevPrefs = JSON.parse(JSON.stringify(preferences)); // backup
      const newPrefs = JSON.parse(JSON.stringify(preferences));
      
      const keys = path.split('.');
      let current = newPrefs;
      for (let i = 0; i < keys.length - 1; i++) current = current[keys[i]];
      current[keys[keys.length - 1]] = value;

      setPreferences(newPrefs);

      // 2. Debounce API Call (500ms)
      if (debounceTimers.current[path]) {
          clearTimeout(debounceTimers.current[path]);
      }

      debounceTimers.current[path] = setTimeout(async () => {
          try {
              // Construct partial object for API
              const partial: any = {};
              let ptr = partial;
              for (let i = 0; i < keys.length - 1; i++) {
                  ptr[keys[i]] = {};
                  ptr = ptr[keys[i]];
              }
              ptr[keys[keys.length - 1]] = value;

              await updateUserPreferences(partial);
              
              // 4. Audit Event for Sensitive Billing Logic
              if (path === 'billing.autoSettleSmallPayouts' || path === 'billing.consolidatedMonthlyInvoice') {
                  await recordAuditEvent({
                      userId: currentUser?.id || 'unknown',
                      action: 'pref.change',
                      key: path,
                      value: value
                  });
              }

          } catch (err) {
              setPreferences(prevPrefs); // Revert on failure
              showToast("Unable to save setting. Reverting.");
          }
          delete debounceTimers.current[path];
      }, 500);
  };

  const showToast = (msg: string) => {
      setToastMessage(msg);
      setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSessionLogout = async (id: string) => {
      try {
          setSessions(prev => prev.filter(s => s.id !== id));
          await deleteUserSession(id);
          showToast("Session ended.");
      } catch (e) {
          showToast("Failed to end session.");
      }
  };
  
  const handlePasswordChange = async () => {
      // Mock flow
      await changePassword("old", "new");
      showToast("Password updated successfully.");
      setIsChangePassOpen(false);
  };

  const handle2FA = async () => {
      await toggle2FA(!is2FAOpen); // toggle mock
      showToast("2FA Settings Updated.");
      setIs2FAOpen(false);
  }

  // -- 2. GRAPH INTERACTION --
  const handleRangeChange = async (range: '24h' | '7d' | '30d') => {
    setGraphRange(range);
    const newData = await fetchGenerationData(range);
    setChartData(newData);
  };

  // -- 3. LAYOUT ANIMATION --
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".animate-enter", { 
          y: 20, opacity: 0, duration: 0.6, stagger: 0.08, ease: "power3.out" 
      });
    }, container);
    return () => ctx.revert();
  }, [activeTab]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleExportDetailsClick = async () => {
      const tx = await fetchSettlement('t1');
      setSelectedTx(tx);
  };

  const handleAcknowledgeAlert = async (id: string) => {
      await acknowledgeAlert(id);
      setMaintenance(prev => prev.map(m => m.id === id ? {...m, acknowledged: true} : m));
  };

  const handleOpenDiagnostic = (id: string) => {
      setDiagnosticTarget(id);
      setDiagnosticDrawerOpen(true);
  };

  const handleDeviceClick = (id: string) => {
      setSelectedDeviceId(id);
      setDeviceModalOpen(true);
  };

  const handleApplyRecommendation = async (recId: string) => {
      await applyAiRecommendation(recId);
      alert("Recommendation Applied: Technician scheduled for optimal slot.");
  };

  const handleRegionalViewClick = () => {
      alert("Navigating to Regional Dashboard...");
  };

  const handleTicketCreated = (newTicket: Ticket) => {
      setTickets(prev => [newTicket, ...prev]);
  };

  return (
    <div ref={container} className="min-h-screen bg-[#0B0C10] text-gray-200 bg-grid-pattern pb-20 font-sans" onClick={() => { setProfileOpen(false); setNotifOpen(false); }}>
      
      {/* Toast */}
      {toastMessage && (
          <div className="fixed bottom-6 right-6 z-[100] bg-white text-black px-4 py-3 rounded-lg shadow-lg animate-in fade-in slide-in-from-bottom-5 font-medium flex items-center gap-2">
              <Info size={18}/> {toastMessage}
          </div>
      )}

      {/* --- TOP NAVIGATION --- */}
      <nav className="sticky top-0 z-40 bg-[#0B0C10]/95 backdrop-blur-xl border-b border-white/5 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-8">
            <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-suncube-orange to-red-600 flex items-center justify-center text-white font-bold shadow-[0_0_15px_rgba(255,122,24,0.4)]">S</div>
                <span className="font-bold text-white text-lg tracking-tight">SUNCUBE<span className="text-suncube-orange font-light">.AI</span></span>
            </div>
            <div className="hidden md:flex items-center gap-1 bg-white/5 p-1 rounded-full border border-white/5">
                {['Dashboard', 'Payments', 'Settings'].map((tab) => (
                    <button 
                        key={tab}
                        onClick={() => setActiveTab(tab.toLowerCase() as any)}
                        className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-300 ${activeTab === tab.toLowerCase() ? 'bg-suncube-orange text-black shadow-lg shadow-suncube-orange/20' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                    >
                        {tab}
                    </button>
                ))}
            </div>
        </div>
        <div className="flex items-center gap-4">
            {/* Notification Bell */}
            <div className="relative">
                <button 
                    onClick={(e) => { 
                        e.stopPropagation(); 
                        setNotifOpen(!isNotifOpen); 
                        if(!isNotifOpen && unreadCount > 0) { 
                            markNotificationsRead(); 
                            setNotifications(notifications.map(n => ({...n, read: true}))); 
                        } 
                    }}
                    className="relative p-2 text-gray-400 hover:text-white transition-colors"
                >
                    <Bell size={20} />
                    {unreadCount > 0 && <span className="absolute top-2 right-2 w-2 h-2 bg-suncube-orange rounded-full animate-pulse"></span>}
                </button>
                {isNotifOpen && (
                    <div className="absolute right-0 top-12 w-80 bg-[#15161A] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200 origin-top-right">
                        <div className="p-3 border-b border-white/10 text-sm font-semibold text-white bg-white/5 flex justify-between">
                            <span>Notifications</span>
                            <span className="text-xs text-gray-400 cursor-pointer hover:text-white">Mark all read</span>
                        </div>
                        <div className="max-h-60 overflow-y-auto">
                            {notifications.length === 0 ? <div className="p-4 text-xs text-gray-500 text-center">No notifications</div> : 
                                notifications.map(n => (
                                    <div key={n.id} className={`p-3 border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer ${!n.read ? 'bg-suncube-orange/5' : ''}`}>
                                        <div className="flex justify-between items-start mb-1">
                                            <span className={`text-xs font-bold ${n.type === 'success' ? 'text-green-400' : 'text-suncube-orange'}`}>{n.title}</span>
                                            <span className="text-[10px] text-gray-500">{n.timestamp}</span>
                                        </div>
                                        <p className="text-xs text-gray-300">{n.message}</p>
                                    </div>
                                ))
                            }
                        </div>
                        <div className="p-2 bg-black/40 grid grid-cols-2 text-center text-xs text-gray-400 border-t border-white/5">
                             <div className="cursor-pointer hover:text-white border-r border-white/5">Ticket Updates</div>
                             <div className="cursor-pointer hover:text-white">Settlements</div>
                        </div>
                    </div>
                )}
            </div>

            {/* Profile Dropdown */}
            <div className="relative">
                <div 
                    onClick={(e) => { e.stopPropagation(); setProfileOpen(!isProfileOpen); }}
                    className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center border border-white/10 hover:border-suncube-orange/50 transition-colors cursor-pointer"
                >
                    <User size={16} />
                </div>
                {isProfileOpen && (
                    <div className="absolute right-0 top-12 w-56 bg-[#15161A] border border-white/10 rounded-xl shadow-2xl py-1 z-50 animate-in fade-in zoom-in-95 duration-200 origin-top-right">
                        <div className="px-4 py-3 border-b border-white/10 mb-1">
                             <div className="text-sm font-bold text-white">{currentUser?.name || 'Loading...'}</div>
                             <div className="text-xs text-gray-500">{currentUser?.plan || 'Standard'} Plan • ID: #{currentUser?.id?.replace('u','') || '...'}</div>
                        </div>
                        <button onClick={() => { setProfileOpen(false); setIsProfileEditOpen(true); }} className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-colors flex items-center gap-2"><SettingsIcon size={14}/> Account Settings</button>
                        <button onClick={() => setActiveTab('payments')} className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-colors flex items-center gap-2"><DollarSign size={14}/> Billing & Payments</button>
                        <button onClick={() => setActiveTab('settings')} className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-colors flex items-center gap-2"><Bell size={14}/> Notification Prefs</button>
                        <div className="h-px bg-white/10 my-1"></div>
                        <button className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors flex items-center gap-2">
                            <LogOut size={14} /> Logout
                        </button>
                    </div>
                )}
            </div>
        </div>
      </nav>

      {/* --- MAIN CONTENT --- */}
      <main className="w-full max-w-[95%] mx-auto pt-8">
        
        {activeTab === 'dashboard' && (
            <>
                {/* 1. HERO KPI ROW */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 animate-enter">
                    {kpis.map((kpi, idx) => (
                        <KPICard 
                            key={kpi.id} 
                            kpi={kpi} 
                            index={idx} 
                            onClick={setSelectedMetric} 
                        />
                    ))}
                </div>

                {/* 2. ROW B: AI INSIGHTS & PAYOUT SNAPSHOT */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6 animate-enter">
                    {/* AI Insights Panel */}
                    <div className="lg:col-span-2 glass-panel rounded-2xl p-0 border border-white/10 relative overflow-hidden flex flex-col justify-center">
                        <div className="absolute top-0 bottom-0 left-0 w-1 bg-gradient-to-b from-amber-500 to-suncube-orange animate-pulse"></div>
                        <div className="p-6">
                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-suncube-orange/10 rounded-xl text-suncube-orange">
                                    <BrainCircuit size={28} className="animate-pulse" />
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-start">
                                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                            {insights[0]?.title || 'System Optimized'} 
                                            <span className="text-xs px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
                                                Confidence {insights[0]?.confidence}%
                                            </span>
                                        </h3>
                                    </div>
                                    <p className="text-sm text-gray-400 mt-1">{insights[0]?.rootCause || 'All systems operating within normal parameters.'}</p>
                                    
                                    <div className={`overflow-hidden transition-all duration-500 ease-in-out ${aiExpanded ? 'max-h-80 mt-4 opacity-100' : 'max-h-0 opacity-0'}`}>
                                        <div 
                                            className="p-4 rounded-lg border border-white/5 text-sm text-gray-300 relative overflow-hidden group"
                                            style={{ 
                                                backgroundImage: "url('https://api.mapbox.com/styles/v1/mapbox/dark-v10/static/-122.4194,37.7749,15,0/400x200@2x?access_token=pk.mock')",
                                                backgroundSize: 'cover',
                                                backgroundPosition: 'center'
                                            }}
                                        >
                                            <div className="absolute inset-0 bg-black/80 backdrop-blur-[2px]"></div>
                                            <div className="relative z-10">
                                                <div className="font-semibold text-white mb-2 flex items-center gap-2"><PenTool size={14}/> Detailed Analysis</div>
                                                <p className="mb-2 leading-relaxed">{insights[0]?.details}</p>
                                                <div className="grid grid-cols-2 gap-4 mt-3 pt-3 border-t border-white/10">
                                                    <div>
                                                        <div className="text-[10px] text-gray-500 uppercase">Contributing Factors</div>
                                                        <div className="text-xs text-white">Dust (High), Temp (Avg)</div>
                                                    </div>
                                                    <div>
                                                        <div className="text-[10px] text-gray-500 uppercase">Historical Comparison</div>
                                                        <div className="text-xs text-suncube-cyan">-5% vs Last Week</div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="mt-3 flex gap-2">
                                            <button 
                                                onClick={() => handleApplyRecommendation(insights[0]?.id)}
                                                className="px-4 py-1.5 bg-suncube-orange text-black font-bold text-xs rounded hover:bg-white transition-colors"
                                            >
                                                Apply Recommendation
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => setAiExpanded(!aiExpanded)}
                                    className="p-2 hover:bg-white/10 rounded-full transition-colors flex items-center gap-1 text-xs text-gray-400"
                                >
                                    Explain Why <ChevronDown size={16} className={`transition-transform duration-300 ${aiExpanded ? 'rotate-180' : ''}`} />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Payout & Export Mini-Summary Stack */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-4">
                        {/* Payout */}
                        <div className="glass-panel rounded-2xl p-5 border border-white/10 flex flex-col justify-between hover:border-suncube-orange/30 transition-colors cursor-pointer group" onClick={() => setActiveTab('payments')}>
                             <div className="flex justify-between items-start">
                                 <div>
                                     <div className="text-gray-400 text-[10px] font-bold uppercase tracking-wider mb-1">This Month Earnings</div>
                                     <div className="text-2xl font-bold text-white"><CountUp end={482.50} prefix="$" decimals={2} /></div>
                                 </div>
                                 <div className="p-2 bg-green-500/10 rounded-lg text-green-400 group-hover:bg-green-500/20 transition-colors">
                                     <Wallet size={20} />
                                 </div>
                             </div>
                             <div className="mt-2 flex items-center justify-between text-xs">
                                 <span className="text-amber-400 font-medium">Pending: $124.00</span>
                                 <span className="text-suncube-orange opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">View <ChevronRight size={12}/></span>
                             </div>
                        </div>
                        {/* Energy Export */}
                        <div className="glass-panel rounded-2xl p-5 border border-white/10 flex flex-col justify-between hover:border-suncube-cyan/30 transition-colors cursor-pointer group" onClick={handleExportDetailsClick}>
                             <div className="flex justify-between items-start">
                                 <div>
                                     <div className="text-gray-400 text-[10px] font-bold uppercase tracking-wider mb-1">Exported Energy</div>
                                     <div className="text-2xl font-bold text-white">1,240 <span className="text-sm font-normal text-gray-500">kWh</span></div>
                                 </div>
                                 <div className="p-2 bg-suncube-cyan/10 rounded-lg text-suncube-cyan group-hover:bg-suncube-cyan/20 transition-colors">
                                     <Zap size={20} />
                                 </div>
                             </div>
                             <div className="mt-2 flex items-center justify-between text-xs">
                                 <span className="text-gray-500 font-mono">Tx: 0x8f...2a</span>
                                 <span className="text-suncube-cyan opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">Details <ChevronRight size={12}/></span>
                             </div>
                        </div>
                    </div>
                </div>

                {/* 3. ROW C: MAIN OPERATIONAL GRID */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-enter">
                    
                    {/* --- LEFT COLUMN (2/3) --- */}
                    <div className="lg:col-span-2 space-y-6">
                        
                        {/* Generation Graph */}
                        <div className="glass-panel rounded-2xl p-6 border border-white/10 h-[380px] flex flex-col">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-white font-semibold flex items-center gap-2">
                                    <Activity size={18} className="text-suncube-orange" /> Generation Analytics
                                </h3>
                                <div className="flex gap-2 bg-black/40 p-1 rounded-lg">
                                    {['24h', '7d', '30d'].map(r => (
                                        <button 
                                            key={r} 
                                            onClick={() => handleRangeChange(r as any)}
                                            className={`px-3 py-1 text-xs rounded-md transition-all duration-300 ${
                                                graphRange === r 
                                                ? 'bg-suncube-orange text-black font-bold' 
                                                : 'text-gray-400 hover:text-white hover:bg-white/10'
                                            }`}
                                        >
                                            {r}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="w-full flex-1">
                                <ResponsiveContainer>
                                    <LineChart data={chartData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                                        <XAxis dataKey="time" stroke="#666" fontSize={11} tickLine={false} axisLine={false} />
                                        <YAxis stroke="#666" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(val) => `${val.toFixed(0)}kW`} />
                                        <Tooltip 
                                            contentStyle={{ backgroundColor: '#15161A', borderColor: '#333', borderRadius: '8px' }}
                                            itemStyle={{ color: '#fff' }}
                                            labelStyle={{ color: '#aaa' }}
                                        />
                                        <Line 
                                            type="monotone" 
                                            dataKey="power" 
                                            stroke="#FF7A18" 
                                            strokeWidth={3} 
                                            dot={false}
                                            activeDot={{ r: 6, fill: '#FF7A18', stroke: '#fff', strokeWidth: 2 }}
                                            animationDuration={1500}
                                            animationEasing="ease-out"
                                        />
                                        <Line 
                                            type="monotone" 
                                            dataKey="expected" 
                                            stroke="#00F0FF" 
                                            strokeWidth={1} 
                                            strokeDasharray="5 5" 
                                            dot={false} 
                                            opacity={0.5}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Cluster Map */}
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <h3 className="text-gray-400 text-sm font-medium uppercase tracking-wider ml-1">Grid Cluster Map</h3>
                            </div>
                            <MapCluster 
                                onMarkerClick={(id) => setSelectedSiteId(id)} 
                                onRegionalViewClick={handleRegionalViewClick}
                            />
                        </div>

                        {/* Device Health - Deep View */}
                        <div className="glass-panel rounded-2xl p-6 border border-white/10">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-white font-semibold flex items-center gap-2">
                                    <Monitor size={16} /> Device Health
                                </h3>
                                <div className="text-xs text-gray-500">Live Telemetry</div>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                                {devices.map((device) => (
                                    <div 
                                        key={device.id} 
                                        onClick={() => handleDeviceClick(device.id)}
                                        className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all cursor-pointer hover:scale-105 ${
                                        device.status === 'OK' ? 'bg-green-500/5 border-green-500/20 hover:border-green-500/50' :
                                        device.status === 'Warning' ? 'bg-amber-500/5 border-amber-500/20 hover:border-amber-500/50' :
                                        'bg-red-500/5 border-red-500/30 animate-pulse hover:border-red-500'
                                    }`}>
                                        <div className={`p-2 rounded-full ${
                                            device.status === 'OK' ? 'bg-green-500/10 text-green-500' :
                                            device.status === 'Warning' ? 'bg-amber-500/10 text-amber-500' :
                                            'bg-red-500/10 text-red-500'
                                        }`}>
                                            {device.type === 'Inverter' ? <Zap size={16} /> : 
                                             device.type === 'Battery' ? <Battery size={16} /> :
                                             <Layers size={16} />}
                                        </div>
                                        <div className="text-xs font-medium text-gray-300">{device.name}</div>
                                        <div className={`text-[10px] px-2 py-0.5 rounded-full border ${
                                            device.status === 'OK' ? 'border-green-500/30 text-green-400' :
                                            device.status === 'Warning' ? 'border-amber-500/30 text-amber-400' :
                                            'border-red-500/30 text-red-400'
                                        }`}>{device.status}</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                    </div>

                    {/* --- RIGHT COLUMN (1/3) --- */}
                    <div className="space-y-6">
                        
                        {/* Weather + AI Impact */}
                        <div className="glass-panel rounded-2xl p-6 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-8 opacity-20 text-yellow-500">
                                <Sun size={80} />
                            </div>
                            <h3 className="text-gray-400 text-sm font-medium mb-4">Site Conditions</h3>
                            <div className="flex items-center gap-4 mb-6">
                                <div className="text-4xl font-bold text-white">28°C</div>
                                <div className="text-sm text-yellow-500 font-medium">Sunny & Clear</div>
                            </div>
                            
                            {/* Forecast Sparkline */}
                            <div className="mb-4">
                                <div className="text-xs text-gray-500 mb-1 flex justify-between">
                                    <span>AI Generation Forecast</span>
                                    <span className="text-suncube-cyan">High Confidence</span>
                                </div>
                                <div className="h-16 w-full">
                                    <ResponsiveContainer>
                                        <AreaChart data={[{v:2},{v:3},{v:4.2},{v:4.5},{v:3.8},{v:2},{v:0.5}]}>
                                            <defs>
                                                <linearGradient id="weatherGrad" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#00F0FF" stopOpacity={0.4}/>
                                                    <stop offset="95%" stopColor="#00F0FF" stopOpacity={0}/>
                                                </linearGradient>
                                            </defs>
                                            <Area type="monotone" dataKey="v" stroke="#00F0FF" fill="url(#weatherGrad)" strokeWidth={2} />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-2 border-t border-white/10 pt-4">
                                {[
                                    { d: 'Today', i: <Sun size={14} className="text-yellow-500"/>, t: '28°' },
                                    { d: 'Tue', i: <Sun size={14} className="text-yellow-500"/>, t: '29°' },
                                    { d: 'Wed', i: <Wind size={14} className="text-gray-400"/>, t: '24°' },
                                ].map((day, i) => (
                                    <div key={i} className="text-center">
                                        <div className="text-xs text-gray-500 mb-1">{day.d}</div>
                                        <div className="flex justify-center mb-1">{day.i}</div>
                                        <div className="text-sm text-white font-bold">{day.t}</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Predictive Maintenance / Alerts */}
                        <div className="glass-panel rounded-2xl p-6 border border-white/10">
                             <div className="flex justify-between items-center mb-4">
                                <h3 className="text-white font-semibold text-sm flex items-center gap-2">
                                    <PenTool size={16} /> Maintenance Alerts
                                </h3>
                                <div className="text-xs px-2 py-0.5 rounded bg-amber-500/20 text-amber-400">Action Required</div>
                             </div>
                             <div className="space-y-4">
                                 {maintenance.map(m => (
                                     <div key={m.id} className={`relative pl-4 border-l-2 transition-all duration-300 group ${m.acknowledged ? 'border-green-500/30 opacity-60' : 'border-amber-500/30'}`}>
                                         <div className="flex justify-between">
                                             <div className="text-xs text-gray-400 mb-0.5">Predicted Failure: {m.daysToFailure} days</div>
                                             {m.acknowledged && <Check size={12} className="text-green-500"/>}
                                         </div>
                                         <div className={`text-sm font-medium ${m.acknowledged ? 'text-gray-400 line-through' : 'text-white'}`}>{m.component}</div>
                                         {!m.acknowledged && (
                                            <>
                                            <div className="w-full bg-white/10 h-1.5 rounded-full mt-2 overflow-hidden mb-2">
                                                <div className="h-full bg-amber-500" style={{ width: `${m.probability}%` }}></div>
                                            </div>
                                            <div className="flex gap-2 mt-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                                                <button 
                                                    onClick={() => handleAcknowledgeAlert(m.id)}
                                                    className="px-2 py-1 bg-white/10 rounded text-[10px] hover:bg-white hover:text-black transition-colors"
                                                >
                                                    Acknowledge
                                                </button>
                                                <button 
                                                    onClick={() => handleOpenDiagnostic(m.id)}
                                                    className="px-2 py-1 bg-suncube-orange/20 text-suncube-orange border border-suncube-orange/30 rounded text-[10px] hover:bg-suncube-orange hover:text-black transition-colors"
                                                >
                                                    Open Diagnostic
                                                </button>
                                            </div>
                                            </>
                                         )}
                                     </div>
                                 ))}
                                 <button 
                                    onClick={() => setTicketModalOpen(true)}
                                    className="w-full py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs text-gray-300 transition-colors"
                                 >
                                     Schedule Technician
                                 </button>
                             </div>
                        </div>

                        {/* Ticket Summary */}
                        <div className="glass-panel rounded-2xl p-6 border border-white/10">
                             <div className="flex justify-between items-center mb-4">
                                <h3 className="text-white font-semibold text-sm">Open Tickets</h3>
                                <span className="bg-white/10 text-white text-xs px-2 py-0.5 rounded-full">{tickets.length}</span>
                             </div>
                             <div className="space-y-3">
                                 {tickets.slice(0, 3).map(t => (
                                     <div 
                                        key={t.id} 
                                        onClick={() => setSelectedTicket(t)}
                                        className="flex justify-between items-center p-2 bg-white/5 rounded-lg border border-white/5 hover:border-white/20 hover:bg-white/10 cursor-pointer transition-colors"
                                     >
                                         <div>
                                             <div className="text-xs font-medium text-white">{t.title}</div>
                                             <div className="text-[10px] text-gray-500">{t.assignedTo}</div>
                                         </div>
                                         <div className={`w-2 h-2 rounded-full ${t.priority === 'Critical' ? 'bg-red-500' : 'bg-green-500'}`}></div>
                                     </div>
                                 ))}
                             </div>
                             <button 
                                onClick={() => setTicketDrawerOpen(true)}
                                className="w-full mt-4 text-xs text-suncube-orange hover:text-white transition-colors flex items-center justify-center gap-1"
                             >
                                 View All Tickets <ArrowRight size={12} />
                             </button>
                        </div>

                        {/* Sustainability Panel Expanded */}
                        <div className="glass-panel rounded-2xl p-6 border-t-4 border-t-green-500">
                             <h3 className="text-white font-semibold flex items-center gap-2 mb-4">
                                <Leaf size={18} className="text-green-500" /> Eco Impact
                             </h3>
                             <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-400">Lifetime CO₂</span>
                                    <span className="text-lg font-bold text-white"><CountUp end={3450} suffix=" kg" /></span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-400">Yearly Savings</span>
                                    <span className="text-sm font-bold text-green-400">+1,240 kg</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-400">Home Power Eqv.</span>
                                    <span className="text-sm font-bold text-white">4.2 Months</span>
                                </div>
                                <div className="h-20 mt-2">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={[{n:'21',v:40},{n:'22',v:80},{n:'23',v:120},{n:'24',v:95}]}>
                                            <Bar dataKey="v" fill="#22c55e" radius={[2,2,0,0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                             </div>
                        </div>

                        {/* Inline AI Preview */}
                        <div className="glass-panel rounded-2xl p-4 border border-suncube-orange/20 bg-suncube-orange/5">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="p-1 bg-suncube-orange rounded text-black"><BrainCircuit size={14} /></div>
                                <span className="text-xs font-bold text-suncube-orange">AI Assistant</span>
                            </div>
                            <div className="text-sm text-white font-medium mb-3">"Why did generation drop at 2PM?"</div>
                            <div className="flex gap-2">
                                <input type="text" placeholder="Ask Suncube AI..." className="w-full bg-black/40 border border-white/10 rounded px-2 py-1 text-xs text-white" disabled />
                                <button 
                                    onClick={() => setAIChatOpen(true)}
                                    className="p-1.5 bg-suncube-orange text-black rounded hover:bg-white transition-colors"
                                >
                                    <ArrowRight size={14} />
                                </button>
                            </div>
                        </div>

                    </div>
                </div>
            </>
        )}

        {/* PAYMENTS TAB - REPLACED WITH FULL COMPONENT */}
        {activeTab === 'payments' && (
             <PaymentsScreen onTicketCreated={handleTicketCreated} />
        )}

        {/* SETTINGS TAB */}
        {activeTab === 'settings' && (
            <div className="max-w-4xl mx-auto animate-enter pb-10">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-white">Settings & Preferences</h2>
                    <span className="text-xs text-gray-500 font-mono">ID: {currentUser?.id}</span>
                </div>
                
                {settingsLoading || !preferences ? (
                    <div className="flex justify-center p-12">
                        <RefreshCw className="animate-spin text-suncube-orange" size={32}/>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        
                        {/* 1. NOTIFICATIONS CARD */}
                        <SettingsCard title="Notifications & Alerts" icon={<Bell size={18} className="text-suncube-orange"/>} id="PrefCard_Notifications">
                            <div className="text-xs font-bold text-gray-500 uppercase mt-2 mb-2">System</div>
                            <ToggleSwitch 
                                label="Critical Alerts" 
                                checked={preferences.notifications.criticalAlerts} 
                                onChange={(v) => handlePrefChange('notifications.criticalAlerts', v)}
                                testId="toggle-criticalAlerts"
                            />
                            <ToggleSwitch 
                                label="Maintenance Alerts" 
                                checked={preferences.notifications.maintenanceAlerts} 
                                onChange={(v) => handlePrefChange('notifications.maintenanceAlerts', v)}
                                testId="toggle-maintenanceAlerts"
                            />
                            
                            <div className="text-xs font-bold text-gray-500 uppercase mt-4 mb-2">Reports</div>
                            <ToggleSwitch label="Daily Report" checked={preferences.notifications.dailyReport} onChange={(v) => handlePrefChange('notifications.dailyReport', v)} testId="toggle-dailyReport" />
                            <ToggleSwitch label="Weekly Summary" checked={preferences.notifications.weeklySummary} onChange={(v) => handlePrefChange('notifications.weeklySummary', v)} testId="toggle-weeklySummary" />
                            <ToggleSwitch label="Monthly Statement" checked={preferences.notifications.monthlyStatement} onChange={(v) => handlePrefChange('notifications.monthlyStatement', v)} testId="toggle-monthlyStatement" />
                            
                            <div className="text-xs font-bold text-gray-500 uppercase mt-4 mb-2">Billing</div>
                            <ToggleSwitch label="Invoice Issued" checked={preferences.notifications.billing.invoiceIssued} onChange={(v) => handlePrefChange('notifications.billing.invoiceIssued', v)} testId="toggle-invoiceIssued" />
                            <ToggleSwitch label="Payment Credited" checked={preferences.notifications.billing.paymentCredited} onChange={(v) => handlePrefChange('notifications.billing.paymentCredited', v)} testId="toggle-paymentCredited" />
                            <ToggleSwitch label="Dispute Updates" checked={preferences.notifications.billing.disputeUpdates} onChange={(v) => handlePrefChange('notifications.billing.disputeUpdates', v)} testId="toggle-disputeUpdates" />

                            <div className="text-xs font-bold text-gray-500 uppercase mt-4 mb-2">Smart AI</div>
                            <ToggleSwitch label="AI Forecasts" checked={preferences.notifications.ai.forecast} onChange={(v) => handlePrefChange('notifications.ai.forecast', v)} testId="toggle-aiForecast" />
                            <ToggleSwitch label="Tariff Alerts" checked={preferences.notifications.ai.tariffChange} onChange={(v) => handlePrefChange('notifications.ai.tariffChange', v)} testId="toggle-tariffChange" />
                        </SettingsCard>

                        {/* 2. ACCOUNT & SECURITY CARD */}
                        <div className="space-y-6">
                            <SettingsCard title="Account & Security" icon={<Shield size={18} className="text-blue-500"/>} id="PrefCard_AccountSecurity">
                                <div className="space-y-4 pt-2">
                                    <div className="flex items-center gap-4 p-3 bg-white/5 rounded-xl border border-white/5">
                                        <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 font-bold">
                                            {currentUser?.name.charAt(0)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="text-sm font-bold text-white truncate">{currentUser?.name}</div>
                                            <div className="text-xs text-gray-500 truncate">{currentUser?.email}</div>
                                        </div>
                                        <button onClick={() => setIsProfileEditOpen(true)} className="p-1.5 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors" data-testid="btn-edit-profile">
                                            <PenTool size={14}/>
                                        </button>
                                    </div>
                                    
                                    <button 
                                        onClick={() => setIsChangePassOpen(true)}
                                        className="w-full py-2 bg-white/5 hover:bg-white/10 rounded-lg border border-white/5 text-sm text-gray-300 transition-colors flex items-center justify-center gap-2"
                                        data-testid="btn-change-password"
                                    >
                                        <Lock size={14}/> Change Password
                                    </button>

                                    <div className="flex items-center justify-between py-2 border-t border-white/10 mt-2">
                                        <span className="text-sm text-gray-300">Two-Factor Auth</span>
                                        <button 
                                            onClick={handle2FA}
                                            className="text-xs font-bold text-suncube-orange hover:text-white transition-colors"
                                            data-testid="btn-manage-2fa"
                                        >
                                            {is2FAOpen ? 'Disable' : 'Enable'} {/* Mock state using the modal boolean for now */}
                                        </button>
                                    </div>

                                    <div className="pt-2">
                                        <div className="text-xs font-bold text-gray-500 uppercase mb-3">Active Sessions</div>
                                        <div className="space-y-2">
                                            {sessions.map(session => (
                                                <div key={session.id} className="flex justify-between items-center text-xs p-2 bg-black/20 rounded border border-white/5">
                                                    <div className="flex items-center gap-2">
                                                        {session.device.includes('iPhone') ? <Smartphone size={12}/> : <Laptop size={12}/>}
                                                        <span className={session.current ? 'text-green-400 font-bold' : 'text-gray-400'}>
                                                            {session.device} {session.current && '(Current)'}
                                                        </span>
                                                    </div>
                                                    {!session.current && (
                                                        <button 
                                                            onClick={() => handleSessionLogout(session.id)}
                                                            className="text-red-400 hover:text-red-300"
                                                            data-testid={`btn-signout-${session.id}`}
                                                        >
                                                            Sign out
                                                        </button>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <button 
                                        onClick={() => { if(confirm("Are you sure? This action cannot be undone.")) requestAccountDeletion("User Request"); }}
                                        className="w-full text-xs text-red-500 hover:text-red-400 mt-2 text-center"
                                        data-testid="btn-request-delete"
                                    >
                                        Request Account Deletion
                                    </button>
                                </div>
                            </SettingsCard>
                        </div>

                        {/* 3. APP BEHAVIOR CARD */}
                        <SettingsCard title="App Preferences" icon={<SettingsIcon size={18} className="text-purple-500"/>} id="PrefCard_AppPrefs">
                            
                            <div className="text-xs font-bold text-gray-500 uppercase mt-2 mb-2">Data & Charts</div>
                            <ToggleSwitch label="Auto-Refresh" checked={preferences.charts.autoRefresh} onChange={(v) => handlePrefChange('charts.autoRefresh', v)} testId="toggle-autoRefresh" />
                            <div className="flex items-center justify-between py-2 border-b border-white/5">
                                <span className="text-sm text-gray-300">Animation Level</span>
                                <select 
                                    value={preferences.charts.animationLevel}
                                    onChange={(e) => handlePrefChange('charts.animationLevel', e.target.value)}
                                    className="bg-black/40 border border-white/10 rounded px-2 py-1 text-xs text-white outline-none focus:border-suncube-orange"
                                >
                                    <option value="none">None</option>
                                    <option value="minimal">Minimal</option>
                                    <option value="full">Full</option>
                                </select>
                            </div>
                            <div className="flex items-center justify-between py-2 border-b border-white/5">
                                <span className="text-sm text-gray-300">Preferred Units</span>
                                <div className="flex bg-black/40 rounded p-0.5 border border-white/10">
                                    {['kWh', 'MWh'].map(u => (
                                        <button 
                                            key={u}
                                            onClick={() => handlePrefChange('charts.preferredUnits', u)}
                                            className={`px-2 py-0.5 text-[10px] rounded ${preferences.charts.preferredUnits === u ? 'bg-white/20 text-white font-bold' : 'text-gray-500'}`}
                                        >
                                            {u}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="text-xs font-bold text-gray-500 uppercase mt-4 mb-2">Billing Logic</div>
                            <ToggleSwitch label="Auto-Settle Small Payouts" checked={preferences.billing.autoSettleSmallPayouts} onChange={(v) => handlePrefChange('billing.autoSettleSmallPayouts', v)} testId="toggle-autoSettleSmallPayouts" />
                            <ToggleSwitch label="Consolidated Monthly Inv." checked={preferences.billing.consolidatedMonthlyInvoice} onChange={(v) => handlePrefChange('billing.consolidatedMonthlyInvoice', v)} testId="toggle-consolidatedMonthlyInvoice" />
                        </SettingsCard>

                    </div>
                )}
            </div>
        )}

      </main>

      {/* --- MODALS --- */}
      {/* <AIChatModal isOpen={isAIChatOpen} onClose={() => setAIChatOpen(false)} /> */}
      <CreateTicketModal 
        isOpen={isTicketModalOpen} 
        onClose={() => setTicketModalOpen(false)} 
        onSuccess={(t) => {
             setTickets([t, ...tickets]);
             showToast("Ticket Created Successfully");
        }} 
      />
      <TicketDrawer 
        isOpen={isTicketDrawerOpen} 
        onClose={() => setTicketDrawerOpen(false)} 
        onTicketClick={(t) => setSelectedTicket(t)}
      />
      <TicketDetailDrawer
        ticket={selectedTicket}
        onClose={() => setSelectedTicket(null)}
      />
      <TransactionModal 
        isOpen={!!selectedTx} 
        onClose={() => setSelectedTx(null)} 
        tx={selectedTx} 
        onTicketCreated={handleTicketCreated}
      />
      <SiteDetailDrawer 
        siteId={selectedSiteId} 
        onClose={() => setSelectedSiteId(null)} 
      />
      <DiagnosticDrawer
        isOpen={isDiagnosticDrawerOpen}
        targetId={diagnosticTarget}
        onClose={() => setDiagnosticDrawerOpen(false)}
      />
      <DeviceDetailModal
        isOpen={isDeviceModalOpen}
        deviceId={selectedDeviceId}
        onClose={() => setDeviceModalOpen(false)}
      />
      
      {/* NEW METRIC DETAILS MODAL */}
      <MetricDetailsModal 
        isOpen={!!selectedMetric} 
        metricKey={selectedMetric} 
        onClose={() => setSelectedMetric(null)} 
      />

    </div>
  );
};