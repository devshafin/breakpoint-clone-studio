# Oxly Writer — an AI writing app in your own voice

A full working app modelled on Voxly: same features and options, new name, and a fresh look. Warm dark theme with a soft amber-gold accent and a clean serif/sans pairing — premium and readable, clearly not a copy of the original colours.

## What people will be able to do

1. **Sign up and log in** — email + password, plus Google sign-in.
2. **Build a voice profile** — paste their X handle or a batch of their own posts; the app analyses vocabulary, sentence rhythm, signature phrases and "never use" phrases. Every field is editable, and saved to their account.
3. **Write a draft** — drop an idea, link, or pasted text and get back a post, a thread, or a longer article written in their voice, grounded in the sources they gave.
4. **Refine in chat** — say "make it punchier", or highlight a line and fix just that bit; accept or reject each change. History is kept per draft.
5. **Manage drafts** — a workspace list with Draft / Ready / Posted states, editing, deleting, and a share-by-link view for feedback.
6. **Publish** — one-tap publish to X once an X connection is set up (see note below); otherwise copy-to-clipboard and "mark as posted".
7. **Pricing page and subscription** — one Pro plan at a monthly and yearly price, with checkout.
8. **Marketing site** — home page with hero, live demo section, before/after "generic vs you" comparison, three-step how-it-works, voice-profile showcase, chat-refinement showcase, source-grounding section, roadmap strip, pricing, FAQ, final call-to-action, and a blog index with articles.

## Build order

**Phase 1 — Look and marketing site**
New colour system and typography; home page with every section above; pricing and FAQ; blog index and article pages; per-page titles and social preview text.

**Phase 2 — Accounts and data**
Turn on the built-in backend for login, database, and storage. Tables for profiles, voice profiles, drafts, draft versions, chat messages, and sources — each locked to its owner. Google sign-in included.

**Phase 3 — The writing engine**
Voice analysis, draft generation (post / thread / article), source-grounded writing, and chat refinement with accept/reject — all powered by the built-in AI, running server-side.

**Phase 4 — Workspace**
Draft list with status tabs, editor with per-tweet character counts, chat panel, sources panel, share-by-link page.

**Phase 5 — Publishing and payments**
X connection and one-tap posting, then the Pro subscription checkout and account billing screen.

## Things worth knowing

- **Posting to X** needs an X developer app (API key and secret) tied to your own X account. I'll build the whole publishing flow, but it can only go live once you give me those keys. Until then the button copies the post and marks it as posted.
- **Payments** need a Stripe or Paddle account connected; same idea — flow gets built, keys switch it on.
- Reading someone's X timeline automatically also depends on that X app. Before it's connected, the voice profile is built from posts the user pastes in, which works just as well.
- The AI usage runs through the built-in AI service, so no separate AI account is needed.

## Technical notes

- TanStack Start routes: `/` (landing), `/pricing`, `/blog`, `/blog/$slug`, `/auth`, `/app` (workspace layout), `/app/drafts`, `/app/drafts/$id`, `/app/voice`, `/app/settings`, `/share/$token`.
- Lovable Cloud for auth, Postgres, and RLS-scoped tables; role data kept in a separate table.
- AI calls via the Lovable AI Gateway inside `createServerFn` handlers, never client-side.
- X OAuth 2.0 handled in a server route under `src/routes/api/public/` with signature/state verification; tokens stored server-side only.
- Design tokens defined in `src/styles.css` (oklch), no hardcoded colours in components.
