import MarketFilter from "@/components/MarketFilter";
import StatusPill from "@/components/StatusPill";
import MiniSparkline from "@/components/MiniSparkline";
import { Package, AlertTriangle, ShoppingCart, TrendingUp, ArrowUpRight, ArrowDownRight } from "lucide-react";

const metrics = [
  { label: "SKUs Tracked", value: "47", change: "+3", icon: Package, up: true },
  { label: "Price Gaps Flagged", value: "12", change: "+2", icon: AlertTriangle, up: true },
  { label: "Buy Box Status", value: "31/47", change: "Won", icon: ShoppingCart, up: true },
  { label: "Avg Keyword Rank", value: "4.2", change: "-0.8", icon: TrendingUp, up: false },
];

const tableData = [
  { sku: "Wireless Earbuds Pro", asin: "B09XYZ1234", yourPrice: 149, compPrice: 139, gap: -6.7, sparkline: [145, 149, 148, 149, 145, 142, 149], compStock: "in-stock" as const, buyBox: "You", status: "winning" as const },
  { sku: "Smart Watch Band", asin: "B09ABC5678", yourPrice: 89, compPrice: 79, gap: -11.2, sparkline: [92, 89, 85, 89, 88, 89, 89], compStock: "in-stock" as const, buyBox: "Competitor", status: "review" as const },
  { sku: "USB-C Hub 7-in-1", asin: "B09QRS4321", yourPrice: 129, compPrice: 129, gap: 0, sparkline: [129, 129, 130, 129, 128, 129, 129], compStock: "in-stock" as const, buyBox: "You", status: "matched" as const },
  { sku: "Portable Charger 20K", asin: "B09MNO8765", yourPrice: 199, compPrice: 185, gap: -7.0, sparkline: [195, 199, 198, 199, 192, 188, 199], compStock: "not-found" as const, buyBox: "You", status: "winning" as const },
  { sku: "Noise Cancel Buds", asin: "B09TUV2468", yourPrice: 249, compPrice: 239, gap: -4.0, sparkline: [250, 248, 249, 245, 240, 239, 249], compStock: "in-stock" as const, buyBox: "Competitor", status: "review" as const },
];

const buyBoxBreakdown = [
  { holder: "You", count: 31, pct: 66 },
  { holder: "Competitor A", count: 9, pct: 19 },
  { holder: "Competitor B", count: 5, pct: 11 },
  { holder: "Other", count: 2, pct: 4 },
];

const opportunities = [
  { sku: "Smart Watch Band", action: "Lower price by AED 10 to win Buy Box", impact: "High" },
  { sku: "Noise Cancel Buds", action: "Competitor out of stock on Noon—increase ad spend", impact: "Medium" },
  { sku: "USB-C Hub 7-in-1", action: "Add coupon to differentiate at same price", impact: "Low" },
];

const alerts = [
  { time: "14 min ago", text: "Price drop detected: BeatsPods Ultra now AED 139 (was AED 149)" },
  { time: "2h ago", text: "Buy Box lost on Smart Watch Band—competitor undercut by 11%" },
  { time: "5h ago", text: "Keyword 'wireless earbuds' rank improved to #3 on Amazon UAE" },
];

export default function Dashboard() {
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
            <div className={`flex items-center gap-1 mt-1 text-xs font-medium ${m.up ? "text-[hsl(var(--status-winning))]" : "text-[hsl(var(--status-review))]"}`}>
              {m.up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
              {m.change}
            </div>
          </div>
        ))}
      </div>

      {/* Price comparison table */}
      <div className="bg-card border rounded-md">
        <div className="px-4 py-3 border-b">
          <h2 className="text-sm font-semibold">Price Comparison</h2>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>SKU</th>
              <th>Your Price</th>
              <th>Comp Price</th>
              <th>Gap %</th>
              <th>7-Day Trend</th>
              <th>Comp Stock</th>
              <th>Buy Box</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {tableData.map((row) => (
              <tr key={row.asin}>
                <td>
                  <div className="text-sm font-medium">{row.sku}</div>
                  <div className="text-xs text-muted-foreground font-mono">{row.asin}</div>
                </td>
                <td className="tabular-nums">AED {row.yourPrice}</td>
                <td className="tabular-nums">AED {row.compPrice}</td>
                <td className={`tabular-nums font-medium ${row.gap < 0 ? "text-[hsl(var(--status-review))]" : row.gap === 0 ? "text-[hsl(var(--status-matched))]" : "text-[hsl(var(--status-winning))]"}`}>
                  {row.gap > 0 ? "+" : ""}{row.gap}%
                </td>
                <td><MiniSparkline data={row.sparkline} /></td>
                <td><StatusPill status={row.compStock} /></td>
                <td className="text-sm">{row.buyBox}</td>
                <td><StatusPill status={row.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Bottom 3 cards */}
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
          <div className="space-y-3">
            {opportunities.map((o, i) => (
              <div key={i} className="text-xs">
                <div className="font-medium">{o.sku}</div>
                <div className="text-muted-foreground mt-0.5">{o.action}</div>
                <span className={`mt-1 inline-block ${o.impact === "High" ? "pill-review" : o.impact === "Medium" ? "pill-warning" : "pill-matched"}`}>
                  {o.impact} impact
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-card border rounded-md p-4">
          <h3 className="text-sm font-semibold mb-3">Recent Alerts</h3>
          <div className="space-y-3">
            {alerts.map((a, i) => (
              <div key={i} className="text-xs">
                <div className="text-muted-foreground">{a.time}</div>
                <div className="mt-0.5">{a.text}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
