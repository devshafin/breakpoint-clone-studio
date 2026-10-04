import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSession } from "@/lib/auth-guard";

const MODEL = "openai/gpt-6-astra";
const GATEWAY = "https://ai.gateway.lovable.dev/v1/responses";

type ChatMessage = { role: "system" | "user" | "assistant"; content: string };

/** Streams a Responses call and returns the accumulated text. */
async function callGateway(messages: ChatMessage[]) {
  const apiKey = process.env["LOVABLE_API_KEY"];
  if (!apiKey) throw new Error("AI is not configured yet.");

  const system = messages.filter((m) => m.role === "system").map((m) => m.content).join("\n\n");
  const input = messages
    .filter((m) => m.role !== "system")
    .map((m) => ({ role: m.role, content: m.content }));
  const last = input[input.length - 1];
  if (last) last.content += "\n\nReply with the JSON object only.";

  const res = await fetch(GATEWAY, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Lovable-API-Key": apiKey,
      "X-Lovable-AIG-SDK": "fetch",
    },
    body: JSON.stringify({
      model: MODEL,
      instructions: system,
      input,
      stream: true,
      store: false,
      reasoning: { effort: "medium", summary: "auto" },
      include: ["reasoning.encrypted_content"],
      text: { format: { type: "json_object" } },
    }),
  });

  if (!res.ok || !res.body) {
    const body = await res.text().catch(() => "");
    console.error(`AI gateway failed [${res.status}]: ${body}`);
    let safe = "";
    try {
      safe = (JSON.parse(body) as { message?: string; error?: { message?: string } }).message ?? "";
    } catch {
      /* ignore */
    }
    if (res.status === 429) throw new Error("Too many requests right now. Try again in a moment.");
    if (res.status === 402) throw new Error(safe || "AI credits are used up for this workspace.");
    if (res.status === 403) throw new Error(safe || "AI access is blocked for this workspace.");
    throw new Error("The writer could not be reached. Try again.");
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let text = "";
  let completedText = "";
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    let idx: number;
    while ((idx = buffer.indexOf("\n\n")) !== -1) {
      const frame = buffer.slice(0, idx);
      buffer = buffer.slice(idx + 2);
      for (const line of frame.split("\n")) {
        if (!line.startsWith("data:")) continue;
        const payload = line.slice(5).trim();
        if (!payload || payload === "[DONE]") continue;
        try {
          const evt = JSON.parse(payload) as {
            type?: string;
            delta?: string;
            text?: string;
            error?: { message?: string };
            message?: string;
          };
          if (evt.type === "response.output_text.delta" && evt.delta) text += evt.delta;
          else if (evt.type === "response.output_text.done" && evt.text) completedText = evt.text;
          else if (evt.type === "error" || evt.type === "response.failed") {
            console.error("AI stream error", payload);
            throw new Error(evt.error?.message || evt.message || "The writer stopped unexpectedly.");
          }
        } catch (e) {
          if (e instanceof SyntaxError) continue;
          throw e;
        }
      }
    }
  }
  const out = completedText || text;
  if (!out.trim()) throw new Error("The writer returned nothing. Try rephrasing your idea.");
  return out;
}

function parseJson<T>(raw: string, fallback: T): T {
  const cleaned = raw.trim().replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();
  try {
    return JSON.parse(cleaned) as T;
  } catch {
    const m = cleaned.match(/\{[\s\S]*\}/);
    if (m) {
      try {
        return JSON.parse(m[0]) as T;
      } catch {
        /* fall through */
      }
    }
    return fallback;
  }
}

const AI_TELLS =
  "Never use: em-dashes as decoration, 'delve', 'game-changer', 'unlock', 'elevate', 'in today's fast-paced world', 'let's dive in', 'here's the thing', 'buckle up', 'it's not X, it's Y' formulas, rhetorical triplets, hashtags, emoji spam, 'excited to announce', motivational-poster endings, or any sentence a generic AI assistant would write.";

const voiceSchema = z.object({
  handle: z.string().optional(),
  sample: z.string().min(40, "Paste a few of your own posts first (at least a couple of lines)."),
});

export type VoiceAnalysis = {
  summary: string;
  tone: string;
  rhythm: string;
  formats: string;
  vocabulary: string[];
  signature_phrases: string[];
  forbidden_phrases: string[];
};

export const analyzeVoice = createServerFn({ method: "POST" })
  .middleware([requireSession])
  .inputValidator((data: unknown) => voiceSchema.parse(data))
  .handler(async ({ data }): Promise<VoiceAnalysis> => {
    const raw = await callGateway([
      {
        role: "system",
        content:
          "You are a forensic writing-voice analyst preparing a brief for a ghostwriter who must impersonate this author so well their followers cannot tell. Study only the supplied posts. Capture: casing habits (lowercase? Title Case?), punctuation quirks, average sentence length, line-break style, how they open posts, how they end them, humour, confidence level, jargon, slang, language mix (e.g. English with Bangla/Hinglish words), emoji use, and topics. Never invent traits not visible in the text. Respond ONLY with JSON: {\"summary\": string (3-5 sentences, concrete), \"tone\": string, \"rhythm\": string (sentence length, line breaks, punctuation), \"formats\": string (how they open, structure and close posts), \"vocabulary\": string[] (8-14 words they actually lean on), \"signature_phrases\": string[] (4-8 exact expressions copied from the text), \"forbidden_phrases\": string[] (6-10 generic AI clichés this author would never write)}.",
      },
      {
        role: "user",
        content: `Author handle: ${data.handle || "unknown"}\n\nTheir posts:\n${data.sample.slice(0, 14000)}`,
      },
    ]);

    const parsed = parseJson<Partial<VoiceAnalysis>>(raw, {});
    return {
      summary: parsed.summary ?? "",
      tone: parsed.tone ?? "",
      rhythm: parsed.rhythm ?? "",
      formats: parsed.formats ?? "",
      vocabulary: parsed.vocabulary ?? [],
      signature_phrases: parsed.signature_phrases ?? [],
      forbidden_phrases: parsed.forbidden_phrases ?? [],
    };
  });

const voiceContext = z
  .object({
    x_handle: z.string().nullable().optional(),
    summary: z.string().nullable().optional(),
    tone: z.string().nullable().optional(),
    rhythm: z.string().nullable().optional(),
    formats: z.string().nullable().optional(),
    vocabulary: z.array(z.string()).nullable().optional(),
    signature_phrases: z.array(z.string()).nullable().optional(),
    forbidden_phrases: z.array(z.string()).nullable().optional(),
    source_sample: z.string().nullable().optional(),
  })
  .passthrough()
  .nullable()
  .optional();

function voiceBlock(voice: z.infer<typeof voiceContext>) {
  if (!voice || (!voice.summary && !voice.source_sample)) {
    return "No voice profile yet. Write like a sharp, specific human on X: plain words, short lines, concrete details, a clear opinion, no marketing language.";
  }
  const lines = [
    `AUTHOR${voice.x_handle ? ` (@${voice.x_handle.replace(/^@/, "")})` : ""} VOICE BRIEF`,
    `Summary: ${voice.summary ?? "n/a"}`,
    `Tone: ${voice.tone ?? "n/a"}`,
    `Rhythm & punctuation: ${voice.rhythm ?? "n/a"}`,
    `Structure habits: ${voice.formats ?? "n/a"}`,
    `Words they lean on: ${(voice.vocabulary ?? []).join(", ")}`,
    `Signature phrases (use sparingly, only when natural): ${(voice.signature_phrases ?? []).join(" | ")}`,
    `This author NEVER writes: ${(voice.forbidden_phrases ?? []).join(" | ")}`,
  ];
  if (voice.source_sample?.trim()) {
    lines.push(
      `\nREAL POSTS BY THIS AUTHOR (mimic casing, rhythm, line breaks and attitude; never copy sentences verbatim):\n"""\n${voice.source_sample.slice(0, 6000)}\n"""`,
    );
  }
  return lines.join("\n");
}

const GHOSTWRITER = `You are a world-class ghostwriter for creators on X. You write AS the author, in first person, so convincingly that their audience believes they typed it themselves. You never sound like an AI.

How you work:
1. Find the single sharpest angle in the idea. Cut everything else.
2. Open with a hook that stops the scroll: a bold claim, a specific number, a confession, a tension, or a surprising result. No throat-clearing.
3. Be concrete: real examples, specifics, numbers only if supplied by the author or sources.
4. Earn every line. Short sentences. White space. One idea per line when the author writes that way.
5. End with punch: a sharp takeaway, a twist, or a natural question. Not a motivational poster.
${AI_TELLS}
Every factual claim must trace to the idea or supplied sources. Never invent statistics, names, or quotes.`;

const generateSchema = z.object({
  idea: z.string().min(3, "Tell the writer what the post is about."),
  kind: z.enum(["post", "thread", "article"]),
  goal: z.string().optional(),
  notes: z.string().optional(),
  sources: z
    .array(z.object({ label: z.string().optional(), url: z.string().optional(), content: z.string().optional() }))
    .optional(),
  voice: voiceContext,
});

export type GeneratedDraft = { title: string; segments: string[]; hooks: string[] };

export const generateDraft = createServerFn({ method: "POST" })
  .middleware([requireSession])
  .inputValidator((data: unknown) => generateSchema.parse(data))
  .handler(async ({ data }): Promise<GeneratedDraft> => {
    const sourceText = (data.sources ?? [])
      .map((s, i) => `[${i + 1}] ${s.label ?? s.url ?? "source"}\n${s.url ?? ""}\n${(s.content ?? "").slice(0, 4000)}`)
      .join("\n\n");

    const shape =
      data.kind === "post"
        ? "FORMAT: exactly one segment, a single post under 280 characters."
        : data.kind === "thread"
          ? "FORMAT: a thread of 4-8 segments. Each segment is one post under 280 characters. Segment 1 is the hook and must make people click 'show more'. Each later post must stand on its own and pull to the next. The last post lands the takeaway."
          : "FORMAT: a long-form X article of 5-10 segments. Segment 1 is a gripping opening paragraph. Each segment is one paragraph; use short subheads inside a segment only if the author would.";

    const raw = await callGateway([
      {
        role: "system",
        content: `${GHOSTWRITER}\n\n${voiceBlock(data.voice)}\n\n${shape}\n\nRespond ONLY with JSON: {"title": string, "segments": string[], "hooks": string[]}. "title" is a short lowercase working title. "hooks" are 3 alternative opening lines in the author's voice, each a different style (bold claim, story, question/number).`,
      },
      {
        role: "user",
        content: `Idea: ${data.idea}${data.goal ? `\nGoal of this piece: ${data.goal}` : ""}${
          data.notes ? `\nAuthor's notes: ${data.notes}` : ""
        }\n\nSources:\n${sourceText || "(none provided — rely only on the idea, do not invent facts)"}`,
      },
    ]);

    const parsed = parseJson<Partial<GeneratedDraft>>(raw, {});
    const segments = (parsed.segments ?? []).filter((s) => typeof s === "string" && s.trim());
    return {
      title: parsed.title?.slice(0, 90) || data.idea.slice(0, 60),
      segments: segments.length ? segments : [raw.trim()].filter(Boolean),
      hooks: (parsed.hooks ?? []).filter((h) => typeof h === "string" && h.trim()).slice(0, 3),
    };
  });

const refineSchema = z.object({
  instruction: z.string().min(1),
  segments: z.array(z.string()),
  selection: z.string().optional(),
  kind: z.enum(["post", "thread", "article"]),
  voice: voiceContext,
  history: z.array(z.object({ role: z.enum(["user", "assistant"]), content: z.string() })).optional(),
});

export type RefineResult = { reply: string; segments: string[] };

export const refineDraft = createServerFn({ method: "POST" })
  .middleware([requireSession])
  .inputValidator((data: unknown) => refineSchema.parse(data))
  .handler(async ({ data }): Promise<RefineResult> => {
    const history: ChatMessage[] = (data.history ?? []).slice(-8).map((m) => ({
      role: m.role,
      content: m.content,
    }));

    const limit =
      data.kind === "article" ? "" : "Every segment must stay under 280 characters.";

    const raw = await callGateway([
      {
        role: "system",
        content: `${GHOSTWRITER}\n\nYou are now editing a draft you wrote for this author. Apply their instruction and return the full updated draft. Keep everything they did not ask to change identical. ${limit}\n\n${voiceBlock(data.voice)}\n\nRespond ONLY with JSON: {"reply": string, "segments": string[]}. "reply" is one short, plain sentence saying what you changed.`,
      },
      ...history,
      {
        role: "user",
        content: `Draft type: ${data.kind}\nCurrent draft segments:\n${JSON.stringify(data.segments)}\n${
          data.selection ? `\nOnly change this highlighted text: "${data.selection}"\n` : ""
        }\nInstruction: ${data.instruction}`,
      },
    ]);

    const parsed = parseJson<Partial<RefineResult>>(raw, {});
    return {
      reply: parsed.reply ?? "Updated the draft.",
      segments: parsed.segments?.length ? parsed.segments : data.segments,
    };
  });

export const getSharedDraft = createServerFn({ method: "GET" })
  .inputValidator((data: unknown) => z.object({ token: z.string().min(8) }).parse(data))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: draft, error } = await supabaseAdmin
      .from("drafts")
      .select("title, kind, status, segments, updated_at")
      .eq("share_token", data.token)
      .maybeSingle();
    if (error) {
      console.error("shared draft lookup failed", error.message);
      return { draft: null as null | typeof draft };
    }
    return { draft };
  });
