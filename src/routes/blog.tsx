import { createFileRoute, Link } from "@tanstack/react-router";

import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { BLOG_POSTS, SITE } from "@/lib/content";

export const Route = createFileRoute("/blog")({
  head: () => ({
    meta: [
      { title: `Writing craft, no slop — ${SITE.name} blog` },
      {
        name: "description",
        content:
          "Essays on voice, thread structure and editing with AI without sounding like everyone else.",
      },
      { property: "og:title", content: `${SITE.name} blog` },
      {
        property: "og:description",
        content: "Essays on voice, thread structure and editing with AI.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: BlogIndex,
});

function BlogIndex() {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto w-full max-w-4xl px-5 py-20">
        <p className="text-xs uppercase tracking-[0.2em] text-primary">From the blog</p>
        <h1 className="mt-4 text-4xl md:text-5xl">Writing craft. No slop.</h1>

        <div className="mt-12 grid gap-4">
          {BLOG_POSTS.map((post) => (
            <Link
              key={post.slug}
              to="/blog/$slug"
              params={{ slug: post.slug }}
              className="group rounded-2xl border border-border bg-surface p-6 transition-colors hover:border-primary/50"
            >
              <p className="text-xs uppercase tracking-widest text-primary">
                {post.category}
              </p>
              <h2 className="mt-3 text-2xl group-hover:text-primary">{post.title}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{post.excerpt}</p>
              <p className="mt-4 text-xs text-muted-foreground">
                {post.date} · {post.readingTime}
              </p>
            </Link>
          ))}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
