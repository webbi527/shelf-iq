import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useMarket } from "@/components/MarketFilter";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Loader2, Search, ArrowUp, ArrowDown, Minus } from "lucide-react";

interface RankRow {
  keyword: string;
  yourRank: number | null;
  compRank: number | null;
  compAsin: string | null;
  delta: number | null;
}

function RankPill({ rank, better }: { rank: number | null; better?: "ahead" | "behind" | "neutral" }) {
  if (rank === null)
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border border-dashed border-muted-foreground/40 text-muted-foreground">
        —
      </span>
    );
  const colors =
    better === "ahead"
      ? "bg-[hsl(var(--status-winning-bg))] text-[hsl(var(--status-winning))]"
      : better === "behind"
      ? "bg-[hsl(var(--status-review-bg))] text-[hsl(var(--status-review))]"
      : "bg-muted text-muted-foreground";
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold tabular-nums ${colors}`}>
      #{rank}
    </span>
  );
}

function DeltaCell({ delta }: { delta: number | null }) {
  if (delta === null) return <span className="text-xs text-muted-foreground">—</span>;
  const color = delta < 0 ? "text-[hsl(var(--status-winning))]" : delta > 0 ? "text-[hsl(var(--status-review))]" : "text-muted-foreground";
  const Icon = delta < 0 ? ArrowUp : delta > 0 ? ArrowDown : Minus;
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-semibold tabular-nums ${color}`}>
      <Icon className="w-3 h-3" />
      {delta === 0 ? "0" : Math.abs(delta)}
    </span>
  );
}

function RankTable({ rows }: { rows: RankRow[] }) {
  if (rows.length === 0) return null;
  return (
    <div className="bg-card border rounded-md overflow-x-auto">
      <table className="data-table w-full">
        <thead>
          <tr>
            <th>Keyword</th>
            <th>Your Rank</th>
            <th>Top Comp Rank</th>
            <th>Delta</th>
            <th>Trend</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => {
            const yourBetter =
              r.yourRank === null
                ? "neutral"
                : r.compRank === null
                ? "ahead"
                : r.yourRank < r.compRank
                ? "ahead"
                : r.yourRank > r.compRank
                ? "behind"
                : "neutral";
            return (
              <tr key={r.keyword}>
                <td className="text-sm font-medium">{r.keyword}</td>
                <td>
                  <RankPill rank={r.yourRank} better={yourBetter} />
                </td>
                <td>
                  <RankPill rank={r.compRank} />
                </td>
                <td>
                  <DeltaCell delta={r.delta} />
                </td>
                <td className="text-xs text-muted-foreground">—</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function InsightBar({ rows, type }: { rows: RankRow[]; type: "organic" | "sponsored" }) {
  const ranked = rows.filter((r) => r.yourRank !== null);
  if (ranked.length === 0) return null;
  const avg = ranked.reduce((s, r) => s + r.yourRank!, 0) / ranked.length;
  const ahead = rows.filter((r) => r.delta !== null && r.delta < 0).length;
  const label = type === "organic" ? "organic" : "sponsored";
  return (
    <div className="bg-muted/50 border rounded-md px-4 py-2.5 text-xs text-muted-foreground">
      Your average {label} rank is <span className="font-semibold text-foreground">#{avg.toFixed(1)}</span> across{" "}
      {ranked.length} keywords — you're ahead of the top competitor on{" "}
      <span className="font-semibold text-foreground">{ahead}</span> of them.
    </div>
  );
}

export default function ShelfPosition() {
  const { market } = useMarket();
  const [loading, setLoading] = useState(true);
  const [organicRows, setOrganicRows] = useState<RankRow[]>([]);
  const [sponsoredRows, setSponsoredRows] = useState<RankRow[]>([]);
  const [marketplaces, setMarketplaces] = useState<string[]>([]);
  const [selectedMp, setSelectedMp] = useState<string>("all");
  const [empty, setEmpty] = useState(false);

  useEffect(() => {
    load();
  }, [market]);

  async function load() {
    setLoading(true);
    try {
      const { data: ws } = await supabase.from("workspaces").select("id").limit(1).single();
      if (!ws) { setLoading(false); setEmpty(true); return; }

      const marketFilter = market === "UAE" ? "%UAE%" : "%KSA%";

      // Get keywords for this workspace + market
      const { data: keywords } = await supabase
        .from("keywords")
        .select("id, keyword, marketplace")
        .eq("workspace_id", ws.id)
        .ilike("marketplace", marketFilter);

      if (!keywords || keywords.length === 0) { setEmpty(true); setLoading(false); return; }

      // Unique marketplaces
      const mps = [...new Set(keywords.map((k) => k.marketplace))].sort();
      setMarketplaces(mps);

      // Get snapshots
      const { data: snapshots } = await supabase
        .from("keyword_snapshots")
        .select("*")
        .eq("workspace_id", ws.id)
        .ilike("marketplace", marketFilter)
        .order("scraped_at", { ascending: false });

      if (!snapshots || snapshots.length === 0) { setEmpty(true); setLoading(false); return; }

      setEmpty(false);

      // Latest snapshot per keyword_id
      const latestMap = new Map<string, typeof snapshots[0]>();
      for (const s of snapshots) {
        if (s.keyword_id && !latestMap.has(s.keyword_id)) {
          latestMap.set(s.keyword_id, s);
        }
      }

      const kwMap = new Map(keywords.map((k) => [k.id, k]));

      const organic: RankRow[] = [];
      const sponsored: RankRow[] = [];

      for (const [kwId, snap] of latestMap) {
        const kw = kwMap.get(kwId);
        if (!kw) continue;
        if (selectedMp !== "all" && kw.marketplace !== selectedMp) continue;

        // Organic
        const oYour = snap.your_organic_rank;
        const oComp = snap.top_comp_organic_rank;
        organic.push({
          keyword: kw.keyword,
          yourRank: oYour,
          compRank: oComp,
          compAsin: snap.top_comp_asin,
          delta: oYour != null && oComp != null ? oYour - oComp : null,
        });

        // Sponsored
        const sYour = snap.your_sponsored_rank;
        const sComp = snap.top_comp_sponsored_rank;
        sponsored.push({
          keyword: kw.keyword,
          yourRank: sYour,
          compRank: sComp,
          compAsin: snap.top_comp_asin,
          delta: sYour != null && sComp != null ? sYour - sComp : null,
        });
      }

      // Sort by keyword name
      organic.sort((a, b) => a.keyword.localeCompare(b.keyword));
      sponsored.sort((a, b) => a.keyword.localeCompare(b.keyword));

      setOrganicRows(organic);
      setSponsoredRows(sponsored);
    } catch (e) {
      console.error("ShelfPosition load error:", e);
    } finally {
      setLoading(false);
    }
  }

  // Re-filter when marketplace changes
  useEffect(() => {
    if (!loading) load();
  }, [selectedMp]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (empty) {
    return (
      <div className="space-y-6 animate-fade-in">
        <h1 className="text-lg font-semibold">Shelf Position</h1>
        <div className="flex flex-col items-center justify-center h-48 bg-card border rounded-md">
          <Search className="w-8 h-8 text-muted-foreground mb-3" />
          <p className="text-sm font-medium">No keyword data yet — click Scrape now to run your first ranking check.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">Shelf Position</h1>
        <Select value={selectedMp} onValueChange={setSelectedMp}>
          <SelectTrigger className="w-[200px] h-9 text-xs">
            <SelectValue placeholder="All marketplaces" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All marketplaces</SelectItem>
            {marketplaces.map((mp) => (
              <SelectItem key={mp} value={mp}>{mp}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Tabs defaultValue="organic">
        <TabsList>
          <TabsTrigger value="organic">Organic</TabsTrigger>
          <TabsTrigger value="sponsored">Sponsored</TabsTrigger>
        </TabsList>
        <TabsContent value="organic" className="space-y-4">
          <RankTable rows={organicRows} />
          <InsightBar rows={organicRows} type="organic" />
        </TabsContent>
        <TabsContent value="sponsored" className="space-y-4">
          <RankTable rows={sponsoredRows} />
          <InsightBar rows={sponsoredRows} type="sponsored" />
        </TabsContent>
      </Tabs>
    </div>
  );
}
