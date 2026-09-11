import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowRight, Check, Quote, Sparkles, X } from "lucide-react";

import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  BLOG_POSTS,
  DEMO_DRAFTS,
  FAQ,
  PLAN_FEATURES,
  ROADMAP,
  SITE,
  STEPS,
} from "@/lib/content";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: `${SITE.name} — write like you, not like AI` },
      { name: "description", content: SITE.description },
      { property: "og:title", content: `${SITE.name} — write like you, not like AI` },
      { property: "og:description", content: SITE.description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main>
        <Hero />
        <DemoSection />
        <BeforeAfter />
        <Steps />
        <VoiceProfile />
        <ChatRefinement />
        <SourceGrounded />
        <Roadmap />
        <PricingBlock />
        <FaqBlock />
        <FinalCta />
        <BlogTeaser />
      </main>
      <SiteFooter />
    </div>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 lamp-glow" aria-hidden />
      <div className="relative mx-auto w-full max-w-4xl px-5 pb-16 pt-24 text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 text-xs text-muted-foreground">
          <Sparkles className="size-3 text-primary" /> Trained on your posts, not the
          internet&apos;s average
        </span>
        <h1 className="mt-8 text-5xl leading-[1.05] md:text-7xl">
          Write like you.
          <br />
          <span className="text-gradient-warm">Not like AI.</span>
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground">
          {SITE.description}
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button asChild size="lg">
            <Link to="/auth">
              Start writing <ArrowRight className="ml-2 size-4" />
            </Link>
          </Button>
          <Button asChild size="lg" variant="secondary">
            <a href="#demo">See it in action</a>
          </Button>
        </div>
        <p className="mt-5 text-xs text-muted-foreground">
          Build your voice profile before you pay · Nothing posts without your tap
        </p>
      </div>
    </section>
  );
}

function DemoSection() {
  const [active, setActive] = useState(0);
  const draft = DEMO_DRAFTS[active]!;

  return (
    <section id="demo" className="mx-auto w-full max-w-5xl px-5 py-16">
      <div className="warm-panel overflow-hidden rounded-2xl">
        <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-3 text-xs text-muted-foreground">
          <span className="font-mono">oxlywriter.app / workspace</span>
          <span>Live demo · sample data</span>
        </div>
        <div className="grid gap-0 md:grid-cols-[240px_1fr]">
          <div className="border-b border-border p-3 md:border-b-0 md:border-r">
            {DEMO_DRAFTS.map((d, i) => (
              <button
                key={d.id}
                type="button"
                onClick={() => setActive(i)}
                className={cn(
                  "block w-full rounded-lg px-3 py-2 text-left text-sm transition-colors",
                  i === active
                    ? "bg-secondary text-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <span className="block truncate">{d.title}</span>
                <span className="mt-1 block text-xs text-primary">
                  {d.status} · {d.date}
                </span>
              </button>
            ))}
          </div>
          <div className="space-y-3 p-5">
            {draft.tweets.map((t, i) => (
              <div key={i} className="rounded-xl border border-border bg-surface-2 p-4">
                <p className="text-xs uppercase tracking-widest text-muted-foreground">
                  Post {i + 1}
                </p>
                <p className="mt-2 leading-relaxed">{t}</p>
                <p className="mt-2 text-xs text-muted-foreground">
                  {t.length} / 280
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
      <p className="mt-4 text-center text-sm text-muted-foreground">
        Every post above is sample data. Yours would be, well, yours.{" "}
        <Link to="/auth" className="text-primary hover:underline">
          Start your own workspace
        </Link>
      </p>
    </section>
  );
}

function BeforeAfter() {
  return (
    <section className="mx-auto w-full max-w-5xl px-5 py-16">
      <h2 className="text-center text-4xl">The difference is the training data</h2>
      <div className="mt-10 grid gap-5 md:grid-cols-2">
        <div className="rounded-2xl border border-destructive/40 bg-surface p-6">
          <p className="flex items-center gap-2 text-xs uppercase tracking-widest text-destructive">
            <X className="size-4" /> Generic model
          </p>
          <p className="mt-4 leading-relaxed">
            🚀 Excited to share a major update! Our new feature unlocks seamless
            productivity for creators — a true game-changer. We can&apos;t wait for you
            to dive in. #ProductLaunch #BuildInPublic
          </p>
          <p className="mt-4 text-sm text-muted-foreground">
            Hyped. Hashtag-stuffed. Reads like a robot in a lanyard.
          </p>
        </div>
        <div className="rounded-2xl border border-primary/50 bg-surface p-6">
          <p className="flex items-center gap-2 text-xs uppercase tracking-widest text-primary">
            <Check className="size-4" /> Your voice
          </p>
          <p className="mt-4 leading-relaxed">
            shipped a thing: oxly now reads your own posts and learns the voice. drop a
            thought in, get back you, not a chatbot. live now.
          </p>
          <p className="mt-4 text-sm text-muted-foreground">
            Lower case on purpose. Specific. Sounds like a person.
          </p>
        </div>
      </div>
    </section>
  );
}

function Steps() {
  return (
    <section className="mx-auto w-full max-w-5xl px-5 py-16">
      <div className="grid gap-6 md:grid-cols-3">
        {STEPS.map((s) => (
          <div key={s.step} className="rounded-2xl border border-border bg-surface p-6">
            <p className="text-xs uppercase tracking-widest text-primary">{s.step}</p>
            <h3 className="mt-3 text-2xl">{s.title}</h3>
            <p className="mt-2 text-sm text-foreground/90">{s.lede}</p>
            <p className="mt-3 text-sm text-muted-foreground">{s.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function VoiceProfile() {
  return (
    <section className="mx-auto w-full max-w-5xl px-5 py-16">
      <div className="grid gap-8 md:grid-cols-2 md:items-center">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-primary">
            Voice profile
          </p>
          <h2 className="mt-4 text-4xl">Trained on your writing, not the internet.</h2>
          <p className="mt-4 text-muted-foreground">
            The analyzer reads your posts. It knows the words you use, the rhythm of
            your sentences, and the moves you make.
          </p>
          <p className="mt-3 text-muted-foreground">
            Edit any field you disagree with. The writer retrains on the corrected
            version and keeps learning as you publish. The result is a fingerprint, not
            a persona.
          </p>
        </div>
        <div className="warm-panel rounded-2xl p-6">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">
            Signature phrases
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {[
              "ship the ugly version",
              "taste compounds",
              "nobody tells you this",
              "in practice",
              "load-bearing",
              "receipts",
            ].map((p) => (
              <span
                key={p}
                className="rounded-full bg-secondary px-3 py-1 text-xs text-secondary-foreground"
              >
                {p}
              </span>
            ))}
          </div>
          <p className="mt-6 text-xs uppercase tracking-widest text-muted-foreground">
            Forbidden patterns
          </p>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            {["Let's dive in", "Game-changer", "Unlock your potential"].map((p) => (
              <li key={p} className="flex items-center gap-2">
                <X className="size-3.5 text-destructive" /> {p}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

function ChatRefinement() {
  return (
    <section className="mx-auto w-full max-w-5xl px-5 py-16">
      <div className="grid gap-8 md:grid-cols-2 md:items-center">
        <div className="warm-panel order-2 rounded-2xl p-6 md:order-1">
          <div className="space-y-3 text-sm">
            <p className="ml-auto max-w-[85%] rounded-xl bg-primary/15 px-3 py-2">
              make it punchier. drop the corporate verbs.
            </p>
            <p className="max-w-[85%] rounded-xl bg-surface-2 px-3 py-2 text-muted-foreground">
              Tightened the highlighted line and dropped the press-release verbs.
            </p>
          </div>
          <div className="mt-5 rounded-xl border border-border bg-surface-2 p-4 text-sm">
            <p className="text-muted-foreground line-through">
              it&apos;s transformative for the productivity landscape.
            </p>
            <p className="mt-2">it&apos;s about to flip everyone&apos;s workflow.</p>
          </div>
        </div>
        <div className="order-1 md:order-2">
          <p className="text-xs uppercase tracking-[0.2em] text-primary">
            Chat refinement
          </p>
          <h2 className="mt-4 text-4xl">Just say what to change.</h2>
          <p className="mt-4 text-muted-foreground">
            &ldquo;Make it punchier.&rdquo; &ldquo;Drop the formality.&rdquo; Highlight
            a line and it lands in the chat as a quote, so you fix only that bit.
          </p>
          <p className="mt-3 text-muted-foreground">
            Accept or reject every suggested edit. The draft you liked never gets thrown
            away by a regenerate button.
          </p>
        </div>
      </div>
    </section>
  );
}

function SourceGrounded() {
  return (
    <section className="mx-auto w-full max-w-5xl px-5 py-16">
      <div className="grid gap-8 md:grid-cols-2 md:items-center">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-primary">
            Source-grounded drafts
          </p>
          <h2 className="mt-4 text-4xl">Drop a link. Get a draft that holds up.</h2>
          <p className="mt-4 text-muted-foreground">
            Paste a URL, a quoted post, or a paragraph from a paper. The writer reads it
            and grounds the draft against it.
          </p>
          <p className="mt-3 text-muted-foreground">
            Every claim traces back to a source you provided. No invented stats, no
            reworded press releases dressed up as your hot take.
          </p>
        </div>
        <div className="warm-panel rounded-2xl p-6">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">
            Sources for this draft
          </p>
          <ul className="mt-3 space-y-2 text-sm">
            {[
              { label: "research note", meta: "68 lines pasted" },
              { label: "quoted post", meta: "thread on cost per task" },
              { label: "product changelog", meta: "web" },
            ].map((s) => (
              <li
                key={s.label}
                className="flex items-center justify-between rounded-lg border border-border bg-surface-2 px-3 py-2"
              >
                <span>{s.label}</span>
                <span className="text-xs text-muted-foreground">{s.meta}</span>
              </li>
            ))}
          </ul>
          <div className="mt-5 rounded-xl border border-border bg-surface-2 p-4 text-sm leading-relaxed">
            <Quote className="mb-2 size-4 text-primary" />
            the interesting number isn&apos;t the benchmark. it&apos;s cost per finished
            task, and that line has been falling for three weeks straight.
          </div>
        </div>
      </div>
    </section>
  );
}

function Roadmap() {
  return (
    <section className="mx-auto w-full max-w-5xl px-5 py-10">
      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-border bg-surface p-5">
        <span className="text-xs uppercase tracking-widest text-muted-foreground">
          On the roadmap
        </span>
        {ROADMAP.map((r) => (
          <span key={r} className="rounded-full bg-secondary px-3 py-1 text-xs">
            {r}
          </span>
        ))}
      </div>
    </section>
  );
}

function PricingBlock() {
  return (
    <section className="mx-auto w-full max-w-3xl px-5 py-16">
      <div className="warm-panel rounded-2xl p-8 text-center">
        <p className="text-xs uppercase tracking-widest text-primary">Early access</p>
        <p className="mt-4 font-display text-5xl">
          Free
          <span className="font-sans text-base text-muted-foreground">
            {" "}
            · everything included
          </span>
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          No card, no seats, no trial clock. Bring your own keys if you want to.
        </p>
        <ul className="mx-auto mt-8 grid max-w-md gap-3 text-left">
          {PLAN_FEATURES.map((f) => (
            <li key={f} className="flex items-start gap-3 text-sm">
              <Check className="mt-0.5 size-4 shrink-0 text-primary" />
              {f}
            </li>
          ))}
        </ul>
        <Button asChild size="lg" className="mt-8">
          <Link to="/auth">Get started</Link>
        </Button>
      </div>
    </section>
  );
}

function FaqBlock() {
  return (
    <section className="mx-auto w-full max-w-3xl px-5 py-16">
      <h2 className="text-4xl">Questions</h2>
      <Accordion type="single" collapsible className="mt-6">
        {FAQ.map((item) => (
          <AccordionItem key={item.q} value={item.q}>
            <AccordionTrigger className="text-left">{item.q}</AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
              {item.a}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
}

function FinalCta() {
  return (
    <section className="relative overflow-hidden py-24">
      <div className="pointer-events-none absolute inset-0 lamp-glow" aria-hidden />
      <div className="relative mx-auto max-w-2xl px-5 text-center">
        <p className="text-xs uppercase tracking-[0.2em] text-primary">
          Ready when you are
        </p>
        <h2 className="mt-4 text-5xl">
          Your next post, <em className="text-gradient-warm">in your voice.</em>
        </h2>
        <p className="mt-4 text-muted-foreground">
          Paste a handful of your own posts, get a voice profile, and read your first
          draft in the next five minutes.
        </p>
        <Button asChild size="lg" className="mt-8">
          <Link to="/auth">Start writing</Link>
        </Button>
        <p className="mt-4 text-xs text-muted-foreground">
          Free while in early access. No card needed.
        </p>
      </div>
    </section>
  );
}

function BlogTeaser() {
  return (
    <section className="mx-auto w-full max-w-5xl px-5 pb-20">
      <div className="flex items-end justify-between gap-4">
        <h2 className="text-3xl">Writing craft. No slop.</h2>
        <Link to="/blog" className="text-sm text-primary hover:underline">
          All articles
        </Link>
      </div>
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {BLOG_POSTS.map((post) => (
          <Link
            key={post.slug}
            to="/blog/$slug"
            params={{ slug: post.slug }}
            className="rounded-2xl border border-border bg-surface p-5 transition-colors hover:border-primary/50"
          >
            <p className="text-xs uppercase tracking-widest text-primary">
              {post.category}
            </p>
            <p className="mt-2 font-display text-xl">{post.title}</p>
            <p className="mt-2 text-xs text-muted-foreground">
              {post.date} · {post.readingTime}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}
