import React, { useEffect, useRef, useState } from 'react';
import {
  RotateCcw,
  Play,
  Pause,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Atom,
  Sparkles,
  Info,
  ShieldCheck,
} from 'lucide-react';
import { EnzymeStructure } from '../../services/bioscienceApi.ts';

interface MolecularViewer3DProps {
  enzyme: EnzymeStructure;
}

export const MolecularViewer3D: React.FC<MolecularViewer3DProps> = ({ enzyme }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const viewerRef = useRef<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isSpinning, setIsSpinning] = useState(true);
  const [renderStyle, setRenderStyle] = useState<'plddt' | 'secondary' | 'surface' | 'spheres'>('plddt');
  const [activeResidue, setActiveResidue] = useState<string | null>(null);

  // Apply AlphaFold pLDDT color gradient or secondary structure
  const applyStyles = (viewer: any, style: string) => {
    if (!viewer) return;
    viewer.removeAllSurfaces();

    if (style === 'plddt') {
      // AlphaFold pLDDT color function
      const colorFunc = (atom: any) => {
        const b = atom.b;
        if (b > 90) return '#0053D6'; // Very high (>90): Dark Blue
        if (b > 70) return '#65CBF3'; // Confident (70-90): Light Blue
        if (b > 50) return '#FFDB13'; // Low (50-70): Yellow
        return '#FF7D45';             // Very low (<50): Orange / Disordered
      };
      viewer.setStyle({}, { cartoon: { colorfunc: colorFunc } });
    } else if (style === 'secondary') {
      viewer.setStyle({}, { cartoon: { color: 'spectrum' } });
    } else if (style === 'spheres') {
      viewer.setStyle({}, { sphere: { scale: 0.35, colorscheme: 'Jmol' } });
    } else if (style === 'surface') {
      viewer.setStyle({}, { cartoon: { color: '#475569', opacity: 0.6 } });
      viewer.addSurface('MS', { opacity: 0.85, color: 'teal' });
    }

    // Catalytic Triad Residues (Ser, Asp, His) highlighted as sticks
    const catalyticResidueNumbers = enzyme.catalyticResidues
      .map((r) => parseInt(r.replace(/\D/g, ''), 10))
      .filter((n) => !isNaN(n));

    if (catalyticResidueNumbers.length > 0) {
      viewer.setStyle(
        { resi: catalyticResidueNumbers },
        {
          stick: { color: '#ff5733', radius: 0.3 },
          sphere: { scale: 0.35, color: '#ff5733' },
        }
      );
    }

    viewer.render();
  };

  useEffect(() => {
    let isMounted = true;
    let viewer: any = null;

    async function loadStructure() {
      setIsLoading(true);
      setLoadError(null);

      try {
        if (!containerRef.current) return;
        const $3Dmol = await import('3dmol');

        if (!containerRef.current || !isMounted) return;

        // Clear container
        containerRef.current.innerHTML = '';

        viewer = $3Dmol.createViewer(containerRef.current, {
          defaultcolors: ($3Dmol as any).elementColors || ($3Dmol as any).rasmolElementColors,
          backgroundColor: '#070b14', // Match ECOCONNECT midnight navy
        });

        viewerRef.current = viewer;

        // Fetch coordinate file from RCSB PDB
        const response = await fetch(`https://files.rcsb.org/download/${enzyme.pdbId.toUpperCase()}.cif`);
        if (!response.ok) {
          throw new Error(`Failed to download structure ${enzyme.pdbId} from RCSB PDB`);
        }

        const cifData = await response.text();
        if (!isMounted) return;

        viewer.clear();
        viewer.addModel(cifData, 'cif');

        applyStyles(viewer, renderStyle);

        // Click interaction for residues
        viewer.setClickable({}, true, (atom: any) => {
          if (!atom) return;
          setActiveResidue(`${atom.resn} ${atom.resi} (Chain ${atom.chain}) · B-Factor: ${atom.b?.toFixed(1) || 'N/A'}`);
          viewer.addSphere({
            center: { x: atom.x, y: atom.y, z: atom.z },
            radius: 1.5,
            color: '#2dd4bf',
            opacity: 0.45,
          });
          viewer.render();
        });

        viewer.zoomTo();
        viewer.spin(true);
        setIsSpinning(true);
        viewer.render();
        setIsLoading(false);
      } catch (err: any) {
        if (isMounted) {
          setLoadError(err.message || 'Failed to render 3D macromolecule');
          setIsLoading(false);
        }
      }
    }

    loadStructure();

    return () => {
      isMounted = false;
      if (viewerRef.current) {
        try {
          viewerRef.current.spin(false);
          viewerRef.current.clear();
        } catch {
          // ignore
        }
      }
    };
  }, [enzyme.pdbId]);

  // Handle style switch
  useEffect(() => {
    if (viewerRef.current && !isLoading) {
      applyStyles(viewerRef.current, renderStyle);
    }
  }, [renderStyle]);

  const toggleSpin = () => {
    if (!viewerRef.current) return;
    const next = !isSpinning;
    viewerRef.current.spin(next);
    setIsSpinning(next);
  };

  const handleReset = () => {
    if (!viewerRef.current) return;
    viewerRef.current.zoomTo();
    viewerRef.current.render();
  };

  const handleZoom = (factor: number) => {
    if (!viewerRef.current) return;
    viewerRef.current.zoom(factor);
    viewerRef.current.render();
  };

  return (
    <div className="rounded-xl bg-[#0c1220] border border-slate-800 p-5 space-y-4">
      {/* Viewer Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2">
            <Atom className="h-4 w-4 text-teal-400" />
            <h3 className="text-sm font-bold text-white tracking-tight">{enzyme.name}</h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5 font-mono">
            PDB ID: <span className="text-teal-300 font-bold">{enzyme.pdbId}</span> · UniProt:{' '}
            <span className="text-slate-300">{enzyme.uniprotId}</span> · {enzyme.resolution}
          </p>
        </div>

        {/* View Controls & Representation Modes */}
        <div className="flex flex-wrap items-center gap-1.5 bg-[#070b14] p-1 rounded-lg border border-slate-800 text-xs">
          <button
            onClick={() => setRenderStyle('plddt')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition cursor-pointer ${
              renderStyle === 'plddt'
                ? 'bg-teal-500/20 text-teal-300 font-bold border border-teal-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="AlphaFold pLDDT Confidence Gradient"
          >
            pLDDT Confidence
          </button>
          <button
            onClick={() => setRenderStyle('secondary')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition cursor-pointer ${
              renderStyle === 'secondary'
                ? 'bg-teal-500/20 text-teal-300 font-bold border border-teal-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Secondary (Rainbow)
          </button>
          <button
            onClick={() => setRenderStyle('surface')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition cursor-pointer ${
              renderStyle === 'surface'
                ? 'bg-teal-500/20 text-teal-300 font-bold border border-teal-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Molecular Surface
          </button>
          <button
            onClick={() => setRenderStyle('spheres')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition cursor-pointer ${
              renderStyle === 'spheres'
                ? 'bg-teal-500/20 text-teal-300 font-bold border border-teal-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Spacefill
          </button>
        </div>
      </div>

      {/* 3D WebGL Canvas Container */}
      <div className="relative w-full h-80 sm:h-96 rounded-lg overflow-hidden border border-slate-800/80 bg-[#070b14]">
        <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

        {/* Loading Overlay */}
        {isLoading && (
          <div className="absolute inset-0 bg-[#070b14]/90 flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 rounded-full border-2 border-teal-400 border-t-transparent animate-spin" />
            <span className="text-xs font-mono text-slate-300">
              Retrieving mmCIF coordinates for {enzyme.pdbId} from RCSB PDB...
            </span>
          </div>
        )}

        {/* Error Fallback */}
        {loadError && (
          <div className="absolute inset-0 bg-[#070b14]/95 flex flex-col items-center justify-center p-6 text-center text-xs space-y-2">
            <Info className="h-6 w-6 text-[#ff5733] mx-auto" />
            <p className="text-slate-200">{loadError}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-3 py-1.5 rounded-lg bg-[#11192b] text-teal-300 border border-teal-500/30 text-xs"
            >
              Retry
            </button>
          </div>
        )}

        {/* Floating Interactive HUD Controls */}
        <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-[#0c1220]/80 backdrop-blur-md p-1 rounded-lg border border-slate-700/80 text-slate-300">
          <button
            onClick={toggleSpin}
            className="p-1.5 rounded hover:bg-slate-800 hover:text-white transition cursor-pointer"
            title={isSpinning ? 'Pause Rotation' : 'Auto-Rotate'}
          >
            {isSpinning ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
          </button>
          <button
            onClick={() => handleZoom(1.2)}
            className="p-1.5 rounded hover:bg-slate-800 hover:text-white transition cursor-pointer"
            title="Zoom In"
          >
            <ZoomIn className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => handleZoom(0.8)}
            className="p-1.5 rounded hover:bg-slate-800 hover:text-white transition cursor-pointer"
            title="Zoom Out"
          >
            <ZoomOut className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={handleReset}
            className="p-1.5 rounded hover:bg-slate-800 hover:text-white transition cursor-pointer"
            title="Reset Orientation"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Bottom Status / Active Residue Tag */}
        <div className="absolute bottom-3 left-3 right-3 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
          <div className="bg-[#0c1220]/90 backdrop-blur-md px-3 py-1 rounded-lg border border-slate-700/80 text-[11px] font-mono text-teal-300 pointer-events-auto">
            {activeResidue ? (
              <span>Selected: {activeResidue}</span>
            ) : (
              <span>Click any amino acid to inspect residue B-factor</span>
            )}
          </div>

          <div className="flex items-center gap-1.5 bg-[#0c1220]/90 backdrop-blur-md px-2.5 py-1 rounded-lg border border-slate-700/80 text-[10px] text-slate-300 pointer-events-auto">
            <span className="h-2 w-2 rounded-full bg-[#ff5733]" />
            <span>Catalytic Triad: {enzyme.catalyticResidues.join(' · ')}</span>
          </div>
        </div>
      </div>

      {/* AlphaFold Confidence Scale Legend */}
      {renderStyle === 'plddt' && (
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 text-[10px] text-slate-400 font-mono">
          <span className="text-slate-300 font-sans font-medium text-xs">
            AlphaFold pLDDT Metric:
          </span>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-sm bg-[#0053D6]" /> Very High (&gt;90)
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-sm bg-[#65CBF3]" /> Confident (70–90)
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-sm bg-[#FFDB13]" /> Low (50–70)
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-sm bg-[#FF7D45]" /> Very Low (&lt;50)
            </span>
          </div>
        </div>
      )}

      {/* Enzyme Engineering & Kinetic Highlights */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-1">
        <div className="p-3 rounded-lg bg-[#070b14] border border-slate-800">
          <span className="text-[10px] text-slate-400 block uppercase">Organism</span>
          <span className="font-semibold text-white mt-0.5 block truncate">{enzyme.organism}</span>
        </div>
        <div className="p-3 rounded-lg bg-[#070b14] border border-slate-800">
          <span className="text-[10px] text-slate-400 block uppercase">Optimal Conditions</span>
          <span className="font-mono font-bold text-teal-400 mt-0.5 block">
            {enzyme.optimalTemp} · pH {enzyme.optimalPh}
          </span>
        </div>
        <div className="p-3 rounded-lg bg-[#070b14] border border-slate-800">
          <span className="text-[10px] text-slate-400 block uppercase">Depolymerization Speed</span>
          <span className="font-mono font-bold text-white mt-0.5 block truncate">
            {enzyme.depolymerizationRate}
          </span>
        </div>
        <div className="p-3 rounded-lg bg-[#070b14] border border-slate-800">
          <span className="text-[10px] text-slate-400 block uppercase">Biorecycling Grade</span>
          <span className="font-bold text-teal-400 mt-0.5 block">Circular Monomer Yield 94%+</span>
        </div>
      </div>
    </div>
  );
};
