import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Loader2, Plus, Sparkles, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { generateDraft } from "@/lib/ai.functions";

export const Route = createFileRoute("/_authenticated/app/drafts")({
  component: DraftsPage,
});

type Kind = "post" | "thread" | "article";
const STATUSES = ["all", "draft", "ready", "posted"] as const;

function DraftsPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<(typeof STATUSES)[number]>("all");
  const [open, setOpen] = useState(false);
  const [idea, setIdea] = useState("");
  const [kind, setKind] = useState<Kind>("thread");
  const [sourceText, setSourceText] = useState("");

  const { data: drafts, isLoading } = useQuery({
    queryKey: ["drafts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("drafts")
        .select("*")
        .order("updated_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const create = useMutation({
    mutationFn: async () => {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData.user?.id;
      if (!userId) throw new Error("Not signed in");

      const { data: voice } = await supabase
        .from("voice_profiles")
        .select("*")
        .maybeSingle();

      const sources = sourceText.trim()
        ? [{ label: "pasted reference", content: sourceText.trim() }]
        : [];

      const result = await generateDraft({
        data: { idea, kind, sources, voice: voice ?? null },
      });

      const { data: inserted, error } = await supabase
        .from("drafts")
        .insert({
          user_id: userId,
          title: result.title,
          kind,
          idea,
          segments: result.segments,
        })
        .select()
        .single();
      if (error) throw error;

      if (sources.length) {
        await supabase.from("draft_sources").insert(
          sources.map((s) => ({
            draft_id: inserted.id,
            user_id: userId,
            kind: "text",
            label: s.label,
            content: s.content,
          })),
        );
      }
      return inserted;
    },
    onSuccess: (draft) => {
      setOpen(false);
      setIdea("");
      setSourceText("");
      queryClient.invalidateQueries({ queryKey: ["drafts"] });
      navigate({ to: "/app/drafts/$id", params: { id: draft.id } });
    },
    onError: (err) =>
      toast.error(err instanceof Error ? err.message : "Could not write the draft"),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("drafts").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Draft deleted");
      queryClient.invalidateQueries({ queryKey: ["drafts"] });
    },
  });

  const visible = (drafts ?? []).filter((d) => tab === "all" || d.status === tab);

  return (
    <div className="mx-auto w-full max-w-4xl px-5 py-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl">Your drafts</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Everything you have written, in your own voice.
          </p>
        </div>
        <Button onClick={() => setOpen(true)}>
          <Plus className="mr-2 size-4" /> New draft
        </Button>
      </div>

      <Tabs
        value={tab}
        onValueChange={(v) => setTab(v as (typeof STATUSES)[number])}
        className="mt-8"
      >
        <TabsList>
          {STATUSES.map((s) => (
            <TabsTrigger key={s} value={s} className="capitalize">
              {s}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <div className="mt-6 space-y-3">
        {isLoading && (
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" /> Loading drafts…
          </p>
        )}
        {!isLoading && visible.length === 0 && (
          <div className="rounded-xl border border-dashed border-border p-10 text-center">
            <p className="text-muted-foreground">
              Nothing here yet. Drop an idea and get a first draft.
            </p>
            <Button className="mt-4" onClick={() => setOpen(true)}>
              <Sparkles className="mr-2 size-4" /> Write something
            </Button>
          </div>
        )}
        {visible.map((draft) => (
          <div
            key={draft.id}
            className="flex items-start justify-between gap-4 rounded-xl border border-border bg-surface p-5"
          >
            <Link
              to="/app/drafts/$id"
              params={{ id: draft.id }}
              className="min-w-0 flex-1"
            >
              <p className="truncate text-lg">{draft.title}</p>
              <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                {(draft.segments as string[])[0] ?? "Empty draft"}
              </p>
              <p className="mt-3 text-xs uppercase tracking-widest text-primary">
                {draft.status} · {draft.kind}
              </p>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Delete draft"
              onClick={() => remove.mutate(draft.id)}
            >
              <Trash2 className="size-4 text-muted-foreground" />
            </Button>
          </div>
        ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Drop an idea</DialogTitle>
            <DialogDescription>
              A half-thought works. Add a link or pasted text and every claim will trace
              back to it.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="idea">Your idea</Label>
              <Textarea
                id="idea"
                rows={3}
                value={idea}
                onChange={(e) => setIdea(e.target.value)}
                placeholder="why shipping the ugly version wins"
              />
            </div>
            <div className="space-y-2">
              <Label>Format</Label>
              <Select value={kind} onValueChange={(v) => setKind(v as Kind)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="post">Single post</SelectItem>
                  <SelectItem value="thread">Thread</SelectItem>
                  <SelectItem value="article">Article</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="source">Sources (optional)</Label>
              <Textarea
                id="source"
                rows={4}
                value={sourceText}
                onChange={(e) => setSourceText(e.target.value)}
                placeholder="Paste a link, a quote, or a paragraph the draft should be grounded in."
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={() => create.mutate()}
              disabled={create.isPending || idea.trim().length < 3}
            >
              {create.isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
              Write my draft
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
