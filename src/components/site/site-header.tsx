import { Link } from "@tanstack/react-router";
import { Asterisk, Menu } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { SITE } from "@/lib/content";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/", label: "Home" },
  
  { to: "/blog", label: "Blog" },
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-5">
        <Link to="/" className="flex items-center gap-2">
          <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Asterisk className="size-5" />
          </span>
          <span className="text-lg tracking-tight">
            <span className="font-display text-xl">Oxly</span>{" "}
            <span className="text-muted-foreground">Writer</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
              activeProps={{ className: "text-foreground" }}
              activeOptions={{ exact: item.to === "/" }}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <Button asChild variant="ghost" size="sm">
            <Link to="/auth">Log in</Link>
          </Button>
          <Button asChild size="sm">
            <Link to="/auth">Start writing</Link>
          </Button>
        </div>

        <button
          type="button"
          aria-label="Toggle menu"
          onClick={() => setOpen((v) => !v)}
          className="rounded-md p-2 text-muted-foreground md:hidden"
        >
          <Menu className="size-5" />
        </button>
      </div>

      <div
        className={cn(
          "border-t border-border/60 md:hidden",
          open ? "block" : "hidden",
        )}
      >
        <div className="mx-auto flex max-w-6xl flex-col gap-1 px-5 py-3">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setOpen(false)}
              className="rounded-md px-2 py-2 text-sm text-muted-foreground"
            >
              {item.label}
            </Link>
          ))}
          <Button asChild size="sm" className="mt-2">
            <Link to="/auth" onClick={() => setOpen(false)}>
              Start writing with {SITE.name}
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
