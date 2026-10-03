import { createFileRoute, redirect } from "@tanstack/react-router";

import { supabase } from "@/integrations/supabase/client";
import { SITE } from "@/lib/content";

export const Route = createFileRoute("/")({
  ssr: false,
  beforeLoad: async () => {
    const { data } = await supabase.auth.getSession();
    if (data.session) throw redirect({ to: "/app/drafts" });
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
