import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { PageHeader } from "@/components/Bits";
import { useSession } from "@/lib/hooks";

export const Route = createFileRoute("/ipp/profile/")({
  head: () => ({ meta: [{ title: "Profile — PMIS" }] }),
  component: Prof,
});

function Prof() {
  const user = useSession();
  if (!user) return null;
  return (
    <AppShell role="ipp">
      <PageHeader title="Profile" subtitle="IPP profile and KYC details" />
      <div className="rounded-xl border bg-card p-6 max-w-2xl">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-semibold">{user.name[0]}</div>
          <div>
            <div className="text-lg font-semibold">{user.name}</div>
            <div className="text-sm text-muted-foreground">{user.org}</div>
          </div>
        </div>
        <dl className="mt-6 grid grid-cols-2 gap-4 text-sm">
          <Row k="Email" v={user.email} />
          <Row k="Role" v="IPP (Investor)" />
          <Row k="Organization" v={user.org ?? "—"} />
          <Row k="KYC Status" v={<span className="text-chart-4">Verified</span>} />
        </dl>
      </div>
    </AppShell>
  );
}
function Row({ k, v }: { k: string; v: React.ReactNode }) { return <div><div className="text-xs text-muted-foreground">{k}</div><div className="font-medium">{v}</div></div>; }
