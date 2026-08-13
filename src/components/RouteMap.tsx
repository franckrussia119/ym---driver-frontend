import React, { useState } from 'react';
import { Navigation, MapPin, Truck, Maximize2, ZoomIn, ZoomOut, Layers, AlertTriangle } from 'lucide-react';

export interface RouteWaypoint {
  id: number;
  name: string;
  address: string;
  eta: string;
  actualArrival?: string;
  etaOffset: string; // e.g. "+05 min"
  status: 'pending' | 'completed' | 'delayed' | 'failed';
  xPct: number; // 0 to 100 for SVG map rendering
  yPct: number;
}

interface RouteMapProps {
  waypoints: RouteWaypoint[];
  selectedWaypointId: number | null;
  onSelectWaypoint: (id: number) => void;
}

export const RouteMap: React.FC<RouteMapProps> = ({
  waypoints,
  selectedWaypointId,
  onSelectWaypoint,
}) => {
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [mapLayer, setMapLayer] = useState<'streets' | 'satellite'>('streets');

  // Build SVG polyline points connecting waypoints
  const pointsString = waypoints.map((wp) => `${wp.xPct * 4},${wp.yPct * 3}`).join(' ');

  return (
    <div className="relative w-full h-full min-h-[380px] bg-slate-100 rounded-xl overflow-hidden border border-slate-300 shadow-inner flex flex-col">
      {/* Map Header Overlay */}
      <div className="absolute top-3 left-3 z-20 flex items-center gap-2 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm text-xs font-bold text-slate-800">
        <Navigation className="w-4 h-4 text-blue-600" />
        <span>Carte GPS Itinéraire - Hannover / Zone Transit</span>
      </div>

      {/* Map Controls Top Right */}
      <div className="absolute top-3 right-3 z-20 flex flex-col gap-1.5 bg-white/90 backdrop-blur-md p-1 rounded-xl border border-slate-200 shadow-md">
        <button
          type="button"
          onClick={() => setZoomLevel((z) => Math.min(z + 0.25, 2))}
          className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-700 transition-colors cursor-pointer"
          title="Zoom +"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => setZoomLevel((z) => Math.max(z - 0.25, 0.75))}
          className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-700 transition-colors cursor-pointer"
          title="Zoom -"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => setMapLayer(mapLayer === 'streets' ? 'satellite' : 'streets')}
          className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-700 transition-colors cursor-pointer"
          title="Basculer Calque"
        >
          <Layers className="w-4 h-4 text-blue-600" />
        </button>
      </div>

      {/* Interactive Map Area */}
      <div className="relative flex-1 w-full h-full overflow-hidden bg-[#e8ecef] select-none">
        <div
          className="w-full h-full relative transition-transform duration-300"
          style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'center center' }}
        >
          {/* Stylized Map Grid & Roads Background */}
          <svg className="w-full h-full absolute inset-0 pointer-events-none" viewBox="0 0 400 300" preserveAspectRatio="none">
            {/* Background Grid Lines representing streets */}
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#dbe1e6" strokeWidth="1" />
            </pattern>
            <rect width="100%" height="100%" fill="url(#grid)" />

            {/* Simulated River / Park features matching image */}
            <path d="M 280 0 C 270 80, 310 150, 360 300" fill="none" stroke="#a5c9eb" strokeWidth="18" opacity="0.6" />
            <path d="M 0 120 C 100 110, 200 180, 400 160" fill="none" stroke="#d1d8e0" strokeWidth="8" />

            {/* Dashed Blue Route Polyline matching Screenshot 1 & 2 */}
            <polyline
              points={pointsString}
              fill="none"
              stroke="#2563eb"
              strokeWidth="4"
              strokeDasharray="6,4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>

          {/* Render Truck Icon Marker */}
          <div
            className="absolute z-20 transition-all duration-500 transform -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${waypoints[1]?.xPct || 30}%`, top: `${waypoints[1]?.yPct || 40}%` }}
          >
            <div className="bg-emerald-600 text-white p-1.5 rounded-full shadow-lg border-2 border-white animate-bounce flex items-center justify-center">
              <Truck className="w-4 h-4" />
            </div>
          </div>

          {/* Render Waypoint Pins (Home + 1, 2, 3, 4, 5) matching Screenshot 1 & 2 */}
          {waypoints.map((wp) => {
            const isSelected = selectedWaypointId === wp.id;
            return (
              <div
                key={wp.id}
                onClick={() => onSelectWaypoint(wp.id)}
                className={`absolute z-20 cursor-pointer transform -translate-x-1/2 -translate-y-1/2 transition-transform hover:scale-125 ${
                  isSelected ? 'scale-125' : ''
                }`}
                style={{ left: `${wp.xPct}%`, top: `${wp.yPct}%` }}
              >
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black shadow-md border-2 border-white transition-all ${
                    isSelected
                      ? 'bg-blue-700 text-white ring-4 ring-blue-300'
                      : wp.status === 'delayed'
                      ? 'bg-amber-500 text-white'
                      : wp.status === 'failed'
                      ? 'bg-rose-600 text-white'
                      : 'bg-blue-600 text-white'
                  }`}
                >
                  {wp.id}
                </div>
                {/* Tooltip Label */}
                <div className="absolute top-7 left-1/2 -translate-x-1/2 bg-slate-900/90 text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow-md whitespace-nowrap pointer-events-none">
                  {wp.name}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Map Legend Footer */}
      <div className="bg-white px-3 py-2 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-600">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span> Étape
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span> Camion en route
          </span>
          <span className="flex items-center gap-1 text-blue-600 font-semibold">
            ---- Itinéraire optimisé
          </span>
        </div>
        <span className="text-[10px] text-slate-400">Suivi GPS actif (5s)</span>
      </div>
    </div>
  );
};
