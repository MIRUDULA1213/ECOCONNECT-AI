import React, { useState } from 'react';
import {
  QrCode,
  Download,
  Printer,
  Copy,
  CheckCircle2,
  MapPin,
  Scale,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { MaterialType, WasteCategoryType, WasteBatch } from '../../types/ecoconnect.ts';
import { api } from '../../services/api.ts';
import { downloadWastePassportPdf } from '../../utils/pdfGenerator.ts';

interface QRGeneratorPageProps {
  onBatchCreated: (batch: WasteBatch) => void;
  onNavigateTab: (tabId: any) => void;
}

export const QRGeneratorPage: React.FC<QRGeneratorPageProps> = ({
  onBatchCreated,
  onNavigateTab,
}) => {
  const [material, setMaterial] = useState<MaterialType>('PET Plastic');
  const [wasteCategory, setWasteCategory] = useState<WasteCategoryType>('Recyclable');
  const [weight, setWeight] = useState('2.40');
  const [unit, setUnit] = useState<'kg' | 'tonnes' | 'lbs'>('kg');
  const [sourceType, setSourceType] = useState<'household' | 'restaurant' | 'business' | 'institution' | 'industry'>('household');
  const [city, setCity] = useState('Chennai');
  const [address, setAddress] = useState('Besant Nagar Smart Hub #14');
  const [citizenName, setCitizenName] = useState('Priya Sundaram');
  const [citizenPhone, setCitizenPhone] = useState('+91 98401 22849');
  const [notes, setNotes] = useState('Clean beverage containers, caps detached.');

  const [isGenerating, setIsGenerating] = useState(false);
  const [createdBatch, setCreatedBatch] = useState<WasteBatch | null>(null);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    try {
      const payload = {
        material,
        wasteCategory,
        initialWeightKg: parseFloat(weight) || 1.8,
        unit,
        sourceType,
        contaminationNotes: notes,
        locationDetails: {
          city,
          address,
          state: 'Tamil Nadu',
          country: 'India',
          lat: 13.0001,
          lng: 80.2667,
        },
        citizen: {
          name: citizenName,
          phone: citizenPhone,
        },
      };

      const newBatch = await api.generateQrBatch(payload);
      setCreatedBatch(newBatch);
      onBatchCreated(newBatch);
    } catch (err: any) {
      alert(err.message || 'Failed to generate QR');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyPayload = () => {
    if (!createdBatch) return;
    navigator.clipboard.writeText(createdBatch.qrPayload || `https://ecoconnect.app/batch/${createdBatch.ecoTrackId}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="pb-3 border-b border-slate-800/80">
        <h1 className="text-xl font-bold text-white tracking-tight">
          Generate EcoTrack QR Code
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Register new recyclable waste batches and issue tamper-evident digital passports.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        {/* Left 7 Cols: Form */}
        <form onSubmit={handleGenerate} className="md:col-span-7 space-y-4">
          <div className="rounded-xl bg-[#0c1220] border border-slate-800 p-4 space-y-4 text-xs">
            <span className="font-semibold text-slate-300 block uppercase tracking-wider text-[11px]">
              Batch Specifications
            </span>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-400 block mb-1">Material</label>
                <select
                  value={material}
                  onChange={(e) => setMaterial(e.target.value as MaterialType)}
                  className="w-full bg-[#070b14] border border-slate-800 rounded-lg px-2.5 py-2 text-white focus:outline-none focus:border-teal-500"
                >
                  <option value="PET Plastic">PET Plastic</option>
                  <option value="HDPE Plastic">HDPE Plastic</option>
                  <option value="Aluminium Cans">Aluminium Cans</option>
                  <option value="Cardboard / Paper">Cardboard / Paper</option>
                  <option value="E-Waste">E-Waste</option>
                  <option value="Glass">Glass</option>
                </select>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Waste Category</label>
                <select
                  value={wasteCategory}
                  onChange={(e) => setWasteCategory(e.target.value as WasteCategoryType)}
                  className="w-full bg-[#070b14] border border-slate-800 rounded-lg px-2.5 py-2 text-white focus:outline-none focus:border-teal-500"
                >
                  <option value="Recyclable">Recyclable</option>
                  <option value="Electronic Waste">Electronic Waste</option>
                  <option value="Biodegradable">Biodegradable</option>
                  <option value="Hazardous">Hazardous</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2">
                <label className="text-slate-400 block mb-1">Weight</label>
                <input
                  type="number"
                  step="0.01"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  className="w-full bg-[#070b14] border border-slate-800 rounded-lg px-2.5 py-2 text-white font-mono focus:outline-none focus:border-teal-500"
                  required
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Unit</label>
                <select
                  value={unit}
                  onChange={(e) => setUnit(e.target.value as any)}
                  className="w-full bg-[#070b14] border border-slate-800 rounded-lg px-2 py-2 text-white focus:outline-none focus:border-teal-500"
                >
                  <option value="kg">kg</option>
                  <option value="tonnes">tonnes</option>
                  <option value="lbs">lbs</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-400 block mb-1">Source Type</label>
                <select
                  value={sourceType}
                  onChange={(e) => setSourceType(e.target.value as any)}
                  className="w-full bg-[#070b14] border border-slate-800 rounded-lg px-2.5 py-2 text-white focus:outline-none focus:border-teal-500"
                >
                  <option value="household">Household</option>
                  <option value="restaurant">Restaurant</option>
                  <option value="business">Commercial Business</option>
                  <option value="institution">Institution / Campus</option>
                  <option value="industry">Industrial Site</option>
                </select>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">City</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full bg-[#070b14] border border-slate-800 rounded-lg px-2.5 py-2 text-white focus:outline-none focus:border-teal-500"
                />
              </div>
            </div>

            <div>
              <label className="text-slate-400 block mb-1">Location / Hub Name</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full bg-[#070b14] border border-slate-800 rounded-lg px-2.5 py-2 text-white focus:outline-none focus:border-teal-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-400 block mb-1">Depositor Name</label>
                <input
                  type="text"
                  value={citizenName}
                  onChange={(e) => setCitizenName(e.target.value)}
                  className="w-full bg-[#070b14] border border-slate-800 rounded-lg px-2.5 py-2 text-white focus:outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Phone Number</label>
                <input
                  type="text"
                  value={citizenPhone}
                  onChange={(e) => setCitizenPhone(e.target.value)}
                  className="w-full bg-[#070b14] border border-slate-800 rounded-lg px-2.5 py-2 text-white font-mono focus:outline-none focus:border-teal-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isGenerating}
              className="w-full py-2.5 rounded-lg bg-gradient-to-r from-[#ff5733] to-[#f97316] hover:from-[#f94d27] hover:to-[#ea580c] text-white font-bold text-xs shadow-md transition cursor-pointer disabled:opacity-50"
            >
              {isGenerating ? 'Generating EcoTrack Passport...' : 'Create & Generate QR Code'}
            </button>
          </div>
        </form>

        {/* Right 5 Cols: Live QR Preview Card */}
        <div className="md:col-span-5 space-y-4">
          <div className="rounded-xl bg-[#0c1220] border border-slate-800 p-6 text-center space-y-4">
            <span className="font-semibold text-slate-300 block uppercase tracking-wider text-[11px]">
              Passport QR Preview
            </span>

            {createdBatch?.qrDataUrl ? (
              <div className="space-y-3">
                <img
                  src={createdBatch.qrDataUrl}
                  alt={createdBatch.ecoTrackId}
                  className="h-44 w-44 mx-auto rounded-lg bg-white p-2 shadow-md"
                />
                <div>
                  <span className="font-mono font-bold text-sm text-teal-300 block">
                    {createdBatch.ecoTrackId}
                  </span>
                  <span className="text-xs text-slate-400">
                    {createdBatch.material} · {createdBatch.initialWeightKg} kg
                  </span>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                  <button
                    onClick={() => downloadWastePassportPdf(createdBatch)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 text-xs font-bold border border-teal-500/40 transition cursor-pointer"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>Download PDF Certificate</span>
                  </button>

                  <a
                    href={createdBatch.qrDataUrl}
                    download={`ECOTRACK-${createdBatch.ecoTrackId}.png`}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#11192b] hover:bg-[#1a253d] text-slate-300 text-xs font-semibold border border-slate-700/80 transition"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>PNG</span>
                  </a>

                  <button
                    onClick={handleCopyPayload}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#11192b] hover:bg-[#1a253d] text-slate-300 text-xs font-semibold border border-slate-700/80 transition cursor-pointer"
                  >
                    <Copy className="h-3.5 w-3.5" />
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>

                <button
                  onClick={() => onNavigateTab('tracking')}
                  className="w-full py-2 rounded-lg bg-teal-500/10 hover:bg-teal-500/20 text-teal-300 border border-teal-500/30 text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer"
                >
                  <span>Open in Waste Tracker</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <div className="p-8 border border-dashed border-slate-800 rounded-lg text-slate-500 text-xs space-y-2">
                <QrCode className="h-12 w-12 mx-auto text-slate-600" />
                <p>Fill out the batch specs to generate the tamper-evident QR code.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
