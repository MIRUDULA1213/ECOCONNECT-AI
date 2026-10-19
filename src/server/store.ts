import {
  WasteBatch,
  CustodyEvent,
  InvestigationCase,
  ApprovalRequest,
  ToolCallExecution,
  AuditLogEntry,
  IncidentReport,
  DemoScenarioState,
} from '../types/ecoconnect.ts';

// Simple deterministic hash generator for tamper-evident audit log
function computeSimpleHash(input: string): string {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to 32bit integer
  }
  return '0x' + Math.abs(hash).toString(16).padStart(8, '0') + 'ec0';
}

export class EcoConnectStore {
  public batches: Map<string, WasteBatch> = new Map();
  public investigations: Map<string, InvestigationCase> = new Map();
  public approvals: Map<string, ApprovalRequest> = new Map();
  public toolExecutions: ToolCallExecution[] = [];
  public auditTrail: AuditLogEntry[] = [];
  public reports: Map<string, IncidentReport> = new Map();
  public offlineEventsQueue: CustodyEvent[] = [];
  public demoState: DemoScenarioState = {
    currentStep: 0,
    totalSteps: 9,
    stepName: 'Ready to Ingest',
    stepDescription: 'System initialized. Click "Run Demo Scenario" or "Next Step" to begin tracking EC26-CHN-00182.',
    ecoTrackId: 'EC26-CHN-00182',
    isPlaying: false,
    isCompleted: false,
    stepHistory: [],
  };

  private lastHash = '0x00000000genesis';
  public listeners: Array<(event: { type: string; data: any; timestamp: string }) => void> = [];

  constructor() {
    this.seedDatabase();
  }

  public subscribe(fn: (event: { type: string; data: any; timestamp: string }) => void) {
    this.listeners.push(fn);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== fn);
    };
  }

  public emit(type: string, data: any) {
    const timestamp = new Date().toISOString();
    this.listeners.forEach((fn) => {
      try {
        fn({ type, data, timestamp });
      } catch (err) {
        // Ignore subscriber error
      }
    });
  }

  public recordAudit(ecoTrackId: string, action: string, actor: string, actorRole: string, details: string, metadata?: Record<string, any>): AuditLogEntry {
    const timestamp = new Date().toISOString();
    const payload = `${timestamp}|${ecoTrackId}|${action}|${actor}|${this.lastHash}`;
    const hash = computeSimpleHash(payload);

    const entry: AuditLogEntry = {
      id: `AUD-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp,
      ecoTrackId,
      action,
      actor,
      actorRole,
      details,
      metadata,
      previousHash: this.lastHash,
      hash,
    };

    this.lastHash = hash;
    this.auditTrail.unshift(entry);
    this.emit('AUDIT_ENTRY', entry);
    return entry;
  }

  public logToolCall(
    toolName: string,
    callerAgent: string,
    inputArgs: Record<string, any>,
    outputResult: Record<string, any>,
    durationMs: number,
    explanation: string,
    status: 'SUCCESS' | 'ERROR' | 'RETRY' = 'SUCCESS'
  ): ToolCallExecution {
    const exec: ToolCallExecution = {
      id: `TOOL-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      toolName,
      callerAgent,
      inputArgs,
      outputResult,
      timestamp: new Date().toISOString(),
      durationMs,
      status,
      explanation,
    };
    this.toolExecutions.unshift(exec);
    this.emit('TOOL_EXECUTION', exec);
    return exec;
  }

  public seedDatabase() {
    this.batches.clear();
    this.investigations.clear();
    this.approvals.clear();
    this.toolExecutions = [];
    this.auditTrail = [];
    this.reports.clear();
    this.offlineEventsQueue = [];
    this.lastHash = '0x00000000genesis';

    // Master Demo Batch: EC26-CHN-00182
    const masterBatch: WasteBatch = {
      ecoTrackId: 'EC26-CHN-00182',
      material: 'PET Plastic',
      wasteCategory: 'Recyclable',
      status: 'INGESTED',
      initialWeightKg: 1.80,
      currentWeightKg: 1.80,
      unit: 'kg',
      quantityItems: 6,
      sourceType: 'household',
      qrPayload: 'https://ecoconnect.app/batch/EC26-CHN-00182',
      createdAt: '2026-10-18T08:14:22.000Z',
      updatedAt: '2026-10-18T08:14:22.000Z',
      citizen: {
        citizenId: 'CIT-CHN-8842',
        name: 'Priya Sundaram',
        phone: '+91 98401 22849',
        neighborhood: 'Besant Nagar, Chennai',
        greenCreditsEarned: 18,
      },
      smartStation: {
        stationId: 'SS-CHN-BN014',
        stationName: 'Besant Nagar Smart Hub #14',
        locationName: '4th Main Road, Besant Nagar, Chennai 600090',
      },
      locationDetails: {
        address: '4th Main Road, Besant Nagar',
        city: 'Chennai',
        state: 'Tamil Nadu',
        country: 'India',
        lat: 13.0001,
        lng: 80.2667,
      },
      collectionInfo: {
        collectorName: 'Urbaser Sumeet City Logistics',
        collectionMethod: 'Smart Bin Automated Lift',
        sortingCentreDetails: 'Guindy Material Recovery Facility (MRF-CHN-GD02)',
        destinationRecycler: 'GreenLoop Polymer Recyclers (REC-CHN-GL01)',
        notes: 'Citizen segregated clean beverage bottles into Smart Hub slot.',
      },
      opticalClassification: {
        detectedMaterial: 'PET Plastic',
        confidence: 0.984,
        contaminationDetected: false,
        contaminationPercentage: 1.5,
        contaminationNotes: 'Clean transparent beverage containers. Minimal moisture residue detected.',
        analyzedAt: '2026-10-18T08:14:22.000Z',
      },
      aiAssessment: {
        predictedMaterialClass: 'Polyethylene Terephthalate (PETE-1 Beverage Grade)',
        predictedWasteCategory: 'Recyclable',
        contaminationProbabilityPct: 1.5,
        recyclabilityAssessment: 'HIGH_GRADE_A',
        sortingRecommendation: 'Near-Infrared (NIR) optical color sort and flaking. Detach PP bottle closure.',
        recommendedHandling: 'Bale at 320 kg/m³ density; dispatch to rotary friction hot-wash to strip labels and residual sugar.',
        potentialProcessingRisks: [
          'Acetaldehyde degradation if heated above 260°C',
          'Polyvinyl chloride (PVC) cross-contamination can acidify wash bath',
        ],
        suggestedNextAction: 'Proceed to Mechanical Granulator Bay #02 for food-grade bottle-to-bottle pelletizing.',
        predictionConfidence: 96.4,
        evidenceBasis: [
          'MobileNetV3 Edge Optical Spectrogram (Clear Specular Reflection)',
          'Calibrated density signature (1.38 g/cm³)',
          'Origin: Household Smart Station',
        ],
        evidenceType: 'Model-predicted',
        modelName: 'MobileNetV3-WasteNet-v4 + Gemini 3.8 Flash',
        analyzedAt: '2026-10-18T08:14:22.000Z',
      },
      custodyHistory: [
        {
          id: 'CUST-001',
          batchId: 'EC26-CHN-00182',
          stage: 'HOUSEHOLD_DEPOSIT',
          stageLabel: 'Citizen Deposit at Smart Station',
          timestamp: '2026-10-18T08:14:22.000Z',
          location: {
            name: 'Besant Nagar Smart Hub #14',
            lat: 13.0001,
            lng: 80.2667,
            address: '4th Main Road, Besant Nagar, Chennai 600090',
            facilityCode: 'SS-CHN-BN014',
          },
          handler: {
            name: 'Priya Sundaram (Citizen)',
            role: 'Resident Depositor',
            facility: 'Residential Cluster',
            badgeId: 'CIT-CHN-8842',
          },
          measuredWeightKg: 1.80,
          device: {
            deviceId: 'ESP32-SCALE-BN14',
            type: 'ESP32_LOAD_CELL',
            batteryPct: 94,
            firmwareVersion: 'v2.4.1-iot',
            signalStrength: '-62 dBm (WiFi)',
          },
          evidence: {
            qrHash: 'a9f24c8b91e01d',
            opticalConfidencePct: 98.4,
            notes: 'ESP32-CAM calibrated load cell reading 1.80kg. Optical scan verified PET.',
          },
          syncStatus: 'SYNCED',
          isVerified: true,
        },
      ],
    };

    // Additional Batches for ecosystem realism
    const batch2: WasteBatch = {
      ecoTrackId: 'EC26-BLR-00419',
      material: 'Aluminium Cans',
      wasteCategory: 'Recyclable',
      status: 'ACTIVE_TRANSIT',
      initialWeightKg: 3.20,
      currentWeightKg: 3.18,
      unit: 'kg',
      quantityItems: 14,
      sourceType: 'household',
      qrPayload: 'https://ecoconnect.app/batch/EC26-BLR-00419',
      sortingWeightKg: 3.18,
      createdAt: '2026-10-17T11:00:00.000Z',
      updatedAt: '2026-10-18T06:30:00.000Z',
      citizen: {
        citizenId: 'CIT-BLR-1092',
        name: 'Arjun Mehta',
        phone: '+91 99002 44102',
        neighborhood: 'Indiranagar, Bengaluru',
        greenCreditsEarned: 45,
      },
      smartStation: {
        stationId: 'SS-BLR-IN003',
        stationName: 'Indiranagar Metro Station Bin',
        locationName: '100ft Road, Bengaluru 560038',
      },
      opticalClassification: {
        detectedMaterial: 'Aluminium Cans',
        confidence: 0.991,
        contaminationDetected: false,
        contaminationPercentage: 0.5,
        contaminationNotes: 'High purity beverage cans. Uncontaminated.',
        analyzedAt: '2026-10-17T11:00:00.000Z',
      },
      custodyHistory: [
        {
          id: 'CUST-B2-01',
          batchId: 'EC26-BLR-00419',
          stage: 'SMART_STATION_INGEST',
          stageLabel: 'Smart Bin Ingestion',
          timestamp: '2026-10-17T11:00:00.000Z',
          location: {
            name: 'Indiranagar Metro Station Bin',
            lat: 12.9784,
            lng: 77.6408,
            address: '100ft Road, Bengaluru',
            facilityCode: 'SS-BLR-IN003',
          },
          handler: {
            name: 'Station Automated Lock',
            role: 'IoT Ingestor',
            facility: 'Indiranagar Hub',
            badgeId: 'SYS-AUTOBIN',
          },
          measuredWeightKg: 3.20,
          device: {
            deviceId: 'ESP32-SCALE-BLR03',
            type: 'ESP32_LOAD_CELL',
            batteryPct: 88,
          },
          evidence: {
            qrHash: 'bc419aluminium',
            opticalConfidencePct: 99.1,
          },
          syncStatus: 'SYNCED',
          isVerified: true,
        },
        {
          id: 'CUST-B2-02',
          batchId: 'EC26-BLR-00419',
          stage: 'SORTING_CENTRE_RECEIPT',
          stageLabel: 'Whitefield Material Recovery Center',
          timestamp: '2026-10-17T17:45:00.000Z',
          location: {
            name: 'Whitefield MRF Facility',
            lat: 12.9698,
            lng: 77.7499,
            address: 'ITPL Main Road, Whitefield',
            facilityCode: 'MRF-BLR-02',
          },
          handler: {
            name: 'Ramesh Gowda',
            role: 'MRF Weighbridge Supervisor',
            facility: 'Whitefield MRF',
            badgeId: 'EMP-MRF-402',
          },
          measuredWeightKg: 3.18,
          device: {
            deviceId: 'SCALE-METTLER-04',
            type: 'FACILITY_SCALE',
          },
          evidence: {
            qrHash: 'mrf-scan-419',
            receiptRef: 'RCP-BLR-2026-881',
          },
          syncStatus: 'SYNCED',
          isVerified: true,
        },
      ],
    };

    const batch3: WasteBatch = {
      ecoTrackId: 'EC26-MUM-00912',
      material: 'Cardboard / Paper',
      wasteCategory: 'Recyclable',
      status: 'RECOVERY_VERIFIED',
      initialWeightKg: 12.50,
      currentWeightKg: 11.50,
      unit: 'kg',
      quantityItems: 25,
      sourceType: 'business',
      qrPayload: 'https://ecoconnect.app/batch/EC26-MUM-00912',
      sortingWeightKg: 12.10,
      recyclerWeightKg: 11.80,
      verifiedRecoveryWeightKg: 11.50,
      recoveryYieldPct: 92.0,
      createdAt: '2026-10-15T09:30:00.000Z',
      updatedAt: '2026-10-17T16:20:00.000Z',
      citizen: {
        citizenId: 'CIT-MUM-7711',
        name: 'Kavita Chawla',
        phone: '+91 98200 99401',
        neighborhood: 'Bandra West, Mumbai',
        greenCreditsEarned: 125,
      },
      smartStation: {
        stationId: 'SS-MUM-BW007',
        stationName: 'Carter Road EcoStation',
        locationName: 'Carter Road Promenade, Bandra West',
      },
      opticalClassification: {
        detectedMaterial: 'Cardboard / Paper',
        confidence: 0.965,
        contaminationDetected: false,
        contaminationPercentage: 2.1,
        contaminationNotes: 'Clean fluted corrugated boxes. Flattened.',
        analyzedAt: '2026-10-15T09:30:00.000Z',
      },
      custodyHistory: [
        {
          id: 'CUST-B3-01',
          batchId: 'EC26-MUM-00912',
          stage: 'HOUSEHOLD_DEPOSIT',
          stageLabel: 'Citizen Deposit',
          timestamp: '2026-10-15T09:30:00.000Z',
          location: {
            name: 'Carter Road EcoStation',
            lat: 19.0607,
            lng: 72.8258,
            address: 'Bandra West, Mumbai',
            facilityCode: 'SS-MUM-BW007',
          },
          handler: {
            name: 'Kavita Chawla',
            role: 'Resident',
            facility: 'Citizen Cluster',
            badgeId: 'CIT-MUM-7711',
          },
          measuredWeightKg: 12.50,
          device: {
            deviceId: 'ESP32-SCALE-MUM07',
            type: 'ESP32_LOAD_CELL',
          },
          evidence: {
            qrHash: 'cardboard-mum-912',
            opticalConfidencePct: 96.5,
          },
          syncStatus: 'SYNCED',
          isVerified: true,
        },
        {
          id: 'CUST-B3-02',
          batchId: 'EC26-MUM-00912',
          stage: 'RECOVERY_VERIFIED',
          stageLabel: 'Pulp Mill Pulping Complete',
          timestamp: '2026-10-17T16:20:00.000Z',
          location: {
            name: 'Sahyadri Paper Products Ltd',
            lat: 19.2183,
            lng: 72.9781,
            address: 'Thane Industrial Estate',
            facilityCode: 'REC-PULP-11',
          },
          handler: {
            name: 'Dr. S. K. Nair',
            role: 'Chief Quality Inspector',
            facility: 'Sahyadri Recyclers',
            badgeId: 'REC-INSP-01',
          },
          measuredWeightKg: 11.50,
          device: {
            deviceId: 'SCALE-IND-METTLER-9',
            type: 'FACILITY_SCALE',
          },
          evidence: {
            qrHash: 'pulp-cert-mum-912',
            receiptRef: 'REC-CERT-2026-9914',
            notes: 'Hydro-pulper test yield verified at 92.0%. 0.40kg moisture and tape residue culled.',
          },
          syncStatus: 'SYNCED',
          isVerified: true,
        },
      ],
    };

    const batch4: WasteBatch = {
      ecoTrackId: 'EC26-DEL-00045',
      material: 'HDPE Plastic',
      wasteCategory: 'Hazardous',
      status: 'DISCREPANCY_FLAGGED',
      initialWeightKg: 4.60,
      currentWeightKg: 4.60,
      unit: 'kg',
      quantityItems: 8,
      sourceType: 'industry',
      qrPayload: 'https://ecoconnect.app/batch/EC26-DEL-00045',
      createdAt: '2026-10-18T05:00:00.000Z',
      updatedAt: '2026-10-18T05:10:00.000Z',
      citizen: {
        citizenId: 'CIT-DEL-3381',
        name: 'Vikas Sharma',
        phone: '+91 98111 88204',
        neighborhood: 'Vasant Vihar, New Delhi',
        greenCreditsEarned: 5,
      },
      smartStation: {
        stationId: 'SS-DEL-VV002',
        stationName: 'Vasant Vihar Community Bin',
        locationName: 'Priya Cinema Complex, Vasant Vihar',
      },
      opticalClassification: {
        detectedMaterial: 'HDPE Plastic',
        confidence: 0.942,
        contaminationDetected: true,
        contaminationPercentage: 18.5,
        contaminationNotes: 'Heavy motor lubricant residue detected inside 2 containers. Classified as Hazardous Contaminant.',
        analyzedAt: '2026-10-18T05:00:00.000Z',
      },
      custodyHistory: [
        {
          id: 'CUST-B4-01',
          batchId: 'EC26-DEL-00045',
          stage: 'SMART_STATION_INGEST',
          stageLabel: 'Smart Bin Ingestion',
          timestamp: '2026-10-18T05:00:00.000Z',
          location: {
            name: 'Vasant Vihar Community Bin',
            lat: 28.5603,
            lng: 77.1611,
            address: 'Vasant Vihar, New Delhi',
            facilityCode: 'SS-DEL-VV002',
          },
          handler: {
            name: 'Automated Sorter AI',
            role: 'Optical Inspection Subsystem',
            facility: 'Smart Station Bin',
            badgeId: 'AI-CAM-DEL-02',
          },
          measuredWeightKg: 4.60,
          device: {
            deviceId: 'ESP32-CAM-DEL02',
            type: 'ESP32_LOAD_CELL',
          },
          evidence: {
            qrHash: 'hdpe-del-00045',
            opticalConfidencePct: 94.2,
            notes: 'Flagged for industrial solvent decontamination prior to mechanical shredding.',
          },
          syncStatus: 'SYNCED',
          isVerified: true,
          anomalyFlag: 'CONTAMINATION_DETECTED',
        },
      ],
    };

    this.batches.set(masterBatch.ecoTrackId, masterBatch);
    this.batches.set(batch2.ecoTrackId, batch2);
    this.batches.set(batch3.ecoTrackId, batch3);
    this.batches.set(batch4.ecoTrackId, batch4);

    // Seed initial certified incident report for EC26-CHN-00182
    const seededReport: IncidentReport = {
      reportId: 'REP-EC26-CHN-00182-FORENSIC',
      ecoTrackId: 'EC26-CHN-00182',
      generatedAt: '2026-10-18T10:30:00.000Z',
      incidentSummary: 'Forensic Investigation and Chain of Custody Audit for EcoTrack Batch EC26-CHN-00182 (PET Plastic). Multi-sensor synthesis reconciled initial deposit (1.80 kg) against final extruded flakes (1.20 kg), confirming 66.67% net verified recovery yield.',
      initialBatchDetails: {
        ecoTrackId: 'EC26-CHN-00182',
        material: 'PET Plastic',
        initialWeightKg: 1.80,
        depositLocation: 'Besant Nagar Smart Drop #14, Chennai',
        citizenName: 'Priya Sundaram',
        depositedAt: '2026-10-18T08:14:22.000Z',
      },
      chainOfCustody: [...masterBatch.custodyHistory],
      dataSourcesConsulted: [
        'EcoTrack Ingestion Registry (ESP32 Load Cell V2)',
        'Guindy MRF Automated Weighbridge Data Lake',
        'GreenLoop Maraimalai Nagar Optical Purity Sorter',
        'Vehicle GPS Telematics Unit TN-09-CB-4491',
        'State Pollution Control Board Audit Ledger',
      ],
      detectedDiscrepancies: [
        {
          code: 'TRANSIT_WEIGHT_DISCREPANCY',
          label: 'In-Transit Weight Reduction',
          severity: 'CRITICAL',
          details: 'Sorting centre dispatched 1.62 kg, recycler intake logged 1.48 kg gross material.',
          confirmedFact: true,
          weightDeltaKg: 0.14,
        },
        {
          code: 'MISSING_COLLECTOR_SCAN',
          label: 'Delayed GSM Sync During Urban Transit',
          severity: 'WARNING',
          details: 'Handheld scanner queued scan offline during cellular dead zone; reconciled at depot gateway.',
          confirmedFact: true,
        },
      ],
      rootCause: {
        probableCause: 'Moisture evaporation combined with mechanical label and neck-ring detachment during MRF pre-wash handling.',
        confidencePct: 96.4,
        justification: 'Electronic facility tare slips (#RCP-REC-2026-4401) and digital calibration certificates confirm 0.14 kg deduction is consistent with PET bottle preparation tare standards.',
        inferenceMethod: 'GEMINI_LLM_MULTI_AGENT',
        potentialExplanations: [
          'Secondary label/cap separation at recycler wash plant (~0.09 kg)',
          'Moisture evaporation from wet bottles during 32°C afternoon transit (~0.05 kg)',
          'Scale calibration zeroing tolerance (+/- 0.01 kg)',
        ],
        evidenceSummary: {
          confirmedFacts: [
            'Initial 1.80 kg registered with calibrated ESP32 load cell (98.4% PET optical match)',
            'Guindy MRF intake weight 1.62 kg registered on certified weighbridge',
            'GreenLoop recycler scale registered 1.48 kg gross material with tare slip #RCP-REC-2026-4401',
          ],
          missingOrUnverified: [
            'Collector truck in-transit scale reading was not captured in real time (buffered offline)',
          ],
          assumptionsExcluded: [
            'Illegal diversion or material theft ruled out: seal SEAL-MRF-88219 intact upon arrival',
          ],
        },
      },
      remediationPlan: [
        {
          stepNumber: 1,
          actionKey: 'RECONCILE_OFFLINE_SCAN',
          title: 'Reconcile Offline Collector Telemetry',
          description: 'Synchronize buffered scan event from Zebra handheld terminal',
          requiresApproval: false,
          status: 'EXECUTED',
          executionResult: 'Reconciled 1 offline custody scan with central ledger',
          executedAt: '2026-10-18T09:45:00.000Z',
          toolUsed: 'reconcile_offline_events',
          autoExecutable: true,
        },
        {
          stepNumber: 2,
          actionKey: 'REQUEST_TARE_CERTIFICATE',
          title: 'Verify Recycler Tare Calibration',
          description: 'Obtain digital tare deduction verification sheet from GreenLoop QA system',
          requiresApproval: false,
          status: 'EXECUTED',
          executionResult: 'Tare calibration verified: 0.14 kg moisture tare deduction accepted',
          executedAt: '2026-10-18T09:48:00.000Z',
          toolUsed: 'request_facility_evidence',
          autoExecutable: true,
        },
        {
          stepNumber: 3,
          actionKey: 'AUTHORIZE_WEIGHT_ADJUSTMENT',
          title: 'Authorize Official Weight Correction',
          description: 'Update official ledger weight to 1.48 kg net recyclable mass',
          requiresApproval: true,
          status: 'EXECUTED',
          executionResult: 'Approved by Chief Sustainability Officer. Official net weight set to 1.48 kg.',
          executedAt: '2026-10-18T10:02:00.000Z',
          toolUsed: 'update_batch_status',
          autoExecutable: false,
        },
        {
          stepNumber: 4,
          actionKey: 'VERIFY_RECOVERY_METRICS',
          title: 'Calculate Recovery Yield & Grade',
          description: 'Certify polymer yield formula: (1.20 / 1.80) * 100 = 66.67%',
          requiresApproval: false,
          status: 'EXECUTED',
          executionResult: 'Recovery yield verified: 66.67%. Grade A bottle-to-bottle rPET flakes.',
          executedAt: '2026-10-18T10:15:00.000Z',
          toolUsed: 'calculate_recovery_yield',
          autoExecutable: true,
        },
        {
          stepNumber: 5,
          actionKey: 'DISPATCH_CITIZEN_NOTIFICATION',
          title: 'Dispatch Citizen Verification & Green Credits',
          description: 'Send SMS & WhatsApp notifications awarding 24 Green Credits to citizen depositor',
          requiresApproval: false,
          status: 'EXECUTED',
          executionResult: 'Alerts dispatched to Priya Sundaram (+91 98401 23456)',
          executedAt: '2026-10-18T10:20:00.000Z',
          toolUsed: 'send_notification',
          autoExecutable: true,
        },
      ],
      humanApprovalDecisions: [
        {
          id: 'APP-EC26-CHN-00182-01',
          investigationId: 'INV-EC26-CHN-00182',
          ecoTrackId: 'EC26-CHN-00182',
          actionType: 'CORRECT_OFFICIAL_WEIGHT',
          actionTypeLabel: 'Official Weight & Tare Reconciliation',
          proposedAction: 'Adjust official net batch weight from 1.62 kg to 1.48 kg to reflect audited tare deduction of 0.14 kg.',
          reason: 'Facility weighbridge logs and tare certificates confirm 0.14 kg moisture and label shredding loss.',
          estimatedImpact: 'Ensures zero ledger distortion and confirms 66.67% recovery yield without penalty to sorting contractor.',
          confidencePct: 96.4,
          supportingEvidence: [
            'Facility tare calibration log RCP-REC-2026-4401',
            'Tamper-evident transport seal SEAL-MRF-88219 verified intact',
            'Optical scan purity match: 98.4%',
          ],
          submittedAt: '2026-10-18T09:50:00.000Z',
          decision: 'APPROVED',
          decidedBy: 'Sarah Jenkins (Chief Sustainability Officer)',
          decisionNotes: 'Authorized after reviewing tare certificates and truck container seal log.',
          decidedAt: '2026-10-18T10:02:00.000Z',
        },
      ],
      executedActions: [
        {
          step: 1,
          action: 'Reconcile Offline Collector Telemetry',
          result: 'Buffered offline custody scan synchronized with ledger',
          timestamp: '2026-10-18T09:45:00.000Z',
          tool: 'reconcile_offline_events',
        },
        {
          step: 2,
          action: 'Verify Recycler Tare Calibration',
          result: 'Tare calibration verified: 0.14 kg moisture tare deduction accepted',
          timestamp: '2026-10-18T09:48:00.000Z',
          tool: 'request_facility_evidence',
        },
        {
          step: 3,
          action: 'Authorize Official Weight Correction',
          result: 'Approved by Chief Sustainability Officer. Official net weight set to 1.48 kg.',
          timestamp: '2026-10-18T10:02:00.000Z',
          tool: 'update_batch_status',
        },
        {
          step: 4,
          action: 'Calculate Recovery Yield & Grade',
          result: 'Yield verified: 66.67%. Grade A bottle-to-bottle rPET flakes.',
          timestamp: '2026-10-18T10:15:00.000Z',
          tool: 'calculate_recovery_yield',
        },
        {
          step: 5,
          action: 'Dispatch Citizen Verification & Green Credits',
          result: 'Dispatched in-app & WhatsApp verified recovery alerts to Priya Sundaram.',
          timestamp: '2026-10-18T10:20:00.000Z',
          tool: 'send_notification',
        },
      ],
      finalRecoveryMetrics: {
        initialDepositedWeightKg: 1.80,
        sortingWeightKg: 1.62,
        recyclerReceivedWeightKg: 1.48,
        verifiedRecoveredWeightKg: 1.20,
        weightLossDeltaKg: 0.60,
        recoveryYieldPercentage: 66.67,
        calculationFormula: '(1.20 kg flakes / 1.80 kg deposit) * 100 = 66.67%',
        verificationStatus: 'CONFIRMED',
      },
      unresolvedIssues: [],
      auditTrailExcerpt: [
        {
          id: 'AUD-REP-01',
          timestamp: '2026-10-18T10:25:00.000Z',
          ecoTrackId: 'EC26-CHN-00182',
          action: 'FORENSIC_REPORT_SEALED',
          actor: 'Automated Agentic Governance Engine',
          actorRole: 'System Auditor',
          details: 'Official Forensic Incident Report sealed with cryptographic SHA-256 chain.',
          previousHash: '0x3ea7d95fec049182390192830192830192830129a',
          hash: '0x501e6988ec049182390192830192830129b',
        },
      ],
    };

    this.reports.set('EC26-CHN-00182', seededReport);

    this.demoState = {
      currentStep: 0,
      totalSteps: 9,
      stepName: 'Ready to Ingest',
      stepDescription: 'System initialized. Click "Run Demo Scenario" or "Next Step" to begin tracking EC26-CHN-00182.',
      ecoTrackId: 'EC26-CHN-00182',
      isPlaying: false,
      isCompleted: false,
      stepHistory: [
        {
          stepIndex: 0,
          name: 'Ready / Seeded',
          timestamp: new Date().toISOString(),
          completed: true,
          agent: 'System',
          detail: 'Master scenario batch EC26-CHN-00182 created with 1.80 kg PET plastic deposit.',
        },
      ],
    };
  }
}

export const store = new EcoConnectStore();
