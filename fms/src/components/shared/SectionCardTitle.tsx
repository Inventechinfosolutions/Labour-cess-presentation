import type { LucideIcon } from 'lucide-react';
import type { BillSummaryTone } from '@/components/bill/billSummaryTokens';
import { SummaryIconTile } from '@/components/shared/SummaryIconTile';

export function SectionCardTitle({
  icon,
  title,
  subtitle,
  tone,
}: {
  icon: LucideIcon;
  title: string;
  subtitle?: string;
  tone: BillSummaryTone;
}) {
  return (
    <div className="-mx-6 -mt-6 mb-5 flex items-start gap-3 rounded-t-2xl border-b border-primary-foreground/25 bg-primary px-6 pb-4 pt-5">
      <SummaryIconTile
        icon={icon}
        tone={tone}
        size="md"
        className="border-primary-foreground/25 bg-primary-foreground/12 text-primary-foreground shadow-none"
      />
      <div className="min-w-0 pt-0.5">
        <h3 className="font-semibold leading-tight text-primary-foreground">{title}</h3>
        {subtitle ? (
          <p className="mt-1 text-xs leading-relaxed text-primary-foreground/80">{subtitle}</p>
        ) : null}
      </div>
    </div>
  );
}

export function SidebarSectionTitle({
  icon,
  title,
  tone,
}: {
  icon: LucideIcon;
  title: string;
  tone: BillSummaryTone;
}) {
  return (
    <div className="flex items-center gap-2.5 border-b border-border pb-3">
      <SummaryIconTile icon={icon} tone={tone} size="sm" />
      <h3 className="font-semibold">{title}</h3>
    </div>
  );
}
