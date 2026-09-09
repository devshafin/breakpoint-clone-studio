import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Check, Copy, Link2, Loader2, Send, Undo2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { refineDraft } from "@/lib/ai.functions";

export const Route = createFileRoute("/_authenticated/app/drafts/$id")({
  component: DraftEditor,
});

type Kind = "post" | "thread" | "article";

function randomToken() {
  return Array.from(crypto.getRandomValues(new Uint8Array(12)))
    .map((b) => b.toString(36).padStart(2, "0"))
    .join("")
    .slice(0, 20);
}

function DraftEditor() {
  const { id } = Route.useParams();
  const queryClient = useQueryClient();
  const [segments, setSegments] = useState<string[]>([]);
  const [title, setTitle] = useState("");
  const [pending, setPending] = useState<string[] | null>(null);
  const [instruction, setInstruction] = useState("");
  const [selection, setSelection] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);

  const { data: draft, isLoading } = useQuery({
    queryKey: ["draft", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("drafts")
        .select("*")
        .eq("id", id)
        .single();
      if (error) throw error;
      return data;
    },
  });

  const { data: messages } = useQuery({
    queryKey: ["draft-messages", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("draft_messages")
        .select("*")
        .eq("draft_id", id)
        .order("created_at");
      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    if (draft) {
      setSegments((draft.segments as string[]) ?? []);
      setTitle(draft.title);
    }
  }, [draft]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages?.length]);

  const save = useMutation({
    mutationFn: async (patch: Record<string, unknown>) => {
      const { error } = await supabase.from("drafts").update(patch).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["draft", id] }),
    onError: (err) => toast.error(err instanceof Error ? err.message : "Save failed"),
  });

  const refine = useMutation({
    mutationFn: async () => {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData.user?.id;
      if (!userId) throw new Error("Not signed in");

      const { data: voice } = await supabase
        .from("voice_profiles")
        .select("*")
        .maybeSingle();

      await supabase.from("draft_messages").insert({
        draft_id: id,
        user_id: userId,
        role: "user",
        content: selection ? `${instruction}\n\n> ${selection}` : instruction,
      });

      const result = await refineDraft({
        data: {
          instruction,
          selection: selection || undefined,
          segments,
          kind: (draft?.kind as Kind) ?? "post",
          voice: voice ?? null,
          history: (messages ?? []).slice(-6).map((m) => ({
            role: m.role === "assistant" ? ("assistant" as const) : ("user" as const),
            content: m.content,
          })),
        },
      });

      await supabase.from("draft_messages").insert({
        draft_id: id,
        user_id: userId,
        role: "assistant",
        content: result.reply,
      });

      return result;
    },
    onSuccess: (result) => {
      setPending(result.segments);
      setInstruction("");
      setSelection("");
      queryClient.invalidateQueries({ queryKey: ["draft-messages", id] });
    },
    onError: (err) =>
      toast.error(err instanceof Error ? err.message : "The editor could not respond"),
  });

  async function acceptEdit() {
    if (!pending) return;
    const { data: userData } = await supabase.auth.getUser();
    if (userData.user) {
      await supabase.from("draft_versions").insert({
        draft_id: id,
        user_id: userData.user.id,
        segments,
        note: "before chat edit",
      });
    }
    setSegments(pending);
    save.mutate({ segments: pending });
    setPending(null);
    toast.success("Edit applied");
  }

  async function share() {
    const token = draft?.share_token ?? randomToken();
    if (!draft?.share_token) await save.mutateAsync({ share_token: token });
    await navigator.clipboard.writeText(`${window.location.origin}/share/${token}`);
    toast.success("Share link copied");
  }

  async function publish() {
    await navigator.clipboard.writeText(segments.join("\n\n"));
    save.mutate({ status: "posted", posted_at: new Date().toISOString() });
    toast.success("Copied and marked as posted", {
      description:
        "Connect your posting account in Settings to send it out in one tap instead.",
    });
  }

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 p-10 text-muted-foreground">
        <Loader2 className="size-4 animate-spin" /> Loading draft…
      </div>
    );
  }

  const view = pending ?? segments;

  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[1fr_380px]">
      <div className="min-w-0 px-5 py-8">
        <Link
          to="/app/drafts"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" /> All drafts
        </Link>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={() => save.mutate({ title })}
            className="h-11 max-w-md border-none bg-transparent px-0 font-display text-2xl focus-visible:ring-0"
          />
          <Select
            value={draft?.status ?? "draft"}
            onValueChange={(v) => save.mutate({ status: v })}
          >
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="ready">Ready</SelectItem>
              <SelectItem value="posted">Posted</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {pending && (
          <div className="mt-4 flex flex-wrap items-center gap-3 rounded-lg border border-primary/40 bg-primary/10 px-4 py-3 text-sm">
            <span>Suggested edit is showing below.</span>
            <Button size="sm" onClick={acceptEdit}>
              <Check className="mr-1 size-4" /> Accept
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setPending(null)}>
              <Undo2 className="mr-1 size-4" /> Reject
            </Button>
          </div>
        )}

        <div className="mt-6 space-y-4">
          {view.map((segment, i) => (
            <div key={i} className="rounded-xl border border-border bg-surface p-4">
              <p className="mb-2 text-xs uppercase tracking-widest text-muted-foreground">
                {draft?.kind === "article" ? `Paragraph ${i + 1}` : `Post ${i + 1}`}
              </p>
              <Textarea
                value={segment}
                rows={draft?.kind === "article" ? 6 : 4}
                onChange={(e) => {
                  const next = [...view];
                  next[i] = e.target.value;
                  if (pending) setPending(next);
                  else setSegments(next);
                }}
                onBlur={() => !pending && save.mutate({ segments })}
                onMouseUp={() => setSelection(window.getSelection()?.toString() ?? "")}
              />
              {draft?.kind !== "article" && (
                <p
                  className={
                    segment.length > 280
                      ? "mt-2 text-xs text-destructive"
                      : "mt-2 text-xs text-muted-foreground"
                  }
                >
                  {segment.length} / 280
                </p>
              )}
            </div>
          ))}
          {view.length === 0 && (
            <p className="text-sm text-muted-foreground">This draft is empty.</p>
          )}
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <Button onClick={publish}>
            <Send className="mr-2 size-4" /> Publish
          </Button>
          <Button variant="secondary" onClick={share}>
            <Link2 className="mr-2 size-4" /> Share link
          </Button>
          <Button
            variant="ghost"
            onClick={() => {
              void navigator.clipboard.writeText(segments.join("\n\n"));
              toast.success("Copied");
            }}
          >
            <Copy className="mr-2 size-4" /> Copy
          </Button>
        </div>
      </div>

      <aside className="flex min-h-[60vh] flex-col border-t border-border bg-sidebar p-5 lg:border-l lg:border-t-0">
        <h2 className="text-xl">Refine in chat</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Say what to change. Highlight a line first to fix just that bit.
        </p>

        <div className="mt-4 flex-1 space-y-3 overflow-y-auto">
          {(messages ?? []).map((m) => (
            <div
              key={m.id}
              className={
                m.role === "user"
                  ? "ml-auto max-w-[85%] rounded-xl bg-primary/15 px-3 py-2 text-sm"
                  : "max-w-[85%] rounded-xl bg-surface-2 px-3 py-2 text-sm text-muted-foreground"
              }
            >
              {m.content}
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>

        {selection && (
          <p className="mt-3 rounded-lg border border-border bg-surface p-2 text-xs text-muted-foreground">
            Editing selection: “{selection.slice(0, 120)}”
          </p>
        )}

        <div className="mt-3 flex gap-2">
          <Input
            value={instruction}
            onChange={(e) => setInstruction(e.target.value)}
            placeholder="make it punchier"
            onKeyDown={(e) => {
              if (e.key === "Enter" && instruction.trim()) refine.mutate();
            }}
          />
          <Button
            onClick={() => refine.mutate()}
            disabled={refine.isPending || !instruction.trim()}
            size="icon"
            aria-label="Send instruction"
          >
            {refine.isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Send className="size-4" />
            )}
          </Button>
        </div>
      </aside>
    </div>
  );
}
