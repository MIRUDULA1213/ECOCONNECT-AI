import React, { useState, useEffect, useCallback } from 'react';
import { AppLayout } from './components/layout/AppLayout.tsx';
import { NavTabId } from './components/layout/Sidebar.tsx';
import { OverviewPage } from './components/views/OverviewPage.tsx';
import { QRScannerPage } from './components/views/QRScannerPage.tsx';
import { QRGeneratorPage } from './components/views/QRGeneratorPage.tsx';
import { WastePassportPage } from './components/views/WastePassportPage.tsx';
import { AIIntelligencePage } from './components/views/AIIntelligencePage.tsx';
import { ApprovalPage } from './components/views/ApprovalPage.tsx';
import { ReportsPage } from './components/views/ReportsPage.tsx';
import { SettingsPage } from './components/views/SettingsPage.tsx';
import { BiosciencePage } from './components/views/BiosciencePage.tsx';

import {
  WasteBatch,
  ApprovalRequest,
  InvestigationCase,
  AuditLogEntry,
  IncidentReport,
  DemoScenarioState,
} from './types/ecoconnect.ts';
import { api, DashboardSummary } from './services/api.ts';

export default function App() {
  const [activeTab, setActiveTab] = useState<NavTabId>('overview');
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [batches, setBatches] = useState<WasteBatch[]>([]);
  const [approvals, setApprovals] = useState<ApprovalRequest[]>([]);
  const [investigations, setInvestigations] = useState<InvestigationCase[]>([]);
  const [auditTrail, setAuditTrail] = useState<AuditLogEntry[]>([]);
  const [currentReport, setCurrentReport] = useState<IncidentReport | null>(null);
  const [selectedBatchId, setSelectedBatchId] = useState<string>('EC26-CHN-00182');

  const [demoState, setDemoState] = useState<DemoScenarioState>({
    currentStep: 0,
    totalSteps: 9,
    stepName: 'Ready to Ingest',
    stepDescription: 'System initialized. Ready for tracking or demonstration.',
    ecoTrackId: 'EC26-CHN-00182',
    isPlaying: false,
    isCompleted: false,
    stepHistory: [],
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'alert' | 'info' } | null>(null);

  const showToast = (message: string, type: 'success' | 'alert' | 'info' = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 5000);
  };

  // Primary Data Refresh
  const refreshAll = useCallback(async () => {
    try {
      const [sumData, batchList, appList, invList, auditList, demoData] = await Promise.all([
        api.getSummary().catch(() => null),
        api.getBatches().catch(() => []),
        api.getApprovals().catch(() => []),
        api.getInvestigations().catch(() => []),
        api.getAuditTrail().catch(() => []),
        api.getDemoState().catch(() => null),
      ]);

      if (sumData) setSummary(sumData);
      if (batchList) setBatches(batchList);
      if (appList) setApprovals(appList);
      if (invList) setInvestigations(invList);
      if (auditList) setAuditTrail(auditList);
      if (demoData) setDemoState(demoData);

      // Check for report
      if (selectedBatchId) {
        const rep = await api.getReport(selectedBatchId);
        setCurrentReport(rep);
      }
    } catch (err) {
      console.error('Failed to refresh data:', err);
    }
  }, [selectedBatchId]);

  // Initial mount & real-time SSE event listener
  useEffect(() => {
    refreshAll();

    // Subscribe to backend event stream
    const unsubscribe = api.subscribeToEvents((event) => {
      setIsConnected(true);
      if (event.type === 'AUDIT_ENTRY' || event.type === 'DEMO_STATE_CHANGED' || event.type === 'TOOL_EXECUTION') {
        refreshAll();
      }
    });

    return () => {
      unsubscribe();
    };
  }, [refreshAll]);

  // Run Scenario
  const handleRunDemo = async () => {
    setIsLoading(true);
    try {
      const res = await api.runScenario();
      if (res.demoState) setDemoState(res.demoState);
      await refreshAll();

      // Navigate to overview or approvals
      if (res.demoState?.currentStep === 6) {
        showToast('Autonomous scenario reached Step 6: Paused at Human Approval Gate.', 'alert');
        setActiveTab('approvals');
      } else {
        showToast('Autonomous scenario executed successfully.', 'success');
      }
    } catch (err: any) {
      showToast(err.message || 'Demo run failed', 'alert');
    } finally {
      setIsLoading(false);
    }
  };

  // Reset Demo
  const handleResetDemo = async () => {
    setIsLoading(true);
    try {
      const res = await api.resetDemo();
      if (res.demoState) setDemoState(res.demoState);
      setSelectedBatchId('EC26-CHN-00182');
      await refreshAll();
      setActiveTab('overview');
      showToast('ECOCONNECT scenario reset to pristine Step 0.', 'info');
    } catch (err: any) {
      showToast(err.message || 'Reset failed', 'alert');
    } finally {
      setIsLoading(false);
    }
  };

  // Decide Approval
  const handleDecideApproval = async (
    id: string,
    decision: 'APPROVED' | 'REJECTED' | 'MORE_EVIDENCE_REQUESTED',
    notes: string
  ) => {
    setIsLoading(true);
    try {
      await api.decideApproval(id, decision, notes);
      await refreshAll();
      if (decision === 'APPROVED') {
        showToast('Consequential action APPROVED. Tare weight corrected to 1.48 kg.', 'success');
        setActiveTab('tracking');
      } else if (decision === 'REJECTED') {
        showToast('Action REJECTED. Safe quarantine alternative plan triggered.', 'alert');
      } else {
        showToast('More evidence requested from facility weighbridge.', 'info');
      }
    } catch (err: any) {
      showToast(err.message || 'Decision failed', 'alert');
    } finally {
      setIsLoading(false);
    }
  };

  // Generate Report
  const handleGenerateReport = async () => {
    setIsLoading(true);
    try {
      const rep = await api.generateReport(selectedBatchId);
      setCurrentReport(rep);
      await refreshAll();
      showToast(`Forensic report ${rep.reportId} compiled & sealed.`, 'success');
    } catch (err: any) {
      showToast(err.message || 'Report generation failed', 'alert');
    } finally {
      setIsLoading(false);
    }
  };

  const selectedBatch = batches.find((b) => b.ecoTrackId === selectedBatchId) || batches[0] || null;
  const currentInvestigation =
    investigations.find((i) => i.ecoTrackId === selectedBatchId) || investigations[0] || null;

  const pendingApprovalsCount = approvals.filter((a) => !a.decision).length;
  const openIncidentsCount = batches.filter((b) => b.status === 'DISCREPANCY_FLAGGED').length;

  return (
    <AppLayout
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      batches={batches}
      notifications={auditTrail}
      onSearchBatch={(id) => {
        setSelectedBatchId(id);
        setActiveTab('tracking');
      }}
      onRunDemo={handleRunDemo}
      onResetDemo={handleResetDemo}
      isDemoLoading={isLoading}
      demoStep={demoState.currentStep}
      pendingApprovalsCount={pendingApprovalsCount}
      openIncidentsCount={openIncidentsCount}
      isConnected={isConnected}
    >
      {/* Toast Notification Container */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 max-w-md">
          <div
            className={`p-4 rounded-xl shadow-2xl border flex items-center justify-between gap-3 text-xs font-semibold ${
              toast.type === 'success'
                ? 'bg-teal-950/95 text-teal-200 border-teal-500/50'
                : toast.type === 'alert'
                ? 'bg-[#ff5733]/90 text-white border-[#ff5733]'
                : 'bg-slate-900/95 text-slate-200 border-slate-700'
            }`}
          >
            <span>{toast.message}</span>
            <button
              onClick={() => setToast(null)}
              className="text-slate-400 hover:text-white font-bold ml-2 cursor-pointer"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Viewport View Routing */}
      {activeTab === 'overview' && (
        <OverviewPage
          summary={summary}
          batches={batches}
          onNavigateTab={setActiveTab}
          onSelectBatch={(id) => {
            setSelectedBatchId(id);
            setActiveTab('tracking');
          }}
          onRunDemo={handleRunDemo}
          onResetDemo={handleResetDemo}
          isDemoLoading={isLoading}
        />
      )}

      {activeTab === 'scan_qr' && (
        <QRScannerPage
          onBatchResolved={(id) => {
            setSelectedBatchId(id);
            refreshAll();
          }}
          onNavigateTab={setActiveTab}
        />
      )}

      {activeTab === 'generate_qr' && (
        <QRGeneratorPage
          onBatchCreated={(b) => {
            setSelectedBatchId(b.ecoTrackId);
            refreshAll();
            showToast(`Created EcoTrack Passport for ${b.ecoTrackId}!`, 'success');
          }}
          onNavigateTab={setActiveTab}
        />
      )}

      {activeTab === 'tracking' && (
        <WastePassportPage
          batch={selectedBatch}
          batches={batches}
          onSelectBatch={(id) => {
            setSelectedBatchId(id);
            refreshAll();
          }}
          onNavigateTab={setActiveTab}
        />
      )}

      {activeTab === 'ai_intelligence' && (
        <AIIntelligencePage
          batch={selectedBatch}
          investigation={currentInvestigation}
          onNavigateTab={setActiveTab}
          demoStep={demoState.currentStep}
        />
      )}

      {activeTab === 'bioscience' && (
        <BiosciencePage
          batch={selectedBatch}
          onNavigateTab={setActiveTab}
        />
      )}

      {activeTab === 'approvals' && (
        <ApprovalPage
          approvals={approvals}
          onDecideApproval={handleDecideApproval}
          isLoading={isLoading}
          onNavigateTab={setActiveTab}
        />
      )}

      {activeTab === 'reports' && (
        <ReportsPage
          report={currentReport}
          auditTrail={auditTrail}
          batch={selectedBatch}
          onGenerateReport={handleGenerateReport}
          isLoading={isLoading}
        />
      )}

      {activeTab === 'settings' && (
        <SettingsPage
          onRunDemo={handleRunDemo}
          onResetDemo={handleResetDemo}
          isDemoLoading={isLoading}
        />
      )}
    </AppLayout>
  );
}
