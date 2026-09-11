import { Link } from "@tanstack/react-router";

import { SITE } from "@/lib/content";

export function SiteFooter() {
  return (
    <footer className="border-t border-border/60 py-12">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-5 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="font-display text-xl">{SITE.name}</p>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            Drafts in your own voice, not the internet&apos;s average.
          </p>
        </div>
        <nav className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
          <Link to="/" className="hover:text-foreground">
            Home
          </Link>
          <Link to="/blog" className="hover:text-foreground">
            Blog
          </Link>
          <Link to="/auth" className="hover:text-foreground">
            Log in
          </Link>
          <a href={`mailto:${SITE.email}`} className="hover:text-foreground">
            {SITE.email}
          </a>
        </nav>
      </div>
      <p className="mx-auto mt-8 max-w-6xl px-5 text-xs text-muted-foreground">
        © {new Date().getFullYear()} {SITE.name}. All rights reserved.
      </p>
    </footer>
  );
}
