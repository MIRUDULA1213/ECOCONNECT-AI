import React from 'react';
import {
  Layers,
  Scale,
  ShieldCheck,
  AlertTriangle,
  ArrowRight,
  Scan,
  QrCode,
  Search,
  CheckCircle2,
  ExternalLink,
  Sparkles,
  Play,
  RotateCcw,
} from 'lucide-react';
import { KpiCard } from '../common/KpiCard.tsx';
import { AiAgentOrb } from '../ai/AiAgentOrb.tsx';
import { AgentWorkflow } from '../ai/AgentWorkflow.tsx';
import { WasteCategoryDistributionChart } from './WasteCategoryDistributionChart.tsx';
import { DashboardSummary } from '../../services/api.ts';
import { WasteBatch } from '../../types/ecoconnect.ts';
import { NavTabId } from '../layout/Sidebar.tsx';

interface OverviewPageProps {
  summary: DashboardSummary | null;
  batches?: WasteBatch[];
  onNavigateTab: (tab: NavTabId) => void;
  onSelectBatch: (id: string) => void;
  onRunDemo: () => void;
  onResetDemo: () => void;
  isDemoLoading?: boolean;
}

export const OverviewPage: React.FC<OverviewPageProps> = ({
  summary,
  batches = [],
  onNavigateTab,
  onSelectBatch,
  onRunDemo,
  onResetDemo,
  isDemoLoading = false,
}) => {
  const kpis = summary?.kpis || {
    trackedBatches: 4,
    collectedWeightKg: 86.4,
    verifiedRecoveryKg: 42.1,
    pendingApprovals: 0,
    activeAnomalies: 1,
    recoveryYieldPct: 66.7,
  };

  const activeBatch = summary?.activeBatch;
  const currentStep = activeBatch?.currentStep || 0;

  // Map demo steps 0..9 to 7 workflow stages
  // 0: INGEST (0)
  // 1: INGEST (0)
  // 2: ANALYZE (1)
  // 3-4: INVESTIGATE (2)
  // 5: PLAN (3)
  // 6: APPROVE (4)
  // 7: EXECUTE (5)
  // 8-9: VERIFY (6)
  const getWorkflowStageIndex = (step: number) => {
    if (step <= 1) return 0;
    if (step === 2) return 1;
    if (step === 3 || step === 4) return 2;
    if (step === 5) return 3;
    if (step === 6) return 4;
    if (step === 7) return 5;
    return 6;
  };

  const currentStageIndex = getWorkflowStageIndex(currentStep);
  const isAwaitingApproval = currentStep === 6;

  // Determine Agent Orb state
  const getOrbState = () => {
    if (currentStep === 9) return 'verified';
    if (isAwaitingApproval) return 'thinking';
    if (currentStep >= 3 && currentStep <= 5) return 'investigating';
    if (currentStep === 7) return 'executing';
    if (kpis.activeAnomalies > 0 && currentStep >= 3) return 'error';
    return 'idle';
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* 1. Compact Welcome Header with Operational Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800/60">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            Waste intelligence, made transparent.
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Track every batch. Verify every recovery.
          </p>
        </div>

        {/* Quick Top Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigateTab('scan_qr')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#11192b] hover:bg-[#1a253d] text-teal-300 text-xs font-semibold border border-teal-500/30 transition cursor-pointer"
          >
            <Scan className="h-3.5 w-3.5" />
            <span>Scan QR</span>
          </button>
          <button
            onClick={() => onNavigateTab('generate_qr')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#11192b] hover:bg-[#1a253d] text-slate-200 text-xs font-semibold border border-slate-700/60 transition cursor-pointer"
          >
            <QrCode className="h-3.5 w-3.5 text-[#ff5733]" />
            <span>Generate QR</span>
          </button>
        </div>
      </div>

      {/* 2. Three or Four Important KPI Cards Only */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <KpiCard
          label="Tracked Batches"
          value={kpis.trackedBatches}
          subtitle="Certified EcoTrack IDs"
          icon={Layers}
          accentColor="slate"
          onClick={() => onNavigateTab('tracking')}
        />

        <KpiCard
          label="Collected Weight"
          value={kpis.collectedWeightKg}
          unit="kg"
          subtitle="Verified IoT sensor inputs"
          icon={Scale}
          trend={{ value: '+14.2% yield', isPositive: true }}
          accentColor="slate"
        />

        <KpiCard
          label="Verified Recovery"
          value={kpis.verifiedRecoveryKg}
          unit="kg"
          subtitle={`Yield: ${kpis.recoveryYieldPct}%`}
          icon={ShieldCheck}
          accentColor="teal"
          onClick={() => onNavigateTab('reports')}
        />

        <KpiCard
          label="Pending Approvals"
          value={kpis.pendingApprovals}
          subtitle={
            kpis.pendingApprovals > 0 ? 'Requires human sign-off' : 'All decisions authorized'
          }
          icon={AlertTriangle}
          accentColor={kpis.pendingApprovals > 0 ? 'amber' : 'slate'}
          onClick={() => onNavigateTab('approvals')}
        />
      </div>

      {/* 3. Main Feature: Live AI Activity Section */}
      <div className="rounded-xl bg-[#0c1220]/90 border border-slate-800/80 p-5 sm:p-6 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800/60">
          <div className="flex items-center gap-4">
            <AiAgentOrb
              state={getOrbState()}
              size="md"
              label={
                currentStep === 9
                  ? 'Audit Sealed & Verified'
                  : isAwaitingApproval
                  ? 'Approval Gate Active'
                  : 'Autonomous Agent Active'
              }
              sublabel={
                activeBatch
                  ? `Active passport: ${activeBatch.ecoTrackId} (${activeBatch.material})`
                  : 'Monitoring custody events'
              }
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={onRunDemo}
              disabled={isDemoLoading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-[#ff5733] to-[#f97316] hover:from-[#f94d27] hover:to-[#ea580c] text-white text-xs font-bold shadow-md shadow-[#ff5733]/20 transition cursor-pointer disabled:opacity-50"
            >
              <Play className="h-3.5 w-3.5 fill-current" />
              <span>{isDemoLoading ? 'Running Agent...' : 'Run Autonomous Scenario'}</span>
            </button>

            <button
              onClick={onResetDemo}
              disabled={isDemoLoading}
              title="Reset Demo to Step 0"
              className="p-1.5 rounded-lg bg-[#11192b] hover:bg-[#1a253d] text-slate-400 hover:text-white border border-slate-700/60 transition cursor-pointer disabled:opacity-50"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>

            <button
              onClick={() => {
                if (activeBatch) {
                  onSelectBatch(activeBatch.ecoTrackId);
                  onNavigateTab('tracking');
                }
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#11192b] hover:bg-[#1a253d] text-xs font-semibold text-teal-300 border border-teal-500/30 transition cursor-pointer"
            >
              <span>View Waste Passport</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>

            {isAwaitingApproval && (
              <button
                onClick={() => onNavigateTab('approvals')}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-[#ff5733] hover:from-amber-600 hover:to-[#f94d27] text-white text-xs font-bold shadow-md shadow-amber-500/20 transition cursor-pointer animate-pulse"
              >
                <span>Authorize Action</span>
              </button>
            )}
          </div>
        </div>

        {/* Real-time Agent Workflow Animation */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold text-slate-300">Live Agent Chain of Custody</span>
            <span className="font-mono text-[11px] text-teal-400">
              {activeBatch?.stepName || 'Step 0: Initialized'}
            </span>
          </div>

          <AgentWorkflow
            currentStageIndex={currentStageIndex}
            isAwaitingApproval={isAwaitingApproval}
            onStageClick={(key) => {
              if (key === 'APPROVE') onNavigateTab('approvals');
              else if (key === 'INVESTIGATE') onNavigateTab('ai_intelligence');
              else onNavigateTab('tracking');
            }}
          />
        </div>

        {/* Current Investigation Finding */}
        <div className="rounded-lg bg-[#070b14] border border-slate-800/80 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Current Finding &amp; Next Action
            </span>
            <p className="text-slate-200 mt-1 max-w-2xl leading-relaxed">
              {activeBatch?.stepDescription ||
                'Tracking active waste stream. Calibrated load-cell weight 1.80 kg registered at Besant Nagar Smart Hub.'}
            </p>
          </div>

          <button
            onClick={() => onNavigateTab('ai_intelligence')}
            className="shrink-0 flex items-center gap-1 text-teal-400 hover:text-teal-300 font-semibold cursor-pointer"
          >
            <span>Inspect Evidence</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* 4. Waste Category Distribution Chart (Recharts) */}
      <WasteCategoryDistributionChart
        batches={batches}
        onCategoryClick={() => onNavigateTab('tracking')}
      />

      {/* 5. Compact Recent Activity List (Latest 3-5 events only) */}
      <div className="rounded-xl bg-[#0c1220]/90 border border-slate-800/80 p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800/60">
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight">Recent Custody Activity</h3>
            <p className="text-xs text-slate-400">Latest immutable ledger operations</p>
          </div>

          <button
            onClick={() => onNavigateTab('reports')}
            className="text-xs font-semibold text-teal-400 hover:text-teal-300 flex items-center gap-1 cursor-pointer"
          >
            <span>View All in Audit Log</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="divide-y divide-slate-800/60">
          {(summary?.recentActivity || []).slice(0, 4).map((item) => (
            <div
              key={item.id}
              onClick={() => {
                onSelectBatch(item.ecoTrackId);
                onNavigateTab('tracking');
              }}
              className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-[#11192b]/50 px-2 rounded-lg transition cursor-pointer text-xs"
            >
              <div className="flex items-start sm:items-center gap-3">
                <span className="font-mono font-bold text-teal-300 shrink-0">
                  {item.ecoTrackId}
                </span>
                <span className="text-slate-300 line-clamp-1">{item.details}</span>
              </div>

              <div className="flex items-center gap-3 text-slate-400 font-mono text-[11px] shrink-0">
                <span>{item.actor}</span>
                <span>·</span>
                <span>
                  {new Date(item.timestamp).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
