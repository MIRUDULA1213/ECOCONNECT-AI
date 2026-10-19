import React, { useState } from 'react';
import {
  FileText,
  Download,
  Printer,
  ShieldCheck,
  CheckCircle2,
  Scale,
  Calendar,
  User,
  MapPin,
  Clock,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { IncidentReport, WasteBatch } from '../types/ecoconnect.ts';

interface IncidentReportsViewProps {
  report?: IncidentReport;
  batch?: WasteBatch;
  onGenerateReport: () => Promise<void>;
  isLoading: boolean;
  onNavigateTab: (tabId: string) => void;
}

export const IncidentReportsView: React.FC<IncidentReportsViewProps> = ({
  report,
  batch,
  onGenerateReport,
  isLoading,
  onNavigateTab,
}) => {
  const [copiedJson, setCopiedJson] = useState(false);

  const handleDownloadJson = () => {
    if (!report) return;
    const blob = new Blob([JSON.stringify(report, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ECOCONNECT-INCIDENT-REPORT-${report.ecoTrackId}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  if (!report) {
    return (
      <div className="rounded-xl bg-slate-900 border border-slate-800 p-12 text-center space-y-4">
        <div className="mx-auto h-12 w-12 rounded-xl bg-slate-800 flex items-center justify-center text-slate-400">
          <FileText className="h-6 w-6 text-emerald-400" />
        </div>
        <div>
          <h3 className="text-base font-bold text-white">No Sealed Incident Report for This Batch Yet</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
            Run the demo scenario through Step 8 &amp; 9 or click below to compile and seal the digital chain-of-custody forensic incident report.
          </p>
        </div>
        <button
          onClick={onGenerateReport}
          disabled={isLoading}
          className="px-5 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition disabled:opacity-50 cursor-pointer shadow-lg shadow-emerald-500/20"
        >
          {isLoading ? 'Compiling Forensic Report...' : 'Compile Audit-Grade Incident Report'}
        </button>
      </div>
    );
  }

  const { finalRecoveryMetrics, initialBatchDetails, rootCause } = report;

  return (
    <div className="space-y-6">
      {/* Action Bar */}
      <div className="rounded-xl bg-slate-900 border border-slate-800 p-4 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
            <FileText className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-white">{report.reportId}</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold">
                CRYPTOGRAPHICALLY SEALED
              </span>
            </div>
            <p className="text-xs text-slate-400">Generated: {new Date(report.generatedAt).toLocaleString()}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-stretch sm:self-auto">
          <button
            onClick={handleDownloadJson}
            className="flex-1 sm:flex-none px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Download className="h-3.5 w-3.5 text-emerald-400" />
            <span>Export JSON</span>
          </button>
          <button
            onClick={handlePrint}
            className="flex-1 sm:flex-none px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Printer className="h-3.5 w-3.5 text-slate-400" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* Printable Report Document Card */}
      <div className="rounded-xl bg-slate-900 border border-slate-800 p-6 sm:p-8 shadow-xl space-y-8 text-xs text-slate-300">
        {/* Document Header */}
        <div className="border-b border-slate-800 pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-extrabold text-white">ECOCONNECT FORENSIC AUDIT REPORT</span>
              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-emerald-500 text-slate-950">
                Official
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              NAYASA HackLab • Digital Chain of Custody &amp; Verified Material Recovery Proof
            </p>
          </div>
          <div className="text-left sm:text-right font-mono text-[11px] text-slate-400 space-y-0.5">
            <div>EcoTrack ID: <span className="text-white font-bold">{report.ecoTrackId}</span></div>
            <div>Report ID: <span className="text-emerald-400">{report.reportId}</span></div>
            <div>Standard: ISO 14044 / CPCB EPR Compliance</div>
          </div>
        </div>

        {/* Executive Summary */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">1. Executive Summary</h3>
          <p className="p-3.5 rounded-lg bg-slate-950/80 border border-slate-800 leading-relaxed text-slate-300">
            {report.incidentSummary}
          </p>
        </div>

        {/* Initial Batch Registration Details */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">2. Initial Batch Origin &amp; Deposit</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
              <span className="text-slate-500 block text-[10px]">Material Type</span>
              <span className="font-bold text-white">{initialBatchDetails.material}</span>
            </div>
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
              <span className="text-slate-500 block text-[10px]">Initial Deposited Weight</span>
              <span className="font-mono font-bold text-white">{initialBatchDetails.initialWeightKg.toFixed(2)} kg</span>
            </div>
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
              <span className="text-slate-500 block text-[10px]">Depositor Citizen</span>
              <span className="font-bold text-white">{initialBatchDetails.citizenName}</span>
            </div>
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
              <span className="text-slate-500 block text-[10px]">Deposit Location</span>
              <span className="font-bold text-white truncate block">{initialBatchDetails.depositLocation}</span>
            </div>
          </div>
        </div>

        {/* Chronological Custody Chain Table */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">3. Chronological Chain of Custody</h3>
          <div className="overflow-x-auto rounded-lg border border-slate-800 bg-slate-950">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/80 text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-3 font-semibold">Checkpoint Stage</th>
                  <th className="py-2.5 px-3 font-semibold">Facility / Location</th>
                  <th className="py-2.5 px-3 font-semibold">Authorized Handler</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Scale Weight</th>
                  <th className="py-2.5 px-3 font-semibold">Ledger Sync</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
                {report.chainOfCustody.map((evt, i) => (
                  <tr key={i} className="hover:bg-slate-900/40">
                    <td className="py-2 px-3 text-white font-sans font-semibold">{evt.stageLabel}</td>
                    <td className="py-2 px-3 text-slate-400 font-sans">{evt.location.name}</td>
                    <td className="py-2 px-3 text-slate-400 font-sans">{evt.handler.name}</td>
                    <td className="py-2 px-3 text-right font-bold text-emerald-400">{evt.measuredWeightKg.toFixed(2)} kg</td>
                    <td className="py-2 px-3 text-slate-400 font-sans">{evt.syncStatus}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Detected Discrepancies & AI Root Cause */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">4. Discrepancy Forensic Investigation</h3>
          <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-800">
              <div>
                <span className="text-[11px] text-slate-500 uppercase font-bold block">Root Cause Classification</span>
                <span className="text-white font-bold">{rootCause.probableCause}</span>
              </div>
              <div className="text-right">
                <span className="text-[11px] text-slate-500 uppercase font-bold block">Inference Confidence</span>
                <span className="font-mono text-emerald-400 font-black text-sm">{rootCause.confidencePct}%</span>
              </div>
            </div>
            <p className="text-slate-300 text-[11px] leading-relaxed">{rootCause.justification}</p>
          </div>
        </div>

        {/* Final Recovery Yield Proof */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">5. Mathematical Recovery Proof &amp; Verification</h3>
          <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-800/40 grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
            <div className="space-y-1">
              <span className="text-slate-400 text-[11px] block">Initial Deposited Weight</span>
              <span className="text-lg font-bold font-mono text-white">
                {finalRecoveryMetrics.initialDepositedWeightKg.toFixed(2)} kg
              </span>
            </div>
            <div className="space-y-1">
              <span className="text-slate-400 text-[11px] block">Verified Recovered Flakes</span>
              <span className="text-lg font-bold font-mono text-emerald-400">
                {finalRecoveryMetrics.verifiedRecoveredWeightKg.toFixed(2)} kg
              </span>
            </div>
            <div className="space-y-1">
              <span className="text-slate-400 text-[11px] block">Certified Recovery Yield</span>
              <span className="text-2xl font-black font-mono text-emerald-400">
                {finalRecoveryMetrics.recoveryYieldPercentage}%
              </span>
              <span className="block font-mono text-[10px] text-slate-400">
                Formula: {finalRecoveryMetrics.calculationFormula}
              </span>
            </div>
          </div>
        </div>

        {/* Cryptographic Stamp Footer */}
        <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-[11px] text-slate-500 font-mono">
          <div>
            <span>Audit Seal: SHA256-PROOF-9942a0b1</span>
            <span className="mx-2">•</span>
            <span>NAYASA EcoConnect Ledger Engine</span>
          </div>
          <div>Authorized Signoff: Sarah Jenkins (CSO)</div>
        </div>
      </div>
    </div>
  );
};
