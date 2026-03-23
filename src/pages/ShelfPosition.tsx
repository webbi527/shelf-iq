import { useState } from "react";
import { ArrowUp, ArrowDown, Minus } from "lucide-react";

const tabs = ["Organic", "Sponsored"];
const marketplaces = ["Amazon UAE", "Amazon KSA", "Noon UAE", "Noon KSA"];

const keywordData = [
  { keyword: "wireless earbuds", yourRank: 3, compRank: 7, delta: 4, trend: "up" as const },
  { keyword: "bluetooth headphones", yourRank: 5, compRank: 2, delta: -3, trend: "down" as const },
  { keyword: "tws earbuds", yourRank: 8, compRank: 12, delta: 4, trend: "up" as const },
  { keyword: "noise cancelling earbuds", yourRank: 12, compRank: 9, delta: -3, trend: "down" as const },
  { keyword: "best earbuds uae", yourRank: 2, compRank: 4, delta: 2, trend: "up" as const },
  { keyword: "premium audio", yourRank: 15, compRank: 14, delta: -1, trend: "down" as const },
  { keyword: "sport headphones", yourRank: 6, compRank: 6, delta: 0, trend: "flat" as const },
];

const insights = [
  { text: "You're outranking competitors on 4/7 keywords", type: "winning" },
  { text: "'best earbuds uae' shows strongest position at #2", type: "winning" },
  { text: "'bluetooth headphones' lost 3 positions this week", type: "review" },
];

export default function ShelfPosition() {
  const [activeTab, setActiveTab] = useState(0);
  const [marketplace, setMarketplace] = useState(marketplaces[0]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">Shelf Position</h1>
        <select
          value={marketplace}
          onChange={(e) => setMarketplace(e.target.value)}
          className="h-8 px-3 text-xs border rounded-md bg-card focus:outline-none focus:ring-2 focus:ring-primary/30"
        >
          {marketplaces.map(m => <option key={m}>{m}</option>)}
        </select>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-card border rounded-md p-1 w-fit">
        {tabs.map((t, i) => (
          <button
            key={t}
            onClick={() => setActiveTab(i)}
            className={`px-4 py-1.5 text-xs font-medium rounded transition-colors ${
              i === activeTab ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Insight bar */}
      <div className="bg-card border rounded-md p-4 flex gap-6">
        {insights.map((ins, i) => (
          <div key={i} className="flex items-center gap-2 text-xs">
            <div className={`w-2 h-2 rounded-full ${ins.type === "winning" ? "bg-[hsl(var(--status-winning))]" : "bg-[hsl(var(--status-review))]"}`} />
            {ins.text}
          </div>
        ))}
      </div>

      {/* Keyword rank table */}
      <div className="bg-card border rounded-md">
        <table className="data-table">
          <thead>
            <tr>
              <th>Keyword</th>
              <th>Your Rank</th>
              <th>Comp Rank</th>
              <th>Delta</th>
              <th>Trend</th>
            </tr>
          </thead>
          <tbody>
            {keywordData.map((row) => (
              <tr key={row.keyword}>
                <td className="text-sm font-medium">{row.keyword}</td>
                <td className="tabular-nums font-semibold">#{row.yourRank}</td>
                <td className="tabular-nums text-muted-foreground">#{row.compRank}</td>
                <td>
                  <span className={`font-medium tabular-nums ${row.delta > 0 ? "text-[hsl(var(--status-winning))]" : row.delta < 0 ? "text-[hsl(var(--status-review))]" : "text-muted-foreground"}`}>
                    {row.delta > 0 ? "+" : ""}{row.delta}
                  </span>
                </td>
                <td>
                  {row.trend === "up" && <ArrowUp className="w-4 h-4 text-[hsl(var(--status-winning))]" />}
                  {row.trend === "down" && <ArrowDown className="w-4 h-4 text-[hsl(var(--status-review))]" />}
                  {row.trend === "flat" && <Minus className="w-4 h-4 text-muted-foreground" />}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
