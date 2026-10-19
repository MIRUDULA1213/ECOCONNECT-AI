import React, { useState } from 'react';
import { Sidebar, NavTabId } from './Sidebar.tsx';
import { TopNavbar } from './TopNavbar.tsx';
import { WasteBatch, AuditLogEntry } from '../../types/ecoconnect.ts';

interface AppLayoutProps {
  activeTab: NavTabId;
  setActiveTab: (tab: NavTabId) => void;
  batches: WasteBatch[];
  notifications: AuditLogEntry[];
  onSearchBatch: (id: string) => void;
  onRunDemo: () => void;
  onResetDemo: () => void;
  isDemoLoading?: boolean;
  demoStep?: number;
  pendingApprovalsCount: number;
  openIncidentsCount: number;
  isConnected?: boolean;
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({
  activeTab,
  setActiveTab,
  batches,
  notifications,
  onSearchBatch,
  onRunDemo,
  onResetDemo,
  isDemoLoading = false,
  demoStep = 0,
  pendingApprovalsCount,
  openIncidentsCount,
  isConnected = true,
  children,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col selection:bg-[#ff5733] selection:text-white">
      <div className="flex-1 flex overflow-hidden">
        {/* Desktop Collapsible Sidebar */}
        <div className="hidden lg:flex">
          <Sidebar
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            isCollapsed={isCollapsed}
            setIsCollapsed={setIsCollapsed}
            pendingApprovalsCount={pendingApprovalsCount}
            openIncidentsCount={openIncidentsCount}
          />
        </div>

        {/* Mobile Slide-Over Sidebar Drawer */}
        {isMobileOpen && (
          <div className="lg:hidden fixed inset-0 z-50 flex">
            <div
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setIsMobileOpen(false)}
            />
            <div className="relative z-10 w-64 bg-[#070b14] h-full flex flex-col">
              <Sidebar
                activeTab={activeTab}
                setActiveTab={(tab) => {
                  setActiveTab(tab);
                  setIsMobileOpen(false);
                }}
                isCollapsed={false}
                setIsCollapsed={() => {}}
                pendingApprovalsCount={pendingApprovalsCount}
                openIncidentsCount={openIncidentsCount}
              />
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
          {/* Top Navbar */}
          <TopNavbar
            onSearchBatch={onSearchBatch}
            onOpenScanner={() => setActiveTab('scan_qr')}
            onRunDemo={onRunDemo}
            onResetDemo={onResetDemo}
            batches={batches}
            notifications={notifications}
            isConnected={isConnected}
            isDemoLoading={isDemoLoading}
            demoStep={demoStep}
            onToggleMobileSidebar={() => setIsMobileOpen(!isMobileOpen)}
          />

          {/* Page Body Viewport */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8 w-full max-w-7xl mx-auto">
            {children}
          </main>

          {/* Minimal, Quiet Footer (Anti-Slop rule: quiet copyright without fake telemetry) */}
          <footer className="border-t border-slate-800/60 py-3 px-6 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
            <span>ECOCONNECT · Team NAYASA HackLab (OPEN-X)</span>
            <span className="text-teal-400 font-mono text-[11px]">
              From Bin to Recycling: Nothing Disappears Without a Digital Trail
            </span>
          </footer>
        </div>
      </div>
    </div>
  );
};
