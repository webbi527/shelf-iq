import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Check, ChevronRight, Search, GripVertical, X, Plus } from "lucide-react";

const steps = ["Brand Details", "Own SKUs", "Competitor SKUs", "SKU Mapping", "Keywords", "Confirm"];

const mockSkus = [
  { asin: "B09XYZ1234", marketplace: "Amazon UAE", name: "Wireless Earbuds Pro", status: "valid" as const },
  { asin: "B09ABC5678", marketplace: "Noon KSA", name: "Smart Watch Band", status: "valid" as const },
];

const mockCompSkus = [
  { asin: "B08DEF9012", marketplace: "Amazon UAE", name: "BeatsPods Ultra", status: "valid" as const },
  { asin: "B07GHI3456", marketplace: "Noon KSA", name: "FitBand Tracker X", status: "valid" as const },
  { asin: "B06JKL7890", marketplace: "Amazon KSA", name: "SoundCore Q30", status: "pending" as const },
];

export default function Onboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);

  const next = () => { if (step < 5) setStep(step + 1); };
  const prev = () => { if (step > 0) setStep(step - 1); };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Progress bar */}
      <div className="h-14 border-b bg-card flex items-center px-6 gap-6 shrink-0">
        <span className="font-semibold text-sm">ShelfIQ Setup</span>
        <div className="flex-1 flex items-center gap-2">
          {steps.map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium transition-colors ${
                i < step ? "bg-primary text-primary-foreground" : i === step ? "border-2 border-primary text-primary" : "border text-muted-foreground"
              }`}>
                {i < step ? <Check className="w-3.5 h-3.5" /> : i + 1}
              </div>
              <span className={`text-xs hidden lg:block ${i === step ? "font-medium" : "text-muted-foreground"}`}>{s}</span>
              {i < steps.length - 1 && <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />}
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 flex items-start justify-center p-8 overflow-auto">
        <div className="w-full max-w-2xl animate-fade-in" key={step}>
          {step === 0 && <BrandDetails />}
          {step === 1 && <SkuTable title="Your SKUs" skus={mockSkus} />}
          {step === 2 && <SkuTable title="Competitor SKUs" skus={mockCompSkus} />}
          {step === 3 && <SkuMapping />}
          {step === 4 && <Keywords />}
          {step === 5 && <Confirm onLaunch={() => navigate("/dashboard")} />}
        </div>
      </div>

      <div className="h-16 border-t bg-card flex items-center justify-between px-6 shrink-0">
        <button onClick={prev} disabled={step === 0} className="text-sm font-medium text-muted-foreground disabled:opacity-30 hover:text-foreground transition-colors">
          Back
        </button>
        {step < 5 ? (
          <button onClick={next} className="h-9 px-5 bg-primary text-primary-foreground text-sm font-medium rounded-md hover:opacity-90 active:scale-[0.98] transition-all">
            Continue
          </button>
        ) : null}
      </div>
    </div>
  );
}

function BrandDetails() {
  return (
    <div className="bg-card border rounded-lg p-6 space-y-5">
      <h2 className="text-lg font-semibold">Brand Details</h2>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-medium text-muted-foreground block mb-1.5">Brand Name</label>
          <input defaultValue="TechGear" className="w-full h-9 px-3 text-sm border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground block mb-1.5">Category</label>
          <select className="w-full h-9 px-3 text-sm border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary/30">
            <option>Electronics</option>
            <option>Fashion</option>
            <option>Home & Kitchen</option>
          </select>
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground block mb-1.5">Markets</label>
          <div className="flex gap-2">
            {["UAE", "KSA"].map(m => (
              <label key={m} className="flex items-center gap-1.5 text-sm">
                <input type="checkbox" defaultChecked className="rounded border-input accent-primary" /> {m}
              </label>
            ))}
          </div>
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground block mb-1.5">Marketplaces</label>
          <div className="flex gap-2">
            {["Amazon", "Noon"].map(m => (
              <label key={m} className="flex items-center gap-1.5 text-sm">
                <input type="checkbox" defaultChecked className="rounded border-input accent-primary" /> {m}
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function SkuTable({ title, skus }: { title: string; skus: { asin: string; marketplace: string; name: string; status: string }[] }) {
  return (
    <div className="bg-card border rounded-lg p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">{title}</h2>
        <button className="h-8 px-3 text-xs font-medium border rounded-md hover:bg-muted flex items-center gap-1 transition-colors">
          <Plus className="w-3.5 h-3.5" /> Add SKU
        </button>
      </div>
      <table className="data-table">
        <thead>
          <tr>
            <th>ASIN</th>
            <th>Marketplace</th>
            <th>Product Name</th>
            <th>Status</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {skus.map((s) => (
            <tr key={s.asin}>
              <td className="font-mono text-xs">{s.asin}</td>
              <td className="text-xs">{s.marketplace}</td>
              <td className="text-sm">{s.name}</td>
              <td>
                <span className={s.status === "valid" ? "pill-winning" : "pill-warning"}>
                  {s.status === "valid" ? "Valid" : "Pending"}
                </span>
              </td>
              <td>
                <button className="text-xs text-primary hover:underline">Validate</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function SkuMapping() {
  const [mapped, setMapped] = useState<string[]>(["B08DEF9012"]);
  const unmapped = mockCompSkus.filter(s => !mapped.includes(s.asin));

  return (
    <div className="bg-card border rounded-lg p-6 space-y-4">
      <h2 className="text-lg font-semibold">SKU Mapping</h2>
      <p className="text-sm text-muted-foreground">Drag competitor SKUs onto your SKUs to create mappings.</p>
      <div className="grid grid-cols-5 gap-4">
        <div className="col-span-3 space-y-3">
          {mockSkus.map(own => (
            <div key={own.asin} className="border rounded-md p-3 min-h-[70px]"
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => {
                const next = unmapped[0];
                if (next) setMapped([...mapped, next.asin]);
              }}
            >
              <div className="text-sm font-medium">{own.name}</div>
              <div className="text-xs text-muted-foreground font-mono">{own.asin}</div>
              <div className="flex gap-1 mt-2 flex-wrap">
                {mapped.filter((_, i) => i % mockSkus.length === mockSkus.indexOf(own)).map(a => {
                  const comp = mockCompSkus.find(c => c.asin === a);
                  return comp ? (
                    <span key={a} className="pill-matched text-[10px] gap-1 flex items-center">
                      {comp.name}
                      <X className="w-3 h-3 cursor-pointer" onClick={() => setMapped(mapped.filter(m => m !== a))} />
                    </span>
                  ) : null;
                })}
              </div>
            </div>
          ))}
        </div>
        <div className="col-span-2 border rounded-md p-3">
          <div className="relative mb-2">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input className="w-full h-8 pl-8 pr-3 text-xs border rounded-md bg-background" placeholder="Search competitors" />
          </div>
          <div className="space-y-1.5">
            {unmapped.map(s => (
              <div key={s.asin} draggable className="flex items-center gap-2 p-2 rounded border bg-muted/50 cursor-grab text-xs hover:bg-muted transition-colors">
                <GripVertical className="w-3.5 h-3.5 text-muted-foreground" />
                <div>
                  <div className="font-medium">{s.name}</div>
                  <div className="text-muted-foreground font-mono">{s.asin}</div>
                </div>
              </div>
            ))}
            {unmapped.length === 0 && <p className="text-xs text-muted-foreground text-center py-4">All mapped ✓</p>}
          </div>
        </div>
      </div>
    </div>
  );
}

function Keywords() {
  const [keywords, setKeywords] = useState([
    { text: "wireless earbuds", marketplace: "Amazon UAE", category: "Electronics" },
    { text: "bluetooth headphones", marketplace: "Noon KSA", category: "Electronics" },
  ]);
  const [input, setInput] = useState("");

  return (
    <div className="bg-card border rounded-lg p-6 space-y-4">
      <h2 className="text-lg font-semibold">Tracked Keywords</h2>
      <div className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 h-9 px-3 text-sm border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
          placeholder="Add keyword..."
          onKeyDown={(e) => {
            if (e.key === "Enter" && input.trim()) {
              setKeywords([...keywords, { text: input.trim(), marketplace: "Amazon UAE", category: "General" }]);
              setInput("");
            }
          }}
        />
        <button
          onClick={() => { if (input.trim()) { setKeywords([...keywords, { text: input.trim(), marketplace: "Amazon UAE", category: "General" }]); setInput(""); } }}
          className="h-9 px-4 bg-primary text-primary-foreground text-sm rounded-md font-medium hover:opacity-90 active:scale-[0.98] transition-all"
        >
          Add
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        {keywords.map((kw, i) => (
          <div key={i} className="flex items-center gap-1.5 px-3 py-1.5 bg-muted rounded-md text-sm">
            {kw.text}
            <span className="pill-matched text-[10px]">{kw.marketplace}</span>
            <X className="w-3 h-3 text-muted-foreground cursor-pointer hover:text-foreground" onClick={() => setKeywords(keywords.filter((_, j) => j !== i))} />
          </div>
        ))}
      </div>
      <div>
        <p className="text-xs text-muted-foreground mb-2">Suggested keywords</p>
        <div className="flex flex-wrap gap-1.5">
          {["noise cancelling earbuds", "tws earbuds", "sport headphones", "premium audio"].map(s => (
            <button
              key={s}
              onClick={() => setKeywords([...keywords, { text: s, marketplace: "Amazon UAE", category: "Electronics" }])}
              className="text-xs px-2.5 py-1 border rounded-md hover:bg-muted transition-colors"
            >
              + {s}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function Confirm({ onLaunch }: { onLaunch: () => void }) {
  return (
    <div className="bg-card border rounded-lg p-6 space-y-5">
      <h2 className="text-lg font-semibold">Ready to launch</h2>
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div className="border rounded-md p-4">
          <div className="text-xs text-muted-foreground mb-1">Brand</div>
          <div className="font-medium">TechGear</div>
        </div>
        <div className="border rounded-md p-4">
          <div className="text-xs text-muted-foreground mb-1">Markets</div>
          <div className="font-medium">UAE, KSA</div>
        </div>
        <div className="border rounded-md p-4">
          <div className="text-xs text-muted-foreground mb-1">Own SKUs</div>
          <div className="font-medium">2 products</div>
        </div>
        <div className="border rounded-md p-4">
          <div className="text-xs text-muted-foreground mb-1">Competitor SKUs</div>
          <div className="font-medium">3 products</div>
        </div>
        <div className="border rounded-md p-4">
          <div className="text-xs text-muted-foreground mb-1">Keywords</div>
          <div className="font-medium">2 tracked</div>
        </div>
        <div className="border rounded-md p-4">
          <div className="text-xs text-muted-foreground mb-1">Marketplaces</div>
          <div className="font-medium">Amazon, Noon</div>
        </div>
      </div>
      <button onClick={onLaunch} className="w-full h-10 bg-primary text-primary-foreground text-sm font-medium rounded-md hover:opacity-90 active:scale-[0.98] transition-all">
        Launch ShelfIQ 🚀
      </button>
    </div>
  );
}
