import { useState } from "react";

const brands = ["BeatsPods", "FitBand", "SoundCore", "AuraAudio"];

const stats = {
  BeatsPods: { skus: 12, avgPrice: 145, priceRange: "AED 89–249", winRate: "42%", trend: "Aggressive" },
  FitBand: { skus: 8, avgPrice: 79, priceRange: "AED 49–129", winRate: "28%", trend: "Stable" },
  SoundCore: { skus: 15, avgPrice: 169, priceRange: "AED 99–299", winRate: "35%", trend: "Expanding" },
  AuraAudio: { skus: 5, avgPrice: 199, priceRange: "AED 149–349", winRate: "18%", trend: "Premium" },
};

const activity = [
  { time: "2h ago", text: "BeatsPods dropped Earbuds Ultra to AED 139" },
  { time: "6h ago", text: "SoundCore launched new Q40 at AED 279" },
  { time: "1d ago", text: "FitBand restocked Tracker X on Noon KSA" },
  { time: "2d ago", text: "AuraAudio increased price on Studio Pro by 8%" },
  { time: "3d ago", text: "BeatsPods added 2 new ASINs to Amazon UAE" },
];

const pricePositions = [
  { category: "Entry", you: 89, comp: 79, label: "AED 49–99" },
  { category: "Mid", you: 149, comp: 139, label: "AED 100–199" },
  { category: "Premium", you: 249, comp: 239, label: "AED 200+" },
];

export default function Competitors() {
  const [activeBrand, setActiveBrand] = useState(0);
  const current = stats[brands[activeBrand] as keyof typeof stats];

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-lg font-semibold">Competitors</h1>

      {/* Brand switcher */}
      <div className="flex gap-2">
        {brands.map((b, i) => (
          <button
            key={b}
            onClick={() => setActiveBrand(i)}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              i === activeBrand ? "bg-primary text-primary-foreground" : "bg-card border hover:bg-muted"
            }`}
          >
            {b}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-4">
        {/* Deep dive card */}
        <div className="col-span-2 bg-card border rounded-md p-5 space-y-5">
          <h2 className="font-semibold">{brands[activeBrand]} — Deep Dive</h2>

          <div className="grid grid-cols-5 gap-3">
            {Object.entries(current).map(([key, val]) => (
              <div key={key} className="border rounded-md p-3">
                <div className="text-[11px] text-muted-foreground capitalize">{key.replace(/([A-Z])/g, " $1")}</div>
                <div className="text-sm font-semibold mt-0.5">{val}</div>
              </div>
            ))}
          </div>

          {/* Price position bars */}
          <div>
            <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">Price Position</h3>
            <div className="space-y-3">
              {pricePositions.map((p) => (
                <div key={p.category}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-medium">{p.category} <span className="text-muted-foreground">({p.label})</span></span>
                  </div>
                  <div className="flex gap-2 items-center">
                    <div className="flex-1 h-4 bg-muted rounded overflow-hidden flex">
                      <div className="h-full bg-primary rounded-l" style={{ width: `${(p.you / 300) * 100}%` }} />
                    </div>
                    <span className="text-xs tabular-nums w-16">You: {p.you}</span>
                  </div>
                  <div className="flex gap-2 items-center mt-1">
                    <div className="flex-1 h-4 bg-muted rounded overflow-hidden flex">
                      <div className="h-full bg-[hsl(var(--status-review))] rounded-l opacity-60" style={{ width: `${(p.comp / 300) * 100}%` }} />
                    </div>
                    <span className="text-xs tabular-nums w-16">Comp: {p.comp}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Activity feed */}
        <div className="bg-card border rounded-md p-4">
          <h3 className="text-sm font-semibold mb-3">Activity Feed</h3>
          <div className="space-y-3">
            {activity.map((a, i) => (
              <div key={i} className="text-xs border-l-2 border-muted pl-3">
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
