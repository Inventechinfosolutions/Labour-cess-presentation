import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/(landing)/register")({
  head: () => ({ meta: [{ title: "Register IPP — PMIS" }] }),
  beforeLoad: () => {
    throw redirect({ href: "/login?mode=register", replace: true });
  },
  component: () => null,
});
