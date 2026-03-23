import { useState } from "react";

const markets = ["All", "Amazon UAE", "Amazon KSA", "Noon UAE", "Noon KSA"];

export default function MarketFilter() {
  const [active, setActive] = useState("All");
  return (
    <div className="flex gap-1 bg-card border rounded-md p-1">
      {markets.map((m) => (
        <button
          key={m}
          onClick={() => setActive(m)}
          className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
            active === m ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"
          }`}
        >
          {m}
        </button>
      ))}
    </div>
  );
}
