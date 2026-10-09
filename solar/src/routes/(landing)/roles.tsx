import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { session, rolePath } from "@/lib/hooks";
import type { Role } from "@/lib/types";
import { Briefcase, ShieldCheck, FileCheck, Settings, BarChart3, Sun, ArrowRight } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/(landing)/roles")({
  head: () => ({ meta: [{ title: "Choose a role — PMIS" }] }),
  component: Roles,
});

const ROLES: { role: Role; title: string; desc: string; icon: typeof Briefcase }[] = [
  { role: "ipp", title: "IPP (Investor)", desc: "Browse opportunities, apply for projects, track approvals and milestones", icon: Briefcase },
  { role: "officer", title: "Officer", desc: "Validate applications, raise queries, monitor SLA and escalations", icon: ShieldCheck },
  { role: "approver", title: "Approver", desc: "Senior authority — final approval or rejection with audit remarks", icon: FileCheck },
  { role: "admin", title: "Admin", desc: "Configure project types, document checklists, workflows and opportunities", icon: Settings },
  { role: "management", title: "Management", desc: "Portfolio analytics, capacity tracking, SLA performance dashboards", icon: BarChart3 },
];

function Roles() {
  const navigate = useNavigate();
  const enter = (role: Role) => {
    const u = session.loginAs(role);
    toast.success(`Signed in as ${u.name}`);
    navigate({ to: rolePath(role) as never });
  };
  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-muted/45 to-primary/[0.04] px-4 py-16">
      <div className="mx-auto max-w-5xl">
        <Link to="/" className="mb-8 inline-flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary/85 text-primary-foreground shadow-md shadow-primary/20 ring-1 ring-primary/20"><Sun className="h-5 w-5" /></div>
          <span className="font-semibold">PMIS</span>
        </Link>
        <div className="text-center max-w-xl mx-auto mb-10">
          <div className="text-xs uppercase tracking-widest text-primary font-semibold">Demo mode</div>
          <h1 className="mt-2 text-3xl md:text-4xl font-semibold tracking-tight">Choose your role to explore</h1>
          <p className="mt-3 text-muted-foreground">Each role sees only the screens and actions relevant to their work. The same project data is shared across roles.</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {ROLES.map((r) => (
            <button key={r.role} type="button" onClick={() => enter(r.role)}
              className="group rounded-xl border border-primary/10 bg-card p-6 text-left shadow-sm transition-all hover:border-primary/35 hover:shadow-md">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-gradient-to-br from-primary/12 to-primary/6 text-primary ring-1 ring-primary/10"><r.icon className="h-5 w-5" /></div>
              <div className="mt-4 font-semibold text-lg">{r.title}</div>
              <div className="text-sm text-muted-foreground mt-1">{r.desc}</div>
              <div className="mt-5 inline-flex items-center text-sm text-primary font-medium opacity-0 group-hover:opacity-100 transition">Enter as {r.title} <ArrowRight className="h-4 w-4 ml-1" /></div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
