import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";

import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { BLOG_POSTS, SITE } from "@/lib/content";

export const Route = createFileRoute("/blog/$slug")({
  loader: ({ params }) => {
    const post = BLOG_POSTS.find((p) => p.slug === params.slug);
    if (!post) throw notFound();
    return { post };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [{ title: `Article not found — ${SITE.name}` }, { name: "robots", content: "noindex" }],
      };
    }
    const { post } = loaderData;
    return {
      meta: [
        { title: `${post.title} — ${SITE.name}` },
        { name: "description", content: post.excerpt },
        { property: "og:title", content: post.title },
        { property: "og:description", content: post.excerpt },
        { property: "og:type", content: "article" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  notFoundComponent: PostNotFound,
  component: BlogPostPage,
});

function PostNotFound() {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto w-full max-w-2xl px-5 py-24 text-center">
        <h1 className="text-4xl">Article not found</h1>
        <p className="mt-3 text-muted-foreground">
          That piece has moved or never existed.
        </p>
        <Link to="/blog" className="mt-6 inline-block text-primary hover:underline">
          Back to all articles
        </Link>
      </main>
      <SiteFooter />
    </div>
  );
}

function BlogPostPage() {
  const { post } = Route.useLoaderData();

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto w-full max-w-2xl px-5 py-20">
        <Link
          to="/blog"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" /> All articles
        </Link>
        <p className="mt-8 text-xs uppercase tracking-widest text-primary">
          {post.category}
        </p>
        <h1 className="mt-3 text-4xl leading-tight md:text-5xl">{post.title}</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          {post.date} · {post.readingTime}
        </p>
        <div className="mt-10 space-y-5 text-[1.05rem] leading-relaxed text-foreground/90">
          {post.body.map((para) => (
            <p key={para.slice(0, 24)}>{para}</p>
          ))}
        </div>
        <div className="mt-14 rounded-2xl border border-border bg-surface p-6">
          <h2 className="text-2xl">Write your next post in your own voice</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {SITE.name} learns from your own posts, then drafts in that voice.
          </p>
          <Link
            to="/auth"
            className="mt-4 inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Start writing
          </Link>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
