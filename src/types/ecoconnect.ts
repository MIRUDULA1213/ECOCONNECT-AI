export type MaterialType =
  | 'PET Plastic'
  | 'HDPE Plastic'
  | 'Aluminium Cans'
  | 'Cardboard / Paper'
  | 'E-Waste'
  | 'Glass'
  | 'Biodegradable Food'
  | 'Custom / Other';

export type WasteCategoryType =
  | 'Recyclable'
  | 'Biodegradable'
  | 'Hazardous'
  | 'Electronic Waste'
  | 'Other';

export type CustodyStage =
  | 'HOUSEHOLD_DEPOSIT'
  | 'SMART_STATION_INGEST'
  | 'COLLECTOR_PICKUP'
  | 'IN_TRANSIT_SORTING'
  | 'SORTING_CENTRE_RECEIPT'
  | 'SORTED_AND_BALED'
  | 'IN_TRANSIT_RECYCLER'
  | 'RECYCLER_RECEIPT'
  | 'PROCESSING_AND_RECOVERY'
  | 'RECOVERY_VERIFIED';

export interface LocationRecord {
  name: string;
  lat: number;
  lng: number;
  address: string;
  city?: string;
  state?: string;
  country?: string;
  facilityCode: string;
}

export interface HandlerRecord {
  name: string;
  role: string;
  facility: string;
  badgeId: string;
}

export interface DeviceRecord {
  deviceId: string;
  type: 'ESP32_LOAD_CELL' | 'HANDHELD_SCANNER' | 'WEIGHBRIDGE_SENSOR' | 'FACILITY_SCALE';
  batteryPct?: number;
  firmwareVersion?: string;
  signalStrength?: string;
}

export interface CustodyEvidence {
  qrHash: string;
  photoUrl?: string;
  opticalConfidencePct?: number;
  receiptRef?: string;
  receiptUrl?: string;
  notes?: string;
  tareWeightKg?: number;
  grossWeightKg?: number;
}

export interface CustodyEvent {
  id: string;
  batchId: string;
  stage: CustodyStage;
  stageLabel: string;
  timestamp: string;
  location: LocationRecord;
  handler: HandlerRecord;
  measuredWeightKg: number;
  device: DeviceRecord;
  evidence: CustodyEvidence;
  syncStatus: 'SYNCED' | 'QUEUED_OFFLINE' | 'RECONCILED';
  isVerified: boolean;
  anomalyFlag?: string;
}

export interface OpticalClassificationResult {
  detectedMaterial: MaterialType;
  confidence: number;
  contaminationDetected: boolean;
  contaminationPercentage: number;
  contaminationNotes?: string;
  imageThumbnail?: string;
  analyzedAt: string;
}

export interface DynamicAiAssessment {
  predictedMaterialClass: string;
  predictedWasteCategory: WasteCategoryType;
  contaminationProbabilityPct: number;
  recyclabilityAssessment: 'HIGH_GRADE_A' | 'COMMERCIAL_GRADE_B' | 'SUBOPTIMAL_GRADE_C' | 'NON_RECYCLABLE';
  sortingRecommendation: string;
  recommendedHandling: string;
  potentialProcessingRisks: string[];
  suggestedNextAction: string;
  predictionConfidence: number;
  evidenceBasis: string[];
  evidenceType: 'Model-predicted' | 'Rule-based' | 'User-reported' | 'Sensor-measured' | 'Verified';
  modelName: string;
  analyzedAt: string;
}

export interface WasteBatch {
  ecoTrackId: string;
  material: MaterialType;
  wasteCategory?: WasteCategoryType;
  status:
    | 'ACTIVE_TRANSIT'
    | 'INVESTIGATION_PENDING'
    | 'APPROVAL_REQUIRED'
    | 'RECOVERY_VERIFIED'
    | 'DISCREPANCY_FLAGGED'
    | 'INGESTED';
  initialWeightKg: number;
  currentWeightKg: number;
  unit?: 'kg' | 'tonnes' | 'lbs';
  quantityItems?: number;
  sourceType?: 'household' | 'restaurant' | 'business' | 'institution' | 'industry';
  sortingWeightKg?: number;
  recyclerWeightKg?: number;
  verifiedRecoveryWeightKg?: number;
  recoveryYieldPct?: number;
  createdAt: string;
  updatedAt: string;
  citizen: {
    citizenId: string;
    name: string;
    phone: string;
    neighborhood: string;
    greenCreditsEarned: number;
  };
  smartStation: {
    stationId: string;
    stationName: string;
    locationName: string;
  };
  locationDetails?: {
    address: string;
    city: string;
    state: string;
    country: string;
    lat: number;
    lng: number;
  };
  collectionInfo?: {
    collectorName: string;
    collectionMethod: string;
    sortingCentreDetails?: string;
    destinationRecycler?: string;
    notes?: string;
    photoUrl?: string;
  };
  qrPayload?: string;
  qrDataUrl?: string;
  opticalClassification: OpticalClassificationResult;
  aiAssessment?: DynamicAiAssessment;
  investigationId?: string;
  custodyHistory: CustodyEvent[];
}

export interface DecodedQrResult {
  scanCase: 'CASE_A_ECOTRACK' | 'CASE_B_EXTERNAL_PAYLOAD' | 'CASE_C_EXTERNAL_URL' | 'CASE_D_INVALID';
  rawPayload: string;
  title: string;
  explanation: string;
  batchId?: string;
  batch?: WasteBatch;
  externalData?: Record<string, any>;
  externalUrl?: string;
  timestamp: string;
}

export interface DetectedIssue {
  code: string;
  label: string;
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
  details: string;
  confirmedFact: boolean;
  weightDeltaKg?: number;
}

export interface RootCauseAnalysis {
  probableCause: string;
  confidencePct: number;
  justification: string;
  inferenceMethod: 'GEMINI_LLM_MULTI_AGENT' | 'DETERMINISTIC_HEURISTIC_RULE';
  potentialExplanations: string[];
  evidenceSummary: {
    confirmedFacts: string[];
    missingOrUnverified: string[];
    assumptionsExcluded: string[];
  };
}

export interface RemediationStep {
  stepNumber: number;
  actionKey: string;
  title: string;
  description: string;
  requiresApproval: boolean;
  status: 'PENDING' | 'WAITING_APPROVAL' | 'APPROVED' | 'EXECUTING' | 'EXECUTED' | 'FAILED' | 'REJECTED' | 'SKIPPED';
  executionResult?: string;
  executedAt?: string;
  toolUsed?: string;
  autoExecutable: boolean;
}

export interface ApprovalRequest {
  id: string;
  investigationId: string;
  ecoTrackId: string;
  actionType:
    | 'CORRECT_OFFICIAL_WEIGHT'
    | 'VERIFY_RECOVERY_YIELD'
    | 'ISSUE_COMPLIANCE_ALERT'
    | 'ASSIGN_FACILITY_LIABILITY'
    | 'FINALIZE_DISCREPANCY';
  actionTypeLabel: string;
  proposedAction: string;
  reason: string;
  estimatedImpact: string;
  confidencePct: number;
  supportingEvidence: string[];
  submittedAt: string;
  decision?: 'APPROVED' | 'REJECTED' | 'MORE_EVIDENCE_REQUESTED';
  decidedBy?: string;
  decisionNotes?: string;
  decidedAt?: string;
  alternativePlan?: string;
}

export interface InvestigationCase {
  id: string;
  ecoTrackId: string;
  title: string;
  status:
    | 'INGESTED'
    | 'INVESTIGATING'
    | 'WAITING_FOR_EVIDENCE'
    | 'AWAITING_HUMAN_APPROVAL'
    | 'EXECUTING_PLAN'
    | 'RECOVERY_VERIFIED'
    | 'REJECTED_ALTERNATIVE';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  detectedAt: string;
  resolvedAt?: string;
  detectedIssues: DetectedIssue[];
  dataSourcesConsulted: string[];
  rootCauseAnalysis: RootCauseAnalysis;
  remediationPlan: RemediationStep[];
  approvalRequest?: ApprovalRequest;
  reportId?: string;
  notificationSent?: {
    channel: 'IN_APP' | 'SMS' | 'WHATSAPP';
    recipient: string;
    message: string;
    sentAt: string;
    status: 'DELIVERED' | 'SIMULATED';
  };
}

export interface ToolCallExecution {
  id: string;
  toolName: string;
  callerAgent: string;
  inputArgs: Record<string, any>;
  outputResult: Record<string, any>;
  timestamp: string;
  durationMs: number;
  status: 'SUCCESS' | 'ERROR' | 'RETRY';
  explanation: string;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  ecoTrackId: string;
  action: string;
  actor: string;
  actorRole: string;
  details: string;
  metadata?: Record<string, any>;
  previousHash: string;
  hash: string;
}

export interface IncidentReport {
  reportId: string;
  ecoTrackId: string;
  generatedAt: string;
  incidentSummary: string;
  initialBatchDetails: {
    ecoTrackId: string;
    material: MaterialType;
    initialWeightKg: number;
    depositLocation: string;
    citizenName: string;
    depositedAt: string;
  };
  chainOfCustody: CustodyEvent[];
  dataSourcesConsulted: string[];
  detectedDiscrepancies: DetectedIssue[];
  rootCause: RootCauseAnalysis;
  remediationPlan: RemediationStep[];
  humanApprovalDecisions: ApprovalRequest[];
  executedActions: {
    step: number;
    action: string;
    result: string;
    timestamp: string;
    tool: string;
  }[];
  finalRecoveryMetrics: {
    initialDepositedWeightKg: number;
    sortingWeightKg: number;
    recyclerReceivedWeightKg: number;
    verifiedRecoveredWeightKg: number;
    weightLossDeltaKg: number;
    recoveryYieldPercentage: number;
    calculationFormula: string;
    verificationStatus: 'CONFIRMED' | 'UNVERIFIED' | 'DISPUTED';
  };
  unresolvedIssues: string[];
  auditTrailExcerpt: AuditLogEntry[];
}

export interface DemoScenarioState {
  currentStep: number;
  totalSteps: number;
  stepName: string;
  stepDescription: string;
  ecoTrackId: string;
  isPlaying: boolean;
  isCompleted: boolean;
  stepHistory: {
    stepIndex: number;
    name: string;
    timestamp: string;
    completed: boolean;
    agent: string;
    detail: string;
  }[];
}
