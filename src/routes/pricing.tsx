import { createFileRoute, Link } from "@tanstack/react-router";
import { Check } from "lucide-react";

import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { FAQ, PLAN_FEATURES, SITE } from "@/lib/content";

export const Route = createFileRoute("/pricing")({
  head: () => ({
    meta: [
      { title: `Pricing — ${SITE.name}` },
      {
        name: "description",
        content: `One plan, $${SITE.priceMonthly} a month. Voice profile, unlimited drafts in your voice, chat refinement and one-tap publishing.`,
      },
      { property: "og:title", content: `Pricing — ${SITE.name}` },
      {
        property: "og:description",
        content: `One plan, $${SITE.priceMonthly} a month. Cancel anytime.`,
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PricingPage,
});

function PricingPage() {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto w-full max-w-4xl px-5 py-20">
        <div className="text-center">
          <p className="text-xs uppercase tracking-[0.2em] text-primary">Pricing</p>
          <h1 className="mt-4 text-4xl md:text-5xl">One plan. No seat maths.</h1>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
            Build your voice profile first, subscribe after you have read a draft that
            actually sounds like you.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-[1.1fr_0.9fr]">
          <div className="warm-panel rounded-2xl p-8">
            <p className="text-sm uppercase tracking-widest text-primary">Pro</p>
            <p className="mt-4 font-display text-5xl">
              ${SITE.priceMonthly}
              <span className="font-sans text-base text-muted-foreground"> / month</span>
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              or ${SITE.priceYearly} / year · two months free
            </p>
            <ul className="mt-8 space-y-3">
              {PLAN_FEATURES.map((f) => (
                <li key={f} className="flex items-start gap-3 text-sm">
                  <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
            <Button asChild size="lg" className="mt-8 w-full">
              <Link to="/auth">Get started</Link>
            </Button>
            <p className="mt-3 text-center text-xs text-muted-foreground">
              Sign up, see your voice profile, then subscribe. Cancel anytime.
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-surface-2 p-8">
            <h2 className="text-2xl">What you get on day one</h2>
            <p className="mt-3 text-sm text-muted-foreground">
              A voice profile trained on your own posts, an editor that keeps every
              draft, and a chat that edits instead of regenerating.
            </p>
            <div className="mt-6 space-y-4 text-sm text-muted-foreground">
              <p>
                <span className="text-foreground">No usage anxiety.</span> The monthly
                allowance is sized for a daily posting habit.
              </p>
              <p>
                <span className="text-foreground">Nothing auto-posts.</span> Every
                publish is a tap you make.
              </p>
              <p>
                <span className="text-foreground">Your data stays yours.</span> Profiles
                and drafts are private to your account.
              </p>
            </div>
          </div>
        </div>

        <section className="mt-20">
          <h2 className="text-3xl">Questions</h2>
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
      </main>
      <SiteFooter />
    </div>
  );
}
