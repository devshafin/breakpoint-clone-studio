export const SITE = {
  name: "Oxly Writer",
  tagline: "Write like you. Not like AI.",
  description:
    "Oxly Writer learns your voice from your own posts. Drop an idea, get a draft that sounds like you, refine it in chat, publish in one tap.",
  email: "hello@oxlywriter.app",
};

export const DEMO_DRAFTS = [
  {
    id: "d1",
    title: "how oxly got its first 100 users",
    status: "Draft" as const,
    date: "Jul 6",
    tweets: [
      "how we got our first 100 users without a single launch thread. no product hunt, no \u201cexcited to announce\u201d. receipts below \ud83e\uddf5",
      "1/ we shipped in public, badly. every friday: the ugliest screenshot of the week. people reply to unfinished things. they lurk on polished ones.",
      "2/ we answered every reply for 60 days. not \u201cthanks \ud83d\ude4f\u201d. actual answers. that was the whole growth hack.",
    ],
  },
  {
    id: "d2",
    title: "hot take: the ai writing problem",
    status: "Ready" as const,
    date: "Jul 9",
    tweets: [
      "the ai writing problem isn't grammar. it's that every model averages the internet, and the internet is beige.",
      "1/ your timeline is a smaller, weirder, better dataset. train on that instead.",
      "2/ the test isn't \u201cis this good writing\u201d. it's \u201cwould a friend guess it was me\u201d.",
    ],
  },
  {
    id: "d3",
    title: "why your best ideas die in drafts",
    status: "Posted" as const,
    date: "Jul 12",
    tweets: [
      "your best ideas don't die from bad thinking. they die in a notes app at 1am, half-shaped, waiting for a version of you with more time.",
      "1/ shipping the ugly version beats polishing the perfect one. always has.",
      "2/ the fastest editor is a person who already sounds like you.",
    ],
  },
];

export const STEPS = [
  {
    step: "step 01",
    title: "Bring your writing",
    lede: "Paste your handle or a batch of your own posts. Seconds later you have a voice profile.",
    body: "The analyzer reads what you wrote and pulls out vocabulary, sentence rhythm, format habits, and the phrases you would never use. Every field is editable, and it keeps learning as you publish.",
  },
  {
    step: "step 02",
    title: "Drop an idea",
    lede: "A half-thought, a link, a quoted post. Get a draft in seconds.",
    body: "The writer reads your references, anchors against your voice profile, and drafts a post, a thread, or an article. Claims trace back to the sources you gave it, not invented stats.",
  },
  {
    step: "step 03",
    title: "Refine, then publish",
    lede: "Say what to change in plain words. Publish in one tap.",
    body: "Tell it \u201cmake it punchier\u201d and the draft updates in place. Highlight a line to fix only that bit. When it reads like you, one tap sends it out.",
  },
];

export const FAQ = [
  {
    q: "How does Oxly Writer learn my voice?",
    a: "You paste your handle or a batch of your recent posts. The analyzer builds a voice profile: vocabulary, sentence rhythm, format preferences, and the patterns you avoid. Every field is editable, and the profile retrains as you publish through Oxly.",
  },
  {
    q: "Will it post anything without my approval?",
    a: "No. Nothing leaves the app until you tap publish. Drafts sit in your workspace until you decide they are ready.",
  },
  {
    q: `How much does it cost?`,
    a: `Nothing. Every feature is free to use right now — sign up, build your voice profile, and start writing.`,
  },
  {
    q: "How is this different from a generic chatbot?",
    a: "A general model averages the whole internet. Oxly anchors every draft to a profile built from your own writing, plus the sources you attach. The difference is the training data, not the prompt.",
  },
  {
    q: "What about the other scheduling tools?",
    a: "Schedulers help you post more. Oxly helps the post sound like you wrote it. You can still copy any draft into whatever scheduler you already use.",
  },
  {
    q: "Is my data safe?",
    a: "Your voice profile and drafts are private to your account and never shared with other users or used to train shared models.",
  },
  {
    q: "Does it write long-form too?",
    a: "Yes. Every draft can be a single post, a numbered thread, or a longer article, and you can switch format without losing the voice.",
  },
];

export const ROADMAP = [
  "LinkedIn",
  "Threads",
  "Bluesky",
  "Trend research",
  "Scheduled publishing",
];

export const PLAN_FEATURES = [
  "Free while in early access — no card, no limits juggling",
  "Voice profile built from your own posts",
  "AI drafts in your voice: posts, threads, articles",
  "Chat refinement with accept / reject edits",
  "One-tap publishing",
  "Share drafts by link for feedback",
  "Priority support from the team",
];

export type BlogPost = {
  slug: string;
  category: string;
  title: string;
  date: string;
  readingTime: string;
  excerpt: string;
  body: string[];
};

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: "sound-like-yourself",
    category: "Craft",
    title: "How to sound like yourself when a model is doing the typing",
    date: "12 Jul 2026",
    readingTime: "3 min read",
    excerpt:
      "Voice is not vocabulary. It is rhythm, refusals, and the specific things only you would bother to mention.",
    body: [
      "Most people describe their writing voice with adjectives: casual, punchy, warm. Adjectives are useless as instructions. A model given \u201cwrite casually\u201d produces the average of every casual sentence on the internet, which reads like a brand account trying hard.",
      "Voice is made of three concrete things. Rhythm: how long your sentences run before you break them. Refusals: the words you would never type, which say more about you than the ones you would. Specificity: the details only you would bother to include, because you were actually there.",
      "The fastest fix is to stop describing your voice and start showing it. Twenty of your own posts carry more signal than a page of instructions. Feed those in, then correct the profile where it guessed wrong.",
      "The test for any draft is simple. Read it out loud. If you would not say it to a friend at a table, delete the line and write the thing you actually meant.",
    ],
  },
  {
    slug: "thread-structure",
    category: "Craft",
    title: "A thread structure that does not read like a template",
    date: "09 Jul 2026",
    readingTime: "4 min read",
    excerpt:
      "The hook, the receipt, the turn, the close. Four moves, no numbered filler, no thread-guy voice.",
    body: [
      "Open with a claim you can defend, not a promise you will deliver later. \u201cHere is what I learned\u201d is a promise. \u201cWe shipped in public, badly, and it worked\u201d is a claim.",
      "Follow with a receipt. One number, one screenshot, one date. Receipts stop people scrolling more reliably than any hook formula.",
      "Then the turn: the part that costs you something to say. The mistake, the thing you would do differently, the number that embarrassed you. This is the only part a generic model cannot generate for you.",
      "Close without a call to action if you can help it. A good last line earns the follow on its own.",
    ],
  },
  {
    slug: "editing-in-chat",
    category: "Product",
    title: "Editing in chat beats regenerating from scratch",
    date: "06 Jul 2026",
    readingTime: "3 min read",
    excerpt:
      "Regeneration throws away the good line you already had. Targeted edits keep it.",
    body: [
      "The default habit with AI writing is to hit regenerate until something lands. That is expensive in attention and it destroys the sentence you liked in draft two.",
      "A better loop: keep the draft, highlight the line that is wrong, and say what is wrong with it in plain words. \u201cToo formal\u201d. \u201cThis claim needs the actual number\u201d. \u201cCut the last clause\u201d.",
      "Every correction is also training data. After the third time you ask for something punchier, the profile should stop making you ask.",
    ],
  },
];
