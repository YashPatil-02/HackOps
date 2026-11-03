import { boolean, doublePrecision, integer, pgTable, text } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: text('id').primaryKey(),
  uid: text('uid').notNull().unique(),
  name: text('name').notNull(),
  email: text('email').notNull(),
  role: text('role').notNull(),
  department: text('department'),
  phone: text('phone'),
  region: text('region'),
  createdAt: text('created_at'),
});

export const incidents = pgTable('incidents', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  category: text('category').notNull(),
  pollutionType: text('pollution_type'),
  medium: text('medium'),
  location: text('location').notNull(),
  region: text('region').notNull(),
  latitude: doublePrecision('latitude').notNull(),
  longitude: doublePrecision('longitude').notNull(),
  severityObserved: text('severity_observed').notNull(),
  reporterId: text('reporter_id').notNull(),
  reporterName: text('reporter_name').notNull(),
  reporterEmail: text('reporter_email'),
  contactPreference: text('contact_preference'),
  status: text('status').notNull(),
  riskScore: integer('risk_score'),
  riskLevel: text('risk_level'),
  evidenceUrl: text('evidence_url'),
  evidenceName: text('evidence_name'),
  aiAnalysis: text('ai_analysis'),
  followUpComments: text('follow_up_comments'),
  assignedOfficerId: text('assigned_officer_id'),
  assignedOfficerName: text('assigned_officer_name'),
  reportedAt: text('reported_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const inspections = pgTable('inspections', {
  id: text('id').primaryKey(),
  incidentId: text('incident_id').notNull(),
  inspectorId: text('inspector_id').notNull(),
  inspectorName: text('inspector_name').notNull(),
  scheduledDate: text('scheduled_date').notNull(),
  conductedDate: text('conducted_date'),
  status: text('status').notNull(),
  findings: text('findings'),
  samplesCollected: text('samples_collected'),
  noticeServed: boolean('notice_served').default(false),
  createdAt: text('created_at').notNull(),
});

export const correctiveActions = pgTable('corrective_actions', {
  id: text('id').primaryKey(),
  incidentId: text('incident_id').notNull(),
  targetUnit: text('target_unit').notNull(),
  actionRequired: text('action_required').notNull(),
  statutoryDeadline: text('statutory_deadline').notNull(),
  penaltyPerDay: text('penalty_per_day'),
  assignedOfficer: text('assigned_officer').notNull(),
  status: text('status').notNull(),
  evidenceOfCompliance: text('evidence_of_compliance'),
  officerVerification: text('officer_verification'),
  verifiedAt: text('verified_at'),
  createdAt: text('created_at').notNull(),
});

export const observations = pgTable('observations', {
  id: text('id').primaryKey(),
  incidentId: text('incident_id'),
  stationId: text('station_id').notNull(),
  stationName: text('station_name').notNull(),
  parameter: text('parameter').notNull(),
  value: doublePrecision('value').notNull(),
  unit: text('unit').notNull(),
  standardLimit: doublePrecision('standard_limit').notNull(),
  exceedanceRatio: doublePrecision('exceedance_ratio'),
  timestamp: text('timestamp').notNull(),
});

export const notifications = pgTable('notifications', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(),
  roleTarget: text('role_target'),
  title: text('title').notNull(),
  message: text('message').notNull(),
  type: text('type').notNull(),
  incidentId: text('incident_id'),
  read: boolean('read').notNull().default(false),
  createdAt: text('created_at').notNull(),
});

export const auditLogs = pgTable('audit_logs', {
  id: text('id').primaryKey(),
  incidentId: text('incident_id').notNull(),
  actorId: text('actor_id').notNull(),
  actorName: text('actor_name').notNull(),
  actorRole: text('actor_role').notNull(),
  action: text('action').notNull(),
  previousState: text('previous_state'),
  newState: text('new_state'),
  notes: text('notes').notNull(),
  timestamp: text('timestamp').notNull(),
});
