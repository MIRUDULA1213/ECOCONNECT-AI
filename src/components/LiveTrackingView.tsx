import React, { useState } from 'react';
import {
  Search,
  QrCode,
  MapPin,
  Scale,
  User,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Radio,
  FileText,
  ExternalLink,
  Sparkles,
  Wifi,
  WifiOff,
} from 'lucide-react';
import { WasteBatch, CustodyEvent } from '../types/ecoconnect.ts';
import { WordDef } from '../utils/publicDefinitions.tsx';

interface LiveTrackingViewProps {
  batches: WasteBatch[];
  selectedBatchId: string;
  onSelectBatchId: (id: string) => void;
  onNavigateTab: (tabId: string) => void;
}

export const LiveTrackingView: React.FC<LiveTrackingViewProps> = ({
  batches,
  selectedBatchId,
  onSelectBatchId,
  onNavigateTab,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const currentBatch = batches.find((b) => b.ecoTrackId === selectedBatchId) || batches[0];

  const filteredBatches = batches.filter(
    (b) =>
      b.ecoTrackId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.material.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.citizen.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!currentBatch) {
    return <div className="text-slate-400 p-8 text-center">No batches loaded yet.</div>;
  }

  const isVerified = currentBatch.status === 'RECOVERY_VERIFIED';
  const hasDiscrepancy = currentBatch.status === 'DISCREPANCY_FLAGGED';

  return (
    <div className="space-y-6">
      {/* Search and Selector Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search EcoTrack ID, material, citizen..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        {/* Quick Batch Selector Pills */}
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto no-scrollbar">
          <span className="text-xs text-slate-500 shrink-0">Sample IDs:</span>
          {batches.map((b) => (
            <button
              key={b.ecoTrackId}
              onClick={() => onSelectBatchId(b.ecoTrackId)}
              className={`px-2.5 py-1 text-xs font-mono font-bold rounded-lg border shrink-0 transition cursor-pointer ${
                b.ecoTrackId === currentBatch.ecoTrackId
                  ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/40'
                  : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
              }`}
            >
              {b.ecoTrackId}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Passport Header Card & Custody Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Digital Waste Passport Card */}
        <div className="space-y-6">
          <div className="rounded-xl bg-slate-900 border border-slate-800 p-5 shadow-sm space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <QrCode className="h-4 w-4 text-emerald-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Digital Waste Passport</h3>
              </div>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                  isVerified
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : hasDiscrepancy
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                    : 'bg-slate-800 text-slate-300 border border-slate-700'
                }`}
              >
                {currentBatch.status.replace('_', ' ')}
              </span>
            </div>

            {/* Passport Identity Header */}
            <div className="text-center p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col items-center">
              <div className="h-32 w-32 bg-white p-2 rounded-xl flex items-center justify-center shadow-lg mb-3">
                {currentBatch.qrDataUrl ? (
                  <img
                    src={currentBatch.qrDataUrl}
                    alt={currentBatch.ecoTrackId}
                    className="w-full h-full object-contain rounded"
                  />
                ) : (
                  <QrCode className="h-24 w-24 text-slate-800" />
                )}
              </div>
              <WordDef term="EcoTrack ID" value={currentBatch.ecoTrackId} size="lg" />
              <div className="mt-1">
                <WordDef term="Material" value={currentBatch.material} size="sm" />
              </div>
            </div>

            {/* Metrics Breakdown with One-Word Definitions */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/80">
                <WordDef
                  term="Weight"
                  value={`${currentBatch.initialWeightKg.toFixed(2)} ${currentBatch.unit || 'kg'}`}
                />
              </div>
              <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/80">
                <WordDef
                  term="Recovery"
                  value={
                    currentBatch.verifiedRecoveryWeightKg
                      ? `${currentBatch.verifiedRecoveryWeightKg.toFixed(2)} kg`
                      : 'Pending Audit'
                  }
                  highlightValue={!!currentBatch.verifiedRecoveryWeightKg}
                />
              </div>
            </div>

            {/* Recovery Yield Badge if verified */}
            {currentBatch.recoveryYieldPct !== undefined && (
              <div className="p-3 rounded-lg bg-emerald-950/30 border border-emerald-800/60 flex items-center justify-between">
                <div>
                  <WordDef term="Recovery Yield" />
                  <span className="text-[11px] text-slate-400 block mt-0.5 font-mono">
                    ({currentBatch.verifiedRecoveryWeightKg} / {currentBatch.initialWeightKg}) × 100
                  </span>
                </div>
                <span className="text-xl font-black text-emerald-400 font-mono">
                  {currentBatch.recoveryYieldPct}%
                </span>
              </div>
            )}

            {/* Optical AI Classification Info */}
            <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/80 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-300">ESP32-CAM AI Classification</span>
                <span className="text-emerald-400 font-bold font-mono">
                  {(currentBatch.opticalClassification.confidence * 100).toFixed(1)}% match
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                {currentBatch.opticalClassification.contaminationNotes || 'Clean polymer streams.'}
              </p>
              <div className="flex items-center gap-2 pt-1 border-t border-slate-800/60 text-[11px] text-slate-500">
                <span>Contamination: {currentBatch.opticalClassification.contaminationPercentage}%</span>
                <span>•</span>
                <span>Model: MobileNetV3-Edge</span>
              </div>
            </div>

            {/* Citizen Origin */}
            <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/80 text-xs space-y-1">
              <span className="text-[11px] text-slate-500 block">Depositor Citizen</span>
              <div className="flex items-center justify-between">
                <span className="font-semibold text-white">{currentBatch.citizen.name}</span>
                <span className="text-emerald-400 font-bold">+{currentBatch.citizen.greenCreditsEarned} Credits</span>
              </div>
              <p className="text-[11px] text-slate-400">{currentBatch.citizen.neighborhood}</p>
            </div>

            {/* Investigation Trigger Button */}
            {hasDiscrepancy && (
              <button
                onClick={() => onNavigateTab('investigation')}
                className="w-full py-2.5 rounded-lg bg-rose-500 hover:bg-rose-400 text-slate-950 text-xs font-bold transition flex items-center justify-center gap-1.5"
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>Open Multi-Source AI Investigation</span>
              </button>
            )}
          </div>
        </div>

        {/* Right 2 Columns: Chronological Digital Chain of Custody */}
        <div className="lg:col-span-2 rounded-xl bg-slate-900 border border-slate-800 p-5 shadow-sm space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-white tracking-wide">
                Digital Chain of Custody Timeline ({currentBatch.custodyHistory.length} Checkpoints)
              </h3>
              <p className="text-xs text-slate-400">
                Tamper-evident verification from bin deposit to flake recovery
              </p>
            </div>
            <span className="text-xs font-mono text-slate-400">
              Station: {currentBatch.smartStation.stationName}
            </span>
          </div>

          {/* Timeline Nodes */}
          <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-800">
            {currentBatch.custodyHistory.map((evt, idx) => {
              const isOffline = evt.syncStatus === 'QUEUED_OFFLINE';
              const isReconciled = evt.syncStatus === 'RECONCILED';
              const isLast = idx === currentBatch.custodyHistory.length - 1;

              return (
                <div key={evt.id} className="relative group">
                  {/* Node Dot */}
                  <div
                    className={`absolute -left-[27px] top-1.5 h-4 w-4 rounded-full border-2 flex items-center justify-center transition ${
                      evt.stage === 'RECOVERY_VERIFIED'
                        ? 'bg-emerald-500 border-emerald-400 text-slate-950'
                        : evt.anomalyFlag
                        ? 'bg-rose-500 border-rose-400 text-slate-950'
                        : isReconciled
                        ? 'bg-teal-500 border-teal-400'
                        : 'bg-slate-900 border-emerald-500'
                    }`}
                  >
                    <div className="h-1.5 w-1.5 rounded-full bg-white" />
                  </div>

                  {/* Card Content */}
                  <div
                    className={`rounded-xl p-4 border transition ${
                      evt.anomalyFlag
                        ? 'bg-rose-950/20 border-rose-800/60'
                        : isReconciled
                        ? 'bg-teal-950/20 border-teal-800/60'
                        : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-800/60">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-white">{evt.stageLabel}</span>
                          {isReconciled && (
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-teal-500/20 text-teal-300 border border-teal-500/30 flex items-center gap-1">
                              <Wifi className="h-2.5 w-2.5" /> Reconciled Offline
                            </span>
                          )}
                          {isOffline && (
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                              <WifiOff className="h-2.5 w-2.5" /> Buffered Offline
                            </span>
                          )}
                          {evt.anomalyFlag && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1">
                              <AlertTriangle className="h-2.5 w-2.5" /> Discrepancy
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                          <Clock className="h-3 w-3" />
                          {new Date(evt.timestamp).toLocaleString()}
                        </span>
                      </div>

                      {/* Weight pill */}
                      <div className="flex items-center gap-2">
                        <div className="text-right">
                          <span className="text-[10px] text-slate-500 block">Weighed</span>
                          <span
                            className={`font-mono font-black text-sm ${
                              evt.stage === 'RECOVERY_VERIFIED'
                                ? 'text-emerald-400'
                                : evt.anomalyFlag
                                ? 'text-rose-400'
                                : 'text-white'
                            }`}
                          >
                            {evt.measuredWeightKg.toFixed(2)} kg
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Checkpoint Detail Row */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-3 text-xs">
                      <div className="flex items-center gap-2 text-slate-400">
                        <MapPin className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                        <span className="truncate">{evt.location.name}</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-400">
                        <User className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                        <span className="truncate">
                          {evt.handler.name} ({evt.handler.role})
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-400">
                        <Radio className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                        <span className="font-mono truncate">{evt.device.deviceId}</span>
                      </div>
                    </div>

                    {/* Evidence & Notes */}
                    {evt.evidence.notes && (
                      <div className="mt-2 text-xs bg-slate-900/80 p-2.5 rounded-lg border border-slate-800/80 text-slate-300">
                        <span className="text-slate-500 font-semibold mr-1">Evidence Log:</span>
                        {evt.evidence.notes}
                        {evt.evidence.receiptRef && (
                          <span className="ml-2 font-mono text-[11px] text-emerald-400">
                            Ref: {evt.evidence.receiptRef}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
