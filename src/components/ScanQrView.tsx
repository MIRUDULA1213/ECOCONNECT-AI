import React, { useState, useRef, useEffect } from 'react';
import jsQR from 'jsqr';
import {
  Scan,
  Camera,
  Upload,
  Keyboard,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  RefreshCw,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  HelpCircle,
  FileText,
  XCircle,
} from 'lucide-react';
import { DecodedQrResult } from '../types/ecoconnect.ts';
import { WordDef } from '../utils/publicDefinitions.tsx';

interface ScanQrViewProps {
  onBatchResolved: (batchId: string) => void;
  onNavigateTab: (tabId: string) => void;
  initialScannedPayload?: string;
}

export const ScanQrView: React.FC<ScanQrViewProps> = ({
  onBatchResolved,
  onNavigateTab,
  initialScannedPayload,
}) => {
  const [scanMode, setScanMode] = useState<'camera' | 'upload' | 'manual'>('camera');
  const [manualInput, setManualInput] = useState(initialScannedPayload || 'EC26-CHN-00182');
  const [cameraPermission, setCameraPermission] = useState<'prompt' | 'granted' | 'denied'>('prompt');
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<DecodedQrResult | null>(null);
  const [isDecoding, setIsDecoding] = useState(false);
  const [availableCameras, setAvailableCameras] = useState<MediaDeviceInfo[]>([]);
  const [selectedCameraId, setSelectedCameraId] = useState<string>('');

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // If initial payload passed from "Test-Scan In-App"
  useEffect(() => {
    if (initialScannedPayload) {
      setManualInput(initialScannedPayload);
      handleDecodePayload(initialScannedPayload);
    }
  }, [initialScannedPayload]);

  // Enumerate cameras
  useEffect(() => {
    if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
      navigator.mediaDevices.enumerateDevices().then((devices) => {
        const videoDevices = devices.filter((d) => d.kind === 'videoinput');
        setAvailableCameras(videoDevices);
        if (videoDevices.length > 0 && !selectedCameraId) {
          setSelectedCameraId(videoDevices[0].deviceId);
        }
      });
    }
  }, []);

  // Camera stream lifecycle
  useEffect(() => {
    if (scanMode === 'camera') {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [scanMode, selectedCameraId]);

  const startCamera = async () => {
    stopCamera();
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setCameraPermission('denied');
        return;
      }

      const constraints: MediaStreamConstraints = {
        video: selectedCameraId
          ? { deviceId: { exact: selectedCameraId } }
          : { facingMode: 'environment' },
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      setCameraPermission('granted');
      setIsScanning(true);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        videoRef.current.play();
        requestAnimationFrame(tickScan);
      }
    } catch (err) {
      console.warn('Camera access denied or unavailable:', err);
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

  // Live frame processing with jsQR
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
          const code = jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: 'dontInvert',
          });

          if (code && code.data) {
            handleDecodePayload(code.data);
            stopCamera();
            return;
          }
        }
      }
    }
    animationFrameRef.current = requestAnimationFrame(tickScan);
  };

  // Image Upload Scan
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
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
            handleDecodePayload(code.data);
          } else {
            setScanResult({
              scanCase: 'CASE_D_INVALID',
              rawPayload: 'Uploaded Image',
              title: 'No QR Code Detected in Image',
              explanation: 'Could not locate or decode a valid QR matrix in the uploaded image. Please ensure the code is well-lit and unobstructed.',
              timestamp: new Date().toISOString(),
            });
          }
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // Universal backend decoder
  const handleDecodePayload = async (rawPayload: string) => {
    try {
      setIsDecoding(true);
      const res = await fetch('/api/qr/decode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rawPayload }),
      });
      const data: DecodedQrResult = await res.json();
      setScanResult(data);
    } catch (err: any) {
      setScanResult({
        scanCase: 'CASE_D_INVALID',
        rawPayload,
        title: 'Decoding Error',
        explanation: err.message,
        timestamp: new Date().toISOString(),
      });
    } finally {
      setIsDecoding(false);
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualInput.trim()) {
      handleDecodePayload(manualInput.trim());
    }
  };

  const handleOpenBatch = () => {
    if (scanResult?.batchId) {
      onBatchResolved(scanResult.batchId);
      onNavigateTab('tracking');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-xl bg-gradient-to-r from-[#0c1220] via-[#0f172a] to-[#141d30] border-2 border-slate-800 p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-black text-white tracking-wide">
              Scan QR • Universal Digital Waste Passport Reader
            </h2>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-teal-500/15 text-teal-300 border border-teal-500/30 font-bold uppercase">
              Cases A, B, C, D
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Supports live camera streaming, image uploads, and manual payload resolution. Distinguishes EcoTrack passports from external payloads without fabricating data.
          </p>
        </div>

        {/* Scan Mode Toggle */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#070b14] border border-slate-800 text-xs">
          <button
            onClick={() => setScanMode('camera')}
            className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition cursor-pointer ${
              scanMode === 'camera'
                ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Camera className="h-3.5 w-3.5" />
            <span>Camera</span>
          </button>

          <button
            onClick={() => setScanMode('upload')}
            className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition cursor-pointer ${
              scanMode === 'upload'
                ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Upload className="h-3.5 w-3.5" />
            <span>Image</span>
          </button>

          <button
            onClick={() => setScanMode('manual')}
            className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition cursor-pointer ${
              scanMode === 'manual'
                ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Keyboard className="h-3.5 w-3.5" />
            <span>Manual ID</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 6 Cols: Scanner Feed / Input */}
        <div className="lg:col-span-6 rounded-xl bg-[#0f172a] border border-slate-800 p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Scan className="h-4 w-4 text-teal-400" />
              <span>Input Scanner Terminal</span>
            </h3>
            {scanMode === 'camera' && availableCameras.length > 1 && (
              <select
                value={selectedCameraId}
                onChange={(e) => setSelectedCameraId(e.target.value)}
                className="bg-[#070b14] border border-slate-800 rounded px-2 py-1 text-[11px] text-slate-300 focus:outline-none"
              >
                {availableCameras.map((cam, i) => (
                  <option key={cam.deviceId || i} value={cam.deviceId}>
                    {cam.label || `Camera ${i + 1}`}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Mode 1: Camera Scanner */}
          {scanMode === 'camera' && (
            <div className="space-y-3">
              <div className="relative rounded-2xl overflow-hidden bg-slate-950 aspect-video border border-slate-800 flex items-center justify-center">
                <video
                  ref={videoRef}
                  className="w-full h-full object-cover"
                />
                <canvas ref={canvasRef} className="hidden" />

                {/* Reticle Overlay */}
                <div className="absolute inset-8 border-2 border-dashed border-teal-400/60 rounded-xl pointer-events-none flex flex-col justify-between p-3 animate-pulse">
                  <div className="flex justify-between text-[10px] font-mono text-teal-300 font-bold">
                    <span>[SCANNER_ACTIVE]</span>
                    <span>1080p</span>
                  </div>
                  <div className="self-center text-center">
                    <span className="text-[11px] text-slate-300 bg-slate-950/80 px-2 py-1 rounded">
                      Align QR Code within frame
                    </span>
                  </div>
                  <div className="flex justify-between text-[9px] font-mono text-slate-500">
                    <span>jsQR Optical Decoder</span>
                    <span>Continuous 30fps</span>
                  </div>
                </div>

                {cameraPermission === 'denied' && (
                  <div className="absolute inset-0 bg-slate-950/95 flex flex-col items-center justify-center p-6 text-center space-y-3">
                    <Camera className="h-10 w-10 text-amber-400" />
                    <div>
                      <span className="font-bold text-white text-xs block">Camera Permission Denied or Unavailable</span>
                      <p className="text-[11px] text-slate-400 mt-1 max-w-xs">
                        Allow camera access in your browser settings, or switch to <strong>Image Upload</strong> or <strong>Manual ID</strong>.
                      </p>
                    </div>
                    <button
                      onClick={() => setScanMode('manual')}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-teal-300 text-xs font-semibold"
                    >
                      Use Manual Input Instead
                    </button>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Hold any printed or screen QR code up to your camera.</span>
                <button
                  type="button"
                  onClick={startCamera}
                  className="text-teal-400 hover:text-teal-300 flex items-center gap-1 font-semibold"
                >
                  <RefreshCw className="h-3 w-3" /> Re-trigger Camera
                </button>
              </div>
            </div>
          )}

          {/* Mode 2: Image File Upload */}
          {scanMode === 'upload' && (
            <div className="space-y-3">
              <label className="rounded-2xl border-2 border-dashed border-slate-700 hover:border-teal-500 bg-[#070b14] p-8 flex flex-col items-center justify-center text-center cursor-pointer transition space-y-3">
                <Upload className="h-10 w-10 text-teal-400" />
                <div>
                  <span className="text-xs font-bold text-white block">Upload QR Code Image</span>
                  <span className="text-[11px] text-slate-400 block mt-0.5">
                    Select a PNG, JPG, or WEBP image containing an EcoTrack QR
                  </span>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
              <p className="text-[11px] text-slate-500 text-center">
                Images are analyzed directly on client canvas with zero external uploads.
              </p>
            </div>
          )}

          {/* Mode 3: Manual Input */}
          {scanMode === 'manual' && (
            <form onSubmit={handleManualSubmit} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Enter EcoTrack ID, URL, or JSON Payload:
                </label>
                <textarea
                  rows={4}
                  value={manualInput}
                  onChange={(e) => setManualInput(e.target.value)}
                  placeholder="e.g. EC26-CHN-00182 or https://ecoconnect.app/batch/EC26-CHN-00182"
                  className="w-full bg-[#070b14] border border-slate-800 rounded-lg p-3 text-xs text-white font-mono focus:outline-none focus:border-teal-500"
                />
              </div>

              {/* Sample Shortcuts */}
              <div className="flex items-center gap-2 flex-wrap text-xs">
                <span className="text-slate-500 text-[11px]">Quick IDs:</span>
                {['EC26-CHN-00182', 'EC26-BLR-00419', 'EC26-MUM-00912', 'EC26-DEL-00045'].map((id) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => {
                      setManualInput(id);
                      handleDecodePayload(id);
                    }}
                    className="font-mono text-[11px] px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-teal-400 border border-slate-700"
                  >
                    {id}
                  </button>
                ))}
              </div>

              <button
                type="submit"
                disabled={isDecoding}
                className="w-full py-2.5 rounded-lg bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs font-black transition flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-teal-500/20"
              >
                <span>{isDecoding ? 'Decoding Payload...' : 'Decode & Resolve Record'}</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </form>
          )}
        </div>

        {/* Right 6 Cols: Universal Decoder Results (Cases A, B, C, D) */}
        <div className="lg:col-span-6 rounded-xl bg-[#0f172a] border border-slate-800 p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Decoding Resolution Output
            </h3>
            {scanResult && (
              <span
                className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                  scanResult.scanCase === 'CASE_A_ECOTRACK'
                    ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30'
                    : scanResult.scanCase === 'CASE_B_EXTERNAL_PAYLOAD'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                    : scanResult.scanCase === 'CASE_C_EXTERNAL_URL'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                }`}
              >
                {scanResult.scanCase.replace('_', ' ')}
              </span>
            )}
          </div>

          {!scanResult ? (
            <div className="h-64 rounded-xl bg-[#070b14] border border-slate-800/80 flex flex-col items-center justify-center text-center p-6 space-y-2 text-slate-500">
              <Scan className="h-10 w-10 text-slate-600 animate-pulse" />
              <p className="text-xs text-slate-400 font-semibold">Awaiting Scanned QR Code</p>
              <p className="text-[11px] text-slate-600 max-w-xs">
                Scan or paste a QR code to resolve the digital chain-of-custody passport and live AI predictions.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Case A: Official EcoTrack Record */}
              {scanResult.scanCase === 'CASE_A_ECOTRACK' && scanResult.batch && (
                <div className="p-4 rounded-xl bg-teal-950/20 border border-teal-800/60 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="h-5 w-5 text-teal-400" />
                      <div>
                        <span className="font-mono text-sm font-black text-white block">
                          {scanResult.batch.ecoTrackId}
                        </span>
                        <span className="text-[11px] text-teal-300 font-semibold">
                          Official Verified ECOCONNECT Passport
                        </span>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-teal-500 text-slate-950 font-black">
                      FOUND IN DB
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-teal-800/40">
                    <WordDef term="Material" value={scanResult.batch.material} />
                    <WordDef term="Weight" value={`${scanResult.batch.initialWeightKg} ${scanResult.batch.unit || 'kg'}`} />
                    <WordDef term="Provenance" value={scanResult.batch.citizen.neighborhood} />
                    <WordDef term="Verification" value={scanResult.batch.status} highlightValue />
                  </div>

                  {scanResult.batch.aiAssessment && (
                    <div className="p-2.5 rounded-lg bg-[#070b14] border border-teal-800/40 text-xs space-y-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-teal-400 font-bold flex items-center gap-1">
                          <Sparkles className="h-3 w-3" /> <WordDef term="AI Prediction" />
                        </span>
                        <span className="text-slate-400 font-mono">
                          {scanResult.batch.aiAssessment.predictionConfidence}% <WordDef term="Confidence" />
                        </span>
                      </div>
                      <p className="text-white font-semibold text-xs">
                        {scanResult.batch.aiAssessment.predictedMaterialClass}
                      </p>
                      <p className="text-[11px] text-slate-400">
                        {scanResult.batch.aiAssessment.sortingRecommendation}
                      </p>
                    </div>
                  )}

                  <button
                    onClick={handleOpenBatch}
                    className="w-full py-2.5 rounded-lg bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs font-black transition flex items-center justify-center gap-1.5 cursor-pointer shadow-lg shadow-teal-500/25"
                  >
                    <span>OPEN COMPLETE BATCH PASSPORT</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              )}

              {/* Case B: Supported External Data Payload */}
              {scanResult.scanCase === 'CASE_B_EXTERNAL_PAYLOAD' && (
                <div className="p-4 rounded-xl bg-cyan-950/20 border border-cyan-800/60 space-y-3 text-xs">
                  <div className="flex items-center gap-2 text-cyan-300 font-bold">
                    <CheckCircle2 className="h-5 w-5 text-cyan-400" />
                    <span>External Waste Data Schema Recognized</span>
                  </div>
                  <p className="text-slate-300 text-[11px] leading-relaxed">
                    {scanResult.explanation}
                  </p>
                  <pre className="p-2.5 rounded bg-[#070b14] border border-slate-800 font-mono text-[11px] text-cyan-300 overflow-x-auto">
                    {JSON.stringify(scanResult.externalData, null, 2)}
                  </pre>
                  <button
                    onClick={() => onNavigateTab('generate_qr')}
                    className="w-full py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs transition"
                  >
                    Import as Certified EcoTrack Batch
                  </button>
                </div>
              )}

              {/* Case C: External URL */}
              {scanResult.scanCase === 'CASE_C_EXTERNAL_URL' && (
                <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-800/60 space-y-3 text-xs">
                  <div className="flex items-center gap-2 text-amber-300 font-bold">
                    <ExternalLink className="h-5 w-5 text-amber-400" />
                    <span>External Web Link Detected</span>
                  </div>
                  <p className="text-slate-300 text-[11px] leading-relaxed">
                    {scanResult.explanation}
                  </p>
                  <div className="p-2.5 rounded bg-[#070b14] border border-slate-800 font-mono text-xs text-amber-300 truncate">
                    {scanResult.externalUrl}
                  </div>
                  <p className="text-[10px] text-slate-500">
                    ECOCONNECT will never auto-execute or trust claims from arbitrary third-party URLs.
                  </p>
                </div>
              )}

              {/* Case D: Unsupported / Invalid QR */}
              {scanResult.scanCase === 'CASE_D_INVALID' && (
                <div className="p-4 rounded-xl bg-rose-950/20 border border-rose-800/60 space-y-3 text-xs">
                  <div className="flex items-center gap-2 text-rose-300 font-bold">
                    <XCircle className="h-5 w-5 text-rose-400" />
                    <span>{scanResult.title}</span>
                  </div>
                  <p className="text-slate-300 text-[11px] leading-relaxed">
                    {scanResult.explanation}
                  </p>
                  <p className="text-[10px] text-slate-500 font-mono">
                    System Policy: Never fabricate records for unknown QR codes.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
