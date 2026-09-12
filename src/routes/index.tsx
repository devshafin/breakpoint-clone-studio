import { createFileRoute, redirect } from "@tanstack/react-router";

import { SITE } from "@/lib/content";

export const Route = createFileRoute("/")({
  beforeLoad: () => {
    throw redirect({ to: "/auth" });
  },
  head: () => ({
    meta: [
      { title: `${SITE.name} — Writing workspace` },
      { name: "description", content: "Create and refine writing in your own voice." },
      { property: "og:title", content: `${SITE.name} — Writing workspace` },
      {
        property: "og:description",
        content: "Create and refine writing in your own voice.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
});