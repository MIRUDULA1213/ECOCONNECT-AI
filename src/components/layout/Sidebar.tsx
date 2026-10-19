import {
  LayoutDashboard,
  Scan,
  QrCode,
  ShieldCheck,
  Sparkles,
  CheckCircle2,
  FileText,
  Settings,
  ChevronLeft,
  ChevronRight,
  Flame,
  Dna,
} from 'lucide-react';
import { motion } from 'motion/react';

export type NavTabId =
  | 'overview'
  | 'scan_qr'
  | 'generate_qr'
  | 'tracking'
  | 'ai_intelligence'
  | 'bioscience'
  | 'approvals'
  | 'reports'
  | 'settings';

interface SidebarProps {
  activeTab: NavTabId;
  setActiveTab: (tab: NavTabId) => void;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  pendingApprovalsCount: number;
  openIncidentsCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  isCollapsed,
  setIsCollapsed,
  pendingApprovalsCount,
  openIncidentsCount,
}) => {
  const navItems = [
    { id: 'overview' as NavTabId, label: 'Overview', icon: LayoutDashboard },
    { id: 'scan_qr' as NavTabId, label: 'Scan QR', icon: Scan },
    { id: 'generate_qr' as NavTabId, label: 'Generate QR', icon: QrCode },
    { id: 'tracking' as NavTabId, label: 'Track Waste', icon: ShieldCheck },
    {
      id: 'ai_intelligence' as NavTabId,
      label: 'AI Intelligence',
      icon: Sparkles,
      badge: openIncidentsCount > 0 ? `${openIncidentsCount}` : undefined,
      badgeColor: 'bg-[#ff5733]',
    },
    {
      id: 'bioscience' as NavTabId,
      label: 'BioScience',
      icon: Dna,
    },
    {
      id: 'approvals' as NavTabId,
      label: 'Approvals',
      icon: CheckCircle2,
      badge: pendingApprovalsCount > 0 ? `${pendingApprovalsCount}` : undefined,
      badgeColor: 'bg-amber-500',
    },
    { id: 'reports' as NavTabId, label: 'Reports', icon: FileText },
    { id: 'settings' as NavTabId, label: 'Settings', icon: Settings },
  ];

  return (
    <aside
      className={`relative border-r border-slate-800/80 bg-[#070b14] flex flex-col justify-between transition-all duration-300 z-30 shrink-0 ${
        isCollapsed ? 'w-16' : 'w-60'
      }`}
    >
      {/* Brand Header */}
      <div>
        <div className="h-16 flex items-center px-4 border-b border-slate-800/80">
          <button
            onClick={() => setActiveTab('overview')}
            className="flex items-center gap-3 w-full text-left overflow-hidden focus:outline-none cursor-pointer"
          >
            <div className="h-9 w-9 shrink-0 rounded-lg bg-gradient-to-tr from-[#ff5733] to-[#f97316] flex items-center justify-center shadow-lg shadow-[#ff5733]/20">
              <Flame className="h-5 w-5 text-slate-950 font-black" />
            </div>

            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="truncate"
              >
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm tracking-tight text-white">ECOCONNECT</span>
                </div>
                <p className="text-[10px] text-teal-400 font-medium truncate">NAYASA HackLab · OPEN-X</p>
              </motion.div>
            )}
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="p-2 space-y-1 mt-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                title={isCollapsed ? item.label : undefined}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all group relative cursor-pointer ${
                  isActive
                    ? 'bg-[#11192b] text-white shadow-sm border border-slate-700/60'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-[#0c1220]'
                }`}
              >
                <Icon
                  className={`h-4 w-4 shrink-0 transition-colors ${
                    isActive ? 'text-[#ff5733]' : 'text-slate-400 group-hover:text-slate-300'
                  }`}
                />

                {!isCollapsed && (
                  <span className="truncate flex-1 text-left">{item.label}</span>
                )}

                {item.badge && (
                  <span
                    className={`h-4 min-w-[16px] px-1 rounded-full text-[10px] font-mono font-bold text-white flex items-center justify-center ${
                      item.badgeColor || 'bg-slate-700'
                    } ${isCollapsed ? 'absolute top-1 right-1' : ''}`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Collapse Toggle Footer */}
      <div className="p-3 border-t border-slate-800/80">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="w-full flex items-center justify-center gap-2 py-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-[#0c1220] text-xs transition cursor-pointer"
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <>
              <ChevronLeft className="h-4 w-4" />
              <span className="text-[11px] font-medium">Collapse menu</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
};
