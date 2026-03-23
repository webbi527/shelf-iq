import { useState } from "react";
import { Plus, Bell } from "lucide-react";

const initialRules = [
  { id: 1, name: "Price drop > 5%", enabled: true, type: "Price" },
  { id: 2, name: "Buy Box lost", enabled: true, type: "Buy Box" },
  { id: 3, name: "Competitor out of stock", enabled: true, type: "Stock" },
  { id: 4, name: "Keyword rank drop > 3 positions", enabled: false, type: "Rank" },
  { id: 5, name: "New competitor ASIN detected", enabled: true, type: "Competitor" },
  { id: 6, name: "Price match within 2%", enabled: false, type: "Price" },
];

export default function SettingsPage() {
  const [rules, setRules] = useState(initialRules);

  const toggle = (id: number) => {
    setRules(rules.map(r => r.id === id ? { ...r, enabled: !r.enabled } : r));
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell className="w-5 h-5" />
          <h1 className="text-lg font-semibold">Alert Rules</h1>
        </div>
        <button className="h-8 px-3 text-xs font-medium bg-primary text-primary-foreground rounded-md hover:opacity-90 flex items-center gap-1.5 active:scale-[0.98] transition-all">
          <Plus className="w-3.5 h-3.5" /> New Rule
        </button>
      </div>

      <div className="bg-card border rounded-md divide-y">
        {rules.map((rule) => (
          <div key={rule.id} className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-3">
              <span className="pill-matched text-[10px]">{rule.type}</span>
              <span className="text-sm">{rule.name}</span>
            </div>
            <button
              onClick={() => toggle(rule.id)}
              className={`relative w-9 h-5 rounded-full transition-colors ${rule.enabled ? "bg-primary" : "bg-muted"}`}
            >
              <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-card shadow transition-transform ${rule.enabled ? "left-[18px]" : "left-0.5"}`} />
            </button>
          </div>
        ))}
      </div>

      <div className="bg-card border rounded-md p-4 space-y-4">
        <h2 className="text-sm font-semibold">Notification Channels</h2>
        <div className="space-y-2">
          {[
            { label: "Email notifications", enabled: true },
            { label: "Slack integration", enabled: false },
            { label: "In-app notifications", enabled: true },
          ].map((ch) => (
            <div key={ch.label} className="flex items-center justify-between py-1.5">
              <span className="text-sm">{ch.label}</span>
              <div className={`relative w-9 h-5 rounded-full ${ch.enabled ? "bg-primary" : "bg-muted"}`}>
                <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-card shadow ${ch.enabled ? "left-[18px]" : "left-0.5"}`} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
