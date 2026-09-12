import { createFileRoute, Link, Outlet, useNavigate } from "@tanstack/react-router";
import { Asterisk, FileText, LogOut, Settings, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/app")({
  component: AppShell,
});

const LINKS = [
  { to: "/app/drafts", label: "Drafts", icon: FileText },
  { to: "/app/voice", label: "Voice profile", icon: Sparkles },
  { to: "/app/settings", label: "Settings", icon: Settings },
] as const;

function AppShell() {
  const navigate = useNavigate();

  async function signOut() {
    await supabase.auth.signOut();
    navigate({ to: "/auth" });
  }

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <aside className="flex shrink-0 flex-col border-b border-border bg-sidebar px-4 py-4 md:w-60 md:border-b-0 md:border-r md:py-6">
        <Link to="/app/drafts" className="mb-6 flex items-center gap-2">
          <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Asterisk className="size-5" />
          </span>
          <span className="font-display text-lg">Oxly Writer</span>
        </Link>

        <nav className="flex gap-1 md:flex-col">
          {LINKS.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-foreground"
              activeProps={{ className: "bg-sidebar-accent text-foreground" }}
            >
              <link.icon className="size-4" />
              {link.label}
            </Link>
          ))}
        </nav>

        <Button
          variant="ghost"
          size="sm"
          onClick={signOut}
          className="mt-auto hidden justify-start text-muted-foreground md:flex"
        >
          <LogOut className="mr-2 size-4" /> Sign out
        </Button>
      </aside>

      <main className="min-w-0 flex-1">
        <Outlet />
      </main>
    </div>
  );
}
