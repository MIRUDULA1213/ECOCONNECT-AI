import React, { useState } from 'react';
import {
  ShieldAlert,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Clock,
  UserCheck,
  AlertTriangle,
  Scale,
  FileCheck2,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { ApprovalRequest } from '../types/ecoconnect.ts';

interface ApprovalCentreViewProps {
  approvals: ApprovalRequest[];
  onDecideApproval: (id: string, decision: 'APPROVED' | 'REJECTED' | 'MORE_EVIDENCE_REQUESTED', notes: string) => Promise<void>;
  isLoading: boolean;
  onNavigateTab: (tabId: string) => void;
}

export const ApprovalCentreView: React.FC<ApprovalCentreViewProps> = ({
  approvals,
  onDecideApproval,
  isLoading,
  onNavigateTab,
}) => {
  const [activeNotes, setActiveNotes] = useState<Record<string, string>>({});

  const pendingApprovals = approvals.filter((a) => !a.decision);
  const resolvedApprovals = approvals.filter((a) => !!a.decision);

  const handleDecision = async (
    id: string,
    decision: 'APPROVED' | 'REJECTED' | 'MORE_EVIDENCE_REQUESTED'
  ) => {
    const notes = activeNotes[id] || (
      decision === 'APPROVED'
        ? 'Authorized official net weight certification after reviewing tamper seal & weighbridge records.'
        : decision === 'REJECTED'
        ? 'Rejected: Consignment flagged for physical manual inspection.'
        : 'Requesting calibrated humidity test report.'
    );
    await onDecideApproval(id, decision, notes);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="rounded-xl bg-slate-900 border border-slate-800 p-5 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 shrink-0">
            <ShieldAlert className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white tracking-wide">
                Human-in-the-Loop Approval Gate
              </h2>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                {pendingApprovals.length} Pending Actions
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl">
              Strict compliance boundary: The autonomous agent PAUSES execution and cannot modify verified recovery records or official weights without authorized human approval.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-950 px-3 py-2 rounded-lg border border-slate-800">
          <UserCheck className="h-4 w-4 text-emerald-400" />
          <span>Role: Chief Sustainability Officer / Compliance Auditor</span>
        </div>
      </div>

      {/* Pending Approvals Section */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <span>Pending Authorization Requests</span>
          <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 font-black">
            {pendingApprovals.length}
          </span>
        </h3>

        {pendingApprovals.length === 0 ? (
          <div className="rounded-xl bg-slate-900 border border-slate-800 p-8 text-center text-slate-400 space-y-2">
            <CheckCircle2 className="h-8 w-8 text-emerald-400 mx-auto" />
            <p className="text-sm font-semibold text-white">No Pending Human Approvals</p>
            <p className="text-xs text-slate-500">
              All consequential actions have been authorized or rejected. Run the demo scenario to trigger a live authorization gate.
            </p>
          </div>
        ) : (
          pendingApprovals.map((req) => (
            <div
              key={req.id}
              className="rounded-xl bg-slate-900 border-2 border-amber-500/40 p-5 shadow-lg space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    {req.actionType}
                  </span>
                  <span className="text-xs font-mono text-slate-400 font-bold">
                    Batch: {req.ecoTrackId}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-slate-400">Agent Confidence:</span>
                  <span className="text-emerald-400 font-mono font-black">{req.confidencePct}%</span>
                </div>
              </div>

              {/* Proposed Action */}
              <div className="space-y-1">
                <span className="text-[11px] text-slate-500 uppercase font-bold tracking-wider block">
                  Proposed Consequential Action
                </span>
                <p className="text-sm font-bold text-white">{req.proposedAction}</p>
              </div>

              {/* Reason & Impact Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800 space-y-1">
                  <span className="text-slate-400 font-semibold block">Justification &amp; Root Cause:</span>
                  <p className="text-slate-300 text-[11px] leading-relaxed">{req.reason}</p>
                </div>
                <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800 space-y-1">
                  <span className="text-slate-400 font-semibold block">Estimated Environmental &amp; Legal Impact:</span>
                  <p className="text-slate-300 text-[11px] leading-relaxed">{req.estimatedImpact}</p>
                </div>
              </div>

              {/* Supporting Evidence Checklist */}
              <div className="space-y-2 text-xs">
                <span className="text-slate-400 font-semibold block">Supporting Corroborated Evidence:</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {req.supportingEvidence.map((ev, i) => (
                    <div
                      key={i}
                      className="p-2.5 rounded-lg bg-slate-950/50 border border-slate-800/80 flex items-start gap-2 text-[11px] text-slate-300"
                    >
                      <FileCheck2 className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{ev}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Decision Input & Action Buttons */}
              <div className="pt-3 border-t border-slate-800 space-y-3">
                <div>
                  <label className="text-[11px] text-slate-400 font-semibold block mb-1">
                    Auditor Review Notes (recorded in immutable cryptographic audit trail):
                  </label>
                  <input
                    type="text"
                    placeholder="Enter compliance authorization rationale..."
                    value={activeNotes[req.id] || ''}
                    onChange={(e) =>
                      setActiveNotes({ ...activeNotes, [req.id]: e.target.value })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="flex flex-wrap items-center justify-end gap-2.5">
                  <button
                    onClick={() => handleDecision(req.id, 'MORE_EVIDENCE_REQUESTED')}
                    disabled={isLoading}
                    className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <HelpCircle className="h-3.5 w-3.5 text-amber-400" />
                    <span>Request More Evidence</span>
                  </button>

                  <button
                    onClick={() => handleDecision(req.id, 'REJECTED')}
                    disabled={isLoading}
                    className="px-4 py-2 rounded-lg bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 text-xs font-bold border border-rose-500/40 transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <XCircle className="h-3.5 w-3.5" />
                    <span>Reject &amp; Quarantine</span>
                  </button>

                  <button
                    onClick={() => handleDecision(req.id, 'APPROVED')}
                    disabled={isLoading}
                    className="px-5 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-extrabold shadow-lg shadow-emerald-500/20 transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>Approve &amp; Execute Actions</span>
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Resolved Approvals History */}
      {resolvedApprovals.length > 0 && (
        <div className="space-y-3 pt-6 border-t border-slate-800">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            Decided Authorization History ({resolvedApprovals.length})
          </h3>
          <div className="space-y-3">
            {resolvedApprovals.map((req) => (
              <div
                key={req.id}
                className="rounded-xl bg-slate-900 border border-slate-800 p-4 text-xs space-y-2"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`font-mono font-bold px-2 py-0.5 rounded ${
                        req.decision === 'APPROVED'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                      }`}
                    >
                      {req.decision}
                    </span>
                    <span className="font-mono text-white font-bold">{req.ecoTrackId}</span>
                    <span className="text-slate-500">•</span>
                    <span className="text-slate-400">{req.actionType}</span>
                  </div>
                  <span className="text-slate-500 font-mono text-[11px]">
                    Decided by {req.decidedBy} at {req.decidedAt ? new Date(req.decidedAt).toLocaleTimeString() : ''}
                  </span>
                </div>
                <p className="text-slate-300 font-semibold">{req.proposedAction}</p>
                <p className="text-[11px] text-slate-400 bg-slate-950 p-2 rounded border border-slate-800/80">
                  <span className="text-slate-500 font-semibold mr-1">Auditor Notes:</span>
                  {req.decisionNotes}
                </p>
                {req.alternativePlan && (
                  <p className="text-[11px] text-rose-300 bg-rose-950/20 p-2 rounded border border-rose-800/40">
                    <span className="font-semibold mr-1">Safe Alternative Plan:</span>
                    {req.alternativePlan}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
