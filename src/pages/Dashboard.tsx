import { useEffect, useState } from "react";
import MarketFilter, { useMarket } from "@/components/MarketFilter";
import StatusPill from "@/components/StatusPill";
import type { Status } from "@/components/StatusPill";
import MiniSparkline from "@/components/MiniSparkline";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import {
  Package,
  AlertTriangle,
  ShoppingCart,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  ExternalLink,
  Loader2,
  Moon,
} from "lucide-react";

interface TableRow {
  sku: string;
  asin: string;
  competitor: string;
  competitorBrand: string;
  marketplace: string;
  yourPrice: number;
  compPrice: number;
  gap: number;
  sparkline: number[];
  compStock: Status;
  buyBox: string;
  status: Status;
  category: string;
}

interface BuyBoxEntry {
  holder: string;
  count: number;
  pct: number;
}

export default function Dashboard() {
  const { market, currency } = useMarket();
  const [loading, setLoading] = useState(true);
  const [tableData, setTableData] = useState<TableRow[]>([]);
  const [buyBoxBreakdown, setBuyBoxBreakdown] = useState<BuyBoxEntry[]>([]);
  const [skuCount, setSkuCount] = useState(0);
  const [gapsFlagged, setGapsFlagged] = useState(0);
  const [buyBoxCount, setBuyBoxCount] = useState("0/0");
  const [brandName, setBrandName] = useState("");
  const [hasSnapshots, setHasSnapshots] = useState(true);
  const [avgRank, setAvgRank] = useState("—");
  const [avgRankSublabel, setAvgRankSublabel] = useState("");

  useEffect(() => {
    loadDashboard();
  }, [market]);

  async function loadDashboard() {
    setLoading(true);
    try {
      // Get workspace
      const { data: ws } = await supabase.from("workspaces").select("id, name").limit(1).single();
      if (!ws) { setLoading(false); return; }
      const workspaceId = ws.id;
      setBrandName(ws.name);

      const marketFilter = market === "UAE" ? "%UAE%" : "%KSA%";

      // Get own SKUs for this market
      const { data: ownSkus } = await supabase
        .from("own_skus")
        .select("id, product_name, asin, marketplace, category")
        .eq("workspace_id", workspaceId)
        .ilike("marketplace", marketFilter);

      if (!ownSkus || ownSkus.length === 0) {
        setSkuCount(0);
        setTableData([]);
        setHasSnapshots(false);
        setLoading(false);
        return;
      }

      setSkuCount(ownSkus.length);

      // Get mappings
      const { data: mappings } = await supabase
        .from("sku_mappings")
        .select("own_sku_id, competitor_sku_id")
        .eq("workspace_id", workspaceId);

      // Get competitor SKUs
      const { data: compSkus } = await supabase
        .from("competitor_skus")
        .select("id, product_name, brand_name, asin, marketplace")
        .eq("workspace_id", workspaceId);

      // Get all price snapshots for this workspace + market
      const { data: snapshots } = await supabase
        .from("price_snapshots")
        .select("*")
        .eq("workspace_id", workspaceId)
        .ilike("marketplace", marketFilter)
        .order("scraped_at", { ascending: false });

      if (!snapshots || snapshots.length === 0) {
        setHasSnapshots(false);
        setTableData([]);
        setBuyBoxCount(`0/${ownSkus.length}`);
        setGapsFlagged(0);
        setBuyBoxBreakdown([]);
        setLoading(false);
        return;
      }

      setHasSnapshots(true);

      // Build latest snapshot per sku_id+sku_type
      const latestMap = new Map<string, typeof snapshots[0]>();
      const historyMap = new Map<string, number[]>();
      for (const s of snapshots) {
        const key = `${s.sku_id}_${s.sku_type}`;
        if (!latestMap.has(key)) latestMap.set(key, s);
        // Collect up to 7 prices for sparkline (own SKU only)
        if (s.sku_type === "own") {
          const arr = historyMap.get(s.sku_id) || [];
          if (arr.length < 7 && s.price != null) arr.push(Number(s.price));
          historyMap.set(s.sku_id, arr);
        }
      }

      const compMap = new Map((compSkus || []).map((c) => [c.id, c]));
      const mappingsByOwn = new Map<string, string[]>();
      for (const m of mappings || []) {
        if (m.own_sku_id && m.competitor_sku_id) {
          const arr = mappingsByOwn.get(m.own_sku_id) || [];
          arr.push(m.competitor_sku_id);
          mappingsByOwn.set(m.own_sku_id, arr);
        }
      }

      const rows: TableRow[] = [];
      let gaps = 0;
      const buyBoxHolders: Record<string, number> = {};
      let buyBoxYou = 0;

      for (const own of ownSkus) {
        const ownSnap = latestMap.get(`${own.id}_own`);
        const compIds = mappingsByOwn.get(own.id) || [];

        for (const compId of compIds) {
          const comp = compMap.get(compId);
          if (!comp) continue;
          const compSnap = latestMap.get(`${compId}_competitor`);

          const yourPrice = ownSnap?.price ? Number(ownSnap.price) : 0;
          const compPrice = compSnap?.price ? Number(compSnap.price) : 0;
          const gap = compPrice > 0 ? Math.round(((yourPrice - compPrice) / compPrice) * 1000) / 10 : 0;

          if (Math.abs(gap) > 10) gaps++;

          const buyBoxHolder = ownSnap?.buy_box_holder || "—";
          const holderKey = buyBoxHolder === brandName || buyBoxHolder === ws.name ? "You" : buyBoxHolder;
          buyBoxHolders[holderKey] = (buyBoxHolders[holderKey] || 0) + 1;
          if (holderKey === "You") buyBoxYou++;

          // Status logic
          let status: Status;
          if (gap < 0 && holderKey === "You") {
            status = "winning";
          } else if (gap > 10 || (holderKey !== "You" && holderKey !== "—")) {
            status = "review";
          } else {
            status = "matched";
          }

          const sparkline = (historyMap.get(own.id) || []).reverse();

          rows.push({
            sku: own.product_name || own.asin,
            asin: own.asin,
            competitor: comp.product_name || comp.asin,
            competitorBrand: comp.brand_name || "",
            marketplace: own.marketplace,
            yourPrice,
            compPrice,
            gap,
            sparkline: sparkline.length > 0 ? sparkline : [yourPrice],
            compStock: compSnap?.in_stock === false ? "not-found" : "in-stock",
            buyBox: holderKey,
            status,
            category: own.category || "Other",
          });
        }
      }

      setTableData(rows);
      setGapsFlagged(gaps);
      setBuyBoxCount(`${buyBoxYou}/${ownSkus.length}`);

      // Buy box breakdown
      const totalBB = Object.values(buyBoxHolders).reduce((a, b) => a + b, 0);
      const bbEntries: BuyBoxEntry[] = Object.entries(buyBoxHolders)
        .sort((a, b) => b[1] - a[1])
        .map(([holder, count]) => ({
          holder,
          count,
          pct: totalBB > 0 ? Math.round((count / totalBB) * 100) : 0,
        }));
      setBuyBoxBreakdown(bbEntries);

      // Avg Keyword Rank
      const { data: kwSnaps } = await supabase
        .from("keyword_snapshots")
        .select("keyword_id, your_organic_rank, scraped_at")
        .eq("workspace_id", workspaceId)
        .order("scraped_at", { ascending: false });

      if (kwSnaps && kwSnaps.length > 0) {
        const latestByKw = new Map<string, number>();
        for (const s of kwSnaps) {
          if (s.keyword_id && !latestByKw.has(s.keyword_id) && s.your_organic_rank != null) {
            latestByKw.set(s.keyword_id, s.your_organic_rank);
          }
        }
        if (latestByKw.size > 0) {
          const ranks = [...latestByKw.values()];
          const avg = ranks.reduce((a, b) => a + b, 0) / ranks.length;
          setAvgRank(`#${avg.toFixed(1)}`);
          setAvgRankSublabel(`unweighted avg · ${ranks.length} keywords tracked`);
        } else {
          setAvgRank("—");
          setAvgRankSublabel("");
        }
      } else {
        setAvgRank("—");
        setAvgRankSublabel("");
      }
    } catch (e) {
      console.error("Dashboard load error:", e);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!hasSnapshots) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold">Dashboard</h1>
          <MarketFilter />
        </div>
        <div className="flex flex-col items-center justify-center h-64 bg-card border rounded-md">
          <Moon className="w-10 h-10 text-muted-foreground mb-3" />
          <p className="text-sm font-medium">First scrape runs tonight — check back tomorrow morning.</p>
          <p className="text-xs text-muted-foreground mt-1">
            We'll collect pricing, Buy Box, and stock data across your tracked SKUs.
          </p>
        </div>
      </div>
    );
  }

  const metrics = [
    { label: "SKUs Tracked", value: String(skuCount), icon: Package },
    { label: "Price Gaps Flagged", value: String(gapsFlagged), icon: AlertTriangle },
    { label: "Buy Box Status", value: buyBoxCount, sublabel: "holder at last scrape — not a win rate", icon: ShoppingCart },
    { label: "Avg Keyword Rank", value: avgRank, sublabel: avgRankSublabel || undefined, icon: TrendingUp },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">Dashboard</h1>
        <MarketFilter />
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-4 gap-4">
        {metrics.map((m) => (
          <div key={m.label} className="metric-card">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-muted-foreground">{m.label}</span>
              <m.icon className="w-4 h-4 text-muted-foreground" />
            </div>
            <div className="text-2xl font-semibold tabular-nums">{m.value}</div>
            {"sublabel" in m && m.sublabel && (
              <div className="text-[10px] text-muted-foreground mt-1">{m.sublabel}</div>
            )}
          </div>
        ))}
      </div>

      {/* Price comparison table */}
      <div className="bg-card border rounded-md">
        <div className="px-4 py-3 border-b">
          <h2 className="text-sm font-semibold">Price Comparison</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="data-table w-full">
            <thead>
              <tr>
                <th>Your SKU</th>
                <th>Competitor</th>
                <th>Marketplace</th>
                <th>Your Price</th>
                <th>Comp Price</th>
                <th>Gap %</th>
                <th>7-Day Trend</th>
                <th>Comp Stock</th>
                <th>Buy Box</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {(() => {
                // Group rows by category, "Other" last
                const groups = new Map<string, TableRow[]>();
                for (const row of tableData) {
                  const cat = row.category;
                  if (!groups.has(cat)) groups.set(cat, []);
                  groups.get(cat)!.push(row);
                }
                const sortedCategories = [...groups.keys()].sort((a, b) => {
                  if (a === "Other") return 1;
                  if (b === "Other") return -1;
                  return a.localeCompare(b);
                });

                return sortedCategories.flatMap((cat) => {
                  const catRows = groups.get(cat)!;
                  return [
                    <tr key={`cat-${cat}`}>
                      <td
                        colSpan={11}
                        className="px-4 py-2 text-[11px] font-semibold tracking-wider uppercase text-muted-foreground bg-muted/50 border-b"
                      >
                        {cat}
                      </td>
                    </tr>,
                    ...catRows.map((row) => {
                const gapColor =
                  row.gap > 0
                    ? "text-[hsl(var(--status-review))]"
                    : row.gap < 0
                    ? "text-[hsl(var(--status-winning))]"
                    : "text-[hsl(var(--status-matched))]";
                const gapBg =
                  row.gap > 0
                    ? "bg-[hsl(var(--status-review))]"
                    : row.gap < 0
                    ? "bg-[hsl(var(--status-winning))]"
                    : "bg-[hsl(var(--status-matched))]";

                const absGap = Math.abs(row.gap);
                const gapDisplayColor = absGap <= 10 && row.gap !== 0 ? "text-[hsl(var(--status-matched))]" : gapColor;
                const gapDisplayBg = absGap <= 10 && row.gap !== 0 ? "bg-[hsl(var(--status-matched))]" : gapBg;

                return (
                  <tr key={`${row.asin}-${row.competitor}`}>
                    <td>
                      <div className="text-sm font-medium">{row.sku}</div>
                      <div className="text-xs text-muted-foreground font-mono">{row.asin}</div>
                    </td>
                    <td>
                      <div className="text-sm font-medium">{row.competitor}</div>
                      {row.competitorBrand && (
                        <div className="text-xs text-muted-foreground">{row.competitorBrand}</div>
                      )}
                    </td>
                    <td className="text-sm text-muted-foreground">{row.marketplace}</td>
                    <td className="tabular-nums">{currency} {row.yourPrice}</td>
                    <td className="tabular-nums">{currency} {row.compPrice}</td>
                    <td>
                      <div className="flex items-center gap-2">
                        <span className={`tabular-nums text-sm font-medium ${gapDisplayColor}`}>
                          {row.gap > 0 ? "+" : ""}{row.gap}%
                        </span>
                        <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${gapDisplayBg}`}
                            style={{ width: `${Math.min(absGap * 5, 100)}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td><MiniSparkline data={row.sparkline} /></td>
                    <td><StatusPill status={row.compStock} /></td>
                    <td className="text-sm">{row.buyBox}</td>
                    <td><StatusPill status={row.status} /></td>
                    <td>
                      <Button variant="ghost" size="icon" className="h-7 w-7">
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Button>
                    </td>
                  </tr>
                );
                    }),
                  ];
                });
              })()}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bottom cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-card border rounded-md p-4">
          <h3 className="text-sm font-semibold mb-3">Buy Box Breakdown</h3>
          <div className="space-y-2.5">
            {buyBoxBreakdown.map((b) => (
              <div key={b.holder}>
                <div className="flex justify-between text-xs mb-1">
                  <span>{b.holder}</span>
                  <span className="tabular-nums text-muted-foreground">{b.count} ({b.pct}%)</span>
                </div>
                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${b.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-card border rounded-md p-4">
          <h3 className="text-sm font-semibold mb-3">Opportunities</h3>
          <p className="text-xs text-muted-foreground">Opportunities will appear after scrape data is collected.</p>
        </div>

        <div className="bg-card border rounded-md p-4">
          <h3 className="text-sm font-semibold mb-3">Recent Alerts</h3>
          <p className="text-xs text-muted-foreground">No recent alerts.</p>
        </div>
      </div>
    </div>
  );
}
