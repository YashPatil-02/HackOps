import React, { useState, useEffect } from 'react';
import {
  X,
  ShieldAlert,
  MapPin,
  Calendar,
  UserCheck,
  Sparkles,
  FileCheck,
  AlertOctagon,
  ArrowRight,
  ClipboardList,
  CheckCircle2,
  Clock,
  Send,
  RefreshCw,
  Plus,
  Scale,
} from 'lucide-react';
import { Incident, User, IncidentStatus, EnvironmentalObservation, Inspection, CorrectiveAction } from '../types';
import { api } from '../services/api';

interface IncidentDetailModalProps {
  incidentId: string | null;
  onClose: () => void;
  currentUser: User | null;
  onIncidentUpdated: () => void;
}

export const IncidentDetailModal: React.FC<IncidentDetailModalProps> = ({
  incidentId,
  onClose,
  currentUser,
  onIncidentUpdated,
}) => {
  const [incident, setIncident] = useState<
    | (Incident & {
        observations: EnvironmentalObservation[];
        inspections: Inspection[];
        actions: CorrectiveAction[];
        auditLogs: any[];
      })
    | null
  >(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'ai' | 'compliance' | 'inspections' | 'actions' | 'timeline'>(
    'overview'
  );
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [reanalyzing, setReanalyzing] = useState(false);

  // New inspection form states
  const [showNewInsp, setShowNewInsp] = useState(false);
  const [inspDate, setInspDate] = useState('');
  const [inspFindings, setInspFindings] = useState('');

  // New action form states
  const [showNewAct, setShowNewAct] = useState(false);
  const [actDesc, setActDesc] = useState('');
  const [actParty, setActParty] = useState('');
  const [actDueDate, setActDueDate] = useState('');

  const isOfficerOrAdmin = currentUser?.role === 'officer' || currentUser?.role === 'admin';

  const loadData = async () => {
    if (!incidentId) return;
    setLoading(true);
    try {
      const res = await api.incidents.getById(incidentId);
      if (res.data) setIncident(res.data);
    } catch (err) {
      console.error('Failed to load incident detail:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [incidentId]);

  if (!incidentId) return null;

  const handleUpdateStatus = async (newStatus: IncidentStatus) => {
    if (!incident) return;
    setStatusUpdating(true);
    try {
      await api.incidents.updateStatus(incident.id, newStatus, `Status updated to ${newStatus} by ${currentUser?.name}`);
      await loadData();
      onIncidentUpdated();
    } catch (err) {
      alert('Failed to update status');
    } finally {
      setStatusUpdating(false);
    }
  };

  const handleReanalyze = async () => {
    if (!incident) return;
    setReanalyzing(true);
    try {
      await api.incidents.reAnalyze(incident.id);
      await loadData();
      onIncidentUpdated();
    } catch (err) {
      alert('Failed to re-run AI assessment');
    } finally {
      setReanalyzing(false);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!incident || !commentText.trim()) return;
    try {
      await api.incidents.addComment(incident.id, commentText.trim());
      setCommentText('');
      await loadData();
      onIncidentUpdated();
    } catch (err) {
      alert('Failed to post comment');
    }
  };

  const handleCreateInspection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!incident) return;
    try {
      await api.inspections.create({
        incidentId: incident.id,
        scheduledAt: inspDate || new Date().toISOString(),
        location: incident.location,
        findings: inspFindings || 'Official field verification scheduled.',
      });
      setShowNewInsp(false);
      setInspFindings('');
      await loadData();
      onIncidentUpdated();
    } catch (err) {
      alert('Failed to create inspection');
    }
  };

  const handleCreateAction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!incident || !actDesc.trim()) return;
    try {
      await api.actions.create({
        incidentId: incident.id,
        description: actDesc.trim(),
        responsibleParty: actParty || 'Facility Operator',
        dueDate: actDueDate || new Date(Date.now() + 7 * 86400000).toISOString(),
      });
      setShowNewAct(false);
      setActDesc('');
      await loadData();
      onIncidentUpdated();
    } catch (err) {
      alert('Failed to create corrective action');
    }
  };

  const getStatusBadge = (status: IncidentStatus) => {
    const map: Record<IncidentStatus, string> = {
      Submitted: 'bg-slate-100 text-slate-800 border-slate-200',
      'AI Analysis': 'bg-emerald-50 text-emerald-800 border-emerald-200',
      'Under Review': 'bg-blue-50 text-blue-800 border-blue-200',
      'Investigation Assigned': 'bg-amber-50 text-amber-900 border-amber-200',
      'Corrective Action': 'bg-purple-50 text-purple-900 border-purple-200',
      Resolved: 'bg-emerald-100 text-emerald-900 border-emerald-300',
      Rejected: 'bg-rose-50 text-rose-800 border-rose-200',
    };
    return (
      <span className={`px-2.5 py-1 text-xs font-bold rounded-lg border ${map[status] || 'bg-slate-100 text-slate-800'}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden">
        {/* Top Header */}
        <div className="bg-emerald-900 text-white p-5 flex flex-wrap items-center justify-between gap-3 border-b border-emerald-800">
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs font-extrabold bg-emerald-800 text-emerald-200 px-2.5 py-1 rounded-md">
              {incident?.id}
            </span>
            {incident && getStatusBadge(incident.status)}
            <span
              className={`text-xs font-bold px-2 py-0.5 rounded-md ${
                incident?.riskLevel === 'Critical'
                  ? 'bg-rose-600 text-white'
                  : incident?.riskLevel === 'High'
                  ? 'bg-orange-500 text-white'
                  : 'bg-amber-400 text-slate-900'
              }`}
            >
              Risk: {incident?.riskScore}/100 ({incident?.riskLevel})
            </span>
          </div>

          <div className="flex items-center gap-2">
            {isOfficerOrAdmin && (
              <button
                onClick={handleReanalyze}
                disabled={reanalyzing}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-800 hover:bg-emerald-700 text-emerald-100 text-xs font-medium rounded-lg transition-colors"
                title="Re-run Gemini Assessment"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${reanalyzing ? 'animate-spin' : ''}`} />
                <span>Re-Analyze with AI</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-emerald-800/80 hover:bg-emerald-700 flex items-center justify-center text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Incident Summary Kicker */}
        {incident && (
          <div className="px-6 py-4 bg-slate-50 border-b border-slate-200">
            <h2 className="text-lg font-bold text-slate-900 leading-snug">{incident.title}</h2>
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 mt-1.5">
              <span className="flex items-center gap-1 text-slate-700 font-medium">
                <MapPin className="w-3.5 h-3.5 text-emerald-700" />
                {incident.location} ({incident.region})
              </span>
              <span>·</span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                Reported {new Date(incident.reportedAt).toLocaleDateString()} at{' '}
                {new Date(incident.reportedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
              <span>·</span>
              <span className="flex items-center gap-1">
                <UserCheck className="w-3.5 h-3.5" />
                Reported by {incident.reporterName}
              </span>
              {incident.assignedOfficerName && (
                <>
                  <span>·</span>
                  <span className="text-emerald-800 font-semibold">
                    Assigned: {incident.assignedOfficerName}
                  </span>
                </>
              )}
            </div>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="px-6 border-b border-slate-200 flex items-center gap-1 bg-white overflow-x-auto text-xs font-medium">
          {[
            { id: 'overview', label: 'Overview & Evidence' },
            { id: 'ai', label: 'AI Risk Intelligence' },
            { id: 'compliance', label: 'Compliance References' },
            { id: 'inspections', label: `Inspections (${incident?.inspections?.length || 0})` },
            { id: 'actions', label: `Corrective Actions (${incident?.actions?.length || 0})` },
            { id: 'timeline', label: 'Audit Trail & Comments' },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as any)}
              className={`py-3 px-3.5 border-b-2 transition-all whitespace-nowrap ${
                activeTab === t.id
                  ? 'border-emerald-700 text-emerald-900 font-bold'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab Content Body */}
        <div className="p-6 flex-1 overflow-y-auto space-y-5 bg-[#fbfdfc]">
          {loading ? (
            <div className="py-16 text-center text-xs text-slate-400">Loading incident data...</div>
          ) : !incident ? (
            <div className="py-16 text-center text-xs text-rose-500">Incident could not be found.</div>
          ) : (
            <>
              {/* TAB 1: OVERVIEW */}
              {activeTab === 'overview' && (
                <div className="space-y-5">
                  {/* Officer Action Bar */}
                  {isOfficerOrAdmin && (
                    <div className="bg-emerald-50/70 p-4 rounded-2xl border border-emerald-200/80 flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <div className="text-xs font-bold text-emerald-950">Officer Workflow Action</div>
                        <div className="text-[11px] text-emerald-800">
                          Update the legal status of this incident across public and authority dashboards.
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-1.5">
                        {(
                          ['Under Review', 'Investigation Assigned', 'Corrective Action', 'Resolved'] as IncidentStatus[]
                        ).map((st) => (
                          <button
                            key={st}
                            disabled={statusUpdating || incident.status === st}
                            onClick={() => handleUpdateStatus(st)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shadow-2xs ${
                              incident.status === st
                                ? 'bg-emerald-800 text-white'
                                : 'bg-white border border-emerald-300 text-emerald-900 hover:bg-emerald-100'
                            }`}
                          >
                            Mark {st}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Description Box */}
                  <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
                    <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                      Reported Concern &amp; Observations
                    </h3>
                    <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line">
                      {incident.description}
                    </p>
                  </div>

                  {/* Evidence Image Attachment */}
                  {incident.evidenceUrl && (
                    <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
                      <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                        Attached Photographic Evidence
                      </h3>
                      <div className="max-w-md rounded-xl overflow-hidden border border-slate-200">
                        <img
                          src={incident.evidenceUrl}
                          alt={incident.evidenceName || 'Incident Evidence'}
                          className="w-full h-56 object-cover"
                        />
                        <div className="p-2 bg-slate-50 text-[11px] text-slate-600 font-mono">
                          {incident.evidenceName || 'field_asset.jpg'}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Spatial Telemetry Details */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="bg-white p-3.5 rounded-xl border border-slate-200 text-xs">
                      <span className="text-slate-400 block mb-0.5">Pollution Medium</span>
                      <span className="font-bold text-slate-800 capitalize">{incident.medium}</span>
                    </div>
                    <div className="bg-white p-3.5 rounded-xl border border-slate-200 text-xs">
                      <span className="text-slate-400 block mb-0.5">Latitude / Longitude</span>
                      <span className="font-mono font-medium text-slate-800">
                        {incident.latitude.toFixed(4)}, {incident.longitude.toFixed(4)}
                      </span>
                    </div>
                    <div className="bg-white p-3.5 rounded-xl border border-slate-200 text-xs">
                      <span className="text-slate-400 block mb-0.5">Contact Preference</span>
                      <span className="font-medium text-slate-800">{incident.contactPreference || 'Email'}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: AI RISK INTELLIGENCE */}
              {activeTab === 'ai' && (
                <div className="space-y-4">
                  {incident.aiAnalysis ? (
                    <>
                      {/* Banner */}
                      <div className="bg-emerald-900 text-white p-4 rounded-2xl flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-emerald-300" />
                            <h3 className="font-bold text-sm">AI-Assisted Preliminary Assessment</h3>
                          </div>
                          <p className="text-xs text-emerald-200/90 mt-0.5">
                            Grounded in Central Pollution Control Board (CPCB) standards &amp; MMR environmental records
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-black text-amber-300 font-mono">
                            {incident.aiAnalysis.risk_score}
                            <span className="text-xs text-emerald-300 font-normal">/100</span>
                          </div>
                          <div className="text-[10px] text-emerald-200">
                            Confidence: {incident.aiAnalysis.confidence}%
                          </div>
                        </div>
                      </div>

                      {/* Summary */}
                      <div className="bg-white p-4 rounded-2xl border border-slate-200">
                        <h4 className="text-xs font-bold text-slate-800 mb-1">Executive Summary</h4>
                        <p className="text-xs text-slate-700 leading-relaxed">
                          {incident.aiAnalysis.incident_summary}
                        </p>
                      </div>

                      {/* Evidence vs Missing Information */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-white p-4 rounded-2xl border border-slate-200">
                          <h4 className="text-xs font-bold text-emerald-900 mb-2 flex items-center gap-1.5">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Corroborated Evidence
                          </h4>
                          <ul className="space-y-1.5 text-xs text-slate-700">
                            {incident.aiAnalysis.evidence.map((ev, i) => (
                              <li key={i} className="flex items-start gap-1.5">
                                <span className="text-emerald-600 font-bold">•</span>
                                <span>{ev}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div className="bg-white p-4 rounded-2xl border border-slate-200">
                          <h4 className="text-xs font-bold text-amber-900 mb-2 flex items-center gap-1.5">
                            <AlertOctagon className="w-4 h-4 text-amber-600" /> Information Needed for Legal Conviction
                          </h4>
                          <ul className="space-y-1.5 text-xs text-slate-700">
                            {incident.aiAnalysis.missing_information.map((mi, i) => (
                              <li key={i} className="flex items-start gap-1.5">
                                <span className="text-amber-600 font-bold">•</span>
                                <span>{mi}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      {/* Compliance Concerns & Recommended Next Steps */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-white p-4 rounded-2xl border border-slate-200">
                          <h4 className="text-xs font-bold text-rose-900 mb-2 flex items-center gap-1.5">
                            <Scale className="w-4 h-4 text-rose-600" /> Potential Regulatory Breaches
                          </h4>
                          <ul className="space-y-1.5 text-xs text-slate-700">
                            {incident.aiAnalysis.compliance_concerns.map((cc, i) => (
                              <li key={i} className="flex items-start gap-1.5">
                                <span className="text-rose-600 font-bold">•</span>
                                <span>{cc}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div className="bg-white p-4 rounded-2xl border border-slate-200">
                          <h4 className="text-xs font-bold text-blue-900 mb-2 flex items-center gap-1.5">
                            <ClipboardList className="w-4 h-4 text-blue-600" /> Recommended Officer Protocols
                          </h4>
                          <ul className="space-y-1.5 text-xs text-slate-700">
                            {incident.aiAnalysis.recommended_inspection.map((rec, i) => (
                              <li key={i} className="flex items-start gap-1.5">
                                <span className="text-blue-600 font-bold">•</span>
                                <span>{rec}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      {/* Explanation */}
                      <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs text-slate-600">
                        <span className="font-semibold text-slate-800 block mb-0.5">Rationale:</span>
                        {incident.aiAnalysis.explanation}
                      </div>

                      {/* Disclaimer */}
                      <div className="text-[11px] text-slate-500 italic p-3 bg-amber-50/50 rounded-xl border border-amber-200/60">
                        ⚠️ <strong>Compliance Disclaimer:</strong> {incident.aiAnalysis.disclaimer}
                      </div>
                    </>
                  ) : (
                    <div className="py-12 text-center text-xs text-slate-500">
                      No AI analysis completed yet. Click &quot;Re-Analyze with AI&quot; above.
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: COMPLIANCE REFERENCES */}
              {activeTab === 'compliance' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xs font-bold text-slate-900">Applicable Environmental Standards</h3>
                      <p className="text-[11px] text-slate-500">
                        Evaluated against CPCB, MoEFCC, and NAAQS statutory standards.
                      </p>
                    </div>
                  </div>

                  {incident.complianceFindings && incident.complianceFindings.length > 0 ? (
                    <div className="space-y-2.5">
                      {incident.complianceFindings.map((cf, idx) => (
                        <div
                          key={idx}
                          className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-2"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <div className="font-bold text-xs text-slate-900">{cf.standardTitle}</div>
                              <div className="text-[11px] text-emerald-800 font-medium">
                                {cf.issuingAuthority} · {cf.standardCode}
                              </div>
                            </div>
                            <span
                              className={`text-[11px] font-bold px-2.5 py-0.5 rounded-md ${
                                cf.status === 'Potential Exceedance'
                                  ? 'bg-rose-100 text-rose-800'
                                  : cf.status === 'Within Reference Limit'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {cf.status}
                            </span>
                          </div>

                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 bg-slate-50 p-2.5 rounded-xl text-xs">
                            <div>
                              <span className="text-slate-400 block text-[10px]">Parameter</span>
                              <span className="font-semibold text-slate-800">{cf.parameter}</span>
                            </div>
                            <div>
                              <span className="text-slate-400 block text-[10px]">Observed Value</span>
                              <span className="font-bold text-slate-900">
                                {cf.observedValue} {cf.unit}
                              </span>
                            </div>
                            <div>
                              <span className="text-slate-400 block text-[10px]">Statutory Threshold</span>
                              <span className="font-bold text-emerald-800">
                                {cf.threshold} {cf.unit}
                              </span>
                            </div>
                          </div>

                          <p className="text-xs text-slate-600 leading-relaxed">{cf.explanation}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 text-center text-xs text-slate-500">
                      No automated compliance evaluations attached to this case. Use the Compliance Intelligence
                      module to evaluate field grab samples against the reference library.
                    </div>
                  )}
                </div>
              )}

              {/* TAB 4: INSPECTIONS */}
              {activeTab === 'inspections' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-slate-900">Physical On-Site Inspections</h3>
                    {isOfficerOrAdmin && (
                      <button
                        onClick={() => setShowNewInsp(!showNewInsp)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-lg transition-colors shadow-2xs"
                      >
                        <Plus className="w-3.5 h-3.5" /> Schedule Inspection
                      </button>
                    )}
                  </div>

                  {showNewInsp && (
                    <form onSubmit={handleCreateInspection} className="bg-emerald-50/70 p-4 rounded-2xl border border-emerald-200 space-y-3">
                      <div className="text-xs font-bold text-emerald-950">Schedule Inspection Audit</div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-700 mb-1">Scheduled Date</label>
                          <input
                            type="datetime-local"
                            required
                            value={inspDate}
                            onChange={(e) => setInspDate(e.target.value)}
                            className="w-full text-xs px-3 py-1.5 rounded-lg border border-slate-200 bg-white"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-700 mb-1">Inspection Objectives</label>
                          <input
                            type="text"
                            required
                            value={inspFindings}
                            onChange={(e) => setInspFindings(e.target.value)}
                            placeholder="e.g. Isokinetic stack sampling and boiler fuel audit"
                            className="w-full text-xs px-3 py-1.5 rounded-lg border border-slate-200 bg-white"
                          />
                        </div>
                      </div>
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setShowNewInsp(false)}
                          className="px-3 py-1 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-1 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-lg shadow-2xs"
                        >
                          Confirm Schedule
                        </button>
                      </div>
                    </form>
                  )}

                  {incident.inspections && incident.inspections.length > 0 ? (
                    <div className="space-y-3">
                      {incident.inspections.map((insp) => (
                        <div key={insp.id} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
                          <div className="flex items-start justify-between">
                            <div>
                              <span className="font-mono text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
                                {insp.id}
                              </span>
                              <span className="ml-2 font-semibold text-xs text-slate-800">
                                Assigned Officer: {insp.assignedOfficerName}
                              </span>
                            </div>
                            <span
                              className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${
                                insp.status === 'Completed'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : insp.status === 'In Progress'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {insp.status}
                            </span>
                          </div>

                          <p className="text-xs text-slate-700 mt-2 font-medium">{insp.findings}</p>

                          {/* Checklist */}
                          {insp.checklist && (
                            <div className="mt-3 pt-2.5 border-t border-slate-100 space-y-1.5">
                              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                                Field Audit Checklist:
                              </span>
                              {insp.checklist.map((chk, idx) => (
                                <div key={idx} className="flex items-start gap-2 text-xs text-slate-700">
                                  <CheckCircle2
                                    className={`w-3.5 h-3.5 mt-0.5 ${
                                      chk.checked ? 'text-emerald-600' : 'text-slate-300'
                                    }`}
                                  />
                                  <div>
                                    <span className={chk.checked ? 'line-through text-slate-400' : ''}>{chk.item}</span>
                                    {chk.note && (
                                      <span className="block text-[11px] text-emerald-900 font-medium">
                                        Note: {chk.note}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-8 text-center text-xs text-slate-400 bg-white rounded-2xl border border-slate-200">
                      No on-site inspections scheduled yet.
                    </div>
                  )}
                </div>
              )}

              {/* TAB 5: CORRECTIVE ACTIONS */}
              {activeTab === 'actions' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-slate-900">Mandated Corrective Actions</h3>
                    {isOfficerOrAdmin && (
                      <button
                        onClick={() => setShowNewAct(!showNewAct)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-lg transition-colors shadow-2xs"
                      >
                        <Plus className="w-3.5 h-3.5" /> Mandate Action
                      </button>
                    )}
                  </div>

                  {showNewAct && (
                    <form onSubmit={handleCreateAction} className="bg-emerald-50/70 p-4 rounded-2xl border border-emerald-200 space-y-3">
                      <div className="text-xs font-bold text-emerald-950">Issue Corrective Directive</div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">Action Description</label>
                        <textarea
                          required
                          rows={2}
                          value={actDesc}
                          onChange={(e) => setActDesc(e.target.value)}
                          placeholder="e.g. Install baghouse dust collector and replace boiler fuel with PNG within 7 days"
                          className="w-full text-xs px-3 py-1.5 rounded-lg border border-slate-200 bg-white"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-700 mb-1">Responsible Party</label>
                          <input
                            type="text"
                            value={actParty}
                            onChange={(e) => setActParty(e.target.value)}
                            placeholder="e.g. Facility Director"
                            className="w-full text-xs px-3 py-1.5 rounded-lg border border-slate-200 bg-white"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-700 mb-1">Compliance Deadline</label>
                          <input
                            type="date"
                            value={actDueDate}
                            onChange={(e) => setActDueDate(e.target.value)}
                            className="w-full text-xs px-3 py-1.5 rounded-lg border border-slate-200 bg-white"
                          />
                        </div>
                      </div>
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setShowNewAct(false)}
                          className="px-3 py-1 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-1 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-lg shadow-2xs"
                        >
                          Issue Mandate
                        </button>
                      </div>
                    </form>
                  )}

                  {incident.actions && incident.actions.length > 0 ? (
                    <div className="space-y-3">
                      {incident.actions.map((act) => (
                        <div key={act.id} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
                          <div className="flex items-start justify-between">
                            <div>
                              <span className="font-mono text-[11px] font-bold text-purple-800 bg-purple-50 px-2 py-0.5 rounded">
                                {act.id}
                              </span>
                              <span className="ml-2 font-semibold text-xs text-slate-800">
                                Priority: {act.priority}
                              </span>
                            </div>
                            <span
                              className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${
                                act.status === 'Verified'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : act.status === 'Completed'
                                  ? 'bg-blue-100 text-blue-800'
                                  : act.status === 'In Progress'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-rose-100 text-rose-800'
                              }`}
                            >
                              {act.status}
                            </span>
                          </div>

                          <p className="text-xs text-slate-800 leading-relaxed font-medium">{act.description}</p>

                          <div className="text-[11px] text-slate-500 flex flex-wrap gap-4 pt-2 border-t border-slate-100">
                            <span>Responsible: <strong>{act.responsibleParty}</strong></span>
                            <span>Due Date: <strong>{new Date(act.dueDate).toLocaleDateString()}</strong></span>
                            {act.officerVerification && (
                              <span className="text-emerald-700 font-semibold">
                                ✓ Verified: {act.officerVerification}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-8 text-center text-xs text-slate-400 bg-white rounded-2xl border border-slate-200">
                      No corrective actions registered for this case.
                    </div>
                  )}
                </div>
              )}

              {/* TAB 6: TIMELINE & AUDIT TRAIL */}
              {activeTab === 'timeline' && (
                <div className="space-y-5">
                  {/* Comments section */}
                  <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
                    <h4 className="text-xs font-bold text-slate-800 mb-2">Stakeholder Comments &amp; Follow-Up</h4>
                    <div className="space-y-2.5 max-h-48 overflow-y-auto mb-3">
                      {incident.followUpComments && incident.followUpComments.length > 0 ? (
                        incident.followUpComments.map((comm) => (
                          <div key={comm.id} className="p-2.5 bg-slate-50 rounded-xl text-xs">
                            <div className="flex items-center justify-between text-[11px] font-semibold text-slate-700 mb-1">
                              <span>
                                {comm.userName} ({comm.userRole})
                              </span>
                              <span className="text-slate-400">
                                {new Date(comm.timestamp).toLocaleString()}
                              </span>
                            </div>
                            <p className="text-slate-600">{comm.message}</p>
                          </div>
                        ))
                      ) : (
                        <div className="text-[11px] text-slate-400 italic">No comments yet.</div>
                      )}
                    </div>

                    <form onSubmit={handleAddComment} className="flex gap-2">
                      <input
                        type="text"
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        placeholder="Add a follow-up inquiry, witness report, or note..."
                        className="flex-1 text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                      />
                      <button
                        type="submit"
                        disabled={!commentText.trim()}
                        className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-40 text-white rounded-xl text-xs font-bold transition-colors shadow-2xs"
                      >
                        <Send className="w-3.5 h-3.5" />
                      </button>
                    </form>
                  </div>

                  {/* Formal Audit Trail */}
                  <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">
                      Statutory Audit Trail (Tamper-Evident History)
                    </h4>
                    <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                      {incident.auditLogs &&
                        incident.auditLogs.map((log) => (
                          <div key={log.id} className="relative">
                            <span className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-emerald-600 ring-4 ring-white" />
                            <div className="text-xs">
                              <span className="font-bold text-slate-900">{log.action}</span>
                              <span className="text-slate-400 ml-2">
                                {new Date(log.timestamp).toLocaleString()}
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-600 mt-0.5">
                              Actor: <strong>{log.actorName}</strong> ({log.actorRole})
                              {log.notes && <span className="block text-slate-500 mt-0.5">{log.notes}</span>}
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
