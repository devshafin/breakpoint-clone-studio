import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import { Asterisk, FileText, Settings, Sparkles } from "lucide-react";


export const Route = createFileRoute("/_authenticated/app")({
  component: AppShell,
});

const LINKS = [
  { to: "/app/drafts", label: "Drafts", icon: FileText },
  { to: "/app/voice", label: "Voice profile", icon: Sparkles },
  { to: "/app/settings", label: "Settings", icon: Settings },
] as const;

function AppShell() {
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

      </aside>

      <main className="min-w-0 flex-1">
        <Outlet />
      </main>
    </div>
  );
}
