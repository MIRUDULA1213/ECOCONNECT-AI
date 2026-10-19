import React, { useState, useEffect } from 'react';
import {
  Settings,
  Radio,
  Wifi,
  WifiOff,
  Battery,
  Scale,
  RefreshCw,
  Play,
  RotateCcw,
  CheckCircle2,
  Database,
  ExternalLink,
} from 'lucide-react';
import { api } from '../../services/api.ts';

interface SettingsPageProps {
  onRunDemo: () => void;
  onResetDemo: () => void;
  isDemoLoading?: boolean;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({
  onRunDemo,
  onResetDemo,
  isDemoLoading = false,
}) => {
  const [telemetry, setTelemetry] = useState<any>(null);
  const [isSimulatingOffline, setIsSimulatingOffline] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');

  const loadTelemetry = async () => {
    try {
      const data = await api.getIotTelemetry();
      setTelemetry(data);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    loadTelemetry();
  }, []);

  const handleSimulateOffline = async () => {
    setIsSimulatingOffline(true);
    try {
      const res = await api.simulateOfflineScan('EC26-CHN-00182');
      setStatusMsg(`Buffered offline scan event. ${res.queued} events in local EEPROM.`);
      await loadTelemetry();
    } finally {
      setIsSimulatingOffline(false);
    }
  };

  const handleSyncOffline = async () => {
    setIsSyncing(true);
    try {
      const res = await api.syncOfflineEvents();
      setStatusMsg(res.message);
      await loadTelemetry();
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="pb-3 border-b border-slate-800/80">
        <h1 className="text-xl font-bold text-white tracking-tight">
          System Settings &amp; IoT Edge Telemetry
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Configure edge hardware nodes, offline buffer reconciliation, and demonstration controls.
        </p>
      </div>

      {/* Demo Controls Section */}
      <div className="rounded-xl bg-[#0c1220] border border-slate-800 p-5 space-y-4">
        <div>
          <h3 className="text-sm font-bold text-white">Demonstration &amp; Testing Controls</h3>
          <p className="text-xs text-slate-400">
            Execute the complete autonomous scenario or reset system states for live judge demonstrations.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-1">
          <button
            onClick={onRunDemo}
            disabled={isDemoLoading}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-[#ff5733] to-[#f97316] hover:from-[#f94d27] hover:to-[#ea580c] text-white font-bold text-xs shadow-md transition cursor-pointer disabled:opacity-50"
          >
            <Play className="h-3.5 w-3.5 fill-current" />
            <span>Run Autonomous Demo Scenario</span>
          </button>

          <button
            onClick={onResetDemo}
            disabled={isDemoLoading}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#11192b] hover:bg-[#1a253d] text-slate-300 font-semibold text-xs border border-slate-700 transition cursor-pointer disabled:opacity-50"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reset Demo to Step 0</span>
          </button>
        </div>
      </div>

      {/* IoT Edge Hardware & Sensors */}
      <div className="rounded-xl bg-[#0c1220] border border-slate-800 p-5 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-sm font-bold text-white">Edge Sensor Nodes (Active Telemetry)</h3>
            <p className="text-xs text-slate-400">
              Live heartbeat and load cell battery/signal levels
            </p>
          </div>
          <button
            onClick={loadTelemetry}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            title="Refresh Telemetry"
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {(telemetry?.scales || [
            {
              deviceId: 'ESP32-SCALE-BN14',
              name: 'Besant Nagar Smart Hub Load Cell',
              status: 'ONLINE',
              battery: 94,
              rssi: '-62 dBm',
              currentWeightKg: 1.80,
            },
            {
              deviceId: 'WEIGHBRIDGE-GD02',
              name: 'Guindy MRF Inbound Weighbridge',
              status: 'ONLINE',
              battery: 100,
              rssi: 'LAN 1Gbps',
              currentWeightKg: 1.62,
            },
            {
              deviceId: 'SCALE-METTLER-REC01',
              name: 'GreenLoop Maraimalai Nagar Intake',
              status: 'ONLINE',
              battery: 100,
              rssi: 'LAN 1Gbps',
              currentWeightKg: 1.48,
            },
          ]).map((node: any) => (
            <div
              key={node.deviceId}
              className="p-3.5 rounded-lg bg-[#070b14] border border-slate-800 space-y-2 text-xs"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-[11px] font-bold text-teal-300">
                  {node.deviceId}
                </span>
                <span className="h-2 w-2 rounded-full bg-teal-400" />
              </div>

              <span className="text-white font-medium block text-xs">{node.name}</span>

              <div className="flex items-center justify-between text-slate-400 text-[11px] pt-1 border-t border-slate-800/60 font-mono">
                <span>Reading: {node.currentWeightKg} kg</span>
                <span>{node.battery}% Bat</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Offline Buffer & Network Resilience */}
      <div className="rounded-xl bg-[#0c1220] border border-slate-800 p-5 space-y-4">
        <div>
          <h3 className="text-sm font-bold text-white">Offline Edge Resilience &amp; EEPROM Buffer</h3>
          <p className="text-xs text-slate-400">
            Simulate cellular dead-zones during transit. Events are cached locally and reconciled with the central ledger when connectivity returns.
          </p>
        </div>

        {statusMsg && (
          <div className="p-3 rounded-lg bg-teal-950/30 border border-teal-500/40 text-xs text-teal-200">
            {statusMsg}
          </div>
        )}

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleSimulateOffline}
            disabled={isSimulatingOffline}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#11192b] hover:bg-[#1a253d] text-amber-300 text-xs font-semibold border border-amber-500/40 transition cursor-pointer disabled:opacity-50"
          >
            <WifiOff className="h-3.5 w-3.5" />
            <span>Simulate Dead-Zone Pickup (Buffer Offline)</span>
          </button>

          <button
            onClick={handleSyncOffline}
            disabled={isSyncing}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#11192b] hover:bg-[#1a253d] text-teal-300 text-xs font-semibold border border-teal-500/40 transition cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>Sync &amp; Reconcile EEPROM Buffer</span>
          </button>
        </div>
      </div>
    </div>
  );
};
