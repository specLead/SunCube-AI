

import React, { useRef, useState, useLayoutEffect, useEffect, useCallback } from 'react';
import gsap from 'gsap';
import { ZoomOut, MapPin, Zap, RefreshCw, AlertTriangle, Map as MapIcon, Globe } from 'lucide-react';
import { ClusterNode } from '../types';
import { fetchClusterMapData } from '../services/mockApi';

interface MapClusterProps {
    onMarkerClick?: (siteId: string) => void;
    onRegionalViewClick?: () => void;
}

export const MapCluster: React.FC<MapClusterProps> = ({ onMarkerClick, onRegionalViewClick }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [viewMode, setViewMode] = useState<'cluster' | 'markers'>('cluster');
  const [activeCluster, setActiveCluster] = useState<string | null>(null);
  
  // Data States
  const [clusters, setClusters] = useState<ClusterNode[]>([]);
  const [status, setStatus] = useState<'idle' | 'loading' | 'error' | 'empty' | 'ready'>('idle');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setStatus('loading');
    setErrorMsg(null);
    try {
        const data = await fetchClusterMapData();
        if (!data || data.length === 0) {
            setStatus('empty');
            setClusters([]);
        } else {
            setClusters(data);
            setStatus('ready');
        }
    } catch (err) {
        console.error("Map Data Error:", err);
        setStatus('error');
        setErrorMsg("Unable to load cluster map — Retry");
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // GSAP Animation Effect
  useLayoutEffect(() => {
    if (status === 'ready' && containerRef.current) {
      const ctx = gsap.context(() => {
        // Entry animation
        gsap.from(".cluster-node", {
          scale: 0, opacity: 0, duration: 0.8, stagger: 0.1, ease: "back.out(1.7)"
        });
      }, containerRef);
      return () => ctx.revert();
    }
  }, [status, clusters]);

  const handleClusterClick = (id: string) => {
    setActiveCluster(id);
    setViewMode('markers');
    
    // Animate transition to markers
    gsap.fromTo(`.marker-group-${id}`, 
        { y: -20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, stagger: 0.05, ease: "power2.out", delay: 0.3 }
    );
  };

  const handleMarkerClick = (e: React.MouseEvent, siteId: string) => {
      e.stopPropagation();
      if (onMarkerClick) onMarkerClick(siteId);
  }

  const resetView = () => {
    setActiveCluster(null);
    setViewMode('cluster');
  };

  const getTransform = () => {
    if (viewMode === 'cluster' || !activeCluster) return 'translate(0, 0) scale(1)';
    const cluster = clusters.find(c => c.id === activeCluster);
    if (!cluster) return 'translate(0, 0) scale(1)';
    
    // Calculate center offset to zoom into the cluster
    const centerX = 50;
    const centerY = 50;
    const scale = 3;
    const offsetX = (centerX - cluster.x) * scale;
    const offsetY = (centerY - cluster.y) * scale;
    
    return `translate(${offsetX}%, ${offsetY}%) scale(${scale})`;
  };

  // --- RENDERING HELPERS ---

  const renderLoading = () => (
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0B0C10] z-20">
          <div className="w-12 h-12 border-4 border-white/10 border-t-suncube-orange rounded-full animate-spin mb-4"></div>
          <div className="text-xs text-gray-500 animate-pulse">Loading grid topology...</div>
      </div>
  );

  const renderError = () => (
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0B0C10] z-20 p-6 text-center">
          <AlertTriangle className="w-10 h-10 text-red-400 mb-3" />
          <p className="text-sm text-white font-medium mb-1">Connection Error</p>
          <p className="text-xs text-gray-500 mb-4">{errorMsg}</p>
          <button 
             onClick={loadData}
             className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-xs font-bold text-white transition-colors flex items-center gap-2"
          >
              <RefreshCw size={14} /> Retry
          </button>
      </div>
  );

  const renderEmpty = () => (
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0B0C10] z-20 p-6 text-center">
          <MapIcon className="w-10 h-10 text-gray-600 mb-3" />
          <p className="text-sm text-white font-medium mb-1">No cluster data available</p>
          <p className="text-xs text-gray-500 mb-4">No sites found for this region or timeframe.</p>
          <div className="flex gap-3">
              <button 
                 onClick={loadData}
                 className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-xs text-white transition-colors flex items-center gap-2"
              >
                  <RefreshCw size={14} /> Refresh
              </button>
              <button 
                 onClick={onRegionalViewClick}
                 className="px-4 py-2 bg-suncube-orange/20 hover:bg-suncube-orange/30 rounded-lg text-xs text-suncube-orange font-bold transition-colors flex items-center gap-2 border border-suncube-orange/30"
              >
                  <Globe size={14} /> Regional View
              </button>
          </div>
      </div>
  );

  return (
    <div className="relative w-full h-[320px] rounded-2xl overflow-hidden glass-panel border border-white/10 group bg-[#0B0C10]">
      {/* Background stylized map grid */}
      <div className="absolute inset-0 opacity-40 pointer-events-none">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
        <svg className="absolute inset-0 w-full h-full opacity-30" stroke="currentColor">
           <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5"/>
           </pattern>
           <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      {/* STATE HANDLERS */}
      {status === 'loading' && renderLoading()}
      {status === 'error' && renderError()}
      {status === 'empty' && renderEmpty()}

      {/* Interactive Layer */}
      <div 
        ref={containerRef}
        className={`absolute inset-0 transition-transform duration-1000 ease-in-out origin-center will-change-transform ${status !== 'ready' ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
        style={{ transform: getTransform() }}
      >
        {clusters.map((cluster) => (
          <div key={cluster.id}>
            {/* The Cluster Itself */}
            <button
              onClick={() => handleClusterClick(cluster.id)}
              className={`cluster-node absolute transform -translate-x-1/2 -translate-y-1/2 flex items-center justify-center rounded-full transition-all duration-300 hover:scale-110 z-10
                ${viewMode === 'markers' && activeCluster === cluster.id ? 'opacity-0 pointer-events-none' : 'opacity-100'}
                ${viewMode === 'markers' && activeCluster !== cluster.id ? 'opacity-20 blur-sm' : ''}
                ${cluster.status === 'warning' ? 'bg-red-500/20 border-red-500 text-red-100' : 'bg-suncube-orange/20 border-suncube-orange text-suncube-orange'}
              `}
              style={{ 
                left: `${cluster.x}%`, 
                top: `${cluster.y}%`, 
                width: `${40 + (cluster.count/10)}px`, 
                height: `${40 + (cluster.count/10)}px`,
                borderWidth: '1px',
                boxShadow: cluster.status === 'warning' ? '0 0 20px rgba(239, 68, 68, 0.3)' : '0 0 20px rgba(255, 122, 24, 0.3)'
              }}
              aria-label={`Cluster ${cluster.id} with ${cluster.count} sites`}
            >
              <span className="text-xs font-bold">{cluster.count}</span>
              {/* Pulse Ring */}
              <div className="absolute inset-0 rounded-full animate-ping opacity-30 bg-current"></div>
            </button>

            {/* Sub-points revealed on zoom */}
            {viewMode === 'markers' && activeCluster === cluster.id && cluster.subPoints?.map((pt) => (
              <div
                key={pt.id}
                onClick={(e) => handleMarkerClick(e, pt.id)}
                className={`marker-group-${cluster.id} absolute w-6 h-6 -ml-3 -mt-3 rounded-full border border-white/80 shadow-lg transform transition-all duration-300 hover:scale-150 hover:z-50 cursor-pointer flex items-center justify-center`}
                style={{
                  left: `${pt.x}%`,
                  top: `${pt.y}%`,
                  backgroundColor: pt.status === 'fault' ? '#EF4444' : pt.status === 'warning' ? '#F59E0B' : '#10B981',
                }}
                title={`Status: ${pt.status}`}
                role="button"
                aria-label={`Site ${pt.id} status ${pt.status}`}
              >
                <div className="absolute -inset-2 bg-current opacity-20 rounded-full animate-pulse"></div>
                <Zap size={10} className="text-black fill-current" />
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Controls Overlay */}
      <div className="absolute bottom-4 right-4 flex flex-col gap-2 z-20">
         {viewMode === 'markers' ? (
            <button 
                onClick={resetView}
                className="p-2 bg-black/60 backdrop-blur text-white rounded-lg hover:bg-suncube-orange hover:text-black transition-colors border border-white/10"
                aria-label="Zoom Out"
            >
                <ZoomOut size={18} />
            </button>
         ) : (
             <button
                onClick={() => {
                    loadData();
                    // If reset view logic is needed alongside refresh
                }}
                className="p-2 bg-black/60 backdrop-blur text-gray-400 rounded-lg hover:text-white hover:bg-white/10 transition-colors border border-white/10"
                title="Refresh Data"
             >
                 <RefreshCw size={16} />
             </button>
         )}
         
         <button 
            onClick={onRegionalViewClick}
            className="px-3 py-1 bg-black/60 backdrop-blur rounded-lg text-xs text-gray-400 border border-white/10 font-mono uppercase tracking-wider hover:text-white hover:bg-white/10 transition-colors flex items-center gap-1"
         >
            {viewMode === 'markers' ? 'Site View' : 'Regional View'}
         </button>
      </div>
    </div>
  );
};
