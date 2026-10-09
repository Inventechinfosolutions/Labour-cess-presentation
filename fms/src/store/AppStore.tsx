import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type {
  AppState,
  Bill,
  BillStatus,
  Budget,
  BudgetAdjustment,
  BudgetAllocation,
  BudgetHead,
  BudgetReservation,
  ModuleId,
  ReconciliationBatch,
  Role,
  Task,
  AuditLog,
  EntityType,
  BudgetStatus,
  SubjectType,
  Receipt,
  ReceiptCancellationRequest,
  ReceiptLine,
  ReceiptStatus,
  ReceiptSourceType,
  ReceiptPaymentMode,
  ReceiptDuplicateMatch,
  DuplicateMatchScore,
  ReconTxn,
} from './types';
import {
  initialBills,
  initialBudgets,
  initialReservations,
  initialAllocations,
  initialAdjustments,
  initialReceipts,
  initialReceiptCancellations,
  initialReconBatches,
  initialTasks,
  initialAuditLogs,
  roleUsers,
} from './mockData';

interface AppContextValue extends AppState {
  setRole: (role: Role | null) => void;
  setModule: (m: ModuleId | null) => void;
  logout: () => void;

  // Bill workflow
  createBill: (b: Omit<Bill, 'billId' | 'createdAt' | 'updatedAt' | 'status' | 'history' | 'comments' | 'createdBy' | 'createdByRole'> & { saveAs?: 'Draft' | 'Submitted' }) => Bill;
  updateBill: (billId: string, updates: Partial<Bill>) => void;
  submitBill: (billId: string) => void;
  verifierApprove: (billId: string, comment?: string) => void;
  verifierReject: (billId: string, reason: string) => void;
  verifierSendBack: (billId: string, reason: string) => void;
  financeApprove: (billId: string, override?: { reason: string }) => void;
  financeReject: (billId: string, reason: string) => void;
  processPayment: (billId: string, mode: 'RTGS' | 'NEFT' | 'Cheque', ref: string) => void;

  // Budget workflow
  createBudget: (b: {
    fy: string;
    name: string;
    entityType: EntityType;
    entityName: string;
    heads: { name: string; allocated: number; remarks?: string; lastYearAmount?: number }[];
    saveAs?: 'Draft' | 'Submitted';
    parentBudgetId?: string;
  }) => Budget;
  updateBudgetHeads: (budgetId: string, heads: BudgetHead[]) => void;
  submitBudget: (budgetId: string) => void;
  budgetVerifierForward: (budgetId: string, comment?: string) => void;
  budgetVerifierSendBack: (budgetId: string, reason: string) => void;
  budgetApproverApprove: (budgetId: string, comment?: string) => void;
  budgetApproverReject: (budgetId: string, reason: string) => void;
  budgetApproverHold: (budgetId: string, reason: string) => void;
  withdrawBudget: (budgetId: string) => void;

  // Allocation & adjustment
  createAllocation: (a: Omit<BudgetAllocation, 'id' | 'allocatedAt' | 'createdBy'>) => void;
  createAdjustment: (a: Omit<BudgetAdjustment, 'id' | 'createdAt' | 'createdBy' | 'status'>) => void;
  approveAdjustment: (id: string) => void;
  rejectAdjustment: (id: string, reason: string) => void;

  // Reservations
  reserveOnBill: (billId: string) => void;
  releaseReservationByBill: (billId: string) => void;
  consumeReservationByBill: (billId: string) => void;

  // Receipts (Incoming Payments)
  createReceipt: (data: {
    receiptDate: string;
    entityType: EntityType;
    entityName: string;
    sourceType: ReceiptSourceType;
    sourceReferenceId?: string;
    payerName: string;
    payerIdentifier: string;
    paymentMode: ReceiptPaymentMode;
    transactionReference: string;
    bankName?: string;
    paymentDate: string;
    instrumentDetails?: string;
    lines: Omit<ReceiptLine, 'id'>[];
    saveAs?: 'Draft' | 'Submitted';
  }) => Receipt;
  updateReceiptDraft: (receiptId: string, lines: ReceiptLine[]) => void;
  submitReceipt: (receiptId: string) => void;
  withdrawReceipt: (receiptId: string) => void;
  receiptVerifierForward: (receiptId: string, comment?: string) => void;
  receiptVerifierSendBack: (receiptId: string, reason: string) => void;
  /** Approver approves and forwards to Finance Officer for final review. */
  receiptApproverApprove: (receiptId: string, comment?: string) => void;
  receiptApproverReject: (receiptId: string, reason: string) => void;
  receiptApproverHold: (receiptId: string, reason: string) => void;
  receiptApproverSendBack: (receiptId: string, reason: string) => void;
  /** Finance Officer's final review = lock the receipt as Confirmed. */
  receiptFinanceConfirm: (receiptId: string, comment?: string) => void;
  receiptFinanceReject: (receiptId: string, reason: string) => void;
  /** Mark a confirmed receipt as a duplicate (creates a cancellation request automatically). */
  markReceiptAsDuplicate: (receiptId: string, againstReceiptId: string, reason: string) => void;
  // Cancellation flow (Finance Controller approves)
  requestReceiptCancellation: (receiptId: string, reason: string) => void;
  approveReceiptCancellation: (requestId: string, note?: string) => void;
  rejectReceiptCancellation: (requestId: string, note: string) => void;
  /** Detect candidate duplicates with scored matches (HIGH/MEDIUM/LOW) within last 30d. */
  detectReceiptDuplicates: (r: Pick<Receipt, 'transactionReference' | 'payerIdentifier' | 'amount' | 'id' | 'receiptDate'>) => ReceiptDuplicateMatch[];

  // Helpers / queries
  budgetForHead: (head: string) => { allocated: number; used: number; reserved: number; remaining: number; budgetId: string } | null;
  activeBudget: () => Budget | undefined;

  // Reconciliation
  uploadBatch: (fileName: string) => ReconciliationBatch;
  autoMatch: (batchId: string) => void;
  finalizeBatch: (batchId: string) => void;
  /** Payment Officer: correct Missing / Amount Mismatch by updating bank txn id and bank amount. */
  correctReconTxn: (batchId: string, txnId: string, patch: { bankTxnId: string; amountBank: number }) => void;

  // Audit
  pushAudit: (entry: Omit<AuditLog, 'id' | 'at'>) => void;

  // Helpers
  myTasks: () => Task[];
  taskCountFor: (role: Role) => number;
}

const AppContext = createContext<AppContextValue | null>(null);

const STORAGE_KEY = 'rguhs-fms-state-v7';

/** Backfill missing fields on legacy stored tasks so old persisted state still renders. */
function migrateTask(t: any): Task {
  // If subjectType missing, infer from which id is present.
  let subjectType: SubjectType = t.subjectType;
  if (!subjectType) subjectType = t.budgetId ? 'Budget' : 'Bill';
  return { ...t, subjectType };
}

function loadInitial(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        ...parsed,
        tasks: Array.isArray(parsed.tasks) ? parsed.tasks.map(migrateTask) : initialTasks,
      };
    }
  } catch (_) {}
  return {
    currentRole: null,
    currentModule: null,
    currentUser: '',
    bills: initialBills,
    tasks: initialTasks,
    budgets: initialBudgets,
    reservations: initialReservations,
    allocations: initialAllocations,
    adjustments: initialAdjustments,
    receipts: initialReceipts,
    receiptCancellations: initialReceiptCancellations,
    reconBatches: initialReconBatches,
    auditLogs: initialAuditLogs,
  };
}

const nowISO = () => new Date().toISOString();
const uid = (p: string) => `${p}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

/** After Payment edits bank reference / amount, re-derive match status (Missing vs Amount Mismatch vs Matched). */
function deriveReconTxnAfterCorrection(t: ReconTxn, bankTxnId: string, amountBank: number): ReconTxn {
  const cleanBank = bankTxnId.trim();
  const hasBank = Boolean(cleanBank && cleanBank !== '—');
  const amt = Number.isFinite(amountBank) ? Math.round(amountBank) : 0;

  if (hasBank && amt > 0 && amt === t.amountSystem) {
    return {
      ...t,
      bankTxnId: cleanBank,
      amountBank: amt,
      matchStatus: 'Matched',
      issueType: undefined,
    };
  }

  const base: ReconTxn = {
    ...t,
    bankTxnId: hasBank ? cleanBank : '—',
    amountBank: hasBank ? amt : 0,
    matchStatus: 'Exception',
  };

  if (!hasBank || amt <= 0) {
    return { ...base, issueType: 'Missing' };
  }
  return { ...base, issueType: 'Amount Mismatch' };
}

function recomputeReconMetrics(transactions: ReconTxn[]) {
  const matchedCount = transactions.filter((x) => x.matchStatus === 'Matched').length;
  const exceptionsCount = transactions.filter((x) => x.matchStatus === 'Exception').length;
  const unmatchedCount = transactions.length - matchedCount - exceptionsCount;
  return { matchedCount, unmatchedCount, exceptionsCount };
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(loadInitial);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (_) {}
  }, [state]);

  const setRole = (role: Role | null) => {
    setState((s) => ({ ...s, currentRole: role, currentUser: role ? roleUsers[role] : '' }));
  };

  const setModule = (m: ModuleId | null) => setState((s) => ({ ...s, currentModule: m }));
  const logout = () => setState((s) => ({ ...s, currentRole: null, currentUser: '', currentModule: null }));

  const pushAudit = (entry: Omit<AuditLog, 'id' | 'at'>) => {
    setState((s) => ({ ...s, auditLogs: [{ id: uid('AL'), at: nowISO(), ...entry }, ...s.auditLogs] }));
  };

  /* ===== Bill helpers ===== */
  /** Must pass current `tasks` slice from inside `setState((s) => …)` — never outer `state.tasks`. */
  const completeBillTaskFor = (
    tasks: Task[],
    bill: Bill,
    role: Role,
    status: 'Completed' | 'Rejected' | 'Returned',
  ): Task[] =>
    tasks.map((t) =>
      t.billId === bill.billId && t.assignedToRole === role && t.status === 'Pending'
        ? { ...t, status, updatedAt: nowISO() }
        : t,
    );

  const addTask = (tasks: Task[], newT: Omit<Task, 'taskId' | 'createdAt' | 'updatedAt' | 'status'>): Task[] => [
    { ...newT, taskId: uid('TASK'), createdAt: nowISO(), updatedAt: nowISO(), status: 'Pending' as const },
    ...tasks,
  ];

  const updateBillInList = (bills: Bill[], billId: string, updater: (b: Bill) => Bill): Bill[] =>
    bills.map((b) => (b.billId === billId ? updater(b) : b));


  /* ===== Active budget for reservations / validation ===== */
  const findActiveBudget = (budgets: Budget[]): Budget | undefined =>
    budgets.find((b) => b.status === 'Approved' && b.entityType === 'University') ??
    budgets.find((b) => b.status === 'Approved');

  const activeBudget = () => findActiveBudget(state.budgets);

  /* ===== Reservations on bills ===== */
  const reserveOnBill = (billId: string) => {
    setState((s) => {
      const bill = s.bills.find((b) => b.billId === billId);
      if (!bill) return s;
      const active = findActiveBudget(s.budgets);
      if (!active) return s;
      // Idempotent — if reservation exists, skip
      if (s.reservations.some((r) => r.refId === billId && r.status === 'ACTIVE')) return s;

      const reservation: BudgetReservation = {
        id: uid('RSV'),
        budgetId: active.id,
        headName: bill.budgetHead,
        refType: 'BILL',
        refId: billId,
        amount: bill.amount,
        status: 'ACTIVE',
        createdAt: nowISO(),
      };
      const budgets = s.budgets.map((b) =>
        b.id === active.id
          ? { ...b, heads: b.heads.map((h) => (h.name === bill.budgetHead ? { ...h, reserved: h.reserved + bill.amount } : h)) }
          : b,
      );
      const bills = updateBillInList(s.bills, billId, (b) => ({ ...b, reservationId: reservation.id }));
      return { ...s, reservations: [reservation, ...s.reservations], budgets, bills };
    });
  };

  const releaseReservationByBill = (billId: string) => {
    setState((s) => {
      const rsv = s.reservations.find((r) => r.refId === billId && r.status === 'ACTIVE');
      if (!rsv) return s;
      const budgets = s.budgets.map((b) =>
        b.id === rsv.budgetId
          ? { ...b, heads: b.heads.map((h) => (h.name === rsv.headName ? { ...h, reserved: Math.max(0, h.reserved - rsv.amount) } : h)) }
          : b,
      );
      const reservations = s.reservations.map((r) => (r.id === rsv.id ? { ...r, status: 'RELEASED' as const, releasedAt: nowISO() } : r));
      return { ...s, reservations, budgets };
    });
  };

  const consumeReservationByBill = (billId: string) => {
    setState((s) => {
      const rsv = s.reservations.find((r) => r.refId === billId && r.status === 'ACTIVE');
      if (!rsv) return s;
      // Move from reserved → utilized
      const budgets = s.budgets.map((b) =>
        b.id === rsv.budgetId
          ? {
              ...b,
              heads: b.heads.map((h) =>
                h.name === rsv.headName
                  ? { ...h, reserved: Math.max(0, h.reserved - rsv.amount), utilized: h.utilized + rsv.amount }
                  : h,
              ),
            }
          : b,
      );
      const reservations = s.reservations.map((r) => (r.id === rsv.id ? { ...r, status: 'CONSUMED' as const, releasedAt: nowISO() } : r));
      return { ...s, reservations, budgets };
    });
  };

  /* ===== Bill actions ===== */
  const createBill: AppContextValue['createBill'] = (data) => {
    const id = `BILL-2026-${String(Math.floor(Math.random() * 9000) + 1000)}`;
    const status: BillStatus = data.saveAs === 'Submitted' ? 'Submitted' : 'Draft';
    const userRole: Role = state.currentRole ?? 'Creator';
    const user = state.currentUser || roleUsers[userRole];
    const bill: Bill = {
      billId: id,
      billType: data.billType,
      description: data.description,
      amount: data.amount,
      panNumber: data.panNumber,
      payeeName: data.payeeName,
      bankAccount: data.bankAccount,
      ifsc: data.ifsc,
      bankName: data.bankName,
      budgetHead: data.budgetHead,
      department: data.department,
      attachments: data.attachments,
      comments: [],
      history: [
        { id: uid('H'), user, role: userRole, action: 'Created Bill', at: nowISO() },
        ...(status === 'Submitted'
          ? [{ id: uid('H'), user, role: userRole, action: 'Submitted for Verification', at: nowISO() }]
          : []),
      ],
      status,
      createdBy: user,
      createdByRole: userRole,
      createdAt: nowISO(),
      updatedAt: nowISO(),
    };
    setState((s) => {
      const bills = [bill, ...s.bills];
      let tasks = s.tasks;
      if (status === 'Submitted') {
        tasks = addTask(tasks, { subjectType: 'Bill', billId: id, assignedToRole: 'Verifier', actionRequired: 'Verify Bill' });
      }
      const auditLogs = [
        { id: uid('AL'), at: nowISO(), user, role: userRole, action: status === 'Submitted' ? 'Submitted Bill' : 'Created Draft Bill', module: 'Bills', target: id },
        ...s.auditLogs,
      ];
      return { ...s, bills, tasks, auditLogs };
    });
    if (status === 'Submitted') reserveOnBill(id);
    return bill;
  };

  const updateBill = (billId: string, updates: Partial<Bill>) => {
    setState((s) => ({
      ...s,
      bills: updateBillInList(s.bills, billId, (b) => ({ ...b, ...updates, updatedAt: nowISO() })),
    }));
  };

  const submitBill = (billId: string) => {
    const userRole: Role = state.currentRole ?? 'Creator';
    const user = state.currentUser || roleUsers[userRole];
    setState((s) => {
      const bill = s.bills.find((b) => b.billId === billId);
      if (!bill) return s;
      const bills = updateBillInList(s.bills, billId, (b) => ({
        ...b,
        status: 'Submitted',
        updatedAt: nowISO(),
        history: [...b.history, { id: uid('H'), user, role: userRole, action: 'Submitted for Verification', at: nowISO() }],
      }));
      let tasks = s.tasks.map((t) =>
        t.billId === billId && t.assignedToRole === 'Creator' && t.status === 'Pending'
          ? { ...t, status: 'Completed' as const, updatedAt: nowISO() }
          : t,
      );
      tasks = addTask(tasks, { subjectType: 'Bill', billId, assignedToRole: 'Verifier', actionRequired: 'Verify Bill' });
      const auditLogs = [{ id: uid('AL'), at: nowISO(), user, role: userRole, action: 'Submitted Bill', module: 'Bills', target: billId }, ...s.auditLogs];
      return { ...s, bills, tasks, auditLogs };
    });
    reserveOnBill(billId);
  };

  const verifierApprove: AppContextValue['verifierApprove'] = (billId, comment) => {
    const user = state.currentUser || roleUsers.Verifier;
    setState((s) => {
      const bill = s.bills.find((b) => b.billId === billId);
      if (!bill) return s;
      const bills = updateBillInList(s.bills, billId, (b) => ({
        ...b,
        status: 'Verification Approved',
        updatedAt: nowISO(),
        comments: comment ? [...b.comments, { id: uid('C'), user, role: 'Verifier', message: comment, at: nowISO() }] : b.comments,
        history: [...b.history, { id: uid('H'), user, role: 'Verifier', action: 'Verified & Forwarded to Finance', at: nowISO() }],
      }));
      let tasks = completeBillTaskFor(s.tasks, bill, 'Verifier', 'Completed');
      tasks = addTask(tasks, { subjectType: 'Bill', billId, assignedToRole: 'Finance', actionRequired: 'Approve Bill' });
      const auditLogs = [{ id: uid('AL'), at: nowISO(), user, role: 'Verifier' as Role, action: 'Verified Bill', module: 'Bills', target: billId }, ...s.auditLogs];
      return { ...s, bills, tasks, auditLogs };
    });
  };

  const verifierReject: AppContextValue['verifierReject'] = (billId, reason) => {
    const user = state.currentUser || roleUsers.Verifier;
    setState((s) => {
      const bill = s.bills.find((b) => b.billId === billId);
      if (!bill) return s;
      const bills = updateBillInList(s.bills, billId, (b) => ({
        ...b,
        status: 'Rejected',
        updatedAt: nowISO(),
        comments: [...b.comments, { id: uid('C'), user, role: 'Verifier', message: reason, at: nowISO() }],
        history: [...b.history, { id: uid('H'), user, role: 'Verifier', action: 'Rejected', at: nowISO(), detail: reason }],
      }));
      const tasks = completeBillTaskFor(s.tasks, bill, 'Verifier', 'Rejected');
      const auditLogs = [{ id: uid('AL'), at: nowISO(), user, role: 'Verifier' as Role, action: 'Rejected Bill', module: 'Bills', target: billId, detail: reason }, ...s.auditLogs];
      return { ...s, bills, tasks, auditLogs };
    });
    releaseReservationByBill(billId);
  };

  const verifierSendBack: AppContextValue['verifierSendBack'] = (billId, reason) => {
    const user = state.currentUser || roleUsers.Verifier;
    setState((s) => {
      const bill = s.bills.find((b) => b.billId === billId);
      if (!bill) return s;
      const bills = updateBillInList(s.bills, billId, (b) => ({
        ...b,
        status: 'Sent Back',
        updatedAt: nowISO(),
        comments: [...b.comments, { id: uid('C'), user, role: 'Verifier', message: reason, at: nowISO() }],
        history: [...b.history, { id: uid('H'), user, role: 'Verifier', action: 'Sent Back', at: nowISO(), detail: reason }],
      }));
      let tasks = completeBillTaskFor(s.tasks, bill, 'Verifier', 'Returned');
      tasks = addTask(tasks, { subjectType: 'Bill', billId, assignedToRole: 'Creator', actionRequired: 'Edit & Resubmit' });
      const auditLogs = [{ id: uid('AL'), at: nowISO(), user, role: 'Verifier' as Role, action: 'Sent Back Bill', module: 'Bills', target: billId, detail: reason }, ...s.auditLogs];
      return { ...s, bills, tasks, auditLogs };
    });
  };

  const financeApprove: AppContextValue['financeApprove'] = (billId, override) => {
    const user = state.currentUser || roleUsers.Finance;
    setState((s) => {
      const bill = s.bills.find((b) => b.billId === billId);
      if (!bill) return s;
      const bills = updateBillInList(s.bills, billId, (b) => ({
        ...b,
        status: 'Approved',
        updatedAt: nowISO(),
        budgetOverride: override ? { reason: override.reason, approver: user, at: nowISO() } : b.budgetOverride,
        history: [...b.history, { id: uid('H'), user, role: 'Finance', action: override ? 'Approved (Budget Override)' : 'Approved', at: nowISO(), detail: override?.reason }],
      }));
      let tasks = completeBillTaskFor(s.tasks, bill, 'Finance', 'Completed');
      tasks = addTask(tasks, { subjectType: 'Bill', billId, assignedToRole: 'Payment', actionRequired: 'Process Payment' });
      const auditLogs = [{ id: uid('AL'), at: nowISO(), user, role: 'Finance' as Role, action: override ? 'Approved (Override)' : 'Approved Bill', module: 'Bills', target: billId, detail: override?.reason }, ...s.auditLogs];
      return { ...s, bills, tasks, auditLogs };
    });
  };

  const financeReject: AppContextValue['financeReject'] = (billId, reason) => {
    const user = state.currentUser || roleUsers.Finance;
    setState((s) => {
      const bill = s.bills.find((b) => b.billId === billId);
      if (!bill) return s;
      const bills = updateBillInList(s.bills, billId, (b) => ({
        ...b,
        status: 'Rejected',
        updatedAt: nowISO(),
        comments: [...b.comments, { id: uid('C'), user, role: 'Finance', message: reason, at: nowISO() }],
        history: [...b.history, { id: uid('H'), user, role: 'Finance', action: 'Rejected', at: nowISO(), detail: reason }],
      }));
      const tasks = completeBillTaskFor(s.tasks, bill, 'Finance', 'Rejected');
      const auditLogs = [{ id: uid('AL'), at: nowISO(), user, role: 'Finance' as Role, action: 'Rejected Bill', module: 'Bills', target: billId, detail: reason }, ...s.auditLogs];
      return { ...s, bills, tasks, auditLogs };
    });
    releaseReservationByBill(billId);
  };

  const processPayment: AppContextValue['processPayment'] = (billId, mode, ref) => {
    const user = state.currentUser || roleUsers.Payment;
    setState((s) => {
      const bill = s.bills.find((b) => b.billId === billId);
      if (!bill) return s;
      const bills = updateBillInList(s.bills, billId, (b) => ({
        ...b,
        status: 'Paid',
        updatedAt: nowISO(),
        paymentMode: mode,
        paymentRef: ref,
        paidAt: nowISO(),
        history: [...b.history, { id: uid('H'), user, role: 'Payment', action: `Paid via ${mode}`, at: nowISO(), detail: ref }],
      }));
      const tasks = completeBillTaskFor(s.tasks, bill, 'Payment', 'Completed');
      const auditLogs = [{ id: uid('AL'), at: nowISO(), user, role: 'Payment' as Role, action: `Paid via ${mode}`, module: 'Payments', target: billId, detail: ref }, ...s.auditLogs];
      return { ...s, bills, tasks, auditLogs };
    });
    consumeReservationByBill(billId);
  };

  /* ===== Budget workflow ===== */
  const recordBudgetHistory = (b: Budget, action: string, role: Role, user: string, detail?: string): Budget => ({
    ...b,
    updatedAt: nowISO(),
    history: [...b.history, { id: uid('BH'), user, role, action, at: nowISO(), detail }],
  });

  const updateBudget = (id: string, updater: (b: Budget) => Budget) =>
    setState((s) => ({ ...s, budgets: s.budgets.map((b) => (b.id === id ? updater(b) : b)) }));

  const createBudget: AppContextValue['createBudget'] = (data) => {
    const id = `BUD-2026-${String(Math.floor(Math.random() * 900) + 100)}`;
    const userRole: Role = state.currentRole ?? 'Creator';
    const user = state.currentUser || roleUsers[userRole];
    const status: BudgetStatus = data.saveAs === 'Submitted' ? 'Submitted' : 'Draft';
    const heads: BudgetHead[] = data.heads.map((h) => ({
      id: uid('BH'),
      name: h.name,
      allocated: h.allocated,
      utilized: 0,
      reserved: 0,
      remarks: h.remarks,
      lastYearAmount: h.lastYearAmount,
    }));
    const budget: Budget = {
      id,
      fy: data.fy,
      name: data.name,
      entityType: data.entityType,
      entityName: data.entityName,
      version: 1,
      parentBudgetId: data.parentBudgetId,
      status,
      heads,
      createdBy: user,
      createdAt: nowISO(),
      updatedAt: nowISO(),
      submittedBy: status === 'Submitted' ? user : undefined,
      submittedAt: status === 'Submitted' ? nowISO() : undefined,
      comments: [],
      history: [
        { id: uid('BH'), user, role: userRole, action: 'Created Budget', at: nowISO() },
        ...(status === 'Submitted'
          ? [{ id: uid('BH'), user, role: userRole, action: 'Submitted for Verification', at: nowISO() }]
          : []),
      ],
    };
    setState((s) => {
      const tasks = status === 'Submitted'
        ? addTask(s.tasks, { subjectType: 'Budget', budgetId: id, assignedToRole: 'Verifier', actionRequired: 'Verify Budget' })
        : s.tasks;
      return {
        ...s,
        budgets: [budget, ...s.budgets],
        tasks,
        auditLogs: [
          { id: uid('AL'), at: nowISO(), user, role: userRole, action: status === 'Submitted' ? 'Submitted Budget' : 'Created Draft Budget', module: 'Budgets', target: id },
          ...s.auditLogs,
        ],
      };
    });
    return budget;
  };

  const updateBudgetHeads: AppContextValue['updateBudgetHeads'] = (budgetId, heads) => {
    updateBudget(budgetId, (b) => ({ ...b, heads, updatedAt: nowISO() }));
  };

  const submitBudget: AppContextValue['submitBudget'] = (budgetId) => {
    const userRole: Role = state.currentRole ?? 'Creator';
    const user = state.currentUser || roleUsers[userRole];
    setState((s) => {
      const budgets = s.budgets.map((b) =>
        b.id === budgetId
          ? recordBudgetHistory({ ...b, status: 'Submitted', submittedBy: user, submittedAt: nowISO() }, 'Submitted for Verification', userRole, user)
          : b,
      );
      // Complete any existing 'Edit & Resubmit Budget' task for the Creator
      let tasks = s.tasks.map((t) =>
        t.subjectType === 'Budget' && t.budgetId === budgetId && t.assignedToRole === 'Creator' && t.status === 'Pending'
          ? { ...t, status: 'Completed' as const, updatedAt: nowISO() }
          : t,
      );
      // Create a fresh 'Verify Budget' task for the Verifier
      tasks = addTask(tasks, { subjectType: 'Budget', budgetId, assignedToRole: 'Verifier', actionRequired: 'Verify Budget' });
      const auditLogs = [{ id: uid('AL'), at: nowISO(), user, role: userRole, action: 'Submitted Budget', module: 'Budgets', target: budgetId }, ...s.auditLogs];
      return { ...s, budgets, tasks, auditLogs };
    });
  };

  const budgetVerifierForward: AppContextValue['budgetVerifierForward'] = (budgetId, comment) => {
    const user = state.currentUser || roleUsers.Verifier;
    setState((s) => {
      const budgets = s.budgets.map((b) =>
        b.id === budgetId
          ? recordBudgetHistory(
              {
                ...b,
                status: 'Verified',
                verifiedBy: user,
                verifiedAt: nowISO(),
                comments: comment ? [...b.comments, { id: uid('BC'), user, role: 'Verifier', message: comment, at: nowISO() }] : b.comments,
              },
              'Verified & Forwarded to Approver', 'Verifier', user,
            )
          : b,
      );
      let tasks = s.tasks.map((t) =>
        t.subjectType === 'Budget' && t.budgetId === budgetId && t.assignedToRole === 'Verifier' && t.status === 'Pending'
          ? { ...t, status: 'Completed' as const, updatedAt: nowISO() }
          : t,
      );
      tasks = addTask(tasks, { subjectType: 'Budget', budgetId, assignedToRole: 'Approver', actionRequired: 'Approve Budget' });
      return {
        ...s,
        budgets, tasks,
        auditLogs: [{ id: uid('AL'), at: nowISO(), user, role: 'Verifier' as Role, action: 'Verified Budget', module: 'Budgets', target: budgetId }, ...s.auditLogs],
      };
    });
  };

  const budgetVerifierSendBack: AppContextValue['budgetVerifierSendBack'] = (budgetId, reason) => {
    const user = state.currentUser || roleUsers.Verifier;
    setState((s) => {
      const budgets = s.budgets.map((b) =>
        b.id === budgetId
          ? recordBudgetHistory(
              {
                ...b,
                status: 'Sent Back',
                comments: [...b.comments, { id: uid('BC'), user, role: 'Verifier', message: reason, at: nowISO() }],
              },
              'Sent Back', 'Verifier', user, reason,
            )
          : b,
      );
      let tasks = s.tasks.map((t) =>
        t.subjectType === 'Budget' && t.budgetId === budgetId && t.assignedToRole === 'Verifier' && t.status === 'Pending'
          ? { ...t, status: 'Returned' as const, updatedAt: nowISO() }
          : t,
      );
      tasks = addTask(tasks, { subjectType: 'Budget', budgetId, assignedToRole: 'Creator', actionRequired: 'Edit & Resubmit Budget' });
      return {
        ...s,
        budgets, tasks,
        auditLogs: [{ id: uid('AL'), at: nowISO(), user, role: 'Verifier' as Role, action: 'Sent Back Budget', module: 'Budgets', target: budgetId, detail: reason }, ...s.auditLogs],
      };
    });
  };

  const budgetApproverApprove: AppContextValue['budgetApproverApprove'] = (budgetId, comment) => {
    const user = state.currentUser || roleUsers.Approver;
    setState((s) => {
      const budgets = s.budgets.map((b) =>
        b.id === budgetId
          ? recordBudgetHistory(
              {
                ...b,
                status: 'Approved',
                approvedBy: user,
                approvedAt: nowISO(),
                comments: comment ? [...b.comments, { id: uid('BC'), user, role: 'Approver', message: comment, at: nowISO() }] : b.comments,
              },
              'Approved & Locked', 'Approver', user,
            )
          : b,
      );
      const tasks = s.tasks.map((t) =>
        t.subjectType === 'Budget' && t.budgetId === budgetId && t.assignedToRole === 'Approver' && t.status === 'Pending'
          ? { ...t, status: 'Completed' as const, updatedAt: nowISO() }
          : t,
      );
      return {
        ...s,
        budgets, tasks,
        auditLogs: [{ id: uid('AL'), at: nowISO(), user, role: 'Approver' as Role, action: 'Approved Budget', module: 'Budgets', target: budgetId }, ...s.auditLogs],
      };
    });
  };

  const budgetApproverReject: AppContextValue['budgetApproverReject'] = (budgetId, reason) => {
    const user = state.currentUser || roleUsers.Approver;
    setState((s) => {
      const budgets = s.budgets.map((b) =>
        b.id === budgetId
          ? recordBudgetHistory(
              {
                ...b,
                status: 'Rejected',
                rejectedReason: reason,
                comments: [...b.comments, { id: uid('BC'), user, role: 'Approver', message: reason, at: nowISO() }],
              },
              'Rejected', 'Approver', user, reason,
            )
          : b,
      );
      const tasks = s.tasks.map((t) =>
        t.subjectType === 'Budget' && t.budgetId === budgetId && t.assignedToRole === 'Approver' && t.status === 'Pending'
          ? { ...t, status: 'Rejected' as const, updatedAt: nowISO() }
          : t,
      );
      return {
        ...s,
        budgets, tasks,
        auditLogs: [{ id: uid('AL'), at: nowISO(), user, role: 'Approver' as Role, action: 'Rejected Budget', module: 'Budgets', target: budgetId, detail: reason }, ...s.auditLogs],
      };
    });
  };

  const budgetApproverHold: AppContextValue['budgetApproverHold'] = (budgetId, reason) => {
    const user = state.currentUser || roleUsers.Approver;
    setState((s) => ({
      ...s,
      budgets: s.budgets.map((b) =>
        b.id === budgetId
          ? recordBudgetHistory(
              {
                ...b,
                status: 'On Hold',
                comments: [...b.comments, { id: uid('BC'), user, role: 'Approver', message: reason, at: nowISO() }],
              },
              'Put On Hold', 'Approver', user, reason,
            )
          : b,
      ),
      auditLogs: [{ id: uid('AL'), at: nowISO(), user, role: 'Approver' as Role, action: 'On Hold Budget', module: 'Budgets', target: budgetId, detail: reason }, ...s.auditLogs],
    }));
  };

  const withdrawBudget: AppContextValue['withdrawBudget'] = (budgetId) => {
    const user = state.currentUser || roleUsers.Creator;
    setState((s) => {
      const budgets = s.budgets.map((b) =>
        b.id === budgetId ? recordBudgetHistory({ ...b, status: 'Draft' }, 'Withdrawn to Draft', 'Creator', user) : b,
      );
      // Cancel any pending Verify Budget task for this budget
      const tasks = s.tasks.map((t) =>
        t.subjectType === 'Budget' && t.budgetId === budgetId && t.assignedToRole === 'Verifier' && t.status === 'Pending'
          ? { ...t, status: 'Returned' as const, updatedAt: nowISO() }
          : t,
      );
      return { ...s, budgets, tasks };
    });
  };

  /* ===== Allocation & Adjustment ===== */
  const createAllocation: AppContextValue['createAllocation'] = (a) => {
    const user = state.currentUser || roleUsers.Finance;
    const allocation: BudgetAllocation = { ...a, id: uid('ALL'), allocatedAt: nowISO(), createdBy: user };
    setState((s) => ({
      ...s,
      allocations: [allocation, ...s.allocations],
      auditLogs: [{ id: uid('AL'), at: nowISO(), user, role: 'Finance' as Role, action: 'Allocated Budget', module: 'Budgets', target: a.budgetId, detail: `${a.headName} → ${a.targetEntityName}` }, ...s.auditLogs],
    }));
  };

  const createAdjustment: AppContextValue['createAdjustment'] = (a) => {
    const user = state.currentUser || roleUsers.Finance;
    const adjustment: BudgetAdjustment = { ...a, id: uid('ADJ'), createdAt: nowISO(), createdBy: user, status: 'PENDING' };
    setState((s) => ({
      ...s,
      adjustments: [adjustment, ...s.adjustments],
      auditLogs: [{ id: uid('AL'), at: nowISO(), user, role: 'Finance' as Role, action: 'Created Adjustment', module: 'Budgets', target: a.budgetId, detail: `${a.fromHead} → ${a.toHead}` }, ...s.auditLogs],
    }));
  };

  const approveAdjustment: AppContextValue['approveAdjustment'] = (id) => {
    const user = state.currentUser || roleUsers.Finance;
    setState((s) => {
      const adj = s.adjustments.find((a) => a.id === id);
      if (!adj || adj.status !== 'PENDING') return s;
      const adjustments = s.adjustments.map((a) => (a.id === id ? { ...a, status: 'APPROVED' as const, approvedBy: user, approvedAt: nowISO() } : a));
      const budgets = s.budgets.map((b) => {
        if (b.id !== adj.budgetId) return b;
        return {
          ...b,
          updatedAt: nowISO(),
          heads: b.heads.map((h) => {
            if (h.name === adj.fromHead) return { ...h, allocated: h.allocated - adj.amount };
            if (h.name === adj.toHead) return { ...h, allocated: h.allocated + adj.amount };
            return h;
          }),
        };
      });
      return {
        ...s,
        adjustments,
        budgets,
        auditLogs: [{ id: uid('AL'), at: nowISO(), user, role: 'Finance' as Role, action: 'Approved Adjustment', module: 'Budgets', target: adj.budgetId, detail: `${adj.fromHead} → ${adj.toHead} ₹${adj.amount}` }, ...s.auditLogs],
      };
    });
  };

  const rejectAdjustment: AppContextValue['rejectAdjustment'] = (id, reason) => {
    const user = state.currentUser || roleUsers.Finance;
    setState((s) => ({
      ...s,
      adjustments: s.adjustments.map((a) => (a.id === id ? { ...a, status: 'REJECTED' as const, approvedBy: user, approvedAt: nowISO() } : a)),
      auditLogs: [{ id: uid('AL'), at: nowISO(), user, role: 'Finance' as Role, action: 'Rejected Adjustment', module: 'Budgets', target: id, detail: reason }, ...s.auditLogs],
    }));
  };

  /* ===== Budget queries ===== */
  const budgetForHead: AppContextValue['budgetForHead'] = (head) => {
    const active = findActiveBudget(state.budgets);
    if (!active) return null;
    const h = active.heads.find((x) => x.name === head);
    if (!h) return null;
    const remaining = h.allocated - h.utilized - h.reserved;
    return { allocated: h.allocated, used: h.utilized, reserved: h.reserved, remaining, budgetId: active.id };
  };

  /* ===== Receipts (Incoming Payments) ===== */
  const recordReceiptHistory = (r: Receipt, action: string, role: Role, user: string, detail?: string): Receipt => ({
    ...r,
    updatedAt: nowISO(),
    history: [...r.history, { id: uid('RH'), user, role, action, at: nowISO(), detail }],
  });

  const detectReceiptDuplicates: AppContextValue['detectReceiptDuplicates'] = (r) => {
    const cutoff = Date.now() - 30 * 86_400_000;
    const targetDate = r.receiptDate ? new Date(r.receiptDate).toDateString() : '';
    const matches: ReceiptDuplicateMatch[] = [];

    for (const x of state.receipts) {
      if (x.id === r.id) continue;
      if (x.status === 'Cancelled' || x.status === 'Rejected') continue;
      if (new Date(x.receiptDate).getTime() < cutoff) continue;

      const matchedFields = {
        transactionReference: !!r.transactionReference && x.transactionReference === r.transactionReference,
        amount: x.amount === r.amount,
        payerIdentifier: !!r.payerIdentifier && x.payerIdentifier === r.payerIdentifier,
        sameDay: !!targetDate && new Date(x.receiptDate).toDateString() === targetDate,
      };

      let matchScore: DuplicateMatchScore | null = null;
      let matchReason = '';

      // HIGH: exact match on transaction_reference (and amount also matches)
      if (matchedFields.transactionReference && matchedFields.amount) {
        matchScore = 'HIGH';
        matchReason = 'Same transaction reference and amount';
      } else if (matchedFields.transactionReference) {
        matchScore = 'HIGH';
        matchReason = 'Same transaction reference';
      } else if (matchedFields.payerIdentifier && matchedFields.amount) {
        matchScore = 'MEDIUM';
        matchReason = 'Same payer and amount within 30 days';
      } else if (matchedFields.sameDay && matchedFields.amount && matchedFields.payerIdentifier) {
        matchScore = 'LOW';
        matchReason = 'Same day, payer and amount';
      } else if (matchedFields.sameDay && matchedFields.amount) {
        matchScore = 'LOW';
        matchReason = 'Same day with the same amount';
      }

      if (matchScore) {
        matches.push({ receipt: x, matchScore, matchReason, matchedFields });
      }
    }

    // HIGH first, then MEDIUM, then LOW
    const order: Record<DuplicateMatchScore, number> = { HIGH: 0, MEDIUM: 1, LOW: 2 };
    return matches.sort((a, b) => order[a.matchScore] - order[b.matchScore]);
  };

  const computeDuplicateMeta = (r: Pick<Receipt, 'transactionReference' | 'payerIdentifier' | 'amount' | 'id' | 'receiptDate'>) => {
    const matches = detectReceiptDuplicates(r);
    if (matches.length === 0) return { duplicateFlag: false as const };
    return { duplicateFlag: true as const, duplicateMatchScore: matches[0].matchScore, duplicateReason: matches[0].matchReason };
  };

  const createReceipt: AppContextValue['createReceipt'] = (data) => {
    const id = uid('RCPT');
    const userRole: Role = state.currentRole ?? 'Creator';
    const user = state.currentUser || roleUsers[userRole];
    const status: ReceiptStatus = data.saveAs === 'Submitted' ? 'Submitted' : 'Draft';
    const lines: ReceiptLine[] = data.lines.map((l) => ({ id: uid('RL'), accountHead: l.accountHead, amount: l.amount, remarks: l.remarks }));
    const amount = lines.reduce((s, l) => s + (Number(l.amount) || 0), 0);
    const receipt: Receipt = {
      id,
      receiptNumber: `RCT-2026-${String(Math.floor(Math.random() * 9000) + 1000)}`,
      receiptDate: data.receiptDate,
      entityType: data.entityType,
      entityName: data.entityName,
      sourceType: data.sourceType,
      sourceReferenceId: data.sourceReferenceId,
      payerName: data.payerName,
      payerIdentifier: data.payerIdentifier,
      paymentMode: data.paymentMode,
      transactionReference: data.transactionReference,
      bankName: data.bankName,
      paymentDate: data.paymentDate,
      instrumentDetails: data.instrumentDetails,
      amount,
      lines,
      status,
      createdBy: user,
      createdAt: nowISO(),
      updatedAt: nowISO(),
      submittedBy: status === 'Submitted' ? user : undefined,
      submittedAt: status === 'Submitted' ? nowISO() : undefined,
      ...computeDuplicateMeta({ transactionReference: data.transactionReference, payerIdentifier: data.payerIdentifier, amount, id, receiptDate: data.receiptDate }),
      comments: [],
      history: [
        { id: uid('RH'), user, role: userRole, action: 'Created Receipt', at: nowISO() },
        ...(status === 'Submitted'
          ? [{ id: uid('RH'), user, role: userRole, action: 'Submitted for Verification', at: nowISO() }]
          : []),
      ],
    };
    setState((s) => {
      const tasks = status === 'Submitted'
        ? addTask(s.tasks, { subjectType: 'Receipt', receiptId: id, assignedToRole: 'Verifier', actionRequired: 'Verify Receipt' })
        : s.tasks;
      return {
        ...s,
        receipts: [receipt, ...s.receipts],
        tasks,
        auditLogs: [
          { id: uid('AL'), at: nowISO(), user, role: userRole, action: status === 'Submitted' ? 'Submitted Receipt' : 'Created Draft Receipt', module: 'Receipts', target: receipt.receiptNumber },
          ...s.auditLogs,
        ],
      };
    });
    return receipt;
  };

  const updateReceiptDraft: AppContextValue['updateReceiptDraft'] = (receiptId, lines) => {
    setState((s) => ({
      ...s,
      receipts: s.receipts.map((r) =>
        r.id === receiptId
          ? { ...r, lines, amount: lines.reduce((sum, l) => sum + l.amount, 0), updatedAt: nowISO() }
          : r,
      ),
    }));
  };

  const submitReceipt: AppContextValue['submitReceipt'] = (receiptId) => {
    const userRole: Role = state.currentRole ?? 'Creator';
    const user = state.currentUser || roleUsers[userRole];
    setState((s) => {
      const receipts = s.receipts.map((r) =>
        r.id === receiptId
          ? recordReceiptHistory({ ...r, status: 'Submitted', submittedBy: user, submittedAt: nowISO() }, 'Submitted for Verification', userRole, user)
          : r,
      );
      // Complete any "Edit & Resubmit Receipt" Creator task
      let tasks = s.tasks.map((t) =>
        t.subjectType === 'Receipt' && t.receiptId === receiptId && t.assignedToRole === 'Creator' && t.status === 'Pending'
          ? { ...t, status: 'Completed' as const, updatedAt: nowISO() }
          : t,
      );
      // Create fresh "Verify Receipt" task
      tasks = addTask(tasks, { subjectType: 'Receipt', receiptId, assignedToRole: 'Verifier', actionRequired: 'Verify Receipt' });
      return {
        ...s,
        receipts, tasks,
        auditLogs: [{ id: uid('AL'), at: nowISO(), user, role: userRole, action: 'Submitted Receipt', module: 'Receipts', target: receiptId }, ...s.auditLogs],
      };
    });
  };

  const withdrawReceipt: AppContextValue['withdrawReceipt'] = (receiptId) => {
    const user = state.currentUser || roleUsers.Creator;
    setState((s) => {
      const receipts = s.receipts.map((r) =>
        r.id === receiptId ? recordReceiptHistory({ ...r, status: 'Draft' }, 'Withdrawn to Draft', 'Creator', user) : r,
      );
      const tasks = s.tasks.map((t) =>
        t.subjectType === 'Receipt' && t.receiptId === receiptId && t.assignedToRole === 'Verifier' && t.status === 'Pending'
          ? { ...t, status: 'Returned' as const, updatedAt: nowISO() }
          : t,
      );
      return { ...s, receipts, tasks };
    });
  };

  const receiptVerifierForward: AppContextValue['receiptVerifierForward'] = (receiptId, comment) => {
    const user = state.currentUser || roleUsers.Verifier;
    setState((s) => {
      const receipts = s.receipts.map((r) =>
        r.id === receiptId
          ? recordReceiptHistory(
              {
                ...r,
                status: 'Verified',
                verifiedBy: user,
                verifiedAt: nowISO(),
                comments: comment ? [...r.comments, { id: uid('RC'), user, role: 'Verifier', message: comment, at: nowISO() }] : r.comments,
              },
              'Verified & Forwarded to Approver', 'Verifier', user,
            )
          : r,
      );
      let tasks = s.tasks.map((t) =>
        t.subjectType === 'Receipt' && t.receiptId === receiptId && t.assignedToRole === 'Verifier' && t.status === 'Pending'
          ? { ...t, status: 'Completed' as const, updatedAt: nowISO() }
          : t,
      );
      tasks = addTask(tasks, { subjectType: 'Receipt', receiptId, assignedToRole: 'Approver', actionRequired: 'Approve Receipt' });
      return {
        ...s,
        receipts, tasks,
        auditLogs: [{ id: uid('AL'), at: nowISO(), user, role: 'Verifier' as Role, action: 'Verified Receipt', module: 'Receipts', target: receiptId }, ...s.auditLogs],
      };
    });
  };

  const receiptVerifierSendBack: AppContextValue['receiptVerifierSendBack'] = (receiptId, reason) => {
    const user = state.currentUser || roleUsers.Verifier;
    setState((s) => {
      const receipts = s.receipts.map((r) =>
        r.id === receiptId
          ? recordReceiptHistory(
              {
                ...r,
                status: 'Sent Back',
                comments: [...r.comments, { id: uid('RC'), user, role: 'Verifier', message: reason, at: nowISO() }],
              },
              'Sent Back', 'Verifier', user, reason,
            )
          : r,
      );
      let tasks = s.tasks.map((t) =>
        t.subjectType === 'Receipt' && t.receiptId === receiptId && t.assignedToRole === 'Verifier' && t.status === 'Pending'
          ? { ...t, status: 'Returned' as const, updatedAt: nowISO() }
          : t,
      );
      tasks = addTask(tasks, { subjectType: 'Receipt', receiptId, assignedToRole: 'Creator', actionRequired: 'Edit & Resubmit Receipt' });
      return {
        ...s,
        receipts, tasks,
        auditLogs: [{ id: uid('AL'), at: nowISO(), user, role: 'Verifier' as Role, action: 'Sent Back Receipt', module: 'Receipts', target: receiptId, detail: reason }, ...s.auditLogs],
      };
    });
  };

  const receiptApproverApprove: AppContextValue['receiptApproverApprove'] = (receiptId, comment) => {
    const user = state.currentUser || roleUsers.Approver;
    setState((s) => {
      const receipts = s.receipts.map((r) =>
        r.id === receiptId
          ? recordReceiptHistory(
              {
                ...r,
                status: 'Approved',
                approvedBy: user,
                approvedAt: nowISO(),
                comments: comment ? [...r.comments, { id: uid('RC'), user, role: 'Approver', message: comment, at: nowISO() }] : r.comments,
              },
              'Approved & Forwarded to Finance Officer', 'Approver', user,
            )
          : r,
      );
      // Complete approver task, create finance review task
      let tasks = s.tasks.map((t) =>
        t.subjectType === 'Receipt' && t.receiptId === receiptId && t.assignedToRole === 'Approver' && t.status === 'Pending'
          ? { ...t, status: 'Completed' as const, updatedAt: nowISO() }
          : t,
      );
      tasks = addTask(tasks, { subjectType: 'Receipt', receiptId, assignedToRole: 'Finance', actionRequired: 'Review Receipt' });
      return {
        ...s,
        receipts, tasks,
        auditLogs: [{ id: uid('AL'), at: nowISO(), user, role: 'Approver' as Role, action: 'Approved Receipt', module: 'Receipts', target: receiptId }, ...s.auditLogs],
      };
    });
  };

  const receiptApproverSendBack: AppContextValue['receiptApproverSendBack'] = (receiptId, reason) => {
    const user = state.currentUser || roleUsers.Approver;
    setState((s) => {
      const receipts = s.receipts.map((r) =>
        r.id === receiptId
          ? recordReceiptHistory(
              {
                ...r,
                status: 'Submitted',
                comments: [...r.comments, { id: uid('RC'), user, role: 'Approver', message: reason, at: nowISO() }],
              },
              'Sent Back to Verifier', 'Approver', user, reason,
            )
          : r,
      );
      let tasks = s.tasks.map((t) =>
        t.subjectType === 'Receipt' && t.receiptId === receiptId && t.assignedToRole === 'Approver' && t.status === 'Pending'
          ? { ...t, status: 'Returned' as const, updatedAt: nowISO() }
          : t,
      );
      tasks = addTask(tasks, { subjectType: 'Receipt', receiptId, assignedToRole: 'Verifier', actionRequired: 'Verify Receipt' });
      return {
        ...s,
        receipts, tasks,
        auditLogs: [{ id: uid('AL'), at: nowISO(), user, role: 'Approver' as Role, action: 'Sent Back to Verifier', module: 'Receipts', target: receiptId, detail: reason }, ...s.auditLogs],
      };
    });
  };

  /** Finance Officer's final review — locks receipt as CONFIRMED. */
  const receiptFinanceConfirm: AppContextValue['receiptFinanceConfirm'] = (receiptId, comment) => {
    const user = state.currentUser || roleUsers.Finance;
    setState((s) => {
      const receipts = s.receipts.map((r) =>
        r.id === receiptId
          ? recordReceiptHistory(
              {
                ...r,
                status: 'Confirmed',
                confirmedBy: user,
                confirmedAt: nowISO(),
                comments: comment ? [...r.comments, { id: uid('RC'), user, role: 'Finance', message: comment, at: nowISO() }] : r.comments,
              },
              'Confirmed (Finance Officer review)', 'Finance', user,
            )
          : r,
      );
      const tasks = s.tasks.map((t) =>
        t.subjectType === 'Receipt' && t.receiptId === receiptId && t.assignedToRole === 'Finance' && t.actionRequired === 'Review Receipt' && t.status === 'Pending'
          ? { ...t, status: 'Completed' as const, updatedAt: nowISO() }
          : t,
      );
      return {
        ...s,
        receipts, tasks,
        auditLogs: [{ id: uid('AL'), at: nowISO(), user, role: 'Finance' as Role, action: 'Confirmed Receipt', module: 'Receipts', target: receiptId }, ...s.auditLogs],
      };
    });
  };

  const receiptFinanceReject: AppContextValue['receiptFinanceReject'] = (receiptId, reason) => {
    const user = state.currentUser || roleUsers.Finance;
    setState((s) => {
      const receipts = s.receipts.map((r) =>
        r.id === receiptId
          ? recordReceiptHistory(
              {
                ...r,
                status: 'Rejected',
                rejectedReason: reason,
                comments: [...r.comments, { id: uid('RC'), user, role: 'Finance', message: reason, at: nowISO() }],
              },
              'Rejected (Finance Officer review)', 'Finance', user, reason,
            )
          : r,
      );
      const tasks = s.tasks.map((t) =>
        t.subjectType === 'Receipt' && t.receiptId === receiptId && t.assignedToRole === 'Finance' && t.actionRequired === 'Review Receipt' && t.status === 'Pending'
          ? { ...t, status: 'Rejected' as const, updatedAt: nowISO() }
          : t,
      );
      return {
        ...s,
        receipts, tasks,
        auditLogs: [{ id: uid('AL'), at: nowISO(), user, role: 'Finance' as Role, action: 'Rejected Receipt', module: 'Receipts', target: receiptId, detail: reason }, ...s.auditLogs],
      };
    });
  };

  const markReceiptAsDuplicate: AppContextValue['markReceiptAsDuplicate'] = (receiptId, againstReceiptId, reason) => {
    const user = state.currentUser || roleUsers.Finance;
    const fullReason = `Marked duplicate of ${againstReceiptId}: ${reason}`;
    setState((s) => {
      const receipts = s.receipts.map((r) =>
        r.id === receiptId
          ? recordReceiptHistory(
              {
                ...r,
                duplicateFlag: true,
                duplicateMatchScore: 'HIGH',
                duplicateReason: `Marked duplicate of ${againstReceiptId}`,
                comments: [...r.comments, { id: uid('RC'), user, role: 'Finance', message: fullReason, at: nowISO() }],
              },
              'Marked as Duplicate', 'Finance', user, fullReason,
            )
          : r,
      );
      // Auto-create cancellation request
      const req: ReceiptCancellationRequest = { id: uid('CXR'), receiptId, requestedBy: user, requestedAt: nowISO(), reason: fullReason, status: 'PENDING' };
      const tasks = addTask(s.tasks, { subjectType: 'Receipt', receiptId, assignedToRole: 'Finance', actionRequired: 'Approve Cancellation' });
      return {
        ...s,
        receipts,
        tasks,
        receiptCancellations: [req, ...s.receiptCancellations],
        auditLogs: [{ id: uid('AL'), at: nowISO(), user, role: 'Finance' as Role, action: 'Marked Duplicate', module: 'Receipts', target: receiptId, detail: fullReason }, ...s.auditLogs],
      };
    });
  };

  const receiptApproverReject: AppContextValue['receiptApproverReject'] = (receiptId, reason) => {
    const user = state.currentUser || roleUsers.Approver;
    setState((s) => {
      const receipts = s.receipts.map((r) =>
        r.id === receiptId
          ? recordReceiptHistory(
              {
                ...r,
                status: 'Rejected',
                rejectedReason: reason,
                comments: [...r.comments, { id: uid('RC'), user, role: 'Approver', message: reason, at: nowISO() }],
              },
              'Rejected', 'Approver', user, reason,
            )
          : r,
      );
      const tasks = s.tasks.map((t) =>
        t.subjectType === 'Receipt' && t.receiptId === receiptId && t.assignedToRole === 'Approver' && t.status === 'Pending'
          ? { ...t, status: 'Rejected' as const, updatedAt: nowISO() }
          : t,
      );
      return {
        ...s,
        receipts, tasks,
        auditLogs: [{ id: uid('AL'), at: nowISO(), user, role: 'Approver' as Role, action: 'Rejected Receipt', module: 'Receipts', target: receiptId, detail: reason }, ...s.auditLogs],
      };
    });
  };

  const receiptApproverHold: AppContextValue['receiptApproverHold'] = (receiptId, reason) => {
    const user = state.currentUser || roleUsers.Approver;
    setState((s) => ({
      ...s,
      receipts: s.receipts.map((r) =>
        r.id === receiptId
          ? recordReceiptHistory(
              {
                ...r,
                status: 'On Hold',
                comments: [...r.comments, { id: uid('RC'), user, role: 'Approver', message: reason, at: nowISO() }],
              },
              'Put On Hold', 'Approver', user, reason,
            )
          : r,
      ),
      auditLogs: [{ id: uid('AL'), at: nowISO(), user, role: 'Approver' as Role, action: 'On Hold Receipt', module: 'Receipts', target: receiptId, detail: reason }, ...s.auditLogs],
    }));
  };

  const requestReceiptCancellation: AppContextValue['requestReceiptCancellation'] = (receiptId, reason) => {
    const userRole: Role = state.currentRole ?? 'Creator';
    const user = state.currentUser || roleUsers[userRole];
    const req: ReceiptCancellationRequest = { id: uid('CXR'), receiptId, requestedBy: user, requestedAt: nowISO(), reason, status: 'PENDING' };
    setState((s) => ({
      ...s,
      receiptCancellations: [req, ...s.receiptCancellations],
      tasks: addTask(s.tasks, { subjectType: 'Receipt', receiptId, assignedToRole: 'Finance', actionRequired: 'Approve Cancellation' }),
      auditLogs: [{ id: uid('AL'), at: nowISO(), user, role: userRole, action: 'Requested Cancellation', module: 'Receipts', target: receiptId, detail: reason }, ...s.auditLogs],
    }));
  };

  const approveReceiptCancellation: AppContextValue['approveReceiptCancellation'] = (requestId, note) => {
    const user = state.currentUser || roleUsers.Finance;
    setState((s) => {
      const req = s.receiptCancellations.find((c) => c.id === requestId);
      if (!req || req.status !== 'PENDING') return s;
      const receipts = s.receipts.map((r) =>
        r.id === req.receiptId
          ? recordReceiptHistory(
              { ...r, status: 'Cancelled', cancelledBy: user, cancelledAt: nowISO(), cancelReason: req.reason },
              'Cancellation Approved', 'Finance', user, note,
            )
          : r,
      );
      const cancellations = s.receiptCancellations.map((c) =>
        c.id === requestId ? { ...c, status: 'APPROVED' as const, approvedBy: user, approvedAt: nowISO(), approverNote: note } : c,
      );
      const tasks = s.tasks.map((t) =>
        t.subjectType === 'Receipt' && t.receiptId === req.receiptId && t.assignedToRole === 'Finance' && t.actionRequired === 'Approve Cancellation' && t.status === 'Pending'
          ? { ...t, status: 'Completed' as const, updatedAt: nowISO() }
          : t,
      );
      return {
        ...s,
        receipts, receiptCancellations: cancellations, tasks,
        auditLogs: [{ id: uid('AL'), at: nowISO(), user, role: 'Finance' as Role, action: 'Approved Cancellation', module: 'Receipts', target: req.receiptId, detail: note }, ...s.auditLogs],
      };
    });
  };

  const rejectReceiptCancellation: AppContextValue['rejectReceiptCancellation'] = (requestId, note) => {
    const user = state.currentUser || roleUsers.Finance;
    setState((s) => {
      const req = s.receiptCancellations.find((c) => c.id === requestId);
      if (!req || req.status !== 'PENDING') return s;
      const cancellations = s.receiptCancellations.map((c) =>
        c.id === requestId ? { ...c, status: 'REJECTED' as const, approvedBy: user, approvedAt: nowISO(), approverNote: note } : c,
      );
      const tasks = s.tasks.map((t) =>
        t.subjectType === 'Receipt' && t.receiptId === req.receiptId && t.assignedToRole === 'Finance' && t.actionRequired === 'Approve Cancellation' && t.status === 'Pending'
          ? { ...t, status: 'Rejected' as const, updatedAt: nowISO() }
          : t,
      );
      return {
        ...s,
        receiptCancellations: cancellations, tasks,
        auditLogs: [{ id: uid('AL'), at: nowISO(), user, role: 'Finance' as Role, action: 'Rejected Cancellation', module: 'Receipts', target: req.receiptId, detail: note }, ...s.auditLogs],
      };
    });
  };

  /* ===== Reconciliation ===== */
  const uploadBatch: AppContextValue['uploadBatch'] = (fileName) => {
    const batch: ReconciliationBatch = {
      batchId: uid('BATCH'),
      fileName,
      uploadedAt: nowISO(),
      uploadedBy: state.currentUser || roleUsers.Payment,
      totalTransactions: 5,
      matchedCount: 0,
      unmatchedCount: 5,
      exceptionsCount: 0,
      status: 'Uploaded',
      transactions: [
        { id: uid('TX'), systemTxnId: 'TXN-' + Math.floor(Math.random() * 9000), bankTxnId: 'BNK-' + Math.floor(Math.random() * 9000), amountSystem: 12500, amountBank: 12500, date: nowISO(), reference: 'BILL-NEW-1', matchStatus: 'Unmatched' },
        { id: uid('TX'), systemTxnId: 'TXN-' + Math.floor(Math.random() * 9000), bankTxnId: 'BNK-' + Math.floor(Math.random() * 9000), amountSystem: 89000, amountBank: 89000, date: nowISO(), reference: 'BILL-NEW-2', matchStatus: 'Unmatched' },
        { id: uid('TX'), systemTxnId: 'TXN-' + Math.floor(Math.random() * 9000), bankTxnId: '—', amountSystem: 45000, amountBank: 0, date: nowISO(), reference: 'BILL-NEW-3', matchStatus: 'Unmatched', issueType: 'Missing' },
        { id: uid('TX'), systemTxnId: 'TXN-' + Math.floor(Math.random() * 9000), bankTxnId: 'BNK-' + Math.floor(Math.random() * 9000), amountSystem: 184500, amountBank: 185000, date: nowISO(), reference: 'BILL-NEW-4', matchStatus: 'Unmatched', issueType: 'Amount Mismatch' },
        { id: uid('TX'), systemTxnId: 'TXN-' + Math.floor(Math.random() * 9000), bankTxnId: 'BNK-' + Math.floor(Math.random() * 9000), amountSystem: 22000, amountBank: 22000, date: nowISO(), reference: 'BILL-NEW-5', matchStatus: 'Unmatched' },
      ],
    };
    setState((s) => ({
      ...s,
      reconBatches: [batch, ...s.reconBatches],
      auditLogs: [{ id: uid('AL'), at: nowISO(), user: batch.uploadedBy, role: state.currentRole ?? 'Payment', action: 'Uploaded Bank Statement', module: 'Reconciliation', target: batch.batchId }, ...s.auditLogs],
    }));
    return batch;
  };

  const autoMatch: AppContextValue['autoMatch'] = (batchId) => {
    setState((s) => ({
      ...s,
      reconBatches: s.reconBatches.map((b) => {
        if (b.batchId !== batchId) return b;
        const transactions = b.transactions.map((t) => {
          if (t.amountSystem === t.amountBank && t.amountBank > 0) return { ...t, matchStatus: 'Matched' as const };
          if (t.issueType) return { ...t, matchStatus: 'Exception' as const };
          return t;
        });
        const matched = transactions.filter((t) => t.matchStatus === 'Matched').length;
        const exceptions = transactions.filter((t) => t.matchStatus === 'Exception').length;
        const unmatched = transactions.length - matched - exceptions;
        return { ...b, transactions, matchedCount: matched, unmatchedCount: unmatched, exceptionsCount: exceptions, status: 'Matching' as const };
      }),
    }));
  };

  const finalizeBatch: AppContextValue['finalizeBatch'] = (batchId) => {
    setState((s) => ({
      ...s,
      reconBatches: s.reconBatches.map((b) => (b.batchId === batchId ? { ...b, status: 'Reconciled' as const } : b)),
      auditLogs: [{ id: uid('AL'), at: nowISO(), user: state.currentUser, role: state.currentRole ?? 'Finance', action: 'Finalized Reconciliation', module: 'Reconciliation', target: batchId }, ...s.auditLogs],
    }));
  };

  const correctReconTxn: AppContextValue['correctReconTxn'] = (batchId, txnId, patch) => {
    const user = state.currentUser || roleUsers.Payment;
    const role = state.currentRole ?? 'Payment';
    setState((s) => {
      const batch = s.reconBatches.find((b) => b.batchId === batchId);
      const txnBefore = batch?.transactions.find((t) => t.id === txnId);
      const auditDetail = txnBefore?.systemTxnId ? `System ${txnBefore.systemTxnId}` : txnId;

      return {
        ...s,
        reconBatches: s.reconBatches.map((b) => {
          if (b.batchId !== batchId) return b;
          const transactions = b.transactions.map((t) => {
            if (t.id !== txnId) return t;
            if (t.issueType !== 'Missing' && t.issueType !== 'Amount Mismatch') return t;
            return deriveReconTxnAfterCorrection(t, patch.bankTxnId, patch.amountBank);
          });
          return { ...b, transactions, ...recomputeReconMetrics(transactions) };
        }),
        auditLogs: [
          {
            id: uid('AL'),
            at: nowISO(),
            user,
            role,
            action: 'Corrected reconciliation mapping',
            module: 'Reconciliation',
            target: batchId,
            detail: auditDetail,
          },
          ...s.auditLogs,
        ],
      };
    });
  };

  const myTasks = () => {
    if (!state.currentRole) return [];
    return state.tasks.filter((t) => t.assignedToRole === state.currentRole && t.status === 'Pending');
  };

  const taskCountFor = (role: Role) => state.tasks.filter((t) => t.assignedToRole === role && t.status === 'Pending').length;

  const value: AppContextValue = useMemo(
    () => ({
      ...state,
      setRole, setModule, logout,
      createBill, updateBill, submitBill,
      verifierApprove, verifierReject, verifierSendBack,
      financeApprove, financeReject, processPayment,
      createBudget, updateBudgetHeads, submitBudget,
      budgetVerifierForward, budgetVerifierSendBack,
      budgetApproverApprove, budgetApproverReject, budgetApproverHold,
      withdrawBudget,
      createAllocation, createAdjustment, approveAdjustment, rejectAdjustment,
      reserveOnBill, releaseReservationByBill, consumeReservationByBill,
      createReceipt, updateReceiptDraft, submitReceipt, withdrawReceipt,
      receiptVerifierForward, receiptVerifierSendBack,
      receiptApproverApprove, receiptApproverReject, receiptApproverHold, receiptApproverSendBack,
      receiptFinanceConfirm, receiptFinanceReject,
      markReceiptAsDuplicate,
      requestReceiptCancellation, approveReceiptCancellation, rejectReceiptCancellation,
      detectReceiptDuplicates,
      budgetForHead, activeBudget,
      uploadBatch, autoMatch, finalizeBatch, correctReconTxn,
      pushAudit, myTasks, taskCountFor,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [state],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}

export function resetAppState() {
  localStorage.removeItem(STORAGE_KEY);
  window.location.reload();
}
