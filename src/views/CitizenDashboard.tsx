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
  Activity,
  BookOpen,
  Scale,
  Shield,
  HelpCircle,
  ExternalLink,
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
  const [activeTab, setActiveTab] = useState<'command-center' | 'eco-guide'>('command-center');
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
  const myReports = incidents.filter(
    (i) => i.reporterId === currentUser.id || i.reporterEmail === currentUser.email
  );
  const submittedCount = myReports.length;
  const underInvestigationCount = myReports.filter(
    (i) =>
      i.status === 'Investigation Assigned' ||
      i.status === 'Under Review' ||
      i.status === 'Corrective Action'
  ).length;
  const resolvedCount = myReports.filter((i) => i.status === 'Resolved').length;

  return (
    <div className="min-h-screen bg-[#F7FBF8] text-slate-800 pb-16">
      {/* Top Banner / Breadcrumb */}
      <div className="bg-white border-b border-emerald-950/10 py-5 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800">
              <span>Citizen Environmental Vigilance Portal</span>
              <span>·</span>
              <span className="text-slate-500">{currentUser.location || 'Mumbai Metropolitan Region'}</span>
            </div>
            <h1 className="text-2xl font-extrabold text-emerald-950 tracking-tight mt-0.5">
              Citizen Command Center
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onOpenAIChat}
              className="px-3.5 py-2 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-300 hover:border-emerald-500 text-emerald-950 font-bold text-xs rounded-xl transition-all shadow-xs flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
              Ask EcoGuide AI
            </button>
            <button
              onClick={onOpenReportModal}
              className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl transition-all shadow-xs flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              Report Issue
            </button>
          </div>
        </div>

        {/* Navigation restricted to Command Center, Report Issue action, and Eco Guide */}
        <div className="max-w-7xl mx-auto flex items-center gap-2.5 mt-5 overflow-x-auto text-xs font-semibold">
          <button
            onClick={() => setActiveTab('command-center')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl transition-all whitespace-nowrap ${
              activeTab === 'command-center'
                ? 'bg-emerald-800 text-white shadow-xs'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Activity className="w-4 h-4" />
            Command Center
          </button>

          <button
            onClick={onOpenReportModal}
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl transition-all whitespace-nowrap shadow-xs"
          >
            <Plus className="w-4 h-4" />
            Report Issue
          </button>

          <button
            onClick={() => setActiveTab('eco-guide')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl transition-all whitespace-nowrap ${
              activeTab === 'eco-guide'
                ? 'bg-emerald-800 text-white shadow-xs'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            Eco Guide &amp; Legal Rights
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-8 mt-6">
        {/* ================= COMMAND CENTER VIEW ================= */}
        {activeTab === 'command-center' && (
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
                  <h3 className="font-bold text-sm">Industrial Surveillance Grid Active</h3>
                </div>
                <p className="text-xs text-emerald-100/90 leading-relaxed">
                  Notice dense stack plumes, discolored river discharge, chemical fumes, or open burning? File an environmental report with automatic tamper-proof GPS location for AI assessment.
                </p>
              </div>

              <button
                onClick={onOpenReportModal}
                className="px-4 py-2.5 bg-white text-emerald-900 font-bold text-xs rounded-xl hover:bg-emerald-50 transition-colors shadow-2xs flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                File an Observation
              </button>
            </div>

            {/* Live Interactive Map Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-base text-slate-900">Regional Environmental Surveillance Map</h3>
                  <p className="text-xs text-slate-500">
                    Live environmental observations and verified industrial compliance sites around your node.
                  </p>
                </div>
                <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg">
                  {incidents.length} Active Incidents Tracked
                </span>
              </div>

              <InteractiveMap
                incidents={incidents}
                onSelectIncident={onSelectIncident}
                heightClass="h-[460px]"
                initialCenter={[19.38, 72.85]}
                initialZoom={11}
              />
            </div>

            {/* Personal Reports Section */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm text-slate-900">Your Submitted Cases ({myReports.length})</h3>
                  <p className="text-xs text-slate-500">Track officer assignments, compliance reviews, and corrective action verifications in real-time.</p>
                </div>
                <button
                  onClick={onOpenReportModal}
                  className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs rounded-lg transition-colors flex items-center gap-1 shadow-2xs"
                >
                  <Plus className="w-3.5 h-3.5" /> New Report
                </button>
              </div>

              {myReports.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-500 space-y-3">
                  <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="font-bold text-slate-800 block text-sm">No cases submitted yet</span>
                    <span className="text-slate-400">Click &quot;Report Issue&quot; above to submit your first environmental observation.</span>
                  </div>
                  <button
                    onClick={onOpenReportModal}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-xs shadow-xs"
                  >
                    <Plus className="w-4 h-4" /> Report Issue Now
                  </button>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {myReports.map((rep) => (
                    <div
                      key={rep.id}
                      onClick={() => onSelectIncident(rep)}
                      className="py-3 flex flex-wrap items-center justify-between gap-3 hover:bg-slate-50/80 p-2.5 rounded-xl cursor-pointer transition-colors"
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

        {/* ================= ECO GUIDE (STATUTORY & LEGAL GUIDE) ================= */}
        {activeTab === 'eco-guide' && (
          <div className="space-y-6">
            {/* Guide Hero Card */}
            <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 text-white p-6 rounded-3xl shadow-sm space-y-3">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-emerald-300" />
                <span className="text-xs font-bold text-emerald-200 uppercase tracking-wider">
                  Citizen Legal &amp; Environmental Handbook
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white">
                EcoGuide: Citizen Environmental Rights &amp; Legal Directives
              </h2>
              <p className="text-xs sm:text-sm text-emerald-100/90 max-w-3xl leading-relaxed">
                Empowering residents with authoritative statutory benchmarks, legal recourse under Indian Environmental Law, and automated AI screening for actionable case prosecution.
              </p>
              <div className="pt-2">
                <button
                  onClick={onOpenAIChat}
                  className="px-4 py-2 bg-white text-emerald-950 font-bold text-xs rounded-xl hover:bg-emerald-50 transition-colors shadow-2xs flex items-center gap-1.5"
                >
                  <Sparkles className="w-4 h-4 text-emerald-700" />
                  Ask EcoGuide AI Legal Copilot
                </button>
              </div>
            </div>

            {/* Constitutional & Statutory Framework */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center font-bold text-sm">
                  <Scale className="w-4 h-4" />
                </div>
                <h4 className="font-bold text-sm text-slate-900">Constitutional Mandate</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  <strong>Article 21</strong> guarantees the Right to Life, interpreted by the Supreme Court to include the fundamental right to a clean, unpolluted environment. <strong>Article 51A(g)</strong> imposes a fundamental duty on every citizen to protect and improve forests, lakes, rivers, and wildlife.
                </p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-800 flex items-center justify-center font-bold text-sm">
                  <Shield className="w-4 h-4" />
                </div>
                <h4 className="font-bold text-sm text-slate-900">Air &amp; Water Acts</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Under the <strong>Air Act 1981 (Section 21)</strong> and <strong>Water Act 1974 (Section 25)</strong>, industrial units must operate pollution control devices without bypass. Violations empower officers to issue Section 31A/33A closure orders and sever electrical connections.
                </p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
                <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-800 flex items-center justify-center font-bold text-sm">
                  <HelpCircle className="w-4 h-4" />
                </div>
                <h4 className="font-bold text-sm text-slate-900">Waste Management Directives</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  <strong>Solid Waste Management Rules 2016</strong> prohibit open garbage and leaf burning, with mandatory National Green Tribunal (NGT) environmental compensation. <strong>Hazardous Waste Rules 2016</strong> mandate licensed TSDF disposal.
                </p>
              </div>
            </div>

            {/* Authoritative CPCB Standards Reference */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs space-y-4">
              <div>
                <h3 className="font-bold text-base text-slate-900">Key Environmental Thresholds (CPCB Benchmarks)</h3>
                <p className="text-xs text-slate-500">When sensor readings or physical emissions exceed these values, an investigation is legally triggered.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <span className="text-[10px] text-slate-500 font-bold uppercase">Air Quality (PM2.5)</span>
                  <div className="font-mono font-black text-rose-700 text-lg">60 µg/m³</div>
                  <p className="text-slate-600 text-[11px]">24-Hour NAAQS average limit. Higher values cause acute lung irritation.</p>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <span className="text-[10px] text-slate-500 font-bold uppercase">Air Quality (SO2)</span>
                  <div className="font-mono font-black text-amber-700 text-lg">80 µg/m³</div>
                  <p className="text-slate-600 text-[11px]">Sulfur dioxide limit; indicator of unauthorized heavy fuel oil or petcoke burning.</p>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <span className="text-[10px] text-slate-500 font-bold uppercase">Inland Surface Water BOD</span>
                  <div className="font-mono font-black text-sky-700 text-lg">3.0 mg/L</div>
                  <p className="text-slate-600 text-[11px]">Biochemical Oxygen Demand ceiling for Class C drinking/fishery water bodies.</p>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <span className="text-[10px] text-slate-500 font-bold uppercase">Residential Night Noise</span>
                  <div className="font-mono font-black text-purple-700 text-lg">45 dB(A)</div>
                  <p className="text-slate-600 text-[11px]">Permissible noise ceiling between 22:00 and 06:00 under Noise Rules 2000.</p>
                </div>
              </div>
            </div>

            {/* Evidence Checklist for Citizens */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs space-y-3">
              <h3 className="font-bold text-base text-slate-900">How to File an Actionable Environmental Report</h3>
              <ul className="space-y-2 text-xs text-slate-700">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Automatic GPS Locking:</strong> EcoSentinel locks your device&apos;s tamper-proof GPS coordinates automatically so officers can navigate directly to the discharge point.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Visual Evidence:</strong> Capture photos showing the emission plume relative to a permanent landmark (factory chimney, road sign, or water culvert).</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Time &amp; Odor Details:</strong> Note specific sensory indicators (e.g. &quot;pungent rotten egg sulfur smell&quot; or &quot;purple chemical dye in stream&quot;) to aid automated AI chemical classification.</span>
                </li>
              </ul>

              <div className="pt-3 border-t border-slate-100 flex justify-end">
                <button
                  onClick={onOpenReportModal}
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-xs shadow-xs flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" /> Open Report Modal
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
