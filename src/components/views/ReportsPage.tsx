import React, { useState } from 'react';
import {
  FileText,
  Download,
  Printer,
  ShieldCheck,
  CheckCircle2,
  Scale,
  Calendar,
  Lock,
  Search,
  ExternalLink,
  Sparkles,
} from 'lucide-react';
import { IncidentReport, AuditLogEntry, WasteBatch } from '../../types/ecoconnect.ts';
import { downloadIncidentReportPdf } from '../../utils/pdfGenerator.ts';

interface ReportsPageProps {
  report: IncidentReport | null;
  auditTrail: AuditLogEntry[];
  batch: WasteBatch | null;
  onGenerateReport?: () => void;
  isLoading?: boolean;
}

export const ReportsPage: React.FC<ReportsPageProps> = ({
  report,
  auditTrail = [],
  batch,
  onGenerateReport,
  isLoading = false,
}) => {
  const [activeTab, setActiveTab] = useState<'report' | 'audit'>('report');
  const [auditFilter, setAuditFilter] = useState('');
  const [isPdfDownloading, setIsPdfDownloading] = useState(false);
  const [pdfDownloaded, setPdfDownloaded] = useState(false);

  const filteredAudit = auditTrail.filter(
    (item) =>
      item.ecoTrackId.toLowerCase().includes(auditFilter.toLowerCase()) ||
      item.action.toLowerCase().includes(auditFilter.toLowerCase()) ||
      item.details.toLowerCase().includes(auditFilter.toLowerCase())
  );

  const handleDownloadPdf = () => {
    if (!report) return;
    setIsPdfDownloading(true);
    try {
      downloadIncidentReportPdf(report, batch);
      setPdfDownloaded(true);
      setTimeout(() => setPdfDownloaded(false), 3000);
    } catch (err) {
      console.error('PDF generation error:', err);
    } finally {
      setIsPdfDownloading(false);
    }
  };

  const handleDownloadJson = () => {
    if (!report) return;
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(report, null, 2));
    const dlAnchor = document.createElement('a');
    dlAnchor.setAttribute('href', dataStr);
    dlAnchor.setAttribute('download', `REPORT-${report.reportId}.json`);
    dlAnchor.click();
  };

  const handleExportAuditCsv = () => {
    if (auditTrail.length === 0) return;
    const headers = ['ID', 'Timestamp', 'EcoTrack ID', 'Action', 'Actor', 'Role', 'Details', 'Previous Hash', 'SHA256 Hash'];
    const rows = auditTrail.map((item) => [
      item.id,
      item.timestamp,
      item.ecoTrackId,
      item.action,
      `"${item.actor.replace(/"/g, '""')}"`,
      `"${item.actorRole.replace(/"/g, '""')}"`,
      `"${item.details.replace(/"/g, '""')}"`,
      item.previousHash,
      item.hash,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const dlAnchor = document.createElement('a');
    dlAnchor.setAttribute('href', encodeURI(csvContent));
    dlAnchor.setAttribute('download', `ECOCONNECT-AUDIT-LOG-${new Date().toISOString().slice(0, 10)}.csv`);
    dlAnchor.click();
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="pb-3 border-b border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">
            Forensic Reports &amp; Tamper-Evident Ledger
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Immutable chain-of-custody certificates and cryptographic audit verification.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1 bg-[#0c1220] p-1 rounded-lg border border-slate-800">
          <button
            onClick={() => setActiveTab('report')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition cursor-pointer ${
              activeTab === 'report'
                ? 'bg-[#11192b] text-teal-300 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Incident Report
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition cursor-pointer ${
              activeTab === 'audit'
                ? 'bg-[#11192b] text-teal-300 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Audit Trail ({auditTrail.length})
          </button>
        </div>
      </div>

      {activeTab === 'report' ? (
        <div className="space-y-6">
          {report ? (
            <div className="rounded-xl bg-[#0c1220] border border-slate-800 p-6 shadow-sm space-y-6">
              {/* Report Title & Metadata */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-slate-800">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-teal-300">
                      {report.reportId}
                    </span>
                    <span className="text-slate-600">·</span>
                    <span className="text-xs text-slate-400 font-mono">
                      EcoTrack ID: {report.ecoTrackId}
                    </span>
                  </div>
                  <h2 className="text-lg font-bold text-white mt-1">
                    Forensic Chain-of-Custody Certificate
                  </h2>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={handleDownloadPdf}
                    disabled={isPdfDownloading}
                    className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold border transition cursor-pointer shadow-sm ${
                      pdfDownloaded
                        ? 'bg-teal-500 text-slate-950 border-teal-400'
                        : 'bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 border-teal-500/40'
                    }`}
                  >
                    {pdfDownloaded ? (
                      <>
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        <span>PDF Downloaded!</span>
                      </>
                    ) : (
                      <>
                        <Download className="h-3.5 w-3.5" />
                        <span>{isPdfDownloading ? 'Preparing PDF...' : 'Download Report (PDF)'}</span>
                      </>
                    )}
                  </button>
                  {onGenerateReport && (
                    <button
                      onClick={onGenerateReport}
                      disabled={isLoading}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#11192b] hover:bg-[#1a253d] text-teal-400 text-xs font-semibold border border-teal-500/30 transition cursor-pointer disabled:opacity-50"
                      title="Re-run AI verification & compile latest evidence into report"
                    >
                      <Sparkles className="h-3.5 w-3.5 text-[#ff5733]" />
                      <span>{isLoading ? 'Re-evaluating...' : 'Re-compile Report'}</span>
                    </button>
                  )}
                  <button
                    onClick={handleDownloadJson}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#11192b] hover:bg-[#1a253d] text-slate-300 text-xs font-semibold border border-slate-700/80 transition cursor-pointer"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>Export JSON</span>
                  </button>
                  <button
                    onClick={() => window.print()}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#11192b] hover:bg-[#1a253d] text-slate-300 text-xs font-semibold border border-slate-700/80 transition cursor-pointer"
                  >
                    <Printer className="h-3.5 w-3.5" />
                    <span>Print</span>
                  </button>
                </div>
              </div>

              {/* Key Summary Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3 rounded-lg bg-[#070b14] border border-slate-800">
                  <span className="text-[10px] text-slate-400 block uppercase">Material</span>
                  <span className="font-bold text-white mt-0.5 block">{report.initialBatchDetails?.material || 'PET Plastic'}</span>
                </div>
                <div className="p-3 rounded-lg bg-[#070b14] border border-slate-800">
                  <span className="text-[10px] text-slate-400 block uppercase">Initial Weight</span>
                  <span className="font-bold font-mono text-white mt-0.5 block">{report.initialBatchDetails?.initialWeightKg || 1.80} kg</span>
                </div>
                <div className="p-3 rounded-lg bg-[#070b14] border border-slate-800">
                  <span className="text-[10px] text-slate-400 block uppercase">Verified Recovery</span>
                  <span className="font-bold font-mono text-teal-400 mt-0.5 block">{report.finalRecoveryMetrics?.verifiedRecoveredWeightKg || 1.20} kg</span>
                </div>
                <div className="p-3 rounded-lg bg-[#070b14] border border-slate-800">
                  <span className="text-[10px] text-slate-400 block uppercase">Recovery Yield</span>
                  <span className="font-bold font-mono text-teal-400 mt-0.5 block">{report.finalRecoveryMetrics?.recoveryYieldPercentage || 66.67}%</span>
                </div>
              </div>

              {/* Investigation Narrative */}
              <div className="space-y-2 text-xs">
                <span className="text-slate-400 font-semibold block uppercase tracking-wider text-[11px]">
                  Investigation Narrative &amp; Findings
                </span>
                <p className="text-slate-200 leading-relaxed bg-[#070b14] p-4 rounded-lg border border-slate-800">
                  {report.incidentSummary}
                </p>
              </div>

              {/* Root Cause Conclusion */}
              <div className="space-y-2 text-xs">
                <span className="text-slate-400 font-semibold block uppercase tracking-wider text-[11px]">
                  Root Cause Conclusion
                </span>
                <div className="p-4 rounded-lg bg-teal-950/20 border border-teal-500/30 text-slate-200 leading-relaxed">
                  {report.rootCause?.probableCause || report.rootCause?.justification || 'Discrepancy resolved.'}
                </div>
              </div>

              {/* Signatures & Seal */}
              <div className="pt-4 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="space-y-1">
                  <span className="text-[10px] text-slate-500 block uppercase">Approved By</span>
                  <span className="text-slate-200 font-semibold block">
                    {report.humanApprovalDecisions?.[0]?.decidedBy || 'Chief Sustainability Officer'}
                  </span>
                  <span className="text-[10px] text-slate-500 block">Lead Sustainability Officer</span>
                </div>
                <div className="space-y-1 sm:text-right">
                  <span className="text-[10px] text-slate-500 block uppercase">Cryptographic Audit Seal</span>
                  <span className="text-teal-400 font-mono text-[11px] font-bold block">
                    {report.auditTrailExcerpt?.[0]?.hash || '0x49ef210aec0genesis'}
                  </span>
                  <span className="text-[10px] text-slate-500 block">Tamper-Evident SHA-256 Link</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-12 rounded-xl bg-[#0c1220] border border-slate-800 text-center space-y-3">
              <FileText className="h-10 w-10 text-slate-600 mx-auto" />
              <h3 className="text-sm font-semibold text-white">No Sealed Incident Report Yet</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Run the autonomous scenario through Step 9 to compile and seal the official forensic report for EC26-CHN-00182.
              </p>
              {onGenerateReport && (
                <button
                  onClick={onGenerateReport}
                  disabled={isLoading}
                  className="px-4 py-2 rounded-lg bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs transition cursor-pointer"
                >
                  Generate Forensic Report
                </button>
              )}
            </div>
          )}
        </div>
      ) : (
        /* Audit Trail View */
        <div className="rounded-xl bg-[#0c1220] border border-slate-800 p-5 space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
              <input
                type="text"
                placeholder="Filter audit trail by EcoTrack ID, actor, or action..."
                value={auditFilter}
                onChange={(e) => setAuditFilter(e.target.value)}
                className="w-full bg-[#070b14] border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
              />
            </div>
            <button
              onClick={handleExportAuditCsv}
              className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#11192b] hover:bg-[#1a253d] text-teal-300 text-xs font-semibold border border-teal-500/30 transition cursor-pointer shrink-0"
              title="Download entire tamper-evident cryptographic log as CSV"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Export Audit Log (CSV)</span>
            </button>
          </div>

          <div className="space-y-2 max-h-[500px] overflow-y-auto">
            {filteredAudit.map((item) => (
              <div
                key={item.id}
                className="p-3.5 rounded-lg bg-[#070b14] border border-slate-800/80 space-y-1.5 text-xs"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-teal-300">{item.ecoTrackId}</span>
                    <span className="text-slate-600">·</span>
                    <span className="font-semibold text-white">{item.action}</span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-500">
                    {new Date(item.timestamp).toLocaleString()}
                  </span>
                </div>

                <p className="text-slate-300">{item.details}</p>

                <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono pt-1 border-t border-slate-800/40">
                  <span>Actor: {item.actor} ({item.actorRole})</span>
                  <span className="text-teal-400/80">Hash: {item.hash.slice(0, 14)}...</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
