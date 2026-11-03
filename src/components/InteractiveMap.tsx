import React, { useState } from 'react';
import {
  APIProvider,
  Map as GoogleMap,
  AdvancedMarker,
  Pin,
  InfoWindow,
} from '@vis.gl/react-google-maps';
import { Incident } from '../types';
import { Flame, Layers, MapPin, Eye, AlertTriangle, ShieldCheck, Filter } from 'lucide-react';

interface InteractiveMapProps {
  incidents: Incident[];
  onSelectIncident?: (incident: Incident) => void;
  selectedIncidentId?: string;
  initialCenter?: [number, number];
  initialZoom?: number;
  heightClass?: string;
  showLayerControls?: boolean;
}

const GOOGLE_MAPS_API_KEY =
  import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'AIzaSyCFhN6QFnhnOLq1WCJHrHFjPbNOjywQwRA';

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  incidents,
  onSelectIncident,
  selectedIncidentId,
  initialCenter = [19.18, 72.92], // Centered around Mumbai Metropolitan Region (MMR)
  initialZoom = 10,
  heightClass = 'h-[540px]',
  showLayerControls = true,
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [activeRisk, setActiveRisk] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'markers' | 'heatmap'>('markers');
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);

  // Filter incidents based on category and risk level
  const filteredIncidents = incidents.filter((inc) => {
    if (activeCategory !== 'all' && inc.category !== activeCategory) return false;
    if (activeRisk !== 'all' && inc.riskLevel !== activeRisk) return false;
    return true;
  });

  // Calculate highest risk region & stats
  const regionCounts: Record<string, { total: number; critical: number }> = {};
  filteredIncidents.forEach((i) => {
    if (!regionCounts[i.region]) regionCounts[i.region] = { total: 0, critical: 0 };
    regionCounts[i.region].total += 1;
    if (i.riskLevel === 'Critical') regionCounts[i.region].critical += 1;
  });

  let topHotspot = 'None';
  let maxCrit = -1;
  Object.entries(regionCounts).forEach(([reg, val]) => {
    if (val.critical > maxCrit) {
      maxCrit = val.critical;
      topHotspot = reg;
    }
  });

  const getPinColor = (level: string) => {
    switch (level) {
      case 'Critical':
        return '#dc2626'; // Red-600
      case 'High':
        return '#ea580c'; // Orange-600
      case 'Moderate':
        return '#d97706'; // Amber-600
      default:
        return '#16a34a'; // Green-600
    }
  };

  const getCategoryBadgeColor = (cat: string) => {
    switch (cat) {
      case 'air':
        return 'bg-blue-100 text-blue-800';
      case 'water':
        return 'bg-teal-100 text-teal-800';
      case 'industrial':
        return 'bg-amber-100 text-amber-800';
      case 'waste':
        return 'bg-purple-100 text-purple-800';
      case 'noise':
        return 'bg-rose-100 text-rose-800';
      default:
        return 'bg-slate-100 text-slate-800';
    }
  };

  const handleMarkerClick = (inc: Incident) => {
    setSelectedIncident(inc);
    if (onSelectIncident) {
      onSelectIncident(inc);
    }
  };

  return (
    <div className="relative rounded-3xl overflow-hidden border border-slate-200/90 shadow-xl bg-white">
      {/* Map Header Controls */}
      {showLayerControls && (
        <div className="bg-white/95 backdrop-blur-md border-b border-slate-200 p-3 sm:px-4 flex flex-wrap items-center justify-between gap-3 z-10 relative">
          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 max-w-full">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 mr-1 flex items-center gap-1 shrink-0">
              <Filter className="w-3.5 h-3.5 text-emerald-700" />
              Medium:
            </span>
            {['all', 'air', 'water', 'industrial', 'waste', 'noise'].map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`text-xs px-2.5 py-1 rounded-full font-medium transition-all shrink-0 capitalize ${
                  activeCategory === cat
                    ? 'bg-emerald-800 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat === 'all' ? 'All Channels' : cat}
              </button>
            ))}
          </div>

          {/* View Mode & Risk Level Toggles */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Markers vs Heatmap */}
            <div className="bg-slate-100 p-0.5 rounded-xl flex items-center border border-slate-200 text-xs">
              <button
                onClick={() => setViewMode('markers')}
                className={`px-3 py-1 rounded-lg font-medium flex items-center gap-1.5 transition-all ${
                  viewMode === 'markers'
                    ? 'bg-white text-emerald-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <MapPin className="w-3.5 h-3.5 text-emerald-700" />
                Pins ({filteredIncidents.length})
              </button>
              <button
                onClick={() => setViewMode('heatmap')}
                className={`px-3 py-1 rounded-lg font-medium flex items-center gap-1.5 transition-all ${
                  viewMode === 'heatmap'
                    ? 'bg-white text-emerald-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Flame className="w-3.5 h-3.5 text-orange-600" />
                Heatmap
              </button>
            </div>

            {/* Risk filter */}
            <select
              value={activeRisk}
              onChange={(e) => setActiveRisk(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-1 text-slate-700 focus:outline-emerald-700 font-medium"
            >
              <option value="all">All Severity</option>
              <option value="Critical">Critical Only</option>
              <option value="High">High &amp; Critical</option>
              <option value="Moderate">Moderate</option>
              <option value="Low">Low</option>
            </select>
          </div>
        </div>
      )}

      {/* Google Maps Viewport Container */}
      <div className={`relative w-full ${heightClass} bg-slate-100`}>
        <APIProvider apiKey={GOOGLE_MAPS_API_KEY}>
          <GoogleMap
            mapId="DEMO_MAP_ID"
            defaultCenter={{ lat: initialCenter[0], lng: initialCenter[1] }}
            defaultZoom={initialZoom}
            gestureHandling="greedy"
            disableDefaultUI={false}
            internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
            style={{ width: '100%', height: '100%' }}
          >
            {/* Markers Mode */}
            {viewMode === 'markers' &&
              filteredIncidents.map((inc) => {
                const isSelected = selectedIncident?.id === inc.id || selectedIncidentId === inc.id;
                return (
                  <AdvancedMarker
                    key={inc.id}
                    position={{ lat: inc.latitude, lng: inc.longitude }}
                    onClick={() => handleMarkerClick(inc)}
                    zIndex={isSelected ? 100 : inc.riskLevel === 'Critical' ? 50 : 10}
                  >
                    <Pin
                      background={getPinColor(inc.riskLevel)}
                      borderColor={isSelected ? '#000000' : '#ffffff'}
                      glyphColor="#ffffff"
                      scale={isSelected ? 1.3 : 1.0}
                    />
                  </AdvancedMarker>
                );
              })}

            {/* Heatmap / Intensity Mode */}
            {viewMode === 'heatmap' &&
              filteredIncidents.map((inc) => {
                const isCritical = inc.riskLevel === 'Critical';
                const isHigh = inc.riskLevel === 'High';
                const color = isCritical
                  ? 'rgba(220, 38, 38, 0.85)'
                  : isHigh
                  ? 'rgba(234, 88, 12, 0.75)'
                  : 'rgba(217, 119, 6, 0.65)';
                const ringColor = isCritical
                  ? 'rgba(220, 38, 38, 0.35)'
                  : isHigh
                  ? 'rgba(234, 88, 12, 0.25)'
                  : 'rgba(217, 119, 6, 0.2)';

                return (
                  <AdvancedMarker
                    key={`heat-${inc.id}`}
                    position={{ lat: inc.latitude, lng: inc.longitude }}
                    onClick={() => handleMarkerClick(inc)}
                  >
                    <div className="relative flex items-center justify-center cursor-pointer group">
                      <div
                        className="absolute w-12 h-12 rounded-full animate-ping pointer-events-none"
                        style={{ backgroundColor: ringColor }}
                      />
                      <div
                        className="relative w-7 h-7 rounded-full shadow-lg flex items-center justify-center text-white text-[10px] font-bold border-2 border-white"
                        style={{ backgroundColor: color }}
                      >
                        {inc.riskScore || 50}
                      </div>
                    </div>
                  </AdvancedMarker>
                );
              })}

            {/* Active InfoWindow */}
            {selectedIncident && (
              <InfoWindow
                position={{ lat: selectedIncident.latitude, lng: selectedIncident.longitude }}
                onCloseClick={() => setSelectedIncident(null)}
              >
                <div className="p-2 max-w-xs text-slate-800">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${getCategoryBadgeColor(
                        selectedIncident.category
                      )}`}
                    >
                      {selectedIncident.category}
                    </span>
                    <span
                      className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full text-white"
                      style={{ backgroundColor: getPinColor(selectedIncident.riskLevel) }}
                    >
                      {selectedIncident.riskLevel}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 leading-tight">
                    {selectedIncident.title}
                  </h4>
                  <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                    {selectedIncident.location}
                  </p>
                  <div className="mt-2.5 pt-2 border-t border-slate-200 flex items-center justify-between">
                    <span className="text-[11px] font-mono text-emerald-800 font-bold">
                      {selectedIncident.id}
                    </span>
                    <button
                      onClick={() => onSelectIncident?.(selectedIncident)}
                      className="text-xs font-semibold text-emerald-700 hover:text-emerald-900 underline flex items-center gap-1"
                    >
                      <Eye className="w-3 h-3" />
                      View Dossier
                    </button>
                  </div>
                </div>
              </InfoWindow>
            )}
          </GoogleMap>
        </APIProvider>

        {/* Legend Overlay */}
        <div className="absolute bottom-4 left-4 z-10 bg-white/95 backdrop-blur-md px-3 py-2.5 rounded-2xl shadow-lg border border-slate-200/90 text-xs">
          <p className="font-bold text-slate-700 text-[11px] uppercase tracking-wider mb-1.5 flex items-center gap-1">
            <Layers className="w-3.5 h-3.5 text-emerald-700" />
            Live MMR Threat Index
          </p>
          <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[11px]">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-600 shrink-0"></span>
              <span className="text-slate-600">Critical (Score 85+)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-orange-500 shrink-0"></span>
              <span className="text-slate-600">High (Score 70-84)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0"></span>
              <span className="text-slate-600">Moderate (50-69)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 shrink-0"></span>
              <span className="text-slate-600">Low (&lt;50)</span>
            </div>
          </div>
        </div>

        {/* Active Hotspot Banner */}
        {topHotspot !== 'None' && (
          <div className="absolute top-4 right-4 z-10 bg-slate-900/85 backdrop-blur-md text-white px-3 py-2 rounded-2xl shadow-lg border border-slate-700 text-xs flex items-center gap-2 max-w-xs">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-ping"></div>
            <div>
              <p className="text-[10px] text-slate-400 uppercase font-semibold">Priority Corridor</p>
              <p className="font-bold text-white leading-tight">
                {topHotspot} ({maxCrit} Critical)
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Selected Incident Drawer */}
      {selectedIncident && (
        <div className="border-t border-slate-200 p-4 bg-emerald-50/50 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center text-white shrink-0 mt-0.5"
              style={{ backgroundColor: getPinColor(selectedIncident.riskLevel) }}
            >
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-emerald-900">
                  {selectedIncident.id}
                </span>
                <span
                  className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${getCategoryBadgeColor(
                    selectedIncident.category
                  )}`}
                >
                  {selectedIncident.category}
                </span>
                <span className="text-xs text-slate-500">• {selectedIncident.region}</span>
              </div>
              <h4 className="text-sm font-bold text-slate-900 mt-0.5">
                {selectedIncident.title}
              </h4>
              <p className="text-xs text-slate-600 line-clamp-1 mt-0.5">
                {selectedIncident.description}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelectedIncident(null)}
              className="text-xs px-3 py-1.5 rounded-xl border border-slate-300 text-slate-600 hover:bg-slate-100 font-medium"
            >
              Dismiss
            </button>
            <button
              onClick={() => onSelectIncident?.(selectedIncident)}
              className="text-xs px-4 py-1.5 rounded-xl bg-emerald-800 text-white hover:bg-emerald-700 font-semibold shadow-xs flex items-center gap-1.5"
            >
              <Eye className="w-3.5 h-3.5" />
              Open Regulatory Dossier
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
