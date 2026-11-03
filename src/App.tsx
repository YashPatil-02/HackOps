import React, { useState, useEffect } from 'react';
import { User, Incident } from './types';
import { api, setCurrentUserHeader } from './services/api';
import { Navbar } from './components/Navbar';
import { LandingPage } from './views/LandingPage';
import { CitizenDashboard } from './views/CitizenDashboard';
import { OfficerDashboard } from './views/OfficerDashboard';
import { ReportIssueModal } from './components/ReportIssueModal';
import { IncidentDetailModal } from './components/IncidentDetailModal';
import { EcoGuideAIChat } from './components/EcoGuideAIChat';
import { Sparkles, Bot } from 'lucide-react';

export function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<string>('landing');
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isAIChatOpen, setIsAIChatOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [quotaExceeded, setQuotaExceeded] = useState(false);

  useEffect(() => {
    const handleQuota = () => setQuotaExceeded(true);
    window.addEventListener('gmp-quota-exceeded', handleQuota);
    return () => window.removeEventListener('gmp-quota-exceeded', handleQuota);
  }, []);

  // Initialize active user
  useEffect(() => {
    api.auth
      .me()
      .then((res) => {
        if (res.user) {
          setCurrentUser(res.user);
        }
      })
      .catch((err) => {
        console.warn('Initial auth fetch error:', err);
      });
  }, []);

  const handleUserChange = (newUser: User) => {
    setCurrentUser(newUser);
    setCurrentUserHeader(newUser.id);
  };

  const handleIncidentSelected = (incident: Incident) => {
    setSelectedIncident(incident);
  };

  const handleReportSuccess = (newIncident: Incident) => {
    setSelectedIncident(newIncident);
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <div className="min-h-screen bg-[#F7FBF8] text-slate-800 flex flex-col antialiased selection:bg-emerald-100 selection:text-emerald-900">
      {quotaExceeded && (
        <div className="bg-amber-50 border-b border-amber-200 text-amber-900 px-4 py-2.5 text-xs md:text-sm text-center sticky top-0 z-50 shadow-sm">
          <span>
            Google Maps Platform quota reached. If you are the app owner, visit{' '}
            <a
              href="https://developers.google.com/maps/ai/ai-studio?utm_campaign=gmp_mcp_codeassist_v1_aistudio#quota_exceeded_errors"
              target="_blank"
              rel="noopener noreferrer"
              className="underline font-semibold text-amber-950 hover:text-amber-800"
            >
              maps developer site
            </a>{' '}
            for instructions to update your account.
          </span>
        </div>
      )}
      {/* Top Navbar with Role Switcher, Nav Links, Notifications (for dashboard views) */}
      {currentView !== 'landing' && (
        <Navbar
          currentUser={currentUser}
          onUserChange={handleUserChange}
          currentView={currentView}
          onNavigate={(view) => setCurrentView(view)}
          onOpenAIChat={() => setIsAIChatOpen(true)}
          onOpenReportModal={() => setIsReportModalOpen(true)}
        />
      )}

      {/* Main View Router */}
      <main className="flex-1">
        {currentView === 'landing' && (
          <LandingPage
            onNavigate={(view) => setCurrentView(view)}
            onOpenReportModal={() => setIsReportModalOpen(true)}
            onOpenAIChat={() => setIsAIChatOpen(true)}
            onSelectIncident={handleIncidentSelected}
            currentUser={currentUser}
            onUserChange={handleUserChange}
            key={`landing-${refreshTrigger}`}
          />
        )}

        {currentView === 'citizen' && currentUser && (
          <CitizenDashboard
            key={`citizen-${refreshTrigger}`}
            currentUser={currentUser}
            onOpenReportModal={() => setIsReportModalOpen(true)}
            onSelectIncident={handleIncidentSelected}
            onOpenAIChat={() => setIsAIChatOpen(true)}
          />
        )}

        {currentView === 'officer' && currentUser && (
          <OfficerDashboard
            key={`officer-${refreshTrigger}`}
            currentUser={currentUser}
            onSelectIncident={handleIncidentSelected}
            onOpenAIChat={() => setIsAIChatOpen(true)}
            initialTab="command-center"
          />
        )}

        {currentView === 'compliance' && currentUser && (
          <OfficerDashboard
            key={`compliance-${refreshTrigger}`}
            currentUser={currentUser}
            onSelectIncident={handleIncidentSelected}
            onOpenAIChat={() => setIsAIChatOpen(true)}
            initialTab="compliance"
          />
        )}
      </main>

      {/* Global Modals */}
      <ReportIssueModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        onSuccess={handleReportSuccess}
      />

      <IncidentDetailModal
        incidentId={selectedIncident?.id || null}
        onClose={() => setSelectedIncident(null)}
        currentUser={currentUser}
        onIncidentUpdated={() => setRefreshTrigger((prev) => prev + 1)}
      />

      <EcoGuideAIChat
        isOpen={isAIChatOpen}
        onClose={() => setIsAIChatOpen(false)}
      />
    </div>
  );
}
export default App;
