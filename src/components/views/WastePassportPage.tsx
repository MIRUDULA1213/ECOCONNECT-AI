import React, { useState } from 'react';
import {
  ShieldCheck,
  MapPin,
  Scale,
  Calendar,
  Sparkles,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  QrCode,
  Download,
  Printer,
  Radio,
  FileText,
  User,
  AlertTriangle,
  CheckCircle2,
  Cpu,
  Dna,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { WasteBatch, CustodyEvent } from '../../types/ecoconnect.ts';
import { downloadWastePassportPdf } from '../../utils/pdfGenerator.ts';

interface WastePassportPageProps {
  batch: WasteBatch | null;
  batches: WasteBatch[];
  onSelectBatch: (id: string) => void;
  onNavigateTab: (tabId: any) => void;
}

export const WastePassportPage: React.FC<WastePassportPageProps> = ({
  batch,
  batches,
  onSelectBatch,
  onNavigateTab,
}) => {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    aiAnalysis: true,
    evidenceSources: true,
    sensorReadings: false,
    custodyHistory: true,
    agentLogs: false,
  });

  const toggleSection = (key: string) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  if (!batch) {
    return (
      <div className="p-12 text-center text-slate-400">
        <p>No waste passport record selected.</p>
      </div>
    );
  }

  const aiAssessment = batch.aiAssessment;
  const classification = batch.opticalClassification;
  const history = batch.custodyHistory || [];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Batch Selector Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider shrink-0">
            Batches:
          </span>
          {batches.map((b) => (
            <button
              key={b.ecoTrackId}
              onClick={() => onSelectBatch(b.ecoTrackId)}
              className={`px-2.5 py-1 rounded-md text-xs font-mono transition cursor-pointer shrink-0 ${
                b.ecoTrackId === batch.ecoTrackId
                  ? 'bg-teal-500/15 text-teal-300 font-bold border border-teal-500/40'
                  : 'bg-[#0c1220] text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {b.ecoTrackId}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            onClick={() => onNavigateTab('bioscience')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#11192b] hover:bg-[#1a253d] text-teal-300 text-xs font-semibold border border-teal-500/30 transition cursor-pointer"
            title="Inspect 3D enzymatic degradation structures and PubChem chemistry for this polymer"
          >
            <Dna className="h-3.5 w-3.5 text-teal-400" />
            <span>Enzymatic Recycling</span>
          </button>
          <button
            onClick={() => downloadWastePassportPdf(batch)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-500/15 hover:bg-teal-500/25 text-teal-300 text-xs font-semibold border border-teal-500/40 transition cursor-pointer"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Download PDF Certificate</span>
          </button>
          <button
            onClick={() => onNavigateTab('scan_qr')}
            className="text-xs text-slate-400 hover:text-white font-medium flex items-center gap-1 cursor-pointer px-2.5 py-1.5 rounded-lg bg-[#0c1220] border border-slate-800"
          >
            <span>Scan Another</span>
            <ExternalLink className="h-3 w-3" />
          </button>
        </div>
      </div>

      {/* Main Digital Passport Header Card */}
      <div className="rounded-xl bg-[#0c1220]/90 border border-slate-800/80 p-6 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 pb-6 border-b border-slate-800/60">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Digital Waste Passport
              </span>
              <span className="text-slate-600">·</span>
              <span
                className={`text-xs font-mono font-bold ${
                  batch.status === 'RECOVERY_VERIFIED'
                    ? 'text-teal-400'
                    : batch.status === 'DISCREPANCY_FLAGGED'
                    ? 'text-[#ff5733]'
                    : 'text-amber-400'
                }`}
              >
                {batch.status.replace('_', ' ')}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-mono font-bold text-white tracking-tight">
              {batch.ecoTrackId}
            </h1>

            {/* Unboxed Metadata Line (Anti-Slop discipline) */}
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
              <span className="text-slate-200 font-medium">{batch.material}</span>
              <span>·</span>
              <span>{batch.wasteCategory || 'Recyclable'}</span>
              <span>·</span>
              <span>{batch.smartStation?.stationName || 'Smart Drop Station'}</span>
              <span>·</span>
              <span>
                {new Date(batch.createdAt).toLocaleDateString([], {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </span>
            </div>
          </div>

          {/* QR Code and Quick Actions */}
          <div className="flex items-center gap-4 bg-[#070b14] p-3 rounded-xl border border-slate-800/80 shrink-0">
            {batch.qrDataUrl ? (
              <img
                src={batch.qrDataUrl}
                alt={`QR for ${batch.ecoTrackId}`}
                className="h-20 w-20 rounded bg-white p-1"
              />
            ) : (
              <div className="h-20 w-20 rounded bg-slate-800 flex items-center justify-center text-slate-400">
                <QrCode className="h-8 w-8" />
              </div>
            )}

            <div className="space-y-1.5 text-xs">
              <span className="font-mono text-[10px] text-slate-400 block">Tamper-evident QR</span>
              {batch.qrDataUrl && (
                <a
                  href={batch.qrDataUrl}
                  download={`ECOTRACK-${batch.ecoTrackId}.png`}
                  className="flex items-center gap-1 text-teal-400 hover:text-teal-300 font-semibold"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Download QR PNG</span>
                </a>
              )}
              <button
                onClick={() => downloadWastePassportPdf(batch)}
                className="flex items-center gap-1.5 text-teal-300 hover:text-teal-200 font-bold bg-teal-950/80 px-2.5 py-1 rounded-md border border-teal-500/40 hover:bg-teal-900/80 transition cursor-pointer"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Download PDF Certificate</span>
              </button>
              <button
                onClick={() => window.print()}
                className="flex items-center gap-1 text-slate-400 hover:text-slate-200 font-medium cursor-pointer"
              >
                <Printer className="h-3.5 w-3.5" />
                <span>Print Certificate</span>
              </button>
            </div>
          </div>
        </div>

        {/* 4 Pillars Grid: Reported, Predicted, Measured, Verified */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-3.5 rounded-lg bg-[#070b14] border border-slate-800/80">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
              1. Reported (Source)
            </span>
            <div className="mt-1">
              <span className="text-base font-bold text-white font-mono block">
                {batch.initialWeightKg} kg
              </span>
              <span className="text-xs text-slate-400">
                {batch.citizen?.name || 'Citizen Depositor'}
              </span>
            </div>
          </div>

          <div className="p-3.5 rounded-lg bg-[#070b14] border border-slate-800/80">
            <span className="text-[10px] font-semibold text-purple-400 uppercase tracking-wider block">
              2. Predicted (AI Model)
            </span>
            <div className="mt-1">
              <span className="text-base font-bold text-white font-mono block">
                {classification?.confidence
                  ? `${Math.round(classification.confidence * 100)}% Conf`
                  : '98% Conf'}
              </span>
              <span className="text-xs text-slate-400">
                {aiAssessment?.predictedMaterialClass || classification?.detectedMaterial || batch.material}
              </span>
            </div>
          </div>

          <div className="p-3.5 rounded-lg bg-[#070b14] border border-slate-800/80">
            <span className="text-[10px] font-semibold text-teal-400 uppercase tracking-wider block">
              3. Measured (IoT Scale)
            </span>
            <div className="mt-1">
              <span className="text-base font-bold text-white font-mono block">
                {batch.currentWeightKg} kg
              </span>
              <span className="text-xs text-slate-400">ESP32 Load Cell (±0.01kg)</span>
            </div>
          </div>

          <div className="p-3.5 rounded-lg bg-[#070b14] border border-slate-800/80">
            <span className="text-[10px] font-semibold text-emerald-400 uppercase tracking-wider block">
              4. Verified (Recycler)
            </span>
            <div className="mt-1">
              <span className="text-base font-bold text-white font-mono block">
                {batch.verifiedRecoveryWeightKg ? `${batch.verifiedRecoveryWeightKg} kg` : 'Pending'}
              </span>
              <span className="text-xs text-slate-400">
                {batch.recoveryYieldPct ? `${batch.recoveryYieldPct}% Yield` : 'Awaiting receipt'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Expandable Section 1: Full AI Analysis */}
      <div className="rounded-xl bg-[#0c1220]/90 border border-slate-800/80 overflow-hidden">
        <button
          onClick={() => toggleSection('aiAnalysis')}
          className="w-full p-4 flex items-center justify-between text-left hover:bg-[#11192b]/40 transition cursor-pointer"
        >
          <div className="flex items-center gap-2.5">
            <Sparkles className="h-4 w-4 text-purple-400" />
            <span className="text-sm font-bold text-white">Full AI Agent Analysis &amp; Recyclability</span>
          </div>
          {openSections.aiAnalysis ? (
            <ChevronUp className="h-4 w-4 text-slate-400" />
          ) : (
            <ChevronDown className="h-4 w-4 text-slate-400" />
          )}
        </button>

        <AnimatePresence>
          {openSections.aiAnalysis && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="p-5 pt-0 border-t border-slate-800/60 space-y-4 text-xs"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                <div className="space-y-2">
                  <span className="text-slate-400 font-semibold block">Optical Spectrum Analysis</span>
                  <p className="text-slate-200 leading-relaxed">
                    {classification?.contaminationNotes ||
                      'Clean recyclable beverage containers with minimal organic moisture. Calibrated optical reflection confirms PETE-1 standard.'}
                  </p>
                  <div className="flex items-center gap-2 text-slate-400 text-[11px]">
                    <span>Contamination probability:</span>
                    <span className="font-mono text-teal-400 font-bold">
                      {classification?.contaminationPercentage || 1.5}%
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-slate-400 font-semibold block">Recommended Handling &amp; Risks</span>
                  <p className="text-slate-200 leading-relaxed">
                    {aiAssessment?.recommendedHandling ||
                      'Near-Infrared (NIR) optical color sort and mechanical granulation. Strip caps and adhesive labels.'}
                  </p>
                  {aiAssessment?.potentialProcessingRisks && (
                    <ul className="list-disc list-inside text-slate-400 space-y-0.5 text-[11px]">
                      {aiAssessment.potentialProcessingRisks.map((risk, i) => (
                        <li key={i}>{risk}</li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Expandable Section 2: Custody History & Timeline */}
      <div className="rounded-xl bg-[#0c1220]/90 border border-slate-800/80 overflow-hidden">
        <button
          onClick={() => toggleSection('custodyHistory')}
          className="w-full p-4 flex items-center justify-between text-left hover:bg-[#11192b]/40 transition cursor-pointer"
        >
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="h-4 w-4 text-teal-400" />
            <span className="text-sm font-bold text-white">Digital Chain of Custody Timeline</span>
          </div>
          {openSections.custodyHistory ? (
            <ChevronUp className="h-4 w-4 text-slate-400" />
          ) : (
            <ChevronDown className="h-4 w-4 text-slate-400" />
          )}
        </button>

        <AnimatePresence>
          {openSections.custodyHistory && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="p-5 pt-0 border-t border-slate-800/60"
            >
              <div className="relative pl-6 space-y-6 mt-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
                {history.map((event, idx) => (
                  <div key={event.id || idx} className="relative group">
                    {/* Timeline bullet */}
                    <div
                      className={`absolute -left-6 top-1 h-4 w-4 rounded-full border-2 bg-[#070b14] flex items-center justify-center ${
                        event.anomalyFlag
                          ? 'border-[#ff5733] text-[#ff5733]'
                          : 'border-teal-400 text-teal-400'
                      }`}
                    >
                      <div
                        className={`h-1.5 w-1.5 rounded-full ${
                          event.anomalyFlag ? 'bg-[#ff5733]' : 'bg-teal-400'
                        }`}
                      />
                    </div>

                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="text-xs font-bold text-white">
                          {event.stageLabel}
                        </span>
                        <span className="text-[11px] font-mono text-slate-400">
                          {new Date(event.timestamp).toLocaleString([], {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
                        <span>{event.location.name}</span>
                        <span>·</span>
                        <span className="font-mono text-slate-300">
                          {event.measuredWeightKg} kg
                        </span>
                        <span>·</span>
                        <span>{event.handler.name}</span>
                      </div>

                      {event.evidence?.notes && (
                        <p className="text-xs text-slate-300 mt-1 bg-[#070b14] p-2.5 rounded-lg border border-slate-800/60">
                          {event.evidence.notes}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
