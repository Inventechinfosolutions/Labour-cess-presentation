import type { Role } from '@/store/types';
import { useApp } from '@/store/AppStore';
import { CreatorDashboard } from '@/pages/CreatorDashboard';
import { RoleDashboard } from '@/pages/RoleDashboard';

export function DashboardPage() {
  const { currentRole } = useApp();
  const role: Role = (currentRole ?? 'Creator') as Role;

  if (role === 'Creator') {
    return <CreatorDashboard />;
  }

  return <RoleDashboard role={role} />;
}
