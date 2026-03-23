import { Bell, Filter } from "lucide-react";
import StatusPill from "@/components/StatusPill";

const alerts = [
  { id: 1, time: "14 min ago", type: "price" as const, title: "Price drop: BeatsPods Ultra", desc: "Competitor dropped to AED 139 from AED 149 on Amazon UAE. Gap now -6.7%.", status: "review" as const },
  { id: 2, time: "2h ago", type: "buybox" as const, title: "Buy Box lost: Smart Watch Band", desc: "Competitor undercut by 11% on Noon KSA. Consider matching price.", status: "review" as const },
  { id: 3, time: "5h ago", type: "rank" as const, title: "Rank improved: 'wireless earbuds'", desc: "Organic rank moved from #7 to #3 on Amazon UAE.", status: "winning" as const },
  { id: 4, time: "8h ago", type: "stock" as const, title: "Competitor out of stock: FitBand Tracker X", desc: "FitBand Tracker X is out of stock on Noon KSA. Opportunity to capture demand.", status: "info" as const },
  { id: 5, time: "1d ago", type: "price" as const, title: "Price matched: USB-C Hub 7-in-1", desc: "Competitor matched your price at AED 129 on Amazon UAE.", status: "matched" as const },
  { id: 6, time: "1d ago", type: "buybox" as const, title: "Buy Box won: Portable Charger 20K", desc: "You've won the Buy Box back on Amazon UAE after competitor went OOS.", status: "winning" as const },
  { id: 7, time: "2d ago", type: "price" as const, title: "Price alert: Noise Cancel Buds", desc: "Competitor lowered price to AED 239 (-4% undercut). Review pricing.", status: "warning" as const },
];

const typeIcons: Record<string, string> = {
  price: "💰",
  buybox: "🏆",
  rank: "📈",
  stock: "📦",
};

export default function Alerts() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell className="w-5 h-5" />
          <h1 className="text-lg font-semibold">Alerts</h1>
          <span className="pill-review">{alerts.filter(a => a.status === "review" || a.status === "warning").length} action needed</span>
        </div>
        <button className="h-8 px-3 text-xs font-medium border rounded-md hover:bg-muted flex items-center gap-1.5 transition-colors">
          <Filter className="w-3.5 h-3.5" /> Filter
        </button>
      </div>

      <div className="space-y-2">
        {alerts.map((a) => (
          <div key={a.id} className="bg-card border rounded-md px-4 py-3 flex items-start gap-3 hover:shadow-sm transition-shadow">
            <span className="text-lg mt-0.5">{typeIcons[a.type]}</span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{a.title}</span>
                <StatusPill status={a.status} />
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">{a.desc}</p>
              <span className="text-[11px] text-muted-foreground mt-1 block">{a.time}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
