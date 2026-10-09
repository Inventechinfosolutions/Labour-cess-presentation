import { createFileRoute } from "@tanstack/react-router";
import { NotifPage } from '@/routes/ipp/notifications/index'
export const Route = createFileRoute("/officer/notifications/")({
  head: () => ({ meta: [{ title: "Notifications — PMIS" }] }),
  component: () => <NotifPage role="officer" />,
});
