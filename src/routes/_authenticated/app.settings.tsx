import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Eye, EyeOff, KeyRound, Loader2, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { PLAN_FEATURES } from "@/lib/content";

export const Route = createFileRoute("/_authenticated/app/settings")({
  component: SettingsPage,
});

const PROVIDERS = [
  { value: "openai", label: "OpenAI" },
  { value: "anthropic", label: "Anthropic" },
  { value: "google", label: "Google AI" },
  { value: "openrouter", label: "OpenRouter" },
  { value: "x", label: "X (Twitter)" },
  { value: "other", label: "Other" },
] as const;

function mask(key: string) {
  if (key.length <= 8) return "••••••••";
  return `${key.slice(0, 4)}••••••••${key.slice(-4)}`;
}

function SettingsPage() {
  const queryClient = useQueryClient();
  const [displayName, setDisplayName] = useState("");
  const [handle, setHandle] = useState("");

  const { data: profile, isLoading } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const { data, error } = await supabase.from("profiles").select("*").maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name ?? "");
      setHandle(profile.x_handle ?? "");
    }
  }, [profile]);

  const save = useMutation({
    mutationFn: async () => {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData.user?.id;
      if (!userId) throw new Error("Not signed in");
      const { error } = await supabase
        .from("profiles")
        .upsert({ id: userId, display_name: displayName, x_handle: handle });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Saved");
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Could not save"),
  });

  return (
    <div className="mx-auto w-full max-w-2xl px-5 py-10">
      <h1 className="text-3xl">Settings</h1>

      <section className="warm-panel mt-8 rounded-xl p-6">
        <h2 className="text-xl">Your account</h2>
        {isLoading ? (
          <p className="mt-4 text-sm text-muted-foreground">Loading…</p>
        ) : (
          <div className="mt-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" value={profile?.email ?? ""} readOnly disabled />
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Display name</Label>
              <Input
                id="name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="handle">Handle</Label>
              <Input
                id="handle"
                value={handle}
                onChange={(e) => setHandle(e.target.value)}
                placeholder="@yourname"
              />
            </div>
            <Button onClick={() => save.mutate()} disabled={save.isPending}>
              {save.isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
              Save
            </Button>
          </div>
        )}
      </section>

      <ApiKeysPanel />

      <section className="mt-6 rounded-xl border border-border bg-surface-2 p-6">
        <h2 className="text-xl">Everything is free</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          There is no paid plan. Every feature below is on for your account.
        </p>
        <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
          {PLAN_FEATURES.map((f) => (
            <li key={f}>· {f}</li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function ApiKeysPanel() {
  const queryClient = useQueryClient();
  const [provider, setProvider] = useState<string>("openai");
  const [label, setLabel] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [notes, setNotes] = useState("");
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});

  const { data: keys, isLoading } = useQuery({
    queryKey: ["api-credentials"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("api_credentials")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const add = useMutation({
    mutationFn: async () => {
      if (!apiKey.trim()) throw new Error("Paste a key first");
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData.user?.id;
      if (!userId) throw new Error("Not signed in");
      const { error } = await supabase.from("api_credentials").insert({
        user_id: userId,
        provider,
        label: label.trim() || null,
        api_key: apiKey.trim(),
        notes: notes.trim() || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      setLabel("");
      setApiKey("");
      setNotes("");
      toast.success("Key saved");
      queryClient.invalidateQueries({ queryKey: ["api-credentials"] });
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Could not save"),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("api_credentials").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Key removed");
      queryClient.invalidateQueries({ queryKey: ["api-credentials"] });
    },
    onError: (err) =>
      toast.error(err instanceof Error ? err.message : "Could not remove"),
  });

  return (
    <section className="mt-6 rounded-xl border border-border bg-surface p-6">
      <div className="flex items-center gap-2">
        <KeyRound className="size-5 text-primary" />
        <h2 className="text-xl">API keys</h2>
      </div>
      <p className="mt-2 text-sm text-muted-foreground">
        Add your own service keys here. They are private to your account and never
        shown to anyone else. Writing works without them — these are for connecting
        your own accounts.
      </p>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Service</Label>
          <Select value={provider} onValueChange={setProvider}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PROVIDERS.map((p) => (
                <SelectItem key={p.value} value={p.value}>
                  {p.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="key-label">Label (optional)</Label>
          <Input
            id="key-label"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="personal account"
          />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="key-value">Key</Label>
          <Input
            id="key-value"
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="sk-…"
            autoComplete="off"
          />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="key-notes">Notes (optional)</Label>
          <Textarea
            id="key-notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            placeholder="what this key is used for"
          />
        </div>
      </div>

      <Button className="mt-4" onClick={() => add.mutate()} disabled={add.isPending}>
        {add.isPending ? (
          <Loader2 className="mr-2 size-4 animate-spin" />
        ) : (
          <Plus className="mr-2 size-4" />
        )}
        Add key
      </Button>

      <div className="mt-6 space-y-2">
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : !keys?.length ? (
          <p className="text-sm text-muted-foreground">No keys saved yet.</p>
        ) : (
          keys.map((k) => (
            <div
              key={k.id}
              className="flex flex-wrap items-center gap-3 rounded-lg border border-border bg-surface-2 px-4 py-3"
            >
              <span className="rounded-full bg-secondary px-2.5 py-0.5 text-xs capitalize">
                {k.provider}
              </span>
              <span className="text-sm">{k.label || "Untitled key"}</span>
              <code className="font-mono text-xs text-muted-foreground">
                {revealed[k.id] ? k.api_key : mask(k.api_key)}
              </code>
              <div className="ml-auto flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Toggle key visibility"
                  onClick={() =>
                    setRevealed((r) => ({ ...r, [k.id]: !r[k.id] }))
                  }
                >
                  {revealed[k.id] ? (
                    <EyeOff className="size-4" />
                  ) : (
                    <Eye className="size-4" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Delete key"
                  onClick={() => remove.mutate(k.id)}
                >
                  <Trash2 className="size-4 text-destructive" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
