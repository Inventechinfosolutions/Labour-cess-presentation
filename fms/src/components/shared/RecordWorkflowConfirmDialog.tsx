import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { AlertTriangle, ClipboardCheck, RotateCcw, Save, X } from 'lucide-react';

export type WorkflowConfirmIntent = 'submitVerification' | 'saveDraft' | 'discardCancel' | 'withdrawDraft';

function metaFor(intent: WorkflowConfirmIntent, recordLabel: string) {
  switch (intent) {
    case 'submitVerification':
      return {
        title: 'Submit for verification?',
        description: `Confirm that the details are correct. This ${recordLabel} will enter the verification queue and you typically cannot edit it until it is sent back.`,
        confirmLabel: 'Yes, submit',
        destructive: false,
        Icon: ClipboardCheck,
        iconWrap:
          'bg-gradient-to-br from-primary/40 via-primary/22 to-primary/10 text-primary shadow-sm ring-1 ring-primary/28 dark:from-primary/45 dark:via-primary/24 dark:to-primary/12 dark:ring-primary/38',
      };
    case 'saveDraft':
      return {
        title: 'Save as draft?',
        description: `Save this ${recordLabel} as a draft. You can continue editing later from your list.`,
        confirmLabel: 'Save draft',
        destructive: false,
        Icon: Save,
        iconWrap:
          'bg-gradient-to-br from-chart-3/40 via-chart-3/22 to-chart-3/10 text-chart-3 shadow-sm ring-1 ring-chart-3/30 dark:from-chart-3/35 dark:via-chart-3/18 dark:ring-chart-3/42',
      };
    case 'discardCancel':
      return {
        title: 'Leave without saving?',
        description: `You may lose unsaved changes on this ${recordLabel} form if you leave now.`,
        confirmLabel: 'Leave',
        destructive: true,
        Icon: AlertTriangle,
        iconWrap:
          'bg-gradient-to-br from-destructive/38 via-destructive/20 to-destructive/10 text-destructive shadow-sm ring-1 ring-destructive/30 dark:from-destructive/42 dark:via-destructive/22 dark:ring-destructive/40',
      };
    case 'withdrawDraft':
      return {
        title: 'Withdraw to draft?',
        description: `This ${recordLabel} will return to Draft and leave the workflow queue. You can edit and resubmit later.`,
        confirmLabel: 'Yes, withdraw',
        destructive: false,
        Icon: RotateCcw,
        iconWrap:
          'bg-gradient-to-br from-chart-2/40 via-chart-2/22 to-chart-2/10 text-chart-2 shadow-sm ring-1 ring-chart-2/28 dark:from-chart-2/36 dark:via-chart-2/18 dark:ring-chart-2/40',
      };
    default: {
      const _exhaustive: never = intent;
      return _exhaustive;
    }
  }
}

/** Secondary — light gray, dark text (reference: Reject) */
const btnSecondary =
  'h-10 shrink-0 rounded-[11px] border-0 bg-slate-200/95 px-5 text-sm font-semibold text-slate-900 shadow-sm hover:bg-slate-300/95 dark:bg-white/12 dark:text-white dark:hover:bg-white/18';

/** Primary — charcoal / black (reference: Accept) */
const btnPrimaryDark =
  'h-10 shrink-0 rounded-[11px] border-0 bg-slate-900 px-5 text-sm font-semibold text-white shadow-[0_8px_24px_-10px_rgba(15,23,42,0.45)] hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-950 dark:hover:bg-white dark:shadow-[0_8px_28px_-12px_rgba(0,0,0,0.55)]';

const btnDestructive =
  'h-10 shrink-0 rounded-[11px] border-0 bg-destructive px-5 text-sm font-semibold text-destructive-foreground shadow-[0_8px_24px_-10px_color-mix(in_oklch,var(--destructive)_38%,transparent)] hover:bg-destructive/90 dark:bg-destructive dark:hover:bg-destructive/88';

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  intent: WorkflowConfirmIntent | null;
  /** Lowercase noun, e.g. "bill", "receipt", "budget" */
  recordLabel: string;
  onConfirm: () => void;
};

export function RecordWorkflowConfirmDialog({ open, onOpenChange, intent, recordLabel, onConfirm }: Props) {
  const m = intent ? metaFor(intent, recordLabel) : null;
  const Icon = m?.Icon ?? ClipboardCheck;

  const dismiss = () => onOpenChange(false);

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent
        size="default"
        overlayClassName="bg-slate-500/[0.22] supports-backdrop-filter:backdrop-blur-[3px] data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0 dark:bg-black/65 dark:supports-backdrop-filter:backdrop-blur-sm"
        className={cn(
          'gap-0 overflow-hidden rounded-[20px] border border-black/[0.04] bg-[#FFF9F9] p-0 text-left text-slate-900 shadow-[0_18px_50px_-20px_rgba(15,23,42,0.18),0_8px_24px_-12px_rgba(15,23,42,0.1)] ring-0 dark:border-white/[0.08] dark:bg-[color-mix(in_oklch,var(--card)_96%,#2a181c)] dark:text-foreground dark:shadow-[0_24px_56px_-18px_rgba(0,0,0,0.55),0_10px_28px_-14px_rgba(0,0,0,0.38)]',
          'data-[size=default]:max-w-[min(calc(100vw-2rem),380px)] sm:data-[size=default]:max-w-[380px]',
        )}
      >
        <div className="relative px-7 pb-7 pt-7 sm:px-8 sm:pb-8 sm:pt-8">
          <button
            type="button"
            onClick={dismiss}
            className="absolute right-4 top-4 rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-black/[0.06] hover:text-slate-700 dark:text-slate-500 dark:hover:bg-white/10 dark:hover:text-slate-200"
            aria-label="Close dialog"
          >
            <X className="size-4 stroke-[2]" />
          </button>

          <AlertDialogHeader className="place-items-start gap-0 space-y-0 pr-10 text-left sm:place-items-start sm:text-left">
            <div className="flex gap-3.5">
              <div
                className={cn(
                  'mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl [&_svg]:size-[1.35rem] [&_svg]:stroke-[2.25]',
                  m?.iconWrap,
                )}
                aria-hidden
              >
                <Icon />
              </div>
              <div className="min-w-0 flex-1 space-y-3">
                <AlertDialogTitle className="text-[1.05rem] font-bold leading-snug tracking-tight text-slate-900 dark:text-foreground sm:text-lg">
                  {m?.title ?? ''}
                </AlertDialogTitle>
                <AlertDialogDescription className="text-[13px] leading-relaxed text-slate-600 dark:text-muted-foreground sm:text-[14px] sm:leading-[1.65]">
                  {m?.description ?? ''}
                </AlertDialogDescription>
              </div>
            </div>
          </AlertDialogHeader>

          {/* Primary left (dark), secondary right (gray) — matches reference */}
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Button
              type="button"
              variant="ghost"
              className={cn(m?.destructive ? btnDestructive : btnPrimaryDark)}
              onClick={() => {
                onConfirm();
                onOpenChange(false);
              }}
            >
              {m?.confirmLabel ?? 'Confirm'}
            </Button>
            <AlertDialogCancel type="button" variant="ghost" className={btnSecondary}>
              Go back
            </AlertDialogCancel>
          </div>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}
