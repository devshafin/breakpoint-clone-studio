import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { PLAN_FEATURES, SITE } from "@/lib/content";

export const Route = createFileRoute("/_authenticated/app/settings")({
  component: SettingsPage,
});

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

      <section className="mt-6 rounded-xl border border-border bg-surface-2 p-6">
        <h2 className="text-xl">Plan</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          You are on the free trial workspace. Pro is ${SITE.priceMonthly} a month and
          unlocks the full allowance.
        </p>
        <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
          {PLAN_FEATURES.slice(0, 4).map((f) => (
            <li key={f}>· {f}</li>
          ))}
        </ul>
        <Button asChild className="mt-5">
          <Link to="/pricing">See the plan</Link>
        </Button>
        <p className="mt-3 text-xs text-muted-foreground">
          Card payments switch on once a payment provider is connected to this
          workspace.
        </p>
      </section>

      <section className="mt-6 rounded-xl border border-border bg-surface p-6">
        <h2 className="text-xl">Publishing connection</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          One-tap publishing needs a developer app from your posting platform. Until
          that is connected, publishing copies the post to your clipboard and marks the
          draft as posted.
        </p>
      </section>
    </div>
  );
}
