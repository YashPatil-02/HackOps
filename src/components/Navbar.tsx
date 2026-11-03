import React, { useState, useEffect } from 'react';
import {
  Leaf,
  Shield,
  UserCheck,
  Bell,
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
import { User, Notification } from '../types';
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
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isResetting, setIsResetting] = useState(false);

  // Fetch notifications
  useEffect(() => {
    if (currentUser) {
      api.notifications
        .getAll()
        .then((res) => {
          if (res.data) setNotifications(res.data);
        })
        .catch(() => {});
    }
  }, [currentUser]);

  const unreadCount = notifications.filter((n) => !n.read).length;

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

  const handleMarkAllNotifications = async () => {
    await api.notifications.markAllRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
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
            <button
              onClick={() => onNavigate('citizen')}
              className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                currentView === 'citizen'
                  ? 'bg-emerald-50 text-emerald-800 font-semibold'
                  : 'text-slate-600 hover:text-emerald-800 hover:bg-slate-50'
              }`}
            >
              <UserCheck className="w-4 h-4 text-emerald-600" />
              Citizen Hub
            </button>
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
              onClick={() => onNavigate('heatmap')}
              className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                currentView === 'heatmap'
                  ? 'bg-emerald-50 text-emerald-800 font-semibold'
                  : 'text-slate-600 hover:text-emerald-800 hover:bg-slate-50'
              }`}
            >
              <Layers className="w-4 h-4 text-sky-600" />
              Risk Map
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
              Compliance
            </button>
          </nav>
        </div>

        {/* Right Action Bar */}
        <div className="flex items-center gap-3">
          {/* Quick Report Button */}
          {onOpenReportModal && (
            <button
              onClick={onOpenReportModal}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-lg transition-colors shadow-xs"
            >
              <MapPin className="w-3.5 h-3.5" /> Report Issue
            </button>
          )}

          {/* AI Assistant Button */}
          <button
            onClick={onOpenAIChat}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 border border-emerald-200/80 hover:bg-emerald-100/70 text-emerald-900 text-xs font-semibold rounded-lg transition-all shadow-2xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span className="hidden sm:inline">EcoGuide AI</span>
          </button>

          {/* Notification Bell */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 rounded-lg text-slate-600 hover:text-emerald-800 hover:bg-slate-100 relative transition-colors"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-rose-600 text-white text-[10px] font-bold flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notification Drawer */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-200 p-3 z-50">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <span className="font-bold text-xs text-slate-800">
                    Notifications ({notifications.length})
                  </span>
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllNotifications}
                      className="text-[11px] text-emerald-700 hover:text-emerald-800 font-medium"
                    >
                      Mark all as read
                    </button>
                  )}
                </div>

                <div className="max-h-72 overflow-y-auto divide-y divide-slate-50 my-1">
                  {notifications.length === 0 ? (
                    <div className="py-6 text-center text-xs text-slate-400">No notifications yet.</div>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        className={`p-2.5 text-xs transition-colors rounded-lg ${
                          !n.read ? 'bg-emerald-50/50' : 'hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-slate-800">{n.title}</span>
                          <span className="text-[10px] text-slate-400">
                            {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-slate-600 mt-1 line-clamp-2 leading-relaxed">{n.message}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

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
                  <button
                    onClick={() => handleSwitchUser('citizen@ecosentinel.demo')}
                    className={`w-full flex items-center justify-between p-2 rounded-lg text-left text-xs transition-colors ${
                      currentUser?.email === 'citizen@ecosentinel.demo'
                        ? 'bg-emerald-100/60 font-semibold text-emerald-950'
                        : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div>
                      <div className="font-medium">Ananya Sharma</div>
                      <div className="text-[10px] text-slate-500">citizen@ecosentinel.demo (Citizen)</div>
                    </div>
                    {currentUser?.email === 'citizen@ecosentinel.demo' && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                    )}
                  </button>

                  <button
                    onClick={() => handleSwitchUser('officer@ecosentinel.demo')}
                    className={`w-full flex items-center justify-between p-2 rounded-lg text-left text-xs transition-colors ${
                      currentUser?.email === 'officer@ecosentinel.demo'
                        ? 'bg-emerald-100/60 font-semibold text-emerald-950'
                        : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div>
                      <div className="font-medium">Inspector Rajesh Deshmukh</div>
                      <div className="text-[10px] text-slate-500">officer@ecosentinel.demo (Officer)</div>
                    </div>
                    {currentUser?.email === 'officer@ecosentinel.demo' && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                    )}
                  </button>

                  <button
                    onClick={() => handleSwitchUser('admin@ecosentinel.demo')}
                    className={`w-full flex items-center justify-between p-2 rounded-lg text-left text-xs transition-colors ${
                      currentUser?.email === 'admin@ecosentinel.demo'
                        ? 'bg-emerald-100/60 font-semibold text-emerald-950'
                        : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div>
                      <div className="font-medium">Dr. Sunita Kulkarni</div>
                      <div className="text-[10px] text-slate-500">admin@ecosentinel.demo (Admin)</div>
                    </div>
                    {currentUser?.email === 'admin@ecosentinel.demo' && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                    )}
                  </button>
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
