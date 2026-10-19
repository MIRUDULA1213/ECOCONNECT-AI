/**
 * Bioscience API Service
 * Integrates PubChem, RCSB PDB, AlphaFold DB, and Europe PMC
 * for circular bio-economy and enzymatic waste recycling.
 */

export interface PubChemCompound {
  cid: number;
  title: string;
  iupacName?: string;
  molecularFormula: string;
  molecularWeight: string;
  smiles: string;
  xlogp?: number;
  tpsa?: number;
  complexity?: number;
  pngUrl: string;
  roleInRecycling: string;
  ghsHazardSummary?: string;
}

export interface EnzymeStructure {
  id: string;
  name: string;
  organism: string;
  pdbId: string;
  uniprotId: string;
  resolution: string;
  catalyticResidues: string[];
  description: string;
  optimalTemp: string;
  optimalPh: string;
  depolymerizationRate: string;
}

export interface SciencePaper {
  id: string;
  title: string;
  authorString: string;
  journalTitle: string;
  pubYear: string;
  doi?: string;
  citedByCount?: number;
  abstractText?: string;
}

export const PRESET_ENZYMES: EnzymeStructure[] = [
  {
    id: 'petase-wt',
    name: 'Ideonella sakaiensis PETase (Wild-Type)',
    organism: 'Ideonella sakaiensis 201-F6',
    pdbId: '5XJH',
    uniprotId: 'A0A0K8P6T7',
    resolution: '1.58 Å (X-ray)',
    catalyticResidues: ['Ser160', 'Asp206', 'His237'],
    description: 'Landmark bacterial esterase capable of hydrolyzing semi-crystalline polyethylene terephthalate (PET) into MHET.',
    optimalTemp: '30°C - 40°C',
    optimalPh: '7.0 - 9.0',
    depolymerizationRate: '0.13 mg PET / h / mg enzyme',
  },
  {
    id: 'mhetase',
    name: 'Ideonella sakaiensis MHETase',
    organism: 'Ideonella sakaiensis 201-F6',
    pdbId: '6QZ4',
    uniprotId: 'A0A0K8P8E7',
    resolution: '2.05 Å (X-ray)',
    catalyticResidues: ['Ser225', 'Asp492', 'His528'],
    description: 'Hydrolyzes mono-(2-hydroxyethyl) terephthalate (MHET) into monomeric terephthalic acid (TPA) and ethylene glycol.',
    optimalTemp: '35°C - 45°C',
    optimalPh: '7.5',
    depolymerizationRate: '0.45 mg MHET / h / mg enzyme',
  },
  {
    id: 'cutinase-lcc',
    name: 'Leaf-Branch Compost Cutinase (LCC WCCG)',
    organism: 'Metagenomic Compost Library',
    pdbId: '4EB0',
    uniprotId: 'G9BY57',
    resolution: '1.75 Å (X-ray)',
    catalyticResidues: ['Ser165', 'Asp210', 'His242'],
    description: 'Thermostable engineered cutinase achieving 90% PET depolymerization within 10 hours at 72°C.',
    optimalTemp: '70°C - 74°C',
    optimalPh: '8.0',
    depolymerizationRate: '16.7 mg PET / h / mg enzyme',
  },
];

export const PRESET_COMPOUNDS: PubChemCompound[] = [
  {
    cid: 7489,
    title: 'Terephthalic Acid (TPA)',
    iupacName: 'terephthalic acid',
    molecularFormula: 'C8H6O4',
    molecularWeight: '166.13 g/mol',
    smiles: 'C1=CC(=CC=C1C(=O)O)C(=O)O',
    xlogp: 2.0,
    tpsa: 74.6,
    pngUrl: 'https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/7489/PNG?image_size=large',
    roleInRecycling: 'Target purified monomer recovered from PET depolymerization for circular bottle-to-bottle synthesis.',
    ghsHazardSummary: 'Mild eye and respiratory irritant; zero hazardous environmental bioaccumulation.',
  },
  {
    cid: 174,
    title: 'Ethylene Glycol (EG)',
    iupacName: 'ethane-1,2-diol',
    molecularFormula: 'C2H6O2',
    molecularWeight: '62.07 g/mol',
    smiles: 'C(CO)O',
    xlogp: -1.4,
    tpsa: 40.5,
    pngUrl: 'https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/174/PNG?image_size=large',
    roleInRecycling: 'Co-monomer by-product of enzymatic PET cleavage; sequestered and re-polymerized.',
    ghsHazardSummary: 'Harmful if swallowed; toxic to kidneys if concentrated in untreated effluent.',
  },
  {
    cid: 13739,
    title: 'Bis(2-hydroxyethyl) terephthalate (BHET)',
    iupacName: 'bis(2-hydroxyethyl) benzene-1,4-dicarboxylate',
    molecularFormula: 'C12H14O6',
    molecularWeight: '254.24 g/mol',
    smiles: 'C1=CC(=CC=C1C(=O)OCCO)C(=O)OCCO',
    xlogp: 1.7,
    tpsa: 93.1,
    pngUrl: 'https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/13739/PNG?image_size=large',
    roleInRecycling: 'Primary intermediate in chemical glycolysis and enzymatic PET chain degradation.',
    ghsHazardSummary: 'Non-hazardous industrial monomer intermediate.',
  },
  {
    cid: 6623,
    title: 'Bisphenol A (BPA - Contaminant)',
    iupacName: '4-[2-(4-hydroxyphenyl)propan-2-yl]phenol',
    molecularFormula: 'C15H16O2',
    molecularWeight: '228.29 g/mol',
    smiles: 'CC(C)(C1=CC=C(C=C1)O)C2=CC=C(C=C2)O',
    xlogp: 3.3,
    tpsa: 40.5,
    pngUrl: 'https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/6623/PNG?image_size=large',
    roleInRecycling: 'Hazardous plastic additive; flagged by optical spectroscopy for chemical remediation.',
    ghsHazardSummary: 'Toxic to reproduction; endocrine disruptor; causes eye damage; toxic to aquatic life.',
  },
];

export const bioscienceApi = {
  /**
   * Fetches compound properties directly from PubChem PUG REST
   */
  fetchPubChemCompound: async (identifier: string | number): Promise<PubChemCompound | null> => {
    try {
      const endpoint =
        typeof identifier === 'number'
          ? `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/${identifier}/property/Title,IUPACName,MolecularFormula,MolecularWeight,CanonicalSMILES,XLogP,TPSA,Complexity/JSON`
          : `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/${encodeURIComponent(identifier)}/property/Title,IUPACName,MolecularFormula,MolecularWeight,CanonicalSMILES,XLogP,TPSA,Complexity/JSON`;

      const res = await fetch(endpoint);
      if (!res.ok) return null;
      const data = await res.json();
      const prop = data?.PropertyTable?.Properties?.[0];
      if (!prop) return null;

      return {
        cid: prop.CID,
        title: prop.Title || String(identifier),
        iupacName: prop.IUPACName,
        molecularFormula: prop.MolecularFormula,
        molecularWeight: `${prop.MolecularWeight} g/mol`,
        smiles: prop.CanonicalSMILES || prop.ConnectivitySMILES,
        xlogp: prop.XLogP,
        tpsa: prop.TPSA,
        complexity: prop.Complexity,
        pngUrl: `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/${prop.CID}/PNG?image_size=large`,
        roleInRecycling: 'Queried from National Center for Biotechnology Information (NCBI) PubChem database.',
      };
    } catch {
      return null;
    }
  },

  /**
   * Fetches peer-reviewed literature from Europe PMC
   */
  searchScientificLiterature: async (query: string): Promise<SciencePaper[]> => {
    try {
      const encodedQuery = encodeURIComponent(query);
      const url = `https://www.ebi.ac.uk/europepmc/webservices/rest/search?query=${encodedQuery}&format=json&pageSize=6&resultType=core`;
      const res = await fetch(url);
      if (!res.ok) return [];
      const data = await res.json();
      const results = data?.resultList?.result || [];

      return results.map((item: any) => ({
        id: item.id || String(Math.random()),
        title: item.title?.replace(/<\/?[^>]+(>|$)/g, '') || 'Untitled Research',
        authorString: item.authorString || 'Primary Research Consortium',
        journalTitle: item.journalTitle || 'Environmental Biotechnology',
        pubYear: item.pubYear || '2024',
        doi: item.doi,
        citedByCount: item.citedByCount || 0,
        abstractText: item.abstractText?.replace(/<\/?[^>]+(>|$)/g, '') || undefined,
      }));
    } catch {
      return [];
    }
  },
};
