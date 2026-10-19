# ECOCONNECT AI — Agentic AI-Powered Waste Tracking & Verified Recycling Platform

**Team:** NAYASA HackLab  
**Category:** OPEN-X  
**Motto:** *From Bin to Recycling: Nothing Disappears Without a Digital Trail*

---

## 1. Problem & Innovation

Recyclable waste has historically become an untraceable black hole once placed inside municipal bins. Even when citizens diligently segregate waste, they never know if it was mixed with wet garbage, dumped, or actually converted into secondary raw materials.

**ECOCONNECT** introduces an **Amazon-style Digital Chain of Custody** powered by an **Autonomous Multi-Agent AI system**:
- **Unique EcoTrack IDs** generated at IoT smart stations upon deposit.
- **Edge AI Polymer Classification** (ESP32-CAM running quantized MobileNetV3) ensuring purity ratings.
- **Continuous IoT Load-Cell Telemetry** recording tare deductions, sorting culled waste, and transit shrinkage.
- **Autonomous Multi-Source Discrepancy Investigation** capable of reconciling MRF dispatch logs with Recycler intake receipts.
- **Strict Human-in-the-Loop Approval Gate** ensuring no consequential updates (such as official weight corrections or compliance penalties) are made without human authorization.
- **Strict Mathematical Recovery Proof**:
  $$\text{Recovery Yield} = \left(\frac{\text{Verified Recovered Material (kg)}}{\text{Initial Deposited Weight (kg)}}\right) \times 100$$
- **Cryptographic Tamper-Evident Audit Trail** chaining every actor, state change, and timestamp.

---

## 2. 9 Specialized Autonomous Agents

1. **Ingestion Agent**: Ingests new waste batches, reads calibrated IoT scale telemetry, and affixes unique EcoTrack passports.
2. **Classification Agent**: Edge optical classification (MobileNetV3) detecting polymer types (PET, HDPE, Aluminium, etc.) and contamination percentage.
3. **Anomaly Detection Agent**: Evaluates weight transitions against empirical tolerances, detecting missing transit hops and unverified recycling claims.
4. **Investigation Agent**: Queries disparate data sources (weighbridge receipts, GPS breadcrumbs, facility tare slips).
5. **Reasoning Agent**: Evidence-based root-cause analysis (powered by **Gemini 3.8 Flash** on the server with deterministic heuristic fallback).
6. **Planning Agent**: Decomposes forensic findings into prioritized, executable remediation steps with clear approval gates.
7. **Approval Agent**: Pauses consequential workflow execution until an authorized compliance officer approves or rejects with reasons.
8. **Execution Agent**: Executes approved actions, calls internal tools, and reconciles buffered offline events.
9. **Reporting Agent**: Verifies final recovery yield, compiles audit reports, and sends multi-channel citizen notifications.

---

## 3. 12 Callable Application Tools

- `get_waste_batch(ecoTrackId)`: Retrieves batch metadata, citizen origin, and optical purity.
- `get_custody_history(ecoTrackId)`: Extracts chronological hops and scan timestamps.
- `get_weight_readings(ecoTrackId)`: Compiles checkpoint weights and computes total shrinkage.
- `get_location_events(ecoTrackId)`: Maps GPS breadcrumbs and facility codes.
- `classify_material(descriptor)`: Invokes edge vision model for polymer identification.
- `detect_weight_anomaly(ecoTrackId)`: Flags transit drops and missing scans.
- `calculate_recovery_yield(initialKg, recoveredKg)`: Computes mathematical recovery yield.
- `request_facility_evidence(facilityId, batchId, evidenceType)`: Queries electronic weighbridge tare logs.
- `create_approval_request(requestData)`: Locks workflow at the Human Approval Gate.
- `update_batch_status(ecoTrackId, newStatus, reason, authorizedBy)`: Authorized state transition.
- `send_notification(recipient, channel, message, batchId)`: Dispatches citizen push / WhatsApp alerts.
- `generate_incident_report(ecoTrackId, investigationId)`: Seals forensic audit report.

---

## 4. Master Demo Scenario Walkthrough for Judges

Judges can click **"Run Demo Scenario"** or advance step-by-step using **"Next Step"**:

1. **Step 1 — Ingestion**: Batch `EC26-CHN-00182` deposited by Priya Sundaram at Besant Nagar Smart Hub #14 (1.80 kg PET plastic, 98.4% purity).
2. **Step 2 — Sorting Intake**: Guindy MRF receives batch and logs 1.62 kg (0.18 kg labels/moisture pre-culled). Notice: Collector scan is missing from the direct stream!
3. **Step 3 — Recycler Intake Discrepancy**: GreenLoop Recyclers logs 1.48 kg (0.14 kg drop in transit vs sorting dispatch). Discrepancy flagged!
4. **Step 4 — Multi-Source Investigation**: Investigation agent queries 5 disparate sources, extracts facility tare calibration slips, and detects the missing collector scan.
5. **Step 5 — Autonomous Root-Cause Analysis**: Reasoning agent determines with 89–91% confidence that 0.14 kg was lost due to secondary pre-wash label detachment and ambient moisture evaporation. Intact security seal rules out theft.
6. **Step 6 — Human Approval Gate**: Workflow **PAUSES**. A consequential update request is queued.
7. **Step 7 — Decision & Execution**: Compliance officer reviews evidence and clicks **"Approve & Execute"** (or tests "Reject & Quarantine"). Driver Murugan's buffered offline scan is reconciled into the chain of custody.
8. **Step 8 — Verified Recovery & Citizen Notification**: Extruder produces 1.20 kg clean rPET flakes. Formula yields $\left(\frac{1.20}{1.80}\right) \times 100 = 66.67\%$. Priya receives verified in-app and WhatsApp notifications with 24 Green Credits.
9. **Step 9 — Sealed Forensic Report**: Full audit-grade report compiled, exportable as JSON or printable PDF, anchored in a tamper-evident hash chain.
