import { useEffect, useState } from "react";
import { Bell, Filter, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";

interface AlertTrigger {
  id: string;
  title: string;
  description: string | null;
  triggered_at: string | null;
}

function dotColor(title: string) {
  const t = title.toLowerCase();
  if (t.includes("stock") || t.includes("oos") || t.includes("out of stock")) return "bg-[hsl(var(--status-matched))]";
  return "bg-[hsl(var(--status-review))]";
}

export default function Alerts() {
  const [alerts, setAlerts] = useState<AlertTrigger[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data: ws } = await supabase.from("workspaces").select("id").limit(1).single();
      if (!ws) { setLoading(false); return; }

      const { data } = await supabase
        .from("alert_triggers")
        .select("id, title, description, triggered_at")
        .eq("workspace_id", ws.id)
        .order("triggered_at", { ascending: false })
        .limit(50);

      setAlerts(data || []);
      setLoading(false);
    })();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell className="w-5 h-5" />
          <h1 className="text-lg font-semibold">Alerts</h1>
          {alerts.length > 0 && (
            <span className="pill-review">{alerts.length} alert{alerts.length !== 1 ? "s" : ""}</span>
          )}
        </div>
        <button className="h-8 px-3 text-xs font-medium border rounded-md hover:bg-muted flex items-center gap-1.5 transition-colors">
          <Filter className="w-3.5 h-3.5" /> Filter
        </button>
      </div>

      {alerts.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-48 bg-card border rounded-md">
          <p className="text-sm font-medium">No alerts yet — they will appear here after the first scrape runs.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {alerts.map((a) => (
            <div key={a.id} className="bg-card border rounded-md px-4 py-3 flex items-start gap-3 hover:shadow-sm transition-shadow">
              <span className={`w-2.5 h-2.5 rounded-full mt-1.5 shrink-0 ${dotColor(a.title)}`} />
              <div className="flex-1 min-w-0">
                <span className="text-sm font-medium">{a.title}</span>
                {a.description && (
                  <p className="text-xs text-muted-foreground mt-0.5">{a.description}</p>
                )}
                {a.triggered_at && (
                  <span className="text-[11px] text-muted-foreground mt-1 block">
                    {formatDistanceToNow(new Date(a.triggered_at), { addSuffix: true })}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
