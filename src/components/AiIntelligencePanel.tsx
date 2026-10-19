import React from 'react';
import {
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Scale,
  Cpu,
  Layers,
  Clock,
  ArrowRight,
  TrendingUp,
  FileCheck2,
  HelpCircle,
  ExternalLink,
} from 'lucide-react';
import { WasteBatch } from '../types/ecoconnect.ts';
import { WordDef } from '../utils/publicDefinitions.tsx';

interface AiIntelligencePanelProps {
  batch?: WasteBatch;
  batches: WasteBatch[];
  onSelectBatch: (id: string) => void;
  onNavigateTab: (tabId: string) => void;
}

export const AiIntelligencePanel: React.FC<AiIntelligencePanelProps> = ({
  batch,
  batches,
  onSelectBatch,
  onNavigateTab,
}) => {
  const currentBatch = batch || batches[0];
  const ai = currentBatch?.aiAssessment;

  if (!currentBatch || !ai) {
    return (
      <div className="rounded-xl bg-[#0f172a] border border-slate-800 p-12 text-center text-slate-400">
        No AI assessment loaded for this batch.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-xl bg-gradient-to-r from-[#0c1220] via-[#0f172a] to-[#141d30] border-2 border-slate-800 p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-black text-white tracking-wide">
              AI Intelligence Panel • Batch-Specific Predictions
            </h2>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-teal-500/15 text-teal-300 border border-teal-500/30 font-bold uppercase">
              Dynamic Model
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Never static. Predictions, recyclability assessments, and handling risks are computed from this exact batch's physical measurements and optical classification.
          </p>
        </div>

        {/* Batch selector quick pills */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          {batches.map((b) => (
            <button
              key={b.ecoTrackId}
              onClick={() => onSelectBatch(b.ecoTrackId)}
              className={`px-2.5 py-1 text-xs font-mono font-bold rounded-lg border transition cursor-pointer shrink-0 ${
                b.ecoTrackId === currentBatch.ecoTrackId
                  ? 'bg-teal-500/20 text-teal-300 border-teal-500/40'
                  : 'bg-[#070b14] text-slate-400 border-slate-800 hover:text-white'
              }`}
            >
              {b.ecoTrackId}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: AI Intelligence Report & Single-word Definitions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 8 Cols: Deep AI Assessment Cards */}
        <div className="lg:col-span-8 space-y-6">
          {/* Identity & Prediction Overview Card */}
          <div className="rounded-xl bg-[#0f172a] border border-slate-800 p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-teal-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Material Classification &amp; Recyclability Grade
                </h3>
              </div>
              <span className="text-[10px] font-mono text-slate-400">
                Model: {ai.modelName}
              </span>
            </div>

            <div className="p-4 rounded-xl bg-[#070b14] border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <WordDef term="AI Prediction" />
                <span className="text-base sm:text-lg font-black text-white font-mono block">
                  {ai.predictedMaterialClass}
                </span>
                <span className="text-xs text-slate-400 block">
                  Category: <strong className="text-teal-400">{ai.predictedWasteCategory}</strong>
                </span>
              </div>

              {/* Confidence Gauge */}
              <div className="flex flex-col items-center justify-center p-3 rounded-xl bg-[#0c1220] border border-slate-800 min-w-[120px] shrink-0">
                <span className="text-2xl font-black text-teal-400 font-mono">
                  {ai.predictionConfidence}%
                </span>
                <WordDef term="Confidence" />
              </div>
            </div>

            {/* Key Metric WordDef Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <div className="p-3 rounded-lg bg-[#070b14] border border-slate-800">
                <WordDef term="Weight" value={`${currentBatch.initialWeightKg.toFixed(2)} ${currentBatch.unit || 'kg'}`} />
              </div>
              <div className="p-3 rounded-lg bg-[#070b14] border border-slate-800">
                <WordDef term="Contamination" value={`${ai.contaminationProbabilityPct}%`} />
              </div>
              <div className="p-3 rounded-lg bg-[#070b14] border border-slate-800">
                <WordDef term="Recyclability" value={ai.recyclabilityAssessment.replace(/_/g, ' ')} highlightValue />
              </div>
              <div className="p-3 rounded-lg bg-[#070b14] border border-slate-800">
                <WordDef term="Provenance" value={currentBatch.sourceType} />
              </div>
            </div>
          </div>

          {/* Handling Recommendations & Processing Risks */}
          <div className="rounded-xl bg-[#0f172a] border border-slate-800 p-5 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Handling Recommendations &amp; Processing Risks
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {/* Sorting Recommendation */}
              <div className="p-3.5 rounded-lg bg-[#070b14] border border-slate-800 space-y-1.5">
                <div className="flex items-center gap-1.5 text-teal-300 font-bold">
                  <CheckCircle2 className="h-4 w-4 text-teal-400" />
                  <span><WordDef term="Sorting" /> Protocol:</span>
                </div>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  {ai.sortingRecommendation}
                </p>
              </div>

              {/* Recommended Handling */}
              <div className="p-3.5 rounded-lg bg-[#070b14] border border-slate-800 space-y-1.5">
                <div className="flex items-center gap-1.5 text-teal-300 font-bold">
                  <Layers className="h-4 w-4 text-teal-400" />
                  <span>Recommended Handling:</span>
                </div>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  {ai.recommendedHandling}
                </p>
              </div>
            </div>

            {/* Potential Processing Risks */}
            <div className="p-3.5 rounded-lg bg-rose-950/20 border border-rose-800/40 text-xs space-y-1.5">
              <div className="flex items-center gap-1.5 text-rose-300 font-bold">
                <AlertTriangle className="h-4 w-4 text-rose-400" />
                <span><WordDef term="Risk" /> Assessment (Processing Hazards):</span>
              </div>
              <ul className="space-y-1 text-[11px] text-slate-300">
                {ai.potentialProcessingRisks.map((risk, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="text-rose-400 font-bold">•</span>
                    <span>{risk}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Suggested Next Action */}
            <div className="p-3 rounded-lg bg-teal-950/20 border border-teal-800/40 text-xs flex items-center justify-between gap-3">
              <div className="space-y-0.5">
                <span className="text-[10px] font-bold text-teal-400 uppercase tracking-wider block">
                  <WordDef term="Recommendation" />
                </span>
                <span className="text-white font-semibold text-xs">{ai.suggestedNextAction}</span>
              </div>
              <button
                onClick={() => onNavigateTab('tracking')}
                className="px-3 py-1.5 rounded-lg bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs font-bold shrink-0 transition"
              >
                Track Journey
              </button>
            </div>
          </div>
        </div>

        {/* Right 4 Cols: Evidence Basis & Metadata Provenance */}
        <div className="lg:col-span-4 space-y-4">
          <div className="rounded-xl bg-[#0f172a] border border-slate-800 p-5 shadow-sm space-y-4">
            <div className="pb-2 border-b border-slate-800">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <FileCheck2 className="h-4 w-4 text-teal-400" />
                <span><WordDef term="Evidence" /> Foundation</span>
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Basis used for model conclusions
              </p>
            </div>

            <div className="p-3 rounded-lg bg-[#070b14] border border-slate-800 text-xs space-y-1">
              <span className="text-[10px] text-slate-500 font-semibold block uppercase">Evidence Type</span>
              <span className="font-bold text-teal-400 font-mono block">{ai.evidenceType}</span>
              <span className="text-[11px] text-slate-400 block">
                Never fabricated. Clearly distinguished from assumptions.
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <span className="text-slate-400 font-semibold block">Corroborated Inputs:</span>
              <ul className="space-y-1.5 text-[11px] text-slate-300">
                {ai.evidenceBasis.map((ev, i) => (
                  <li key={i} className="p-2 rounded bg-[#070b14] border border-slate-800/80 flex items-start gap-1.5">
                    <span className="text-teal-400 font-bold">✓</span>
                    <span>{ev}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-500 space-y-1 font-mono">
              <div>Analyzed: {new Date(ai.analyzedAt).toLocaleString()}</div>
              <div>Inference Engine: {ai.modelName}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
