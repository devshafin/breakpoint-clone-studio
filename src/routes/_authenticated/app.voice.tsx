import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Loader2, Sparkles, X } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { analyzeVoice } from "@/lib/ai.functions";

export const Route = createFileRoute("/_authenticated/app/voice")({
  component: VoicePage,
});

type Editable = {
  x_handle: string;
  summary: string;
  tone: string;
  rhythm: string;
  formats: string;
  vocabulary: string[];
  signature_phrases: string[];
  forbidden_phrases: string[];
  source_sample: string;
};

const EMPTY: Editable = {
  x_handle: "",
  summary: "",
  tone: "",
  rhythm: "",
  formats: "",
  vocabulary: [],
  signature_phrases: [],
  forbidden_phrases: [],
  source_sample: "",
};

function ChipList({
  label,
  hint,
  values,
  onChange,
}: {
  label: string;
  hint: string;
  values: string[];
  onChange: (next: string[]) => void;
}) {
  const [input, setInput] = useState("");
  return (
    <div className="rounded-xl border border-border bg-surface p-5">
      <p className="text-sm font-medium">{label}</p>
      <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {values.map((v) => (
          <span
            key={v}
            className="inline-flex items-center gap-1 rounded-full bg-secondary px-3 py-1 text-xs"
          >
            {v}
            <button
              type="button"
              aria-label={`Remove ${v}`}
              onClick={() => onChange(values.filter((x) => x !== v))}
            >
              <X className="size-3 text-muted-foreground" />
            </button>
          </span>
        ))}
        {values.length === 0 && (
          <span className="text-xs text-muted-foreground">Nothing here yet.</span>
        )}
      </div>
      <div className="mt-3 flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Add one…"
          onKeyDown={(e) => {
            if (e.key === "Enter" && input.trim()) {
              e.preventDefault();
              onChange([...values, input.trim()]);
              setInput("");
            }
          }}
        />
        <Button
          type="button"
          variant="secondary"
          onClick={() => {
            if (!input.trim()) return;
            onChange([...values, input.trim()]);
            setInput("");
          }}
        >
          Add
        </Button>
      </div>
    </div>
  );
}

function VoicePage() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<Editable>(EMPTY);

  const { data, isLoading } = useQuery({
    queryKey: ["voice-profile"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("voice_profiles")
        .select("*")
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    if (data) {
      setForm({
        x_handle: data.x_handle ?? "",
        summary: data.summary ?? "",
        tone: data.tone ?? "",
        rhythm: data.rhythm ?? "",
        formats: data.formats ?? "",
        vocabulary: data.vocabulary ?? [],
        signature_phrases: data.signature_phrases ?? [],
        forbidden_phrases: data.forbidden_phrases ?? [],
        source_sample: data.source_sample ?? "",
      });
    }
  }, [data]);

  const analyze = useMutation({
    mutationFn: async () =>
      analyzeVoice({ data: { handle: form.x_handle, sample: form.source_sample } }),
    onSuccess: (res) => {
      setForm((f) => ({ ...f, ...res }));
      toast.success("Voice profile built. Edit anything that feels off, then save.");
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Analysis failed"),
  });

  const save = useMutation({
    mutationFn: async () => {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData.user?.id;
      if (!userId) throw new Error("Not signed in");
      const { error } = await supabase
        .from("voice_profiles")
        .upsert({ ...form, user_id: userId }, { onConflict: "user_id" });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Voice profile saved");
      queryClient.invalidateQueries({ queryKey: ["voice-profile"] });
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Could not save"),
  });

  return (
    <div className="mx-auto w-full max-w-3xl px-5 py-10">
      <h1 className="text-3xl">Your voice profile</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Trained on your own posts, not the internet&apos;s average. Every field is yours
        to edit.
      </p>

      {isLoading ? (
        <div className="mt-10 flex items-center gap-2 text-muted-foreground">
          <Loader2 className="size-4 animate-spin" /> Loading…
        </div>
      ) : (
        <div className="mt-8 space-y-5">
          <div className="warm-panel rounded-xl p-5">
            <div className="grid gap-4 md:grid-cols-[200px_1fr]">
              <div className="space-y-2">
                <Label htmlFor="handle">Your handle</Label>
                <Input
                  id="handle"
                  value={form.x_handle}
                  onChange={(e) => setForm({ ...form, x_handle: e.target.value })}
                  placeholder="@yourname"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sample">Paste 10–30 of your own posts</Label>
                <Textarea
                  id="sample"
                  rows={8}
                  value={form.source_sample}
                  onChange={(e) => setForm({ ...form, source_sample: e.target.value })}
                  placeholder="One post per line. The messier and more real, the better."
                />
              </div>
            </div>
            <Button
              className="mt-4"
              onClick={() => analyze.mutate()}
              disabled={analyze.isPending}
            >
              {analyze.isPending ? (
                <Loader2 className="mr-2 size-4 animate-spin" />
              ) : (
                <Sparkles className="mr-2 size-4" />
              )}
              Analyse my voice
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="summary">Summary</Label>
              <Textarea
                id="summary"
                rows={4}
                value={form.summary}
                onChange={(e) => setForm({ ...form, summary: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tone">Tone</Label>
              <Textarea
                id="tone"
                rows={4}
                value={form.tone}
                onChange={(e) => setForm({ ...form, tone: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="rhythm">Sentence rhythm</Label>
              <Textarea
                id="rhythm"
                rows={3}
                value={form.rhythm}
                onChange={(e) => setForm({ ...form, rhythm: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="formats">Format habits</Label>
              <Textarea
                id="formats"
                rows={3}
                value={form.formats}
                onChange={(e) => setForm({ ...form, formats: e.target.value })}
              />
            </div>
          </div>

          <ChipList
            label="Vocabulary"
            hint="Words you lean into."
            values={form.vocabulary}
            onChange={(v) => setForm({ ...form, vocabulary: v })}
          />
          <ChipList
            label="Signature phrases"
            hint="Quoted back verbatim in drafts when they fit."
            values={form.signature_phrases}
            onChange={(v) => setForm({ ...form, signature_phrases: v })}
          />
          <ChipList
            label="Forbidden patterns"
            hint="The writer refuses to use these."
            values={form.forbidden_phrases}
            onChange={(v) => setForm({ ...form, forbidden_phrases: v })}
          />

          <Button onClick={() => save.mutate()} disabled={save.isPending} size="lg">
            {save.isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
            Save voice profile
          </Button>
        </div>
      )}
    </div>
  );
}
