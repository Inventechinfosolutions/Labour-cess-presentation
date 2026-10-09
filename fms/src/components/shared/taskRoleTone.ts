import type { Role } from '@/store/types';

/** Role accent — matches Tasks table pills & task detail assignment badges */
export const TASK_ROLE_TONE: Partial<Record<Role, string>> = {
  Creator: 'status-info-bg status-info-text',
  Verifier: 'status-warn-bg status-warn-text',
  Approver: 'status-success-bg status-success-text',
  Finance: 'status-paid-bg status-paid-text',
  Payment: 'status-purple-bg status-purple-text',
  Auditor: 'status-chart1-bg status-chart1-text',
};

export const TASK_ROLE_TONE_FALLBACK = 'bg-muted text-foreground';

/** Border token for selected role chips (Login, etc.) */
export const TASK_ROLE_CHIP_BORDER: Partial<Record<Role, string>> = {
  Creator: 'status-info-border',
  Verifier: 'status-warn-border',
  Approver: 'status-success-border',
  Finance: 'status-paid-border',
  Payment: 'status-purple-border',
  Auditor: 'status-chart1-border',
};
