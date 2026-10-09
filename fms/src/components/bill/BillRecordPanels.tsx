import type { RefObject } from 'react';
import type { LucideIcon } from 'lucide-react';
import {
  Building2,
  CircleUser,
  CreditCard,
  Download,
  ExternalLink,
  IdCard,
  Landmark,
  MessageSquare,
  Paperclip,
  PieChart,
  UserRound,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Bill } from '@/store/types';
import { relativeTime } from '@/lib/format';
import { cn } from '@/lib/utils';
import { BILL_SUMMARY_ICON_TONE, type BillSummaryTone } from '@/components/bill/billSummaryTokens';

export function BillSummaryRow({
  icon: Icon,
  label,
  value,
  mono,
  tone,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  mono?: boolean;
  tone: BillSummaryTone;
}) {
  const ring = BILL_SUMMARY_ICON_TONE[tone];
  return (
    <div className="bill-summary-cascade flex min-h-[5.25rem] gap-3 bg-card p-4 md:gap-4 md:p-5">
      <div className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-md border', ring)}>
        <Icon className="h-5 w-5" strokeWidth={2} />
      </div>
      <div className="min-w-0 flex-1 py-0.5">
        <div className="text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-muted-foreground">{label}</div>
        <div className={cn('mt-1 text-sm font-semibold leading-snug text-foreground', mono && 'font-mono text-[13px] font-medium')}>
          {value}
        </div>
      </div>
    </div>
  );
}

/** Red PDF tile with folded corner + white “PDF” label */
export function PdfAttachmentBadge({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'relative h-11 w-[2.125rem] shrink-0 overflow-hidden rounded-[5px] bg-[#dc2626] shadow-sm ring-1 ring-black/12 dark:bg-[#dc2626] dark:ring-white/12',
        className,
      )}
    >
      <div
        className="pointer-events-none absolute right-0 top-0 z-[2] size-[14px] bg-white/35"
        style={{ clipPath: 'polygon(100% 0, 100% 100%, 0 0)' }}
        aria-hidden
      />
      <span className="absolute inset-x-0 bottom-[5px] z-[1] block text-center font-sans text-[9px] font-bold uppercase leading-none tracking-wide text-white drop-shadow-sm">
        PDF
      </span>
    </div>
  );
}

export function BillSummaryCard({
  bill,
  panelRef,
  showOpenFullBill = true,
  onOpenFullBill,
}: {
  bill: Bill;
  panelRef?: RefObject<HTMLDivElement | null>;
  showOpenFullBill?: boolean;
  onOpenFullBill?: () => void;
}) {
  return (
    <div
      ref={panelRef}
      className="tdetail-block fms-dashboard-panel fms-dashboard-chart-board overflow-hidden p-6 md:p-7"
    >
      <div className="bill-summary-cascade mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="fms-dashboard-section-label mb-1">Record</p>
          <h3 className="fms-dashboard-title text-xl tracking-tight text-foreground md:text-[1.35rem]">Bill summary</h3>
        </div>
        {showOpenFullBill && onOpenFullBill ? (
          <button
            type="button"
            onClick={onOpenFullBill}
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background/90 px-3 py-1.5 text-xs font-medium text-foreground shadow-sm transition hover:border-muted-foreground/40 hover:bg-muted/50"
          >
            Open full bill <ExternalLink className="h-3.5 w-3.5 opacity-70" />
          </button>
        ) : null}
      </div>

      <div className="overflow-hidden rounded-md border border-border/80 bg-border/75 dark:bg-border/40">
        <div className="grid grid-cols-1 gap-px sm:grid-cols-2">
          <BillSummaryRow icon={CreditCard} label="Bill Type" value={bill.billType} tone="sky" />
          <BillSummaryRow icon={Building2} label="Department" value={bill.department} tone="emerald" />
          <BillSummaryRow icon={UserRound} label="Payee" value={bill.payeeName} tone="violet" />
          <BillSummaryRow icon={IdCard} label="PAN" value={bill.panNumber} mono tone="slate" />
          <BillSummaryRow icon={Landmark} label="Bank" value={bill.bankName} tone="amber" />
          <BillSummaryRow
            icon={Landmark}
            label="Account / IFSC"
            value={`${bill.bankAccount} · ${bill.ifsc}`}
            mono
            tone="rose"
          />
          <BillSummaryRow icon={PieChart} label="Budget Head" value={bill.budgetHead} tone="fuchsia" />
          <BillSummaryRow
            icon={CircleUser}
            label="Created By"
            value={`${bill.createdBy} · ${bill.createdByRole}`}
            tone="orange"
          />
        </div>
        <div className="bill-summary-cascade border-t border-border/90 bg-card px-4 py-4 md:px-5 md:py-5">
          <div className="text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Description</div>
          <div className="mt-2 text-sm font-normal leading-relaxed text-foreground">{bill.description}</div>
        </div>
      </div>
    </div>
  );
}

export function BillAttachmentsSection({ attachments }: { attachments: Bill['attachments'] }) {
  return (
    <div className="tdetail-block fms-dashboard-panel fms-dashboard-chart-board p-6 md:p-7">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <p className="fms-dashboard-section-label mb-1">Evidence</p>
          <h3 className="fms-dashboard-title flex items-center gap-2 text-xl text-foreground">
            <Paperclip className="h-5 w-5 text-primary" /> Attachments
            <span className="rounded-full bg-muted px-2 py-0.5 font-sans text-xs font-semibold tracking-normal text-muted-foreground">
              {attachments.length}
            </span>
          </h3>
        </div>
      </div>
      {attachments.length === 0 ? (
        <div className="text-sm text-muted-foreground py-2">No attachments</div>
      ) : (
        <div className="space-y-2">
          {attachments.map((a, i) => (
            <div
              key={i}
              className="flex items-center gap-3 rounded-2xl border border-border/90 bg-[color:color-mix(in_oklch,var(--background)_58%,var(--card))] px-4 py-3 text-sm shadow-sm transition hover:border-muted-foreground/25 dark:bg-[color:color-mix(in_oklch,var(--background)_28%,var(--card))]"
            >
              <PdfAttachmentBadge />
              <div className="min-w-0 flex-1 truncate">
                <div className="truncate font-bold text-foreground">{a.name}</div>
                <div className="mt-0.5 text-xs font-normal text-muted-foreground">{a.size}</div>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-9 rounded-full border-border bg-background px-5 font-medium text-primary shadow-none hover:bg-muted/60 hover:text-primary"
                >
                  View
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="h-9 w-9 shrink-0 rounded-lg border-border bg-background text-muted-foreground shadow-none hover:bg-muted/50 hover:text-foreground"
                  aria-label={`Download ${a.name}`}
                  title="Download"
                >
                  <Download className="h-4 w-4" strokeWidth={2} />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function BillCommentsSection({ comments }: { comments: Bill['comments'] }) {
  return (
    <div className="tdetail-block fms-dashboard-panel fms-dashboard-chart-board p-6 md:p-7">
      <div className="mb-5">
        <p className="fms-dashboard-section-label mb-1">Discussion</p>
        <h3 className="fms-dashboard-title flex items-center gap-2 text-xl text-foreground">
          <MessageSquare className="h-5 w-5 text-primary" /> Comments
        </h3>
      </div>
      {comments.length === 0 ? (
        <div className="text-sm text-muted-foreground py-2">No comments yet.</div>
      ) : (
        <div className="space-y-4">
          {comments.map((c) => (
            <div key={c.id} className="flex gap-3">
              <div className="h-8 w-8 shrink-0 rounded-full status-info-bg flex items-center justify-center text-xs font-semibold">
                {c.user[0]?.toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm">
                  <span className="font-medium">{c.user}</span>{' '}
                  <span className="text-xs text-muted-foreground ml-1">· {c.role} · {relativeTime(c.at)}</span>
                </div>
                <div className="mt-1 rounded-xl border border-border/80 bg-[color:color-mix(in_oklch,var(--muted)_42%,var(--background))] px-3 py-2.5 text-sm leading-relaxed dark:bg-[color:color-mix(in_oklch,var(--muted)_22%,var(--card))]">
                  {c.message}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
