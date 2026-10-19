import React, { useState } from 'react';
import {
  ShieldAlert,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Clock,
  UserCheck,
  Scale,
  Sparkles,
  ArrowRight,
  FileCheck2,
} from 'lucide-react';
import { ApprovalRequest } from '../../types/ecoconnect.ts';

interface ApprovalPageProps {
  approvals: ApprovalRequest[];
  onDecideApproval: (
    id: string,
    decision: 'APPROVED' | 'REJECTED' | 'MORE_EVIDENCE_REQUESTED',
    notes: string
  ) => void;
  isLoading?: boolean;
  onNavigateTab: (tabId: any) => void;
}

export const ApprovalPage: React.FC<ApprovalPageProps> = ({
  approvals = [],
  onDecideApproval,
  isLoading = false,
  onNavigateTab,
}) => {
  const [activeNotes, setActiveNotes] = useState<Record<string, string>>({});

  const handleNotesChange = (id: string, text: string) => {
    setActiveNotes((prev) => ({ ...prev, [id]: text }));
  };

  const pendingApprovals = approvals.filter((a) => !a.decision);
  const resolvedApprovals = approvals.filter((a) => a.decision);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="pb-3 border-b border-slate-800/80">
        <h1 className="text-xl font-bold text-white tracking-tight">
          Human-in-the-Loop Approval Gate
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Consequential operations (official weight corrections, ledger adjustments) require authorized human review.
        </p>
      </div>

      {/* Pending Approvals */}
      <div className="space-y-4">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
          Awaiting Decision ({pendingApprovals.length})
        </span>

        {pendingApprovals.length === 0 ? (
          <div className="p-8 rounded-xl bg-[#0c1220] border border-slate-800 text-center space-y-2">
            <CheckCircle2 className="h-8 w-8 text-teal-400 mx-auto" />
            <h3 className="text-sm font-semibold text-white">No Pending Approval Requests</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              All agentic operations have been reviewed or are running autonomously within standard bounds.
            </p>
          </div>
        ) : (
          pendingApprovals.map((req) => (
            <div
              key={req.id}
              className="rounded-xl bg-[#0c1220] border border-amber-500/40 p-5 shadow-lg space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-3 border-b border-slate-800">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-amber-300">
                      {req.id}
                    </span>
                    <span className="text-slate-600">·</span>
                    <span className="font-mono text-xs font-bold text-teal-300">
                      {req.ecoTrackId}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-white mt-1">{req.proposedAction}</h3>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-[10px] font-mono text-amber-400 font-bold bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
                    High Consequence Gate
                  </span>
                  <span className="text-[10px] text-slate-500 block mt-1">
                    {req.actionTypeLabel}
                  </span>
                </div>
              </div>

              {/* Justification & Impact */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-lg bg-[#070b14] border border-slate-800 space-y-1">
                  <span className="text-slate-400 font-semibold block">Agent Justification</span>
                  <p className="text-slate-200 leading-relaxed">{req.reason}</p>
                </div>

                <div className="p-3 rounded-lg bg-[#070b14] border border-slate-800 space-y-1">
                  <span className="text-slate-400 font-semibold block">Estimated Impact</span>
                  <p className="text-slate-200 leading-relaxed">{req.estimatedImpact}</p>
                  <p className="text-teal-400 text-[11px] font-mono pt-1">
                    Confidence: {req.confidencePct}%
                  </p>
                </div>
              </div>

              {/* Decision Input & Action Buttons */}
              <div className="space-y-3 pt-2">
                <input
                  type="text"
                  placeholder="Reviewer notes (optional)..."
                  value={activeNotes[req.id] || ''}
                  onChange={(e) => handleNotesChange(req.id, e.target.value)}
                  className="w-full bg-[#070b14] border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
                />

                <div className="flex flex-wrap items-center justify-end gap-2">
                  <button
                    onClick={() =>
                      onDecideApproval(
                        req.id,
                        'MORE_EVIDENCE_REQUESTED',
                        activeNotes[req.id] || 'Requested secondary moisture chamber reading.'
                      )
                    }
                    disabled={isLoading}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#11192b] hover:bg-[#1a253d] text-slate-300 text-xs font-semibold border border-slate-700 transition cursor-pointer disabled:opacity-50"
                  >
                    <HelpCircle className="h-3.5 w-3.5 text-amber-400" />
                    <span>Request More Evidence</span>
                  </button>

                  <button
                    onClick={() =>
                      onDecideApproval(
                        req.id,
                        'REJECTED',
                        activeNotes[req.id] || 'Rejected proposed adjustment. Triggering safe physical quarantine.'
                      )
                    }
                    disabled={isLoading}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 text-xs font-semibold border border-rose-500/30 transition cursor-pointer disabled:opacity-50"
                  >
                    <XCircle className="h-3.5 w-3.5 text-rose-400" />
                    <span>Reject Plan</span>
                  </button>

                  <button
                    onClick={() =>
                      onDecideApproval(
                        req.id,
                        'APPROVED',
                        activeNotes[req.id] || 'Authorized by Lead Sustainability Officer after tare inspection.'
                      )
                    }
                    disabled={isLoading}
                    className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs shadow-md shadow-teal-500/20 transition cursor-pointer disabled:opacity-50"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>Approve &amp; Execute</span>
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Resolved Approvals History */}
      {resolvedApprovals.length > 0 && (
        <div className="space-y-3 pt-4">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
            Authorized History ({resolvedApprovals.length})
          </span>

          <div className="space-y-2">
            {resolvedApprovals.map((req) => (
              <div
                key={req.id}
                className="rounded-lg bg-[#0c1220] border border-slate-800 p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-teal-300">{req.ecoTrackId}</span>
                    <span className="text-slate-600">·</span>
                    <span className="text-white font-medium">{req.proposedAction}</span>
                  </div>
                  <p className="text-slate-400 text-[11px] mt-0.5">{req.decisionNotes}</p>
                </div>

                <div className="text-right shrink-0">
                  <span
                    className={`font-mono text-xs font-bold ${
                      req.decision === 'APPROVED' ? 'text-teal-400' : 'text-rose-400'
                    }`}
                  >
                    {req.decision}
                  </span>
                  <span className="text-[10px] text-slate-500 block">
                    by {req.decidedBy}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
