import React from 'react';
import {
  Play,
  RotateCcw,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldAlert,
  Sparkles,
  ChevronRight,
  AlertCircle,
} from 'lucide-react';
import { DemoScenarioState } from '../types/ecoconnect.ts';

interface DemoHeroBarProps {
  demoState: DemoScenarioState;
  onNextStep: () => void;
  onAutoRun: () => void;
  onReset: () => void;
  isLoading: boolean;
  onJumpToTab: (tabId: string) => void;
}

const STEP_LABELS = [
  '0. Ingest Ready',
  '1. IoT Ingestion',
  '2. Sorting Intake',
  '3. Discrepancy Ingest',
  '4. Multi-Source AI',
  '5. Root Cause Inferred',
  '6. Approval Gate',
  '7. Tool Execution',
  '8. Verified Recovery',
  '9. Sealed Report',
];

export const DemoHeroBar: React.FC<DemoHeroBarProps> = ({
  demoState,
  onNextStep,
  onAutoRun,
  onReset,
  isLoading,
  onJumpToTab,
}) => {
  const current = demoState.currentStep;

  const getRecommendedAction = () => {
    if (current === 0) {
      return {
        label: 'Step 1: Ingest Batch & IoT Readings',
        action: onNextStep,
        tab: 'tracking',
      };
    }
    if (current === 2) {
      return {
        label: 'Step 3: Ingest Recycler Discrepancy',
        action: onNextStep,
        tab: 'investigation',
      };
    }
    if (current === 3) {
      return {
        label: 'Step 4: Launch Multi-Source Investigation',
        action: onNextStep,
        tab: 'investigation',
      };
    }
    if (current === 4) {
      return {
        label: 'Step 5: Run Autonomous Root-Cause Analysis',
        action: onNextStep,
        tab: 'investigation',
      };
    }
    if (current === 5) {
      return {
        label: 'Step 6: Open Human Approval Gate',
        action: onNextStep,
        tab: 'approvals',
      };
    }
    if (current === 6) {
      return {
        label: 'Go to Approval Centre to Authorize',
        action: () => onJumpToTab('approvals'),
        tab: 'approvals',
      };
    }
    if (current === 7) {
      return {
        label: 'Step 8: Verify Flake Recovery Yield & Notify',
        action: onNextStep,
        tab: 'tracking',
      };
    }
    if (current === 8) {
      return {
        label: 'Step 9: Seal Forensic Incident Report',
        action: onNextStep,
        tab: 'audit_reports',
      };
    }
    return {
      label: 'View Incident Report & Audit Trail',
      action: () => onJumpToTab('audit_reports'),
      tab: 'audit_reports',
    };
  };

  const rec = getRecommendedAction();

  return (
    <div className="bg-[#0b101d] border-b border-slate-800/90 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        {/* Top Info Banner */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-slate-800/60">
          <div className="flex items-start sm:items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#ff5733]/15 text-[#ff6f59] border border-[#ff5733]/30 shrink-0">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-sm font-bold text-white tracking-wide">
                  Live Incident Demo:{' '}
                  <span className="text-[#ff6f59] font-mono font-bold">EC26-CHN-00182</span>
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                  Step {current} of 9
                </span>
                {current >= 3 && current < 7 && (
                  <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-[#ff5733]/20 text-[#ff7f68] border border-[#ff5733]/40">
                    <AlertCircle className="h-3 w-3" />
                    DISCREPANCY FLAGGED (0.14 kg drop)
                  </span>
                )}
                {current === 6 && (
                  <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse">
                    <ShieldAlert className="h-3 w-3" />
                    PAUSED AT APPROVAL GATE
                  </span>
                )}
                {current === 9 && (
                  <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-teal-500/20 text-teal-300 border border-teal-500/40">
                    <CheckCircle2 className="h-3 w-3" />
                    RECOVERY VERIFIED (66.67%)
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-0.5">{demoState.stepDescription}</p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={onReset}
              disabled={isLoading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#11192b] hover:bg-[#1a253d] text-slate-300 text-xs font-semibold border border-slate-700/80 transition disabled:opacity-50 cursor-pointer"
            >
              <RotateCcw className="h-3 w-3" />
              <span>Reset</span>
            </button>

            {current < 6 && (
              <button
                onClick={onAutoRun}
                disabled={isLoading}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#11192b] hover:bg-[#1a253d] text-teal-300 text-xs font-bold border border-teal-500/40 transition disabled:opacity-50 cursor-pointer"
                title="Runs autonomously through to Step 6 (Human Approval Gate)"
              >
                <Play className="h-3 w-3 text-teal-400 fill-current" />
                <span>Auto-Run to Approval Gate</span>
              </button>
            )}

            <button
              onClick={rec.action}
              disabled={isLoading}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-black transition shadow-md cursor-pointer ${
                current === 6
                  ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/20'
                  : current === 9
                  ? 'bg-teal-500 hover:bg-teal-400 text-slate-950 shadow-teal-500/20'
                  : 'bg-gradient-to-r from-[#ff5733] to-[#f97316] hover:from-[#f94d27] hover:to-[#ea580c] text-white shadow-[#ff5733]/25'
              } disabled:opacity-50`}
            >
              <span>{isLoading ? 'Agents Working...' : rec.label}</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* 10-Step Progress Track */}
        <div className="pt-2.5 overflow-x-auto no-scrollbar">
          <div className="flex items-center min-w-[760px] gap-1">
            {STEP_LABELS.map((label, idx) => {
              const isPast = idx < current;
              const isCurrent = idx === current;
              return (
                <div key={idx} className="flex-1 flex flex-col items-center group cursor-pointer">
                  <div className="w-full flex items-center">
                    <div
                      className={`h-1.5 w-full rounded-sm transition-all ${
                        isPast
                          ? 'bg-teal-500'
                          : isCurrent
                          ? 'bg-[#ff5733] animate-pulse'
                          : 'bg-slate-800'
                      }`}
                    />
                  </div>
                  <span
                    className={`text-[10px] mt-1 font-mono tracking-tighter truncate max-w-full text-center ${
                      isCurrent
                        ? 'text-[#ff6f59] font-bold'
                        : isPast
                        ? 'text-teal-400'
                        : 'text-slate-600'
                    }`}
                  >
                    {label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
