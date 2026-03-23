import { useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";

const skus = ["Wireless Earbuds Pro", "Smart Watch Band", "USB-C Hub 7-in-1", "Portable Charger 20K"];

const priceData = [
  { date: "Mar 1", you: 149, comp: 145 },
  { date: "Mar 5", you: 149, comp: 142 },
  { date: "Mar 8", you: 145, comp: 139 },
  { date: "Mar 10", you: 145, comp: 139 },
  { date: "Mar 13", you: 142, comp: 139 },
  { date: "Mar 15", you: 149, comp: 145 },
  { date: "Mar 18", you: 149, comp: 139 },
  { date: "Mar 20", you: 149, comp: 139 },
  { date: "Mar 23", you: 145, comp: 139 },
];

const events = [
  { date: "Mar 5", label: "Competitor price drop" },
  { date: "Mar 15", label: "You matched price" },
  { date: "Mar 18", label: "Competitor dropped again" },
];

const priceRanges = [
  { period: "7 days", yourMin: 145, yourMax: 149, compMin: 139, compMax: 145 },
  { period: "30 days", yourMin: 142, yourMax: 155, compMin: 135, compMax: 149 },
  { period: "90 days", yourMin: 139, yourMax: 159, compMin: 129, compMax: 149 },
];

export default function PriceHistory() {
  const [activeSku, setActiveSku] = useState(0);

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-lg font-semibold">Price History</h1>

      {/* SKU selector pills */}
      <div className="flex gap-2">
        {skus.map((s, i) => (
          <button
            key={s}
            onClick={() => setActiveSku(i)}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              i === activeSku ? "bg-primary text-primary-foreground" : "bg-card border hover:bg-muted"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Chart */}
      <div className="bg-card border rounded-md p-5">
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={priceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 32%, 91%)" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="hsl(222, 15%, 37%)" />
              <YAxis tick={{ fontSize: 11 }} stroke="hsl(222, 15%, 37%)" domain={["dataMin - 5", "dataMax + 5"]} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 6, border: "1px solid hsl(214, 32%, 91%)" }} />
              <Line type="monotone" dataKey="you" stroke="hsl(234, 55%, 57%)" strokeWidth={2} name="Your Price" dot={{ r: 3 }} />
              <Line type="monotone" dataKey="comp" stroke="hsl(0, 72%, 51%)" strokeWidth={2} name="Competitor" dot={{ r: 3 }} strokeDasharray="4 4" />
              {events.map((e) => (
                <ReferenceLine key={e.date} x={e.date} stroke="hsl(38, 92%, 50%)" strokeDasharray="3 3" label={{ value: "⚡", position: "top" }} />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Events timeline */}
      <div className="bg-card border rounded-md p-4">
        <h3 className="text-sm font-semibold mb-3">Events</h3>
        <div className="flex gap-6">
          {events.map((e, i) => (
            <div key={i} className="flex items-center gap-2 text-xs">
              <div className="w-2 h-2 rounded-full bg-[hsl(38,92%,50%)]" />
              <span className="text-muted-foreground">{e.date}</span>
              <span>{e.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Price range table */}
      <div className="bg-card border rounded-md">
        <div className="px-4 py-3 border-b">
          <h3 className="text-sm font-semibold">Price Range</h3>
        </div>
        <table className="data-table">
          <thead>
            <tr><th>Period</th><th>Your Min</th><th>Your Max</th><th>Comp Min</th><th>Comp Max</th></tr>
          </thead>
          <tbody>
            {priceRanges.map((r) => (
              <tr key={r.period}>
                <td className="text-sm font-medium">{r.period}</td>
                <td className="tabular-nums">AED {r.yourMin}</td>
                <td className="tabular-nums">AED {r.yourMax}</td>
                <td className="tabular-nums">AED {r.compMin}</td>
                <td className="tabular-nums">AED {r.compMax}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
