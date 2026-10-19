import { GoogleGenAI } from '@google/genai';
import { store } from './store.ts';
import * as tools from './agentTools.ts';
import {
  InvestigationCase,
  ApprovalRequest,
  RemediationStep,
  RootCauseAnalysis,
  CustodyEvent,
} from '../types/ecoconnect.ts';

// Server-side Gemini client initialization as required by gemini-api skill
let geminiClient: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  try {
    geminiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  } catch (err) {
    console.warn('Gemini client initialization notice:', err);
  }
}

/**
 * Executes Step 1 of the Demo Scenario:
 * Ingest new waste batch & IoT readings
 */
export async function runStep1_Ingestion(ecoTrackId = 'EC26-CHN-00182') {
  const batch = store.batches.get(ecoTrackId);
  if (!batch) throw new Error(`Batch ${ecoTrackId} not found.`);

  // Tool calls for step 1
  await tools.classify_material({ materialHint: 'PET Beverage Bottles' }, 'ClassificationAgent');
  await tools.get_waste_batch(ecoTrackId, 'IngestionAgent');

  store.recordAudit(
    ecoTrackId,
    'IOT_INGESTION_VALIDATED',
    'IngestionAgent',
    'Ingestion Agent',
    'Smart Station load cell and optical classifier verified 1.80 kg PET plastic deposit.'
  );

  store.demoState.currentStep = 1;
  store.demoState.stepName = 'Step 1: Batch & IoT Ingestion';
  store.demoState.stepDescription = `Batch ${ecoTrackId} ingested at Besant Nagar Smart Hub #14. Initial weight: 1.80 kg. Optical classification: PET Plastic (98.4% confidence).`;
  store.demoState.stepHistory.push({
    stepIndex: 1,
    name: 'Batch & IoT Ingestion',
    timestamp: new Date().toISOString(),
    completed: true,
    agent: 'IngestionAgent + ClassificationAgent',
    detail: 'Validated calibrated load-cell weight 1.80 kg and PET plastic classification.',
  });

  return { success: true, step: 1, batch };
}

/**
 * Executes Step 2 of the Demo Scenario:
 * Record collector pickup and sorting-centre scans (1.62 kg at Guindy MRF)
 */
export async function runStep2_SortingIntake(ecoTrackId = 'EC26-CHN-00182') {
  const batch = store.batches.get(ecoTrackId);
  if (!batch) throw new Error(`Batch ${ecoTrackId} not found.`);

  // Notice: Collector scan is intentionally simulated as an offline/delayed event to test investigation reasoning!
  const sortingEvent: CustodyEvent = {
    id: 'CUST-002',
    batchId: ecoTrackId,
    stage: 'SORTING_CENTRE_RECEIPT',
    stageLabel: 'Guindy Material Recovery Facility (MRF)',
    timestamp: '2026-10-18T11:20:00.000Z',
    location: {
      name: 'Guindy MRF Sorting Hub',
      lat: 13.0067,
      lng: 80.2023,
      address: 'Industrial Estate, Guindy, Chennai 600032',
      facilityCode: 'MRF-CHN-GD02',
    },
    handler: {
      name: 'M. Selvam',
      role: 'MRF Intake Inspector',
      facility: 'Guindy MRF',
      badgeId: 'EMP-MRF-881',
    },
    measuredWeightKg: 1.62,
    device: {
      deviceId: 'WEIGHBRIDGE-GD02',
      type: 'FACILITY_SCALE',
      batteryPct: 100,
    },
    evidence: {
      qrHash: 'scan-mrf-00182',
      receiptRef: 'RCP-GD-2026-0941',
      notes: 'Initial sorting culled 0.18 kg non-PET labels, residual liquids, and dirt.',
    },
    syncStatus: 'SYNCED',
    isVerified: true,
  };

  batch.custodyHistory.push(sortingEvent);
  batch.sortingWeightKg = 1.62;
  batch.currentWeightKg = 1.62;
  batch.status = 'ACTIVE_TRANSIT';
  batch.updatedAt = new Date().toISOString();

  await tools.get_custody_history(ecoTrackId, 'IngestionAgent');

  store.recordAudit(
    ecoTrackId,
    'SORTING_CENTRE_INTAKE',
    'M. Selvam',
    'MRF Intake Inspector',
    'Guindy MRF received and weighed batch: 1.62 kg (0.18 kg pre-sort deduction).'
  );

  store.demoState.currentStep = 2;
  store.demoState.stepName = 'Step 2: Sorting Centre Scan';
  store.demoState.stepDescription = 'Guindy MRF weighed batch at 1.62 kg. Notice: Collector scan is missing from direct chain!';
  store.demoState.stepHistory.push({
    stepIndex: 2,
    name: 'Sorting Centre Receipt',
    timestamp: new Date().toISOString(),
    completed: true,
    agent: 'IngestionAgent',
    detail: 'Logged 1.62 kg at Guindy MRF. Collector scan gap noted.',
  });

  return { success: true, step: 2, batch };
}

/**
 * Executes Step 3 of the Demo Scenario:
 * Recycler intake receipt with weight discrepancy (1.48 kg at GreenLoop Recyclers)
 */
export async function runStep3_RecyclerDiscrepancy(ecoTrackId = 'EC26-CHN-00182') {
  const batch = store.batches.get(ecoTrackId);
  if (!batch) throw new Error(`Batch ${ecoTrackId} not found.`);

  const recyclerEvent: CustodyEvent = {
    id: 'CUST-003',
    batchId: ecoTrackId,
    stage: 'RECYCLER_RECEIPT',
    stageLabel: 'GreenLoop Polymer Recyclers (Maraimalai Nagar)',
    timestamp: '2026-10-18T14:45:00.000Z',
    location: {
      name: 'GreenLoop Polymer Processing Plant',
      lat: 12.7934,
      lng: 80.0245,
      address: 'SIPCOT Industrial Park, Maraimalai Nagar 603209',
      facilityCode: 'REC-CHN-GL01',
    },
    handler: {
      name: 'K. Rajendran',
      role: 'Recycler Weighmaster',
      facility: 'GreenLoop Recyclers',
      badgeId: 'EMP-REC-104',
    },
    measuredWeightKg: 1.48,
    device: {
      deviceId: 'SCALE-METTLER-REC01',
      type: 'FACILITY_SCALE',
    },
    evidence: {
      qrHash: 'scan-rec-00182',
      receiptRef: 'RCP-REC-2026-4401',
      notes: 'Received bale logged at 1.48 kg net weight.',
    },
    syncStatus: 'SYNCED',
    isVerified: true,
    anomalyFlag: 'DISCREPANCY_FLAGGED',
  };

  batch.custodyHistory.push(recyclerEvent);
  batch.recyclerWeightKg = 1.48;
  batch.currentWeightKg = 1.48;
  batch.status = 'DISCREPANCY_FLAGGED';
  batch.updatedAt = new Date().toISOString();

  store.recordAudit(
    ecoTrackId,
    'RECYCLER_RECEIPT_LOGGED',
    'K. Rajendran',
    'Recycler Weighmaster',
    'Recycler logged 1.48 kg. Discrepancy detected: Sorting dispatched 1.62 kg (-0.14 kg loss).'
  );

  store.demoState.currentStep = 3;
  store.demoState.stepName = 'Step 3: Recycler Intake Discrepancy Ingested';
  store.demoState.stepDescription = 'GreenLoop Recyclers logged 1.48 kg. Discrepancy detected: 0.14 kg drop in transit from Guindy MRF.';
  store.demoState.stepHistory.push({
    stepIndex: 3,
    name: 'Recycler Receipt & Discrepancy',
    timestamp: new Date().toISOString(),
    completed: true,
    agent: 'IngestionAgent',
    detail: 'Recycler received 1.48 kg vs 1.62 kg dispatched. Weight gap triggers investigation.',
  });

  return { success: true, step: 3, batch };
}

/**
 * Executes Step 4 of the Demo Scenario:
 * Multi-Source Investigation & Anomaly Detection
 */
export async function runStep4_Investigation(ecoTrackId = 'EC26-CHN-00182') {
  // Call tools across disparate sources
  const batchData = await tools.get_waste_batch(ecoTrackId, 'InvestigationAgent');
  const custody = await tools.get_custody_history(ecoTrackId, 'InvestigationAgent');
  const weights = await tools.get_weight_readings(ecoTrackId, 'InvestigationAgent');
  const locations = await tools.get_location_events(ecoTrackId, 'InvestigationAgent');
  const anomalies = await tools.detect_weight_anomaly(ecoTrackId, 'AnomalyDetectionAgent');

  // Also query facility electronic records
  const facilityEvidence = await tools.request_facility_evidence(
    'REC-CHN-GL01',
    ecoTrackId,
    'TARE_CALIBRATION',
    'InvestigationAgent'
  );

  const investigationId = `INV-${ecoTrackId}`;
  const invCase: InvestigationCase = {
    id: investigationId,
    ecoTrackId,
    title: `Discrepancy Investigation for ${ecoTrackId} (PET Plastic)`,
    status: 'INVESTIGATING',
    severity: 'HIGH',
    detectedAt: new Date().toISOString(),
    detectedIssues: anomalies.anomalies,
    dataSourcesConsulted: [
      'Smart Station IoT Load Cell (ESP32-SCALE-BN14)',
      'Guindy MRF Weighbridge Registry (WEIGHBRIDGE-GD02)',
      'GreenLoop Recycler Intake Scale (SCALE-METTLER-REC01)',
      'Handheld GPS Transit Log',
      'Facility Tare Calibration & Moisture Audit',
    ],
    rootCauseAnalysis: {
      probableCause: 'Analyzing evidence...',
      confidencePct: 0,
      justification: 'Investigation in progress across 5 data sources.',
      inferenceMethod: 'DETERMINISTIC_HEURISTIC_RULE',
      potentialExplanations: [
        'Sorting bale tare deduction (caps, label shedding, moisture evaporation)',
        'Transit leakage or bag puncture between Guindy and Maraimalai Nagar',
        'Weighbridge calibration drift at recycler intake',
      ],
      evidenceSummary: {
        confirmedFacts: [
          `Deposited initial weight at Besant Nagar: 1.80 kg`,
          `Sorting center dispatch weight: 1.62 kg (-0.18 kg)`,
          `Recycler intake weight: 1.48 kg (-0.14 kg from sorting dispatch)`,
          `Total reduction: 0.32 kg (17.78% of initial)`,
        ],
        missingOrUnverified: [
          'Direct collector pickup scan missing between station and sorting hub',
          'Moisture sensor reading during 3-hour flatbed truck transit',
        ],
        assumptionsExcluded: [
          'Excluding theft assumption (material value < transit security cost)',
          'Excluding material substitution (optical spectrum matches PET signature)',
        ],
      },
    },
    remediationPlan: [],
  };

  store.investigations.set(investigationId, invCase);

  const batch = store.batches.get(ecoTrackId);
  if (batch) {
    batch.investigationId = investigationId;
    batch.status = 'INVESTIGATION_PENDING';
  }

  store.recordAudit(
    ecoTrackId,
    'INVESTIGATION_OPENED',
    'InvestigationAgent',
    'Multi-Source Investigation Agent',
    `Opened investigation ${investigationId}. Correlated 5 data sources and identified 2 anomalies.`
  );

  store.demoState.currentStep = 4;
  store.demoState.stepName = 'Step 4: Multi-Source Investigation';
  store.demoState.stepDescription = 'Investigation agent correlated 5 data sources. Identified 0.14 kg transit gap and missing collector scan.';
  store.demoState.stepHistory.push({
    stepIndex: 4,
    name: 'Multi-Source Investigation',
    timestamp: new Date().toISOString(),
    completed: true,
    agent: 'InvestigationAgent + AnomalyDetectionAgent',
    detail: 'Extracted weight discrepancies, requested facility tare logs, and catalogued evidence.',
  });

  return { success: true, step: 4, investigation: invCase, facilityEvidence };
}

/**
 * Executes Step 5 of the Demo Scenario:
 * Autonomous Reasoning & Probable Root-Cause Analysis (using Gemini API or transparent heuristic)
 */
export async function runStep5_RootCauseAnalysis(ecoTrackId = 'EC26-CHN-00182') {
  const inv = store.investigations.get(`INV-${ecoTrackId}`);
  if (!inv) throw new Error(`Investigation for ${ecoTrackId} not found.`);

  let rootCauseResult: RootCauseAnalysis;

  if (geminiClient && process.env.GEMINI_API_KEY) {
    try {
      const prompt = `
You are the Lead Forensic Waste Investigation Agent for ECOCONNECT AI.
Analyze the following waste batch evidence:
- EcoTrack ID: ${ecoTrackId}
- Material: PET Plastic
- Initial deposit weight: 1.80 kg (Besant Nagar Smart Hub)
- Sorting-centre weight: 1.62 kg (Guindy MRF, culled 0.18 kg caps/dirt)
- Recycler intake weight: 1.48 kg (GreenLoop Maraimalai Nagar)
- Tare/Calibration evidence from facility: Net weight 1.48 kg, secondary shredding and moisture/label wash deduction accounted for 0.14 kg.
- Missing record: Intermediate collector scan was delayed/offline.

Perform a strict evidence-based root cause analysis.
Rules:
1. Distinguish confirmed facts from inferences.
2. Calculate an honest confidence percentage (between 80% and 94%).
3. Do not invent facts.

Provide a JSON response with this exact structure:
{
  "probableCause": "Concise explanation of the primary root cause",
  "confidencePct": 88,
  "justification": "Detailed evidential reasoning",
  "potentialExplanations": ["Reason 1", "Reason 2", "Reason 3"],
  "confirmedFacts": ["Fact 1", "Fact 2", "Fact 3"],
  "missingOrUnverified": ["Missing scan or evidence"],
  "assumptionsExcluded": ["Assumptions ruled out"]
}
`;

      const geminiRes = await geminiClient.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
        },
      });

      const parsed = JSON.parse(geminiRes.text || '{}');
      rootCauseResult = {
        probableCause: parsed.probableCause || 'Moisture loss combined with mechanical label/cap detachment during transit and pre-wash intake.',
        confidencePct: parsed.confidencePct || 89,
        justification: parsed.justification || 'Electronic facility weighing logs and tare certificates confirm 0.14 kg deduction is consistent with PET label shredding and moisture evaporation.',
        inferenceMethod: 'GEMINI_LLM_MULTI_AGENT',
        potentialExplanations: parsed.potentialExplanations || [
          'Secondary label/cap separation at recycler wash plant (~0.09 kg)',
          'Moisture evaporation from wet bottles during 32°C afternoon transit (~0.05 kg)',
          'Minor calibration offset (+/- 0.01 kg tolerance)',
        ],
        evidenceSummary: {
          confirmedFacts: parsed.confirmedFacts || [
            'Initial 1.80 kg registered with calibrated ESP32 load cell (98.4% PET optical match)',
            'Guindy MRF intake weight 1.62 kg registered on certified weighbridge',
            'GreenLoop recycler scale registered 1.48 kg gross material with tare slip #RCP-REC-2026-4401',
          ],
          missingOrUnverified: parsed.missingOrUnverified || [
            'Collector truck in-transit scale reading was not captured in real time',
          ],
          assumptionsExcluded: parsed.assumptionsExcluded || [
            'Illegal diversion or material theft ruled out: seal SEAL-MRF-88219 intact upon arrival',
          ],
        },
      };
    } catch (err) {
      console.warn('Gemini reasoning fallback to deterministic engine:', err);
      rootCauseResult = getDeterministicRootCause();
    }
  } else {
    rootCauseResult = getDeterministicRootCause();
  }

  inv.rootCauseAnalysis = rootCauseResult;
  inv.status = 'INVESTIGATING';

  store.recordAudit(
    ecoTrackId,
    'ROOT_CAUSE_INFERRED',
    'ReasoningAgent',
    'Autonomous Reasoning Agent',
    `Root cause analysis completed (${rootCauseResult.confidencePct}% confidence): ${rootCauseResult.probableCause}`,
    { method: rootCauseResult.inferenceMethod, confidencePct: rootCauseResult.confidencePct }
  );

  store.demoState.currentStep = 5;
  store.demoState.stepName = 'Step 5: Autonomous Root-Cause Analysis';
  store.demoState.stepDescription = `Root cause determined (${rootCauseResult.confidencePct}% confidence): ${rootCauseResult.probableCause}`;
  store.demoState.stepHistory.push({
    stepIndex: 5,
    name: 'Autonomous Root-Cause Analysis',
    timestamp: new Date().toISOString(),
    completed: true,
    agent: `ReasoningAgent (${rootCauseResult.inferenceMethod === 'GEMINI_LLM_MULTI_AGENT' ? 'Gemini 3.8 Flash' : 'Transparent Heuristic'})`,
    detail: `Probable cause determined with ${rootCauseResult.confidencePct}% confidence. Excluded assumptions.`,
  });

  return { success: true, step: 5, rootCause: rootCauseResult };
}

function getDeterministicRootCause(): RootCauseAnalysis {
  return {
    probableCause:
      'Cumulative moisture evaporation during open-bed transit (0.05 kg) combined with automated label/cap tare adjustment at recycler wash plant (0.09 kg).',
    confidencePct: 91,
    justification:
      'Reconciliation of Guindy MRF dispatch logs with GreenLoop automated tare intake slips confirms 0.14 kg delta represents non-recyclable PET sleeve/cap separation and water evaporation. Tamper seal was verified intact.',
    inferenceMethod: 'DETERMINISTIC_HEURISTIC_RULE',
    potentialExplanations: [
      'PET shrink-sleeve label and polypropylene cap separation during secondary pre-wash (0.09 kg)',
      'Moisture evaporation from residual bottle rinses in 33°C ambient Chennai heat (0.05 kg)',
      'Allowable weighbridge sensor tolerance delta (+/- 0.015 kg)',
    ],
    evidenceSummary: {
      confirmedFacts: [
        'Initial deposit: 1.80 kg registered on ESP32 calibrated load cell (Besant Nagar Smart Station)',
        'Sorting dispatch: 1.62 kg verified on Guindy MRF weighbridge (slip #RCP-GD-2026-0941)',
        'Recycler receipt: 1.48 kg verified on Mettler Toledo scale at GreenLoop (slip #RCP-REC-2026-4401)',
        'Truck transit security seal #SEAL-MRF-88219 verified intact upon delivery',
      ],
      missingOrUnverified: [
        'Direct driver pickup scan was missing due to temporary cellular connectivity outage in Guindy corridor',
      ],
      assumptionsExcluded: [
        'Assumed material theft or dumping: Ruled out due to intact tamper seal and GPS breadcrumb consistency',
      ],
    },
  };
}

/**
 * Executes Step 6 of the Demo Scenario:
 * Autonomous Remediation Planning & Human Approval Gate (pauses for authorization)
 */
export async function runStep6_RemediationPlanAndApprovalGate(ecoTrackId = 'EC26-CHN-00182') {
  const inv = store.investigations.get(`INV-${ecoTrackId}`);
  if (!inv) throw new Error(`Investigation for ${ecoTrackId} not found.`);

  const remediationPlan: RemediationStep[] = [
    {
      stepNumber: 1,
      actionKey: 'RECONCILE_OFFLINE_SCAN',
      title: 'Retrieve and Reconcile Offline Collector Scan',
      description: 'Synchronize buffered offline QR scan from collector handheld terminal (Driver Murugan).',
      requiresApproval: false,
      autoExecutable: true,
      status: 'PENDING',
    },
    {
      stepNumber: 2,
      actionKey: 'CORRECT_OFFICIAL_WEIGHT',
      title: 'Adjust Official Net Recyclable Weight to 1.48 kg',
      description: 'Consequential update: Certify official net weight as 1.48 kg with documented 0.14 kg tare deduction.',
      requiresApproval: true,
      autoExecutable: false,
      status: 'WAITING_APPROVAL',
    },
    {
      stepNumber: 3,
      actionKey: 'VERIFY_RECOVERY_METRICS',
      title: 'Calculate and Verify Final Flake Recovery Yield',
      description: 'Audit recycler melt-down yield (1.20 kg verified clean flakes) against 1.80 kg initial deposit.',
      requiresApproval: true,
      autoExecutable: false,
      status: 'PENDING',
    },
    {
      stepNumber: 4,
      actionKey: 'DISPATCH_CITIZEN_NOTIFICATION',
      title: 'Dispatch Verified Recovery Notification to Citizen',
      description: 'Send multi-channel notification to Priya Sundaram with verifiable recovery yield proof.',
      requiresApproval: false,
      autoExecutable: true,
      status: 'PENDING',
    },
    {
      stepNumber: 5,
      actionKey: 'GENERATE_AUDIT_REPORT',
      title: 'Compile and Seal Digital Chain of Custody Incident Report',
      description: 'Generate immutable forensic report with complete cryptographic audit trail.',
      requiresApproval: false,
      autoExecutable: true,
      status: 'PENDING',
    },
  ];

  inv.remediationPlan = remediationPlan;

  // Step 6 creates the Human Approval Gate request for the consequential action (Step 2 & 3)
  const approval = await tools.create_approval_request(
    {
      investigationId: inv.id,
      ecoTrackId,
      actionType: 'CORRECT_OFFICIAL_WEIGHT',
      actionTypeLabel: 'Consequential Weight Adjustment & Verified Recovery Certification',
      proposedAction:
        'Authorize official adjustment of batch net weight to 1.48 kg, accept 0.14 kg moisture/tare reconciliation, and approve final recovery verification of 1.20 kg PET flakes.',
      reason:
        'Independent facility tare slips and intact transport seals confirm the 0.14 kg reduction represents non-recyclable label/cap cull rather than material loss.',
      estimatedImpact:
        'Prevents false shrinkage penalization of logistics partner, certifies accurate 66.67% recovery yield, and issues verified citizen green credits.',
      confidencePct: inv.rootCauseAnalysis.confidencePct,
      supportingEvidence: [
        'GreenLoop Weighbridge Tare Slip #RCP-REC-2026-4401',
        'Guindy MRF Tamper Seal Verification #SEAL-MRF-88219',
        'Optical classifier PET polymer purity rating 98.4%',
        'Offline collector scan ready for reconciliation',
      ],
    },
    'PlanningAgent'
  );

  inv.approvalRequest = approval;
  inv.status = 'AWAITING_HUMAN_APPROVAL';

  store.demoState.currentStep = 6;
  store.demoState.stepName = 'Step 6: Human Approval Gate Active';
  store.demoState.stepDescription =
    'Consequential action planned. Workflow PAUSED pending authorized human approval. Please click "Approve", "Reject", or "Request More Evidence".';
  store.demoState.stepHistory.push({
    stepIndex: 6,
    name: 'Remediation Plan & Human Gate',
    timestamp: new Date().toISOString(),
    completed: true,
    agent: 'PlanningAgent + ApprovalAgent',
    detail: 'Constructed 5-step remediation plan. Workflow locked pending human authorization.',
  });

  return { success: true, step: 6, plan: remediationPlan, approval };
}

/**
 * Executes Step 7 of the Demo Scenario:
 * Human decision (Approve / Reject / Request More Evidence) -> Execute Approved Actions
 */
export async function runStep7_HumanDecisionAndExecution(
  ecoTrackId = 'EC26-CHN-00182',
  decision: 'APPROVED' | 'REJECTED' | 'MORE_EVIDENCE_REQUESTED' = 'APPROVED',
  decisionNotes = 'Authorized by Lead Compliance Officer after reviewing tare certificates and seal records.'
) {
  const inv = store.investigations.get(`INV-${ecoTrackId}`);
  if (!inv) throw new Error(`Investigation for ${ecoTrackId} not found.`);

  const approval = inv.approvalRequest;
  if (!approval) throw new Error(`No pending approval request found for ${ecoTrackId}.`);

  approval.decision = decision;
  approval.decidedBy = 'Sarah Jenkins (Chief Sustainability Officer)';
  approval.decidedAt = new Date().toISOString();
  approval.decisionNotes = decisionNotes;

  if (decision === 'REJECTED') {
    approval.alternativePlan =
      'Action rejected: Route batch for physical re-weighing and quarantine at Maraimalai Nagar depot. Trigger secondary manual audit with logistics vendor.';
    inv.status = 'REJECTED_ALTERNATIVE';

    // Mark plan steps as rejected
    inv.remediationPlan.forEach((step) => {
      if (step.requiresApproval) step.status = 'REJECTED';
    });

    store.recordAudit(
      ecoTrackId,
      'APPROVAL_REJECTED',
      approval.decidedBy,
      'Chief Sustainability Officer',
      `Human reviewer REJECTED proposed weight correction. Triggered secondary physical audit quarantine.`,
      { notes: decisionNotes }
    );

    store.demoState.stepDescription = 'Approval REJECTED by human reviewer. Safe alternative quarantine plan triggered.';
    return { success: true, step: 7, decision: 'REJECTED', alternativePlan: approval.alternativePlan };
  }

  if (decision === 'MORE_EVIDENCE_REQUESTED') {
    inv.status = 'WAITING_FOR_EVIDENCE';
    store.recordAudit(
      ecoTrackId,
      'MORE_EVIDENCE_REQUESTED',
      approval.decidedBy,
      'Chief Sustainability Officer',
      `Human reviewer requested secondary moisture chamber sensor readings.`,
      { notes: decisionNotes }
    );
    return { success: true, step: 7, decision: 'MORE_EVIDENCE_REQUESTED' };
  }

  // --- APPROVED PATH ---
  inv.status = 'EXECUTING_PLAN';

  store.recordAudit(
    ecoTrackId,
    'APPROVAL_GRANTED',
    approval.decidedBy,
    'Chief Sustainability Officer',
    `Consequential action APPROVED: Official weight adjustment and recovery verification authorized.`,
    { notes: decisionNotes }
  );

  // Execute Step 1: Reconcile offline collector scan
  const batch = store.batches.get(ecoTrackId)!;
  const offlineCollectorEvent: CustodyEvent = {
    id: 'CUST-001B',
    batchId: ecoTrackId,
    stage: 'COLLECTOR_PICKUP',
    stageLabel: 'Collector Truck Pickup (Murugan - Truck TN-09-CB-4491)',
    timestamp: '2026-10-18T09:40:00.000Z',
    location: {
      name: 'Besant Nagar Collection Point',
      lat: 13.0003,
      lng: 80.2669,
      address: 'Besant Nagar Hub Exit, Chennai',
      facilityCode: 'TRUCK-CHN-09',
    },
    handler: {
      name: 'P. Murugan',
      role: 'Collection Driver',
      facility: 'Urbaser Sumeet City Logistics',
      badgeId: 'DRV-CHN-201',
    },
    measuredWeightKg: 1.80,
    device: {
      deviceId: 'HANDHELD-ZEBRA-09',
      type: 'HANDHELD_SCANNER',
    },
    evidence: {
      qrHash: 'drv-scan-00182-offline',
      notes: 'Buffered locally at 09:40 AM due to network dead-zone; reconciled with server at execution time.',
    },
    syncStatus: 'RECONCILED',
    isVerified: true,
  };

  // Insert into chronological order
  batch.custodyHistory.splice(1, 0, offlineCollectorEvent);

  const step1 = inv.remediationPlan.find((s) => s.actionKey === 'RECONCILE_OFFLINE_SCAN');
  if (step1) {
    step1.status = 'EXECUTED';
    step1.executionResult = 'Reconciled 1 buffered offline collector scan. Digital chain of custody restored with 0 gaps.';
    step1.executedAt = new Date().toISOString();
    step1.toolUsed = 'reconcile_offline_events';
  }

  // Execute Step 2: Consequential weight update
  await tools.update_batch_status(
    ecoTrackId,
    'ACTIVE_TRANSIT',
    'Official net weight adjusted to 1.48 kg per approved tare reconciliation.',
    approval.decidedBy,
    'ExecutionAgent'
  );

  const step2 = inv.remediationPlan.find((s) => s.actionKey === 'CORRECT_OFFICIAL_WEIGHT');
  if (step2) {
    step2.status = 'EXECUTED';
    step2.executionResult = 'Official net recyclable weight certified as 1.48 kg with documented 0.14 kg tare deduction.';
    step2.executedAt = new Date().toISOString();
    step2.toolUsed = 'update_batch_status';
  }

  store.demoState.currentStep = 7;
  store.demoState.stepName = 'Step 7: Approved Actions Executed';
  store.demoState.stepDescription =
    'Human decision APPROVED. Executed offline scan reconciliation and certified official net weight 1.48 kg.';
  store.demoState.stepHistory.push({
    stepIndex: 7,
    name: 'Approval & Execution',
    timestamp: new Date().toISOString(),
    completed: true,
    agent: 'ApprovalAgent + ExecutionAgent',
    detail: 'Approved by Chief Sustainability Officer. Executed tool calls and reconciled offline custody events.',
  });

  return { success: true, step: 7, decision: 'APPROVED' };
}

/**
 * Executes Step 8 of the Demo Scenario:
 * Verified Recovery Yield Calculation and Citizen Notification
 */
export async function runStep8_RecoveryVerification(ecoTrackId = 'EC26-CHN-00182') {
  const batch = store.batches.get(ecoTrackId);
  const inv = store.investigations.get(`INV-${ecoTrackId}`);
  if (!batch || !inv) throw new Error(`Batch or investigation record missing.`);

  // Verified recovered flake weight from melt/granulator
  const verifiedRecoveredWeightKg = 1.20;
  const initialWeightKg = batch.initialWeightKg; // 1.80 kg

  // Strictly execute the tool
  const yieldResult = await tools.calculate_recovery_yield(
    initialWeightKg,
    verifiedRecoveredWeightKg,
    'VerificationAgent'
  );

  batch.verifiedRecoveryWeightKg = verifiedRecoveredWeightKg;
  batch.recoveryYieldPct = yieldResult.recoveryYieldPercentage; // 66.67%
  batch.status = 'RECOVERY_VERIFIED';
  batch.updatedAt = new Date().toISOString();

  // Add RECOVERY_VERIFIED custody event
  const recoveryEvent: CustodyEvent = {
    id: 'CUST-004',
    batchId: ecoTrackId,
    stage: 'RECOVERY_VERIFIED',
    stageLabel: 'GreenLoop Extruder: rPET Flakes Verified',
    timestamp: new Date().toISOString(),
    location: {
      name: 'GreenLoop Polymer Granulation Bay',
      lat: 12.7934,
      lng: 80.0245,
      address: 'SIPCOT Industrial Park, Maraimalai Nagar',
      facilityCode: 'REC-CHN-GL01',
    },
    handler: {
      name: 'Dr. Anand Ramanathan',
      role: 'Certified Recovery Auditor',
      facility: 'GreenLoop Quality Assurance Lab',
      badgeId: 'AUD-ISO-901',
    },
    measuredWeightKg: verifiedRecoveredWeightKg,
    device: {
      deviceId: 'PRECISION-METTLER-GRAN01',
      type: 'FACILITY_SCALE',
    },
    evidence: {
      qrHash: 'rec-verify-00182',
      receiptRef: 'REC-CERT-2026-00182-FINAL',
      opticalConfidencePct: 99.8,
      notes: `Extruded 1.20 kg food-grade rPET granules. Verified yield = (${verifiedRecoveredWeightKg} / ${initialWeightKg}) * 100 = 66.67%. 0.28 kg melt residue/sludge safely sequestered.`,
    },
    syncStatus: 'SYNCED',
    isVerified: true,
  };

  batch.custodyHistory.push(recoveryEvent);

  const step3 = inv.remediationPlan.find((s) => s.actionKey === 'VERIFY_RECOVERY_METRICS');
  if (step3) {
    step3.status = 'EXECUTED';
    step3.executionResult = `Yield calculated: (${verifiedRecoveredWeightKg} / ${initialWeightKg}) * 100 = ${yieldResult.recoveryYieldPercentage}%. Grade: ${yieldResult.gradeClassification}`;
    step3.executedAt = new Date().toISOString();
    step3.toolUsed = 'calculate_recovery_yield';
  }

  // Dispatch Citizen Notification
  const notificationMsg = `Your EcoTrack batch ${ecoTrackId} has completed the recovery verification process. Initial weight: ${initialWeightKg.toFixed(2)} kg. Verified recovered material: ${verifiedRecoveredWeightKg.toFixed(2)} kg. Recovery yield: ${yieldResult.recoveryYieldPercentage}%. You earned 24 Green Credits!`;

  await tools.send_notification(
    batch.citizen.name,
    'IN_APP',
    notificationMsg,
    ecoTrackId,
    'ReportingAgent'
  );

  // Simulated SMS/WhatsApp push
  await tools.send_notification(
    batch.citizen.phone,
    'WHATSAPP',
    notificationMsg,
    ecoTrackId,
    'ReportingAgent'
  );

  inv.notificationSent = {
    channel: 'IN_APP',
    recipient: batch.citizen.name,
    message: notificationMsg,
    sentAt: new Date().toISOString(),
    status: 'DELIVERED',
  };

  const step4 = inv.remediationPlan.find((s) => s.actionKey === 'DISPATCH_CITIZEN_NOTIFICATION');
  if (step4) {
    step4.status = 'EXECUTED';
    step4.executionResult = `Dispatched in-app & WhatsApp verified recovery alerts to ${batch.citizen.name} (${batch.citizen.phone}).`;
    step4.executedAt = new Date().toISOString();
    step4.toolUsed = 'send_notification';
  }

  store.demoState.currentStep = 8;
  store.demoState.stepName = 'Step 8: Verified Recovery & Citizen Notification';
  store.demoState.stepDescription = `Recovery Yield verified: 66.67% (1.20 kg recovered / 1.80 kg initial). Citizen notified with 24 Green Credits.`;
  store.demoState.stepHistory.push({
    stepIndex: 8,
    name: 'Verified Recovery & Notification',
    timestamp: new Date().toISOString(),
    completed: true,
    agent: 'VerificationAgent + ReportingAgent',
    detail: `Mathematical recovery verified: (1.20 / 1.80) * 100 = 66.67%. Dispatched verified notification.`,
  });

  return { success: true, step: 8, yieldResult, notificationMsg };
}

/**
 * Executes Step 9 of the Demo Scenario:
 * Auditable Forensic Incident Report Compilation
 */
export async function runStep9_IncidentReportCompilation(ecoTrackId = 'EC26-CHN-00182') {
  const inv = store.investigations.get(`INV-${ecoTrackId}`);
  if (!inv) throw new Error(`Investigation for ${ecoTrackId} not found.`);

  const report = await tools.generate_incident_report(ecoTrackId, inv.id, 'ReportingAgent');
  inv.status = 'RECOVERY_VERIFIED';
  inv.resolvedAt = new Date().toISOString();

  const step5 = inv.remediationPlan.find((s) => s.actionKey === 'GENERATE_AUDIT_REPORT');
  if (step5) {
    step5.status = 'EXECUTED';
    step5.executionResult = `Generated report ID ${report.reportId} with 100% cryptographic audit trail validity.`;
    step5.executedAt = new Date().toISOString();
    step5.toolUsed = 'generate_incident_report';
  }

  store.demoState.currentStep = 9;
  store.demoState.isCompleted = true;
  store.demoState.stepName = 'Step 9: Auditable Report Sealed & Complete';
  store.demoState.stepDescription = `End-to-End demonstration complete! Report ${report.reportId} sealed with digital chain of custody.`;
  store.demoState.stepHistory.push({
    stepIndex: 9,
    name: 'Auditable Report Sealed',
    timestamp: new Date().toISOString(),
    completed: true,
    agent: 'ReportingAgent',
    detail: `Incident report sealed. Ready for PDF and JSON export.`,
  });

  return { success: true, step: 9, report };
}

/**
 * Helper to step forward one step in the demo sequence
 */
export async function advanceDemoStep(ecoTrackId = 'EC26-CHN-00182') {
  const current = store.demoState.currentStep;
  switch (current) {
    case 0:
      return await runStep1_Ingestion(ecoTrackId);
    case 1:
      return await runStep2_SortingIntake(ecoTrackId);
    case 2:
      return await runStep3_RecyclerDiscrepancy(ecoTrackId);
    case 3:
      return await runStep4_Investigation(ecoTrackId);
    case 4:
      return await runStep5_RootCauseAnalysis(ecoTrackId);
    case 5:
      return await runStep6_RemediationPlanAndApprovalGate(ecoTrackId);
    case 6:
      // Human decision step: default to approve unless specified
      return await runStep7_HumanDecisionAndExecution(ecoTrackId, 'APPROVED');
    case 7:
      const res8 = await runStep8_RecoveryVerification(ecoTrackId);
      store.emit('DEMO_STATE_CHANGED', store.demoState);
      return res8;
    case 8:
      const res9 = await runStep9_IncidentReportCompilation(ecoTrackId);
      store.emit('DEMO_STATE_CHANGED', store.demoState);
      return res9;
    default:
      return { success: true, message: 'Demo scenario has already completed. Reset to run again.' };
  }
}
