import { Outlet, createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/companies/$companyId")({
  component: CompanyLayout,
})

function CompanyLayout() {
  return <Outlet />
}
