import React, { useState } from 'react';
import { X, PlusCircle, Scale, Sparkles, User, MapPin } from 'lucide-react';
import { MaterialType } from '../types/ecoconnect.ts';

interface NewBatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    material: MaterialType;
    initialWeightKg: number;
    citizenName: string;
    citizenPhone: string;
    stationName: string;
  }) => Promise<void>;
  isLoading: boolean;
}

export const NewBatchModal: React.FC<NewBatchModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
}) => {
  const [material, setMaterial] = useState<MaterialType>('PET Plastic');
  const [weight, setWeight] = useState('1.80');
  const [citizenName, setCitizenName] = useState('Ananya Iyer');
  const [citizenPhone, setCitizenPhone] = useState('+91 98402 11920');
  const [stationName, setStationName] = useState('Adyar EcoHub #03, Chennai');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({
      material,
      initialWeightKg: parseFloat(weight) || 1.8,
      citizenName,
      citizenPhone,
      stationName,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="rounded-xl bg-slate-900 border border-slate-800 w-full max-w-lg p-6 shadow-2xl relative space-y-5">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-slate-400 hover:text-white"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
            <PlusCircle className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Ingest New Waste Batch</h3>
            <p className="text-xs text-slate-400">
              Simulates household deposit at a smart station with calibrated load-cell reading &amp; edge AI classification.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="text-slate-300 font-semibold block mb-1">Material Stream:</label>
            <select
              value={material}
              onChange={(e) => setMaterial(e.target.value as MaterialType)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500 font-sans"
            >
              <option value="PET Plastic">PET Plastic (Bottles &amp; Thermoforms)</option>
              <option value="HDPE Plastic">HDPE Plastic (Rigid Containers)</option>
              <option value="Aluminium Cans">Aluminium Cans</option>
              <option value="Cardboard / Paper">Cardboard / Paper Packaging</option>
              <option value="E-Waste">E-Waste (Small Electronics)</option>
              <option value="Glass">Glass Containers</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-slate-300 font-semibold block mb-1">
                Calibrated Weight (kg):
              </label>
              <input
                type="number"
                step="0.05"
                min="0.1"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="text-slate-300 font-semibold block mb-1">
                Smart Station Hub:
              </label>
              <input
                type="text"
                value={stationName}
                onChange={(e) => setStationName(e.target.value)}
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-slate-300 font-semibold block mb-1">Citizen Depositor:</label>
              <input
                type="text"
                value={citizenName}
                onChange={(e) => setCitizenName(e.target.value)}
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="text-slate-300 font-semibold block mb-1">Citizen Contact:</label>
              <input
                type="text"
                value={citizenPhone}
                onChange={(e) => setCitizenPhone(e.target.value)}
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="p-3 rounded-lg bg-emerald-950/20 border border-emerald-800/40 text-[11px] text-emerald-300 flex items-start gap-2">
            <Sparkles className="h-4 w-4 shrink-0 text-emerald-400 mt-0.5" />
            <span>
              Ingestion will trigger autonomous optical classification, affix a cryptographic EcoTrack ID, and award 10 Green Credits per kg to the citizen.
            </span>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-5 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition disabled:opacity-50 shadow-md shadow-emerald-500/20 cursor-pointer"
            >
              {isLoading ? 'Ingesting...' : 'Ingest & AFFIX EcoTrack ID'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
