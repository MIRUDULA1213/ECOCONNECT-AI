import React, { useState } from 'react';
import {
  Radio,
  Wifi,
  WifiOff,
  Battery,
  Scale,
  Camera,
  RefreshCw,
  Clock,
  CheckCircle2,
  AlertCircle,
  Database,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

interface IotHubViewProps {
  onSimulateOffline: () => Promise<void>;
  onSyncOffline: () => Promise<void>;
  offlineCount: number;
  isLoading: boolean;
  onNavigateTab: (tabId: string) => void;
}

export const IotHubView: React.FC<IotHubViewProps> = ({
  onSimulateOffline,
  onSyncOffline,
  offlineCount,
  isLoading,
  onNavigateTab,
}) => {
  const [activeCamPurity, setActiveCamPurity] = useState(98.4);
  const [selectedSensor, setSelectedSensor] = useState('ESP32-SCALE-BN14');

  const sensors = [
    {
      id: 'ESP32-SCALE-BN14',
      name: 'Besant Nagar Smart Hub #14',
      type: 'ESP32 HX711 Load Cell + ESP32-CAM',
      status: 'ONLINE',
      currentWeight: '1.80 kg',
      battery: 94,
      rssi: '-62 dBm (WiFi)',
      location: 'Besant Nagar, Chennai',
      samplingRate: '10 Hz',
      lastPing: 'Just now',
    },
    {
      id: 'WEIGHBRIDGE-GD02',
      name: 'Guindy MRF Intake Weighbridge',
      type: 'Mettler Toledo Industrial Load Cell',
      status: 'ONLINE',
      currentWeight: '1.62 kg',
      battery: 100,
      rssi: 'LAN 1 Gbps',
      location: 'Industrial Estate, Guindy',
      samplingRate: '50 Hz',
      lastPing: '3 mins ago',
    },
    {
      id: 'SCALE-METTLER-REC01',
      name: 'GreenLoop Maraimalai Nagar Intake',
      type: 'Heavy Duty Bulk Hopper Scale',
      status: 'ONLINE',
      currentWeight: '1.48 kg',
      battery: 100,
      rssi: 'Industrial Ethernet',
      location: 'SIPCOT Industrial Park',
      samplingRate: '20 Hz',
      lastPing: '1 min ago',
    },
    {
      id: 'ZEBRA-OFFLINE-TC21',
      name: 'Collector Handheld Terminal (Murugan)',
      type: 'Android 2D QR Imager + BLE Scale Reader',
      status: offlineCount > 0 ? 'OFFLINE_BUFFERING' : 'IDLE_SYNCED',
      currentWeight: '1.80 kg',
      battery: 78,
      rssi: offlineCount > 0 ? 'No Signal (Dead Zone)' : '-74 dBm (4G LTE)',
      location: 'En route Guindy MRF',
      samplingRate: 'Event-driven',
      lastPing: offlineCount > 0 ? 'Queued in EEPROM' : 'Synchronized',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="rounded-xl bg-slate-900 border border-slate-800 p-5 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shrink-0">
            <Radio className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white tracking-wide">
                IoT Edge Sensors &amp; Offline-First Telemetry Hub
              </h2>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                4 Active Field Nodes
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl">
              Real-time hardware simulation: Calibrated load cells, ESP32-CAM edge optical inference, battery metrics, and offline queue reconciliation for cellular dead zones.
            </p>
          </div>
        </div>

        {/* Offline Buffer Badge & Actions */}
        <div className="flex items-center gap-2">
          {offlineCount > 0 && (
            <span className="text-xs font-mono font-bold px-3 py-1.5 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1.5 animate-pulse">
              <WifiOff className="h-3.5 w-3.5" />
              <span>{offlineCount} Event(s) Buffered Offline</span>
            </span>
          )}
          <button
            onClick={onSyncOffline}
            disabled={isLoading || offlineCount === 0}
            className="px-3.5 py-1.5 rounded-lg bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer disabled:opacity-40"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Reconcile Ledger</span>
          </button>
        </div>
      </div>

      {/* Grid: Live Sensors & Offline Simulator */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Sensor Nodes List */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            Connected Edge Weighing &amp; Scanning Hardware
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {sensors.map((sensor) => {
              const isSelected = selectedSensor === sensor.id;
              const isOffline = sensor.status === 'OFFLINE_BUFFERING';

              return (
                <div
                  key={sensor.id}
                  onClick={() => setSelectedSensor(sensor.id)}
                  className={`p-4 rounded-xl border transition cursor-pointer space-y-3 ${
                    isSelected
                      ? 'bg-slate-900 border-emerald-500/50 shadow-md shadow-emerald-500/10'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="font-bold text-white text-xs block">{sensor.name}</span>
                      <span className="font-mono text-[10px] text-slate-400">{sensor.id}</span>
                    </div>
                    <span
                      className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded flex items-center gap-1 ${
                        isOffline
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      }`}
                    >
                      {isOffline ? <WifiOff className="h-2.5 w-2.5" /> : <Wifi className="h-2.5 w-2.5" />}
                      {sensor.status}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800/80 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400">Calibrated Weight:</span>
                    <span className="font-mono text-sm font-black text-emerald-400">
                      {sensor.currentWeight}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-400 pt-1 border-t border-slate-800/60">
                    <div className="flex items-center gap-1">
                      <Battery className="h-3 w-3 text-emerald-400" />
                      <span>{sensor.battery}% Battery</span>
                    </div>
                    <div className="text-right truncate font-mono text-[10px] text-slate-500">
                      {sensor.rssi}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Interactive Offline Simulation Control */}
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <WifiOff className="h-4 w-4 text-amber-400" />
                <h4 className="text-xs font-bold text-white">Offline Resilience Simulator</h4>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                EEPROM Buffer Active
              </span>
            </div>
            <p className="text-xs text-slate-400">
              In real city operations, drivers lose cellular connectivity in basements and transport corridors. Test ECOCONNECT&apos;s offline-first architecture by simulating a local scan without network access, then reconciling it later without corrupting historical timestamps.
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              <button
                onClick={onSimulateOffline}
                disabled={isLoading}
                className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-semibold border border-amber-500/30 transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <WifiOff className="h-3.5 w-3.5" />
                <span>Simulate Offline Collector Pickup Scan</span>
              </button>

              <button
                onClick={onSyncOffline}
                disabled={isLoading || offlineCount === 0}
                className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer disabled:opacity-40"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                <span>Reconcile Offline Events ({offlineCount} Pending)</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Col: ESP32-CAM Optical Classifier Live View */}
        <div className="rounded-xl bg-slate-900 border border-slate-800 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Camera className="h-4 w-4 text-emerald-400" />
              <h3 className="text-sm font-bold text-white">ESP32-CAM Optical Feed</h3>
            </div>
            <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
              30 FPS Edge
            </span>
          </div>

          {/* Camera Frame Simulation */}
          <div className="relative rounded-xl overflow-hidden bg-slate-950 border border-slate-800 aspect-video flex items-center justify-center">
            {/* Visual Grid Reticle */}
            <div className="absolute inset-4 border border-dashed border-emerald-500/40 rounded flex flex-col justify-between p-2">
              <div className="flex justify-between text-[10px] font-mono text-emerald-400">
                <span>[POL_REC_OK]</span>
                <span>ROI: 640x480</span>
              </div>
              <div className="self-center text-center">
                <span className="font-mono text-xs font-black text-emerald-400 tracking-wider bg-slate-950/80 px-2 py-1 rounded border border-emerald-500/30">
                  POLYMER: PET (TYPE-1)
                </span>
                <span className="block text-[10px] text-slate-300 font-mono mt-1">
                  Confidence: {activeCamPurity}%
                </span>
              </div>
              <div className="flex justify-between text-[9px] font-mono text-slate-400">
                <span>Contamination: 1.2%</span>
                <span>Lens: OV2640</span>
              </div>
            </div>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between text-slate-400">
              <span>Edge Model:</span>
              <span className="font-mono font-semibold text-white">MobileNetV3-WasteNet</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Inference Latency:</span>
              <span className="font-mono font-semibold text-emerald-400">42 ms</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Cap / Label Separation:</span>
              <span className="font-mono font-semibold text-white">Recommended at MRF</span>
            </div>
          </div>

          <button
            onClick={() => onNavigateTab('tracking')}
            className="w-full py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition flex items-center justify-center gap-1.5"
          >
            <span>View Ingested Batches</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
