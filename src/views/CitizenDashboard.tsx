import React, { useState, useEffect } from 'react';
import {
  FileText,
  AlertTriangle,
  CheckCircle2,
  Clock,
  MapPin,
  Plus,
  Eye,
  Sparkles,
  Layers,
  Activity,
  User,
  ShieldCheck,
  TrendingUp,
  Droplets,
  Wind,
  Bell,
} from 'lucide-react';
import { Incident, User as UserType } from '../types';
import { api } from '../services/api';
import { InteractiveMap } from '../components/InteractiveMap';

interface CitizenDashboardProps {
  currentUser: UserType;
  onOpenReportModal: () => void;
  onSelectIncident: (incident: Incident) => void;
  onOpenAIChat: () => void;
}

export const CitizenDashboard: React.FC<CitizenDashboardProps> = ({
  currentUser,
  onOpenReportModal,
  onSelectIncident,
  onOpenAIChat,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'my-reports' | 'map' | 'insights' | 'profile'>('overview');
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);

  const loadIncidents = async () => {
    setLoading(true);
    try {
      const res = await api.incidents.getAll();
      if (res.data) setIncidents(res.data);
    } catch (err) {
      console.error('Error loading incidents:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadIncidents();
    const interval = setInterval(() => {
      api.incidents
        .getAll()
        .then((res) => {
          if (res.data) setIncidents(res.data);
        })
        .catch(() => {});
    }, 5000);
    return () => clearInterval(interval);
  }, [currentUser]);

  // Filter citizen's personal reports
  const myReports = incidents.filter((i) => i.reporterId === currentUser.id || i.reporterEmail === currentUser.email);
  const submittedCount = myReports.length;
  const underInvestigationCount = myReports.filter((i) => i.status === 'Investigation Assigned' || i.status === 'Under Review' || i.status === 'Corrective Action').length;
  const resolvedCount = myReports.filter((i) => i.status === 'Resolved').length;

  return (
    <div className="min-h-screen bg-[#F7FBF8] text-slate-800 pb-16">
      {/* Top Banner / Breadcrumb */}
      <div className="bg-white border-b border-emerald-950/10 py-5 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800">
              <span>Citizen Environmental Vigilance</span>
              <span>·</span>
              <span className="text-slate-500">{currentUser.location || 'Vasai-Virar Node'}</span>
            </div>
            <h1 className="text-2xl font-extrabold text-emerald-950 tracking-tight mt-0.5">
              My Environmental Impact
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onOpenAIChat}
              className="px-3.5 py-2 bg-emerald-50 border border-emerald-200 text-emerald-900 font-semibold text-xs rounded-xl hover:bg-emerald-100/60 transition-colors flex items-center gap-1.5 shadow-2xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
              Ask EcoGuide AI
            </button>
            <button
              onClick={onOpenReportModal}
              className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl transition-all shadow-xs flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              Report Environmental Issue
            </button>
          </div>
        </div>

        {/* Tab Sub-Navigation */}
        <div className="max-w-7xl mx-auto flex items-center gap-2 mt-5 overflow-x-auto text-xs font-semibold">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'my-reports', label: `My Reports (${submittedCount})` },
            { id: 'map', label: 'Local Incident Map' },
            { id: 'insights', label: 'Environmental Insights' },
            { id: 'profile', label: 'Reporter Profile' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3.5 py-2 rounded-xl transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-8 mt-6">
        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-emerald-950/10 shadow-2xs space-y-1">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
                  <span>Reports Submitted</span>
                  <FileText className="w-4 h-4 text-emerald-700" />
                </div>
                <div className="text-3xl font-extrabold text-emerald-950 font-mono">{submittedCount}</div>
                <div className="text-[11px] text-slate-500">Active citizen cases registered</div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-emerald-950/10 shadow-2xs space-y-1">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
                  <span>Under Investigation</span>
                  <Clock className="w-4 h-4 text-amber-600" />
                </div>
                <div className="text-3xl font-extrabold text-amber-800 font-mono">
                  {underInvestigationCount}
                </div>
                <div className="text-[11px] text-slate-500">Officer assigned or action mandated</div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-emerald-950/10 shadow-2xs space-y-1">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
                  <span>Remediated &amp; Resolved</span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="text-3xl font-extrabold text-emerald-700 font-mono">{resolvedCount}</div>
                <div className="text-[11px] text-slate-500">Verified by inspection team</div>
              </div>
            </div>

            {/* Quick Action Alert */}
            <div className="bg-gradient-to-r from-emerald-800 to-teal-800 text-white p-5 rounded-3xl flex flex-wrap items-center justify-between gap-4 shadow-sm">
              <div className="space-y-1 max-w-xl">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                  <h3 className="font-bold text-sm">Vasai-Virar Industrial Surveillance Active</h3>
                </div>
                <p className="text-xs text-emerald-100/90 leading-relaxed">
                  High particulate anomalies detected near Evershine City and Pelhar industrial corridor. If you observe dense stack plumes or dark smoke, report it for automated AI compliance assessment.
                </p>
              </div>

              <button
                onClick={onOpenReportModal}
                className="px-4 py-2.5 bg-white text-emerald-900 font-bold text-xs rounded-xl hover:bg-emerald-50 transition-colors shadow-2xs"
              >
                File an Observation
              </button>
            </div>

            {/* Nearby Map Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-base text-slate-900">Nearby Incidents Around Your Node</h3>
                  <p className="text-xs text-slate-500">
                    Live environmental observations reported within 15 km of your location.
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('map')}
                  className="text-xs font-semibold text-emerald-700 hover:text-emerald-800"
                >
                  Expand Full Map →
                </button>
              </div>

              <InteractiveMap
                incidents={incidents}
                onSelectIncident={onSelectIncident}
                heightClass="h-[420px]"
                initialCenter={[19.38, 72.85]}
                initialZoom={11}
              />
            </div>

            {/* Recent Personal Reports Preview */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-slate-900">Your Recent Submissions</h3>
                <button
                  onClick={() => setActiveTab('my-reports')}
                  className="text-xs text-emerald-700 hover:underline font-semibold"
                >
                  View All ({myReports.length})
                </button>
              </div>

              {myReports.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">
                  You haven&apos;t filed any environmental reports yet. Click &quot;Report Environmental Issue&quot; above to begin.
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {myReports.slice(0, 3).map((rep) => (
                    <div
                      key={rep.id}
                      onClick={() => onSelectIncident(rep)}
                      className="py-3 flex flex-wrap items-center justify-between gap-3 hover:bg-slate-50/80 p-2 rounded-xl cursor-pointer transition-colors"
                    >
                      <div className="space-y-1 max-w-lg">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
                            {rep.id}
                          </span>
                          <span className="text-xs font-bold text-slate-900">{rep.title}</span>
                        </div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-3">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-slate-400" />
                            {rep.location}
                          </span>
                          <span>·</span>
                          <span>Reported {new Date(rep.reportedAt).toLocaleDateString()}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span
                          className={`text-xs font-bold px-2.5 py-1 rounded-lg ${
                            rep.status === 'Resolved'
                              ? 'bg-emerald-100 text-emerald-800'
                              : rep.status === 'Investigation Assigned'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {rep.status}
                        </span>
                        <Eye className="w-4 h-4 text-slate-400" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: MY REPORTS */}
        {activeTab === 'my-reports' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-lg text-slate-900">My Environmental Reports</h3>
                <p className="text-xs text-slate-500">
                  Track officer assignments, compliance reviews, and corrective action verifications.
                </p>
              </div>
              <button
                onClick={onOpenReportModal}
                className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" /> New Report
              </button>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {myReports.map((inc) => (
                <div
                  key={inc.id}
                  onClick={() => onSelectIncident(inc)}
                  className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-emerald-500 transition-all shadow-2xs hover:shadow-sm cursor-pointer space-y-3"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
                          {inc.id}
                        </span>
                        <span
                          className={`text-xs font-bold px-2 py-0.5 rounded-md ${
                            inc.riskLevel === 'Critical'
                              ? 'bg-rose-100 text-rose-800'
                              : inc.riskLevel === 'High'
                              ? 'bg-orange-100 text-orange-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {inc.riskLevel} Risk ({inc.riskScore}/100)
                        </span>
                        <span className="text-xs text-slate-400">·</span>
                        <span className="text-xs text-slate-600 font-medium capitalize">{inc.category} Pollution</span>
                      </div>
                      <h4 className="font-bold text-sm text-slate-900 leading-snug">{inc.title}</h4>
                    </div>

                    <span
                      className={`text-xs font-bold px-3 py-1 rounded-lg border ${
                        inc.status === 'Resolved'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : inc.status === 'Investigation Assigned'
                          ? 'bg-amber-50 text-amber-800 border-amber-200'
                          : 'bg-blue-50 text-blue-800 border-blue-200'
                      }`}
                    >
                      {inc.status}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">{inc.description}</p>

                  {inc.aiAnalysis && (
                    <div className="p-3 bg-emerald-50/60 rounded-xl text-xs text-emerald-950 flex items-start gap-2 border border-emerald-100">
                      <Sparkles className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                      <div className="space-y-0.5">
                        <span className="font-bold block text-emerald-900">AI Screening Finding:</span>
                        <p className="text-emerald-900/90 text-[11px]">{inc.aiAnalysis.incident_summary}</p>
                      </div>
                    </div>
                  )}

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-[11px] text-slate-500">
                    <span className="flex items-center gap-1 font-medium text-slate-700">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      {inc.location} ({inc.region})
                    </span>
                    <span className="text-emerald-700 font-semibold flex items-center gap-1">
                      Click to open investigation file &amp; timeline →
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: LOCAL MAP */}
        {activeTab === 'map' && (
          <div className="space-y-4">
            <div>
              <h3 className="font-bold text-lg text-slate-900">Regional Environmental Monitoring Map</h3>
              <p className="text-xs text-slate-500">
                Explore active observations, risk heatmaps, and municipal monitoring coverage.
              </p>
            </div>
            <InteractiveMap
              incidents={incidents}
              onSelectIncident={onSelectIncident}
              heightClass="h-[600px]"
            />
          </div>
        )}

        {/* TAB 4: ENVIRONMENTAL INSIGHTS */}
        {activeTab === 'insights' && (
          <div className="space-y-6">
            <div className="bg-amber-50/70 p-4 rounded-2xl border border-amber-200/80 text-xs text-amber-950 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                <strong>Demonstration Transparency:</strong> The readings below reflect simulated baseline continuous
                ambient air and water quality sensor streams across the Mumbai Metropolitan Region for prototyping purposes.
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Air Quality Trend Card */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Wind className="w-5 h-5 text-emerald-700" />
                    <h4 className="font-bold text-sm text-slate-900">Local Air Quality Trends (Vasai-Virar)</h4>
                  </div>
                  <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                    Moderate / Unhealthy Sensitive
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  24-Hour PM2.5 moving average is currently <strong>74 µg/m³</strong> (NAAQS Standard: 60 µg/m³). Peak spikes coincide with pre-dawn shift changes in the industrial estate between 3:00 AM and 6:00 AM.
                </p>
                <div className="bg-slate-50 p-3 rounded-xl space-y-1.5 text-xs">
                  <div className="flex justify-between font-medium">
                    <span className="text-slate-500">PM2.5:</span>
                    <span className="font-mono font-bold text-rose-600">74.2 µg/m³ (Exceeds limit)</span>
                  </div>
                  <div className="flex justify-between font-medium">
                    <span className="text-slate-500">PM10:</span>
                    <span className="font-mono text-slate-800">118.0 µg/m³</span>
                  </div>
                  <div className="flex justify-between font-medium">
                    <span className="text-slate-500">SO2:</span>
                    <span className="font-mono text-emerald-700">32.4 µg/m³ (Within safe limits)</span>
                  </div>
                </div>
              </div>

              {/* Water Quality Observation */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Droplets className="w-5 h-5 text-sky-600" />
                    <h4 className="font-bold text-sm text-slate-900">Coastal Wetland &amp; Creek Health</h4>
                  </div>
                  <span className="text-[11px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded">
                    High Biological Stress
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Mira-Bhayandar and Ulhas estuary monitoring posts report dissolved oxygen dips below 1.5 mg/L during neap tides. Common Effluent Treatment Plant (CETP) inlet loading remains elevated.
                </p>
                <div className="bg-slate-50 p-3 rounded-xl space-y-1.5 text-xs">
                  <div className="flex justify-between font-medium">
                    <span className="text-slate-500">Dissolved Oxygen (DO):</span>
                    <span className="font-mono font-bold text-rose-600">1.2 mg/L (Critical low)</span>
                  </div>
                  <div className="flex justify-between font-medium">
                    <span className="text-slate-500">Biochemical Oxygen Demand:</span>
                    <span className="font-mono text-amber-700">38 mg/L</span>
                  </div>
                  <div className="flex justify-between font-medium">
                    <span className="text-slate-500">pH Index:</span>
                    <span className="font-mono text-emerald-700">7.6 (Normal range)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Health Recommendations */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
              <h4 className="font-bold text-sm text-slate-900">Environmental Safety Recommendations</h4>
              <ul className="space-y-1.5 text-xs text-slate-600 leading-relaxed">
                <li>• Avoid early morning jogging near industrial estate perimeters when thermal inversion traps boiler exhaust.</li>
                <li>• Do not consume unboiled borewell water in areas within 1 km of informal battery dismantling or electroplating workshops.</li>
                <li>• Keep windows closed if noticing pungent sulfurous odors during late-night hours, and immediately submit a time-stamped report via EcoSentinel.</li>
              </ul>
            </div>
          </div>
        )}

        {/* TAB 5: PROFILE */}
        {activeTab === 'profile' && (
          <div className="max-w-2xl bg-white p-6 rounded-3xl border border-slate-200 space-y-5">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xl">
                {currentUser.name.charAt(0)}
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">{currentUser.name}</h3>
                <p className="text-xs text-slate-500">{currentUser.email}</p>
                <span className="inline-block mt-1 text-[11px] font-bold text-emerald-800 bg-emerald-100/70 px-2.5 py-0.5 rounded-full capitalize">
                  Verified {currentUser.role}
                </span>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 space-y-3 text-xs">
              <div className="flex justify-between py-1">
                <span className="text-slate-500">User ID</span>
                <span className="font-mono text-slate-800 font-bold">{currentUser.id}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Primary Surveillance Node</span>
                <span className="text-slate-800 font-semibold">{currentUser.location}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Member Since</span>
                <span className="text-slate-800">{new Date(currentUser.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
