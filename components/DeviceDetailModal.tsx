
import React, { useRef, useEffect, useState } from 'react';
import gsap from 'gsap';
import { X, Activity, RefreshCw, PenTool, Zap, Battery, Thermometer } from 'lucide-react';
import { DeviceTelemetry } from '../types';
import { fetchDeviceTelemetry } from '../services/mockApi';

interface DeviceDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  deviceId: string | null;
}

export const DeviceDetailModal: React.FC<DeviceDetailModalProps> = ({ isOpen, onClose, deviceId }) => {
    const modalRef = useRef<HTMLDivElement>(null);
    const overlayRef = useRef<HTMLDivElement>(null);
    const [telemetry, setTelemetry] = useState<DeviceTelemetry | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen && deviceId) {
            setLoading(true);
            setTelemetry(null);
            fetchDeviceTelemetry(deviceId).then(data => {
                setTelemetry(data);
                setLoading(false);
            });

            gsap.to(overlayRef.current, { opacity: 1, duration: 0.3, display: 'flex' });
            gsap.fromTo(modalRef.current, { scale: 0.9, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.3, ease: 'back.out(1.2)' });
        } else {
            gsap.to(modalRef.current, { scale: 0.9, opacity: 0, duration: 0.2 });
            gsap.to(overlayRef.current, { opacity: 0, duration: 0.2, display: 'none' });
        }
    }, [isOpen, deviceId]);

    if (!isOpen) return null;

    return (
        <div ref={overlayRef} className="fixed inset-0 z-[70] bg-black/80 backdrop-blur-sm hidden items-center justify-center p-4">
            <div ref={modalRef} className="w-full max-w-2xl bg-[#15161A] border border-white/10 rounded-2xl shadow-2xl overflow-hidden relative">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-suncube-cyan to-transparent"></div>
                
                <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
                    <div>
                        <h2 className="text-xl font-bold text-white">{telemetry?.model || 'Device Detail'}</h2>
                        <div className="text-xs text-gray-500 font-mono mt-1">ID: {deviceId} • FW: {telemetry?.firmwareVersion || '...'}</div>
                    </div>
                    <button onClick={onClose}><X className="text-gray-400 hover:text-white"/></button>
                </div>

                <div className="p-6">
                    {loading ? (
                        <div className="flex justify-center py-10"><RefreshCw className="animate-spin text-suncube-cyan"/></div>
                    ) : telemetry ? (
                        <div className="space-y-6">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="p-3 bg-white/5 rounded-xl text-center border border-white/5">
                                    <Thermometer className="mx-auto text-orange-400 mb-1" size={20}/>
                                    <div className="text-lg font-bold text-white">{telemetry.temperature}°C</div>
                                    <div className="text-[10px] text-gray-500 uppercase">Temp</div>
                                </div>
                                <div className="p-3 bg-white/5 rounded-xl text-center border border-white/5">
                                    <Zap className="mx-auto text-yellow-400 mb-1" size={20}/>
                                    <div className="text-lg font-bold text-white">{telemetry.voltageDC}V</div>
                                    <div className="text-[10px] text-gray-500 uppercase">DC Input</div>
                                </div>
                                <div className="p-3 bg-white/5 rounded-xl text-center border border-white/5">
                                    <Activity className="mx-auto text-blue-400 mb-1" size={20}/>
                                    <div className="text-lg font-bold text-white">{telemetry.voltageAC}V</div>
                                    <div className="text-[10px] text-gray-500 uppercase">AC Output</div>
                                </div>
                                <div className="p-3 bg-white/5 rounded-xl text-center border border-white/5">
                                    <Battery className="mx-auto text-green-400 mb-1" size={20}/>
                                    <div className="text-lg font-bold text-white">{telemetry.efficiency}%</div>
                                    <div className="text-[10px] text-gray-500 uppercase">Efficiency</div>
                                </div>
                            </div>
                            
                            {telemetry.errorCodes.length > 0 && (
                                <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
                                    <h3 className="text-red-400 font-bold text-sm mb-2">Active Faults</h3>
                                    {telemetry.errorCodes.map((code, i) => (
                                        <div key={i} className="text-xs text-red-200">• {code}</div>
                                    ))}
                                </div>
                            )}

                            <div>
                                <h3 className="text-sm font-bold text-gray-400 mb-2">Recent Logs</h3>
                                <div className="bg-black/30 rounded-lg p-3 font-mono text-xs text-green-400 space-y-1 h-24 overflow-y-auto">
                                    {telemetry.recentLogs.map((log, i) => (
                                        <div key={i}>[{new Date().toLocaleTimeString()}] {log}</div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ) : null}
                </div>

                <div className="p-4 bg-[#0B0C10] border-t border-white/10 flex gap-3">
                    <button className="flex-1 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm text-gray-300 transition-colors border border-white/5">Request Firmware Update</button>
                    <button className="flex-1 py-2 bg-suncube-orange/20 hover:bg-suncube-orange/30 rounded-lg text-sm text-suncube-orange font-bold transition-colors border border-suncube-orange/30">Run Remote Diagnostic</button>
                </div>
            </div>
        </div>
    );
};
