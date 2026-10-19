import React, { useState } from 'react';
import {
  Cpu,
  Terminal,
  Play,
  CheckCircle2,
  AlertCircle,
  Clock,
  Layers,
  Code,
  Sparkles,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';
import { ToolCallExecution } from '../types/ecoconnect.ts';

interface AgentActivityViewProps {
  toolExecutions: ToolCallExecution[];
  onExecuteToolDirectly: (toolName: string, args: Record<string, any>) => Promise<any>;
}

export const AgentActivityView: React.FC<AgentActivityViewProps> = ({
  toolExecutions,
  onExecuteToolDirectly,
}) => {
  const [selectedTool, setSelectedTool] = useState('calculate_recovery_yield');
  const [toolArgsJson, setToolArgsJson] = useState(
    JSON.stringify({ initialWeightKg: 1.80, verifiedRecoveredWeightKg: 1.20 }, null, 2)
  );
  const [playgroundOutput, setPlaygroundOutput] = useState<any>(null);
  const [isCallingTool, setIsCallingTool] = useState(false);
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

  const toolTemplates: Record<string, any> = {
    calculate_recovery_yield: { initialWeightKg: 1.8, verifiedRecoveredWeightKg: 1.2 },
    detect_weight_anomaly: { ecoTrackId: 'EC26-CHN-00182' },
    get_waste_batch: { ecoTrackId: 'EC26-CHN-00182' },
    get_custody_history: { ecoTrackId: 'EC26-CHN-00182' },
    get_weight_readings: { ecoTrackId: 'EC26-CHN-00182' },
    classify_material: { materialHint: 'PET Beverage Bottles', densityEstimate: 1.38 },
    request_facility_evidence: {
      facilityId: 'REC-CHN-GL01',
      batchId: 'EC26-CHN-00182',
      evidenceType: 'TARE_CALIBRATION',
    },
    send_notification: {
      recipient: 'Priya Sundaram',
      channel: 'WHATSAPP',
      message: 'Your EcoTrack batch has completed recovery verification. Yield: 66.67%.',
      ecoTrackId: 'EC26-CHN-00182',
    },
  };

  const handleToolSelect = (toolName: string) => {
    setSelectedTool(toolName);
    setToolArgsJson(JSON.stringify(toolTemplates[toolName] || {}, null, 2));
    setPlaygroundOutput(null);
  };

  const handleRunPlayground = async () => {
    try {
      setIsCallingTool(true);
      const parsedArgs = JSON.parse(toolArgsJson);
      const res = await onExecuteToolDirectly(selectedTool, parsedArgs);
      setPlaygroundOutput(res);
    } catch (err: any) {
      setPlaygroundOutput({ error: err.message });
    } finally {
      setIsCallingTool(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-xl bg-slate-900 border border-slate-800 p-5 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/20 shrink-0">
            <Terminal className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white tracking-wide">
                Agent Tool Invocations &amp; Execution Terminal
              </h2>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                {toolExecutions.length} Calls Logged
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Real-time audit of autonomous agent actions, tool arguments, outputs, execution latencies, and error handling.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 bg-slate-950 px-3 py-2 rounded-lg border border-slate-800">
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>12 Tools Callable</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left 3 Cols: Tool Execution Log */}
        <div className="lg:col-span-3 rounded-xl bg-slate-900 border border-slate-800 overflow-hidden shadow-sm">
          <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Cpu className="h-4 w-4 text-emerald-400" />
              <span>Execution Stream</span>
            </h3>
            <span className="text-[11px] text-slate-400">Click to expand inputs &amp; outputs</span>
          </div>

          <div className="divide-y divide-slate-800/80 max-h-[700px] overflow-y-auto">
            {toolExecutions.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-xs">
                No tool executions recorded yet. Run a step from the demo scenario or use the playground on the right.
              </div>
            ) : (
              toolExecutions.map((exec) => {
                const isExpanded = expandedLogId === exec.id;
                const isSuccess = exec.status === 'SUCCESS';

                return (
                  <div key={exec.id} className="p-4 hover:bg-slate-800/30 transition text-xs">
                    <div
                      onClick={() => setExpandedLogId(isExpanded ? null : exec.id)}
                      className="flex items-start justify-between gap-3 cursor-pointer"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          {isSuccess ? (
                            <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                          ) : (
                            <AlertCircle className="h-4 w-4 text-rose-400 shrink-0" />
                          )}
                          <span className="font-mono font-bold text-emerald-400">{exec.toolName}</span>
                          <span className="text-slate-500">•</span>
                          <span className="font-semibold text-slate-300">{exec.callerAgent}</span>
                        </div>
                        <p className="text-[11px] text-slate-400">{exec.explanation}</p>
                      </div>

                      <div className="flex items-center gap-3 shrink-0 text-right">
                        <div>
                          <span className="font-mono text-slate-400 block text-[11px]">{exec.durationMs}ms</span>
                          <span className="text-[10px] text-slate-500">
                            {new Date(exec.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                        {isExpanded ? (
                          <ChevronDown className="h-4 w-4 text-slate-500" />
                        ) : (
                          <ChevronRight className="h-4 w-4 text-slate-500" />
                        )}
                      </div>
                    </div>

                    {/* Collapsible Arguments & Result Inspector */}
                    {isExpanded && (
                      <div className="mt-3 pt-3 border-t border-slate-800/80 space-y-2">
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                            Input Arguments:
                          </span>
                          <pre className="p-2.5 rounded bg-slate-950 font-mono text-[11px] text-teal-300 overflow-x-auto border border-slate-800">
                            {JSON.stringify(exec.inputArgs, null, 2)}
                          </pre>
                        </div>
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                            Output Result:
                          </span>
                          <pre className="p-2.5 rounded bg-slate-950 font-mono text-[11px] text-emerald-300 overflow-x-auto border border-slate-800">
                            {JSON.stringify(exec.outputResult, null, 2)}
                          </pre>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right 2 Cols: Interactive Tool Playground */}
        <div className="lg:col-span-2 rounded-xl bg-slate-900 border border-slate-800 p-5 shadow-sm space-y-4">
          <div className="pb-3 border-b border-slate-800">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Code className="h-4 w-4 text-emerald-400" />
              <span>Interactive Tool Playground</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Judges can test any of the 12 tools directly with custom JSON payloads.
            </p>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Select Tool Function:
              </label>
              <select
                value={selectedTool}
                onChange={(e) => handleToolSelect(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
              >
                {Object.keys(toolTemplates).map((tool) => (
                  <option key={tool} value={tool}>
                    {tool}()
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Arguments Payload (JSON):
              </label>
              <textarea
                rows={5}
                value={toolArgsJson}
                onChange={(e) => setToolArgsJson(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-teal-300 font-mono focus:outline-none focus:border-emerald-500"
              />
            </div>

            <button
              onClick={handleRunPlayground}
              disabled={isCallingTool}
              className="w-full py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-md shadow-emerald-500/20"
            >
              <Play className="h-3.5 w-3.5 fill-current" />
              <span>{isCallingTool ? 'Calling Tool...' : `Execute ${selectedTool}()`}</span>
            </button>

            {playgroundOutput && (
              <div className="pt-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Response:
                </span>
                <pre className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-emerald-300 font-mono text-[11px] max-h-60 overflow-y-auto">
                  {JSON.stringify(playgroundOutput, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
