import React, { useState, useRef, useEffect } from 'react';
import jsQR from 'jsqr';
import {
  Scan,
  Camera,
  Upload,
  Keyboard,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  RefreshCw,
  XCircle,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { DecodedQrResult } from '../../types/ecoconnect.ts';
import { api } from '../../services/api.ts';

interface QRScannerPageProps {
  onBatchResolved: (batchId: string) => void;
  onNavigateTab: (tabId: any) => void;
  initialPayload?: string;
}

export const QRScannerPage: React.FC<QRScannerPageProps> = ({
  onBatchResolved,
  onNavigateTab,
  initialPayload,
}) => {
  const [scanMode, setScanMode] = useState<'camera' | 'upload' | 'manual'>('camera');
  const [manualInput, setManualInput] = useState(initialPayload || 'EC26-CHN-00182');
  const [cameraPermission, setCameraPermission] = useState<'prompt' | 'granted' | 'denied'>('prompt');
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<DecodedQrResult | null>(null);
  const [isDecoding, setIsDecoding] = useState(false);
  const [analysisStep, setAnalysisStep] = useState<number>(0);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Progressive analysis step labels
  const analysisSteps = [
    'Reading QR matrix...',
    'Retrieving waste record & digital custody...',
    'Analyzing load-cell & optical evidence...',
    'Synthesizing AI recyclability recommendations...',
  ];

  // Camera start / stop
  useEffect(() => {
    if (scanMode === 'camera') {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [scanMode]);

  const startCamera = async () => {
    stopCamera();
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setCameraPermission('denied');
        return;
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });
      streamRef.current = stream;
      setCameraPermission('granted');
      setIsScanning(true);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        videoRef.current.play().catch(() => {});
        requestAnimationFrame(tickScan);
      }
    } catch {
      setCameraPermission('denied');
      setIsScanning(false);
    }
  };

  const stopCamera = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsScanning(false);
  };

  const tickScan = () => {
    if (videoRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          canvas.height = videoRef.current.videoHeight;
          canvas.width = videoRef.current.videoWidth;
          ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height);

          if (code && code.data) {
            handleDecode(code.data);
            stopCamera();
            return;
          }
        }
      }
    }
    animationFrameRef.current = requestAnimationFrame(tickScan);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height);
          if (code && code.data) {
            handleDecode(code.data);
          } else {
            setScanResult({
              scanCase: 'CASE_D_INVALID',
              rawPayload: 'Uploaded Image',
              title: 'No QR Code Detected',
              explanation: 'Could not decode a valid QR matrix in the selected file.',
              timestamp: new Date().toISOString(),
            });
          }
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleDecode = async (rawPayload: string) => {
    setIsDecoding(true);
    setAnalysisStep(0);

    // Simulate animated step-by-step progress
    const timer1 = setTimeout(() => setAnalysisStep(1), 350);
    const timer2 = setTimeout(() => setAnalysisStep(2), 700);
    const timer3 = setTimeout(() => setAnalysisStep(3), 1050);

    try {
      const res = await api.decodeQr(rawPayload);
      setTimeout(() => {
        setScanResult(res);
        setIsDecoding(false);
      }, 1400);
    } catch (err: any) {
      setScanResult({
        scanCase: 'CASE_D_INVALID',
        rawPayload,
        title: 'Decoding Error',
        explanation: err.message || 'Failed to process QR code.',
        timestamp: new Date().toISOString(),
      });
      setIsDecoding(false);
    } finally {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="pb-3 border-b border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">
            Universal QR Scanner
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Read EcoTrack passports, third-party waste payloads, and verify custody.
          </p>
        </div>

        {/* Mode Toggle Buttons */}
        <div className="flex items-center gap-1 bg-[#0c1220] p-1 rounded-lg border border-slate-800">
          <button
            onClick={() => setScanMode('camera')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition cursor-pointer ${
              scanMode === 'camera'
                ? 'bg-[#11192b] text-teal-300 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Camera className="h-3.5 w-3.5" />
            <span>Live Camera</span>
          </button>
          <button
            onClick={() => setScanMode('upload')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition cursor-pointer ${
              scanMode === 'upload'
                ? 'bg-[#11192b] text-teal-300 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Upload className="h-3.5 w-3.5" />
            <span>Upload File</span>
          </button>
          <button
            onClick={() => setScanMode('manual')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition cursor-pointer ${
              scanMode === 'manual'
                ? 'bg-[#11192b] text-teal-300 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Keyboard className="h-3.5 w-3.5" />
            <span>Paste Payload</span>
          </button>
        </div>
      </div>

      {/* Main Viewport & Interactive Presets */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        {/* Left 7 Cols: Scanner Box */}
        <div className="md:col-span-7 space-y-4">
          <div className="relative rounded-2xl bg-[#070b14] border border-slate-800 overflow-hidden aspect-video sm:aspect-square flex items-center justify-center">
            {scanMode === 'camera' && (
              <>
                <video
                  ref={videoRef}
                  className="w-full h-full object-cover"
                  playsInline
                  muted
                />
                <canvas ref={canvasRef} className="hidden" />

                {/* 4 Corner Markers */}
                <div className="absolute inset-8 sm:inset-14 pointer-events-none border border-slate-700/50 rounded-xl flex flex-col justify-between p-2">
                  <div className="flex justify-between">
                    <div className="h-6 w-6 border-t-2 border-l-2 border-teal-400 rounded-tl-lg" />
                    <div className="h-6 w-6 border-t-2 border-r-2 border-teal-400 rounded-tr-lg" />
                  </div>

                  {/* Animated Vertical Scan Line */}
                  <motion.div
                    animate={{ y: ['-100%', '300%'] }}
                    transition={{ duration: 2.2, repeat: Infinity, ease: 'linear' }}
                    className="w-full h-0.5 bg-gradient-to-r from-transparent via-teal-400 to-transparent shadow-[0_0_12px_#2dd4bf]"
                  />

                  <div className="flex justify-between">
                    <div className="h-6 w-6 border-b-2 border-l-2 border-teal-400 rounded-bl-lg" />
                    <div className="h-6 w-6 border-b-2 border-r-2 border-teal-400 rounded-br-lg" />
                  </div>
                </div>

                {/* Live Camera Status Indicator */}
                <div className="absolute top-3 left-3 flex items-center gap-2 px-2.5 py-1 rounded-md bg-[#070b14]/80 backdrop-blur-sm border border-slate-800 text-[11px] text-slate-300">
                  <span className="h-2 w-2 rounded-full bg-teal-400 animate-pulse" />
                  <span>Scanning Viewfinder</span>
                </div>
              </>
            )}

            {scanMode === 'upload' && (
              <div className="p-8 text-center space-y-3">
                <Upload className="h-10 w-10 text-teal-400 mx-auto" />
                <div>
                  <label className="text-xs font-semibold text-white block">
                    Upload QR Image
                  </label>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Supports PNG, JPG, WebP from mobile or facility cameras
                  </p>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="text-xs text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border file:border-slate-700 file:text-xs file:font-semibold file:bg-[#11192b] file:text-teal-300 hover:file:bg-[#1a253d] cursor-pointer"
                />
              </div>
            )}

            {scanMode === 'manual' && (
              <div className="p-6 w-full space-y-3">
                <label className="text-xs font-semibold text-slate-300 block">
                  Paste Raw QR Payload or EcoTrack ID
                </label>
                <textarea
                  value={manualInput}
                  onChange={(e) => setManualInput(e.target.value)}
                  placeholder="Paste URL, EcoTrack ID, or JSON payload..."
                  rows={4}
                  className="w-full bg-[#0c1220] border border-slate-800 rounded-lg p-3 text-xs text-white font-mono focus:outline-none focus:border-teal-500"
                />
                <button
                  onClick={() => handleDecode(manualInput)}
                  className="w-full py-2 rounded-lg bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-slate-950 font-bold text-xs shadow-md transition cursor-pointer"
                >
                  Decode &amp; Verify
                </button>
              </div>
            )}
          </div>

          {/* Progressive AI Analysis Indicator */}
          {isDecoding && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-xl bg-[#0c1220] border border-teal-500/30 space-y-2"
            >
              <div className="flex items-center gap-2 text-xs font-semibold text-teal-300">
                <Sparkles className="h-4 w-4 animate-spin text-teal-400" />
                <span>AI Agent Decoding Pipeline</span>
              </div>
              <p className="text-xs text-slate-300 font-mono">
                {analysisSteps[analysisStep]}
              </p>
              <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-teal-400"
                  animate={{ width: `${((analysisStep + 1) / 4) * 100}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </motion.div>
          )}
        </div>

        {/* Right 5 Cols: One-Click Test Cases & Scan Result */}
        <div className="md:col-span-5 space-y-4">
          {/* Quick One-Click Test Cases */}
          <div className="rounded-xl bg-[#0c1220] border border-slate-800 p-4 space-y-2.5">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              1-Click Judge Test Presets
            </span>

            <div className="space-y-1.5">
              <button
                onClick={() => handleDecode('EC26-CHN-00182')}
                className="w-full p-2.5 rounded-lg bg-[#070b14] hover:bg-[#11192b] border border-slate-800/80 text-left text-xs transition cursor-pointer flex items-center justify-between"
              >
                <div>
                  <span className="font-bold text-teal-300 block">Case A: Official EcoTrack ID</span>
                  <span className="text-[10px] text-slate-400">EC26-CHN-00182 · PET Plastic</span>
                </div>
                <ArrowRight className="h-3.5 w-3.5 text-slate-400" />
              </button>

              <button
                onClick={() =>
                  handleDecode(
                    JSON.stringify({
                      material: 'Aluminium Cans',
                      weight: 3.2,
                      city: 'Mumbai',
                      facility: 'Bandra Smart Hub',
                    })
                  )
                }
                className="w-full p-2.5 rounded-lg bg-[#070b14] hover:bg-[#11192b] border border-slate-800/80 text-left text-xs transition cursor-pointer flex items-center justify-between"
              >
                <div>
                  <span className="font-bold text-amber-300 block">Case B: Third-Party JSON</span>
                  <span className="text-[10px] text-slate-400">Structured external waste metadata</span>
                </div>
                <ArrowRight className="h-3.5 w-3.5 text-slate-400" />
              </button>

              <button
                onClick={() => handleDecode('https://example.com/facility/manifest/9941')}
                className="w-full p-2.5 rounded-lg bg-[#070b14] hover:bg-[#11192b] border border-slate-800/80 text-left text-xs transition cursor-pointer flex items-center justify-between"
              >
                <div>
                  <span className="font-bold text-sky-300 block">Case C: External Web Link</span>
                  <span className="text-[10px] text-slate-400">External URL safe domain extraction</span>
                </div>
                <ArrowRight className="h-3.5 w-3.5 text-slate-400" />
              </button>

              <button
                onClick={() => handleDecode('corrupted_qr_matrix_unknown')}
                className="w-full p-2.5 rounded-lg bg-[#070b14] hover:bg-[#11192b] border border-slate-800/80 text-left text-xs transition cursor-pointer flex items-center justify-between"
              >
                <div>
                  <span className="font-bold text-rose-300 block">Case D: Unsupported / Invalid</span>
                  <span className="text-[10px] text-slate-400">Graceful error handling without fabrication</span>
                </div>
                <ArrowRight className="h-3.5 w-3.5 text-slate-400" />
              </button>
            </div>
          </div>

          {/* Decoded Result Presentation */}
          {scanResult && (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`rounded-xl border p-4 space-y-3 ${
                scanResult.scanCase === 'CASE_A_ECOTRACK'
                  ? 'bg-teal-950/20 border-teal-500/50'
                  : scanResult.scanCase === 'CASE_B_EXTERNAL_PAYLOAD'
                  ? 'bg-amber-950/20 border-amber-500/50'
                  : scanResult.scanCase === 'CASE_C_EXTERNAL_URL'
                  ? 'bg-sky-950/20 border-sky-500/50'
                  : 'bg-rose-950/20 border-rose-500/50'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <span className="text-xs font-bold text-white">{scanResult.title}</span>
                <span className="text-[10px] font-mono text-slate-400 shrink-0">
                  {scanResult.scanCase}
                </span>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                {scanResult.explanation}
              </p>

              {scanResult.batchId && (
                <button
                  onClick={() => {
                    onBatchResolved(scanResult.batchId!);
                    onNavigateTab('tracking');
                  }}
                  className="w-full py-2 rounded-lg bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
                >
                  <span>Open Full Waste Passport</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};
