import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

const CATEGORIES = ["Food & Beverage", "Health & Beauty", "Electronics", "Home & Kitchen", "Other"];

const ALL_MARKETS = [
  { market: "UAE", marketplace: "Amazon UAE" },
  { market: "UAE", marketplace: "Noon UAE" },
  { market: "KSA", marketplace: "Amazon KSA" },
  { market: "KSA", marketplace: "Noon KSA" },
];

interface WorkspaceMarket {
  id: string;
  market: string;
  marketplace: string;
}

export default function WorkspaceTab({ workspaceId }: { workspaceId: string }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [activeMarkets, setActiveMarkets] = useState<Set<string>>(new Set());
  const [existingMarkets, setExistingMarkets] = useState<WorkspaceMarket[]>([]);

  useEffect(() => {
    (async () => {
      const [{ data: ws }, { data: markets }] = await Promise.all([
        supabase.from("workspaces").select("name, category").eq("id", workspaceId).single(),
        supabase.from("workspace_markets").select("id, market, marketplace").eq("workspace_id", workspaceId),
      ]);
      if (ws) {
        setName(ws.name);
        setCategory(ws.category || "");
      }
      const mkts = markets || [];
      setExistingMarkets(mkts);
      setActiveMarkets(new Set(mkts.map((m) => `${m.market}|${m.marketplace}`)));
      setLoading(false);
    })();
  }, [workspaceId]);

  const toggleMarket = (market: string, marketplace: string) => {
    const key = `${market}|${marketplace}`;
    setActiveMarkets((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });
  };

  const save = async () => {
    setSaving(true);
    try {
      // Update workspace
      const { error: wsErr } = await supabase.from("workspaces").update({ name, category: category || null }).eq("id", workspaceId);
      if (wsErr) throw wsErr;

      // Sync markets: delete all then re-insert active ones
      await supabase.from("workspace_markets").delete().eq("workspace_id", workspaceId);
      const inserts = Array.from(activeMarkets).map((key) => {
        const [market, marketplace] = key.split("|");
        return { market, marketplace, workspace_id: workspaceId };
      });
      if (inserts.length > 0) {
        const { error: mErr } = await supabase.from("workspace_markets").insert(inserts);
        if (mErr) throw mErr;
      }

      toast({ title: "Workspace updated" });
    } catch (err: any) {
      toast({ title: "Save failed", description: err.message, variant: "destructive" });
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="bg-card border rounded-md p-4 space-y-4">
        <h2 className="text-sm font-semibold">Workspace Details</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs">Brand / Workspace Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} className="h-9 text-sm" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Select category" /></SelectTrigger>
              <SelectContent>{CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
            </Select>
          </div>
        </div>
      </section>

      <section className="bg-card border rounded-md p-4 space-y-4">
        <h2 className="text-sm font-semibold">Markets & Marketplaces</h2>
        <div className="grid grid-cols-2 gap-3">
          {ALL_MARKETS.map((m) => {
            const key = `${m.market}|${m.marketplace}`;
            return (
              <label key={key} className="flex items-center gap-2 cursor-pointer">
                <Checkbox
                  checked={activeMarkets.has(key)}
                  onCheckedChange={() => toggleMarket(m.market, m.marketplace)}
                />
                <span className="text-sm">{m.marketplace}</span>
                <span className="text-[10px] text-muted-foreground">({m.market})</span>
              </label>
            );
          })}
        </div>
      </section>

      <Button onClick={save} disabled={saving} className="h-9 text-sm">
        {saving && <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />}
        Save Changes
      </Button>
    </div>
  );
}
