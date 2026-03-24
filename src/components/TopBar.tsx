import { useEffect, useState } from "react";
import { useMarket } from "@/components/MarketFilter";
import { supabase } from "@/integrations/supabase/client";
import { RefreshCw, Loader2 } from "lucide-react";

export default function TopBar() {
  const { market } = useMarket();
  const [wsName, setWsName] = useState("");
  const [alertCount, setAlertCount] = useState(0);
  const [scraping, setScraping] = useState(false);
  const [hasSnapshots, setHasSnapshots] = useState<boolean | null>(null);

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

      const { count: snapCount } = await supabase
        .from("price_snapshots")
        .select("id", { count: "exact", head: true })
        .eq("workspace_id", ws.id);
      setHasSnapshots((snapCount ?? 0) > 0);
    })();
  }, []);

  const handleScrape = () => {
    setScraping(true);
    setTimeout(() => setScraping(false), 2000);
  };

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
          <span className={`w-1.5 h-1.5 rounded-full ${hasSnapshots ? "bg-[hsl(var(--status-winning))]" : "bg-muted-foreground/40"}`} />
          {hasSnapshots === null ? "…" : hasSnapshots ? "Scraped today 06:00 AM" : "Never scraped"}
        </div>
        <button
          onClick={handleScrape}
          disabled={scraping}
          className="inline-flex items-center gap-1.5 h-7 px-2.5 text-xs font-medium rounded-md border border-border bg-muted/50 text-muted-foreground hover:bg-muted transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {scraping ? (
            <Loader2 className="w-3 h-3 animate-spin" />
          ) : (
            <RefreshCw className="w-3 h-3" />
          )}
          {scraping ? "Scraping…" : "Scrape now"}
        </button>
        {alertCount > 0 && (
          <span className="pill-review text-[10px] tabular-nums">{alertCount}</span>
        )}
      </div>
    </header>
  );
}
