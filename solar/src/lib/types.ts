export type Role = "ipp" | "officer" | "approver" | "admin" | "management";

export type ProjectStatus =
  | "Draft"
  | "Submitted"
  | "Under Review"
  | "Query Raised"
  | "Approved"
  | "Rejected"
  | "In Execution"
  | "Completed"
  | "Ready for Commissioning"
  | "Commissioning Submitted"
  | "Commissioned";


export type DocStatus = "Missing" | "Uploaded" | "Verified" | "Rejected";
export type SLAStatus = "On Track" | "At Risk" | "Breached";
export type MilestoneStatus = "Not Started" | "In Progress" | "Submitted" | "Verified" | "Completed";

export interface MilestoneProof {
  id: string;
  label: string;
  status: DocStatus;
  uploadedAt?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  org?: string;
  password: string; // mock only
}

export interface OpportunityEligibilityRow {
  criterion: string;
  mandatory: boolean;
}

export interface TermsAndConditionsRow {
  term: string;
  mandatory: boolean;
}

export interface Opportunity {
  id: string;
  code: string;
  /** Public register id assigned on publish, e.g. RAJ-solar-01 */
  referenceCode?: string;
  name: string;
  type: "Solar" | "Wind" | "Hybrid";
  /** Upper bound of eligible project capacity (MW) */
  capacityMW: number;
  /** Lower bound of eligible project capacity (MW), when set */
  capacityMinMW?: number;
  state: string;
  district: string;
  /** Street / full address captured in Location & capacity */
  locationAddress?: string;
  locationType?: "Fixed" | "Flexible";
  /** Full site address when location type is Fixed (Window & Narrative) */
  fixedSiteAddress?: string;
  /** Optional supporting upload filename (demo) for fixed-site evidence */
  fixedSiteSupportDocName?: string;
  startDate: string;
  endDate: string;
  status: "Draft" | "Published" | "Closed";
  description: string;
  landSource: "IPP Provided" | "Department Provided";
  documents: { name: string; mandatory: boolean }[];
  /** Calendar application window (YYYY-MM-DD), mirrored into startDate/endDate ISO on save */
  applicationStartDate?: string;
  applicationEndDate?: string;
  approvalTimelineDays?: number;
  /** Fixed land bank / site when land is department-provided */
  departmentFixedLocationSummary?: string;
  eligibility?: OpportunityEligibilityRow[];
  workflowMode?: "Standard" | "Custom";
  /** Human-readable chain for admin / IPP context */
  workflowChainLabel?: string;
  slaReviewDays?: number;
  slaApprovalDays?: number;
  termsAndConditions?: TermsAndConditionsRow[];
  /** Indicative target commissioning (set by admin; shown to officers). */
  expectedCommissioningDate?: string;
  /** Human-readable publisher line for the scheme record. */
  publishedBy?: string;
}

export interface Document {
  id: string;
  name: string;
  status: DocStatus;
  uploadedAt?: string;
  remark?: string;
  ippUploadSource?: "scheme" | "eligibility";
  ippMandatory?: boolean;
}

export interface Milestone {
  id: string;
  name: string;
  sequence: number;
  dueDate: string;
  progress: number;
  status: MilestoneStatus;
  /** Proof files for this milestone (execution phase) */
  proofs?: MilestoneProof[];
  /** Officer feedback when returning a milestone for correction */
  officerNote?: string;
}

export interface Query {
  id: string;
  message: string;
  raisedBy: string;
  raisedAt: string;
  response?: string;
  respondedAt?: string;
  status: "Open" | "Responded" | "Closed";
}

export interface WorkflowStep {
  name: string;
  role: Role;
  status: "completed" | "current" | "pending";
  assignee?: string;
  completedAt?: string;
}

export interface ActivityLog {
  id: string;
  user: string;
  role: Role;
  action: string;
  timestamp: string;
}

export interface Project {
  id: string;
  name: string;
  ippId: string;
  ippName: string;
  opportunityId: string;
  opportunityName: string;
  type: "Solar" | "Wind" | "Hybrid";
  capacityMW: number;
  state: string;
  district: string;
  status: ProjectStatus;
  stage: string;
  slaStatus: SLAStatus;
  slaDueDate: string;
  submittedAt?: string;
  lastUpdated: string;
  assignedOfficer?: string;
  documents: Document[];
  milestones: Milestone[];
  queries: Query[];
  workflow: WorkflowStep[];
  activity: ActivityLog[];
  remarks?: string;
  /** Officer final sign-off after project reaches Completed */
  officerClosureAt?: string;
  /**
   * Per-application desk review in the opportunity evaluation workspace
   * (side panel: approve / reject / keep pending for this line).
   */
  officerLineReview?: "Pending" | "Approved" | "Rejected";
  /** Mark this application for a batch “forward to approver” from the evaluation table. */
  officerForwardShortlist?: boolean;
  /** Timestamp when IPP submitted for final commissioning review */
  commissioningSubmittedAt?: string;
  /** Optional note from IPP when submitting for commissioning */
  commissioningNote?: string;
  /** Timestamp when officer commissioned (closed) the project */
  commissionedAt?: string;
  /** Note/issue recorded by officer when raising a commissioning issue */
  commissioningIssueNote?: string;
  /** Approver's written description / remarks captured at the moment of pre-approval. */
  approverApprovalDescription?: string;
  /** Timestamp when approver clicked Approve on the Final Approval Evaluation. */
  approverApprovedAt?: string;
  /** Timestamp when approver clicked "Send Access Allotment" to forward the offer to the IPP. */
  accessAllotmentSentAt?: string;
  /** Timestamp when the IPP accepted the access allotment offer. */
  ippAccessAcceptedAt?: string;
  /** Timestamp when the approver finalised and submitted execution milestones to the IPP. */
  approverMilestonesSubmittedAt?: string;
  /** Timestamp when IPP submits the full milestone package for officer closure review. */
  fullMilestonesSubmittedAt?: string;
  /** Timestamp when officer approves the submitted full milestone package. */
  fullMilestonesApprovedAt?: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: "info" | "warning" | "success" | "error";
  read: boolean;
  createdAt: string;
  link?: string;
}
