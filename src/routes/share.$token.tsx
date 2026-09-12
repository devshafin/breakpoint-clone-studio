import { createFileRoute, Link } from "@tanstack/react-router";

import { getSharedDraft } from "@/lib/ai.functions";
import { SITE } from "@/lib/content";

export const Route = createFileRoute("/share/$token")({
  loader: ({ params }) => getSharedDraft({ data: { token: params.token } }),
  head: ({ loaderData }) => {
    const title = loaderData?.draft?.title ?? "Shared draft";
    return {
      meta: [
        { title: `${title} — ${SITE.name}` },
        { name: "description", content: `A draft shared for feedback from ${SITE.name}.` },
        { property: "og:title", content: title },
        { property: "og:description", content: `A draft shared for feedback.` },
        { property: "og:type", content: "article" },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "robots", content: "noindex" },
      ],
    };
  },
  errorComponent: () => <ShareShell message="This link could not be opened." />,
  component: SharedDraftPage,
});

function ShareShell({ message }: { message: string }) {
  return (
    <div className="min-h-screen">
      <main className="mx-auto w-full max-w-2xl px-5 py-24 text-center">
        <h1 className="text-3xl">Nothing to see here</h1>
        <p className="mt-3 text-muted-foreground">{message}</p>
        <Link to="/" className="mt-6 inline-block text-primary hover:underline">
          Open {SITE.name}
        </Link>
      </main>
    </div>
  );
}

function SharedDraftPage() {
  const { draft } = Route.useLoaderData();

  if (!draft) {
    return <ShareShell message="This share link has expired or never existed." />;
  }

  const segments = (draft.segments as string[]) ?? [];

  return (
    <div className="min-h-screen">
      <main className="mx-auto w-full max-w-2xl px-5 py-16">
        <p className="text-xs uppercase tracking-widest text-primary">
          Shared draft · {draft.kind}
        </p>
        <h1 className="mt-3 text-4xl">{draft.title}</h1>
        <div className="mt-8 space-y-4">
          {segments.map((segment, i) => (
            <div key={i} className="rounded-xl border border-border bg-surface p-5">
              <p className="whitespace-pre-wrap leading-relaxed">{segment}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
