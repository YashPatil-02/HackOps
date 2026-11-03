import {
  Incident,
  EnvironmentalObservation,
  ComplianceReference,
  Inspection,
  CorrectiveAction,
  Notification,
  User,
  ComplianceFinding,
} from '../types';

let currentUserId = localStorage.getItem('ecosentinel_user_id') || 'user-citizen-01';

export const setCurrentUserHeader = (id: string) => {
  currentUserId = id;
  localStorage.setItem('ecosentinel_user_id', id);
};

export const getCurrentUserId = () => currentUserId;

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers = {
    'Content-Type': 'application/json',
    'x-user-id': currentUserId,
    ...(options.headers || {}),
  };

  const response = await fetch(endpoint, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let msg = `HTTP ${response.status}`;
    try {
      const err = await response.json();
      if (err.message) msg = err.message;
    } catch {}
    throw new Error(msg);
  }

  return response.json();
}

export const api = {
  auth: {
    me: async () => request<{ success: boolean; user: User }>('/api/auth/me'),
    login: async (email: string) =>
      request<{ success: boolean; user: User }>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email }),
      }),
    demoUsers: async () => request<{ success: boolean; users: User[] }>('/api/auth/demo-users'),
  },

  incidents: {
    getAll: async (params?: Record<string, string | undefined>) => {
      const sp = new URLSearchParams();
      if (params) {
        Object.entries(params).forEach(([k, v]) => {
          if (v) sp.append(k, v);
        });
      }
      return request<{ success: boolean; count: number; data: Incident[] }>(`/api/incidents?${sp.toString()}`);
    },
    getById: async (id: string) =>
      request<{
        success: boolean;
        data: Incident & {
          observations: EnvironmentalObservation[];
          inspections: Inspection[];
          actions: CorrectiveAction[];
          auditLogs: any[];
        };
      }>(`/api/incidents/${id}`),
    create: async (data: Partial<Incident>) =>
      request<{ success: boolean; data: Incident }>('/api/incidents', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    updateStatus: async (id: string, status: string, notes?: string, assignedOfficerId?: string, assignedOfficerName?: string) =>
      request<{ success: boolean; data: Incident }>(`/api/incidents/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status, notes, assignedOfficerId, assignedOfficerName }),
      }),
    assign: async (id: string, officerId: string, officerName: string) =>
      request<{ success: boolean; data: Incident }>(`/api/incidents/${id}/assign`, {
        method: 'PATCH',
        body: JSON.stringify({ officerId, officerName }),
      }),
    addComment: async (id: string, message: string) =>
      request<{ success: boolean; data: Incident }>(`/api/incidents/${id}/comment`, {
        method: 'POST',
        body: JSON.stringify({ message }),
      }),
    reAnalyze: async (id: string) =>
      request<{ success: boolean; data: Incident }>(`/api/incidents/${id}/ai-analyze`, {
        method: 'POST',
      }),
  },

  compliance: {
    getReferences: async () =>
      request<{ success: boolean; data: ComplianceReference[] }>('/api/compliance/references'),
    assess: async (data: { parameter: string; value: number; unit?: string; incidentId?: string }) =>
      request<{ success: boolean; data: ComplianceFinding[] }>('/api/compliance/assess', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
  },

  observations: {
    getAll: async (incidentId?: string) => {
      const url = incidentId ? `/api/observations?incidentId=${incidentId}` : '/api/observations';
      return request<{ success: boolean; data: EnvironmentalObservation[] }>(url);
    },
    create: async (data: Partial<EnvironmentalObservation>) =>
      request<{ success: boolean; data: EnvironmentalObservation }>('/api/observations', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
  },

  inspections: {
    getAll: async (params?: { officerId?: string; incidentId?: string; status?: string }) => {
      const sp = new URLSearchParams();
      if (params?.officerId) sp.append('officerId', params.officerId);
      if (params?.incidentId) sp.append('incidentId', params.incidentId);
      if (params?.status) sp.append('status', params.status);
      return request<{ success: boolean; count: number; data: Inspection[] }>(`/api/inspections?${sp.toString()}`);
    },
    create: async (data: Partial<Inspection>) =>
      request<{ success: boolean; data: Inspection }>('/api/inspections', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: async (id: string, updates: Partial<Inspection>) =>
      request<{ success: boolean; data: Inspection }>(`/api/inspections/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(updates),
      }),
  },

  actions: {
    getAll: async (params?: { incidentId?: string; status?: string }) => {
      const sp = new URLSearchParams();
      if (params?.incidentId) sp.append('incidentId', params.incidentId);
      if (params?.status) sp.append('status', params.status);
      return request<{ success: boolean; count: number; data: CorrectiveAction[] }>(`/api/actions?${sp.toString()}`);
    },
    create: async (data: Partial<CorrectiveAction>) =>
      request<{ success: boolean; data: CorrectiveAction }>('/api/actions', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: async (id: string, updates: Partial<CorrectiveAction>) =>
      request<{ success: boolean; data: CorrectiveAction }>(`/api/actions/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(updates),
      }),
  },

  analytics: {
    get: async () =>
      request<{
        success: boolean;
        data: {
          metrics: {
            totalIncidents: number;
            criticalRiskIncidents: number;
            highRiskIncidents: number;
            resolvedIncidents: number;
            activeInspections: number;
            totalActions: number;
            anomaliesDetected: number;
            complianceAlerts: number;
          };
          categoryDistribution: { name: string; count: number }[];
          regionalDistribution: { region: string; total: number; critical: number }[];
          riskDistribution: { level: string; count: number }[];
          statusDistribution: { status: string; count: number }[];
          incidentForecast: { date: string; observed?: number; forecast?: number; lower?: number; upper?: number }[];
          anomalies: any[];
        };
      }>('/api/analytics'),
  },

  ai: {
    chat: async (query: string) =>
      request<{ success: boolean; answer: string }>('/api/ai/chat', {
        method: 'POST',
        body: JSON.stringify({ query }),
      }),
  },

  notifications: {
    getAll: async () => request<{ success: boolean; data: Notification[] }>('/api/notifications'),
    markRead: async (id: string) =>
      request<{ success: boolean }>(`/api/notifications/${id}/read`, { method: 'PATCH' }),
    markAllRead: async () => request<{ success: boolean }>('/api/notifications/read-all', { method: 'POST' }),
  },

  seed: {
    reset: async () => request<{ success: boolean; message: string }>('/api/seed/reset', { method: 'POST' }),
  },
};
