import fs from 'fs';
import path from 'path';
import {
  Incident,
  EnvironmentalObservation,
  ComplianceReference,
  Inspection,
  CorrectiveAction,
  Notification,
  AuditLog,
  User,
  AnomalyRecord,
  ComplianceFinding,
} from '../types';
import {
  INITIAL_USERS,
  INITIAL_COMPLIANCE_REFERENCES,
  INITIAL_INCIDENTS,
  INITIAL_OBSERVATIONS,
  INITIAL_INSPECTIONS,
  INITIAL_CORRECTIVE_ACTIONS,
  INITIAL_NOTIFICATIONS,
  INITIAL_AUDIT_LOGS,
  INITIAL_ANOMALIES,
} from './seedData';

import { eq } from 'drizzle-orm';
import { sqlDb, schema } from '../db/index.ts';

interface DatabaseSchema {
  users: User[];
  incidents: Incident[];
  observations: EnvironmentalObservation[];
  complianceReferences: ComplianceReference[];
  inspections: Inspection[];
  actions: CorrectiveAction[];
  notifications: Notification[];
  auditLogs: AuditLog[];
  anomalies: AnomalyRecord[];
}

const DB_FILE = path.resolve(process.cwd(), 'data', 'ecosentinel-db.json');

class DatabaseService {
  private data: DatabaseSchema;
  private sqlReady: boolean = false;

  constructor() {
    this.data = this.loadDatabase();
    this.initSqlDatabase();
  }

  private async initSqlDatabase() {
    try {
      // Check if Cloud SQL is reachable and has data
      const existing = await sqlDb.select({ id: schema.incidents.id }).from(schema.incidents).limit(1);
      this.sqlReady = true;
      if (existing.length === 0) {
        console.log('[Cloud SQL] Database empty, seeding records into PostgreSQL...');
        await this.syncAllToSql();
      } else {
        console.log('[Cloud SQL] Connected to PostgreSQL instance with active records.');
      }
    } catch (err) {
      console.warn('[Cloud SQL] SQL sync deferred (pool initializing or local mode):', err);
    }
  }

  private async syncAllToSql() {
    try {
      // Seed users
      for (const u of this.data.users) {
        await sqlDb
          .insert(schema.users)
          .values({
            id: u.id,
            uid: u.id,
            name: u.name,
            email: u.email,
            role: u.role,
            department: u.department || null,
            phone: null,
            region: u.location || null,
            createdAt: u.createdAt || new Date().toISOString(),
          })
          .onConflictDoNothing();
      }

      // Seed incidents
      for (const inc of this.data.incidents) {
        await sqlDb
          .insert(schema.incidents)
          .values({
            id: inc.id,
            title: inc.title,
            description: inc.description,
            category: inc.category,
            pollutionType: inc.pollutionType || null,
            medium: inc.medium || null,
            location: inc.location,
            region: inc.region,
            latitude: inc.latitude,
            longitude: inc.longitude,
            severityObserved: inc.severityObserved,
            reporterId: inc.reporterId,
            reporterName: inc.reporterName,
            reporterEmail: inc.reporterEmail || null,
            contactPreference: inc.contactPreference || null,
            status: inc.status,
            riskScore: inc.riskScore ?? null,
            riskLevel: inc.riskLevel ?? null,
            evidenceUrl: inc.evidenceUrl || null,
            evidenceName: inc.evidenceName || null,
            aiAnalysis: inc.aiAnalysis ? JSON.stringify(inc.aiAnalysis) : null,
            followUpComments: inc.followUpComments ? JSON.stringify(inc.followUpComments) : null,
            assignedOfficerId: inc.assignedOfficerId || null,
            assignedOfficerName: inc.assignedOfficerName || null,
            reportedAt: inc.reportedAt,
            updatedAt: inc.updatedAt,
          })
          .onConflictDoNothing();
      }
      console.log('[Cloud SQL] Seeding to PostgreSQL completed successfully.');
    } catch (err) {
      console.error('[Cloud SQL] Error syncing to PostgreSQL:', err);
    }
  }

  private loadDatabase(): DatabaseSchema {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        if (parsed.incidents && parsed.incidents.length > 0) {
          return parsed;
        }
      }
    } catch (err) {
      console.warn('[DB] Failed to read db file, initializing with fresh seed data:', err);
    }
    return this.getInitialSeed();
  }

  private getInitialSeed(): DatabaseSchema {
    const seed: DatabaseSchema = {
      users: JSON.parse(JSON.stringify(INITIAL_USERS)),
      incidents: JSON.parse(JSON.stringify(INITIAL_INCIDENTS)),
      observations: JSON.parse(JSON.stringify(INITIAL_OBSERVATIONS)),
      complianceReferences: JSON.parse(JSON.stringify(INITIAL_COMPLIANCE_REFERENCES)),
      inspections: JSON.parse(JSON.stringify(INITIAL_INSPECTIONS)),
      actions: JSON.parse(JSON.stringify(INITIAL_CORRECTIVE_ACTIONS)),
      notifications: JSON.parse(JSON.stringify(INITIAL_NOTIFICATIONS)),
      auditLogs: JSON.parse(JSON.stringify(INITIAL_AUDIT_LOGS)),
      anomalies: JSON.parse(JSON.stringify(INITIAL_ANOMALIES)),
    };
    this.persist(seed);
    return seed;
  }

  private persist(dataToSave?: DatabaseSchema) {
    try {
      const data = dataToSave || this.data;
      const dir = path.dirname(DB_FILE);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
    } catch (err) {
      console.error('[DB] Error saving to disk:', err);
    }
  }

  public resetToSeed(): DatabaseSchema {
    this.data = this.getInitialSeed();
    return this.data;
  }

  // Users
  public getUsers(): User[] {
    return this.data.users;
  }

  public getUserById(id: string): User | undefined {
    return this.data.users.find((u) => u.id === id);
  }

  public getUserByEmail(email: string): User | undefined {
    return this.data.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  }

  // Incidents
  public getIncidents(filters?: {
    category?: string;
    region?: string;
    riskLevel?: string;
    status?: string;
    search?: string;
    reporterId?: string;
  }): Incident[] {
    let result = [...this.data.incidents];

    if (!filters) return result.sort((a, b) => new Date(b.reportedAt).getTime() - new Date(a.reportedAt).getTime());

    if (filters.reporterId) {
      result = result.filter((i) => i.reporterId === filters.reporterId);
    }
    if (filters.category && filters.category !== 'all') {
      result = result.filter((i) => i.category.toLowerCase() === filters.category!.toLowerCase());
    }
    if (filters.region && filters.region !== 'all') {
      result = result.filter((i) => i.region.toLowerCase() === filters.region!.toLowerCase());
    }
    if (filters.riskLevel && filters.riskLevel !== 'all') {
      result = result.filter((i) => i.riskLevel.toLowerCase() === filters.riskLevel!.toLowerCase());
    }
    if (filters.status && filters.status !== 'all') {
      result = result.filter((i) => i.status.toLowerCase() === filters.status!.toLowerCase());
    }
    if (filters.search && filters.search.trim()) {
      const q = filters.search.toLowerCase();
      result = result.filter(
        (i) =>
          i.title.toLowerCase().includes(q) ||
          i.description.toLowerCase().includes(q) ||
          i.location.toLowerCase().includes(q) ||
          i.id.toLowerCase().includes(q) ||
          i.pollutionType.toLowerCase().includes(q)
      );
    }

    return result.sort((a, b) => new Date(b.reportedAt).getTime() - new Date(a.reportedAt).getTime());
  }

  public getIncidentById(id: string): Incident | undefined {
    return this.data.incidents.find((i) => i.id === id);
  }

  public createIncident(incidentData: Omit<Incident, 'id' | 'reportedAt' | 'updatedAt' | 'riskScore' | 'riskLevel' | 'status'> & {
    riskScore?: number;
    riskLevel?: Incident['riskLevel'];
    status?: Incident['status'];
  }): Incident {
    const nextSeq = 1000 + this.data.incidents.length + 1;
    const id = `ECO-2026-${nextSeq}`;
    const now = new Date().toISOString();

    const newIncident: Incident = {
      ...incidentData,
      id,
      reportedAt: now,
      updatedAt: now,
      riskScore: incidentData.riskScore ?? (incidentData.severityObserved === 'Critical' ? 88 : incidentData.severityObserved === 'High' ? 74 : 50),
      riskLevel: incidentData.riskLevel ?? incidentData.severityObserved,
      status: incidentData.status ?? 'Submitted',
    };

    this.data.incidents.unshift(newIncident);

    // Audit Log
    this.addAuditLog({
      incidentId: id,
      actorId: newIncident.reporterId,
      actorName: newIncident.reporterName,
      actorRole: 'citizen',
      action: 'INCIDENT_SUBMITTED',
      newState: newIncident.status,
      notes: `Incident registered at ${newIncident.location}. Medium: ${newIncident.medium}.`,
    });

    // Notify Citizen Reporter
    this.data.notifications.unshift({
      id: `notif-${Date.now()}-cit`,
      userId: newIncident.reporterId,
      roleTarget: 'citizen',
      title: 'Report Registered Successfully',
      message: `Your report ${newIncident.id} has been registered and queued for automated AI risk screening.`,
      type: 'incident_submitted',
      incidentId: id,
      read: false,
      createdAt: now,
    });

    // Notify Officers
    this.data.notifications.unshift({
      id: `notif-${Date.now()}-off`,
      userId: 'officers',
      roleTarget: 'officer',
      title: 'New Incident Submitted',
      message: `${newIncident.id}: ${newIncident.title} in ${newIncident.region}`,
      type: 'incident_submitted',
      incidentId: id,
      read: false,
      createdAt: now,
    });

    this.persist();

    // Persist to Cloud SQL PostgreSQL
    sqlDb
      .insert(schema.incidents)
      .values({
        id: newIncident.id,
        title: newIncident.title,
        description: newIncident.description,
        category: newIncident.category,
        pollutionType: newIncident.pollutionType || null,
        medium: newIncident.medium || null,
        location: newIncident.location,
        region: newIncident.region,
        latitude: newIncident.latitude,
        longitude: newIncident.longitude,
        severityObserved: newIncident.severityObserved,
        reporterId: newIncident.reporterId,
        reporterName: newIncident.reporterName,
        reporterEmail: newIncident.reporterEmail || null,
        contactPreference: newIncident.contactPreference || null,
        status: newIncident.status,
        riskScore: newIncident.riskScore ?? null,
        riskLevel: newIncident.riskLevel ?? null,
        evidenceUrl: newIncident.evidenceUrl || null,
        evidenceName: newIncident.evidenceName || null,
        aiAnalysis: newIncident.aiAnalysis ? JSON.stringify(newIncident.aiAnalysis) : null,
        followUpComments: newIncident.followUpComments ? JSON.stringify(newIncident.followUpComments) : null,
        assignedOfficerId: newIncident.assignedOfficerId || null,
        assignedOfficerName: newIncident.assignedOfficerName || null,
        reportedAt: newIncident.reportedAt,
        updatedAt: newIncident.updatedAt,
      })
      .then(() => {
        console.log(`[Cloud SQL] Incident ${newIncident.id} saved to PostgreSQL.`);
      })
      .catch((err) => {
        console.error('[Cloud SQL] Error inserting incident:', err);
      });

    return newIncident;
  }

  public updateIncident(
    id: string,
    updates: Partial<Incident>,
    actor?: { id: string; name: string; role: string; notes?: string }
  ): Incident | undefined {
    const index = this.data.incidents.findIndex((i) => i.id === id);
    if (index === -1) return undefined;

    const prev = this.data.incidents[index];
    const now = new Date().toISOString();

    const updated: Incident = {
      ...prev,
      ...updates,
      updatedAt: now,
    };

    this.data.incidents[index] = updated;

    if (actor) {
      this.addAuditLog({
        incidentId: id,
        actorId: actor.id,
        actorName: actor.name,
        actorRole: actor.role,
        action: updates.status ? 'STATUS_UPDATED' : 'INCIDENT_UPDATED',
        previousState: prev.status,
        newState: updated.status,
        notes: actor.notes || `Incident updated by ${actor.name}`,
      });

      // Notify reporter of any official status change
      if (updates.status && prev.status !== updates.status) {
        this.data.notifications.unshift({
          id: `notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          userId: updated.reporterId,
          roleTarget: 'citizen',
          title: `Case Status Update: ${updates.status}`,
          message: `Your report ${updated.id} ("${updated.title.substring(0, 40)}...") has been moved to "${updates.status}" by ${actor?.name || 'Enforcement Wing'}.`,
          type: updates.status === 'Resolved' ? 'resolved' : 'officer_assigned',
          incidentId: updated.id,
          read: false,
          createdAt: now,
        });
      }
    }

    this.persist();

    // Update Cloud SQL PostgreSQL
    const sqlUpdates: Record<string, any> = {
      updatedAt: updated.updatedAt,
    };
    if (updates.status) sqlUpdates.status = updates.status;
    if (updates.riskScore !== undefined) sqlUpdates.riskScore = updates.riskScore;
    if (updates.riskLevel) sqlUpdates.riskLevel = updates.riskLevel;
    if (updates.aiAnalysis) sqlUpdates.aiAnalysis = JSON.stringify(updates.aiAnalysis);
    if (updates.assignedOfficerId) sqlUpdates.assignedOfficerId = updates.assignedOfficerId;
    if (updates.assignedOfficerName) sqlUpdates.assignedOfficerName = updates.assignedOfficerName;
    if (updates.followUpComments) sqlUpdates.followUpComments = JSON.stringify(updates.followUpComments);

    sqlDb
      .update(schema.incidents)
      .set(sqlUpdates)
      .where(eq(schema.incidents.id, id))
      .then(() => {
        console.log(`[Cloud SQL] Incident ${id} updated in PostgreSQL.`);
      })
      .catch((err) => {
        console.error('[Cloud SQL] Error updating incident in PostgreSQL:', err);
      });

    return updated;
  }

  public addComment(
    incidentId: string,
    comment: { userId: string; userName: string; userRole: User['role']; message: string }
  ): Incident | undefined {
    const incident = this.getIncidentById(incidentId);
    if (!incident) return undefined;

    if (!incident.followUpComments) {
      incident.followUpComments = [];
    }

    const commentRecord = {
      id: `comm-${Date.now()}`,
      ...comment,
      timestamp: new Date().toISOString(),
    };

    incident.followUpComments.push(commentRecord);
    incident.updatedAt = new Date().toISOString();

    this.addAuditLog({
      incidentId,
      actorId: comment.userId,
      actorName: comment.userName,
      actorRole: comment.userRole,
      action: 'COMMENT_ADDED',
      notes: comment.message.length > 60 ? `${comment.message.substring(0, 60)}...` : comment.message,
    });

    this.persist();
    return incident;
  }

  // Compliance
  public getComplianceReferences(): ComplianceReference[] {
    return this.data.complianceReferences;
  }

  public assessObservation(param: {
    parameter: string;
    value: number;
    unit?: string;
  }): ComplianceFinding[] {
    const findings: ComplianceFinding[] = [];
    const now = new Date().toISOString();

    const matches = this.data.complianceReferences.filter(
      (ref) => ref.parameter.toLowerCase() === param.parameter.toLowerCase()
    );

    if (matches.length === 0) {
      findings.push({
        referenceId: 'general-review',
        standardTitle: `Parameter: ${param.parameter}`,
        standardCode: 'Requires Specific Standard Review',
        issuingAuthority: 'Environmental Protection Council',
        parameter: param.parameter,
        observedValue: param.value,
        threshold: 0,
        unit: param.unit || 'units',
        status: 'Requires Human Review',
        explanation: `No exact automated threshold found in CPCB/MoEFCC demo registry for "${param.parameter}". Expert verification required.`,
        checkedAt: now,
      });
      return findings;
    }

    for (const ref of matches) {
      let status: ComplianceFinding['status'] = 'Within Reference Limit';
      let explanation = `Measured value ${param.value} ${ref.unit} is within statutory threshold of ${ref.threshold} ${ref.unit}.`;

      // For pH, valid range is between 6.5 and threshold (8.5)
      if (ref.parameter.toLowerCase() === 'ph') {
        if (param.value < 6.5 || param.value > ref.threshold) {
          status = 'Potential Exceedance';
          explanation = `Measured pH ${param.value} violates acceptable aquatic discharge window (6.5 to ${ref.threshold} ${ref.unit}).`;
        }
      } else {
        if (param.value > ref.threshold) {
          status = 'Potential Exceedance';
          const multiplier = (param.value / ref.threshold).toFixed(1);
          explanation = `Observed ${param.value} ${ref.unit} exceeds reference ceiling of ${ref.threshold} ${ref.unit} by ${multiplier}x (${ref.standardCode}).`;
        }
      }

      findings.push({
        referenceId: ref.id,
        standardTitle: ref.title,
        standardCode: ref.standardCode,
        issuingAuthority: ref.issuingAuthority,
        parameter: ref.parameter,
        observedValue: param.value,
        threshold: ref.threshold,
        unit: ref.unit,
        status,
        explanation,
        checkedAt: now,
      });
    }

    return findings;
  }

  // Observations
  public getObservations(incidentId?: string): EnvironmentalObservation[] {
    if (incidentId) {
      return this.data.observations.filter((o) => o.incidentId === incidentId);
    }
    return this.data.observations;
  }

  public createObservation(obs: Omit<EnvironmentalObservation, 'id'>): EnvironmentalObservation {
    const newObs: EnvironmentalObservation = {
      ...obs,
      id: `obs-${Date.now()}`,
    };
    this.data.observations.unshift(newObs);
    this.persist();
    return newObs;
  }

  // Inspections
  public getInspections(filters?: { officerId?: string; incidentId?: string; status?: string }): Inspection[] {
    let result = [...this.data.inspections];
    if (filters?.officerId) result = result.filter((i) => i.assignedOfficerId === filters.officerId);
    if (filters?.incidentId) result = result.filter((i) => i.incidentId === filters.incidentId);
    if (filters?.status && filters.status !== 'all') result = result.filter((i) => i.status === filters.status);
    return result.sort((a, b) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime());
  }

  public createInspection(insp: Omit<Inspection, 'id'>): Inspection {
    const newInsp: Inspection = {
      ...insp,
      id: `INSP-2026-${String(this.data.inspections.length + 80).padStart(3, '0')}`,
    };
    this.data.inspections.unshift(newInsp);

    // Update incident status
    this.updateIncident(
      newInsp.incidentId,
      { status: 'Investigation Assigned', assignedOfficerId: newInsp.assignedOfficerId, assignedOfficerName: newInsp.assignedOfficerName },
      { id: newInsp.assignedOfficerId, name: newInsp.assignedOfficerName, role: 'officer', notes: `Inspection scheduled: ${newInsp.id}` }
    );

    const targetIncident = this.getIncidentById(newInsp.incidentId);
    if (targetIncident) {
      this.data.notifications.unshift({
        id: `notif-${Date.now()}-insp`,
        userId: targetIncident.reporterId,
        roleTarget: 'citizen',
        title: 'Field Audit Scheduled',
        message: `Inspector ${newInsp.assignedOfficerName} scheduled an on-site audit for your report ${targetIncident.id} on ${new Date(newInsp.scheduledAt).toLocaleDateString()}.`,
        type: 'inspection_scheduled',
        incidentId: targetIncident.id,
        read: false,
        createdAt: new Date().toISOString(),
      });
    }

    this.persist();
    return newInsp;
  }

  public updateInspection(id: string, updates: Partial<Inspection>): Inspection | undefined {
    const idx = this.data.inspections.findIndex((i) => i.id === id);
    if (idx === -1) return undefined;
    const updated = { ...this.data.inspections[idx], ...updates };
    this.data.inspections[idx] = updated;

    if (updates.status === 'Completed') {
      const incident = this.getIncidentById(updated.incidentId);
      if (incident) {
        this.addAuditLog({
          incidentId: incident.id,
          actorId: updated.assignedOfficerId,
          actorName: updated.assignedOfficerName,
          actorRole: 'officer',
          action: 'INSPECTION_COMPLETED',
          notes: `Inspection ${updated.id} completed. Findings: ${updated.findings || 'Completed'}`,
        });
      }
    }

    this.persist();
    return updated;
  }

  // Corrective Actions
  public getActions(filters?: { incidentId?: string; status?: string }): CorrectiveAction[] {
    let result = [...this.data.actions];
    if (filters?.incidentId) result = result.filter((a) => a.incidentId === filters.incidentId);
    if (filters?.status && filters.status !== 'all') result = result.filter((a) => a.status === filters.status);
    return result.sort((a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime());
  }

  public createAction(act: Omit<CorrectiveAction, 'id'>): CorrectiveAction {
    const newAct: CorrectiveAction = {
      ...act,
      id: `ACT-2026-${String(this.data.actions.length + 200).padStart(3, '0')}`,
    };
    this.data.actions.unshift(newAct);

    // Update incident status to 'Corrective Action'
    this.updateIncident(
      newAct.incidentId,
      { status: 'Corrective Action' },
      { id: 'officer-act', name: act.responsibleDepartment, role: 'officer', notes: `Corrective action initiated: ${newAct.id}` }
    );

    const incident = this.getIncidentById(newAct.incidentId);
    if (incident) {
      this.data.notifications.unshift({
        id: `notif-${Date.now()}-act`,
        userId: incident.reporterId,
        roleTarget: 'citizen',
        title: 'Corrective Action Issued',
        message: `Mandated rectification directive ${newAct.id} issued for Case ${incident.id}: ${newAct.description.substring(0, 60)}...`,
        type: 'action_required',
        incidentId: incident.id,
        read: false,
        createdAt: new Date().toISOString(),
      });
    }

    this.persist();
    return newAct;
  }

  public updateAction(
    id: string,
    updates: Partial<CorrectiveAction>,
    actor?: { id: string; name: string; role: string; notes?: string }
  ): CorrectiveAction | undefined {
    const idx = this.data.actions.findIndex((a) => a.id === id);
    if (idx === -1) return undefined;
    const updated = { ...this.data.actions[idx], ...updates };
    this.data.actions[idx] = updated;

    if (actor && updates.status === 'Verified') {
      this.addAuditLog({
        incidentId: updated.incidentId,
        actorId: actor.id,
        actorName: actor.name,
        actorRole: actor.role,
        action: 'CORRECTIVE_ACTION_VERIFIED',
        previousState: this.data.actions[idx].status,
        newState: 'Verified',
        notes: `Action ${updated.id} verified: ${updates.officerVerification || 'Satisfactory mitigation.'}`,
      });

      const incident = this.getIncidentById(updated.incidentId);
      if (incident) {
        this.data.notifications.unshift({
          id: `notif-${Date.now()}-ver`,
          userId: incident.reporterId,
          roleTarget: 'citizen',
          title: 'Remediation Verified by Officer',
          message: `Officer ${actor.name} verified remediation for ${updated.id}: ${updates.officerVerification || 'Satisfactory mitigation.'}`,
          type: 'resolved',
          incidentId: incident.id,
          read: false,
          createdAt: new Date().toISOString(),
        });
      }
    }

    this.persist();
    return updated;
  }

  // Notifications
  public getNotifications(userId: string, role?: string): Notification[] {
    return this.data.notifications.filter(
      (n) => n.userId === userId || n.userId === 'all' || (role && n.roleTarget === role)
    );
  }

  public markNotificationRead(id: string): boolean {
    const notif = this.data.notifications.find((n) => n.id === id);
    if (notif) {
      notif.read = true;
      this.persist();
      return true;
    }
    return false;
  }

  public markAllNotificationsRead(userId: string): void {
    this.data.notifications.forEach((n) => {
      if (n.userId === userId || n.roleTarget) {
        n.read = true;
      }
    });
    this.persist();
  }

  // Audit Logs
  public getAuditLogs(incidentId?: string): AuditLog[] {
    if (incidentId) {
      return this.data.auditLogs
        .filter((l) => l.incidentId === incidentId)
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    }
    return [...this.data.auditLogs].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  public addAuditLog(log: Omit<AuditLog, 'id' | 'timestamp'>): AuditLog {
    const newLog: AuditLog = {
      ...log,
      id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
    };
    this.data.auditLogs.unshift(newLog);
    this.persist();
    return newLog;
  }

  // Anomalies
  public getAnomalies(): AnomalyRecord[] {
    return this.data.anomalies;
  }
}

export const db = new DatabaseService();
