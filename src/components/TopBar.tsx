import { useEffect, useState, useRef } from "react";
import { formatDistanceToNow, isToday, format } from "date-fns";
import { useMarket } from "@/components/MarketFilter";
import { supabase } from "@/integrations/supabase/client";
import { RefreshCw, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

function formatScrapedAt(date: Date): string {
  if (isToday(date)) {
    return `Today ${format(date, "h:mm a")}`;
  }
  return formatDistanceToNow(date, { addSuffix: true });
}

export default function TopBar() {
  const { market } = useMarket();
  const [wsName, setWsName] = useState("");
  const [alertCount, setAlertCount] = useState(0);
  const [scraping, setScraping] = useState(false);
  const [lastScrapedLabel, setLastScrapedLabel] = useState<string | null>(null);
  const wsIdRef = useRef<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data: ws } = await supabase.from("workspaces").select("id, name").limit(1).single();
      if (!ws) return;
      setWsName(ws.name);
      wsIdRef.current = ws.id;

      const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const { count } = await supabase
        .from("alert_triggers")
        .select("id", { count: "exact", head: true })
        .eq("workspace_id", ws.id)
        .gte("triggered_at", since);
      setAlertCount(count || 0);

      const { data: lastSnap } = await supabase
        .from("price_snapshots")
        .select("scraped_at")
        .eq("workspace_id", ws.id)
        .order("scraped_at", { ascending: false })
        .limit(1)
        .single();

      if (lastSnap?.scraped_at) {
        setLastScrapedLabel(formatScrapedAt(new Date(lastSnap.scraped_at)));
      } else {
        setLastScrapedLabel("Never scraped");
      }
    })();
  }, []);

  const handleScrape = async () => {
    if (!wsIdRef.current) return;
    setScraping(true);
    try {
      const { error } = await supabase.functions.invoke("scrape-skus", {
        body: { workspace_id: wsIdRef.current },
      });
      if (error) throw error;
      toast({ title: "Scrape complete — dashboard updated" });
      setTimeout(() => window.location.reload(), 1000);
    } catch {
      toast({ title: "Scrape failed — please try again", variant: "destructive" });
    } finally {
      setScraping(false);
    }
  };

  const hasSnapshots = lastScrapedLabel !== null && lastScrapedLabel !== "Never scraped";

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
          {lastScrapedLabel === null ? "…" : lastScrapedLabel}
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