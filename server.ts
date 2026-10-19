import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { store } from './src/server/store.ts';
import * as orchestrator from './src/server/agentOrchestrator.ts';
import * as tools from './src/server/agentTools.ts';
import { WasteBatch } from './src/types/ecoconnect.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = parseInt(process.env.PORT || '3000', 10);

app.use(express.json());

// API Endpoints

// 1. Health & System Status
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ONLINE',
    app: 'ECOCONNECT AI',
    team: 'NAYASA HackLab',
    category: 'OPEN-X',
    geminiConfigured: !!process.env.GEMINI_API_KEY,
    totalBatches: store.batches.size,
    pendingApprovals: Array.from(store.approvals.values()).filter((a) => !a.decision).length,
    activeAnomalies: Array.from(store.batches.values()).filter((b) => b.status === 'DISCREPANCY_FLAGGED').length,
    timestamp: new Date().toISOString(),
  });
});

// Real-Time Server-Sent Events (SSE) Stream
app.get('/api/events/stream', (req: Request, res: Response) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  res.write(`data: ${JSON.stringify({ type: 'CONNECTED', timestamp: new Date().toISOString() })}\n\n`);

  const unsubscribe = store.subscribe((event) => {
    res.write(`data: ${JSON.stringify(event)}\n\n`);
  });

  const heartbeat = setInterval(() => {
    res.write(': keepalive\n\n');
  }, 25000);

  req.on('close', () => {
    clearInterval(heartbeat);
    unsubscribe();
  });
});

// Dashboard Summary KPI endpoint
app.get('/api/dashboard/summary', (req: Request, res: Response) => {
  const batches = Array.from(store.batches.values());
  const approvals = Array.from(store.approvals.values());
  const pendingApprovals = approvals.filter((a) => !a.decision).length;
  const collectedWeightKg = batches.reduce((acc, b) => acc + (b.initialWeightKg || 0), 0);
  const verifiedRecoveryKg = batches.reduce((acc, b) => acc + (b.verifiedRecoveryWeightKg || 0), 0);
  const activeAnomalies = batches.filter((b) => b.status === 'DISCREPANCY_FLAGGED').length;

  const currentCase = store.investigations.get('INV-EC26-CHN-00182') || Array.from(store.investigations.values())[0];
  const masterBatch = store.batches.get('EC26-CHN-00182') || batches[0];

  res.json({
    kpis: {
      trackedBatches: batches.length,
      collectedWeightKg: parseFloat(collectedWeightKg.toFixed(2)),
      verifiedRecoveryKg: parseFloat(verifiedRecoveryKg.toFixed(2)),
      pendingApprovals,
      activeAnomalies,
      recoveryYieldPct: collectedWeightKg > 0 ? parseFloat(((verifiedRecoveryKg / collectedWeightKg) * 100).toFixed(1)) : 0,
    },
    activeBatch: {
      ecoTrackId: masterBatch?.ecoTrackId || 'EC26-CHN-00182',
      material: masterBatch?.material || 'PET Plastic',
      status: masterBatch?.status || 'INGESTED',
      currentWeightKg: masterBatch?.currentWeightKg,
      initialWeightKg: masterBatch?.initialWeightKg,
      currentStep: store.demoState.currentStep,
      stepName: store.demoState.stepName,
      stepDescription: store.demoState.stepDescription,
      investigationCase: currentCase,
    },
    recentActivity: store.auditTrail.slice(0, 5),
    timestamp: new Date().toISOString(),
  });
});

// 2. Batches
app.get('/api/batches', (req: Request, res: Response) => {
  const batches = Array.from(store.batches.values());
  res.json(batches);
});

app.get('/api/batches/:ecoTrackId', async (req: Request, res: Response) => {
  const batch = store.batches.get(req.params.ecoTrackId);
  if (!batch) {
    return res.status(404).json({ error: 'Batch not found' });
  }
  if (!batch.qrDataUrl) {
    try {
      batch.qrDataUrl = await tools.generate_batch_qr_data_url(batch);
    } catch {
      // Ignore QR generation failure
    }
  }
  if (!batch.aiAssessment) {
    try {
      batch.aiAssessment = await tools.dynamic_ai_batch_assessment({
        material: batch.material,
        wasteCategory: batch.wasteCategory,
        initialWeightKg: batch.initialWeightKg,
        sourceType: batch.sourceType,
      });
    } catch {
      // Ignore dynamic assessment failure
    }
  }
  res.json(batch);
});

// Universal QR Code Decoder (Cases A, B, C, D)
app.post('/api/qr/decode', async (req: Request, res: Response) => {
  try {
    const { rawPayload } = req.body;
    if (!rawPayload) {
      return res.status(400).json({ error: 'rawPayload is required' });
    }
    const result = await tools.resolve_qr_payload(rawPayload);
    if (result.batch && !result.batch.qrDataUrl) {
      result.batch.qrDataUrl = await tools.generate_batch_qr_data_url(result.batch);
    }
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Dedicated Dynamic QR Generator endpoint
app.post('/api/batches/generate-qr', async (req: Request, res: Response) => {
  try {
    const {
      material = 'PET Plastic',
      wasteCategory = 'Recyclable',
      initialWeightKg = 1.8,
      unit = 'kg',
      quantityItems = 1,
      sourceType = 'household',
      contaminationNotes = '',
      locationDetails,
      collectionInfo,
      citizen,
    } = req.body;

    const cityCode = locationDetails?.city?.slice(0, 3) || 'CHN';
    const newId = tools.generate_eco_track_id(cityCode);
    const weightNum = parseFloat(initialWeightKg) || 1.8;

    const aiAssessment = await tools.dynamic_ai_batch_assessment({
      material,
      wasteCategory,
      initialWeightKg: weightNum,
      contaminationNotes,
      sourceType,
      locationName: locationDetails?.address,
    });

    const qrTarget = `https://ecoconnect.app/batch/${newId}`;

    const newBatch: any = {
      ecoTrackId: newId,
      material,
      wasteCategory,
      status: 'INGESTED',
      initialWeightKg: weightNum,
      currentWeightKg: weightNum,
      unit,
      quantityItems: parseInt(quantityItems, 10) || 1,
      sourceType,
      qrPayload: qrTarget,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      citizen: {
        citizenId: `CIT-${Math.floor(1000 + Math.random() * 9000)}`,
        name: citizen?.name || 'Citizen Depositor',
        phone: citizen?.phone || '+91 98400 00000',
        neighborhood: locationDetails?.address || 'Chennai Metro',
        greenCreditsEarned: Math.round(weightNum * 10),
      },
      smartStation: {
        stationId: `SS-${cityCode.toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`,
        stationName: collectionInfo?.collectorName ? `${collectionInfo.collectorName} Hub` : 'Smart Hub Ingest Station',
        locationName: locationDetails?.address || 'Public Collection Station',
      },
      locationDetails: locationDetails || {
        address: 'Municipal Smart Drop',
        city: 'Chennai',
        state: 'Tamil Nadu',
        country: 'India',
        lat: 13.0827,
        lng: 80.2707,
      },
      collectionInfo: collectionInfo || {
        collectorName: 'Urbaser Logistics',
        collectionMethod: 'Smart Bin Ingest',
      },
      opticalClassification: {
        detectedMaterial: material,
        confidence: aiAssessment.predictionConfidence / 100,
        contaminationDetected: aiAssessment.contaminationProbabilityPct > 5,
        contaminationPercentage: aiAssessment.contaminationProbabilityPct,
        contaminationNotes: contaminationNotes || 'Optical spectrum validated.',
        analyzedAt: new Date().toISOString(),
      },
      aiAssessment,
      custodyHistory: [
        {
          id: `CUST-${Date.now()}`,
          batchId: newId,
          stage: 'HOUSEHOLD_DEPOSIT',
          stageLabel: 'Citizen Deposit / Registered with QR',
          timestamp: new Date().toISOString(),
          location: {
            name: locationDetails?.address || 'Collection Station',
            lat: locationDetails?.lat || 13.0827,
            lng: locationDetails?.lng || 80.2707,
            address: locationDetails?.address || 'Chennai Metro Area',
            facilityCode: `SS-${cityCode.toUpperCase()}`,
          },
          handler: {
            name: citizen?.name || 'Citizen Depositor',
            role: 'Source Generator',
            facility: 'Residential / Commercial',
            badgeId: `CIT-${Date.now().toString().slice(-4)}`,
          },
          measuredWeightKg: weightNum,
          device: {
            deviceId: 'ESP32-LOAD-CELL-V2',
            type: 'ESP32_LOAD_CELL',
            batteryPct: 95,
          },
          evidence: {
            qrHash: `hash-${newId.toLowerCase()}`,
            notes: `Batch registered via dynamic QR generator. Optical rating: ${aiAssessment.recyclabilityAssessment}.`,
          },
          syncStatus: 'SYNCED',
          isVerified: true,
        },
      ],
    };

    newBatch.qrDataUrl = await tools.generate_batch_qr_data_url(newBatch);
    store.batches.set(newId, newBatch);

    store.recordAudit(
      newId,
      'BATCH_REGISTERED_DYNAMIC_QR',
      newBatch.citizen.name,
      'EcoTrack Creator',
      `Generated EcoTrack digital passport ${newId} for ${weightNum} ${unit} of ${material}.`,
      { qrTarget, aiAssessment }
    );

    res.status(201).json(newBatch);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/batches/ingest', async (req: Request, res: Response) => {
  try {
    const { material, initialWeightKg, citizenName, citizenPhone, stationName } = req.body;
    const cleanWeight = parseFloat(initialWeightKg) || 1.5;
    const newId = `EC26-CHN-${Math.floor(10000 + Math.random() * 90000)}`;

    const classification = await tools.classify_material(
      { materialHint: material || 'PET' },
      'IngestionAgent'
    );

    const newBatch: WasteBatch = {
      ecoTrackId: newId,
      material: (material as any) || 'PET Plastic',
      wasteCategory: 'Recyclable',
      status: 'INGESTED' as const,
      initialWeightKg: cleanWeight,
      currentWeightKg: cleanWeight,
      unit: 'kg',
      sourceType: 'household',
      qrPayload: `https://ecoconnect.app/batch/${newId}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      citizen: {
        citizenId: `CIT-${Math.floor(1000 + Math.random() * 9000)}`,
        name: citizenName || 'Deepak Varman',
        phone: citizenPhone || '+91 94441 55219',
        neighborhood: 'Mylapore, Chennai',
        greenCreditsEarned: Math.round(cleanWeight * 10),
      },
      smartStation: {
        stationId: 'SS-CHN-MY008',
        stationName: stationName || 'Mylapore Tank EcoStation #08',
        locationName: 'North Mada Street, Mylapore, Chennai',
      },
      opticalClassification: {
        detectedMaterial: classification.detectedMaterial as any,
        confidence: classification.confidence,
        contaminationDetected: false,
        contaminationPercentage: 1.2,
        contaminationNotes: 'Clean recyclable material, validated by Smart Station load-cell.',
        analyzedAt: new Date().toISOString(),
      },
      custodyHistory: [
        {
          id: `CUST-${Date.now()}`,
          batchId: newId,
          stage: 'HOUSEHOLD_DEPOSIT' as const,
          stageLabel: 'Citizen Deposit at Smart Station',
          timestamp: new Date().toISOString(),
          location: {
            name: stationName || 'Mylapore Tank EcoStation #08',
            lat: 13.0334,
            lng: 80.2676,
            address: 'North Mada Street, Mylapore, Chennai',
            facilityCode: 'SS-CHN-MY08',
          },
          handler: {
            name: citizenName || 'Deepak Varman',
            role: 'Citizen Depositor',
            facility: 'Residential Cluster',
            badgeId: `CIT-${Date.now().toString().slice(-4)}`,
          },
          measuredWeightKg: cleanWeight,
          device: {
            deviceId: 'ESP32-SCALE-MY08',
            type: 'ESP32_LOAD_CELL' as const,
            batteryPct: 96,
            signalStrength: '-58 dBm (WiFi)',
          },
          evidence: {
            qrHash: `hash-${newId.toLowerCase()}`,
            opticalConfidencePct: classification.confidence * 100,
            notes: 'Load cell reading verified. QR code generated and affixed.',
          },
          syncStatus: 'SYNCED' as const,
          isVerified: true,
        },
      ],
    };

    store.batches.set(newId, newBatch);
    store.recordAudit(
      newId,
      'NEW_BATCH_INGESTED',
      newBatch.citizen.name,
      'Citizen Depositor',
      `Ingested ${cleanWeight} kg of ${newBatch.material} at ${newBatch.smartStation.stationName}`
    );

    res.status(201).json(newBatch);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 3. Investigations
app.get('/api/investigations', (req: Request, res: Response) => {
  const cases = Array.from(store.investigations.values());
  res.json(cases);
});

app.get('/api/investigations/:id', (req: Request, res: Response) => {
  const inv = store.investigations.get(req.params.id);
  if (!inv) return res.status(404).json({ error: 'Investigation not found' });
  res.json(inv);
});

// Trigger investigation on demand
app.post('/api/investigations/:ecoTrackId/analyze', async (req: Request, res: Response) => {
  try {
    const id = req.params.ecoTrackId;
    const invRes = await orchestrator.runStep4_Investigation(id);
    const rcRes = await orchestrator.runStep5_RootCauseAnalysis(id);
    const planRes = await orchestrator.runStep6_RemediationPlanAndApprovalGate(id);
    res.json({
      investigation: invRes.investigation,
      rootCause: rcRes.rootCause,
      plan: planRes.plan,
      approval: planRes.approval,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 4. Human Approval Gate
app.get('/api/approvals', (req: Request, res: Response) => {
  const approvals = Array.from(store.approvals.values());
  res.json(approvals);
});

app.post('/api/approvals/:id/decide', async (req: Request, res: Response) => {
  try {
    const { decision, notes } = req.body;
    const approval = store.approvals.get(req.params.id);
    if (!approval) return res.status(404).json({ error: 'Approval request not found' });

    const result = await orchestrator.runStep7_HumanDecisionAndExecution(
      approval.ecoTrackId,
      decision,
      notes || 'Decided via Human Approval Gate dashboard'
    );

    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 5. Incident Reports
app.get('/api/reports', (req: Request, res: Response) => {
  const reports = Array.from(store.reports.values());
  res.json(reports);
});

app.get('/api/reports/:ecoTrackId', (req: Request, res: Response) => {
  const report = store.reports.get(req.params.ecoTrackId);
  if (!report) {
    return res.status(404).json({ error: 'No incident report generated for this batch yet.' });
  }
  res.json(report);
});

app.post('/api/reports/:ecoTrackId/generate', async (req: Request, res: Response) => {
  try {
    const ecoTrackId = req.params.ecoTrackId;
    const batch = store.batches.get(ecoTrackId);
    if (!batch) {
      return res.status(404).json({ error: `Batch ${ecoTrackId} not found` });
    }

    let inv = store.investigations.get(`INV-${ecoTrackId}`);
    if (!inv) {
      inv = {
        id: `INV-${ecoTrackId}`,
        ecoTrackId,
        title: `Chain of Custody & Recovery Audit for ${ecoTrackId} (${batch.material})`,
        status: 'RECOVERY_VERIFIED',
        severity: 'LOW',
        detectedAt: new Date().toISOString(),
        detectedIssues: [],
        dataSourcesConsulted: [
          'EcoTrack Ingestion Registry',
          'Facility Scales & IoT Telemetry',
          'Cryptographic Chain-of-Custody Ledger',
        ],
        rootCauseAnalysis: {
          probableCause: 'Batch processed within standard operational parameters with verified digital trail.',
          confidencePct: 98.4,
          justification: `All weighing records match optical classification and tare tolerances for ${batch.material}.`,
          inferenceMethod: 'DETERMINISTIC_HEURISTIC_RULE',
          potentialExplanations: ['Standard linear transit and verified mechanical sorting recovery'],
          evidenceSummary: {
            confirmedFacts: [
              `Initial registered weight: ${batch.initialWeightKg} kg`,
              `Current verified weight: ${batch.currentWeightKg} kg`,
              `Material classification: ${batch.material}`,
            ],
            missingOrUnverified: [],
            assumptionsExcluded: ['Discrepancy excluded: All sensor readings within certified tolerance'],
          },
        },
        remediationPlan: [],
      };
      store.investigations.set(`INV-${ecoTrackId}`, inv);
    }

    const report = await tools.generate_incident_report(ecoTrackId, inv.id, 'ReportingAgent');
    store.reports.set(ecoTrackId, report);
    res.json(report);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 6. Audit Trail
app.get('/api/audit-trail', (req: Request, res: Response) => {
  res.json(store.auditTrail);
});

// 7. Tool Call Executions
app.get('/api/tools/history', (req: Request, res: Response) => {
  res.json(store.toolExecutions);
});

app.post('/api/tools/execute', async (req: Request, res: Response) => {
  const { toolName, args } = req.body;
  try {
    let result: any;
    switch (toolName) {
      case 'get_waste_batch':
        result = await tools.get_waste_batch(args.ecoTrackId, 'ManualInteractiveToolTester');
        break;
      case 'get_custody_history':
        result = await tools.get_custody_history(args.ecoTrackId, 'ManualInteractiveToolTester');
        break;
      case 'get_weight_readings':
        result = await tools.get_weight_readings(args.ecoTrackId, 'ManualInteractiveToolTester');
        break;
      case 'get_location_events':
        result = await tools.get_location_events(args.ecoTrackId, 'ManualInteractiveToolTester');
        break;
      case 'classify_material':
        result = await tools.classify_material(args, 'ManualInteractiveToolTester');
        break;
      case 'detect_weight_anomaly':
        result = await tools.detect_weight_anomaly(args.ecoTrackId, 'ManualInteractiveToolTester');
        break;
      case 'calculate_recovery_yield':
        result = await tools.calculate_recovery_yield(args.initialWeightKg, args.verifiedRecoveredWeightKg, 'ManualInteractiveToolTester');
        break;
      case 'request_facility_evidence':
        result = await tools.request_facility_evidence(args.facilityId, args.batchId, args.evidenceType, 'ManualInteractiveToolTester');
        break;
      case 'send_notification':
        result = await tools.send_notification(args.recipient, args.channel, args.message, args.ecoTrackId, 'ManualInteractiveToolTester');
        break;
      default:
        return res.status(400).json({ error: `Tool ${toolName} not supported in direct tester.` });
    }
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 8. IoT Simulator & Telemetry
app.get('/api/iot/telemetry', (req: Request, res: Response) => {
  // Live simulated readings for sensors
  const simulatedScales = [
    {
      deviceId: 'ESP32-SCALE-BN14',
      name: 'Besant Nagar Smart Hub Load Cell',
      status: 'ONLINE',
      battery: 94,
      rssi: '-62 dBm',
      currentWeightKg: 1.80,
      tareWeightKg: 0.0,
      lastReadingTime: new Date().toISOString(),
      offlineQueuedEvents: store.offlineEventsQueue.length,
    },
    {
      deviceId: 'WEIGHBRIDGE-GD02',
      name: 'Guindy MRF Inbound Weighbridge',
      status: 'ONLINE',
      battery: 100,
      rssi: 'LAN 1Gbps',
      currentWeightKg: 1.62,
      tareWeightKg: 0.18,
      lastReadingTime: new Date(Date.now() - 3600000).toISOString(),
      offlineQueuedEvents: 0,
    },
    {
      deviceId: 'SCALE-METTLER-REC01',
      name: 'GreenLoop Maraimalai Nagar Intake Scale',
      status: 'ONLINE',
      battery: 100,
      rssi: 'LAN 1Gbps',
      currentWeightKg: 1.48,
      tareWeightKg: 0.14,
      lastReadingTime: new Date(Date.now() - 1800000).toISOString(),
      offlineQueuedEvents: 0,
    },
  ];

  res.json({
    scales: simulatedScales,
    offlineBuffer: store.offlineEventsQueue,
  });
});

app.post('/api/iot/simulate-offline', (req: Request, res: Response) => {
  const offlineEvent = {
    id: `OFFLINE-SCAN-${Date.now()}`,
    batchId: req.body.batchId || 'EC26-CHN-00182',
    stage: 'COLLECTOR_PICKUP' as const,
    stageLabel: 'Offline Collector Scan (Buffered in Local EEPROM)',
    timestamp: new Date().toISOString(),
    location: {
      name: 'Besant Nagar Mobile Truck Unit',
      lat: 13.0003,
      lng: 80.2669,
      address: 'Cellular Dead Zone, Chennai',
      facilityCode: 'TRUCK-OFFLINE-01',
    },
    handler: {
      name: 'P. Murugan',
      role: 'Collection Driver',
      facility: 'Urbaser Sumeet City Logistics',
      badgeId: 'DRV-CHN-201',
    },
    measuredWeightKg: 1.80,
    device: {
      deviceId: 'ZEBRA-OFFLINE-TC21',
      type: 'HANDHELD_SCANNER' as const,
    },
    evidence: {
      qrHash: 'offline-qr-cached-token',
      notes: 'Captured in local SQLite storage on device while out of GSM coverage.',
    },
    syncStatus: 'QUEUED_OFFLINE' as const,
    isVerified: true,
  };

  store.offlineEventsQueue.push(offlineEvent);
  store.recordAudit(
    offlineEvent.batchId,
    'OFFLINE_EVENT_BUFFERED',
    'Driver P. Murugan',
    'Collection Driver',
    `Buffered offline QR scan in handheld terminal memory (Sync pending).`
  );

  res.json({ message: 'Event buffered offline successfully.', queued: store.offlineEventsQueue.length });
});

app.post('/api/iot/sync-offline', (req: Request, res: Response) => {
  const count = store.offlineEventsQueue.length;
  if (count === 0) {
    return res.json({ message: 'No events in offline buffer to synchronize.', reconciled: 0 });
  }

  // Reconcile buffered events
  const batch = store.batches.get('EC26-CHN-00182');
  if (batch) {
    for (const evt of store.offlineEventsQueue) {
      evt.syncStatus = 'RECONCILED';
      batch.custodyHistory.splice(1, 0, evt);
      store.recordAudit(
        evt.batchId,
        'OFFLINE_EVENT_RECONCILED',
        'IoT Sync Engine',
        'Gateway Daemon',
        `Reconciled offline event ${evt.id} with central ledger. Preserved original timestamp ${evt.timestamp}.`
      );
    }
  }

  store.offlineEventsQueue = [];
  res.json({ message: `Successfully synchronized and reconciled ${count} offline events.`, reconciled: count });
});

// 9. Master Demo Scenario Controller
app.get('/api/demo/state', (req: Request, res: Response) => {
  res.json(store.demoState);
});

app.post('/api/demo/step', async (req: Request, res: Response) => {
  try {
    const result = await orchestrator.advanceDemoStep('EC26-CHN-00182');
    res.json({
      demoState: store.demoState,
      result,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/demo/run-scenario', async (req: Request, res: Response) => {
  try {
    // Run Steps 1 through 6 until pausing at the Human Approval Gate
    await orchestrator.runStep1_Ingestion('EC26-CHN-00182');
    await orchestrator.runStep2_SortingIntake('EC26-CHN-00182');
    await orchestrator.runStep3_RecyclerDiscrepancy('EC26-CHN-00182');
    await orchestrator.runStep4_Investigation('EC26-CHN-00182');
    await orchestrator.runStep5_RootCauseAnalysis('EC26-CHN-00182');
    const step6Res = await orchestrator.runStep6_RemediationPlanAndApprovalGate('EC26-CHN-00182');

    res.json({
      message: 'Demo scenario executed autonomously through Step 6. Paused at Human Approval Gate for authorized decision.',
      demoState: store.demoState,
      approvalRequest: step6Res.approval,
      plan: step6Res.plan,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/demo/reset', (req: Request, res: Response) => {
  store.seedDatabase();
  res.json({
    message: 'ECOCONNECT database & demo scenario successfully reset to pristine initial state.',
    demoState: store.demoState,
  });
});

// Vite Middleware Integration for React SPA
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true, hmr: false },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`ECOCONNECT AI Fullstack Server running on http://localhost:${port}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start ECOCONNECT server:', err);
});
