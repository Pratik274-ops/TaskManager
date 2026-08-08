import { createFileRoute } from "@tanstack/react-router";

import { LoginScreen } from "@/components/login-screen";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Taskly — Sign in to your task workspace" },
      {
        name: "description",
        content:
          "Sign in or continue as a guest to plan, prioritise and track your tasks across list and board views.",
      },
      { property: "og:title", content: "Taskly — Sign in to your task workspace" },
      {
        property: "og:description",
        content: "Plan, prioritise and track your tasks across list and board views.",
      },
    ],
  }),
  component: LoginScreen,
});
