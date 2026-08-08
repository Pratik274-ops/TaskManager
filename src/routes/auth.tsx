import { createFileRoute } from "@tanstack/react-router";

import { LoginScreen } from "@/components/login-screen";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — Taskly" },
      { name: "description", content: "Sign in to Taskly or continue as a guest." },
      { property: "og:title", content: "Sign in — Taskly" },
      { property: "og:description", content: "Sign in to Taskly or continue as a guest." },
    ],
  }),
  component: LoginScreen,
});
