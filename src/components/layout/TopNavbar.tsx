import React, { useState } from 'react';
import {
  Search,
  Scan,
  Radio,
  Play,
  RotateCcw,
  Sparkles,
  ExternalLink,
  Menu,
} from 'lucide-react';
import { NotificationCenter } from './NotificationCenter.tsx';
import { AuditLogEntry, WasteBatch } from '../../types/ecoconnect.ts';

interface TopNavbarProps {
  onSearchBatch: (id: string) => void;
  onOpenScanner: () => void;
  onRunDemo: () => void;
  onResetDemo: () => void;
  batches: WasteBatch[];
  notifications: AuditLogEntry[];
  isConnected?: boolean;
  isDemoLoading?: boolean;
  demoStep?: number;
  onToggleMobileSidebar?: () => void;
}

export const TopNavbar: React.FC<TopNavbarProps> = ({
  onSearchBatch,
  onOpenScanner,
  onRunDemo,
  onResetDemo,
  batches,
  notifications,
  isConnected = true,
  isDemoLoading = false,
  demoStep = 0,
  onToggleMobileSidebar,
}) => {
  const [searchInput, setSearchInput] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      onSearchBatch(searchInput.trim());
      setShowSearchResults(false);
    }
  };

  const filteredBatches = batches.filter(
    (b) =>
      b.ecoTrackId.toLowerCase().includes(searchInput.toLowerCase()) ||
      b.material.toLowerCase().includes(searchInput.toLowerCase())
  );

  return (
    <header className="h-16 border-b border-slate-800/80 bg-[#070b14]/90 backdrop-blur-md sticky top-0 z-40 px-4 sm:px-6 flex items-center justify-between gap-4">
      {/* Left Search and Mobile Toggle */}
      <div className="flex items-center gap-3 flex-1 max-w-md">
        <button
          onClick={onToggleMobileSidebar}
          className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60"
          title="Toggle Menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Search Bar by EcoTrack ID */}
        <div className="relative flex-1">
          <form onSubmit={handleSearchSubmit}>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search EcoTrack ID (e.g. EC26-CHN-00182)..."
                value={searchInput}
                onChange={(e) => {
                  setSearchInput(e.target.value);
                  setShowSearchResults(true);
                }}
                onFocus={() => setShowSearchResults(true)}
                className="w-full bg-[#0c1220] border border-slate-800 rounded-lg pl-9 pr-4 py-1.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-teal-500/80 transition-all font-mono"
              />
            </div>
          </form>

          {/* Quick Auto-Complete Dropdown */}
          {showSearchResults && searchInput.trim().length > 0 && (
            <div className="absolute left-0 right-0 mt-1.5 bg-[#0c1220] border border-slate-800 rounded-xl shadow-2xl py-1 z-50 overflow-hidden divide-y divide-slate-800/40">
              {filteredBatches.length === 0 ? (
                <div className="px-3 py-2 text-xs text-slate-400">No matching batches found</div>
              ) : (
                filteredBatches.slice(0, 4).map((b) => (
                  <button
                    key={b.ecoTrackId}
                    onClick={() => {
                      onSearchBatch(b.ecoTrackId);
                      setSearchInput(b.ecoTrackId);
                      setShowSearchResults(false);
                    }}
                    className="w-full px-3 py-2 text-left hover:bg-[#11192b] flex items-center justify-between text-xs cursor-pointer"
                  >
                    <div>
                      <span className="font-mono font-bold text-teal-300 block">{b.ecoTrackId}</span>
                      <span className="text-[11px] text-slate-400">{b.material} · {b.initialWeightKg} kg</span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">{b.status}</span>
                  </button>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Live SSE Connection Indicator */}
        <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-md bg-[#0c1220] border border-slate-800/80 text-[11px]">
          <span
            className={`h-2 w-2 rounded-full ${
              isConnected ? 'bg-teal-400 animate-pulse' : 'bg-rose-400'
            }`}
          />
          <span className="text-slate-400 font-mono">
            {isConnected ? 'Real-Time Sync' : 'Offline'}
          </span>
        </div>

        {/* Scan QR Shortcut Button */}
        <button
          onClick={onOpenScanner}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#11192b] hover:bg-[#1a253d] text-teal-300 text-xs font-semibold border border-teal-500/30 transition cursor-pointer"
        >
          <Scan className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Scan QR</span>
        </button>

        {/* Demo Scenario Controller in Top Nav */}
        <button
          onClick={onResetDemo}
          disabled={isDemoLoading}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-[#0c1220] transition cursor-pointer disabled:opacity-50"
          title="Reset Demo to Initial State"
        >
          <RotateCcw className="h-4 w-4" />
        </button>

        <button
          onClick={onRunDemo}
          disabled={isDemoLoading}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-[#ff5733] to-[#f97316] hover:from-[#f94d27] hover:to-[#ea580c] text-white text-xs font-bold shadow-lg shadow-[#ff5733]/20 transition cursor-pointer disabled:opacity-50"
        >
          <Play className="h-3.5 w-3.5 fill-current" />
          <span className="hidden md:inline">Run Scenario</span>
        </button>

        {/* Notification Center */}
        <NotificationCenter
          notifications={notifications}
          onSelectNotification={onSearchBatch}
        />

        {/* User / Team Profile */}
        <div className="hidden md:flex items-center gap-2 pl-2 border-l border-slate-800/80 text-xs">
          <div className="h-7 w-7 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-slate-300">
            NH
          </div>
          <div className="leading-tight">
            <span className="text-white font-medium block">NAYASA</span>
            <span className="text-[10px] text-slate-400">HackLab Lead</span>
          </div>
        </div>
      </div>
    </header>
  );
};
