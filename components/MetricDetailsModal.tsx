
import React, { useRef, useEffect, useState } from 'react';
import gsap from 'gsap';
import { X, Download, RefreshCw, Zap, TrendingUp, DollarSign, Activity, AlertTriangle, Share2, FileText, Clock, ExternalLink, Calendar, CheckCircle } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, LineChart, Line } from 'recharts';
import { MetricDetails, MetricKey } from '../types';
import { fetchMetricDetails } from '../services/mockApi';

interface MetricDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    metricKey: MetricKey | null;
}

export const MetricDetailsModal: React.FC<MetricDetailsModalProps> = ({ isOpen, onClose, metricKey }) => {
    const overlayRef = useRef<HTMLDivElement>(null);
    const modalRef = useRef<HTMLDivElement>(null);
    const [data, setData] = useState<MetricDetails | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen && metricKey) {
            setLoading(true);
            setError(null);
            setData(null);

            fetchMetricDetails(metricKey)
                .then(res => {
                    setData(res);
                    setLoading(false);
                })
                .catch(err => {
                    setError("Failed to fetch metric details.");
                    setLoading(false);
                });

            // Animation Entry
            gsap.to(overlayRef.current, { opacity: 1, duration: 0.3, display: 'flex' });
            gsap.fromTo(modalRef.current, 
                { scale: 0.95, opacity: 0, y: 20 },
                { scale: 1, opacity: 1, y: 0, duration: 0.4, ease: 'back.out(1.1)' }
            );
        } else {
            // Animation Exit
            gsap.to(modalRef.current, { scale: 0.95, opacity: 0, duration: 0.2 });
            gsap.to(overlayRef.current, { opacity: 0, duration: 0.2, onComplete: () => {
                if(overlayRef.current) overlayRef.current.style.display = 'none';
            }});
        }
    }, [isOpen, metricKey]);

    const handleExport = () => {
        alert(`Exporting data for ${metricKey?.toUpperCase()}...`);
    };

    if (!metricKey) return null;

    const renderContent = () => {
        if (loading) {
            return (
                <div className="flex flex-col items-center justify-center h-64">
                    <RefreshCw className="w-10 h-10 text-suncube-orange animate-spin mb-4" />
                    <p className="text-gray-400 animate-pulse">Analyzing telemetry...</p>
                </div>
            );
        }

        if (error) {
            return (
                <div className="flex flex-col items-center justify-center h-64 text-red-400">
                    <AlertTriangle className="w-10 h-10 mb-2" />
                    <p>{error}</p>
                </div>
            );
        }

        if (!data) return null;

        switch (data.type) {
            case 'livePower':
                return (
                    <div className="space-y-6">
                        {/* Top Line */}
                        <div className="flex items-baseline gap-4">
                            <div className="text-5xl font-bold text-white tracking-tighter">{data.currentKW.toFixed(1)} <span className="text-lg text-gray-500 font-normal">kW</span></div>
                            <div className={`text-sm font-medium ${data.trend1m >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                {data.trend1m > 0 ? '+' : ''}{data.trend1m}% (1m)
                            </div>
                        </div>

                        {/* Chart */}
                        <div className="h-48 bg-white/5 rounded-xl p-4 border border-white/5">
                            <div className="text-xs text-gray-500 mb-2">Live Output (Last 15m)</div>
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={data.chartData}>
                                    <defs>
                                        <linearGradient id="liveGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#FF7A18" stopOpacity={0.8}/>
                                            <stop offset="95%" stopColor="#FF7A18" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <Tooltip 
                                        contentStyle={{ backgroundColor: '#15161A', borderColor: '#333', color: '#fff' }}
                                        itemStyle={{ color: '#FF7A18' }}
                                    />
                                    <Area type="monotone" dataKey="kw" stroke="#FF7A18" fill="url(#liveGrad)" strokeWidth={2} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Details Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                                <h4 className="text-xs text-gray-400 uppercase font-bold mb-3">Device Contribution</h4>
                                <div className="space-y-3">
                                    {data.devices.map((d, i) => (
                                        <div key={i}>
                                            <div className="flex justify-between text-sm mb-1">
                                                <span className="text-white">{d.name}</span>
                                                <span className="text-gray-400">{d.kw} kW ({d.percent}%)</span>
                                            </div>
                                            <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                                                <div className="h-full bg-suncube-orange" style={{ width: `${d.percent}%` }}></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="bg-white/5 rounded-xl p-4 border border-white/5 flex flex-col justify-between">
                                <div>
                                    <h4 className="text-xs text-gray-400 uppercase font-bold mb-3">Active Alerts</h4>
                                    {data.alerts.length > 0 ? (
                                        data.alerts.map((a, i) => <div key={i} className="text-xs text-red-400 bg-red-500/10 p-2 rounded mb-1">{a}</div>)
                                    ) : (
                                        <div className="text-sm text-green-500 flex items-center gap-2"><CheckCircle size={14}/> No active faults</div>
                                    )}
                                </div>
                                <div className="mt-4 pt-4 border-t border-white/10">
                                    <div className="text-xs text-suncube-cyan flex items-start gap-2">
                                        <Zap size={14} className="mt-0.5 shrink-0" />
                                        <div>
                                            <div className="font-bold">AI Insight ({data.insight.confidence}%)</div>
                                            <p className="opacity-80 leading-snug">{data.insight.text}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                );

            case 'todayEnergy':
                return (
                    <div className="space-y-6">
                         <div className="flex items-baseline gap-4">
                            <div className="text-5xl font-bold text-white tracking-tighter">{data.totalKwh} <span className="text-lg text-gray-500 font-normal">kWh</span></div>
                            <div className="text-sm font-medium text-green-400">+{data.deltaYesterday} vs Yesterday</div>
                        </div>

                        <div className="h-48 bg-white/5 rounded-xl p-4 border border-white/5 relative">
                             <div className="flex justify-between items-center mb-2">
                                 <div className="text-xs text-gray-500">Hourly Production</div>
                                 <div className="text-xs px-2 py-0.5 rounded bg-yellow-500/20 text-yellow-400 border border-yellow-500/20">Peak Window: {data.peakWindow.start} - {data.peakWindow.end}</div>
                             </div>
                             <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={data.chartData}>
                                    <Tooltip cursor={{fill: '#ffffff10'}} contentStyle={{ backgroundColor: '#15161A', borderColor: '#333', color: '#fff' }} />
                                    <Bar dataKey="kwh" fill="#00F0FF" radius={[2,2,0,0]} />
                                </BarChart>
                             </ResponsiveContainer>
                        </div>

                        <div className="p-4 bg-suncube-orange/5 rounded-xl border border-suncube-orange/20 flex items-start gap-3">
                             <div className="p-2 bg-suncube-orange/20 rounded-full text-suncube-orange"><Zap size={18}/></div>
                             <div>
                                 <h4 className="text-sm font-bold text-white mb-1">Production Insight</h4>
                                 <p className="text-sm text-gray-300">{data.insight.text}</p>
                                 <div className="mt-2 text-xs text-suncube-orange opacity-70">Confidence Score: {data.insight.confidence}%</div>
                             </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            {data.topContributors.map((c, i) => (
                                <div key={i} className="flex justify-between p-3 bg-white/5 rounded-lg border border-white/5">
                                    <span className="text-sm text-gray-300">{c.name}</span>
                                    <span className="text-sm font-bold text-white">{c.kwh} kWh</span>
                                </div>
                            ))}
                        </div>
                    </div>
                );

            case 'monthlyEarnings':
                return (
                    <div className="space-y-6">
                        <div className="flex justify-between items-end">
                            <div>
                                <div className="text-sm text-gray-400 mb-1">Total Earnings</div>
                                <div className="text-5xl font-bold text-white tracking-tighter">${data.earnings.toFixed(2)}</div>
                            </div>
                            <div className="text-right">
                                <div className="text-sm text-gray-400 mb-1">Pending Payout</div>
                                <div className="text-xl font-bold text-amber-400">${data.pending.toFixed(2)}</div>
                            </div>
                        </div>

                        <div className="h-48 bg-white/5 rounded-xl p-4 border border-white/5">
                            <div className="text-xs text-gray-500 mb-2">Daily Revenue</div>
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={data.chartData}>
                                    <Tooltip contentStyle={{ backgroundColor: '#15161A', borderColor: '#333', color: '#fff' }} />
                                    <Line type="monotone" dataKey="amount" stroke="#22c55e" strokeWidth={2} dot={false} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                                <h4 className="text-xs text-gray-500 uppercase font-bold mb-3">Tariff Structure</h4>
                                {data.tariffs.map((t, i) => (
                                    <div key={i} className="flex justify-between text-sm mb-2">
                                        <span className="text-gray-300">{t.period}</span>
                                        <span className="font-mono text-green-400">${t.rate.toFixed(2)}/kWh</span>
                                    </div>
                                ))}
                            </div>
                            <div className="p-4 bg-white/5 rounded-xl border border-white/5 flex flex-col justify-center text-center">
                                <h4 className="text-xs text-gray-500 uppercase font-bold mb-1">EOM Forecast</h4>
                                <div className="text-2xl font-bold text-white">${data.forecast.toFixed(2)}</div>
                                <div className="text-xs text-suncube-cyan mt-2">{data.insight.text}</div>
                            </div>
                        </div>
                    </div>
                );

            case 'uptime':
                return (
                    <div className="space-y-6">
                        <div className="flex items-center gap-4">
                            <div className="relative w-20 h-20 flex items-center justify-center">
                                <svg className="w-full h-full transform -rotate-90">
                                    <circle cx="40" cy="40" r="36" stroke="#333" strokeWidth="6" fill="transparent" />
                                    <circle cx="40" cy="40" r="36" stroke={data.uptimePercent > 99 ? "#22c55e" : "#eab308"} strokeWidth="6" fill="transparent" strokeDasharray={`${data.uptimePercent * 2.26} 226`} />
                                </svg>
                                <span className="absolute text-sm font-bold text-white">{data.uptimePercent}%</span>
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-white">System Availability</h3>
                                <p className="text-sm text-gray-500">Last Checked: {data.lastChecked}</p>
                            </div>
                            <div className="ml-auto text-right">
                                <div className="text-2xl font-bold text-white">{data.healthScore}/100</div>
                                <div className="text-xs text-gray-500">Health Score</div>
                            </div>
                        </div>

                        <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                            <h4 className="text-xs text-gray-500 uppercase font-bold mb-3">Downtime Events (30 Days)</h4>
                            {data.downtimeEvents.length > 0 ? (
                                <div className="space-y-3">
                                    {data.downtimeEvents.map((e, i) => (
                                        <div key={i} className="flex items-center justify-between p-3 bg-black/20 rounded border border-white/5">
                                            <div className="flex items-center gap-3">
                                                <AlertTriangle className="text-red-400" size={16} />
                                                <div>
                                                    <div className="text-sm font-bold text-white">{e.cause}</div>
                                                    <div className="text-xs text-gray-500">{e.date} • {e.duration}</div>
                                                </div>
                                            </div>
                                            <div className="text-xs px-2 py-1 bg-white/5 rounded text-gray-300">MTTR: {e.mttr}</div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-4 text-gray-500">No recent downtime events.</div>
                            )}
                        </div>
                        
                        <div className="p-4 bg-blue-500/10 rounded-xl border border-blue-500/20 text-sm">
                            <div className="flex gap-2 items-start">
                                <Activity className="text-blue-400 shrink-0" size={18}/>
                                <div>
                                    <span className="font-bold text-blue-300">Analysis:</span> <span className="text-gray-300">{data.insight.text}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                );
        }
    };

    const getTitle = () => {
        switch(metricKey) {
            case 'livePower': return 'Live Power Analysis';
            case 'todayEnergy': return 'Energy Production Report';
            case 'monthlyEarnings': return 'Financial Performance';
            case 'uptime': return 'System Health & Uptime';
            default: return 'Metric Details';
        }
    }

    const getIcon = () => {
        switch(metricKey) {
            case 'livePower': return <Zap className="text-suncube-orange" />;
            case 'todayEnergy': return <Activity className="text-suncube-cyan" />;
            case 'monthlyEarnings': return <DollarSign className="text-green-500" />;
            case 'uptime': return <RefreshCw className="text-blue-500" />;
            default: return <FileText className="text-gray-400" />;
        }
    }

    return (
        <div ref={overlayRef} className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm hidden items-center justify-center p-4" onClick={onClose}>
            <div 
                ref={modalRef} 
                onClick={e => e.stopPropagation()}
                className="w-full max-w-2xl bg-[#15161A] border border-white/10 rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col max-h-[90vh]"
            >
                {/* Header */}
                <div className="p-5 border-b border-white/10 flex justify-between items-center bg-[#0B0C10]">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-white/5 rounded-lg border border-white/5">{getIcon()}</div>
                        <div>
                            <h2 className="text-lg font-bold text-white">{getTitle()}</h2>
                            <p className="text-xs text-gray-500">Detailed breakdown and analytics</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={handleExport} className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors flex items-center gap-2 text-xs border border-transparent hover:border-white/10">
                            <Download size={16} /> <span className="hidden sm:inline">Export</span>
                        </button>
                        <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors">
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                    {renderContent()}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-white/10 bg-[#0B0C10] flex justify-between items-center text-xs text-gray-500">
                    <div className="flex items-center gap-2">
                        <Clock size={12} /> Last updated: Just now
                    </div>
                    <div className="flex gap-3">
                        {metricKey === 'todayEnergy' && <button className="hover:text-white transition-colors flex items-center gap-1"><FileText size={12}/> Create Invoice</button>}
                        {metricKey === 'uptime' && <button className="hover:text-white transition-colors flex items-center gap-1"><ExternalLink size={12}/> Open Ticket</button>}
                        {metricKey === 'monthlyEarnings' && <button className="hover:text-white transition-colors flex items-center gap-1"><DollarSign size={12}/> Request Payout</button>}
                        <button className="hover:text-white transition-colors flex items-center gap-1"><Share2 size={12}/> Share Report</button>
                    </div>
                </div>
            </div>
        </div>
    );
};
