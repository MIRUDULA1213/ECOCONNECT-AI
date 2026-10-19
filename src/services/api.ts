import {
  WasteBatch,
  ApprovalRequest,
  InvestigationCase,
  AuditLogEntry,
  ToolCallExecution,
  DemoScenarioState,
  IncidentReport,
  DecodedQrResult,
} from '../types/ecoconnect.ts';

export interface DashboardSummary {
  kpis: {
    trackedBatches: number;
    collectedWeightKg: number;
    verifiedRecoveryKg: number;
    pendingApprovals: number;
    activeAnomalies: number;
    recoveryYieldPct: number;
  };
  activeBatch: {
    ecoTrackId: string;
    material: string;
    status: string;
    currentWeightKg?: number;
    initialWeightKg?: number;
    currentStep: number;
    stepName: string;
    stepDescription: string;
    investigationCase?: InvestigationCase;
  };
  recentActivity: AuditLogEntry[];
  timestamp: string;
}

export const api = {
  // Dashboard & Summary
  getSummary: async (): Promise<DashboardSummary> => {
    const res = await fetch('/api/dashboard/summary');
    if (!res.ok) throw new Error('Failed to fetch dashboard summary');
    return res.json();
  },

  getHealth: async () => {
    const res = await fetch('/api/health');
    if (!res.ok) throw new Error('Failed to fetch health');
    return res.json();
  },

  // Batches
  getBatches: async (): Promise<WasteBatch[]> => {
    const res = await fetch('/api/batches');
    if (!res.ok) throw new Error('Failed to fetch batches');
    return res.json();
  },

  getBatch: async (ecoTrackId: string): Promise<WasteBatch> => {
    const res = await fetch(`/api/batches/${encodeURIComponent(ecoTrackId)}`);
    if (!res.ok) throw new Error(`Batch ${ecoTrackId} not found`);
    return res.json();
  },

  // QR Services
  decodeQr: async (rawPayload: string): Promise<DecodedQrResult> => {
    const res = await fetch('/api/qr/decode', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rawPayload }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Decode failed' }));
      throw new Error(err.error || 'Failed to decode QR');
    }
    return res.json();
  },

  generateQrBatch: async (data: any): Promise<WasteBatch> => {
    const res = await fetch('/api/batches/generate-qr', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'QR generation failed' }));
      throw new Error(err.error || 'Failed to generate QR');
    }
    return res.json();
  },

  // AI & Investigations
  getInvestigations: async (): Promise<InvestigationCase[]> => {
    const res = await fetch('/api/investigations');
    if (!res.ok) throw new Error('Failed to fetch investigations');
    return res.json();
  },

  getInvestigation: async (id: string): Promise<InvestigationCase> => {
    const res = await fetch(`/api/investigations/${encodeURIComponent(id)}`);
    if (!res.ok) throw new Error('Failed to fetch investigation');
    return res.json();
  },

  runAnalysis: async (ecoTrackId: string): Promise<any> => {
    const res = await fetch(`/api/investigations/${encodeURIComponent(ecoTrackId)}/analyze`, {
      method: 'POST',
    });
    if (!res.ok) throw new Error('Analysis failed');
    return res.json();
  },

  // Approvals
  getApprovals: async (): Promise<ApprovalRequest[]> => {
    const res = await fetch('/api/approvals');
    if (!res.ok) throw new Error('Failed to fetch approvals');
    return res.json();
  },

  decideApproval: async (
    id: string,
    decision: 'APPROVED' | 'REJECTED' | 'MORE_EVIDENCE_REQUESTED',
    notes: string
  ): Promise<any> => {
    const res = await fetch(`/api/approvals/${encodeURIComponent(id)}/decide`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ decision, notes }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Failed to record decision' }));
      throw new Error(err.error || 'Failed to record decision');
    }
    return res.json();
  },

  // Tools & Audit
  getToolHistory: async (): Promise<ToolCallExecution[]> => {
    const res = await fetch('/api/tools/history');
    if (!res.ok) throw new Error('Failed to fetch tool history');
    return res.json();
  },

  executeToolDirectly: async (toolName: string, args: Record<string, any>): Promise<any> => {
    const res = await fetch('/api/tools/execute', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ toolName, args }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Tool execution failed' }));
      throw new Error(err.error || 'Tool execution failed');
    }
    return res.json();
  },

  getAuditTrail: async (): Promise<AuditLogEntry[]> => {
    const res = await fetch('/api/audit-trail');
    if (!res.ok) throw new Error('Failed to fetch audit trail');
    return res.json();
  },

  getReport: async (ecoTrackId: string): Promise<IncidentReport | null> => {
    try {
      const res = await fetch(`/api/reports/${encodeURIComponent(ecoTrackId)}`);
      if (!res.ok) return null;
      return res.json();
    } catch {
      return null;
    }
  },

  generateReport: async (ecoTrackId: string): Promise<IncidentReport> => {
    const res = await fetch(`/api/reports/${encodeURIComponent(ecoTrackId)}/generate`, {
      method: 'POST',
    });
    if (!res.ok) throw new Error('Failed to generate forensic report');
    return res.json();
  },

  // Demo Controls
  getDemoState: async (): Promise<DemoScenarioState> => {
    const res = await fetch('/api/demo/state');
    if (!res.ok) throw new Error('Failed to fetch demo state');
    return res.json();
  },

  stepDemo: async (): Promise<{ demoState: DemoScenarioState; result: any }> => {
    const res = await fetch('/api/demo/step', { method: 'POST' });
    if (!res.ok) throw new Error('Failed to advance demo step');
    return res.json();
  },

  runScenario: async (): Promise<any> => {
    const res = await fetch('/api/demo/run-scenario', { method: 'POST' });
    if (!res.ok) throw new Error('Failed to run demo scenario');
    return res.json();
  },

  resetDemo: async (): Promise<any> => {
    const res = await fetch('/api/demo/reset', { method: 'POST' });
    if (!res.ok) throw new Error('Failed to reset demo');
    return res.json();
  },

  // IoT Simulator
  getIotTelemetry: async (): Promise<any> => {
    const res = await fetch('/api/iot/telemetry');
    if (!res.ok) throw new Error('Failed to fetch telemetry');
    return res.json();
  },

  simulateOfflineScan: async (batchId: string): Promise<any> => {
    const res = await fetch('/api/iot/simulate-offline', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ batchId }),
    });
    return res.json();
  },

  syncOfflineEvents: async (): Promise<any> => {
    const res = await fetch('/api/iot/sync-offline', { method: 'POST' });
    return res.json();
  },

  // Real-time Event Stream Listener
  subscribeToEvents: (onEvent: (event: { type: string; data?: any }) => void) => {
    if (typeof window === 'undefined' || !window.EventSource) return () => {};
    try {
      const es = new EventSource('/api/events/stream');
      es.onmessage = (msg) => {
        try {
          const parsed = JSON.parse(msg.data);
          onEvent(parsed);
        } catch {
          // ignore parse errors
        }
      };
      es.onerror = () => {
        // Fallback silently if SSE disconnected
      };
      return () => {
        es.close();
      };
    } catch {
      return () => {};
    }
  },
};
