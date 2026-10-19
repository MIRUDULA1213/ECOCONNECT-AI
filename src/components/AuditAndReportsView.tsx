import React, { useState } from 'react';
import { FileText, Activity, Download, Printer, ShieldCheck, Lock } from 'lucide-react';
import { IncidentReportsView } from './IncidentReportsView.tsx';
import { AuditTrailView } from './AuditTrailView.tsx';
import { IncidentReport, WasteBatch, AuditLogEntry } from '../types/ecoconnect.ts';

interface AuditAndReportsViewProps {
  report?: IncidentReport;
  batch?: WasteBatch;
  auditTrail: AuditLogEntry[];
  onGenerateReport: () => Promise<void>;
  isLoading: boolean;
  onNavigateTab: (tabId: string) => void;
}

export const AuditAndReportsView: React.FC<AuditAndReportsViewProps> = ({
  report,
  batch,
  auditTrail,
  onGenerateReport,
  isLoading,
  onNavigateTab,
}) => {
  const [subTab, setSubTab] = useState<'report' | 'trail'>('report');

  return (
    <div className="space-y-6">
      {/* Sub-tab Switcher */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSubTab('report')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
              subTab === 'report'
                ? 'bg-teal-500/15 text-teal-300 border border-teal-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white bg-slate-900 border border-slate-800'
            }`}
          >
            <FileText className="h-4 w-4" />
            <span>Forensic Incident Report</span>
            {report && (
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-teal-500/20 text-teal-300">
                Sealed
              </span>
            )}
          </button>

          <button
            onClick={() => setSubTab('trail')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
              subTab === 'trail'
                ? 'bg-teal-500/15 text-teal-300 border border-teal-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white bg-slate-900 border border-slate-800'
            }`}
          >
            <Activity className="h-4 w-4" />
            <span>Tamper-Evident Audit Trail</span>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-300">
              {auditTrail.length}
            </span>
          </button>
        </div>

        <span className="text-xs font-mono text-slate-500 hidden sm:inline">
          Section 07 · Auditable Proof &amp; Forensic Logs
        </span>
      </div>

      {/* Render selected view */}
      {subTab === 'report' ? (
        <IncidentReportsView
          report={report}
          batch={batch}
          onGenerateReport={onGenerateReport}
          isLoading={isLoading}
          onNavigateTab={onNavigateTab}
        />
      ) : (
        <AuditTrailView auditTrail={auditTrail} />
      )}
    </div>
  );
};
