import React, { useState } from 'react';
import {
  Leaf,
  Shield,
  UserCheck,
  Sparkles,
  MapPin,
  RefreshCw,
  LogOut,
  ChevronDown,
  CheckCircle2,
  FileText,
  Activity,
  Layers,
} from 'lucide-react';
import { User } from '../types';
import { api, setCurrentUserHeader } from '../services/api';

interface NavbarProps {
  currentUser: User | null;
  onUserChange: (user: User) => void;
  currentView: string;
  onNavigate: (view: string) => void;
  onOpenAIChat: () => void;
  onOpenReportModal?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  onUserChange,
  currentView,
  onNavigate,
  onOpenAIChat,
  onOpenReportModal,
}) => {
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const handleSwitchUser = async (email: string) => {
    try {
      const res = await api.auth.login(email);
      if (res.user) {
        setCurrentUserHeader(res.user.id);
        onUserChange(res.user);
        setShowUserDropdown(false);
        // Navigate to appropriate home view
        if (res.user.role === 'citizen') {
          onNavigate('citizen');
        } else {
          onNavigate('officer');
        }
      }
    } catch (err) {
      console.error('Failed to switch user:', err);
    }
  };

  const handleResetDemoData = async () => {
    if (confirm('Reset EcoSentinel database to initial Mumbai Metropolitan Region demonstration data?')) {
      setIsResetting(true);
      try {
        await api.seed.reset();
        window.location.reload();
      } catch (err) {
        alert('Failed to reset demo data');
      } finally {
        setIsResetting(false);
      }
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-emerald-950/10 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand / Logo */}
        <div className="flex items-center gap-6">
          <button
            onClick={() => onNavigate('landing')}
            className="flex items-center gap-2.5 text-left group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-800 flex items-center justify-center text-white shadow-sm shadow-emerald-700/20 group-hover:scale-105 transition-transform">
              <Leaf className="w-5 h-5 text-emerald-200" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg text-emerald-950 tracking-tight">EcoSentinel</span>
                <span className="hidden sm:inline text-[10px] font-bold text-emerald-800 bg-emerald-100/70 px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Gov &amp; Public
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium hidden md:block">
                Turning Environmental Data Into Action
              </p>
            </div>
          </button>

          {/* Navigation Items */}
          {/* Navigation Items */}
          <nav className="hidden lg:flex items-center gap-1 text-sm font-medium">
            <button
              onClick={() => onNavigate('landing')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                currentView === 'landing'
                  ? 'bg-emerald-50 text-emerald-800 font-semibold'
                  : 'text-slate-600 hover:text-emerald-800 hover:bg-slate-50'
              }`}
            >
              Public Portal
            </button>

            {currentUser?.role === 'citizen' ? (
              <button
                onClick={() => onNavigate('citizen')}
                className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                  currentView === 'citizen'
                    ? 'bg-emerald-50 text-emerald-800 font-semibold'
                    : 'text-slate-600 hover:text-emerald-800 hover:bg-slate-50'
                }`}
              >
                <Activity className="w-4 h-4 text-emerald-600" />
                Command Center
              </button>
            ) : (
              <>
                <button
                  onClick={() => onNavigate('officer')}
                  className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                    currentView === 'officer'
                      ? 'bg-emerald-50 text-emerald-800 font-semibold'
                      : 'text-slate-600 hover:text-emerald-800 hover:bg-slate-50'
                  }`}
                >
                  <Shield className="w-4 h-4 text-emerald-700" />
                  Operations Center
                </button>
                <button
                  onClick={() => onNavigate('compliance')}
                  className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                    currentView === 'compliance'
                      ? 'bg-emerald-50 text-emerald-800 font-semibold'
                      : 'text-slate-600 hover:text-emerald-800 hover:bg-slate-50'
                  }`}
                >
                  <FileText className="w-4 h-4 text-amber-600" />
                  Compliance Intelligence
                </button>
              </>
            )}
          </nav>
        </div>

        {/* Right Action Bar */}
        <div className="flex items-center gap-3">
          {/* Quick Report Button */}
          {onOpenReportModal && (
            <button
              onClick={onOpenReportModal}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl transition-all shadow-xs"
            >
              <MapPin className="w-3.5 h-3.5" /> Report Issue
            </button>
          )}

          {/* Ask EcoGuide AI Copilot (Only from top) */}
          <button
            onClick={onOpenAIChat}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-300 hover:border-emerald-500 text-emerald-950 text-xs font-bold rounded-xl transition-all shadow-xs hover:shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
            <span>Ask EcoGuide AI</span>
          </button>

          {/* User Profile & Demo Switcher */}
          <div className="relative">
            <button
              onClick={() => setShowUserDropdown(!showUserDropdown)}
              className="flex items-center gap-2 p-1.5 pl-2.5 rounded-xl border border-emerald-950/15 bg-slate-50 hover:bg-slate-100 text-xs font-medium text-slate-800 transition-all"
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  currentUser?.role === 'officer'
                    ? 'bg-blue-600'
                    : currentUser?.role === 'admin'
                    ? 'bg-purple-600'
                    : 'bg-emerald-600'
                }`}
              />
              <span className="font-semibold max-w-[120px] truncate">
                {currentUser?.name || 'Demo Login'}
              </span>
              <span className="text-[10px] text-slate-500 bg-slate-200/80 px-1.5 py-0.2 rounded font-mono capitalize">
                {currentUser?.role || 'Guest'}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {/* Demo Switcher Menu */}
            {showUserDropdown && (
              <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-200 p-2.5 z-50">
                <div className="px-2 py-1.5 mb-1.5 bg-emerald-50/70 rounded-xl">
                  <div className="text-[11px] font-bold text-emerald-900">Demo Role Switcher</div>
                  <div className="text-[10px] text-emerald-700/80">
                    Instantly test citizen reporting or officer enforcement workflows.
                  </div>
                </div>

                <div className="space-y-1">
                  <div
                    className="w-full flex items-center justify-between p-2 rounded-lg text-left text-xs bg-emerald-100/60 font-semibold text-emerald-950"
                  >
                    <div>
                      <div className="font-bold text-emerald-950">Inspector Rajesh Deshmukh</div>
                      <div className="text-[10px] text-emerald-800">officer@ecosentinel.demo · Enforcement Wing</div>
                      <div className="text-[10px] text-slate-500 font-mono mt-0.5">ID: user-officer-01</div>
                    </div>
                    <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                  </div>
                </div>

                <div className="mt-2 pt-2 border-t border-slate-100">
                  <button
                    onClick={handleResetDemoData}
                    disabled={isResetting}
                    className="w-full flex items-center gap-2 p-2 text-xs text-rose-700 hover:bg-rose-50 rounded-lg transition-colors font-medium"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isResetting ? 'animate-spin' : ''}`} />
                    Reset Demonstration Data
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
