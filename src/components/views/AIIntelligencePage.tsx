import React, { useState } from 'react';
import {
  Sparkles,
  Scale,
  Search,
  CheckCircle2,
  AlertTriangle,
  Play,
  RotateCcw,
  Terminal,
  ExternalLink,
  Cpu,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { AiAgentOrb, OrbState } from '../ai/AiAgentOrb.tsx';
import { AgentWorkflow } from '../ai/AgentWorkflow.tsx';
import { WasteBatch, InvestigationCase } from '../../types/ecoconnect.ts';
import { api } from '../../services/api.ts';

interface AIIntelligencePageProps {
  batch: WasteBatch | null;
  investigation: InvestigationCase | null;
  onNavigateTab: (tabId: any) => void;
  demoStep: number;
}

export const AIIntelligencePage: React.FC<AIIntelligencePageProps> = ({
  batch,
  investigation,
  onNavigateTab,
  demoStep,
}) => {
  const [selectedTool, setSelectedTool] = useState('detect_weight_anomaly');
  const [toolResult, setToolResult] = useState<any>(null);
  const [isExecutingTool, setIsExecutingTool] = useState(false);

  // Map demo steps to stage
  const getWorkflowStageIndex = (step: number) => {
    if (step <= 1) return 0;
    if (step === 2) return 1;
    if (step === 3 || step === 4) return 2;
    if (step === 5) return 3;
    if (step === 6) return 4;
    if (step === 7) return 5;
    return 6;
  };

  const stageIndex = getWorkflowStageIndex(demoStep);
  const isAwaitingApproval = demoStep === 6;

  const orbState: OrbState =
    demoStep === 9
      ? 'verified'
      : isAwaitingApproval
      ? 'thinking'
      : demoStep >= 3 && demoStep <= 5
      ? 'investigating'
      : demoStep === 7
      ? 'executing'
      : 'idle';

  const handleTestTool = async () => {
    setIsExecutingTool(true);
    try {
      let args: any = {};
      const ecoTrackId = batch?.ecoTrackId || 'EC26-CHN-00182';

      if (selectedTool === 'detect_weight_anomaly') {
        args = { ecoTrackId };
      } else if (selectedTool === 'calculate_recovery_yield') {
        args = { initialWeightKg: batch?.initialWeightKg || 1.8, verifiedRecoveredWeightKg: 1.2 };
      } else if (selectedTool === 'classify_material') {
        args = { materialHint: batch?.material || 'PET' };
      } else if (selectedTool === 'get_custody_history') {
        args = { ecoTrackId };
      } else if (selectedTool === 'request_facility_evidence') {
        args = { facilityId: 'REC-CHN-GL01', batchId: ecoTrackId, evidenceType: 'TARE_CALIBRATION_SHEET' };
      }

      const res = await api.executeToolDirectly(selectedTool, args);
      setToolResult(res);
    } catch (err: any) {
      setToolResult({ error: err.message });
    } finally {
      setIsExecutingTool(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="pb-3 border-b border-slate-800/80">
        <h1 className="text-xl font-bold text-white tracking-tight">
          AI Intelligence &amp; Multi-Agent Reasoning
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Autonomous anomaly investigation, multi-source sensor synthesis, and tool execution.
        </p>
      </div>

      {/* Hero Agent Orb Card */}
      <div className="rounded-xl bg-[#0c1220] border border-slate-800 p-6 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-800/60">
          <div className="flex items-center gap-6">
            <AiAgentOrb
              state={orbState}
              size="lg"
              label={
                demoStep === 9
                  ? 'Audit Sealed & Recovery Reconciled'
                  : isAwaitingApproval
                  ? 'Autonomous Paused at Human Gate'
                  : 'Investigation Agent Active'
              }
              sublabel={
                investigation
                  ? `Correlating 3 weighing points for ${investigation.ecoTrackId}`
                  : 'Synthesizing evidence across load cells and weighbridges'
              }
            />
          </div>

          <div className="space-y-2 text-right">
            <span className="text-[11px] font-mono text-teal-400 block">
              Gemini 3.8 Flash + MobileNetV3
            </span>
            <span className="text-xs text-slate-400 block">
              Confidence Estimate:{' '}
              <span className="text-white font-mono font-bold">96.4%</span>
            </span>
            {isAwaitingApproval && (
              <button
                onClick={() => onNavigateTab('approvals')}
                className="px-4 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-[#ff5733] text-white text-xs font-bold shadow-md animate-pulse cursor-pointer"
              >
                Go to Approval Gate
              </button>
            )}
          </div>
        </div>

        {/* 7-Step Workflow Visualization */}
        <div className="space-y-2">
          <span className="text-xs font-semibold text-slate-300 block">
            End-to-End Autonomous Pipeline
          </span>
          <AgentWorkflow
            currentStageIndex={stageIndex}
            isAwaitingApproval={isAwaitingApproval}
            onStageClick={(key) => {
              if (key === 'APPROVE') onNavigateTab('approvals');
            }}
          />
        </div>
      </div>

      {/* Multi-Source Correlation Inspector */}
      <div className="rounded-xl bg-[#0c1220] border border-slate-800 p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800/60">
          <div>
            <h3 className="text-sm font-bold text-white">
              Multi-Source Evidence Correlation
            </h3>
            <p className="text-xs text-slate-400">
              Cross-referencing telemetry across digital custody checkpoints
            </p>
          </div>
          <span className="text-xs font-mono text-teal-400">3 Telemetry Points</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          {/* Node 1 */}
          <div className="p-4 rounded-lg bg-[#070b14] border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 font-semibold">1. Smart Hub Load Cell</span>
              <span className="font-mono text-teal-400 font-bold">1.80 kg</span>
            </div>
            <p className="text-slate-300">
              ESP32 calibrated load-cell at Besant Nagar Smart Station #14. Zero tare offset.
            </p>
            <span className="text-[10px] font-mono text-slate-500 block">
              Status: Validated
            </span>
          </div>

          {/* Node 2 */}
          <div className="p-4 rounded-lg bg-[#070b14] border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 font-semibold">2. Sorting MRF Weighbridge</span>
              <span className="font-mono text-teal-400 font-bold">1.62 kg</span>
            </div>
            <p className="text-slate-300">
              Guindy MRF intake. 0.18 kg variance accounted for moisture loss and initial cap detaching.
            </p>
            <span className="text-[10px] font-mono text-slate-500 block">
              Status: Within Tolerance (10%)
            </span>
          </div>

          {/* Node 3 */}
          <div className="p-4 rounded-lg bg-[#070b14] border border-[#ff5733]/40 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[#ff5733] font-semibold">3. Recycler Intake Scale</span>
              <span className="font-mono text-[#ff5733] font-bold">1.48 kg (Net)</span>
            </div>
            <p className="text-slate-300">
              Reported 1.48 kg due to missing container tare subtraction (0.32 kg unzeroed crate weight).
            </p>
            <span className="text-[10px] font-mono text-amber-400 block">
              Status: Discrepancy Resolved via Tare Offset
            </span>
          </div>
        </div>

        {/* Root Cause Inference Box */}
        <div className="p-3.5 rounded-lg bg-teal-950/20 border border-teal-500/40 text-xs space-y-1">
          <div className="flex items-center gap-2 text-teal-300 font-bold">
            <CheckCircle2 className="h-4 w-4" />
            <span>Autonomous Root-Cause Inference</span>
          </div>
          <p className="text-slate-300 leading-relaxed">
            The Agent correlated the facility calibration log with the CCTV unloading timestamp. Crate T-991 tare weight (0.32 kg) was omitted during scale zeroing. Net recyclable mass confirmed as 1.48 kg with 96.4% statistical confidence.
          </p>
        </div>
      </div>

      {/* Direct Interactive Tool Playground */}
      <div className="rounded-xl bg-[#0c1220] border border-slate-800 p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800/60">
          <div className="flex items-center gap-2">
            <Terminal className="h-4 w-4 text-teal-400" />
            <h3 className="text-sm font-bold text-white">Interactive Agent Tools Playground</h3>
          </div>
          <span className="text-xs text-slate-400">12 Callable Tools</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {[
            { id: 'detect_weight_anomaly', label: 'detect_weight_anomaly' },
            { id: 'calculate_recovery_yield', label: 'calculate_recovery_yield' },
            { id: 'classify_material', label: 'classify_material' },
            { id: 'get_custody_history', label: 'get_custody_history' },
            { id: 'request_facility_evidence', label: 'request_facility_evidence' },
          ].map((tool) => (
            <button
              key={tool.id}
              onClick={() => setSelectedTool(tool.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono transition cursor-pointer ${
                selectedTool === tool.id
                  ? 'bg-teal-500/20 text-teal-300 font-bold border border-teal-500/50'
                  : 'bg-[#070b14] text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {tool.label}()
            </button>
          ))}

          <button
            onClick={handleTestTool}
            disabled={isExecutingTool}
            className="ml-auto px-4 py-1.5 rounded-lg bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50"
          >
            <Play className="h-3 w-3 fill-current" />
            <span>{isExecutingTool ? 'Calling Tool...' : 'Execute Tool'}</span>
          </button>
        </div>

        {/* Tool Output Display */}
        {toolResult && (
          <div className="rounded-lg bg-[#070b14] border border-slate-800 p-4 font-mono text-xs text-teal-300 max-h-60 overflow-y-auto">
            <pre>{JSON.stringify(toolResult, null, 2)}</pre>
          </div>
        )}
      </div>
    </div>
  );
};
