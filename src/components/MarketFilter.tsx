import { createContext, useContext, useState, ReactNode } from "react";

export type Market = "UAE" | "KSA";

interface MarketContextType {
  market: Market;
  setMarket: (m: Market) => void;
  currency: string;
}

const MarketContext = createContext<MarketContextType>({
  market: "UAE",
  setMarket: () => {},
  currency: "AED",
});

export const useMarket = () => useContext(MarketContext);

export function MarketProvider({ children }: { children: ReactNode }) {
  const [market, setMarket] = useState<Market>("UAE");
  const currency = market === "UAE" ? "AED" : "SAR";
  return (
    <MarketContext.Provider value={{ market, setMarket, currency }}>
      {children}
    </MarketContext.Provider>
  );
}

const options: { value: Market; label: string }[] = [
  { value: "UAE", label: "UAE — AED" },
  { value: "KSA", label: "KSA — SAR" },
];

export default function MarketFilter() {
  const { market, setMarket } = useMarket();
  return (
    <div className="flex gap-1 bg-card border rounded-md p-1">
      {options.map((o) => (
        <button
          key={o.value}
          onClick={() => setMarket(o.value)}
          className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
            market === o.value
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:bg-muted"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
