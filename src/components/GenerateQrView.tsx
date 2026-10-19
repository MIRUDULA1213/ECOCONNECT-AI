import React, { useState } from 'react';
import QRCode from 'qrcode';
import {
  QrCode,
  Download,
  Printer,
  Sparkles,
  MapPin,
  Scale,
  Calendar,
  Building,
  CheckCircle2,
  ExternalLink,
  Scan,
  Compass,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';
import { MaterialType, WasteCategoryType } from '../types/ecoconnect.ts';
import { WordDef } from '../utils/publicDefinitions.tsx';

interface GenerateQrViewProps {
  onBatchCreated: (batch: any) => void;
  onNavigateTab: (tabId: string) => void;
  onTestScanPayload: (payload: string) => void;
}

export const GenerateQrView: React.FC<GenerateQrViewProps> = ({
  onBatchCreated,
  onNavigateTab,
  onTestScanPayload,
}) => {
  // Waste Information
  const [material, setMaterial] = useState<MaterialType>('PET Plastic');
  const [wasteCategory, setWasteCategory] = useState<WasteCategoryType>('Recyclable');
  const [weight, setWeight] = useState('2.40');
  const [unit, setUnit] = useState<'kg' | 'tonnes' | 'lbs'>('kg');
  const [quantity, setQuantity] = useState('12');
  const [sourceType, setSourceType] = useState<'household' | 'restaurant' | 'business' | 'institution' | 'industry'>('household');
  const [contaminationStatus, setContaminationStatus] = useState('Clean');
  const [contaminationNotes, setContaminationNotes] = useState('Clean rinsed beverage bottles; minimal cap residue.');
  const [collectionDateTime, setCollectionDateTime] = useState(new Date().toISOString().slice(0, 16));

  // Location Information
  const [country, setCountry] = useState('India');
  const [state, setState] = useState('Tamil Nadu');
  const [city, setCity] = useState('Chennai');
  const [area, setArea] = useState('Adyar / Besant Nagar');
  const [address, setAddress] = useState('Station #04, 2nd Cross Road, Besant Nagar');
  const [lat, setLat] = useState('13.0012');
  const [lng, setLng] = useState('80.2565');
  const [facilityName, setFacilityName] = useState('Adyar EcoHub Drop-Point #04');

  // Collection Information
  const [collectorName, setCollectorName] = useState('Urbaser Sumeet City Logistics');
  const [collectionMethod, setCollectionMethod] = useState('Smart Station Automated Hopper');
  const [sortingCentre, setSortingCentre] = useState('Guindy Material Recovery Facility (MRF-CHN-GD02)');
  const [destinationRecycler, setDestinationRecycler] = useState('GreenLoop Polymer Recyclers (REC-CHN-GL01)');
  const [notes, setNotes] = useState('Presorted clean PET stream with low moisture.');

  // Citizen Depositor
  const [citizenName, setCitizenName] = useState('Arvind Swaminathan');
  const [citizenPhone, setCitizenPhone] = useState('+91 98403 99120');

  // Output State
  const [generatedBatch, setGeneratedBatch] = useState<any | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);

  // Auto GPS coordinates request
  const handleGetLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLat(pos.coords.latitude.toFixed(4));
          setLng(pos.coords.longitude.toFixed(4));
        },
        () => {
          // If denied, keep defaults
        }
      );
    }
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsGenerating(true);
      const payload = {
        material,
        wasteCategory,
        initialWeightKg: parseFloat(weight) || 1.8,
        unit,
        quantityItems: parseInt(quantity, 10) || 1,
        sourceType,
        contaminationNotes: `${contaminationStatus}: ${contaminationNotes}`,
        locationDetails: {
          country,
          state,
          city,
          area,
          address: `${facilityName}, ${address}, ${city}`,
          lat: parseFloat(lat) || 13.0,
          lng: parseFloat(lng) || 80.2,
        },
        collectionInfo: {
          collectorName,
          collectionMethod,
          sortingCentreDetails: sortingCentre,
          destinationRecycler,
          notes,
        },
        citizen: {
          name: citizenName,
          phone: citizenPhone,
        },
      };

      const res = await fetch('/api/batches/generate-qr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const batch = await res.json();
      if (!res.ok) throw new Error(batch.error || 'Failed to generate QR');

      setGeneratedBatch(batch);
      setQrDataUrl(batch.qrDataUrl);
      onBatchCreated(batch);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadQr = () => {
    if (!qrDataUrl || !generatedBatch) return;
    const a = document.createElement('a');
    a.href = qrDataUrl;
    a.download = `ECOTRACK-${generatedBatch.ecoTrackId}-QR.png`;
    a.click();
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-xl bg-gradient-to-r from-[#0c1220] via-[#0f172a] to-[#141d30] border-2 border-slate-800 p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-black text-white tracking-wide">
              Generate QR • Dynamic Digital Waste Passport
            </h2>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#ff5733]/20 text-[#ff6f59] border border-[#ff5733]/40 font-bold uppercase">
              Section 03 · Registration
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Register a recyclable waste batch, trigger dynamic edge AI analysis, and generate a tamper-evident scannable EcoTrack QR code.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigateTab('scan_qr')}
            className="px-3.5 py-2 rounded-lg bg-[#11192b] hover:bg-[#1a253d] text-teal-300 text-xs font-bold border border-teal-500/40 transition flex items-center gap-1.5 cursor-pointer"
          >
            <Scan className="h-4 w-4" />
            <span>Open QR Scanner</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 7 Cols: Detailed Form */}
        <form onSubmit={handleGenerate} className="lg:col-span-7 space-y-6">
          {/* Section A: Waste Information */}
          <div className="rounded-xl bg-[#0f172a] border border-slate-800 p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Scale className="h-4 w-4 text-teal-400" />
                <span>1. Waste Information</span>
              </h3>
              <span className="text-[10px] font-mono text-slate-400">Substance &amp; Mass</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="text-slate-300 font-semibold block mb-1">
                  <WordDef term="Material" />
                </label>
                <select
                  value={material}
                  onChange={(e) => setMaterial(e.target.value as MaterialType)}
                  className="w-full bg-[#070b14] border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-teal-500"
                >
                  <option value="PET Plastic">PET Plastic (Type 1 Bottles &amp; Jars)</option>
                  <option value="HDPE Plastic">HDPE Plastic (Type 2 Rigid Containers)</option>
                  <option value="Aluminium Cans">Aluminium Cans (UBC Alloy)</option>
                  <option value="Cardboard / Paper">Cardboard / Paper Packaging</option>
                  <option value="E-Waste">E-Waste (Consumer Electronics)</option>
                  <option value="Glass">Glass Containers (Cullet)</option>
                  <option value="Biodegradable Food">Biodegradable Food Waste</option>
                  <option value="Custom / Other">Custom / Mixed Stream</option>
                </select>
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">
                  <WordDef term="Waste Type" />
                </label>
                <select
                  value={wasteCategory}
                  onChange={(e) => setWasteCategory(e.target.value as WasteCategoryType)}
                  className="w-full bg-[#070b14] border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-teal-500"
                >
                  <option value="Recyclable">Recyclable (Dry Solid)</option>
                  <option value="Biodegradable">Biodegradable (Organic Compostable)</option>
                  <option value="Hazardous">Hazardous (Requires Scrubbing)</option>
                  <option value="Electronic Waste">Electronic Waste (WEEE)</option>
                  <option value="Other">Other / Non-hazardous Mixed</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 text-xs">
              <div>
                <label className="text-slate-300 font-semibold block mb-1">
                  <WordDef term="Weight" />
                </label>
                <input
                  type="number"
                  step="0.05"
                  min="0.05"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  required
                  className="w-full bg-[#070b14] border border-slate-800 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Unit:</label>
                <select
                  value={unit}
                  onChange={(e) => setUnit(e.target.value as any)}
                  className="w-full bg-[#070b14] border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-teal-500 font-mono"
                >
                  <option value="kg">kg (Kilograms)</option>
                  <option value="tonnes">tonnes (Metric)</option>
                  <option value="lbs">lbs (Pounds)</option>
                </select>
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Quantity/Items:</label>
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="w-full bg-[#070b14] border border-slate-800 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-teal-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="text-slate-300 font-semibold block mb-1">
                  <WordDef term="Provenance" /> (Source Type):
                </label>
                <select
                  value={sourceType}
                  onChange={(e) => setSourceType(e.target.value as any)}
                  className="w-full bg-[#070b14] border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-teal-500"
                >
                  <option value="household">Household (Residential)</option>
                  <option value="restaurant">Restaurant / Hospitality</option>
                  <option value="business">Business / Commercial Office</option>
                  <option value="institution">Institution / University</option>
                  <option value="industry">Industry / Factory Scrap</option>
                </select>
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">
                  <WordDef term="Contamination" /> Status:
                </label>
                <select
                  value={contaminationStatus}
                  onChange={(e) => setContaminationStatus(e.target.value)}
                  className="w-full bg-[#070b14] border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-teal-500"
                >
                  <option value="Clean">Clean (Uncontaminated)</option>
                  <option value="Minor Residue">Minor Moisture / Cap Residue</option>
                  <option value="Moderate Dirt">Moderate Dust / Tape Adhesives</option>
                  <option value="Severe Grease">Severe Oil / Grease Contamination</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-slate-300 font-semibold block mb-1">Contamination Inspection Notes:</label>
              <input
                type="text"
                value={contaminationNotes}
                onChange={(e) => setContaminationNotes(e.target.value)}
                placeholder="e.g. Clean beverage bottles; minimal moisture."
                className="w-full bg-[#070b14] border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-teal-500"
              />
            </div>
          </div>

          {/* Section B: Location Information */}
          <div className="rounded-xl bg-[#0f172a] border border-slate-800 p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <MapPin className="h-4 w-4 text-teal-400" />
                <span>2. Location Information</span>
              </h3>
              <button
                type="button"
                onClick={handleGetLocation}
                className="text-[11px] font-semibold text-teal-400 hover:text-teal-300 flex items-center gap-1 cursor-pointer"
              >
                <Compass className="h-3.5 w-3.5" />
                <span>Auto-Detect GPS</span>
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">City:</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full bg-[#070b14] border border-slate-800 rounded-lg px-3 py-2 text-white"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Area / Ward:</label>
                <input
                  type="text"
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  className="w-full bg-[#070b14] border border-slate-800 rounded-lg px-3 py-2 text-white"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Latitude:</label>
                <input
                  type="text"
                  value={lat}
                  onChange={(e) => setLat(e.target.value)}
                  className="w-full bg-[#070b14] border border-slate-800 rounded-lg px-3 py-2 text-white font-mono"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Longitude:</label>
                <input
                  type="text"
                  value={lng}
                  onChange={(e) => setLng(e.target.value)}
                  className="w-full bg-[#070b14] border border-slate-800 rounded-lg px-3 py-2 text-white font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Facility / Station Hub Name:</label>
                <input
                  type="text"
                  value={facilityName}
                  onChange={(e) => setFacilityName(e.target.value)}
                  className="w-full bg-[#070b14] border border-slate-800 rounded-lg px-3 py-2 text-white"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Collection Address Description:</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full bg-[#070b14] border border-slate-800 rounded-lg px-3 py-2 text-white"
                />
              </div>
            </div>
          </div>

          {/* Section C: Collection Information */}
          <div className="rounded-xl bg-[#0f172a] border border-slate-800 p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Building className="h-4 w-4 text-teal-400" />
                <span>3. Collection &amp; Logistics Path</span>
              </h3>
              <span className="text-[10px] font-mono text-slate-400">Custody Route</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Collector / Logistics Organization:</label>
                <input
                  type="text"
                  value={collectorName}
                  onChange={(e) => setCollectorName(e.target.value)}
                  className="w-full bg-[#070b14] border border-slate-800 rounded-lg px-3 py-2 text-white"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Collection Method:</label>
                <input
                  type="text"
                  value={collectionMethod}
                  onChange={(e) => setCollectionMethod(e.target.value)}
                  className="w-full bg-[#070b14] border border-slate-800 rounded-lg px-3 py-2 text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Intermediary Sorting Facility (MRF):</label>
                <input
                  type="text"
                  value={sortingCentre}
                  onChange={(e) => setSortingCentre(e.target.value)}
                  className="w-full bg-[#070b14] border border-slate-800 rounded-lg px-3 py-2 text-white"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Destination Recycler Processor:</label>
                <input
                  type="text"
                  value={destinationRecycler}
                  onChange={(e) => setDestinationRecycler(e.target.value)}
                  className="w-full bg-[#070b14] border border-slate-800 rounded-lg px-3 py-2 text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1 border-t border-slate-800/80">
              <div>
                <label className="text-slate-400 block mb-1">Citizen Depositor Name:</label>
                <input
                  type="text"
                  value={citizenName}
                  onChange={(e) => setCitizenName(e.target.value)}
                  className="w-full bg-[#070b14] border border-slate-800 rounded-lg px-3 py-2 text-white"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Citizen Contact (SMS/WhatsApp Alert):</label>
                <input
                  type="text"
                  value={citizenPhone}
                  onChange={(e) => setCitizenPhone(e.target.value)}
                  className="w-full bg-[#070b14] border border-slate-800 rounded-lg px-3 py-2 text-white font-mono"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isGenerating}
            className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-[#ff5733] to-[#f97316] hover:from-[#f94d27] hover:to-[#ea580c] text-white text-xs font-black tracking-wide shadow-xl shadow-[#ff5733]/25 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <QrCode className="h-4 w-4" />
            <span>{isGenerating ? 'Synthesizing Passport & QR...' : 'GENERATE OFFICIAL ECOTRACK QR'}</span>
          </button>
        </form>

        {/* Right 5 Cols: Live QR Code Output Canvas & Actions */}
        <div className="lg:col-span-5 space-y-4">
          <div className="rounded-xl bg-[#0f172a] border border-slate-800 p-6 shadow-xl space-y-5 flex flex-col items-center text-center">
            <div className="w-full flex items-center justify-between pb-3 border-b border-slate-800">
              <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <QrCode className="h-4 w-4 text-teal-400" />
                <span>Generated Digital Passport</span>
              </span>
              <span className="text-[10px] font-mono text-teal-400 font-bold">
                {generatedBatch ? 'LIVE & REGISTERED' : 'Awaiting Submission'}
              </span>
            </div>

            {/* QR Card Preview */}
            <div className="p-5 rounded-2xl bg-white shadow-2xl flex flex-col items-center max-w-[280px] w-full">
              {qrDataUrl ? (
                <img
                  src={qrDataUrl}
                  alt="EcoTrack QR Code"
                  className="w-full aspect-square object-contain rounded"
                />
              ) : (
                <div className="w-full aspect-square bg-slate-100 border-2 border-dashed border-slate-300 rounded flex flex-col items-center justify-center p-4 text-slate-400 space-y-2">
                  <QrCode className="h-12 w-12 text-slate-300" />
                  <p className="text-[11px] font-sans">Fill form &amp; click Generate to view live QR</p>
                </div>
              )}

              <div className="pt-2 text-center w-full">
                <span className="font-mono text-xs font-black text-slate-900 block truncate">
                  {generatedBatch ? generatedBatch.ecoTrackId : 'EC26-CHN-XXXXX'}
                </span>
                <span className="text-[10px] font-sans font-semibold text-slate-600 block mt-0.5">
                  {generatedBatch ? `${generatedBatch.material} • ${generatedBatch.initialWeightKg} kg` : `${material} • ${weight} kg`}
                </span>
              </div>
            </div>

            {/* Quick Actions */}
            {generatedBatch && (
              <div className="w-full space-y-3 pt-2">
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={handleDownloadQr}
                    className="p-2.5 rounded-lg bg-[#11192b] hover:bg-[#1a253d] text-teal-300 font-bold border border-teal-500/30 transition flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>Download PNG</span>
                  </button>

                  <button
                    type="button"
                    onClick={handlePrint}
                    className="p-2.5 rounded-lg bg-[#11192b] hover:bg-[#1a253d] text-slate-300 font-bold border border-slate-700 transition flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Printer className="h-3.5 w-3.5 text-slate-400" />
                    <span>Print Label</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => onTestScanPayload(generatedBatch.qrPayload)}
                    className="p-2.5 rounded-lg bg-[#ff5733]/15 hover:bg-[#ff5733]/25 text-[#ff6f59] font-bold border border-[#ff5733]/40 transition flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Scan className="h-3.5 w-3.5" />
                    <span>Test-Scan In-App</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onNavigateTab('tracking')}
                    className="p-2.5 rounded-lg bg-teal-500 hover:bg-teal-400 text-slate-950 font-black transition flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-teal-500/20"
                  >
                    <span>Open Passport</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>

                {/* AI Assessment Sneak Peek */}
                {generatedBatch.aiAssessment && (
                  <div className="p-3.5 rounded-xl bg-[#070b14] border border-slate-800 text-left text-xs space-y-1.5 mt-2">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-teal-400 font-bold flex items-center gap-1">
                        <Sparkles className="h-3 w-3" /> Dynamic AI Prediction
                      </span>
                      <span className="font-mono text-slate-400">
                        {generatedBatch.aiAssessment.predictionConfidence}% Certainty
                      </span>
                    </div>
                    <p className="text-white font-semibold text-xs">
                      {generatedBatch.aiAssessment.predictedMaterialClass}
                    </p>
                    <p className="text-[11px] text-slate-400">
                      {generatedBatch.aiAssessment.sortingRecommendation}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
