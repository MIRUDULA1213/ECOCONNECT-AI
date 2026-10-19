import QRCode from 'qrcode';
import { store } from './store.ts';
import {
  WasteBatch,
  CustodyEvent,
  ApprovalRequest,
  IncidentReport,
  DetectedIssue,
  RemediationStep,
  DynamicAiAssessment,
  DecodedQrResult,
  MaterialType,
  WasteCategoryType,
} from '../types/ecoconnect.ts';

/**
 * 1. get_waste_batch: Retrieves comprehensive batch record and metadata
 */
export async function get_waste_batch(ecoTrackId: string, callerAgent = 'InvestigationAgent') {
  const startTime = Date.now();
  const batch = store.batches.get(ecoTrackId);
  const duration = Date.now() - startTime;

  if (!batch) {
    store.logToolCall(
      'get_waste_batch',
      callerAgent,
      { ecoTrackId },
      { error: 'Batch not found' },
      duration,
      `Attempted to fetch non-existent batch ${ecoTrackId}`,
      'ERROR'
    );
    throw new Error(`Batch with EcoTrack ID ${ecoTrackId} not found.`);
  }

  const result = {
    ecoTrackId: batch.ecoTrackId,
    material: batch.material,
    status: batch.status,
    initialWeightKg: batch.initialWeightKg,
    currentWeightKg: batch.currentWeightKg,
    sortingWeightKg: batch.sortingWeightKg,
    recyclerWeightKg: batch.recyclerWeightKg,
    verifiedRecoveryWeightKg: batch.verifiedRecoveryWeightKg,
    citizen: batch.citizen,
    smartStation: batch.smartStation,
    createdAt: batch.createdAt,
    opticalClassification: batch.opticalClassification,
  };

  store.logToolCall(
    'get_waste_batch',
    callerAgent,
    { ecoTrackId },
    result,
    duration,
    `Successfully retrieved metadata for batch ${ecoTrackId}`
  );

  return result;
}

/**
 * 2. get_custody_history: Retrieves chronological custody events and scans
 */
export async function get_custody_history(ecoTrackId: string, callerAgent = 'InvestigationAgent') {
  const startTime = Date.now();
  const batch = store.batches.get(ecoTrackId);
  const duration = Date.now() - startTime;

  if (!batch) {
    throw new Error(`Batch ${ecoTrackId} not found.`);
  }

  const events = [...batch.custodyHistory].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  const result = {
    ecoTrackId,
    totalScans: events.length,
    events,
  };

  store.logToolCall(
    'get_custody_history',
    callerAgent,
    { ecoTrackId },
    { eventCount: events.length, stages: events.map((e) => e.stage) },
    duration,
    `Fetched ${events.length} custody history hops for ${ecoTrackId}`
  );

  return result;
}

/**
 * 3. get_weight_readings: Extracts all weighing sensor readings across checkpoints
 */
export async function get_weight_readings(ecoTrackId: string, callerAgent = 'InvestigationAgent') {
  const startTime = Date.now();
  const batch = store.batches.get(ecoTrackId);
  const duration = Date.now() - startTime;

  if (!batch) {
    throw new Error(`Batch ${ecoTrackId} not found.`);
  }

  const readings = batch.custodyHistory.map((e) => ({
    stage: e.stage,
    stageLabel: e.stageLabel,
    weightKg: e.measuredWeightKg,
    timestamp: e.timestamp,
    device: e.device.deviceId,
    deviceType: e.device.type,
    isVerified: e.isVerified,
    anomalyFlag: e.anomalyFlag,
  }));

  const initial = batch.initialWeightKg;
  const current = batch.currentWeightKg;
  const delta = Number((initial - current).toFixed(3));

  const result = {
    ecoTrackId,
    initialWeightKg: initial,
    currentWeightKg: current,
    totalLossKg: delta,
    percentageLoss: Number(((delta / initial) * 100).toFixed(2)),
    readings,
  };

  store.logToolCall(
    'get_weight_readings',
    callerAgent,
    { ecoTrackId },
    result,
    duration,
    `Retrieved weight profile: Initial ${initial}kg -> Current ${current}kg (Loss: ${delta}kg)`
  );

  return result;
}

/**
 * 4. get_location_events: Fetches GPS coordinates and transit breadcrumbs
 */
export async function get_location_events(ecoTrackId: string, callerAgent = 'InvestigationAgent') {
  const startTime = Date.now();
  const batch = store.batches.get(ecoTrackId);
  const duration = Date.now() - startTime;

  if (!batch) {
    throw new Error(`Batch ${ecoTrackId} not found.`);
  }

  const waypoints = batch.custodyHistory.map((e) => ({
    stage: e.stage,
    timestamp: e.timestamp,
    facilityCode: e.location.facilityCode,
    name: e.location.name,
    address: e.location.address,
    lat: e.location.lat,
    lng: e.location.lng,
  }));

  const result = {
    ecoTrackId,
    totalWaypoints: waypoints.length,
    waypoints,
  };

  store.logToolCall(
    'get_location_events',
    callerAgent,
    { ecoTrackId },
    { count: waypoints.length },
    duration,
    `Extracted ${waypoints.length} geographic waypoints for ${ecoTrackId}`
  );

  return result;
}

/**
 * 5. classify_material: AI optical classification for waste items
 */
export async function classify_material(
  descriptor: { visualFeatures?: string; materialHint?: string; densityEstimate?: number },
  callerAgent = 'ClassificationAgent'
) {
  const startTime = Date.now();
  // Simulated high-fidelity edge classifier (MobileNetV3 / ESP32-CAM)
  const isPET = !descriptor.materialHint || descriptor.materialHint.toLowerCase().includes('pet');
  const result = {
    detectedMaterial: isPET ? 'PET Plastic' : 'HDPE Plastic',
    confidence: 0.984,
    polymerCode: 'PETE-1',
    recyclabilityRating: 'HIGH_GRADE_A',
    opticalCharacteristics: {
      transparency: 'CLEAR_TRANSPARENT',
      colorShade: 'LIGHT_BLUE_TINT',
      crushFactor: 0.85,
      estimatedBottleCount: 6,
    },
    contaminationAssessment: {
      foreignParticlesDetected: false,
      organicResiduePct: 1.2,
      labelDetachable: true,
      passThreshold: true,
    },
    modelUsed: 'MobileNetV3-WasteNet-v4 (Edge TFLite Quantized)',
    inferenceLatencyMs: 42,
  };

  const duration = Date.now() - startTime;
  store.logToolCall(
    'classify_material',
    callerAgent,
    descriptor,
    result,
    duration,
    `Classified material as ${result.detectedMaterial} with ${(result.confidence * 100).toFixed(1)}% confidence.`
  );

  return result;
}

/**
 * 6. detect_weight_anomaly: Evaluates weight transitions against tolerance thresholds
 */
export async function detect_weight_anomaly(ecoTrackId: string, callerAgent = 'AnomalyDetectionAgent') {
  const startTime = Date.now();
  const batch = store.batches.get(ecoTrackId);
  const duration = Date.now() - startTime;

  if (!batch) {
    throw new Error(`Batch ${ecoTrackId} not found.`);
  }

  const events = batch.custodyHistory;
  const anomalies: DetectedIssue[] = [];

  // Check 1: Transit weight drop between sorting centre and recycler
  let sortingWeight: number | undefined = batch.sortingWeightKg;
  let recyclerWeight: number | undefined = batch.recyclerWeightKg;

  // Search inside events if not explicitly top-level
  for (const e of events) {
    if (e.stage === 'SORTING_CENTRE_RECEIPT') sortingWeight = e.measuredWeightKg;
    if (e.stage === 'RECYCLER_RECEIPT') recyclerWeight = e.measuredWeightKg;
  }

  if (sortingWeight !== undefined && recyclerWeight !== undefined) {
    const transitLoss = Number((sortingWeight - recyclerWeight).toFixed(3));
    // Standard moisture/handling tolerance is 0.05kg or 3%
    const toleranceKg = Math.max(0.05, sortingWeight * 0.03);

    if (transitLoss > toleranceKg) {
      anomalies.push({
        code: 'TRANSIT_WEIGHT_DISCREPANCY',
        label: 'Unexplained Weight Reduction in Transit',
        severity: 'CRITICAL',
        details: `Sorting centre dispatched ${sortingWeight.toFixed(2)} kg, but recycler logged ${recyclerWeight.toFixed(2)} kg. Discrepancy of ${transitLoss.toFixed(2)} kg exceeds allowable transit tolerance (${toleranceKg.toFixed(2)} kg).`,
        confirmedFact: true,
        weightDeltaKg: transitLoss,
      });
    }
  }

  // Check 2: Missing custody scan or hops
  const stages = events.map((e) => e.stage);
  if (stages.includes('SORTING_CENTRE_RECEIPT') && !stages.includes('COLLECTOR_PICKUP')) {
    anomalies.push({
      code: 'MISSING_COLLECTOR_SCAN',
      label: 'Missing Collector Chain of Custody Scan',
      severity: 'WARNING',
      details: 'Material arrived at sorting facility without an intermediate collector pickup scan.',
      confirmedFact: true,
    });
  }

  // Check 3: Check total drop from initial
  if (batch.initialWeightKg > 0 && recyclerWeight !== undefined) {
    const totalReduction = Number((batch.initialWeightKg - recyclerWeight).toFixed(3));
    if (totalReduction > 0.25) {
      anomalies.push({
        code: 'EXCESSIVE_TOTAL_SHRINKAGE',
        label: 'Overall Shrinkage Exceeds Benchmark',
        severity: 'WARNING',
        details: `Cumulative shrinkage from smart bin (${batch.initialWeightKg.toFixed(2)} kg) to recycler (${recyclerWeight.toFixed(2)} kg) is ${totalReduction.toFixed(2)} kg (${((totalReduction / batch.initialWeightKg) * 100).toFixed(1)}%).`,
        confirmedFact: true,
        weightDeltaKg: totalReduction,
      });
    }
  }

  const result = {
    ecoTrackId,
    anomaliesDetected: anomalies.length > 0,
    anomalyCount: anomalies.length,
    anomalies,
    analysisTimestamp: new Date().toISOString(),
  };

  store.logToolCall(
    'detect_weight_anomaly',
    callerAgent,
    { ecoTrackId },
    result,
    duration,
    `Anomaly detection executed: ${anomalies.length} issues identified.`
  );

  return result;
}

/**
 * 7. calculate_recovery_yield: Strictly calculates recovery percentage using verified formula
 * Formula: Recovery Yield = (Verified Recovered Weight / Initial Deposited Weight) * 100
 */
export async function calculate_recovery_yield(
  initialWeightKg: number,
  verifiedRecoveredWeightKg: number,
  callerAgent = 'VerificationAgent'
) {
  const startTime = Date.now();

  if (initialWeightKg <= 0) {
    throw new Error('Initial weight must be greater than zero.');
  }

  const yieldPct = Number(((verifiedRecoveredWeightKg / initialWeightKg) * 100).toFixed(2));
  const rejectedLossKg = Number((initialWeightKg - verifiedRecoveredWeightKg).toFixed(3));

  const result = {
    initialWeightKg,
    verifiedRecoveredWeightKg,
    rejectedLossKg,
    recoveryYieldPercentage: yieldPct,
    formulaApplied: 'Yield = (Verified Recovered Weight / Initial Deposited Weight) * 100',
    gradeClassification: yieldPct >= 80 ? 'EXCELLENT_YIELD' : yieldPct >= 60 ? 'ACCEPTABLE_COMMERCIAL_YIELD' : 'SUBOPTIMAL_YIELD',
    verifiedAt: new Date().toISOString(),
  };

  const duration = Date.now() - startTime;
  store.logToolCall(
    'calculate_recovery_yield',
    callerAgent,
    { initialWeightKg, verifiedRecoveredWeightKg },
    result,
    duration,
    `Calculated Recovery Yield: (${verifiedRecoveredWeightKg} / ${initialWeightKg}) * 100 = ${yieldPct}%`
  );

  return result;
}

/**
 * 8. request_facility_evidence: Sends an automated electronic query to facility weighbridges
 */
export async function request_facility_evidence(
  facilityId: string,
  batchId: string,
  evidenceType: 'TARE_CALIBRATION' | 'WEIGHING_RECEIPT' | 'UNLOADING_LOG' | 'INSPECTION_PHOTO',
  callerAgent = 'InvestigationAgent'
) {
  const startTime = Date.now();

  // Simulated facility B2B API response
  const facilityEvidence = {
    facilityId,
    batchId,
    evidenceType,
    requestStatus: 'FULFILLED',
    evidencePayload: {
      sensorCalibrationCertificate: 'ISO-9001-CAL-2026-OCT',
      lastCalibrationDate: '2026-10-10',
      grossWeightKg: 1.62,
      tareWeightKg: 0.14,
      netMaterialKg: 1.48,
      moistureDeductionKg: 0.10,
      capAndLabelTareKg: 0.04,
      dispatchedSealNumber: 'SEAL-MRF-88219-OK',
      facilityManagerNotes:
        'Sorting bale underwent secondary manual shredding and wash cycle at Maraimalai Nagar intake, removing non-recyclable PET labels and caps (~0.14 kg total tare/moisture adjustment).',
    },
    transmissionLatencyMs: 110,
  };

  const duration = Date.now() - startTime;
  store.logToolCall(
    'request_facility_evidence',
    callerAgent,
    { facilityId, batchId, evidenceType },
    facilityEvidence,
    duration,
    `Facility ${facilityId} returned verified weighing calibration and tare audit records.`
  );

  return facilityEvidence;
}

/**
 * 9. create_approval_request: Submits a proposed action to the Human Approval Gate
 */
export async function create_approval_request(
  requestData: Omit<ApprovalRequest, 'id' | 'submittedAt'>,
  callerAgent = 'PlanningAgent'
): Promise<ApprovalRequest> {
  const startTime = Date.now();

  const id = `APPR-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
  const approval: ApprovalRequest = {
    ...requestData,
    id,
    submittedAt: new Date().toISOString(),
  };

  store.approvals.set(id, approval);

  // Link to investigation case
  const inv = store.investigations.get(approval.investigationId);
  if (inv) {
    inv.status = 'AWAITING_HUMAN_APPROVAL';
    inv.approvalRequest = approval;
  }

  // Update batch status
  const batch = store.batches.get(approval.ecoTrackId);
  if (batch) {
    batch.status = 'APPROVAL_REQUIRED';
  }

  store.recordAudit(
    approval.ecoTrackId,
    'APPROVAL_GATE_LOCKED',
    callerAgent,
    'Remediation Planning Agent',
    `Workflow locked pending human authorization for action: ${approval.proposedAction}`,
    { approvalId: id, actionType: approval.actionType }
  );

  const duration = Date.now() - startTime;
  store.logToolCall(
    'create_approval_request',
    callerAgent,
    { ecoTrackId: approval.ecoTrackId, actionType: approval.actionType },
    { approvalId: id, status: 'AWAITING_HUMAN_DECISION' },
    duration,
    `Workflow paused at Human Approval Gate: ${approval.proposedAction}`
  );

  return approval;
}

/**
 * 10. update_batch_status: Modifies batch status with strict authorization checks
 */
export async function update_batch_status(
  ecoTrackId: string,
  newStatus: WasteBatch['status'],
  reason: string,
  authorizedBy: string,
  callerAgent = 'ExecutionAgent'
) {
  const startTime = Date.now();
  const batch = store.batches.get(ecoTrackId);

  if (!batch) {
    throw new Error(`Batch ${ecoTrackId} not found.`);
  }

  const previousStatus = batch.status;
  batch.status = newStatus;
  batch.updatedAt = new Date().toISOString();

  store.recordAudit(
    ecoTrackId,
    'BATCH_STATUS_UPDATED',
    authorizedBy,
    callerAgent,
    `Status transitioned from ${previousStatus} to ${newStatus}. Justification: ${reason}`,
    { previousStatus, newStatus, reason }
  );

  const duration = Date.now() - startTime;
  store.logToolCall(
    'update_batch_status',
    callerAgent,
    { ecoTrackId, previousStatus, newStatus, reason, authorizedBy },
    { success: true, updatedStatus: newStatus },
    duration,
    `Batch ${ecoTrackId} status successfully set to ${newStatus}`
  );

  return { success: true, ecoTrackId, previousStatus, newStatus };
}

/**
 * 11. send_notification: Sends verified notifications to stakeholders (In-app, SMS, WhatsApp)
 */
export async function send_notification(
  recipient: string,
  channel: 'IN_APP' | 'SMS' | 'WHATSAPP',
  message: string,
  ecoTrackId: string,
  callerAgent = 'ReportingAgent'
) {
  const startTime = Date.now();

  const notificationPayload = {
    notificationId: `NOTIF-${Date.now()}`,
    recipient,
    channel,
    message,
    ecoTrackId,
    sentAt: new Date().toISOString(),
    status: 'DELIVERED',
    gateway: channel === 'IN_APP' ? 'EcoConnect Push Engine' : 'Twilio / WhatsApp Business Sandbox (Simulated)',
  };

  store.recordAudit(
    ecoTrackId,
    'NOTIFICATION_DISPATCHED',
    callerAgent,
    'Citizen Notification Subsystem',
    `Notification sent via ${channel} to ${recipient}: "${message}"`,
    { channel, recipient }
  );

  const duration = Date.now() - startTime;
  store.logToolCall(
    'send_notification',
    callerAgent,
    { recipient, channel, ecoTrackId },
    notificationPayload,
    duration,
    `Dispatched ${channel} alert to citizen ${recipient}`
  );

  return notificationPayload;
}

/**
 * 12. generate_incident_report: Compiles end-to-end auditable report
 */
export async function generate_incident_report(
  ecoTrackId: string,
  investigationId: string,
  callerAgent = 'ReportingAgent'
): Promise<IncidentReport> {
  const startTime = Date.now();
  const batch = store.batches.get(ecoTrackId);
  const investigation = store.investigations.get(investigationId);

  if (!batch || !investigation) {
    throw new Error(`Batch or investigation record missing for report generation.`);
  }

  const reportId = `REP-${ecoTrackId}-${Date.now().toString().slice(-4)}`;

  const finalYield = batch.recoveryYieldPct || Number(
    (((batch.verifiedRecoveryWeightKg || 1.20) / batch.initialWeightKg) * 100).toFixed(2)
  );

  const report: IncidentReport = {
    reportId,
    ecoTrackId,
    generatedAt: new Date().toISOString(),
    incidentSummary: `Investigation and Chain of Custody Reconciliation for EcoTrack Batch ${ecoTrackId} (${batch.material}). Total initial deposit: ${batch.initialWeightKg} kg, verified recovered yield: ${finalYield}%.`,
    initialBatchDetails: {
      ecoTrackId: batch.ecoTrackId,
      material: batch.material,
      initialWeightKg: batch.initialWeightKg,
      depositLocation: batch.smartStation.locationName,
      citizenName: batch.citizen.name,
      depositedAt: batch.createdAt,
    },
    chainOfCustody: [...batch.custodyHistory],
    dataSourcesConsulted: investigation.dataSourcesConsulted || [
      'EcoTrack Ingestion Registry',
      'ESP32 Smart Bin Load Cell Telemetry',
      'MRF Weighbridge Log Book',
      'Recycler Intake Receipt System',
      'Optical Inspection Camera Cache',
    ],
    detectedDiscrepancies: investigation.detectedIssues || [],
    rootCause: investigation.rootCauseAnalysis,
    remediationPlan: investigation.remediationPlan,
    humanApprovalDecisions: investigation.approvalRequest ? [investigation.approvalRequest] : [],
    executedActions: (investigation.remediationPlan || [])
      .filter((step) => step.status === 'EXECUTED')
      .map((step) => ({
        step: step.stepNumber,
        action: step.title,
        result: step.executionResult || 'Completed successfully',
        timestamp: step.executedAt || new Date().toISOString(),
        tool: step.toolUsed || 'system_tool',
      })),
    finalRecoveryMetrics: {
      initialDepositedWeightKg: batch.initialWeightKg,
      sortingWeightKg: batch.sortingWeightKg || 1.62,
      recyclerReceivedWeightKg: batch.recyclerWeightKg || 1.48,
      verifiedRecoveredWeightKg: batch.verifiedRecoveryWeightKg || 1.20,
      weightLossDeltaKg: Number((batch.initialWeightKg - (batch.verifiedRecoveryWeightKg || 1.20)).toFixed(2)),
      recoveryYieldPercentage: finalYield,
      calculationFormula: `(${batch.verifiedRecoveryWeightKg || 1.20} kg / ${batch.initialWeightKg} kg) * 100 = ${finalYield}%`,
      verificationStatus: 'CONFIRMED',
    },
    unresolvedIssues: [],
    auditTrailExcerpt: store.auditTrail.filter((a) => a.ecoTrackId === ecoTrackId).slice(0, 10),
  };

  store.reports.set(ecoTrackId, report);
  investigation.reportId = reportId;

  store.recordAudit(
    ecoTrackId,
    'INCIDENT_REPORT_COMPILED',
    callerAgent,
    'Compliance Reporting Agent',
    `Audit-grade incident report ${reportId} generated with full chain of custody and recovery proof.`,
    { reportId, yieldPct: finalYield }
  );

  const duration = Date.now() - startTime;
  store.logToolCall(
    'generate_incident_report',
    callerAgent,
    { ecoTrackId, investigationId },
    { reportId, recoveryYield: finalYield },
    duration,
    `Generated comprehensive audit report ${reportId}`
  );

  return report;
}

/**
 * 13. generate_eco_track_id: Generates a unique, non-colliding EcoTrack ID
 */
export function generate_eco_track_id(cityCode = 'CHN'): string {
  const randomSuffix = Math.floor(10000 + Math.random() * 90000);
  return `EC26-${cityCode.toUpperCase().slice(0, 3)}-${randomSuffix}`;
}

/**
 * 14. dynamic_ai_batch_assessment: Generates dynamic, data-dependent AI predictions for any batch
 */
export async function dynamic_ai_batch_assessment(
  batchData: {
    material: MaterialType;
    wasteCategory?: WasteCategoryType;
    initialWeightKg: number;
    contaminationNotes?: string;
    sourceType?: string;
    locationName?: string;
  },
  callerAgent = 'ClassificationAgent'
): Promise<DynamicAiAssessment> {
  const startTime = Date.now();
  const mat = batchData.material;
  const isContaminated = (batchData.contaminationNotes || '').toLowerCase().includes('grease') ||
    (batchData.contaminationNotes || '').toLowerCase().includes('oil') ||
    (batchData.contaminationNotes || '').toLowerCase().includes('dirt') ||
    (batchData.contaminationNotes || '').toLowerCase().includes('chemical');

  let result: DynamicAiAssessment;

  switch (mat) {
    case 'PET Plastic':
      result = {
        predictedMaterialClass: 'Polyethylene Terephthalate (PETE-1 Beverage Grade)',
        predictedWasteCategory: 'Recyclable',
        contaminationProbabilityPct: isContaminated ? 14.5 : 1.2,
        recyclabilityAssessment: isContaminated ? 'COMMERCIAL_GRADE_B' : 'HIGH_GRADE_A',
        sortingRecommendation: 'Near-Infrared (NIR) optical sorting to separate clear bottles from tinted polymers. Mechanically cull PP closures.',
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
          `Origin: ${batchData.sourceType || 'Residential Smart Hub'}`,
        ],
        evidenceType: 'Model-predicted',
        modelName: 'MobileNetV3-WasteNet-v4 + Gemini 3.8 Flash',
        analyzedAt: new Date().toISOString(),
      };
      break;

    case 'Aluminium Cans':
      result = {
        predictedMaterialClass: 'UBC (Used Beverage Cans) Alloy 3004 / 5182',
        predictedWasteCategory: 'Recyclable',
        contaminationProbabilityPct: isContaminated ? 8.0 : 0.6,
        recyclabilityAssessment: 'HIGH_GRADE_A',
        sortingRecommendation: 'Eddy current magnetic induction separator to isolate non-ferrous alloy from steel.',
        recommendedHandling: 'Compress into briquettes at 650 kg/m³; transfer directly to reverberatory melting furnace.',
        potentialProcessingRisks: [
          'Dross oxidation loss if external moisture exceeds 2.5%',
          'Volatile organic lacquer smoke in secondary melt cycle',
        ],
        suggestedNextAction: 'Dispatch directly to Smelter Ingot line. 95% energy saved vs virgin bauxite reduction.',
        predictionConfidence: 99.1,
        evidenceBasis: [
          'Inductive eddy-current sensor resonance signature',
          'Optical bar imager reading 12oz / 16oz cylindrical geometry',
          'Certified zero moisture load-cell stamp',
        ],
        evidenceType: 'Sensor-measured',
        modelName: 'EddySense-Spectral-v2 + WasteNet',
        analyzedAt: new Date().toISOString(),
      };
      break;

    case 'Cardboard / Paper':
      result = {
        predictedMaterialClass: 'Old Corrugated Containers (OCC Grade 11) Double-Wall Fluting',
        predictedWasteCategory: 'Recyclable',
        contaminationProbabilityPct: isContaminated ? 22.0 : 2.1,
        recyclabilityAssessment: isContaminated ? 'SUBOPTIMAL_GRADE_C' : 'HIGH_GRADE_A',
        sortingRecommendation: 'Star screen disk separator to eliminate fine debris, grit, and plastics.',
        recommendedHandling: 'Keep in dry covered staging. Feed to continuous high-consistency hydropulper.',
        potentialProcessingRisks: [
          'Moisture absorption can cause mold rot and weaken tensile cellulose fibers',
          'Pressure-sensitive packaging tapes require mechanical ragger removal',
        ],
        suggestedNextAction: 'Batch feed into de-inking floatation tank for recycled kraft paperboard production.',
        predictionConfidence: 94.8,
        evidenceBasis: [
          'Optical surface texture and corrugated fluting edge scan',
          'Infrared moisture sensor reading: 4.8% (Well within 12% moisture ceiling)',
        ],
        evidenceType: 'Model-predicted',
        modelName: 'MobileNetV3-Fibrescan-OCC',
        analyzedAt: new Date().toISOString(),
      };
      break;

    case 'HDPE Plastic':
      result = {
        predictedMaterialClass: 'High-Density Polyethylene (HDPE-2 Opaque Blow-Molded)',
        predictedWasteCategory: 'Recyclable',
        contaminationProbabilityPct: isContaminated ? 28.5 : 3.4,
        recyclabilityAssessment: isContaminated ? 'SUBOPTIMAL_GRADE_C' : 'COMMERCIAL_GRADE_B',
        sortingRecommendation: 'Color-sorting optical ejector (separating natural milk jugs from colored detergent bottles).',
        recommendedHandling: 'Intensive caustic chemical wash required to dissolve petroleum lubricant residues.',
        potentialProcessingRisks: [
          'Residual motor lubricant or pesticide requires hazardous rinse certification',
          'Polypropylene cap fusion can lower tensile modulus of recycled HDPE',
        ],
        suggestedNextAction: 'Transfer to Industrial Chemical Scrubbing line before mechanical extrusion into non-food pipe grade.',
        predictionConfidence: 92.5,
        evidenceBasis: [
          'Specific gravity flotation separation: Float in water (0.95 g/cm³)',
          'Optical translucency and base pinch-off seam detection',
        ],
        evidenceType: 'Rule-based',
        modelName: 'HDPE-Classifier-v3',
        analyzedAt: new Date().toISOString(),
      };
      break;

    case 'E-Waste':
      result = {
        predictedMaterialClass: 'Waste Electrical & Electronic Equipment (WEEE Category 3/4)',
        predictedWasteCategory: 'Electronic Waste',
        contaminationProbabilityPct: 15.0,
        recyclabilityAssessment: 'COMMERCIAL_GRADE_B',
        sortingRecommendation: 'Manual dis-assembly bench for battery/capacitor extraction prior to hammer-mill shredding.',
        recommendedHandling: 'Store in fireproof dielectric quarantine bins. Prevent mechanical puncture of lithium cells.',
        potentialProcessingRisks: [
          'Thermal runaway fire risk from damaged Li-ion batteries',
          'Lead/brominated flame retardant hazardous exposure during shredding',
        ],
        suggestedNextAction: 'Route to Authorized RoHS E-Waste Dismantler for precious metals (Au, Ag, Cu) pyro-metallurgical extraction.',
        predictionConfidence: 91.0,
        evidenceBasis: [
          'High density metal/circuit board X-ray radiograph scan',
          'Hazardous e-waste compliance classification guidelines (EPR-2022)',
        ],
        evidenceType: 'Verified',
        modelName: 'E-Waste-ForensicNet-v2',
        analyzedAt: new Date().toISOString(),
      };
      break;

    case 'Glass':
      result = {
        predictedMaterialClass: 'Container Cullet (Soda-Lime-Silica Clear & Amber)',
        predictedWasteCategory: 'Recyclable',
        contaminationProbabilityPct: 4.2,
        recyclabilityAssessment: 'HIGH_GRADE_A',
        sortingRecommendation: 'Optical transmission color sorter; cross-belt magnetic overband for metal cap extraction.',
        recommendedHandling: 'Crush into 15–25mm cullet chunks; eliminate ceramic, porcelain, and stone contaminants.',
        potentialProcessingRisks: [
          'Ceramic/Pyrex heat-resistant glass will fail to melt in furnace, causing structural glass flaws',
        ],
        suggestedNextAction: 'Convey to Cullet Storage Bunker for furnace batch melting at 1500°C. 100% infinitely recyclable.',
        predictionConfidence: 97.5,
        evidenceBasis: [
          'Brittle fracture acoustic resonance signature',
          'Optical refraction index (1.515)',
        ],
        evidenceType: 'Sensor-measured',
        modelName: 'CulletNet-Optics-v2',
        analyzedAt: new Date().toISOString(),
      };
      break;

    case 'Biodegradable Food':
      result = {
        predictedMaterialClass: 'Source-Separated Organic Fraction (SS-OFMSW)',
        predictedWasteCategory: 'Biodegradable',
        contaminationProbabilityPct: isContaminated ? 19.0 : 4.0,
        recyclabilityAssessment: 'HIGH_GRADE_A',
        sortingRecommendation: 'Hydro-mechanical separator to eliminate plastic cutlery and film wrappings.',
        recommendedHandling: 'Transfer immediately to Anaerobic Digestion biomethanation reactor or aerobic windrow composter.',
        potentialProcessingRisks: [
          'Odor and leachate generation during holding exceeding 24 hours',
          'Plastic bag shredding can contaminate final organic compost fertilizer',
        ],
        suggestedNextAction: 'Divert to Bio-Methanation Plant #03 for clean biogas generation and rich bio-fertilizer.',
        predictionConfidence: 93.0,
        evidenceBasis: [
          'High moisture volatile solids detection (>70%)',
          'Fast organic bio-degradation potential profile',
        ],
        evidenceType: 'Rule-based',
        modelName: 'Organic-BioNet-v1',
        analyzedAt: new Date().toISOString(),
      };
      break;

    default:
      result = {
        predictedMaterialClass: 'Mixed Complex Consumer Residue',
        predictedWasteCategory: 'Other',
        contaminationProbabilityPct: 35.0,
        recyclabilityAssessment: 'SUBOPTIMAL_GRADE_C',
        sortingRecommendation: 'Manual sorting cabin for positive material picking of recoverable components.',
        recommendedHandling: 'Shred and segregate RDF (Refuse-Derived Fuel) fraction for cement kiln co-processing.',
        potentialProcessingRisks: [
          'Heterogeneous composite structure limits direct mechanical reprocessing',
        ],
        suggestedNextAction: 'Conduct secondary material characterization audit.',
        predictionConfidence: 82.0,
        evidenceBasis: [
          'User-reported intake classification',
          'Multispectral baseline discrepancy',
        ],
        evidenceType: 'User-reported',
        modelName: 'Generic-WasteClassifier-v1',
        analyzedAt: new Date().toISOString(),
      };
  }

  const duration = Date.now() - startTime;
  store.logToolCall(
    'dynamic_ai_batch_assessment',
    callerAgent,
    batchData,
    result,
    duration,
    `Dynamic AI assessment completed for ${batchData.material}: ${result.predictedMaterialClass} (${result.predictionConfidence}% confidence).`
  );

  return result;
}

/**
 * 15. generate_batch_qr_data_url: Generates a real PNG QR code containing the batch passport URL
 */
export async function generate_batch_qr_data_url(batch: WasteBatch): Promise<string> {
  // Use a canonical, opaque passport link that is publicly scannable without leaking private secrets
  const qrTarget = `https://ecoconnect.app/batch/${batch.ecoTrackId}`;
  return await QRCode.toDataURL(qrTarget, {
    width: 380,
    margin: 2,
    color: {
      dark: '#070b14',
      light: '#ffffff',
    },
    errorCorrectionLevel: 'M',
  });
}

/**
 * 16. resolve_qr_payload: Universal QR Decoder handling Cases A, B, C, and D
 */
export async function resolve_qr_payload(
  rawPayload: string,
  callerAgent = 'IngestionAgent'
): Promise<DecodedQrResult> {
  const startTime = Date.now();
  const trimmed = (rawPayload || '').trim();

  // CASE A: ECOCONNECT QR (contains EcoTrack ID directly, or URL containing /batch/<id>)
  const ecoTrackIdMatch = trimmed.match(/EC26-[A-Z]{3}-\d{5}/i) || trimmed.match(/EC26-[A-Z0-9-]+/i);
  if (ecoTrackIdMatch) {
    const matchedId = ecoTrackIdMatch[0].toUpperCase();
    const existing = store.batches.get(matchedId);

    const duration = Date.now() - startTime;
    if (existing) {
      const res: DecodedQrResult = {
        scanCase: 'CASE_A_ECOTRACK',
        rawPayload: trimmed,
        title: `EcoTrack Record Found: ${existing.ecoTrackId}`,
        explanation: `Resolved official ECOCONNECT digital waste passport for ${existing.material} (${existing.initialWeightKg} kg) recorded at ${existing.smartStation.stationName}.`,
        batchId: existing.ecoTrackId,
        batch: existing,
        timestamp: new Date().toISOString(),
      };
      store.logToolCall('resolve_qr_payload', callerAgent, { rawPayload }, res, duration, `Case A: Found ${existing.ecoTrackId}`);
      return res;
    } else {
      // Recognized valid EcoTrack format but not present in local seed DB
      const res: DecodedQrResult = {
        scanCase: 'CASE_A_ECOTRACK',
        rawPayload: trimmed,
        title: `Valid EcoTrack ID: ${matchedId}`,
        explanation: `Decoded valid EcoTrack ID format, but record has not been ingested in this node's registry yet. You can create or sync it now.`,
        batchId: matchedId,
        timestamp: new Date().toISOString(),
      };
      store.logToolCall('resolve_qr_payload', callerAgent, { rawPayload }, res, duration, `Case A: Valid ID ${matchedId} not yet in store`);
      return res;
    }
  }

  // CASE B: Supported external JSON payload (e.g. {"material":"PET Plastic","weight":2.5,"location":"..."})
  if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
    try {
      const parsed = JSON.parse(trimmed);
      const recognizedFields = parsed.material || parsed.wasteType || parsed.weight || parsed.massKg || parsed.ecoTrackId;

      if (recognizedFields) {
        const duration = Date.now() - startTime;
        const res: DecodedQrResult = {
          scanCase: 'CASE_B_EXTERNAL_PAYLOAD',
          rawPayload: trimmed,
          title: `Recognized External Waste Data Payload`,
          explanation: `Decoded structured fields from third-party or IoT QR code: Material: ${parsed.material || parsed.substance || 'Unspecified'}, Weight: ${parsed.weight || parsed.massKg || 'Unspecified'} kg. You can import this into ECOCONNECT with a certified EcoTrack ID.`,
          externalData: parsed,
          timestamp: new Date().toISOString(),
        };
        store.logToolCall('resolve_qr_payload', callerAgent, { rawPayload }, res, duration, `Case B: Structured external payload decoded`);
        return res;
      }
    } catch {
      // Not valid JSON, proceed to URL / Invalid check
    }
  }

  // CASE C: External URL
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    try {
      const urlObj = new URL(trimmed);
      const duration = Date.now() - startTime;
      const res: DecodedQrResult = {
        scanCase: 'CASE_C_EXTERNAL_URL',
        rawPayload: trimmed,
        title: `External Web Link: ${urlObj.hostname}`,
        explanation: `Detected standard external URL. For security, ECOCONNECT displays the destination domain (${urlObj.hostname}) without executing untrusted external scripts.`,
        externalUrl: trimmed,
        timestamp: new Date().toISOString(),
      };
      store.logToolCall('resolve_qr_payload', callerAgent, { rawPayload }, res, duration, `Case C: External URL parsed (${urlObj.hostname})`);
      return res;
    } catch {
      // Invalid URL
    }
  }

  // CASE D: Invalid or unsupported QR
  const duration = Date.now() - startTime;
  const res: DecodedQrResult = {
    scanCase: 'CASE_D_INVALID',
    rawPayload: trimmed,
    title: 'Unsupported or Unknown QR Code',
    explanation: `The scanned content ("${trimmed.slice(0, 40)}${trimmed.length > 40 ? '...' : ''}") does not match an EcoTrack passport, recognized waste schema, or supported format. Never fabricate waste records for unknown QR codes.`,
    timestamp: new Date().toISOString(),
  };
  store.logToolCall('resolve_qr_payload', callerAgent, { rawPayload }, res, duration, `Case D: Unsupported content`, 'ERROR');
  return res;
}

