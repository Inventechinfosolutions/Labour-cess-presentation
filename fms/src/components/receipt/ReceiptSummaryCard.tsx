import {
  AlertTriangle,
  Banknote,
  Building2,
  CalendarDays,
  CheckCircle2,
  CircleUser,
  CreditCard,
  FileText,
  Hash,
  IdCard,
  Landmark,
  Link2,
  Tag,
  UserRound,
} from 'lucide-react';
import { BillSummaryRow } from '@/components/bill/BillRecordPanels';
import type { Receipt } from '@/store/types';
import { formatDate, formatINR } from '@/lib/format';
import { cn } from '@/lib/utils';

/** Read-only receipt header — matches {@link BillSummaryCard} shell and cascade grid. */
export function ReceiptSummaryCard({ receipt }: { receipt: Receipt }) {
  return (
    <div className="tdetail-block fms-dashboard-panel fms-dashboard-chart-board overflow-hidden p-6 md:p-7">
      <div className="bill-summary-cascade mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="fms-dashboard-section-label mb-1">Record</p>
          <h3 className="fms-dashboard-title text-xl tracking-tight text-foreground md:text-[1.35rem]">Receipt information</h3>
        </div>
      </div>

      <div className="overflow-hidden rounded-md border border-border/80 bg-border/75 dark:bg-border/40">
        <div className="grid grid-cols-1 gap-px sm:grid-cols-2">
          <BillSummaryRow icon={Hash} label="Receipt #" value={receipt.receiptNumber} mono tone="slate" />
          <BillSummaryRow icon={CalendarDays} label="Receipt Date" value={formatDate(receipt.receiptDate)} tone="sky" />
          <BillSummaryRow icon={Tag} label="Source Type" value={receipt.sourceType} tone="emerald" />
          <BillSummaryRow
            icon={Link2}
            label="Source Reference"
            value={receipt.sourceReferenceId ?? '—'}
            mono
            tone="violet"
          />
          <BillSummaryRow icon={UserRound} label="Payer" value={receipt.payerName} tone="amber" />
          <BillSummaryRow icon={IdCard} label="Payer Identifier" value={receipt.payerIdentifier} mono tone="rose" />
          <BillSummaryRow
            icon={Building2}
            label="Entity"
            value={`${receipt.entityType} · ${receipt.entityName}`}
            tone="fuchsia"
          />
          <BillSummaryRow icon={CircleUser} label="Created By" value={receipt.createdBy} tone="orange" />
        </div>
      </div>
    </div>
  );
}

/** Payment fields — same shell as bill summary + validation strip (mirrors bill “Description” footer). */
export function ReceiptPaymentInstrumentCard({ receipt }: { receipt: Receipt }) {
  const refOk = !!receipt.transactionReference;
  const bankOk = !!receipt.bankName || receipt.paymentMode === 'CASH';

  return (
    <div className="tdetail-block fms-dashboard-panel fms-dashboard-chart-board overflow-hidden p-6 md:p-7">
      <div className="bill-summary-cascade mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="fms-dashboard-section-label mb-1">Banking</p>
          <h3 className="fms-dashboard-title text-xl tracking-tight text-foreground md:text-[1.35rem]">Payment instrument</h3>
        </div>
      </div>

      <div className="overflow-hidden rounded-md border border-border/80 bg-border/75 dark:bg-border/40">
        <div className="grid grid-cols-1 gap-px sm:grid-cols-2">
          <BillSummaryRow icon={CreditCard} label="Payment Mode" value={receipt.paymentMode} tone="sky" />
          <BillSummaryRow icon={CalendarDays} label="Payment Date" value={formatDate(receipt.paymentDate)} tone="emerald" />
          <BillSummaryRow
            icon={Hash}
            label="Transaction Reference"
            value={receipt.transactionReference || '—'}
            mono
            tone="slate"
          />
          <BillSummaryRow icon={Landmark} label="Bank Name" value={receipt.bankName ?? '—'} tone="amber" />
          <div className="sm:col-span-2">
            <BillSummaryRow icon={Banknote} label="Amount" value={formatINR(receipt.amount)} tone="fuchsia" />
          </div>
          <div className="sm:col-span-2">
            <BillSummaryRow
              icon={FileText}
              label="Instrument Details"
              value={receipt.instrumentDetails ?? '—'}
              tone="violet"
            />
          </div>
        </div>

        <div className="bill-summary-cascade border-t border-border/90 bg-card px-4 py-4 md:px-5 md:py-5">
          <div className="text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Validation</div>
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <ValidityHint ok={refOk} okLabel="Reference present" failLabel="Missing reference" />
            <ValidityHint ok={bankOk} okLabel="Bank / mode matched" failLabel="Bank name missing" />
          </div>
        </div>
      </div>
    </div>
  );
}

function ValidityHint({ ok, okLabel, failLabel }: { ok: boolean; okLabel: string; failLabel: string }) {
  return (
    <div
      className={cn(
        'rounded-lg border px-3 py-2 text-xs flex items-center gap-2',
        ok ? 'status-success-bg status-success-border' : 'status-warn-bg status-warn-border',
      )}
    >
      {ok ? <CheckCircle2 className="h-3.5 w-3.5 shrink-0" /> : <AlertTriangle className="h-3.5 w-3.5 shrink-0" />}
      {ok ? okLabel : failLabel}
    </div>
  );
}
