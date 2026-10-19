import React from 'react';
import { motion } from 'motion/react';
import {
  PackagePlus,
  Binary,
  Search,
  ListTodo,
  UserCheck,
  PlayCircle,
  ShieldCheck,
  AlertTriangle,
  ChevronRight,
} from 'lucide-react';

export interface WorkflowStageInfo {
  key: 'INGEST' | 'ANALYZE' | 'INVESTIGATE' | 'PLAN' | 'APPROVE' | 'EXECUTE' | 'VERIFY';
  label: string;
  agent: string;
}

export const WORKFLOW_STAGES: WorkflowStageInfo[] = [
  { key: 'INGEST', label: 'Ingest', agent: 'Ingestion Agent' },
  { key: 'ANALYZE', label: 'Analyze', agent: 'Classification' },
  { key: 'INVESTIGATE', label: 'Investigate', agent: 'Investigation' },
  { key: 'PLAN', label: 'Plan', agent: 'Planning Agent' },
  { key: 'APPROVE', label: 'Approve', agent: 'Human Gate' },
  { key: 'EXECUTE', label: 'Execute', agent: 'Execution Agent' },
  { key: 'VERIFY', label: 'Verify', agent: 'Verification Agent' },
];

interface AgentWorkflowProps {
  currentStageIndex: number; // 0 to 6 (or mapping from demo step 0..9)
  isAwaitingApproval?: boolean;
  hasError?: boolean;
  onStageClick?: (stageKey: string) => void;
  compact?: boolean;
}

export const AgentWorkflow: React.FC<AgentWorkflowProps> = ({
  currentStageIndex,
  isAwaitingApproval = false,
  hasError = false,
  onStageClick,
  compact = false,
}) => {
  const getStageIcon = (key: string) => {
    switch (key) {
      case 'INGEST':
        return PackagePlus;
      case 'ANALYZE':
        return Binary;
      case 'INVESTIGATE':
        return Search;
      case 'PLAN':
        return ListTodo;
      case 'APPROVE':
        return UserCheck;
      case 'EXECUTE':
        return PlayCircle;
      case 'VERIFY':
        return ShieldCheck;
      default:
        return PackagePlus;
    }
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between overflow-x-auto py-2 no-scrollbar">
        {WORKFLOW_STAGES.map((stage, idx) => {
          const Icon = getStageIcon(stage.key);
          const isCompleted = idx < currentStageIndex;
          const isActive = idx === currentStageIndex;
          const isPending = idx > currentStageIndex;
          const isApprovalStage = stage.key === 'APPROVE';
          const isPausedAtApproval = isActive && isApprovalStage && isAwaitingApproval;

          return (
            <React.Fragment key={stage.key}>
              {/* Stage Node */}
              <button
                type="button"
                onClick={() => onStageClick?.(stage.key)}
                className={`relative flex flex-col items-center group transition-all text-left focus:outline-none cursor-pointer ${
                  compact ? 'min-w-[70px]' : 'min-w-[100px]'
                }`}
              >
                {/* Node Circle */}
                <div className="relative flex items-center justify-center">
                  {/* Active Pulse Ring */}
                  {isActive && (
                    <motion.div
                      animate={{ scale: [1, 1.25, 1], opacity: [0.6, 0.1, 0.6] }}
                      transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                      className={`absolute -inset-1.5 rounded-full ${
                        isPausedAtApproval
                          ? 'bg-amber-500/40'
                          : hasError
                          ? 'bg-rose-500/40'
                          : 'bg-[#ff5733]/40'
                      }`}
                    />
                  )}

                  <div
                    className={`relative h-9 w-9 rounded-full flex items-center justify-center border transition-all duration-300 ${
                      isCompleted
                        ? 'bg-teal-950/80 border-teal-500/80 text-teal-400'
                        : isActive
                        ? isPausedAtApproval
                          ? 'bg-amber-950/90 border-amber-400 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.5)]'
                          : 'bg-[#ff5733]/20 border-[#ff5733] text-white shadow-[0_0_15px_rgba(255,87,51,0.5)]'
                        : 'bg-[#0c1220] border-slate-800 text-slate-400 group-hover:text-slate-300'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                </div>

                {/* Node Label */}
                <div className="mt-2 text-center">
                  <span
                    className={`text-xs block font-semibold transition-colors ${
                      isActive
                        ? isPausedAtApproval
                          ? 'text-amber-300 font-bold'
                          : 'text-white font-bold'
                        : isCompleted
                        ? 'text-teal-400'
                        : 'text-slate-400'
                    }`}
                  >
                    {stage.label}
                  </span>

                  {!compact && (
                    <span className="text-[10px] text-slate-400 font-mono block leading-tight mt-0.5">
                      {stage.agent}
                    </span>
                  )}

                  {isPausedAtApproval && (
                    <span className="inline-block mt-1 text-[9px] font-mono text-amber-400 animate-pulse font-bold">
                      Paused · Review
                    </span>
                  )}
                </div>
              </button>

              {/* Connecting Line between nodes */}
              {idx < WORKFLOW_STAGES.length - 1 && (
                <div className="flex-1 mx-2 relative h-0.5 min-w-[20px] bg-slate-800/80 self-center -mt-6">
                  {/* Progress Line */}
                  {idx < currentStageIndex && (
                    <div className="absolute inset-0 bg-teal-500/80 transition-all duration-500" />
                  )}

                  {/* Active animated pulse dot */}
                  {idx === currentStageIndex && (
                    <motion.div
                      animate={{ x: ['0%', '100%'] }}
                      transition={{ duration: 1.6, repeat: Infinity, ease: 'linear' }}
                      className={`absolute top-1/2 -translate-y-1/2 h-1.5 w-1.5 rounded-full shadow-[0_0_8px_#ff5733] ${
                        isPausedAtApproval ? 'bg-amber-400 shadow-[0_0_8px_#f59e0b]' : 'bg-[#ff5733]'
                      }`}
                    />
                  )}
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
