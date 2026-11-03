import React from 'react';
import {
  ShieldAlert,
  MapPin,
  Sparkles,
  Scale,
  ArrowRight,
  Activity,
  Layers,
  FileCheck,
  CheckCircle2,
  Users,
  Compass,
  AlertTriangle,
  Flame,
  ChevronRight,
  TrendingUp,
  ClipboardList,
} from 'lucide-react';
import { User } from '../types';

interface LandingPageProps {
  onNavigate: (view: string) => void;
  onOpenReportModal: () => void;
  onOpenAIChat: () => void;
  currentUser: User | null;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onNavigate,
  onOpenReportModal,
  onOpenAIChat,
  currentUser,
}) => {
  return (
    <div className="min-h-screen bg-[#F7FBF8] text-slate-800">
      {/* Hero Section */}
      <section className="relative pt-12 pb-20 overflow-hidden bg-gradient-to-b from-emerald-50/50 via-[#F7FBF8] to-[#EDF7F1]/40 border-b border-emerald-950/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100/80 border border-emerald-200 text-emerald-900 text-xs font-bold tracking-wide shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
              <span>Next-Generation Environmental Intelligence &amp; Compliance</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-emerald-950 tracking-tight leading-[1.12]">
              See the Risk. Understand the Impact.{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-700 via-teal-600 to-sky-600">
                Take Action.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
              An intelligent environmental monitoring and compliance platform connecting citizens,
              sensor data, and enforcement authorities to turn reported concerns into evidence-backed assessments.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
              <button
                onClick={onOpenReportModal}
                className="px-6 py-3.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm rounded-xl transition-all shadow-md shadow-emerald-700/20 hover:scale-[1.02] flex items-center gap-2"
              >
                <MapPin className="w-4 h-4" />
                Report an Environmental Issue
              </button>

              <button
                onClick={() => onNavigate('officer')}
                className="px-6 py-3.5 bg-white border border-emerald-950/15 hover:border-emerald-700 text-emerald-900 font-bold text-sm rounded-xl transition-all shadow-xs hover:bg-emerald-50/50 flex items-center gap-2"
              >
                <Activity className="w-4 h-4 text-emerald-700" />
                Explore Environmental Intelligence
              </button>
            </div>

            {/* Quick Demo Role Cards */}
            <div className="pt-6 flex flex-wrap items-center justify-center gap-3 text-xs text-slate-500">
              <span className="font-semibold text-slate-700">Quick Demo Access:</span>
              <button
                onClick={() => onNavigate('citizen')}
                className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg hover:border-emerald-600 font-medium text-slate-800 transition-colors shadow-2xs"
              >
                Citizen Hub (Ananya)
              </button>
              <button
                onClick={() => onNavigate('officer')}
                className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg hover:border-emerald-600 font-medium text-slate-800 transition-colors shadow-2xs"
              >
                Officer Command Center (Inspector Deshmukh)
              </button>
              <button
                onClick={() => onNavigate('heatmap')}
                className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg hover:border-emerald-600 font-medium text-slate-800 transition-colors shadow-2xs"
              >
                Spatial Heatmap
              </button>
            </div>
          </div>

          {/* Hero Visual: Dashboard Preview Mockup */}
          <div className="mt-12 max-w-5xl mx-auto rounded-3xl overflow-hidden border border-emerald-950/15 shadow-2xl bg-white p-3 sm:p-5">
            <div className="bg-slate-100/90 rounded-2xl p-4 sm:p-6 space-y-4">
              {/* Header Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-200">
                <div className="flex items-center gap-2.5">
                  <div className="w-3 h-3 rounded-full bg-rose-500" />
                  <div className="w-3 h-3 rounded-full bg-amber-500" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500" />
                  <span className="ml-2 font-mono text-xs font-bold text-slate-600">
                    EcoSentinel // Operations Command Center MMR
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800 bg-emerald-100/60 px-3 py-1 rounded-lg">
                  <span className="w-2 h-2 rounded-full bg-emerald-600 animate-ping" />
                  Live MMR Surveillance Grid
                </div>
              </div>

              {/* Grid Widgets */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Widget 1 */}
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>Critical Stack Emission</span>
                    <span className="font-mono text-rose-600 font-bold">ECO-2026-1001</span>
                  </div>
                  <h4 className="font-bold text-sm text-slate-900 leading-snug">
                    Vasai East Industrial Boiler Plume
                  </h4>
                  <div className="text-xs text-slate-600 flex items-center justify-between pt-1">
                    <span>PM2.5: 218.4 µg/m³</span>
                    <span className="text-rose-700 font-bold bg-rose-50 px-2 py-0.5 rounded">
                      3.6x NAAQS Limit
                    </span>
                  </div>
                  <div className="p-2 bg-emerald-50/70 rounded-lg text-[11px] text-emerald-900 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                    <span>AI Flag: Air Act Section 21 violation indicated</span>
                  </div>
                </div>

                {/* Widget 2 */}
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>Wetland Effluent Influx</span>
                    <span className="font-mono text-orange-600 font-bold">ECO-2026-1002</span>
                  </div>
                  <h4 className="font-bold text-sm text-slate-900 leading-snug">
                    Mira Road Mangrove Dye Discharge
                  </h4>
                  <div className="text-xs text-slate-600 flex items-center justify-between pt-1">
                    <span>COD: 680 mg/L</span>
                    <span className="text-orange-700 font-bold bg-orange-50 px-2 py-0.5 rounded">
                      Statutory Max: 250
                    </span>
                  </div>
                  <div className="p-2 bg-blue-50/70 rounded-lg text-[11px] text-blue-900 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-700 shrink-0" />
                    <span>Action ACT-202: Storm culvert plug sealed</span>
                  </div>
                </div>

                {/* Widget 3 */}
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>Quarry Hazardous Dump</span>
                    <span className="font-mono text-purple-600 font-bold">ECO-2026-1005</span>
                  </div>
                  <h4 className="font-bold text-sm text-slate-900 leading-snug">
                    Taloja 35 Leaking Chemical Drums
                  </h4>
                  <div className="text-xs text-slate-600 flex items-center justify-between pt-1">
                    <span>VOC: 285 µg/m³</span>
                    <span className="text-rose-700 font-bold bg-rose-50 px-2 py-0.5 rounded">
                      Groundwater Threat
                    </span>
                  </div>
                  <div className="p-2 bg-purple-50/70 rounded-lg text-[11px] text-purple-900 flex items-center gap-1.5">
                    <ShieldAlert className="w-3.5 h-3.5 text-purple-700 shrink-0" />
                    <span>Emergency HAZMAT containment assigned</span>
                  </div>
                </div>
              </div>

              {/* Banner Inside Preview */}
              <div className="bg-emerald-900 text-white rounded-xl p-4 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-3">
                  <Layers className="w-5 h-5 text-emerald-300" />
                  <div>
                    <span className="font-bold text-sm">Interactive Spatial Risk Heatmap</span>
                    <p className="text-emerald-200/80 text-[11px]">
                      Covering Vasai-Virar, Mira-Bhayandar, Thane, Mumbai Suburban, Navi Mumbai, &amp; Palghar
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => onNavigate('heatmap')}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 font-bold rounded-lg text-white transition-colors"
                >
                  Open Full Heatmap View
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section C: Live Environmental Overview (Demonstration Stats) */}
      <section className="py-12 bg-white border-b border-emerald-950/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="p-4 rounded-2xl bg-[#F7FBF8] border border-emerald-950/5">
              <div className="text-3xl sm:text-4xl font-extrabold text-emerald-900 font-mono">40+</div>
              <div className="text-xs font-semibold text-slate-600 mt-1">Tracked Incidents in MMR</div>
            </div>
            <div className="p-4 rounded-2xl bg-[#F7FBF8] border border-emerald-950/5">
              <div className="text-3xl sm:text-4xl font-extrabold text-rose-600 font-mono">14</div>
              <div className="text-xs font-semibold text-slate-600 mt-1">High-Risk Industrial Areas</div>
            </div>
            <div className="p-4 rounded-2xl bg-[#F7FBF8] border border-emerald-950/5">
              <div className="text-3xl sm:text-4xl font-extrabold text-teal-700 font-mono">100%</div>
              <div className="text-xs font-semibold text-slate-600 mt-1">CPCB Regulatory Grounding</div>
            </div>
            <div className="p-4 rounded-2xl bg-[#F7FBF8] border border-emerald-950/5">
              <div className="text-3xl sm:text-4xl font-extrabold text-sky-600 font-mono">6 Regions</div>
              <div className="text-xs font-semibold text-slate-600 mt-1">Active Spatial Monitoring</div>
            </div>
          </div>
        </div>
      </section>

      {/* Section A: Environmental Intelligence Explained */}
      <section className="py-20 bg-[#F7FBF8]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-extrabold text-emerald-950 tracking-tight">
              A Connected Environmental Intelligence Engine
            </h2>
            <p className="text-sm text-slate-600 mt-3 leading-relaxed">
              Traditional environmental complaints languish in disconnected silos. EcoSentinel unites
              citizen vigilance, continuous sensors, and regulatory enforcement into one explainable, trackable pipeline.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-7 rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">1. Citizen Observation</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Empowers residents to report odors, smoke plumes, illegal dumping, and creek discoloration
                with geo-coordinates, photos, and time-stamped evidence.
              </p>
            </div>

            <div className="bg-white p-7 rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-teal-100 text-teal-800 flex items-center justify-center">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">2. AI-Assisted Assessment</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Gemini automatically screens reported observations against regional telemetry, separates verified evidence
                from unconfirmed claims, and computes transparent risk scores.
              </p>
            </div>

            <div className="bg-white p-7 rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-sky-100 text-sky-800 flex items-center justify-center">
                <Scale className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">3. Regulatory Action &amp; Closure</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Officers match observations with statutory standards (NAAQS, Water Act, SWM Rules), schedule
                on-site inspections, mandate corrective actions, and track verifiable remediation.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section B: How It Works (6 Steps) */}
      <section className="py-20 bg-white border-y border-emerald-950/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold text-emerald-700 tracking-wider uppercase">End-to-End Lifecycle</span>
            <h2 className="text-3xl font-extrabold text-emerald-950 tracking-tight mt-1">
              How EcoSentinel Resolves Environmental Concerns
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                num: '01',
                title: 'Report Concern',
                desc: 'Citizen enters location, selects medium (air, water, soil, noise), and attaches photos or sensor logs.',
              },
              {
                num: '02',
                title: 'Analyze Evidence',
                desc: 'Server-side Gemini AI extracts chemical context, checks local CAAQMS baselines, and flags anomalies.',
              },
              {
                num: '03',
                title: 'Identify Potential Risks',
                desc: 'System assigns an explainable risk rating (Low, Moderate, High, Critical) with confidence intervals.',
              },
              {
                num: '04',
                title: 'Review Standards',
                desc: 'Checks measurements against statutory CPCB/MoEFCC thresholds (e.g. 60 µg/m³ PM2.5, 250 mg/L COD).',
              },
              {
                num: '05',
                title: 'Assign Corrective Action',
                desc: 'Enforcement officers schedule field audits, issue show-cause notices, and require equipment fixes.',
              },
              {
                num: '06',
                title: 'Track Resolution',
                desc: 'Audit logs record every state transition, verify photographic repair evidence, and close the case.',
              },
            ].map((step) => (
              <div key={step.num} className="p-6 rounded-2xl bg-[#F7FBF8] border border-slate-200/80 space-y-2">
                <span className="font-mono text-2xl font-black text-emerald-700/80">{step.num}</span>
                <h4 className="font-bold text-sm text-slate-900">{step.title}</h4>
                <p className="text-xs text-slate-600 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section D: Core Features */}
      <section className="py-20 bg-[#F7FBF8]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-3xl font-extrabold text-emerald-950 tracking-tight">
              Designed for Public Impact &amp; Regulatory Rigor
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-3">
              <Layers className="w-8 h-8 text-emerald-700" />
              <h4 className="font-bold text-base text-slate-900">Interactive Pollution Heatmaps</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Pan, zoom, and filter across air, water, industrial stack, and waste layers across the Mumbai Metropolitan Region.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-3">
              <Sparkles className="w-8 h-8 text-teal-600" />
              <h4 className="font-bold text-base text-slate-900">EcoGuide AI Assistant</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Gemini-powered chatbot grounded in live database telemetry to answer questions about regional trends and compliance limits.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-3">
              <FileCheck className="w-8 h-8 text-blue-600" />
              <h4 className="font-bold text-base text-slate-900">Statutory Compliance Library</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Curated directory of Central Pollution Control Board standards with automated parameter exceedance comparisons.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-3">
              <TrendingUp className="w-8 h-8 text-indigo-600" />
              <h4 className="font-bold text-base text-slate-900">Predictive Forecasting &amp; Anomalies</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Mathematical Z-score anomaly detection and 7-day statistical moving average forecasting with confidence bands.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-3">
              <ClipboardList className="w-8 h-8 text-amber-600" />
              <h4 className="font-bold text-base text-slate-900">Inspection &amp; Action Management</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Officer schedules, printable inspection protocols, due-date alerts, and tamper-evident audit trails.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-3">
              <Users className="w-8 h-8 text-emerald-800" />
              <h4 className="font-bold text-base text-slate-900">Role-Based Operations</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Tailored workflows for citizens, environmental field officers, and state regulatory administrators.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section E: CTA */}
      <section className="py-20 bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-900 text-white text-center">
        <div className="max-w-4xl mx-auto px-4 space-y-6">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Every observation matters. Every action counts.
          </h2>
          <p className="text-emerald-100 text-sm max-w-xl mx-auto leading-relaxed">
            Join thousands of active citizens and environmental enforcement officers working together
            to safeguard our air, water, and communities.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <button
              onClick={onOpenReportModal}
              className="px-6 py-3 bg-white text-emerald-900 hover:bg-emerald-50 font-bold text-sm rounded-xl transition-all shadow-md"
            >
              Report an Environmental Concern
            </button>
            <button
              onClick={onOpenAIChat}
              className="px-6 py-3 bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-sm rounded-xl transition-all border border-emerald-500/40"
            >
              Consult EcoGuide AI
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
