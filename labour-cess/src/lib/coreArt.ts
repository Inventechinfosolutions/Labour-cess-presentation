import building from "@/assets/icon-3d-building.png";
import calendar from "@/assets/icon-3d-calendar-clean.png";
import clock from "@/assets/icon-3d-clock.png";
import clockRed from "@/assets/icon-3d-clock-red.png";
import envelope from "@/assets/icon-3d-envelope.png";
import file from "@/assets/icon-3d-file.png";
import govBuilding from "@/assets/icon-3d-gov-building.png";
import hardhat from "@/assets/icon-3d-hardhat-clean.png";
import mapPin from "@/assets/icon-3d-map-pin-clean.png";
import officer from "@/assets/icon-3d-officer-clean.png";
import rupee from "@/assets/icon-3d-rupee.png";
import scales from "@/assets/icon-3d-scales.png";
import users from "@/assets/icon-3d-users.png";
import wallet from "@/assets/icon-3d-wallet.png";
import folder from "@/assets/icon3d-folder.jpg";
import zoning from "@/assets/folder-zoning-solo.png";
import delay30 from "@/assets/impact-3d-delay.jpg";
import alertOfficer from "@/assets/impact-3d-visibility.jpg";
import demand from "@/assets/issue-3d-demand.jpg";
import oldDues from "@/assets/issue-3d-olddues.jpg";
import track from "@/assets/issue-3d-track.jpg";
import access from "@/assets/mw-cap-access.jpg";
import connectors from "@/assets/mw-cap-connectors.jpg";
import logs from "@/assets/mw-cap-logs.jpg";
import validation from "@/assets/mw-cap-validation.jpg";
import recon from "@/assets/proc-3d-recon.jpg";
import remit from "@/assets/proc-3d-remit.jpg";
import sheet from "@/assets/sys-3d-sheet.jpg";
import laptop from "@/assets/sys-3d-ulb.jpg";
import extPlan from "@/assets/core-ext-plan.jpg";
import extProperty from "@/assets/core-ext-property.jpg";
import extRera from "@/assets/core-ext-rera.jpg";
import extTreasury from "@/assets/core-ext-treasury.jpg";

/** 3D illustration for each capability card on the Complete CESS Management Platform slide (key: item label). */
export const CORE_ART: Record<string, string> = {
  // Intro — one per zone
  Governance: scales,
  "Other Supporting Modules": folder,
  Finance: wallet,
  Compliance: validation,
  External: connectors,
  "Audit trail": logs,
  // Governance & Control
  "Role-based access": access,
  "Organisational hierarchy": users,
  "Territory responsibility": mapPin,
  "Permissions by designation": officer,
  "Territory maps (MIS & GIS)": zoning,
  "Department · territory · user": govBuilding,

  // Other Supporting Modules
  DMS: folder,
  "E-Office": laptop,
  "Inward / Outward": envelope,
  Appeals: scales,
  Grievances: alertOfficer,
  "Exception resolution": validation,
  Meetings: calendar,

  // Finance & CESS Operations
  Demand: demand,
  Collection: wallet,
  "Remittance (30 days)": delay30,
  "Interest on delay": clockRed,
  "Old dues brought forward": oldDues,
  Reconciliation: recon,
  "Accounts / DCB": sheet,

  // Communication & Compliance
  "Alerts & escalation": alertOfficer,
  Assignment: officer,
  "Follow-up": calendar,
  Resolution: validation,

  // External Ecosystem
  "Labour CESS Portal": laptop,
  "Cash counter / QR": rupee,
  "Remittance at source (LCDRS)": remit,
  "KSK integration": connectors,
  "Khajane 2.0 (Treasury)": extTreasury,
  "K-RERA": extRera,
  "BBMP · BDA plan approvals": extPlan,
  "e-Swathu · Panchatantra": extProperty,

  // Audit Trail & Action
  "Who created or changed a project": building,
  "Who performed an assessment": hardhat,
  "Who generated a demand": demand,
  "Who recorded a payment": wallet,
  "Who uploaded a document": file,
  "What changed over time": clock,
  "Alert → Assign → Follow up → Close": track,};
