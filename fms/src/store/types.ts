export type Role = 'Creator' | 'Verifier' | 'Approver' | 'Finance' | 'Payment' | 'Auditor';

export type ModuleId =
  | 'bills'
  | 'receipts'
  | 'payments'
  | 'reconciliation'
  | 'budgets'
  | 'reports'
  | 'audit';

export type BillStatus =
  | 'Draft'
  | 'Submitted'
  | 'Under Verification'
  | 'Sent Back'
  | 'Verification Approved'
  | 'Approved'
  | 'Rejected'
  | 'Payment Processing'
  | 'Paid';

export type TaskStatus = 'Pending' | 'Completed' | 'Rejected' | 'Returned';

export type SubjectType = 'Bill' | 'Budget' | 'Receipt';

export type ActionRequired =
  | 'Verify Bill'
  | 'Approve Bill'
  | 'Process Payment'
  | 'Edit & Resubmit'
  | 'Verify Budget'
  | 'Approve Budget'
  | 'Edit & Resubmit Budget'
  | 'Verify Receipt'
  | 'Approve Receipt'
  | 'Review Receipt'
  | 'Edit & Resubmit Receipt'
  | 'Approve Cancellation';

export interface Bill {
  billId: string;
  billType: string;
  description: string;
  amount: number;
  panNumber: string;
  payeeName: string;
  bankAccount: string;
  ifsc: string;
  bankName: string;
  budgetHead: string;
  department: string;
  status: BillStatus;
  createdBy: string;
  createdByRole: Role;
  createdAt: string;
  updatedAt: string;
  attachments: { name: string; size: string }[];
  comments: BillComment[];
  history: BillHistoryEntry[];
  paymentMode?: 'RTGS' | 'NEFT' | 'Cheque';
  paymentRef?: string;
  paidAt?: string;
  budgetOverride?: { reason: string; approver: string; at: string };
  reservationId?: string;
}

export interface BillComment {
  id: string;
  user: string;
  role: Role;
  message: string;
  at: string;
}

export interface BillHistoryEntry {
  id: string;
  user: string;
  role: Role;
  action: string;
  at: string;
  detail?: string;
}

export interface Task {
  taskId: string;
  subjectType: SubjectType;
  /** Bill ID when subjectType === 'Bill' */
  billId?: string;
  /** Budget ID when subjectType === 'Budget' */
  budgetId?: string;
  /** Receipt ID when subjectType === 'Receipt' */
  receiptId?: string;
  assignedToRole: Role;
  status: TaskStatus;
  actionRequired: ActionRequired;
  createdAt: string;
  updatedAt: string;
}

/* ========================================================
   BUDGET MANAGEMENT
   ======================================================== */

export type BudgetStatus =
  | 'Draft'
  | 'Submitted'
  | 'Verified'
  | 'Approved'
  | 'Rejected'
  | 'Sent Back'
  | 'On Hold'
  | 'Locked';

export type EntityType = 'University' | 'College' | 'Department';

export interface BudgetHead {
  id: string;
  name: string;
  allocated: number;
  revised?: number;
  utilized: number;
  reserved: number;
  remarks?: string;
  /** Previous-year amount for variance comparison. */
  lastYearAmount?: number;
}

export interface BudgetComment {
  id: string;
  user: string;
  role: Role;
  message: string;
  at: string;
}

export interface BudgetHistoryEntry {
  id: string;
  user: string;
  role: Role;
  action: string;
  at: string;
  detail?: string;
}

export interface Budget {
  id: string;
  fy: string;
  name: string;
  entityType: EntityType;
  entityName: string;
  version: number;
  parentBudgetId?: string;
  status: BudgetStatus;
  heads: BudgetHead[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  submittedBy?: string;
  submittedAt?: string;
  verifiedBy?: string;
  verifiedAt?: string;
  approvedBy?: string;
  approvedAt?: string;
  rejectedReason?: string;
  comments: BudgetComment[];
  history: BudgetHistoryEntry[];
}

export interface BudgetReservation {
  id: string;
  budgetId: string;
  headName: string;
  refType: 'BILL' | 'PO';
  refId: string;
  amount: number;
  status: 'ACTIVE' | 'RELEASED' | 'CONSUMED';
  createdAt: string;
  releasedAt?: string;
}

export interface BudgetAllocation {
  id: string;
  budgetId: string;
  headName: string;
  targetEntityType: EntityType;
  targetEntityName: string;
  amount: number;
  allocatedAt: string;
  createdBy: string;
}

export interface BudgetAdjustment {
  id: string;
  budgetId: string;
  fromHead: string;
  toHead: string;
  amount: number;
  type: 'TRANSFER' | 'REALLOCATION';
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdBy: string;
  createdAt: string;
  approvedBy?: string;
  approvedAt?: string;
}

/* ========================================================
   RECEIPTS (INCOMING PAYMENTS)
   ======================================================== */

export type ReceiptStatus =
  | 'Draft'
  | 'Submitted'
  | 'Verified'
  | 'Approved'
  | 'Confirmed'
  | 'Rejected'
  | 'Sent Back'
  | 'On Hold'
  | 'Cancelled';

export type DuplicateMatchScore = 'HIGH' | 'MEDIUM' | 'LOW';

export type ReceiptSourceType = 'Student' | 'Vendor' | 'External' | 'Other';
export type ReceiptPaymentMode = 'UPI' | 'NEFT' | 'RTGS' | 'IMPS' | 'CARD' | 'CASH' | 'CHEQUE';

export interface ReceiptLine {
  id: string;
  accountHead: string;
  amount: number;
  remarks?: string;
}

export interface ReceiptComment {
  id: string;
  user: string;
  role: Role;
  message: string;
  at: string;
}

export interface ReceiptHistoryEntry {
  id: string;
  user: string;
  role: Role;
  action: string;
  at: string;
  detail?: string;
}

export interface Receipt {
  id: string;
  receiptNumber: string;
  receiptDate: string;
  entityType: EntityType;
  entityName: string;
  sourceType: ReceiptSourceType;
  sourceReferenceId?: string;
  payerName: string;
  payerIdentifier: string; // PAN / Reg No / etc.
  paymentMode: ReceiptPaymentMode;
  transactionReference: string;
  bankName?: string;
  paymentDate: string;
  instrumentDetails?: string;
  amount: number;
  lines: ReceiptLine[];
  status: ReceiptStatus;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  submittedBy?: string;
  submittedAt?: string;
  verifiedBy?: string;
  verifiedAt?: string;
  approvedBy?: string;
  approvedAt?: string;
  confirmedBy?: string;
  confirmedAt?: string;
  cancelledBy?: string;
  cancelledAt?: string;
  cancelReason?: string;
  rejectedReason?: string;
  /** Set true when system detects similar receipts (same ref / payer+amount). */
  duplicateFlag?: boolean;
  /** Highest-severity match score across detected duplicates. */
  duplicateMatchScore?: DuplicateMatchScore;
  /** Human-readable reason for the highest-severity duplicate (e.g. "Same transaction reference"). */
  duplicateReason?: string;
  comments: ReceiptComment[];
  history: ReceiptHistoryEntry[];
}

export interface ReceiptDuplicateMatch {
  receipt: Receipt;
  matchScore: DuplicateMatchScore;
  matchReason: string;
  matchedFields: { transactionReference: boolean; amount: boolean; payerIdentifier: boolean; sameDay: boolean };
}

export interface ReceiptCancellationRequest {
  id: string;
  receiptId: string;
  requestedBy: string;
  requestedAt: string;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  approvedBy?: string;
  approvedAt?: string;
  approverNote?: string;
}

/* ========================================================
   RECONCILIATION & AUDIT
   ======================================================== */

export interface ReconciliationBatch {
  batchId: string;
  fileName: string;
  uploadedAt: string;
  uploadedBy: string;
  totalTransactions: number;
  matchedCount: number;
  unmatchedCount: number;
  exceptionsCount: number;
  status: 'Uploaded' | 'Validated' | 'Matching' | 'Reconciled' | 'Exception';
  transactions: ReconTxn[];
}

export interface ReconTxn {
  id: string;
  systemTxnId: string;
  bankTxnId: string;
  amountSystem: number;
  amountBank: number;
  date: string;
  reference: string;
  matchStatus: 'Matched' | 'Unmatched' | 'Exception';
  issueType?: 'Missing' | 'Amount Mismatch' | 'Duplicate';
}

export interface AuditLog {
  id: string;
  at: string;
  user: string;
  role: Role;
  action: string;
  module: string;
  target: string;
  detail?: string;
}

export interface AppState {
  currentRole: Role | null;
  currentModule: ModuleId | null;
  currentUser: string;
  bills: Bill[];
  tasks: Task[];
  budgets: Budget[];
  reservations: BudgetReservation[];
  allocations: BudgetAllocation[];
  adjustments: BudgetAdjustment[];
  receipts: Receipt[];
  receiptCancellations: ReceiptCancellationRequest[];
  reconBatches: ReconciliationBatch[];
  auditLogs: AuditLog[];
}
