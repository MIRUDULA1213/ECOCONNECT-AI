import React from 'react';
import {
  Layers,
  ShieldCheck,
  Sparkles,
  CheckCircle2,
  Cpu,
  BarChart3,
  FileText,
  Play,
  RotateCcw,
  PlusCircle,
  Radio,
  Flame,
  QrCode,
  Scan,
} from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tabId: string) => void;
  pendingApprovalsCount: number;
  unresolvedAnomaliesCount: number;
  onRunDemo: () => void;
  onResetDemo: () => void;
  onOpenNewBatchModal: () => void;
  isDemoLoading: boolean;
  demoStep: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  pendingApprovalsCount,
  unresolvedAnomaliesCount,
  onRunDemo,
  onResetDemo,
  onOpenNewBatchModal,
  isDemoLoading,
  demoStep,
}) => {
  const sections = [
    { id: 'overview', num: '01', label: 'Overview', icon: Layers },
    { id: 'generate_qr', num: '02', label: 'Generate QR', icon: QrCode },
    { id: 'scan_qr', num: '03', label: 'Scan QR', icon: Scan },
    { id: 'tracking', num: '04', label: 'Waste Tracking', icon: ShieldCheck },
    {
      id: 'investigation',
      num: '05',
      label: 'AI Investigation',
      icon: Sparkles,
      badge: unresolvedAnomaliesCount > 0 ? `${unresolvedAnomaliesCount}` : undefined,
      badgeColor: 'bg-[#ff5733]',
    },
    { id: 'ai_intelligence', num: '06', label: 'AI Intelligence', icon: Sparkles },
    { id: 'workflow', num: '07', label: 'Agent Activity', icon: Cpu },
    {
      id: 'approvals',
      num: '08',
      label: 'Approval Centre',
      icon: CheckCircle2,
      badge: pendingApprovalsCount > 0 ? `${pendingApprovalsCount}` : undefined,
      badgeColor: 'bg-amber-500',
    },
    { id: 'impact', num: '09', label: 'Impact Analytics', icon: BarChart3 },
    { id: 'audit_reports', num: '10', label: 'Audit & Reports', icon: FileText },
  ];

  return (
    <header className="border-b border-slate-800/90 bg-[#070b14]/95 backdrop-blur-md sticky top-0 z-50">
      {/* Top utility row */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/60">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-gradient-to-tr from-[#ff5733] to-[#f97316] flex items-center justify-center shadow-lg shadow-[#ff5733]/25">
            <Flame className="h-5 w-5 text-slate-950 font-black" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-black tracking-tight text-white">ECOCONNECT</span>
              <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-coral-500/15 text-[#ff6f59] border border-[#ff5733]/40 font-bold">
                DEMO MODE
              </span>
              <span className="text-[10px] text-slate-400 font-mono hidden sm:inline">
                Chennai · Demo data
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Agentic Waste Intelligence Platform • <span className="text-teal-400 font-medium">NAYASA HackLab (OPEN-X)</span>
            </p>
          </div>
        </div>

        {/* Live System Ticker & Primary Actions */}
        <div className="flex items-center gap-2">
          <div className="hidden lg:flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-[#0c1220] border border-slate-800 text-xs text-slate-400">
            <span className="h-2 w-2 rounded-full bg-teal-400 animate-pulse" />
            <span className="text-teal-300 font-semibold font-mono">Gemini 3.8 Flash</span>
            <span className="text-slate-600">|</span>
            <span className="text-slate-400">IoT Edge: 4 Nodes</span>
          </div>

          <button
            onClick={onOpenNewBatchModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#11192b] hover:bg-[#1a253d] text-slate-300 text-xs font-semibold border border-slate-700/80 transition"
          >
            <PlusCircle className="h-3.5 w-3.5 text-teal-400" />
            <span className="hidden sm:inline">Ingest Batch</span>
          </button>

          <button
            onClick={onResetDemo}
            disabled={isDemoLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#11192b] hover:bg-[#1a253d] text-slate-300 text-xs font-semibold border border-slate-700/80 transition disabled:opacity-50"
            title="Reset scenario to pristine initial state"
          >
            <RotateCcw className="h-3.5 w-3.5 text-slate-400" />
            <span className="hidden sm:inline">Reset</span>
          </button>

          {/* Primary Action Button in Coral Orange */}
          <button
            onClick={onRunDemo}
            disabled={isDemoLoading}
            className="flex items-center gap-2 px-4 py-1.5 rounded-lg bg-gradient-to-r from-[#ff5733] to-[#f97316] hover:from-[#f94d27] hover:to-[#ea580c] text-white text-xs font-black shadow-lg shadow-[#ff5733]/25 transition cursor-pointer disabled:opacity-50"
          >
            <Play className="h-3.5 w-3.5 fill-current" />
            <span>RUN END-TO-END DEMO</span>
          </button>
        </div>
      </div>

      {/* 7 Core Sections Tab Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex space-x-1 overflow-x-auto py-2 no-scrollbar">
          {sections.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3 py-1.5 text-xs font-bold rounded-lg whitespace-nowrap transition cursor-pointer ${
                  isActive
                    ? 'bg-[#162035] text-white border border-teal-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`}
              >
                <span
                  className={`font-mono text-[10px] ${
                    isActive ? 'text-teal-400 font-bold' : 'text-slate-500'
                  }`}
                >
                  {tab.num}.
                </span>
                <Icon
                  className={`h-3.5 w-3.5 ${
                    isActive ? 'text-teal-400' : 'text-slate-500'
                  }`}
                />
                <span>{tab.label}</span>
                {tab.badge !== undefined && (
                  <span
                    className={`ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-black text-white ${tab.badgeColor}`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
