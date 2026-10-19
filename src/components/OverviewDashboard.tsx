import React from 'react';
import {
  Scale,
  ShieldCheck,
  AlertTriangle,
  Clock,
  ArrowUpRight,
  TrendingUp,
  Cpu,
  Radio,
  ChevronRight,
  CheckCircle2,
  Sparkles,
  FileText,
  Play,
  ArrowRight,
  Flame,
} from 'lucide-react';
import { WasteBatch, ApprovalRequest, InvestigationCase } from '../types/ecoconnect.ts';

interface OverviewDashboardProps {
  batches: WasteBatch[];
  approvals: ApprovalRequest[];
  investigations: InvestigationCase[];
  onSelectBatch: (id: string) => void;
  onNavigateTab: (tabId: string) => void;
  onRunDemo: () => void;
  demoStep: number;
}

export const OverviewDashboard: React.FC<OverviewDashboardProps> = ({
  batches,
  approvals,
  investigations,
  onSelectBatch,
  onNavigateTab,
  onRunDemo,
  demoStep,
}) => {
  const pendingApprovalsCount = approvals.filter((a) => !a.decision).length;
  const activeIncidentsCount = batches.filter(
    (b) => b.status === 'DISCREPANCY_FLAGGED' || b.status === 'INVESTIGATION_PENDING'
  ).length;

  return (
    <div className="space-y-6">
      {/* Platform Title Banner matching Section 2 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              ECOCONNECT
            </h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-coral-500/15 text-[#ff6f59] border border-[#ff5733]/40 font-bold uppercase">
              DEMO MODE
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Agentic Waste Intelligence Platform • <span className="text-slate-300">Chennai · Demo data</span>
          </p>
        </div>

        {/* 3 Value Propositions for Judges */}
        <div className="hidden lg:flex items-center gap-4 text-[11px] text-slate-400">
          <div className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-teal-400" />
            <span>1. What happened to waste?</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-[#ff5733]" />
            <span>2. What is AI agent doing?</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
            <span>3. Can system prove outcome?</span>
          </div>
        </div>
      </div>

      {/* Hero Metrics + Agent Activity Card (Section 2 Layout) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: 4 Core Stat Cards */}
        <div className="lg:col-span-2 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Card 1: Waste batches */}
            <div
              onClick={() => onNavigateTab('tracking')}
              className="rounded-xl bg-[#0f172a] border border-slate-800 p-5 shadow-sm hover:border-slate-700 transition cursor-pointer"
            >
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Waste batches
                </span>
                <div className="p-2 rounded-lg bg-[#162035] text-teal-400">
                  <ShieldCheck className="h-4 w-4" />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-white"># 128</span>
              </div>
              <p className="text-xs text-slate-400 mt-1">Tracked batches in Chennai metro</p>
            </div>

            {/* Card 2: Recovery verified */}
            <div
              onClick={() => onNavigateTab('impact')}
              className="rounded-xl bg-[#0f172a] border border-slate-800 p-5 shadow-sm hover:border-slate-700 transition cursor-pointer"
            >
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-teal-300">
                  Recovery verified
                </span>
                <div className="p-2 rounded-lg bg-[#162035] text-teal-400">
                  <TrendingUp className="h-4 w-4" />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-teal-400"># 86.4 kg</span>
              </div>
              <p className="text-xs text-slate-400 mt-1">Validated flake recovery (66.7% yield)</p>
            </div>

            {/* Card 3: Pending approvals */}
            <div
              onClick={() => onNavigateTab('approvals')}
              className="rounded-xl bg-[#0f172a] border border-slate-800 p-5 shadow-sm hover:border-amber-500/40 transition cursor-pointer"
            >
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-300">
                  Pending approvals
                </span>
                <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
                  <Clock className="h-4 w-4" />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-amber-400">
                  # {pendingApprovalsCount > 0 ? `0${pendingApprovalsCount}` : '03'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">Awaiting authorized reviewer</p>
            </div>

            {/* Card 4: Open incidents */}
            <div
              onClick={() => onNavigateTab('investigation')}
              className="rounded-xl bg-[#0f172a] border border-slate-800 p-5 shadow-sm hover:border-[#ff5733]/50 transition cursor-pointer"
            >
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#ff7f68]">
                  Open incidents
                </span>
                <div className="p-2 rounded-lg bg-[#ff5733]/10 text-[#ff6f59]">
                  <AlertTriangle className="h-4 w-4" />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-[#ff6f59]">
                  # {activeIncidentsCount > 0 ? `0${activeIncidentsCount}` : '05'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">Require multi-source investigation</p>
            </div>
          </div>

          {/* Quick Problem Statement & Architectural Anchor */}
          <div className="p-4 rounded-xl bg-[#0b1222] border border-slate-800/80 flex items-start gap-3">
            <div className="p-2 rounded-lg bg-teal-500/10 text-teal-400 shrink-0 mt-0.5">
              <Sparkles className="h-4 w-4" />
            </div>
            <div className="text-xs text-slate-300 space-y-1">
              <span className="font-bold text-white block">
                Digital Chain of Custody &amp; Autonomous Forensic Investigation
              </span>
              <p className="text-slate-400 leading-relaxed text-[11px]">
                ECOCONNECT provides an Amazon-style digital passport for every recyclable batch. When physical shrinkage or missing scans occur between household stations, MRFs, and recyclers, specialized AI agents correlate disparate IoT weighbridge records, infer root causes, and submit remediation actions for human authorization.
              </p>
            </div>
          </div>
        </div>

        {/* Right Col: Live Agent Activity Card & End-to-End Demo CTA */}
        <div className="rounded-xl bg-gradient-to-b from-[#0f172a] to-[#0c1322] border-2 border-slate-800 p-5 shadow-xl flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-[#ff5733] animate-ping" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Agent Activity
                </h3>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-teal-500/15 text-teal-300 border border-teal-500/30 font-bold">
                Investigating
              </span>
            </div>

            {/* Step sequence mockup list as specified in section 2 */}
            <div className="space-y-2 text-xs">
              <div className="p-2.5 rounded-lg bg-[#070b14]/70 border border-slate-800/80 space-y-0.5">
                <div className="flex items-center justify-between text-slate-400 text-[11px]">
                  <span>Waste batch ingested</span>
                  <span className="font-mono text-teal-400">Step 1</span>
                </div>
                <div className="font-mono text-white font-bold text-xs">
                  EcoTrack ID: <span className="text-[#ff6f59]">EC26-CHN-00182</span>
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-[#070b14]/70 border border-slate-800/80 space-y-0.5">
                <div className="flex items-center justify-between text-slate-400 text-[11px]">
                  <span>Weight discrepancy detected</span>
                  <span className="font-mono text-amber-400">Step 3-4</span>
                </div>
                <div className="text-slate-300 text-xs">
                  Comparing sorting (1.62 kg) and recycler records (1.48 kg)
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-[#070b14]/70 border border-slate-800/80 space-y-0.5">
                <div className="flex items-center justify-between text-slate-400 text-[11px]">
                  <span>Approval required</span>
                  <span className="font-mono text-[#ff6f59]">Step 6</span>
                </div>
                <div className="text-slate-300 text-xs">
                  Awaiting authorized compliance reviewer before weight correction
                </div>
              </div>
            </div>
          </div>

          {/* Prominent Coral Primary Button */}
          <div className="pt-2">
            <button
              onClick={onRunDemo}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#ff5733] to-[#f97316] hover:from-[#f94d27] hover:to-[#ea580c] text-white text-xs font-black tracking-wide shadow-xl shadow-[#ff5733]/30 transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <Play className="h-4 w-4 fill-current" />
              <span>RUN END-TO-END DEMO</span>
            </button>
            <p className="text-[10px] text-center text-slate-500 mt-2 font-mono">
              Illustrative dashboard mockup · All metrics shown above are sample values, not live operational data.
            </p>
          </div>
        </div>
      </div>

      {/* Live Waste Batches Stream */}
      <div className="rounded-xl bg-[#0f172a] border border-slate-800 overflow-hidden shadow-sm">
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white tracking-wide">
              Tracked Batches Ledger (Digital Chain of Custody)
            </h3>
            <p className="text-xs text-slate-400">
              Select a batch to inspect its digital passport, custody hops, and weight progression
            </p>
          </div>
          <button
            onClick={() => onNavigateTab('tracking')}
            className="text-xs font-bold text-teal-400 hover:text-teal-300 flex items-center gap-1"
          >
            <span>Open Live Tracking</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="divide-y divide-slate-800/80">
          {batches.map((b) => {
            const hops = b.custodyHistory.length;
            const hasAnomaly = b.status === 'DISCREPANCY_FLAGGED';
            const isVerified = b.status === 'RECOVERY_VERIFIED';
            const isApproval = b.status === 'APPROVAL_REQUIRED';

            return (
              <div
                key={b.ecoTrackId}
                onClick={() => {
                  onSelectBatch(b.ecoTrackId);
                  onNavigateTab('tracking');
                }}
                className="p-4 hover:bg-slate-800/40 transition cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`h-10 w-10 rounded-lg flex items-center justify-center shrink-0 ${
                      isVerified
                        ? 'bg-teal-500/15 text-teal-300 border border-teal-500/30'
                        : hasAnomaly
                        ? 'bg-[#ff5733]/15 text-[#ff6f59] border border-[#ff5733]/30'
                        : isApproval
                        ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                        : 'bg-slate-800 text-slate-300 border border-slate-700'
                    }`}
                  >
                    <Scale className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-bold text-white hover:text-teal-400 transition">
                        {b.ecoTrackId}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          isVerified
                            ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30'
                            : hasAnomaly
                            ? 'bg-[#ff5733]/20 text-[#ff7f68] border border-[#ff5733]/30'
                            : isApproval
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : 'bg-slate-800 text-slate-300 border border-slate-700'
                        }`}
                      >
                        {b.status.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                      <span>{b.material}</span>
                      <span>•</span>
                      <span>Initial: {b.initialWeightKg.toFixed(2)} kg</span>
                      {b.verifiedRecoveryWeightKg && (
                        <>
                          <span>•</span>
                          <span className="text-teal-400 font-bold">
                            Verified: {b.verifiedRecoveryWeightKg.toFixed(2)} kg ({b.recoveryYieldPct}%)
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 sm:text-right">
                  <div className="text-xs">
                    <span className="text-slate-500 block">Scans Recorded</span>
                    <span className="font-mono font-semibold text-slate-200">
                      {hops} Checkpoints
                    </span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-slate-500" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
