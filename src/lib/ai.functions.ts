import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const MODEL = "google/gemini-3.7-flash";
const GATEWAY = "https://ai.gateway.lovable.dev/v1/chat/completions";

type ChatMessage = { role: "system" | "user" | "assistant"; content: string };

async function callGateway(messages: ChatMessage[], jsonMode = true) {
  const apiKey = process.env["LOVABLE_API_KEY"];
  if (!apiKey) throw new Error("AI is not configured yet.");

  const res = await fetch(GATEWAY, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: MODEL,
      messages,
      ...(jsonMode ? { response_format: { type: "json_object" } } : {}),
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    console.error(`AI gateway failed [${res.status}]: ${body}`);
    if (res.status === 429) throw new Error("Too many requests right now. Try again in a moment.");
    if (res.status === 402) throw new Error("AI credits are exhausted for this workspace.");
    throw new Error("The writer could not be reached. Try again.");
  }

  const data = (await res.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  return data.choices?.[0]?.message?.content ?? "";
}

function parseJson<T>(raw: string, fallback: T): T {
  const cleaned = raw
    .trim()
    .replace(/^```(?:json)?/i, "")
    .replace(/```$/, "")
    .trim();
  try {
    return JSON.parse(cleaned) as T;
  } catch {
    return fallback;
  }
}

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
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => voiceSchema.parse(data))
  .handler(async ({ data }): Promise<VoiceAnalysis> => {
    const raw = await callGateway([
      {
        role: "system",
        content:
          "You are a writing-voice analyst. Read the author's own posts and build a precise, unflattering, specific fingerprint of how they write. Never invent traits that are not visible in the text. Respond ONLY with JSON matching: {\"summary\": string, \"tone\": string, \"rhythm\": string, \"formats\": string, \"vocabulary\": string[], \"signature_phrases\": string[], \"forbidden_phrases\": string[]}. vocabulary: 8-14 words they actually lean on. signature_phrases: 4-8 exact expressions from their text. forbidden_phrases: 4-8 clichés notably absent from their writing that a generic AI would use.",
      },
      {
        role: "user",
        content: `Author handle: ${data.handle || "unknown"}\n\nTheir posts:\n${data.sample.slice(0, 12000)}`,
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
    summary: z.string().nullable().optional(),
    tone: z.string().nullable().optional(),
    rhythm: z.string().nullable().optional(),
    formats: z.string().nullable().optional(),
    vocabulary: z.array(z.string()).optional(),
    signature_phrases: z.array(z.string()).optional(),
    forbidden_phrases: z.array(z.string()).optional(),
  })
  .nullable()
  .optional();

function voiceBlock(voice: z.infer<typeof voiceContext>) {
  if (!voice) {
    return "No voice profile yet. Write plainly and specifically, lowercase-leaning, no marketing language, no hashtags, no emoji unless clearly earned.";
  }
  return [
    `Voice summary: ${voice.summary ?? "n/a"}`,
    `Tone: ${voice.tone ?? "n/a"}`,
    `Sentence rhythm: ${voice.rhythm ?? "n/a"}`,
    `Format habits: ${voice.formats ?? "n/a"}`,
    `Words they lean on: ${(voice.vocabulary ?? []).join(", ")}`,
    `Signature phrases (quote verbatim when natural): ${(voice.signature_phrases ?? []).join(" | ")}`,
    `NEVER use these phrases or anything like them: ${(voice.forbidden_phrases ?? []).join(" | ")}`,
  ].join("\n");
}

const generateSchema = z.object({
  idea: z.string().min(3, "Tell the writer what the post is about."),
  kind: z.enum(["post", "thread", "article"]),
  sources: z
    .array(z.object({ label: z.string().optional(), url: z.string().optional(), content: z.string().optional() }))
    .optional(),
  voice: voiceContext,
});

export type GeneratedDraft = { title: string; segments: string[] };

export const generateDraft = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => generateSchema.parse(data))
  .handler(async ({ data }): Promise<GeneratedDraft> => {
    const sourceText = (data.sources ?? [])
      .map((s, i) => `[${i + 1}] ${s.label ?? s.url ?? "source"}\n${s.url ?? ""}\n${(s.content ?? "").slice(0, 3000)}`)
      .join("\n\n");

    const shape =
      data.kind === "post"
        ? "Exactly one segment: a single post under 280 characters."
        : data.kind === "thread"
          ? "Between 3 and 7 segments. Each segment is one post under 280 characters. The first is the hook."
          : "Between 3 and 8 segments. Each segment is a paragraph of an article; no character limit.";

    const raw = await callGateway([
      {
        role: "system",
        content: `You ghost-write for one specific author. Match their voice exactly.\n\n${voiceBlock(data.voice)}\n\nRules: every factual claim must trace to a supplied source; never invent statistics; no hashtags; no "excited to announce"; no press-release verbs. ${shape}\nRespond ONLY with JSON: {"title": string, "segments": string[]}. The title is a short lowercase working title for the author's own list.`,
      },
      {
        role: "user",
        content: `Idea: ${data.idea}\n\nSources:\n${sourceText || "(none provided — do not invent facts)"}`,
      },
    ]);

    const parsed = parseJson<Partial<GeneratedDraft>>(raw, {});
    const segments = (parsed.segments ?? []).filter((s) => typeof s === "string" && s.trim());
    return {
      title: parsed.title?.slice(0, 90) || data.idea.slice(0, 60),
      segments: segments.length ? segments : [raw.trim()].filter(Boolean),
    };
  });

const refineSchema = z.object({
  instruction: z.string().min(1),
  segments: z.array(z.string()),
  selection: z.string().optional(),
  kind: z.enum(["post", "thread", "article"]),
  voice: voiceContext,
  history: z
    .array(z.object({ role: z.enum(["user", "assistant"]), content: z.string() }))
    .optional(),
});

export type RefineResult = { reply: string; segments: string[] };

export const refineDraft = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => refineSchema.parse(data))
  .handler(async ({ data }): Promise<RefineResult> => {
    const history: ChatMessage[] = (data.history ?? []).slice(-8).map((m) => ({
      role: m.role,
      content: m.content,
    }));

    const raw = await callGateway([
      {
        role: "system",
        content: `You are an editor for one author. Apply their instruction to the draft and return the full updated draft. Keep everything they did not ask you to change byte-identical.\n\n${voiceBlock(data.voice)}\n\nRespond ONLY with JSON: {"reply": string, "segments": string[]}. "reply" is one short sentence saying what you changed, in plain words.`,
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
