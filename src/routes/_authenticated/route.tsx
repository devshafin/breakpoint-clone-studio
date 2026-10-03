import { createFileRoute, Outlet } from "@tanstack/react-router";

import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    const { data } = await supabase.auth.getUser();
    if (data.user) return { user: data.user };
    // No login screen: every visitor gets a private guest workspace automatically.
    const { data: anon, error } = await supabase.auth.signInAnonymously();
    if (error || !anon.user) throw error ?? new Error("Could not open workspace");
    return { user: anon.user };
  },
  component: () => <Outlet />,
});
