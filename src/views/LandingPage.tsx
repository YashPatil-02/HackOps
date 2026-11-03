import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  RefreshCw,
  UserCheck,
  Plus,
  Bot,
  Layers,
  ShieldCheck,
  CheckCircle2,
  ChevronDown,
} from 'lucide-react';
import { User, Incident } from '../types';
import { api } from '../services/api';
import { InteractiveMap } from '../components/InteractiveMap';

interface LandingPageProps {
  onNavigate: (view: string) => void;
  onOpenReportModal: () => void;
  onOpenAIChat: () => void;
  onSelectIncident?: (incident: Incident) => void;
  currentUser: User | null;
  onUserChange?: (user: User) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onNavigate,
  onOpenReportModal,
  onOpenAIChat,
  onSelectIncident,
  currentUser,
  onUserChange,
}) => {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [demoUsers, setDemoUsers] = useState<User[]>([]);
  const [showRoleMenu, setShowRoleMenu] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await api.incidents.getAll();
      if (res.data) {
        setIncidents(res.data);
      }
    } catch (err) {
      console.warn('Failed to fetch incidents for landing map:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    api.auth
      .demoUsers()
      .then((res: { success: boolean; users: User[] }) => {
        if (res.users) setDemoUsers(res.users);
      })
      .catch(() => {});
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadData();
    setTimeout(() => setIsRefreshing(false), 600);
  };

  return (
    <div className="relative min-h-screen bg-[#dff5f4] text-slate-800 overflow-x-hidden selection:bg-emerald-200 selection:text-emerald-950 pb-28">
      {/* Decorative Cloud Shapes (faithful to image_d5a10934.png) */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden z-0">
        {/* Top-Left Cloud */}
        <div className="absolute -top-6 -left-12 w-64 h-36 bg-white/70 rounded-full blur-[1px]" />
        <div className="absolute top-8 left-16 w-44 h-24 bg-white/60 rounded-full blur-[1px]" />

        {/* Mid-Left Cloud */}
        <div className="absolute top-72 -left-16 w-80 h-44 bg-white/75 rounded-full blur-[1px]" />
        <div className="absolute top-64 left-12 w-48 h-32 bg-white/65 rounded-full blur-[1px]" />

        {/* Bottom-Left Cloud */}
        <div className="absolute top-[680px] -left-10 w-72 h-40 bg-white/80 rounded-full blur-[1px]" />
        <div className="absolute top-[660px] left-14 w-44 h-28 bg-white/70 rounded-full blur-[1px]" />

        {/* Top-Right Cloud */}
        <div className="absolute top-12 -right-10 w-80 h-44 bg-white/70 rounded-full blur-[1px]" />
        <div className="absolute top-6 right-20 w-52 h-32 bg-white/60 rounded-full blur-[1px]" />

        {/* Mid-Right Cloud */}
        <div className="absolute top-[480px] -right-14 w-72 h-36 bg-white/75 rounded-full blur-[1px]" />
        <div className="absolute top-[450px] right-12 w-44 h-24 bg-white/65 rounded-full blur-[1px]" />

        {/* Bottom-Right Cloud */}
        <div className="absolute top-[780px] -right-12 w-84 h-48 bg-white/80 rounded-full blur-[1px]" />
        <div className="absolute top-[760px] right-20 w-56 h-36 bg-white/70 rounded-full blur-[1px]" />
      </div>

      {/* Top Header Bar */}
      <header className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-5 sm:pt-6 flex items-center justify-between">
        {/* Brand Logo Pill */}
        <div className="flex items-center gap-2.5 bg-white/85 backdrop-blur-md px-4 py-2 rounded-2xl shadow-sm border border-emerald-950/10 hover:shadow transition">
          <div className="w-7 h-7 rounded-lg bg-emerald-700 text-white flex items-center justify-center shadow-2xs">
            <Sparkles className="w-4 h-4 text-emerald-100" />
          </div>
          <span className="font-bold text-base sm:text-lg text-emerald-950 tracking-tight">
            EcoSentinel
          </span>
        </div>

        {/* Right Action Pills */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Live Refresh Button */}
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="bg-white/90 hover:bg-white text-emerald-900 border border-emerald-950/10 px-3.5 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-semibold flex items-center gap-1.5 shadow-xs transition hover:scale-[1.02] active:scale-95 disabled:opacity-60"
            title="Refresh live environmental telemetry"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 text-emerald-700 ${isRefreshing ? 'animate-spin' : ''}`}
            />
            <span className="hidden xs:inline">Live Refresh</span>
            <span className="xs:hidden">Refresh</span>
          </button>

          {/* Sign in as environment official / Demo Role Switcher */}
          <div className="relative">
            <button
              onClick={() => onNavigate('officer')}
              className="bg-white/90 hover:bg-white text-emerald-950 border border-emerald-950/10 px-4 py-2 rounded-full text-xs sm:text-sm font-semibold flex items-center gap-2 shadow-xs transition hover:scale-[1.02] active:scale-95"
            >
              <UserCheck className="w-4 h-4 text-emerald-700" />
              <span>Sign in as environment official</span>
            </button>
          </div>

          {/* Quick Switch to Citizen Hub */}
          <button
            onClick={() => onNavigate('citizen')}
            className="hidden md:flex bg-emerald-900/10 hover:bg-emerald-900/20 text-emerald-950 px-3 py-2 rounded-full text-xs font-semibold items-center gap-1.5 transition"
            title="Switch to Citizen Hub"
          >
            <span>Citizen Hub</span>
          </button>
        </div>
      </header>

      {/* Main Hero & Live Map Section */}
      <main className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 sm:pt-14 space-y-8">
        {/* Centered Typography Hero */}
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-1.5 text-[11px] sm:text-xs font-bold uppercase tracking-wider text-emerald-800">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
            <span>LIVE ENVIRONMENT MONITORING</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#113227] tracking-tight leading-[1.12]">
            See the air{' '}
            <span className="font-serif italic font-normal text-[#1e4620] block sm:inline">
              around you.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-slate-600 text-sm sm:text-base max-w-xl mx-auto leading-relaxed pt-1">
            Stay informed about air quality in your neighborhood and help build a healthier, more
            responsive community with automated AI triage.
          </p>
        </div>

        {/* Section Header directly above the map */}
        <div className="pt-2 text-left">
          <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">
            INTERACTIVE AIR QUALITY MAP
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-[#113227] mt-0.5">
            Live Mumbai Air Telemetry &amp; Station Network
          </h2>
          <p className="text-xs text-slate-600 mt-0.5">
            Pan, zoom, search any neighborhood, or click on monitoring stations to inspect live
            pollutant concentrations.
          </p>
        </div>

        {/* Map Container Card (Directly embedded on opening page, no button required!) */}
        <div className="rounded-3xl shadow-xl overflow-hidden bg-white border border-emerald-950/10 p-2 sm:p-3 relative">
          <InteractiveMap
            incidents={incidents}
            onSelectIncident={onSelectIncident}
            initialCenter={[19.18, 72.92]}
            initialZoom={10}
            heightClass="h-[480px] sm:h-[540px]"
            showLayerControls={true}
            showSearchBar={true}
          />
        </div>
      </main>

      {/* Floating Bottom Action Buttons (Matching image_d5a10934.png) */}
      <div className="fixed bottom-6 left-6 right-6 z-40 pointer-events-none flex items-center justify-between max-w-6xl mx-auto">
        {/* Left Bottom: Ask EcoGuide AI */}
        <button
          onClick={onOpenAIChat}
          className="pointer-events-auto bg-[#064e3b] hover:bg-[#043d2e] text-white px-5 py-3 rounded-full font-bold text-xs sm:text-sm shadow-xl flex items-center gap-2.5 transition transform hover:scale-[1.03] active:scale-95 border border-emerald-600/30 cursor-pointer"
        >
          <div className="w-5 h-5 rounded-full bg-emerald-500/30 flex items-center justify-center">
            <Bot className="w-3.5 h-3.5 text-emerald-200" />
          </div>
          <span>Ask EcoGuide AI</span>
        </button>

        {/* Right Bottom: Report a pollution issue */}
        <button
          onClick={onOpenReportModal}
          className="pointer-events-auto bg-[#064e3b] hover:bg-[#043d2e] text-white px-5 py-3 rounded-full font-bold text-xs sm:text-sm shadow-xl flex items-center gap-2.5 transition transform hover:scale-[1.03] active:scale-95 border border-emerald-600/30 cursor-pointer"
        >
          <div className="w-5 h-5 rounded-full bg-emerald-500/30 flex items-center justify-center">
            <Plus className="w-3.5 h-3.5 text-emerald-200" />
          </div>
          <span>Report a pollution issue</span>
        </button>
      </div>
    </div>
  );
};
export default LandingPage;
