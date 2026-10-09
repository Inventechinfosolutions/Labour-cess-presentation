import { createFileRoute } from "@tanstack/react-router";
import { NotifPage } from '@/routes/ipp/notifications/index'
export const Route = createFileRoute("/approver/notifications/")({
  head: () => ({ meta: [{ title: "Notifications — PMIS" }] }),
  component: () => <NotifPage role="approver" />,
});
