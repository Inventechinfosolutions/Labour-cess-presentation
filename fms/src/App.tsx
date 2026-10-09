import { useEffect, useMemo } from 'react';
import { Toaster } from '@/components/ui/sonner';
import { AppProvider, useApp } from '@/store/AppStore';
import { ThemeProvider } from '@/components/theme/ThemeProvider';
import { RouterProvider, useRouter, match } from '@/router';
import { LandingPage } from '@/pages/LandingPage';
import { LoginPage } from '@/pages/Login';
import { ModuleSelectionPage } from '@/pages/ModuleSelection';
import { RoleSelectionPage } from '@/pages/RoleSelection';
import { DashboardPage } from '@/pages/Dashboard';
import { BillsPage } from '@/pages/Bills';
import { BillCreatePage } from '@/pages/BillCreate';
import { BillDetailPage } from '@/pages/BillDetail';
import { TasksPage } from '@/pages/Tasks';
import { TaskDetailPage } from '@/pages/TaskDetail';
import { PaymentsPage } from '@/pages/Payments';
import { ReconciliationPage } from '@/pages/Reconciliation';
import { ReconciliationBatchDetailPage } from '@/pages/ReconciliationBatchDetail';
import { BudgetsPage } from '@/pages/Budgets';
import { BudgetCreatePage } from '@/pages/BudgetCreate';
import { BudgetDetailPage } from '@/pages/BudgetDetail';
import { ReceiptsPage } from '@/pages/Receipts';
import { ReceiptCreatePage } from '@/pages/ReceiptCreate';
import { ReceiptDetailPage } from '@/pages/ReceiptDetail';
import { ReceiptDuplicateReviewPage } from '@/pages/ReceiptDuplicateReviewPage';
import { ReceiptDuplicatesPage } from '@/pages/ReceiptDuplicates';
import { ReportsPage } from '@/pages/Reports';
import { AuditLogsPage } from '@/pages/AuditLogs';
import { AppShell } from '@/components/layout/AppShell';
import { SmoothScroll } from '@/components/animations/SmoothScroll';

function Routes() {
  const { path, navigate } = useRouter();
  const { currentRole } = useApp();

  const cleanPath = useMemo(() => path.split('?')[0], [path]);

  useEffect(() => {
    const appPaths = ['/dashboard', '/bills', '/tasks', '/payments', '/reconciliation', '/budgets', '/receipts', '/reports', '/audit'];
    const isAppPage = appPaths.some((p) => cleanPath === p || cleanPath.startsWith(p + '/'));
    if (isAppPage && !currentRole) {
      navigate('/login');
      return;
    }
    // Auditor doesn't have tasks — bounce to audit logs
    if (currentRole === 'Auditor' && (cleanPath === '/tasks' || cleanPath.startsWith('/tasks/'))) {
      navigate('/audit');
    }
  }, [cleanPath, currentRole, navigate]);

  if (cleanPath === '/' || cleanPath === '') return <LandingPage />;
  if (cleanPath === '/login') return <LoginPage />;
  if (cleanPath === '/modules') return <ModuleSelectionPage />;
  if (cleanPath === '/roles') return <RoleSelectionPage />;

  if (!currentRole) {
    return <LoginPage />;
  }

  const billDetailParams = match('/bills/:id', cleanPath);
  if (billDetailParams && billDetailParams.id !== 'new') {
    return (
      <AppShell>
        <BillDetailPage billId={billDetailParams.id} />
      </AppShell>
    );
  }

  const taskDetailParams = match('/tasks/:id', cleanPath);
  if (taskDetailParams) {
    return (
      <AppShell>
        <TaskDetailPage taskId={taskDetailParams.id} />
      </AppShell>
    );
  }

  // Budget routes
  const budgetEditParams = match('/budgets/:id/edit', cleanPath);
  if (budgetEditParams) {
    return (
      <AppShell>
        <BudgetCreatePage budgetId={budgetEditParams.id} />
      </AppShell>
    );
  }
  const budgetDetailParams = match('/budgets/:id', cleanPath);
  if (budgetDetailParams && budgetDetailParams.id !== 'new') {
    return (
      <AppShell>
        <BudgetDetailPage budgetId={budgetDetailParams.id} />
      </AppShell>
    );
  }

  // Receipt routes
  const receiptEditParams = match('/receipts/:id/edit', cleanPath);
  if (receiptEditParams) {
    return (
      <AppShell>
        <ReceiptCreatePage receiptId={receiptEditParams.id} />
      </AppShell>
    );
  }
  const receiptDupWorkspaceParams = match('/receipts/:id/duplicates', cleanPath);
  if (receiptDupWorkspaceParams && receiptDupWorkspaceParams.id !== 'new') {
    return (
      <AppShell>
        <ReceiptDuplicateReviewPage receiptId={receiptDupWorkspaceParams.id} />
      </AppShell>
    );
  }
  const receiptDetailParams = match('/receipts/:id', cleanPath);
  if (receiptDetailParams && receiptDetailParams.id !== 'new') {
    return (
      <AppShell>
        <ReceiptDetailPage receiptId={receiptDetailParams.id} />
      </AppShell>
    );
  }

  const reconBatchParams = match('/reconciliation/:batchId', cleanPath);
  if (reconBatchParams) {
    return (
      <AppShell>
        <ReconciliationBatchDetailPage batchId={reconBatchParams.batchId} />
      </AppShell>
    );
  }

  const inner = (() => {
    if (cleanPath === '/dashboard') return <DashboardPage />;
    if (cleanPath === '/tasks') return <TasksPage />;
    if (cleanPath === '/bills') return <BillsPage />;
    if (cleanPath === '/bills/new/vendor-payment') return <BillCreatePage preset="Vendor Payment" />;
    if (cleanPath === '/bills/new/ta-da-reimbursement') return <BillCreatePage preset="TA/DA Reimbursement" />;
    if (cleanPath === '/bills/new') return <BillCreatePage />;
    if (cleanPath === '/payments') return <PaymentsPage />;
    if (cleanPath === '/reconciliation') return <ReconciliationPage />;
    if (cleanPath === '/budgets') return <BudgetsPage />;
    if (cleanPath === '/budgets/new') return <BudgetCreatePage />;
    if (cleanPath === '/receipts') return <ReceiptsPage />;
    if (cleanPath === '/receipts/new') return <ReceiptCreatePage />;
    if (cleanPath === '/receipts/duplicates') return <ReceiptDuplicatesPage />;
    if (cleanPath === '/reports') return <ReportsPage />;
    if (cleanPath === '/audit') return <AuditLogsPage />;
    return <DashboardPage />;
  })();

  return <AppShell>{inner}</AppShell>;
}

export default function App() {
  const isLanding = (window.location.hash || '#/') === '#/' || (window.location.hash || '') === '';
  return (
    <ThemeProvider>
      <AppProvider>
        <RouterProvider>
          {isLanding ? (
            <SmoothScroll>
              <Routes />
            </SmoothScroll>
          ) : (
            <Routes />
          )}
          <Toaster richColors position="top-right" />
        </RouterProvider>
      </AppProvider>
    </ThemeProvider>
  );
}
