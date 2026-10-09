import type { LucideIcon } from "lucide-react"
import { Shield, Building2, KeyRound, Headphones, Landmark, ClipboardCheck, UserCog } from "lucide-react"
import { PageHeader } from "@/components/shared/PageHeader"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { PERMISSION_ACTIONS, PERMISSION_MODULES } from "@/types/admin"
import { toast } from "sonner"
import { usePageTransition } from "@/hooks/useGsap"
import { cn } from "@/lib/utils"

const ROLES: {
  id: string
  name: string
  users: number
  description: string
  icon: LucideIcon
  tone: string
}[] = [
  { id: "super_admin", name: "Super Admin", users: 3, description: "Full platform access", icon: Shield, tone: "bg-rose-500/10 text-rose-600" },
  { id: "site_admin", name: "Site Admin", users: 24, description: "Site-level management", icon: Building2, tone: "bg-sky-500/10 text-sky-600" },
  { id: "building_manager", name: "Building Manager", users: 48, description: "Building operations", icon: KeyRound, tone: "bg-amber-500/10 text-amber-600" },
  { id: "reception", name: "Reception Staff", users: 120, description: "Check-in/out operations", icon: UserCog, tone: "bg-emerald-500/10 text-emerald-600" },
  { id: "finance", name: "Finance Team", users: 18, description: "Payments and refunds", icon: Landmark, tone: "bg-violet-500/10 text-violet-600" },
  { id: "auditor", name: "Auditor", users: 8, description: "Read-only audit access", icon: ClipboardCheck, tone: "bg-slate-500/10 text-slate-600" },
  { id: "support", name: "Support Team", users: 32, description: "User support operations", icon: Headphones, tone: "bg-cyan-500/10 text-cyan-600" },
]

export function RolesPermissionsPage() {
  const pageRef = usePageTransition()

  return (
    <div ref={pageRef}>
      <PageHeader
        variant="admin"
        title="Roles & Permissions"
        description="Role-based access control and permission matrix"
      />

      <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {ROLES.map((role) => (
          <Card
            key={role.id}
            className="admin-card cursor-pointer gap-0 py-0 transition-colors hover:border-primary/40"
            onClick={() => toast.info(`Editing role: ${role.name}`)}
          >
            <CardContent className="flex items-start gap-3 p-4">
              <div className={cn("flex size-10 shrink-0 items-center justify-center rounded-xl", role.tone)}>
                <role.icon className="size-5" />
              </div>
              <div className="min-w-0">
                <p className="font-semibold">{role.name}</p>
                <p className="text-sm text-muted-foreground">{role.description}</p>
                <Badge variant="outline" className="mt-2 rounded-full">
                  {role.users} users
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="admin-card gap-0 py-0">
        <CardHeader className="border-b border-border/40 px-5 py-4">
          <CardTitle className="text-base">Permission Matrix — Super Admin</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="admin-table-wrap rounded-none border-0 shadow-none">
            <Table>
              <TableHeader>
                <TableRow className="border-border/60 hover:bg-transparent">
                  <TableHead className="admin-table-head">
                    Module
                  </TableHead>
                  {PERMISSION_ACTIONS.map((action) => (
                    <TableHead
                      key={action}
                      className="admin-table-head text-center"
                    >
                      {action.replace("_", " ")}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {PERMISSION_MODULES.map((mod) => (
                  <TableRow key={mod} className="border-border/40">
                    <TableCell className="px-4 py-3.5 font-medium capitalize">{mod}</TableCell>
                    {PERMISSION_ACTIONS.map((action) => (
                      <TableCell key={action} className="px-4 py-3.5 text-center">
                        <Checkbox
                          defaultChecked={mod !== "audit" || action === "read"}
                          onCheckedChange={() => toast.success("Permission updated (demo)")}
                        />
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
