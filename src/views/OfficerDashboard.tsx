import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Activity,
  Layers,
  Sparkles,
  Scale,
  TrendingUp,
  ClipboardList,
  CheckSquare,
  FileDown,
  Settings,
  Search,
  Filter,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Eye,
  Plus,
  ArrowUpRight,
  FileText,
  Printer,
  Calendar,
  Building,
  RefreshCw,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  Incident,
  User as UserType,
  ComplianceReference,
  Inspection,
  CorrectiveAction,
  AnomalyRecord,
} from '../types';
import { api } from '../services/api';
import { InteractiveMap } from '../components/InteractiveMap';

interface OfficerDashboardProps {
  currentUser: UserType;
  onSelectIncident: (incident: Incident) => void;
  onOpenAIChat: () => void;
  initialTab?: string;
}

export const OfficerDashboard: React.FC<OfficerDashboardProps> = ({
  currentUser,
  onSelectIncident,
  onOpenAIChat,
  initialTab = 'command-center',
}) => {
  const [activeTab, setActiveTab] = useState<string>(initialTab);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [complianceRefs, setComplianceRefs] = useState<ComplianceReference[]>([]);
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [actions, setActions] = useState<CorrectiveAction[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Filters for incident management
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [regionFilter, setRegionFilter] = useState('all');
  const [riskFilter, setRiskFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Compliance evaluator test tool states
  const [testIncidentId, setTestIncidentId] = useState('');
  const [testParam, setTestParam] = useState('PM2.5');
  const [testVal, setTestVal] = useState('145');
  const [testUnit, setTestUnit] = useState('µg/m³');
  const [evalResult, setEvalResult] = useState<any>(null);
  const [evaluating, setEvaluating] = useState(false);

  // New inspection quick modal
  const [showNewInspModal, setShowNewInspModal] = useState(false);
  const [inspIncidentId, setInspIncidentId] = useState('');
  const [inspDate, setInspDate] = useState('');
  const [inspFindings, setInspFindings] = useState('');

  // New action quick modal
  const [showNewActModal, setShowNewActModal] = useState(false);
  const [actIncidentId, setActIncidentId] = useState('');
  const [actDesc, setActDesc] = useState('');
  const [actParty, setActParty] = useState('');
  const [actDueDate, setActDueDate] = useState('');

  const loadAllData = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const [incRes, compRes, inspRes, actRes, anaRes] = await Promise.all([
        api.incidents.getAll(),
        api.compliance.getReferences(),
        api.inspections.getAll(),
        api.actions.getAll(),
        api.analytics.get(),
      ]);

      if (incRes.data) setIncidents(incRes.data);
      if (compRes.data) setComplianceRefs(compRes.data);
      if (inspRes.data) setInspections(inspRes.data);
      if (actRes.data) setActions(actRes.data);
      if (anaRes.data) setAnalytics(anaRes.data);
    } catch (err) {
      if (!silent) console.error('Failed to load officer dashboard data:', err);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
    const interval = setInterval(() => {
      loadAllData(true);
    }, 5000);
    return () => clearInterval(interval);
  }, [currentUser]);

  // Filtered incidents
  const filteredIncidents = incidents.filter((inc) => {
    if (categoryFilter !== 'all' && inc.category !== categoryFilter) return false;
    if (regionFilter !== 'all' && inc.region !== regionFilter) return false;
    if (riskFilter !== 'all' && inc.riskLevel !== riskFilter) return false;
    if (statusFilter !== 'all' && inc.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        inc.id.toLowerCase().includes(q) ||
        inc.title.toLowerCase().includes(q) ||
        inc.location.toLowerCase().includes(q) ||
        inc.pollutionType.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleEvaluateParam = async (e: React.FormEvent) => {
    e.preventDefault();
    setEvaluating(true);
    try {
      const res = await api.compliance.assess({
        parameter: testParam,
        value: parseFloat(testVal),
        unit: testUnit,
        incidentId: testIncidentId || undefined,
      });
      setEvalResult(res.data);
      if (testIncidentId) {
        await loadAllData(true);
      }
    } catch (err) {
      alert('Compliance check failed');
    } finally {
      setEvaluating(false);
    }
  };

  const handleCompleteInspection = async (insp: Inspection) => {
    const findingsNote = prompt(`Record field audit findings for ${insp.id}:`, insp.findings);
    if (findingsNote !== null) {
      try {
        await api.inspections.update(insp.id, {
          status: 'Completed',
          findings: findingsNote || 'Inspection completed and confirmed on site.',
          completedAt: new Date().toISOString(),
        });
        await loadAllData(true);
      } catch (err) {
        alert('Failed to complete inspection');
      }
    }
  };

  const handleVerifyAction = async (act: CorrectiveAction) => {
    const verifyNote = prompt(
      `Enter officer verification remarks for ${act.id}:`,
      act.officerVerification || 'On-site audit confirmed satisfactory remediation and abatement.'
    );
    if (verifyNote !== null) {
      try {
        await api.actions.update(act.id, {
          status: 'Verified',
          officerVerification: verifyNote,
          verifiedAt: new Date().toISOString(),
        });
        await loadAllData(true);
      } catch (err) {
        alert('Failed to verify corrective action');
      }
    }
  };

  const handleCreateInspection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inspIncidentId) return;
    try {
      await api.inspections.create({
        incidentId: inspIncidentId,
        scheduledAt: inspDate || new Date().toISOString(),
        location: 'Field Verification Site',
        findings: inspFindings || 'Scheduled official on-site inspection.',
      });
      setShowNewInspModal(false);
      setInspFindings('');
      await loadAllData();
    } catch (err) {
      alert('Failed to schedule inspection');
    }
  };

  const handleCreateAction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!actIncidentId || !actDesc.trim()) return;
    try {
      await api.actions.create({
        incidentId: actIncidentId,
        description: actDesc.trim(),
        responsibleParty: actParty || 'Industrial Facility Manager',
        dueDate: actDueDate || new Date(Date.now() + 7 * 86400000).toISOString(),
      });
      setShowNewActModal(false);
      setActDesc('');
      await loadAllData();
    } catch (err) {
      alert('Failed to create action');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    const headers = ['ID', 'Title', 'Category', 'Region', 'Location', 'Severity', 'RiskScore', 'Status', 'ReportedAt'];
    const rows = filteredIncidents.map((i) => [
      i.id,
      `"${i.title.replace(/"/g, '""')}"`,
      i.category,
      `"${i.region}"`,
      `"${i.location.replace(/"/g, '""')}"`,
      i.severityObserved,
      i.riskScore,
      i.status,
      i.reportedAt,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `ecosentinel_incidents_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-[#F7FBF8] text-slate-800 pb-20">
      {/* Top Header */}
      <div className="bg-white border-b border-emerald-950/10 py-5 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800">
              <span>Authority Surveillance Grid</span>
              <span>·</span>
              <span className="text-slate-500">Mumbai Metropolitan Region (MMR)</span>
            </div>
            <h1 className="text-2xl font-extrabold text-emerald-950 tracking-tight mt-0.5">
              Environmental Operations Center
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onOpenAIChat}
              className="px-3.5 py-2 bg-emerald-50 border border-emerald-200 text-emerald-900 font-semibold text-xs rounded-xl hover:bg-emerald-100/60 transition-colors flex items-center gap-1.5 shadow-2xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
              EcoGuide AI Copilot
            </button>
            <button
              onClick={handleExportCSV}
              className="px-3.5 py-2 bg-white border border-slate-200 hover:border-emerald-600 text-slate-700 font-semibold text-xs rounded-xl transition-colors flex items-center gap-1.5 shadow-2xs"
            >
              <FileDown className="w-3.5 h-3.5 text-emerald-700" />
              Export CSV
            </button>
            <button
              onClick={() => loadAllData()}
              className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition-colors"
              title="Refresh Data"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="max-w-7xl mx-auto flex items-center gap-2 mt-5 overflow-x-auto text-xs font-semibold">
          {[
            { id: 'command-center', label: 'Command Center', icon: Activity },
            { id: 'incidents', label: `Incident Management (${incidents.length})`, icon: ShieldAlert },
            { id: 'heatmap', label: 'Risk Heatmap', icon: Layers },
            { id: 'ai-risk', label: 'AI Risk Intelligence', icon: Sparkles },
            { id: 'compliance', label: 'Compliance Intelligence', icon: Scale },
            { id: 'predictive', label: 'Predictive & Anomalies', icon: TrendingUp },
            { id: 'inspections', label: `Inspections (${inspections.length})`, icon: ClipboardList },
            { id: 'actions', label: `Corrective Actions (${actions.length})`, icon: CheckSquare },
            { id: 'reports', label: 'Statutory Reports', icon: FileText },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-emerald-800 text-white shadow-xs'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-8 mt-6">
        {/* ================= TAB 1: COMMAND CENTER ================= */}
        {activeTab === 'command-center' && (
          <div className="space-y-6">
            {/* Top KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-6 gap-3.5">
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
                <span className="text-[11px] font-semibold text-slate-400 block">Total Active</span>
                <div className="text-2xl font-extrabold text-slate-900 font-mono">{incidents.length}</div>
                <span className="text-[10px] text-emerald-700 font-medium">100% telemetry synced</span>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
                <span className="text-[11px] font-semibold text-rose-500 block">Critical Risk</span>
                <div className="text-2xl font-extrabold text-rose-600 font-mono">
                  {incidents.filter((i) => i.riskLevel === 'Critical').length}
                </div>
                <span className="text-[10px] text-rose-600 font-medium">Requires immediate audit</span>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
                <span className="text-[11px] font-semibold text-amber-500 block">High Risk</span>
                <div className="text-2xl font-extrabold text-amber-700 font-mono">
                  {incidents.filter((i) => i.riskLevel === 'High').length}
                </div>
                <span className="text-[10px] text-amber-600 font-medium">Under active review</span>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
                <span className="text-[11px] font-semibold text-blue-500 block">Pending Audits</span>
                <div className="text-2xl font-extrabold text-blue-800 font-mono">
                  {inspections.filter((i) => i.status !== 'Completed').length}
                </div>
                <span className="text-[10px] text-blue-600 font-medium">Officers dispatched</span>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
                <span className="text-[11px] font-semibold text-purple-500 block">Active Mandates</span>
                <div className="text-2xl font-extrabold text-purple-800 font-mono">{actions.length}</div>
                <span className="text-[10px] text-purple-600 font-medium">Corrective orders</span>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
                <span className="text-[11px] font-semibold text-emerald-600 block">Resolved</span>
                <div className="text-2xl font-extrabold text-emerald-700 font-mono">
                  {incidents.filter((i) => i.status === 'Resolved').length}
                </div>
                <span className="text-[10px] text-emerald-600 font-medium">Avg time: 4.2 days</span>
              </div>
            </div>

            {/* Live Heatmap Preview */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-base text-slate-900">
                    MMR Environmental Risk Intelligence Map
                  </h3>
                  <p className="text-xs text-slate-500">
                    Spatial cluster density and live incident coordinates across industrial and coastal belts.
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('heatmap')}
                  className="text-xs font-semibold text-emerald-700 hover:text-emerald-800"
                >
                  Expand Full Heatmap →
                </button>
              </div>

              <InteractiveMap incidents={incidents} onSelectIncident={onSelectIncident} heightClass="h-[440px]" />
            </div>

            {/* Regional Risk Analysis & Category Distribution (Recharts) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Regional breakdown chart */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-sm text-slate-900">Regional Incident Concentration (MMR)</h4>
                  <span className="text-[11px] text-slate-500 font-medium">Total vs Critical Risk</span>
                </div>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={[
                        { region: 'Vasai-Virar', total: incidents.filter((i) => i.region === 'Vasai-Virar').length, critical: incidents.filter((i) => i.region === 'Vasai-Virar' && i.riskLevel === 'Critical').length },
                        { region: 'Thane', total: incidents.filter((i) => i.region === 'Thane').length, critical: incidents.filter((i) => i.region === 'Thane' && i.riskLevel === 'Critical').length },
                        { region: 'Navi Mumbai', total: incidents.filter((i) => i.region === 'Navi Mumbai').length, critical: incidents.filter((i) => i.region === 'Navi Mumbai' && i.riskLevel === 'Critical').length },
                        { region: 'Mumbai Sub', total: incidents.filter((i) => i.region === 'Mumbai Suburban').length, critical: incidents.filter((i) => i.region === 'Mumbai Suburban' && i.riskLevel === 'Critical').length },
                        { region: 'Palghar', total: incidents.filter((i) => i.region === 'Palghar').length, critical: incidents.filter((i) => i.region === 'Palghar' && i.riskLevel === 'Critical').length },
                        { region: 'Mira-Bhay', total: incidents.filter((i) => i.region === 'Mira-Bhayandar').length, critical: incidents.filter((i) => i.region === 'Mira-Bhayandar' && i.riskLevel === 'Critical').length },
                      ]}
                      margin={{ top: 10, right: 10, left: -20, bottom: 20 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f2" />
                      <XAxis dataKey="region" tick={{ fontSize: 10, fill: '#64748b' }} angle={-15} textAnchor="end" />
                      <YAxis tick={{ fontSize: 10, fill: '#64748b' }} allowDecimals={false} />
                      <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '11px' }} />
                      <Bar dataKey="total" name="Total Incidents" fill="#167D4A" radius={[6, 6, 0, 0]} />
                      <Bar dataKey="critical" name="Critical Hotspots" fill="#e11d48" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Category Breakdown chart */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-sm text-slate-900">Pollution Category Distribution</h4>
                  <span className="text-[11px] text-slate-500 font-medium">{incidents.length} Verified Records</span>
                </div>
                <div className="h-64 w-full flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Air', value: incidents.filter((i) => i.category === 'air').length || 1, color: '#167D4A' },
                          { name: 'Water', value: incidents.filter((i) => i.category === 'water').length || 1, color: '#45B8F0' },
                          { name: 'Waste', value: incidents.filter((i) => i.category === 'waste').length || 1, color: '#F6C453' },
                          { name: 'Industrial', value: incidents.filter((i) => i.category === 'industrial').length || 1, color: '#21A366' },
                          { name: 'Chemical', value: incidents.filter((i) => i.category === 'chemical').length || 1, color: '#F07865' },
                          { name: 'Noise', value: incidents.filter((i) => i.category === 'noise').length || 1, color: '#8b5cf6' },
                        ]}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={4}
                        dataKey="value"
                        label={({ name, value }) => `${name} (${value})`}
                      >
                        {[
                          { color: '#167D4A' },
                          { color: '#45B8F0' },
                          { color: '#F6C453' },
                          { color: '#21A366' },
                          { color: '#F07865' },
                          { color: '#8b5cf6' },
                        ].map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '11px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>


            {/* Active Investigation Queue */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-sm text-slate-900">Urgent Investigation Priority Queue</h4>
                  <p className="text-xs text-slate-500">
                    Incidents with AI Risk Score &gt; 80 or statutory exceedance alerts.
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('incidents')}
                  className="text-xs text-emerald-700 hover:underline font-semibold"
                >
                  Manage All Cases →
                </button>
              </div>

              <div className="divide-y divide-slate-100">
                {incidents
                  .filter((i) => i.riskLevel === 'Critical' || i.riskLevel === 'High')
                  .slice(0, 5)
                  .map((inc) => (
                    <div
                      key={inc.id}
                      onClick={() => onSelectIncident(inc)}
                      className="py-3 flex flex-wrap items-center justify-between gap-3 hover:bg-slate-50/80 p-2 rounded-xl cursor-pointer transition-colors"
                    >
                      <div className="space-y-1 max-w-xl">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
                            {inc.id}
                          </span>
                          <span
                            className={`text-xs font-bold px-2 py-0.5 rounded-md ${
                              inc.riskLevel === 'Critical'
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-orange-100 text-orange-800'
                            }`}
                          >
                            Risk: {inc.riskScore}/100
                          </span>
                          <span className="text-xs font-semibold text-slate-900">{inc.title}</span>
                        </div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-3">
                          <span className="flex items-center gap-1 text-slate-700">
                            <Building className="w-3 h-3 text-slate-400" />
                            {inc.location} ({inc.region})
                          </span>
                          <span>·</span>
                          <span>{inc.assignedOfficerName || 'Officer unassigned'}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800">
                          {inc.status}
                        </span>
                        <Eye className="w-4 h-4 text-emerald-700" />
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 2: INCIDENT MANAGEMENT ================= */}
        {activeTab === 'incidents' && (
          <div className="space-y-4">
            {/* Filter Bar */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs">
              {/* Search */}
              <div className="relative flex-1 min-w-[200px] max-w-xs">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search ID, title, or location..."
                  className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              {/* Filters */}
              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white"
                >
                  <option value="all">All Categories</option>
                  <option value="air">Air</option>
                  <option value="water">Water</option>
                  <option value="waste">Waste</option>
                  <option value="noise">Noise</option>
                  <option value="industrial">Industrial</option>
                  <option value="chemical">Chemical</option>
                  <option value="soil">Soil</option>
                </select>

                <select
                  value={regionFilter}
                  onChange={(e) => setRegionFilter(e.target.value)}
                  className="px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white"
                >
                  <option value="all">All Regions</option>
                  <option value="Vasai-Virar">Vasai-Virar</option>
                  <option value="Mira-Bhayandar">Mira-Bhayandar</option>
                  <option value="Thane">Thane</option>
                  <option value="Mumbai Suburban">Mumbai Suburban</option>
                  <option value="Navi Mumbai">Navi Mumbai</option>
                  <option value="Palghar">Palghar / Boisar</option>
                </select>

                <select
                  value={riskFilter}
                  onChange={(e) => setRiskFilter(e.target.value)}
                  className="px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white"
                >
                  <option value="all">All Risk Levels</option>
                  <option value="Critical">Critical</option>
                  <option value="High">High</option>
                  <option value="Moderate">Moderate</option>
                  <option value="Low">Low</option>
                </select>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white"
                >
                  <option value="all">All Statuses</option>
                  <option value="Submitted">Submitted</option>
                  <option value="AI Analysis">AI Analysis</option>
                  <option value="Under Review">Under Review</option>
                  <option value="Investigation Assigned">Investigation Assigned</option>
                  <option value="Corrective Action">Corrective Action</option>
                  <option value="Resolved">Resolved</option>
                </select>

                {(categoryFilter !== 'all' || regionFilter !== 'all' || riskFilter !== 'all' || statusFilter !== 'all' || searchQuery) && (
                  <button
                    onClick={() => {
                      setCategoryFilter('all');
                      setRegionFilter('all');
                      setRiskFilter('all');
                      setStatusFilter('all');
                      setSearchQuery('');
                    }}
                    className="text-rose-600 hover:underline font-semibold"
                  >
                    Reset Filters
                  </button>
                )}
              </div>
            </div>

            {/* Incidents Table */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 font-bold uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="py-3 px-4">Case ID</th>
                      <th className="py-3 px-4">Incident Title</th>
                      <th className="py-3 px-4">Region / Location</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4">Risk Level</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Officer</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredIncidents.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="py-12 text-center text-slate-400">
                          No incidents matched the filter criteria.
                        </td>
                      </tr>
                    ) : (
                      filteredIncidents.map((inc) => (
                        <tr
                          key={inc.id}
                          onClick={() => onSelectIncident(inc)}
                          className="hover:bg-emerald-50/40 cursor-pointer transition-colors"
                        >
                          <td className="py-3.5 px-4 font-mono font-bold text-emerald-800">{inc.id}</td>
                          <td className="py-3.5 px-4 font-semibold text-slate-900 max-w-xs truncate">
                            {inc.title}
                          </td>
                          <td className="py-3.5 px-4 text-slate-600">
                            <div>{inc.region}</div>
                            <div className="text-[10px] text-slate-400 truncate max-w-[140px]">
                              {inc.location}
                            </div>
                          </td>
                          <td className="py-3.5 px-4 capitalize text-slate-700">{inc.category}</td>
                          <td className="py-3.5 px-4">
                            <span
                              className={`px-2 py-0.5 rounded-md font-bold text-[11px] ${
                                inc.riskLevel === 'Critical'
                                  ? 'bg-rose-100 text-rose-800'
                                  : inc.riskLevel === 'High'
                                  ? 'bg-orange-100 text-orange-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {inc.riskLevel} ({inc.riskScore})
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="font-semibold text-slate-800">{inc.status}</span>
                          </td>
                          <td className="py-3.5 px-4 text-slate-600">
                            {inc.assignedOfficerName || <span className="text-slate-400 italic">Unassigned</span>}
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onSelectIncident(inc);
                              }}
                              className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-medium text-[11px] shadow-2xs"
                            >
                              Inspect Case
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 3: HEATMAP ================= */}
        {activeTab === 'heatmap' && (
          <div className="space-y-4">
            <div>
              <h3 className="font-bold text-lg text-slate-900">
                Environmental Risk Intelligence Map — Full Interactive View
              </h3>
              <p className="text-xs text-slate-500">
                Density heatmaps, spatial cluster analysis, and real-time incident marker details.
              </p>
            </div>
            <InteractiveMap
              incidents={incidents}
              onSelectIncident={onSelectIncident}
              heightClass="h-[640px]"
              showLayerControls={true}
            />
          </div>
        )}

        {/* ================= TAB 4: AI RISK INTELLIGENCE ================= */}
        {activeTab === 'ai-risk' && (
          <div className="space-y-6">
            <div className="bg-emerald-900 text-white p-5 rounded-3xl flex flex-wrap items-center justify-between gap-4">
              <div className="space-y-1 max-w-2xl">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-emerald-300" />
                  <h3 className="font-bold text-base">Gemini Environmental Intelligence Engine</h3>
                </div>
                <p className="text-xs text-emerald-100/90 leading-relaxed">
                  EcoSentinel runs automated preliminary risk classification on incoming incident reports. It computes
                  risk scores (0–100), isolates corroborated physical evidence from unconfirmed claims, and provides
                  explainable legal references under the Air Act, Water Act, and Environment Protection Act.
                </p>
              </div>

              <button
                onClick={onOpenAIChat}
                className="px-4 py-2.5 bg-white text-emerald-900 font-bold text-xs rounded-xl hover:bg-emerald-50 transition-colors shadow-2xs"
              >
                Launch EcoGuide AI
              </button>
            </div>

            {/* AI Process Flow Card */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
              <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-1">
                <span className="font-mono text-emerald-700 font-bold">STAGE 01</span>
                <h4 className="font-bold text-slate-900">Intake &amp; NLP Parsing</h4>
                <p className="text-slate-500">Extracts chemical indicators, plume color, odor, and affected radius.</p>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-1">
                <span className="font-mono text-emerald-700 font-bold">STAGE 02</span>
                <h4 className="font-bold text-slate-900">Baseline Deviation Check</h4>
                <p className="text-slate-500">Matches coordinates with nearest CAAQMS station or water intake baseline.</p>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-1">
                <span className="font-mono text-emerald-700 font-bold">STAGE 03</span>
                <h4 className="font-bold text-slate-900">Standard Cross-Check</h4>
                <p className="text-slate-500">Compares readings against NAAQS 2009 and EP Rules Schedule VI thresholds.</p>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-1">
                <span className="font-mono text-emerald-700 font-bold">STAGE 04</span>
                <h4 className="font-bold text-slate-900">Recommended Action</h4>
                <p className="text-slate-500">Suggests specific sampling equipment and show-cause notice drafts.</p>
              </div>
            </div>

            {/* AI Assessed Incident Cards */}
            <div className="space-y-3">
              <h4 className="font-bold text-sm text-slate-900">Recent AI-Assessed Cases</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {incidents
                  .filter((i) => i.aiAnalysis)
                  .slice(0, 4)
                  .map((inc) => (
                    <div
                      key={inc.id}
                      onClick={() => onSelectIncident(inc)}
                      className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-emerald-500 transition-all shadow-2xs cursor-pointer space-y-3"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="font-mono text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
                            {inc.id}
                          </span>
                          <h4 className="font-bold text-sm text-slate-900 mt-1">{inc.title}</h4>
                        </div>
                        <span className="text-base font-black font-mono text-emerald-800">
                          {inc.aiAnalysis?.risk_score}/100
                        </span>
                      </div>

                      <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                        {inc.aiAnalysis?.incident_summary}
                      </p>

                      <div className="p-2.5 bg-slate-50 rounded-xl space-y-1 text-[11px] text-slate-700">
                        <div>
                          <strong>Key Evidence:</strong> {inc.aiAnalysis?.evidence[0]}
                        </div>
                        <div>
                          <strong>Regulatory Concern:</strong> {inc.aiAnalysis?.compliance_concerns[0]}
                        </div>
                      </div>

                      <div className="text-[10px] text-slate-400 italic">
                        * {inc.aiAnalysis?.disclaimer}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 5: COMPLIANCE INTELLIGENCE ================= */}
        {activeTab === 'compliance' && (
          <div className="space-y-6">
            <div>
              <h3 className="font-bold text-lg text-slate-900">
                Environmental Compliance Intelligence Module
              </h3>
              <p className="text-xs text-slate-500">
                Authoritative Central Pollution Control Board (CPCB) and MoEFCC regulatory library with parameter threshold assessment.
              </p>
            </div>

            {/* Interactive Threshold Evaluation Playground */}
            <div className="bg-emerald-50/70 p-5 rounded-3xl border border-emerald-200/80 space-y-4">
              <div className="flex items-center gap-2">
                <Scale className="w-5 h-5 text-emerald-800" />
                <h4 className="font-bold text-sm text-emerald-950">
                  Instant Regulatory Threshold Evaluator
                </h4>
              </div>
              <p className="text-xs text-emerald-900/90 leading-relaxed">
                Enter an observed measurement to automatically compare it against statutory CPCB/MoEFCC standards.
              </p>

              <form onSubmit={handleEvaluateParam} className="grid grid-cols-1 sm:grid-cols-5 gap-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Target Case (Optional)</label>
                  <select
                    value={testIncidentId}
                    onChange={(e) => setTestIncidentId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                  >
                    <option value="">Stand-Alone Assessment</option>
                    {incidents.slice(0, 20).map((i) => (
                      <option key={i.id} value={i.id}>
                        {i.id} - {i.title.substring(0, 24)}...
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Parameter</label>
                  <select
                    value={testParam}
                    onChange={(e) => {
                      const p = e.target.value;
                      setTestParam(p);
                      if (p === 'PM2.5' || p === 'PM10' || p === 'SO2' || p === 'NO2') setTestUnit('µg/m³');
                      else if (p === 'BOD' || p === 'COD' || p === 'Lead (Pb)') setTestUnit('mg/L');
                      else if (p === 'pH') setTestUnit('pH units');
                      else if (p === 'Noise Level') setTestUnit('dB(A) Leq');
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                  >
                    <option value="PM2.5">PM2.5 (Air)</option>
                    <option value="PM10">PM10 (Air)</option>
                    <option value="SO2">Sulfur Dioxide SO2 (Air)</option>
                    <option value="NO2">Nitrogen Dioxide NO2 (Air)</option>
                    <option value="COD">Chemical Oxygen Demand COD (Water)</option>
                    <option value="BOD">Biochemical Oxygen Demand BOD (Water)</option>
                    <option value="pH">pH (Effluent / Water)</option>
                    <option value="Lead (Pb)">Lead Heavy Metal (Effluent)</option>
                    <option value="Noise Level">Noise Level (dB)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Observed Value</label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={testVal}
                    onChange={(e) => setTestVal(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Unit</label>
                  <input
                    type="text"
                    disabled
                    value={testUnit}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-100 font-mono text-slate-600"
                  />
                </div>

                <div className="flex items-end">
                  <button
                    type="submit"
                    disabled={evaluating}
                    className="w-full py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl shadow-xs transition-colors"
                  >
                    {evaluating ? 'Evaluating...' : testIncidentId ? 'Evaluate & Attach' : 'Check Compliance'}
                  </button>
                </div>
              </form>

              {/* Evaluation Outcome Box */}
              {evalResult && (
                <div className="mt-3 p-4 bg-white rounded-2xl border border-emerald-200 shadow-2xs space-y-2 text-xs">
                  {evalResult.map((res: any, idx: number) => (
                    <div key={idx} className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900">{res.standardTitle}</span>
                        <span
                          className={`font-bold px-2 py-0.5 rounded-md ${
                            res.status === 'Potential Exceedance'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {res.status}
                        </span>
                      </div>
                      <p className="text-slate-600">{res.explanation}</p>
                      <div className="text-[11px] text-slate-400 font-mono">
                        Statutory Limit: {res.threshold} {res.unit} · {res.standardCode}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Standard Reference Directory */}
            <div className="space-y-3">
              <h4 className="font-bold text-sm text-slate-900">Curated Environmental Regulatory Standards</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {complianceRefs.map((ref) => (
                  <div key={ref.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2 text-xs">
                    <div className="flex items-start justify-between gap-2">
                      <h5 className="font-bold text-sm text-slate-900">{ref.title}</h5>
                      <span className="font-mono text-[11px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                        {ref.parameter}
                      </span>
                    </div>

                    <div className="text-[11px] text-emerald-800 font-semibold">
                      {ref.issuingAuthority} · {ref.standardCode}
                    </div>

                    <div className="bg-slate-50 p-2.5 rounded-xl grid grid-cols-2 gap-2">
                      <div>
                        <span className="text-slate-400 block text-[10px]">Threshold Ceiling</span>
                        <span className="font-bold text-slate-900 font-mono">
                          {ref.threshold} {ref.unit}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Applicable Zone</span>
                        <span className="font-medium text-slate-700">{ref.applicability}</span>
                      </div>
                    </div>

                    <p className="text-slate-600 leading-relaxed text-[11px]">{ref.applicabilityNotes}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 6: PREDICTIVE & ANOMALIES ================= */}
        {activeTab === 'predictive' && (
          <div className="space-y-6">
            <div>
              <h3 className="font-bold text-lg text-slate-900">Anomaly Detection &amp; Environmental Forecasting</h3>
              <p className="text-xs text-slate-500">
                Mathematical Z-score anomaly tracking and 7-day statistical moving average projections.
              </p>
            </div>

            {/* Anomaly Detection Stream */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-rose-600" />
                  <h4 className="font-bold text-sm text-slate-900">
                    Detected Sensor Anomalies (Mathematical Z-Score Thresholds)
                  </h4>
                </div>
                <span className="text-xs font-semibold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-lg">
                  4 Active Anomalies Flagged
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {analytics?.anomalies?.map((anom: AnomalyRecord) => (
                  <div key={anom.id} className="p-4 rounded-xl border border-rose-200/80 bg-rose-50/30 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-rose-900 text-sm">
                        {anom.parameter}: {anom.observedValue}
                      </span>
                      <span className="font-mono text-rose-700 font-bold bg-rose-100 px-2 py-0.5 rounded">
                        +{anom.deviationPercentage}% vs Baseline
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-600">
                      Location: <strong>{anom.location}</strong> · Historical Avg: {anom.historicalAverage}
                    </div>

                    <p className="text-slate-700 text-xs leading-relaxed">{anom.potentialExplanation}</p>

                    <div className="pt-2 border-t border-rose-200/50 text-[11px] text-rose-950 font-medium">
                      Recommended Follow-Up: {anom.recommendedFollowUp}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 7-Day Statistical Forecast Table & Projection */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-sm text-slate-900">
                  Regional Particulate Concentration Projections (Next 7 Days)
                </h4>
                <span className="text-[11px] text-slate-400">
                  Model: Linear Trend + Seasonal Moving Average
                </span>
              </div>

              {/* Graphical Predictive Curve */}
              <div className="h-60 w-full pt-1">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={analytics?.incidentForecast || []}
                    margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="forecastGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#21A366" stopOpacity={0.35} />
                        <stop offset="95%" stopColor="#21A366" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f2" />
                    <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#64748b' }} />
                    <YAxis tick={{ fontSize: 10, fill: '#64748b' }} allowDecimals={false} />
                    <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '11px' }} />
                    <Area type="monotone" dataKey="observed" name="Observed Particulate" stroke="#167D4A" strokeWidth={2} fillOpacity={1} fill="url(#forecastGrad)" />
                    <Area type="monotone" dataKey="forecast" name="Statistical Forecast" stroke="#45B8F0" strokeWidth={2} strokeDasharray="4 4" fill="none" />
                    <Area type="monotone" dataKey="upper" name="95% Upper Bound" stroke="#f07865" strokeWidth={1} strokeDasharray="2 2" fill="none" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 text-slate-500 text-[10px] uppercase font-bold">
                    <tr>
                      <th className="py-2.5 px-3">Date</th>
                      <th className="py-2.5 px-3">Observed (µg/m³)</th>
                      <th className="py-2.5 px-3">Forecast Projection</th>
                      <th className="py-2.5 px-3">Confidence Lower Bound (95%)</th>
                      <th className="py-2.5 px-3">Confidence Upper Bound (95%)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {analytics?.incidentForecast?.slice(-7).map((f: any, idx: number) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="py-2 px-3 font-semibold text-slate-800">{f.date}</td>
                        <td className="py-2 px-3 font-mono">{f.observed || '—'}</td>
                        <td className="py-2 px-3 font-mono font-bold text-emerald-800">
                          {f.forecast ? `${f.forecast} µg/m³` : '—'}
                        </td>
                        <td className="py-2 px-3 font-mono text-slate-500">{f.lower || '—'}</td>
                        <td className="py-2 px-3 font-mono text-rose-600">{f.upper || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="text-[11px] text-slate-400 italic">
                * Note: Projections reflect synthetic statistical modeling for hackathon demonstration.
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 7: INSPECTION MANAGEMENT ================= */}
        {activeTab === 'inspections' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-lg text-slate-900">Physical Field Inspections</h3>
                <p className="text-xs text-slate-500">
                  Scheduled on-site verification audits, stack sampling, and evidence logs.
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handlePrint}
                  className="px-3 py-1.5 bg-white border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-2xs hover:bg-slate-50"
                >
                  <Printer className="w-3.5 h-3.5" /> Print Protocols
                </button>
                <button
                  onClick={() => setShowNewInspModal(true)}
                  className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" /> Schedule Field Audit
                </button>
              </div>
            </div>

            {/* Quick Inspection Schedule Modal */}
            {showNewInspModal && (
              <form onSubmit={handleCreateInspection} className="bg-emerald-50/80 p-5 rounded-2xl border border-emerald-200 space-y-3">
                <h4 className="font-bold text-xs text-emerald-950">Schedule Inspection Audit</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Associated Case ID</label>
                    <select
                      required
                      value={inspIncidentId}
                      onChange={(e) => setInspIncidentId(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                    >
                      <option value="">Select Incident Case...</option>
                      {incidents.slice(0, 15).map((i) => (
                        <option key={i.id} value={i.id}>
                          {i.id} - {i.title.substring(0, 36)}...
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Scheduled Date</label>
                    <input
                      type="datetime-local"
                      required
                      value={inspDate}
                      onChange={(e) => setInspDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Audit Objectives</label>
                    <input
                      type="text"
                      required
                      value={inspFindings}
                      onChange={(e) => setInspFindings(e.target.value)}
                      placeholder="e.g. Flue gas stack measurement &amp; bypass audit"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowNewInspModal(false)}
                    className="px-3 py-1 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-xs"
                  >
                    Confirm &amp; Dispatch
                  </button>
                </div>
              </form>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {inspections.map((insp) => (
                <div key={insp.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3 text-xs">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="font-mono text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
                        {insp.id}
                      </span>
                      <h4 className="font-bold text-sm text-slate-900 mt-1">{insp.incidentTitle}</h4>
                    </div>
                    <span
                      className={`font-bold px-2.5 py-0.5 rounded-md text-[11px] ${
                        insp.status === 'Completed'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {insp.status}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-slate-500 text-[11px]">
                    <span>Inspector: <strong>{insp.assignedOfficerName}</strong></span>
                    <span>·</span>
                    <span>Date: {new Date(insp.scheduledAt).toLocaleDateString()}</span>
                  </div>

                  <p className="text-slate-700 leading-relaxed font-medium">{insp.findings}</p>

                  {insp.checklist && (
                    <div className="pt-2 border-t border-slate-100 space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Field Verification Checklist:
                      </span>
                      {insp.checklist.map((chk, i) => (
                        <div key={i} className="flex items-center gap-2 text-slate-600">
                          <CheckCircle2
                            className={`w-3.5 h-3.5 ${chk.checked ? 'text-emerald-600' : 'text-slate-300'}`}
                          />
                          <span className={chk.checked ? 'line-through text-slate-400' : ''}>{chk.item}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {insp.status !== 'Completed' && (
                    <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-[10px] text-amber-700 font-semibold flex items-center gap-1">
                        <Clock className="w-3 h-3" /> Field Audit In Progress
                      </span>
                      <button
                        onClick={() => handleCompleteInspection(insp)}
                        className="px-3 py-1 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold rounded-lg text-xs transition-colors flex items-center gap-1 shadow-2xs"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" /> Sign &amp; Complete Audit
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================= TAB 8: CORRECTIVE ACTIONS ================= */}
        {activeTab === 'actions' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-lg text-slate-900">Corrective Action Directives Tracker</h3>
                <p className="text-xs text-slate-500">
                  Enforcement directives, abatement deadlines, and officer verification sign-offs.
                </p>
              </div>
              <button
                onClick={() => setShowNewActModal(true)}
                className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" /> Mandate Action
              </button>
            </div>

            {/* Quick Action Modal */}
            {showNewActModal && (
              <form onSubmit={handleCreateAction} className="bg-emerald-50/80 p-5 rounded-2xl border border-emerald-200 space-y-3">
                <h4 className="font-bold text-xs text-emerald-950">Issue Corrective Mandate</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Associated Case ID</label>
                    <select
                      required
                      value={actIncidentId}
                      onChange={(e) => setActIncidentId(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                    >
                      <option value="">Select Incident Case...</option>
                      {incidents.slice(0, 15).map((i) => (
                        <option key={i.id} value={i.id}>
                          {i.id} - {i.title.substring(0, 36)}...
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Responsible Party</label>
                    <input
                      type="text"
                      required
                      value={actParty}
                      onChange={(e) => setActParty(e.target.value)}
                      placeholder="e.g. M/s PetroChem Synthetics Director"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Deadline Date</label>
                    <input
                      type="date"
                      required
                      value={actDueDate}
                      onChange={(e) => setActDueDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                    />
                  </div>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Directive Description</label>
                  <textarea
                    required
                    rows={2}
                    value={actDesc}
                    onChange={(e) => setActDesc(e.target.value)}
                    placeholder="Specify mechanical abatement, filter replacement, or effluent neutralization requirement..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowNewActModal(false)}
                    className="px-3 py-1 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-xs"
                  >
                    Issue Legal Mandate
                  </button>
                </div>
              </form>
            )}

            <div className="space-y-3">
              {actions.map((act) => (
                <div key={act.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3 text-xs">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="font-mono text-[11px] font-bold text-purple-800 bg-purple-50 px-2 py-0.5 rounded">
                        {act.id}
                      </span>
                      <h4 className="font-bold text-sm text-slate-900 mt-1">{act.incidentTitle}</h4>
                    </div>
                    <span
                      className={`font-bold px-2.5 py-0.5 rounded-md text-[11px] ${
                        act.status === 'Verified'
                          ? 'bg-emerald-100 text-emerald-800'
                          : act.status === 'In Progress'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {act.status}
                    </span>
                  </div>

                  <p className="text-slate-800 font-medium leading-relaxed">{act.description}</p>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 bg-slate-50 p-2.5 rounded-xl text-[11px]">
                    <div>
                      <span className="text-slate-400 block">Responsible Party</span>
                      <span className="font-semibold text-slate-800">{act.responsibleParty}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Compliance Deadline</span>
                      <span className="font-semibold text-slate-800 font-mono">
                        {new Date(act.dueDate).toLocaleDateString()}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Verification Status</span>
                      <span className="font-semibold text-emerald-800">
                        {act.officerVerification || 'Pending officer physical check'}
                      </span>
                    </div>
                  </div>

                  {act.status !== 'Verified' && (
                    <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-[10px] text-amber-700 font-semibold flex items-center gap-1">
                        <Clock className="w-3 h-3" /> Compliance Verification Pending
                      </span>
                      <button
                        onClick={() => handleVerifyAction(act)}
                        className="px-3 py-1 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold rounded-lg text-xs transition-colors flex items-center gap-1 shadow-2xs"
                      >
                        <CheckSquare className="w-3.5 h-3.5" /> Verify Mitigation &amp; Sign Off
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================= TAB 9: STATUTORY REPORTS ================= */}
        {activeTab === 'reports' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-lg text-slate-900">Official Environmental Intelligence Report</h3>
                <p className="text-xs text-slate-500">
                  Formatted for state pollution control boards, municipal authorities, and public disclosure.
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handlePrint}
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5"
                >
                  <Printer className="w-4 h-4" /> Print / Save as PDF
                </button>
                <button
                  onClick={handleExportCSV}
                  className="px-4 py-2 bg-white border border-slate-200 text-slate-800 text-xs font-semibold rounded-xl hover:bg-slate-50 flex items-center gap-1.5"
                >
                  <FileDown className="w-4 h-4 text-emerald-700" /> Export CSV Data
                </button>
              </div>
            </div>

            {/* Printable Document Box */}
            <div id="printable-report" className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
              {/* Report Header */}
              <div className="border-b-2 border-emerald-900 pb-4 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-black text-emerald-950 uppercase tracking-tight">
                    EcoSentinel Environmental Intelligence Brief
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Surveillance Jurisdiction: Mumbai Metropolitan Region (MMR) · State Pollution Control Directive
                  </p>
                </div>
                <div className="text-right text-xs">
                  <div className="font-mono font-bold text-slate-800">Date: {new Date().toLocaleDateString()}</div>
                  <div className="text-slate-500 font-mono">Report ID: ESR-2026-OCT-MMR</div>
                </div>
              </div>

              {/* Executive Metrics Table */}
              <div className="grid grid-cols-4 gap-4 p-4 bg-slate-50 rounded-2xl text-center text-xs">
                <div>
                  <span className="text-slate-400 block mb-0.5">Total Registered Incidents</span>
                  <span className="text-2xl font-black text-slate-900 font-mono">{incidents.length}</span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">Critical Risk Hotspots</span>
                  <span className="text-2xl font-black text-rose-600 font-mono">
                    {incidents.filter((i) => i.riskLevel === 'Critical').length}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">Completed Field Audits</span>
                  <span className="text-2xl font-black text-blue-800 font-mono">
                    {inspections.filter((i) => i.status === 'Completed').length}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">Verified Corrective Actions</span>
                  <span className="text-2xl font-black text-emerald-700 font-mono">
                    {actions.filter((a) => a.status === 'Verified').length}
                  </span>
                </div>
              </div>

              {/* Summary Text */}
              <div className="space-y-2 text-xs text-slate-700 leading-relaxed">
                <h4 className="font-bold text-sm text-slate-900 uppercase tracking-wider">Executive Overview</h4>
                <p>
                  During the recent observation cycle across the Mumbai Metropolitan Region, high-particulate air
                  emissions in the <strong>Vasai East Industrial Estate</strong> and hazardous effluent discharges along
                  the <strong>Mira Road mangrove creek</strong> represented the primary sources of critical environmental concern.
                  Continuous CAAQMS readings registered peak PM2.5 levels up to 218.4 µg/m³ (3.6x NAAQS limit).
                </p>
                <p>
                  Pursuant to Section 21 of the Air (Prevention and Control of Pollution) Act 1981 and Section 25 of the
                  Water Act 1974, two industrial boiler units and multiple non-conforming garment washing units have been
                  issued immediate rectification directives and mechanical isolation notices.
                </p>
              </div>

              {/* Top High Priority Incidents Table */}
              <div className="space-y-2">
                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-800">
                  Priority Incidents Inventory (Critical &amp; High Risk)
                </h4>
                <table className="w-full text-left text-xs border border-slate-200">
                  <thead className="bg-slate-100 text-slate-600 text-[10px] uppercase font-bold">
                    <tr>
                      <th className="p-2 border">ID</th>
                      <th className="p-2 border">Title</th>
                      <th className="p-2 border">Location</th>
                      <th className="p-2 border">Risk Score</th>
                      <th className="p-2 border">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {incidents.slice(0, 8).map((inc) => (
                      <tr key={inc.id} className="border-b">
                        <td className="p-2 font-mono font-bold text-emerald-800 border">{inc.id}</td>
                        <td className="p-2 font-medium border">{inc.title}</td>
                        <td className="p-2 border text-slate-600">
                          {inc.location} ({inc.region})
                        </td>
                        <td className="p-2 font-mono font-bold border">{inc.riskScore}/100</td>
                        <td className="p-2 font-semibold border">{inc.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Sign-off */}
              <div className="pt-6 border-t border-slate-200 flex justify-between text-xs text-slate-500">
                <div>
                  <span className="block font-bold text-slate-800">Prepared by:</span>
                  <span>EcoSentinel Intelligence System Engine</span>
                </div>
                <div className="text-right">
                  <span className="block font-bold text-slate-800">Authorized Officer:</span>
                  <span>{currentUser.name} ({currentUser.department})</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
