import React from 'react';
import {
  Sparkles,
  AlertTriangle,
  ShieldCheck,
  CheckCircle2,
  HelpCircle,
  Scale,
  ArrowRight,
  Clock,
  Database,
  Search,
  ExternalLink,
  ChevronRight,
  ShieldAlert,
  Flame,
  FileCheck2,
} from 'lucide-react';
import { InvestigationCase, WasteBatch } from '../types/ecoconnect.ts';

interface InvestigationViewProps {
  investigation?: InvestigationCase;
  batch?: WasteBatch;
  onNavigateTab: (tabId: string) => void;
  onRunAnalysis: () => void;
  isLoading: boolean;
  demoStep: number;
}

export const InvestigationView: React.FC<InvestigationViewProps> = ({
  investigation,
  batch,
  onNavigateTab,
  onRunAnalysis,
  isLoading,
  demoStep,
}) => {
  const ecoTrackId = batch?.ecoTrackId || 'EC26-CHN-00182';
  const initialWeight = batch?.initialWeightKg || 1.80;
  const recyclerWeight = batch?.recyclerWeightKg || 1.48;
  const sortingWeight = batch?.sortingWeightKg || 1.62;
  const totalShrinkage = Number((initialWeight - recyclerWeight).toFixed(2)); // 0.32 kg

  // Determine the 6-stage investigation workflow statuses based on demoStep
  // 01 Retrieve custody history
  // 02 Compare weight readings
  // 03 Inspect missing evidence
  // 04 Generate remediation plan
  // 05 Human approval
  // 06 Execute and verify
  const getWorkflowStages = () => {
    return [
      {
        num: '01',
        name: 'Retrieve custody history',
        status: demoStep >= 2 ? 'Completed' : 'Waiting',
        detail: 'Queried smart station, collector logs, and MRF inbound receipt registry.',
      },
      {
        num: '02',
        name: 'Compare weight readings',
        status: demoStep >= 3 ? 'Completed' : 'Waiting',
        detail: `Initial: ${initialWeight}kg → Sorting: ${sortingWeight}kg → Recycler: ${recyclerWeight}kg.`,
      },
      {
        num: '03',
        name: 'Inspect missing evidence',
        status:
          demoStep >= 5
            ? 'Completed'
            : demoStep === 4
            ? 'In progress'
            : 'Waiting',
        detail: 'Discovered missing driver scan (cellular dead-zone); fetched tare calibration certificate.',
      },
      {
        num: '04',
        name: 'Generate remediation plan',
        status:
          demoStep >= 6
            ? 'Completed'
            : demoStep === 5
            ? 'In progress'
            : 'Waiting',
        detail: 'Formulated 5-step action plan separating auto-tasks from approval requirements.',
      },
      {
        num: '05',
        name: 'Human approval',
        status:
          demoStep >= 7
            ? 'Completed'
            : demoStep === 6
            ? 'In progress'
            : 'Waiting',
        detail: 'Enforces compliance gate: Awaiting authorized review before official weight correction.',
      },
      {
        num: '06',
        name: 'Execute and verify',
        status:
          demoStep >= 8
            ? 'Completed'
            : demoStep === 7
            ? 'In progress'
            : 'Waiting',
        detail: 'Execute approved tool actions, calculate recovery yield (66.67%), and seal report.',
      },
    ];
  };

  const workflowStages = getWorkflowStages();
  const rc = investigation?.rootCauseAnalysis;
  const isPendingApproval = demoStep === 6 || investigation?.status === 'AWAITING_HUMAN_APPROVAL';

  return (
    <div className="space-y-6">
      {/* Incident Hero Header (Matching Section 4) */}
      <div className="rounded-xl bg-gradient-to-r from-[#0c1220] via-[#0f172a] to-[#162035] border-2 border-slate-800 p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="text-base font-black text-white tracking-wide">
                Incident EC-001
              </span>
              <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded bg-slate-800 text-teal-300 border border-slate-700">
                EcoTrack ID: {ecoTrackId}
              </span>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded bg-[#ff5733]/20 text-[#ff6f59] border border-[#ff5733]/40 flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-[#ff5733] animate-pulse" />
                {demoStep >= 9
                  ? 'Investigation Resolved'
                  : demoStep >= 7
                  ? 'Remediation Executed'
                  : demoStep === 6
                  ? 'Approval Gate Locked'
                  : 'Investigation Open'}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Autonomous multi-source forensic investigation of weight discrepancy &amp; chain-of-custody integrity.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {isPendingApproval ? (
              <button
                onClick={() => onNavigateTab('approvals')}
                className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold shadow-lg shadow-amber-500/20 transition flex items-center gap-1.5 animate-pulse cursor-pointer"
              >
                <ShieldAlert className="h-4 w-4" />
                <span>Go to Human Approval Gate</span>
              </button>
            ) : (
              <button
                onClick={onRunAnalysis}
                disabled={isLoading}
                className="px-4 py-2 rounded-lg bg-gradient-to-r from-[#ff5733] to-[#f97316] hover:from-[#f94d27] hover:to-[#ea580c] text-white text-xs font-bold shadow-md shadow-[#ff5733]/25 transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>{isLoading ? 'Agents Investigating...' : 'Re-Run Multi-Source Investigation'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Weight Comparison Cards (Section 4 Mockup) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-4 border-t border-slate-800/80">
          <div className="p-3.5 rounded-lg bg-[#070b14]/80 border border-slate-800">
            <span className="text-[11px] text-slate-400 font-semibold block">Initial Weight</span>
            <span className="text-2xl font-black text-white font-mono mt-0.5 block">
              {initialWeight.toFixed(2)} kg
            </span>
            <span className="text-[10px] text-slate-500">Besant Nagar Smart Hub</span>
          </div>

          <div className="p-3.5 rounded-lg bg-[#070b14]/80 border border-slate-800">
            <span className="text-[11px] text-slate-400 font-semibold block">Sorting Received</span>
            <span className="text-2xl font-black text-slate-200 font-mono mt-0.5 block">
              {sortingWeight.toFixed(2)} kg
            </span>
            <span className="text-[10px] text-slate-500">Guindy MRF Weighbridge</span>
          </div>

          <div className="p-3.5 rounded-lg bg-[#070b14]/80 border border-slate-800">
            <span className="text-[11px] text-[#ff7f68] font-semibold block">Recycler Received</span>
            <span className="text-2xl font-black text-[#ff6f59] font-mono mt-0.5 block">
              {recyclerWeight.toFixed(2)} kg
            </span>
            <span className="text-[10px] text-slate-500">GreenLoop Maraimalai Nagar</span>
          </div>

          <div className="p-3.5 rounded-lg bg-[#070b14]/80 border border-slate-800">
            <span className="text-[11px] text-amber-400 font-semibold block">Total Reduction</span>
            <span className="text-2xl font-black text-amber-400 font-mono mt-0.5 block">
              -{totalShrinkage.toFixed(2)} kg
            </span>
            <span className="text-[10px] text-slate-500">17.78% total weight delta</span>
          </div>
        </div>

        {/* Hero Agent Finding Card (Word for word as required in Section 4) */}
        <div className="mt-4 p-4 rounded-xl bg-[#090e1c] border border-amber-500/30 text-xs text-slate-200 space-y-1.5">
          <div className="flex items-center gap-2 text-amber-400 font-bold uppercase tracking-wider text-[11px]">
            <Sparkles className="h-4 w-4" />
            <span>Agent finding</span>
          </div>
          <p className="text-slate-200 text-xs leading-relaxed font-medium">
            {demoStep >= 5 && rc
              ? rc.probableCause
              : `The recorded weight decreased by ${totalShrinkage.toFixed(2)} kg between initial deposit and recycler receipt. The reason has not yet been confirmed. The system must inspect intermediate records before assigning a probable cause.`}
          </p>
          {rc && (
            <div className="flex items-center gap-4 pt-1 text-[11px] text-slate-400 font-mono">
              <span className="text-teal-400 font-bold">Inference Confidence: {rc.confidencePct}%</span>
              <span>•</span>
              <span>Method: {rc.inferenceMethod}</span>
            </div>
          )}
        </div>
      </div>

      {/* 2-Column Layout: 6-Stage Investigation Workflow + Multi-Source Evidence */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 5 Cols: Investigation Workflow (Section 4) */}
        <div className="lg:col-span-5 rounded-xl bg-[#0f172a] border border-slate-800 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Investigation Workflow
            </h3>
            <span className="text-[10px] font-mono text-slate-400">
              6 Real Execution Steps
            </span>
          </div>

          <div className="space-y-3">
            {workflowStages.map((stage) => {
              const isCompleted = stage.status === 'Completed';
              const isInProgress = stage.status === 'In progress';

              return (
                <div
                  key={stage.num}
                  className={`p-3.5 rounded-xl border transition ${
                    isCompleted
                      ? 'bg-teal-950/20 border-teal-800/40'
                      : isInProgress
                      ? 'bg-[#ff5733]/10 border-[#ff5733]/50 shadow-md'
                      : 'bg-[#070b14]/60 border-slate-800/80 opacity-75'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2.5">
                      <span
                        className={`font-mono text-xs font-black ${
                          isCompleted
                            ? 'text-teal-400'
                            : isInProgress
                            ? 'text-[#ff6f59]'
                            : 'text-slate-600'
                        }`}
                      >
                        {stage.num}
                      </span>
                      <div>
                        <span
                          className={`font-bold text-xs block ${
                            isInProgress ? 'text-white' : 'text-slate-200'
                          }`}
                        >
                          {stage.name}
                        </span>
                        <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                          {stage.detail}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded shrink-0 ${
                        isCompleted
                          ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30'
                          : isInProgress
                          ? 'bg-[#ff5733]/20 text-[#ff6f59] border border-[#ff5733]/40 animate-pulse'
                          : 'bg-slate-800 text-slate-500 border border-slate-700/60'
                      }`}
                    >
                      {stage.status}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          <p className="text-[10px] text-slate-500 font-mono text-center pt-2">
            Illustrative workflow state. In the working application, update each status from actual execution results.
          </p>
        </div>

        {/* Right 7 Cols: Multi-Source Evidence & Root-Cause Hypotheses */}
        <div className="lg:col-span-7 rounded-xl bg-[#0f172a] border border-slate-800 p-5 shadow-sm space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Database className="h-4 w-4 text-teal-400" />
              <span>Multi-Source Correlated Evidence</span>
            </h3>
            <span className="text-xs font-mono text-teal-400 font-bold">
              5 Data Sources
            </span>
          </div>

          {/* Evidence Triad: Confirmed Facts vs Missing vs Excluded */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            {/* Confirmed Facts */}
            <div className="p-3.5 rounded-lg bg-teal-950/20 border border-teal-800/40 space-y-2">
              <div className="flex items-center gap-1.5 text-teal-300 font-bold">
                <CheckCircle2 className="h-3.5 w-3.5 text-teal-400" />
                <span>Confirmed Facts</span>
              </div>
              <ul className="space-y-1.5 text-[11px] text-slate-300">
                <li className="flex items-start gap-1">
                  <span className="text-teal-400 font-bold">•</span>
                  <span>1.80 kg registered on ESP32 HX711 load cell (Besant Nagar).</span>
                </li>
                <li className="flex items-start gap-1">
                  <span className="text-teal-400 font-bold">•</span>
                  <span>1.62 kg weighed at Guindy MRF (0.18 kg labels/moisture culled).</span>
                </li>
                <li className="flex items-start gap-1">
                  <span className="text-teal-400 font-bold">•</span>
                  <span>1.48 kg gross received at GreenLoop Recycler (tare slip #4401).</span>
                </li>
                <li className="flex items-start gap-1">
                  <span className="text-teal-400 font-bold">•</span>
                  <span>Truck seal #SEAL-MRF-88219 verified intact upon delivery.</span>
                </li>
              </ul>
            </div>

            {/* Missing Evidence */}
            <div className="p-3.5 rounded-lg bg-amber-950/20 border border-amber-800/40 space-y-2">
              <div className="flex items-center gap-1.5 text-amber-300 font-bold">
                <HelpCircle className="h-3.5 w-3.5 text-amber-400" />
                <span>Missing Evidence</span>
              </div>
              <ul className="space-y-1.5 text-[11px] text-slate-300">
                <li className="flex items-start gap-1">
                  <span className="text-amber-400 font-bold">•</span>
                  <span>Direct driver pickup scan was missing (cellular dead-zone in Guindy).</span>
                </li>
                <li className="flex items-start gap-1">
                  <span className="text-amber-400 font-bold">•</span>
                  <span>Real-time truck bed humidity telemetry during 32°C transport.</span>
                </li>
              </ul>
            </div>

            {/* Assumptions Excluded */}
            <div className="p-3.5 rounded-lg bg-[#070b14] border border-slate-800 space-y-2">
              <div className="flex items-center gap-1.5 text-slate-300 font-bold">
                <ShieldCheck className="h-3.5 w-3.5 text-teal-400" />
                <span>Assumptions Excluded</span>
              </div>
              <ul className="space-y-1.5 text-[11px] text-slate-400">
                <li className="flex items-start gap-1">
                  <span className="text-slate-500">•</span>
                  <span>Theft or dumping ruled out (tamper seal intact).</span>
                </li>
                <li className="flex items-start gap-1">
                  <span className="text-slate-500">•</span>
                  <span>Polymer substitution ruled out (optical signature matches PET).</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Autonomous Root Cause Justification */}
          {rc && (
            <div className="p-4 rounded-xl bg-[#090e1c] border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  Inference Justification &amp; Probable Explanations
                </span>
                <span className="font-mono text-teal-400 font-bold text-xs">
                  {rc.confidencePct}% Confidence
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">{rc.justification}</p>
              <div className="pt-2 border-t border-slate-800/80">
                <span className="text-[11px] font-semibold text-slate-400 block mb-1">
                  Potential Explanations Evaluated:
                </span>
                <ul className="space-y-1 text-[11px] text-slate-300 font-mono">
                  {rc.potentialExplanations.map((exp, i) => (
                    <li key={i} className="flex items-center gap-1.5">
                      <ChevronRight className="h-3 w-3 text-teal-400" />
                      <span>{exp}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Remediation Plan Snapshot */}
          {investigation?.remediationPlan && investigation.remediationPlan.length > 0 && (
            <div className="pt-2 border-t border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  Remediation Action Plan ({investigation.remediationPlan.length} Steps)
                </span>
                <button
                  onClick={() => onNavigateTab('approvals')}
                  className="text-xs font-bold text-teal-400 hover:text-teal-300 flex items-center gap-1"
                >
                  <span>Review in Approval Centre</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
              <div className="space-y-1.5">
                {investigation.remediationPlan.slice(0, 3).map((step) => (
                  <div
                    key={step.stepNumber}
                    className="p-2.5 rounded-lg bg-[#070b14] border border-slate-800 text-xs flex items-center justify-between"
                  >
                    <span className="text-slate-300">
                      #{step.stepNumber} {step.title}
                    </span>
                    <span
                      className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                        step.status === 'EXECUTED'
                          ? 'bg-teal-500/20 text-teal-300'
                          : step.status === 'WAITING_APPROVAL'
                          ? 'bg-amber-500/20 text-amber-300'
                          : 'bg-slate-800 text-slate-500'
                      }`}
                    >
                      {step.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
