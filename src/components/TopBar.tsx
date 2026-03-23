import { useEffect, useState } from "react";
import { useMarket } from "@/components/MarketFilter";
import { supabase } from "@/integrations/supabase/client";

export default function TopBar() {
  const { market } = useMarket();
  const [wsName, setWsName] = useState("");
  const [alertCount, setAlertCount] = useState(0);

  useEffect(() => {
    (async () => {
      const { data: ws } = await supabase.from("workspaces").select("id, name").limit(1).single();
      if (!ws) return;
      setWsName(ws.name);

      const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const { count } = await supabase
        .from("alert_triggers")
        .select("id", { count: "exact", head: true })
        .eq("workspace_id", ws.id)
        .gte("triggered_at", since);
      setAlertCount(count || 0);
    })();
  }, []);

  return (
    <header className="h-12 border-b bg-card flex items-center justify-between px-5 shrink-0">
      <div className="flex items-center gap-2">
        <span className="font-semibold text-sm">{wsName || "—"}</span>
        <span className="px-2 py-0.5 text-[10px] font-medium rounded bg-muted text-muted-foreground">
          {market}
        </span>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <span className="w-1.5 h-1.5 rounded-full bg-[hsl(var(--status-winning))]" />
          Scraped today 06:00 AM
        </div>
        {alertCount > 0 && (
          <span className="pill-review text-[10px] tabular-nums">{alertCount}</span>
        )}
      </div>
    </header>
  );
}
