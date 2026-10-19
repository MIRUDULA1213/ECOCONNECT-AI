import React, { useState, useRef, useEffect } from 'react';
import { Bell, CheckCircle2, AlertTriangle, ShieldCheck, X } from 'lucide-react';
import { AuditLogEntry } from '../../types/ecoconnect.ts';

interface NotificationCenterProps {
  notifications: AuditLogEntry[];
  onSelectNotification?: (ecoTrackId: string) => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  notifications = [],
  onSelectNotification,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(notifications.length > 0 ? 2 : 0);
  const popoverRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleOpen = () => {
    setIsOpen(!isOpen);
    if (!isOpen) setUnreadCount(0);
  };

  const getEventIcon = (action: string) => {
    if (action.includes('DISCREPANCY') || action.includes('ANOMALY') || action.includes('ALERT')) {
      return <AlertTriangle className="h-4 w-4 text-[#ff5733]" />;
    }
    if (action.includes('VERIFIED') || action.includes('APPROVAL_GRANTED')) {
      return <CheckCircle2 className="h-4 w-4 text-teal-400" />;
    }
    return <ShieldCheck className="h-4 w-4 text-slate-400" />;
  };

  return (
    <div className="relative" ref={popoverRef}>
      <button
        onClick={handleOpen}
        className="relative p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-[#0c1220] transition cursor-pointer"
        title="Notifications"
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-[#ff5733] ring-2 ring-[#070b14]" />
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl bg-[#0c1220] border border-slate-800 shadow-2xl z-50 overflow-hidden">
          <div className="p-3 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Event Stream
              </span>
              <span className="text-[10px] font-mono text-teal-400">Live</span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-white text-xs"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-slate-800/60">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400">
                No recent notifications
              </div>
            ) : (
              notifications.slice(0, 8).map((item) => (
                <div
                  key={item.id}
                  onClick={() => {
                    onSelectNotification?.(item.ecoTrackId);
                    setIsOpen(false);
                  }}
                  className="p-3 hover:bg-[#11192b] transition cursor-pointer flex items-start gap-3 text-xs"
                >
                  <div className="mt-0.5 shrink-0">{getEventIcon(item.action)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-mono text-[11px] font-bold text-teal-300 truncate">
                        {item.ecoTrackId}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono shrink-0">
                        {new Date(item.timestamp).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    <p className="text-slate-300 text-xs mt-0.5 line-clamp-2">
                      {item.details}
                    </p>
                    <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-1.5">
                      <span>{item.actor}</span>
                      <span>·</span>
                      <span className="text-slate-400">{item.actorRole}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
