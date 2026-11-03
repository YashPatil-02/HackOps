export type Role = 'citizen' | 'officer' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  department?: string;
  avatar?: string;
  location?: string;
  createdAt: string;
}

export type PollutionCategory =
  | 'air'
  | 'water'
  | 'industrial'
  | 'waste'
  | 'noise'
  | 'soil'
  | 'chemical'
  | 'other';

export type IncidentSeverity = 'Low' | 'Moderate' | 'High' | 'Critical';

export type IncidentStatus =
  | 'Submitted'
  | 'AI Analysis'
  | 'Under Review'
  | 'Investigation Assigned'
  | 'Corrective Action'
  | 'Resolved'
  | 'Rejected';

export interface AIAnalysis {
  incident_summary: string;
  pollution_category: string;
  risk_level: IncidentSeverity;
  risk_score: number; // 0 - 100
  confidence: number; // 0 - 100
  evidence: string[];
  potential_impact: string[];
  compliance_concerns: string[];
  missing_information: string[];
  recommended_inspection: string[];
  suggested_actions: string[];
  explanation: string;
  disclaimer: string;
  analyzedAt: string;
}

export interface ComplianceFinding {
  referenceId: string;
  standardTitle: string;
  standardCode: string;
  issuingAuthority: string;
  parameter: string;
  observedValue: number;
  threshold: number;
  unit: string;
  status: 'Within Reference Limit' | 'Potential Exceedance' | 'Insufficient Evidence' | 'Requires Human Review';
  explanation: string;
  checkedAt: string;
}

export interface Incident {
  id: string;
  title: string;
  description: string;
  category: PollutionCategory;
  pollutionType: string;
  medium: 'air' | 'water' | 'soil' | 'noise' | 'multimedia';
  location: string;
  region: string;
  latitude: number;
  longitude: number;
  reportedAt: string;
  severityObserved: IncidentSeverity;
  riskScore: number;
  riskLevel: IncidentSeverity;
  status: IncidentStatus;
  assignedOfficerId?: string;
  assignedOfficerName?: string;
  reporterId: string;
  reporterName: string;
  reporterEmail: string;
  contactPreference?: string;
  evidenceUrl?: string;
  evidenceName?: string;
  aiAnalysis?: AIAnalysis;
  complianceFindings?: ComplianceFinding[];
  followUpComments?: {
    id: string;
    userId: string;
    userName: string;
    userRole: Role;
    message: string;
    timestamp: string;
  }[];
  updatedAt: string;
}

export interface EnvironmentalObservation {
  id: string;
  incidentId?: string;
  parameter: string;
  value: number;
  unit: string;
  baselineValue?: number;
  threshold?: number;
  isAnomaly?: boolean;
  anomalyScore?: number; // deviation metric
  deviationPercent?: number;
  observedAt: string;
  source: string;
  location: string;
  region: string;
}

export interface ComplianceReference {
  id: string;
  title: string;
  issuingAuthority: string;
  parameter: string;
  threshold: number;
  unit: string;
  standardCode: string;
  jurisdiction: string;
  documentDate: string;
  sourceUrl: string;
  applicability: string;
  applicabilityNotes: string;
}

export interface InspectionChecklistItem {
  item: string;
  checked: boolean;
  note?: string;
}

export interface Inspection {
  id: string;
  incidentId: string;
  incidentTitle: string;
  assignedOfficerId: string;
  assignedOfficerName: string;
  scheduledAt: string;
  location: string;
  status: 'Scheduled' | 'In Progress' | 'Completed' | 'Cancelled';
  checklist: InspectionChecklistItem[];
  findings: string;
  evidenceNotes?: string;
  completedAt?: string;
}

export interface CorrectiveAction {
  id: string;
  incidentId: string;
  incidentTitle: string;
  description: string;
  responsibleDepartment: string;
  responsibleParty: string;
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  dueDate: string;
  status: 'Pending' | 'In Progress' | 'Completed' | 'Verified' | 'Overdue';
  completionEvidence?: string;
  officerVerification?: string;
  verifiedAt?: string;
}

export interface Notification {
  id: string;
  userId: string;
  roleTarget?: 'all' | 'officer' | 'citizen' | 'admin';
  title: string;
  message: string;
  type:
    | 'incident_submitted'
    | 'ai_analysis_complete'
    | 'officer_assigned'
    | 'inspection_scheduled'
    | 'action_required'
    | 'resolved'
    | 'critical_alert';
  incidentId?: string;
  read: boolean;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  incidentId: string;
  actorId: string;
  actorName: string;
  actorRole: string;
  action: string;
  previousState?: string;
  newState?: string;
  timestamp: string;
  notes?: string;
}

export interface AnomalyRecord {
  id: string;
  parameter: string;
  observedValue: number;
  historicalAverage: number;
  deviationPercentage: number;
  anomalyScore: number;
  severity: IncidentSeverity;
  location: string;
  timestamp: string;
  potentialExplanation: string;
  recommendedFollowUp: string;
}

export interface ForecastPoint {
  date: string;
  observed?: number;
  forecast?: number;
  confidenceLower?: number;
  confidenceUpper?: number;
  parameter: string;
  unit: string;
}
