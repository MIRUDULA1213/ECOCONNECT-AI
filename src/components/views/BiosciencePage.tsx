import React, { useState, useEffect } from 'react';
import {
  Dna,
  Atom,
  FlaskConical,
  BookOpen,
  Search,
  ExternalLink,
  Scale,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  RefreshCw,
  Clock,
  Layers,
} from 'lucide-react';
import { MolecularViewer3D } from '../science/MolecularViewer3D.tsx';
import {
  bioscienceApi,
  PRESET_ENZYMES,
  PRESET_COMPOUNDS,
  EnzymeStructure,
  PubChemCompound,
  SciencePaper,
} from '../../services/bioscienceApi.ts';
import { WasteBatch } from '../../types/ecoconnect.ts';

interface BiosciencePageProps {
  batch: WasteBatch | null;
  onNavigateTab: (tabId: any) => void;
}

export const BiosciencePage: React.FC<BiosciencePageProps> = ({ batch, onNavigateTab }) => {
  const [activeSubTab, setActiveSubTab] = useState<'enzymes' | 'chemistry' | 'kinetics' | 'literature'>('enzymes');

  // Enzyme 3D Viewer State
  const [selectedEnzyme, setSelectedEnzyme] = useState<EnzymeStructure>(PRESET_ENZYMES[0]);

  // PubChem State
  const [compounds, setCompounds] = useState<PubChemCompound[]>(PRESET_COMPOUNDS);
  const [searchCompoundQuery, setSearchCompoundQuery] = useState('');
  const [isSearchingCompound, setIsSearchingCompound] = useState(false);
  const [compoundSearchError, setCompoundSearchError] = useState<string | null>(null);

  // Bioremediation Kinetics State
  const [batchWeight, setBatchWeight] = useState<number>(batch?.currentWeightKg || 1.8);
  const [selectedEnzymeType, setSelectedEnzymeType] = useState<'fast-petase' | 'wt-petase' | 'lcc'>('fast-petase');
  const [reactionTemp, setReactionTemp] = useState<number>(50);

  // Literature Search State
  const [literatureQuery, setLiteratureQuery] = useState('PETase plastic recycling Ideonella');
  const [papers, setPapers] = useState<SciencePaper[]>([]);
  const [isLoadingPapers, setIsLoadingPapers] = useState(false);

  // Load initial literature
  useEffect(() => {
    handleSearchLiterature('PETase plastic recycling Ideonella');
  }, []);

  const handleSearchLiterature = async (queryText: string) => {
    if (!queryText.trim()) return;
    setIsLoadingPapers(true);
    try {
      const results = await bioscienceApi.searchScientificLiterature(queryText.trim());
      setPapers(results);
    } finally {
      setIsLoadingPapers(false);
    }
  };

  const handlePubChemSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchCompoundQuery.trim()) return;
    setIsSearchingCompound(true);
    setCompoundSearchError(null);
    try {
      const res = await bioscienceApi.fetchPubChemCompound(searchCompoundQuery.trim());
      if (res) {
        setCompounds((prev) => [res, ...prev.filter((c) => c.cid !== res.cid)]);
        setSearchCompoundQuery('');
      } else {
        setCompoundSearchError(`No compound found in PubChem for "${searchCompoundQuery}"`);
      }
    } catch {
      setCompoundSearchError('Failed to query PubChem database');
    } finally {
      setIsSearchingCompound(false);
    }
  };

  // Kinetic Calculations
  const calculatedKinetics = React.useMemo(() => {
    // PET molar mass unit ~ 192.17 g/mol, TPA molar mass ~ 166.13 g/mol, Ethylene glycol ~ 62.07 g/mol
    // Stoichiometric theoretical yield of TPA from PET = 166.13 / 192.17 = 86.45%
    const theoreticalTpaYieldKg = Number((batchWeight * 0.8645).toFixed(2));
    const theoreticalEgYieldKg = Number((batchWeight * (62.07 / 192.17)).toFixed(2));

    let hoursTo90Pct = 12;
    let enzymeDosageGrams = 1.8;
    let carbonSavingsKg = Number((batchWeight * 2.15).toFixed(2)); // ~2.15 kg CO2e saved per kg virgin PET avoided

    if (selectedEnzymeType === 'fast-petase') {
      hoursTo90Pct = Math.max(6, Number((14 * (batchWeight / 2) * (50 / reactionTemp)).toFixed(1)));
      enzymeDosageGrams = Number((batchWeight * 0.5).toFixed(2));
    } else if (selectedEnzymeType === 'wt-petase') {
      hoursTo90Pct = Math.max(72, Number((96 * (batchWeight / 2)).toFixed(1)));
      enzymeDosageGrams = Number((batchWeight * 2.5).toFixed(2));
    } else if (selectedEnzymeType === 'lcc') {
      hoursTo90Pct = Math.max(8, Number((10 * (batchWeight / 2) * (70 / reactionTemp)).toFixed(1)));
      enzymeDosageGrams = Number((batchWeight * 0.8).toFixed(2));
    }

    return {
      tpaYieldKg: theoreticalTpaYieldKg,
      egYieldKg: theoreticalEgYieldKg,
      hours: hoursTo90Pct,
      enzymeGrams: enzymeDosageGrams,
      carbonSaved: carbonSavingsKg,
      bufferVolumeLiters: Number((batchWeight * 10).toFixed(1)),
    };
  }, [batchWeight, selectedEnzymeType, reactionTemp]);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2">
            <Dna className="h-5 w-5 text-teal-400" />
            <h1 className="text-xl font-bold text-white tracking-tight">
              BioScience &amp; Enzymatic Recycling
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Macromolecular 3D structures, PubChem polymer chemistry, biocatalytic kinetics, and peer-reviewed literature.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center bg-[#0c1220] p-1 rounded-lg border border-slate-800 text-xs">
          <button
            onClick={() => setActiveSubTab('enzymes')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition cursor-pointer ${
              activeSubTab === 'enzymes'
                ? 'bg-[#11192b] text-teal-300 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Atom className="h-3.5 w-3.5" />
            <span>3D Macromolecules</span>
          </button>
          <button
            onClick={() => setActiveSubTab('chemistry')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition cursor-pointer ${
              activeSubTab === 'chemistry'
                ? 'bg-[#11192b] text-teal-300 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <FlaskConical className="h-3.5 w-3.5" />
            <span>PubChem Chemistry</span>
          </button>
          <button
            onClick={() => setActiveSubTab('kinetics')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition cursor-pointer ${
              activeSubTab === 'kinetics'
                ? 'bg-[#11192b] text-teal-300 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Scale className="h-3.5 w-3.5" />
            <span>Biocatalytic Kinetics</span>
          </button>
          <button
            onClick={() => setActiveSubTab('literature')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition cursor-pointer ${
              activeSubTab === 'literature'
                ? 'bg-[#11192b] text-teal-300 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <BookOpen className="h-3.5 w-3.5" />
            <span>Literature ({papers.length})</span>
          </button>
        </div>
      </div>

      {/* 1. Enzyme 3D Macromolecular Structure Viewer */}
      {activeSubTab === 'enzymes' && (
        <div className="space-y-6">
          {/* Enzyme Selector Pills */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Select Enzyme Structure:
            </span>
            {PRESET_ENZYMES.map((enz) => (
              <button
                key={enz.id}
                onClick={() => setSelectedEnzyme(enz)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  selectedEnzyme.id === enz.id
                    ? 'bg-teal-500/20 text-teal-300 border border-teal-500/50 shadow-sm'
                    : 'bg-[#0c1220] text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                {enz.name} ({enz.pdbId})
              </button>
            ))}
          </div>

          {/* Interactive 3Dmol.js Viewer */}
          <MolecularViewer3D enzyme={selectedEnzyme} />

          {/* Biochemical Context Card */}
          <div className="rounded-xl bg-[#0c1220] border border-slate-800 p-5 space-y-3 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="font-bold text-white text-sm">
                Enzyme Mechanism &amp; Catalysis Pathway
              </span>
              <span className="text-teal-400 font-mono text-[11px]">
                EC 3.1.1.101 (PET hydrolase)
              </span>
            </div>
            <p className="text-slate-300 leading-relaxed">{selectedEnzyme.description}</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-[11px]">
              <div className="p-2.5 rounded bg-[#070b14] border border-slate-800">
                <span className="text-slate-400 block font-semibold">Catalytic Triad Residues</span>
                <span className="font-mono text-[#ff5733] font-bold">
                  {selectedEnzyme.catalyticResidues.join(', ')}
                </span>
              </div>
              <div className="p-2.5 rounded bg-[#070b14] border border-slate-800">
                <span className="text-slate-400 block font-semibold">Cleavage Target</span>
                <span className="font-mono text-teal-300 font-bold">
                  Ester bonds in Polyethylene Terephthalate
                </span>
              </div>
              <div className="p-2.5 rounded bg-[#070b14] border border-slate-800">
                <span className="text-slate-400 block font-semibold">Substrate Products</span>
                <span className="font-mono text-white font-bold">
                  MHET + BHET → Terephthalic Acid
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. PubChem Chemical & Polymer Intelligence */}
      {activeSubTab === 'chemistry' && (
        <div className="space-y-6">
          {/* PubChem Search Bar */}
          <div className="rounded-xl bg-[#0c1220] border border-slate-800 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white">
                  Live National Center for Biotechnology Information (PubChem) Explorer
                </h3>
                <p className="text-xs text-slate-400">
                  Query verified chemical structures, SMILES, and hazard classifications via PubChem PUG REST.
                </p>
              </div>
              <span className="text-[10px] font-mono text-teal-400 bg-teal-500/10 px-2 py-0.5 rounded border border-teal-500/30">
                CORS PUG REST Live
              </span>
            </div>

            <form onSubmit={handlePubChemSearch} className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search compound name (e.g. Polyethylene, Phthalate, Terephthalic acid, Bisphenol A)..."
                  value={searchCompoundQuery}
                  onChange={(e) => setSearchCompoundQuery(e.target.value)}
                  className="w-full bg-[#070b14] border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
                />
              </div>
              <button
                type="submit"
                disabled={isSearchingCompound}
                className="px-4 py-2 rounded-lg bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs transition cursor-pointer disabled:opacity-50"
              >
                {isSearchingCompound ? 'Querying...' : 'Fetch PubChem'}
              </button>
            </form>

            {compoundSearchError && (
              <p className="text-xs text-[#ff5733] font-mono">{compoundSearchError}</p>
            )}
          </div>

          {/* Compounds Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {compounds.map((cmp) => (
              <div
                key={cmp.cid}
                className="rounded-xl bg-[#0c1220] border border-slate-800 p-5 space-y-4 hover:border-slate-700 transition"
              >
                <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-800">
                  <div>
                    <span className="font-mono text-[10px] text-teal-400 font-bold">
                      PubChem CID: {cmp.cid}
                    </span>
                    <h4 className="text-sm font-bold text-white mt-0.5">{cmp.title}</h4>
                    {cmp.iupacName && (
                      <span className="text-[10px] text-slate-400 block font-mono mt-0.5 truncate max-w-xs">
                        {cmp.iupacName}
                      </span>
                    )}
                  </div>

                  <a
                    href={`https://pubchem.ncbi.nlm.nih.gov/compound/${cmp.cid}`}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1 rounded bg-[#070b14] border border-slate-800 text-slate-400 hover:text-white text-xs flex items-center gap-1"
                    title="Open in PubChem"
                  >
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4">
                  {/* 2D Structure PNG from PubChem */}
                  <div className="w-28 h-28 bg-white p-2 rounded-lg border border-slate-700 flex items-center justify-center shrink-0">
                    <img
                      src={cmp.pngUrl}
                      alt={cmp.title}
                      className="max-h-full max-w-full object-contain"
                      loading="lazy"
                    />
                  </div>

                  {/* Properties Table */}
                  <div className="space-y-1.5 text-xs flex-1 w-full">
                    <div className="flex justify-between py-0.5 border-b border-slate-800/40">
                      <span className="text-slate-400">Formula:</span>
                      <span className="font-mono text-teal-300 font-bold">{cmp.molecularFormula}</span>
                    </div>
                    <div className="flex justify-between py-0.5 border-b border-slate-800/40">
                      <span className="text-slate-400">Molecular Weight:</span>
                      <span className="font-mono text-white">{cmp.molecularWeight}</span>
                    </div>
                    {cmp.xlogp !== undefined && (
                      <div className="flex justify-between py-0.5 border-b border-slate-800/40">
                        <span className="text-slate-400">XLogP (Hydrophobicity):</span>
                        <span className="font-mono text-slate-200">{cmp.xlogp}</span>
                      </div>
                    )}
                    {cmp.tpsa !== undefined && (
                      <div className="flex justify-between py-0.5 border-b border-slate-800/40">
                        <span className="text-slate-400">Polar Surface Area:</span>
                        <span className="font-mono text-slate-200">{cmp.tpsa} Å²</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Canonical SMILES Box */}
                <div className="p-2.5 rounded bg-[#070b14] border border-slate-800 font-mono text-[10px] text-slate-300 break-all">
                  <span className="text-slate-500 block text-[9px] uppercase">Canonical SMILES</span>
                  {cmp.smiles}
                </div>

                {/* Recycling Context & Hazards */}
                <div className="space-y-1.5 text-[11px]">
                  <p className="text-slate-300 leading-snug">
                    <span className="text-teal-400 font-semibold">Circularity Role:</span>{' '}
                    {cmp.roleInRecycling}
                  </p>
                  {cmp.ghsHazardSummary && (
                    <p className="text-amber-300/90 leading-snug">
                      <span className="font-semibold text-amber-400">GHS Hazard Notes:</span>{' '}
                      {cmp.ghsHazardSummary}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. Bioremediation Kinetics & Monomer Yield Calculator */}
      {activeSubTab === 'kinetics' && (
        <div className="rounded-xl bg-[#0c1220] border border-slate-800 p-6 space-y-6">
          <div className="pb-4 border-b border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-white">
                Bioremediation &amp; Monomer Recovery Kinetics Simulator
              </h3>
              <p className="text-xs text-slate-400">
                Model enzymatic depolymerization reaction volume, required biocatalyst mass, and circular monomer output.
              </p>
            </div>
            {batch && (
              <span className="text-xs font-mono text-teal-300 bg-teal-500/10 px-2.5 py-1 rounded border border-teal-500/30">
                Batch: {batch.ecoTrackId} ({batch.material})
              </span>
            )}
          </div>

          {/* Calculator Input Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 block">
                Target Waste Mass (kg)
              </label>
              <input
                type="number"
                step="0.1"
                min="0.1"
                max="500"
                value={batchWeight}
                onChange={(e) => setBatchWeight(parseFloat(e.target.value) || 1)}
                className="w-full bg-[#070b14] border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-teal-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 block">
                Biocatalytic Enzyme Platform
              </label>
              <select
                value={selectedEnzymeType}
                onChange={(e: any) => setSelectedEnzymeType(e.target.value)}
                className="w-full bg-[#070b14] border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-teal-500"
              >
                <option value="fast-petase">FAST-PETase (Engineered, 50°C)</option>
                <option value="lcc">Leaf Compost Cutinase LCC (70°C)</option>
                <option value="wt-petase">Wild-Type I. sakaiensis PETase (30°C)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 block">
                Bioreactor Temperature: {reactionTemp}°C
              </label>
              <input
                type="range"
                min="25"
                max="75"
                step="1"
                value={reactionTemp}
                onChange={(e) => setReactionTemp(parseInt(e.target.value, 10))}
                className="w-full accent-teal-400 mt-2"
              />
            </div>
          </div>

          {/* Output Kinetics Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-4 rounded-xl bg-[#070b14] border border-slate-800 space-y-1">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                90% Cleavage Timeline
              </span>
              <span className="text-lg font-bold font-mono text-teal-400 block">
                {calculatedKinetics.hours} <span className="text-xs text-slate-400">hours</span>
              </span>
              <span className="text-[10px] text-slate-500 block">vs. 450 years in landfill</span>
            </div>

            <div className="p-4 rounded-xl bg-[#070b14] border border-slate-800 space-y-1">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                Recovered TPA Monomer
              </span>
              <span className="text-lg font-bold font-mono text-white block">
                {calculatedKinetics.tpaYieldKg} <span className="text-xs text-slate-400">kg</span>
              </span>
              <span className="text-[10px] text-teal-400 block font-mono">
                + {calculatedKinetics.egYieldKg} kg Ethylene Glycol
              </span>
            </div>

            <div className="p-4 rounded-xl bg-[#070b14] border border-slate-800 space-y-1">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                Enzyme Mass Required
              </span>
              <span className="text-lg font-bold font-mono text-white block">
                {calculatedKinetics.enzymeGrams} <span className="text-xs text-slate-400">g</span>
              </span>
              <span className="text-[10px] text-slate-500 block">Concentration: ~0.1% w/w</span>
            </div>

            <div className="p-4 rounded-xl bg-[#070b14] border border-teal-500/30 bg-teal-950/10 space-y-1">
              <span className="text-[10px] text-teal-300 uppercase tracking-wider block">
                CO2e Abatement
              </span>
              <span className="text-lg font-bold font-mono text-teal-300 block">
                {calculatedKinetics.carbonSaved} <span className="text-xs text-teal-400">kg CO₂</span>
              </span>
              <span className="text-[10px] text-slate-400 block">Avoided petrochemical synthesis</span>
            </div>
          </div>

          {/* Chemical Reaction Pathway Visualization */}
          <div className="p-4 rounded-xl bg-[#070b14] border border-slate-800 space-y-2 text-xs">
            <span className="font-semibold text-slate-300 block">
              Biocatalytic Enzymatic Cascade
            </span>
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left py-2 font-mono text-[11px]">
              <div className="p-2.5 rounded bg-[#0c1220] border border-slate-800 flex-1 w-full">
                <span className="text-slate-400 block text-[9px]">Substrate</span>
                <span className="font-bold text-white">PET Polymer (n=100)</span>
              </div>
              <ArrowRight className="h-4 w-4 text-teal-400 rotate-90 sm:rotate-0 shrink-0" />
              <div className="p-2.5 rounded bg-[#0c1220] border border-slate-800 flex-1 w-full">
                <span className="text-slate-400 block text-[9px]">PETase Cleavage</span>
                <span className="font-bold text-teal-300">MHET + BHET Oligomers</span>
              </div>
              <ArrowRight className="h-4 w-4 text-teal-400 rotate-90 sm:rotate-0 shrink-0" />
              <div className="p-2.5 rounded bg-[#0c1220] border border-slate-800 flex-1 w-full">
                <span className="text-slate-400 block text-[9px]">MHETase Hydrolysis</span>
                <span className="font-bold text-teal-400">Pure TPA + Ethylene Glycol</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. Peer-Reviewed Literature (Europe PMC) */}
      {activeSubTab === 'literature' && (
        <div className="space-y-4">
          <div className="rounded-xl bg-[#0c1220] border border-slate-800 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white">
                  Europe PMC Peer-Reviewed Biomedical &amp; Bioengineering Research
                </h3>
                <p className="text-xs text-slate-400">
                  Real-time query of open-access scientific literature on polymer biodegradation, protein engineering, and circular biotechnology.
                </p>
              </div>
              <span className="text-[10px] font-mono text-teal-400 bg-teal-500/10 px-2 py-0.5 rounded border border-teal-500/30">
                Europe PMC API
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-1">
              {[
                'PETase plastic recycling Ideonella',
                'Fast-PETase machine learning engineering',
                'Microbial degradation polyethylene terephthalate',
                'Enzymatic circular bio-recycling textiles',
              ].map((queryPreset) => (
                <button
                  key={queryPreset}
                  onClick={() => {
                    setLiteratureQuery(queryPreset);
                    handleSearchLiterature(queryPreset);
                  }}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-mono transition cursor-pointer ${
                    literatureQuery === queryPreset
                      ? 'bg-teal-500/20 text-teal-300 font-bold border border-teal-500/40'
                      : 'bg-[#070b14] text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  {queryPreset}
                </button>
              ))}
            </div>
          </div>

          {/* Papers List */}
          {isLoadingPapers ? (
            <div className="p-12 text-center text-slate-400 space-y-2">
              <RefreshCw className="h-6 w-6 text-teal-400 animate-spin mx-auto" />
              <p className="text-xs font-mono">Fetching peer-reviewed publications from Europe PMC...</p>
            </div>
          ) : (
            <div className="space-y-3">
              {papers.map((paper) => (
                <div
                  key={paper.id}
                  className="rounded-xl bg-[#0c1220] border border-slate-800 p-4 space-y-2 text-xs hover:border-slate-700 transition"
                >
                  <div className="flex items-start justify-between gap-3">
                    <h4 className="font-bold text-white text-sm leading-snug">{paper.title}</h4>
                    {paper.doi && (
                      <a
                        href={`https://doi.org/${paper.doi}`}
                        target="_blank"
                        rel="noreferrer"
                        className="shrink-0 flex items-center gap-1 text-[11px] text-teal-400 hover:text-teal-300 font-semibold px-2 py-0.5 rounded bg-[#070b14] border border-slate-800"
                      >
                        <span>DOI</span>
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>

                  <p className="text-slate-400 text-[11px]">
                    <span className="text-slate-300">{paper.authorString}</span> ·{' '}
                    <span className="italic text-teal-300/80">{paper.journalTitle}</span> ({paper.pubYear})
                  </p>

                  {paper.abstractText && (
                    <p className="text-slate-300 line-clamp-3 leading-relaxed text-[11px] bg-[#070b14] p-3 rounded-lg border border-slate-800/60">
                      {paper.abstractText}
                    </p>
                  )}

                  <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono pt-1">
                    <span>Europe PMC ID: {paper.id}</span>
                    {paper.citedByCount !== undefined && (
                      <span>Citations: {paper.citedByCount}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
