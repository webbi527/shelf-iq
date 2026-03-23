import { useEffect, useState } from "react";
import { Plus, Bell, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface AlertRule {
  id: string;
  name: string;
  trigger_type: string;
  active: boolean | null;
  threshold: number | null;
}

const DEFAULT_RULES = [
  { name: "Competitor price drop", trigger_type: "price_drop", threshold: 10, active: true },
  { name: "Buy Box lost", trigger_type: "buybox_lost", threshold: null, active: true },
  { name: "Competitor out of stock", trigger_type: "comp_oos", threshold: null, active: true },
];

export default function SettingsPage() {
  const [rules, setRules] = useState<AlertRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [workspaceId, setWorkspaceId] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data: ws } = await supabase.from("workspaces").select("id").limit(1).single();
      if (!ws) { setLoading(false); return; }
      setWorkspaceId(ws.id);

      let { data } = await supabase
        .from("alert_rules")
        .select("id, name, trigger_type, active, threshold")
        .eq("workspace_id", ws.id);

      if (!data || data.length === 0) {
        const inserts = DEFAULT_RULES.map((r) => ({ ...r, workspace_id: ws.id }));
        const { data: inserted } = await supabase.from("alert_rules").insert(inserts).select("id, name, trigger_type, active, threshold");
        data = inserted || [];
      }

      setRules(data);
      setLoading(false);
    })();
  }, []);

  const toggle = async (id: string, current: boolean | null) => {
    const newVal = !(current ?? true);
    setRules((prev) => prev.map((r) => (r.id === id ? { ...r, active: newVal } : r)));
    await supabase.from("alert_rules").update({ active: newVal }).eq("id", id);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell className="w-5 h-5" />
          <h1 className="text-lg font-semibold">Alert Rules</h1>
        </div>
        <button className="h-8 px-3 text-xs font-medium bg-primary text-primary-foreground rounded-md hover:opacity-90 flex items-center gap-1.5 active:scale-[0.98] transition-all">
          <Plus className="w-3.5 h-3.5" /> New Rule
        </button>
      </div>

      <div className="bg-card border rounded-md divide-y">
        {rules.map((rule) => (
          <div key={rule.id} className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-3">
              <span className="pill-matched text-[10px]">{rule.trigger_type}</span>
              <span className="text-sm">{rule.name}</span>
              {rule.threshold != null && (
                <span className="text-[10px] text-muted-foreground">≥ {rule.threshold}%</span>
              )}
            </div>
            <button
              onClick={() => toggle(rule.id, rule.active)}
              className={`relative w-9 h-5 rounded-full transition-colors ${rule.active ? "bg-primary" : "bg-muted"}`}
            >
              <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-card shadow transition-transform ${rule.active ? "left-[18px]" : "left-0.5"}`} />
            </button>
          </div>
        ))}
      </div>

      <div className="bg-card border rounded-md p-4 space-y-4">
        <h2 className="text-sm font-semibold">Notification Channels</h2>
        <div className="space-y-2">
          {[
            { label: "Email notifications", enabled: true },
            { label: "Slack integration", enabled: false },
            { label: "In-app notifications", enabled: true },
          ].map((ch) => (
            <div key={ch.label} className="flex items-center justify-between py-1.5">
              <span className="text-sm">{ch.label}</span>
              <div className={`relative w-9 h-5 rounded-full ${ch.enabled ? "bg-primary" : "bg-muted"}`}>
                <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-card shadow ${ch.enabled ? "left-[18px]" : "left-0.5"}`} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
