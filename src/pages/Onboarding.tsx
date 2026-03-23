import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Check, ChevronRight, X, Plus, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const stepNames = ["Brand Details", "Own SKUs", "Competitor SKUs", "SKU Mapping", "Keywords", "Confirm"];
const marketplaces = ["Amazon UAE", "Amazon KSA", "Noon UAE", "Noon KSA"];

interface OwnSku {
  productName: string;
  asin: string;
  marketplace: string;
}

interface CompSku {
  productName: string;
  asin: string;
  marketplace: string;
  brandName: string;
}

interface Mapping {
  compIndex: number;
  ownIndex: number | null;
}

interface Keyword {
  text: string;
  marketplace: string;
}

export default function Onboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [launching, setLaunching] = useState(false);
  const [error, setError] = useState("");

  // Step 1
  const [brandName, setBrandName] = useState("");
  const [category, setCategory] = useState("Electronics");
  const [markets, setMarkets] = useState<string[]>(["UAE", "KSA"]);
  const [mplaces, setMplaces] = useState<string[]>(["Amazon", "Noon"]);

  // Step 2
  const [ownSkus, setOwnSkus] = useState<OwnSku[]>([
    { productName: "", asin: "", marketplace: "Amazon UAE" },
  ]);

  // Step 3
  const [compSkus, setCompSkus] = useState<CompSku[]>([
    { productName: "", asin: "", marketplace: "Amazon UAE", brandName: "" },
  ]);

  // Step 4
  const [mappings, setMappings] = useState<Mapping[]>([]);

  // Step 5
  const [keywords, setKeywords] = useState<Keyword[]>([]);
  const [kwInput, setKwInput] = useState("");

  // Sync mappings when entering step 4
  const goToStep = (s: number) => {
    if (s === 3) {
      setMappings(compSkus.map((_, i) => {
        const existing = mappings.find(m => m.compIndex === i);
        return existing ?? { compIndex: i, ownIndex: null };
      }));
    }
    setStep(s);
  };

  const next = () => { if (step < 5) goToStep(step + 1); };
  const prev = () => { if (step > 0) goToStep(step - 1); };

  const toggleArr = (arr: string[], val: string, setter: (a: string[]) => void) => {
    setter(arr.includes(val) ? arr.filter(v => v !== val) : [...arr, val]);
  };

  const handleLaunch = async () => {
    setError("");
    setLaunching(true);
    try {
      // 1. Create workspace
      const { data: ws, error: wsErr } = await supabase
        .from("workspaces")
        .insert({ name: brandName || "My Workspace", category })
        .select("id")
        .single();
      if (wsErr || !ws) throw wsErr;
      const wid = ws.id;

      // 2. Insert own SKUs
      const validOwn = ownSkus.filter(s => s.asin.trim());
      let insertedOwn: { id: string; asin: string }[] = [];
      if (validOwn.length) {
        const { data, error: ownErr } = await supabase
          .from("own_skus")
          .insert(validOwn.map(s => ({
            asin: s.asin.trim(),
            marketplace: s.marketplace,
            product_name: s.productName.trim() || null,
            workspace_id: wid,
          })))
          .select("id, asin");
        if (ownErr) throw ownErr;
        insertedOwn = data ?? [];
      }

      // 3. Insert competitor SKUs
      const validComp = compSkus.filter(s => s.asin.trim());
      let insertedComp: { id: string; asin: string }[] = [];
      if (validComp.length) {
        const { data, error: compErr } = await supabase
          .from("competitor_skus")
          .insert(validComp.map(s => ({
            asin: s.asin.trim(),
            marketplace: s.marketplace,
            product_name: s.productName.trim() || null,
            brand_name: s.brandName.trim() || null,
            workspace_id: wid,
          })))
          .select("id, asin");
        if (compErr) throw compErr;
        insertedComp = data ?? [];
      }

      // 4. Insert mappings
      const validMappings = mappings.filter(m => m.ownIndex !== null);
      if (validMappings.length && insertedOwn.length && insertedComp.length) {
        const mapRows = validMappings.map(m => {
          const compAsin = compSkus[m.compIndex]?.asin.trim();
          const ownAsin = ownSkus[m.ownIndex!]?.asin.trim();
          const compRow = insertedComp.find(r => r.asin === compAsin);
          const ownRow = insertedOwn.find(r => r.asin === ownAsin);
          return compRow && ownRow ? {
            competitor_sku_id: compRow.id,
            own_sku_id: ownRow.id,
            workspace_id: wid,
          } : null;
        }).filter(Boolean);
        if (mapRows.length) {
          const { error: mapErr } = await supabase.from("sku_mappings").insert(mapRows as any);
          if (mapErr) throw mapErr;
        }
      }

      // 5. Insert keywords
      const validKw = keywords.filter(k => k.text.trim());
      if (validKw.length) {
        const { error: kwErr } = await supabase.from("keywords").insert(
          validKw.map(k => ({ keyword: k.text.trim(), marketplace: k.marketplace, workspace_id: wid }))
        );
        if (kwErr) throw kwErr;
      }

      navigate("/dashboard");
    } catch (e: any) {
      setError(e?.message || "Something went wrong. Please try again.");
    } finally {
      setLaunching(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Progress bar */}
      <div className="h-14 border-b bg-card flex items-center px-6 gap-6 shrink-0">
        <span className="font-semibold text-sm">ShelfIQ Setup</span>
        <div className="flex-1 flex items-center gap-2">
          {stepNames.map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium transition-colors ${
                i < step ? "bg-primary text-primary-foreground" : i === step ? "border-2 border-primary text-primary" : "border text-muted-foreground"
              }`}>
                {i < step ? <Check className="w-3.5 h-3.5" /> : i + 1}
              </div>
              <span className={`text-xs hidden lg:block ${i === step ? "font-medium" : "text-muted-foreground"}`}>{s}</span>
              {i < stepNames.length - 1 && <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />}
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 flex items-start justify-center p-8 overflow-auto">
        <div className="w-full max-w-2xl animate-fade-in" key={step}>
          {step === 0 && (
            <div className="bg-card border rounded-lg p-6 space-y-5">
              <h2 className="text-lg font-semibold">Brand Details</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-muted-foreground block mb-1.5">Brand Name</label>
                  <input value={brandName} onChange={e => setBrandName(e.target.value)} className="w-full h-9 px-3 text-sm border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" placeholder="Your brand" />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground block mb-1.5">Category</label>
                  <select value={category} onChange={e => setCategory(e.target.value)} className="w-full h-9 px-3 text-sm border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary/30">
                    <option>Electronics</option>
                    <option>Fashion</option>
                    <option>Home & Kitchen</option>
                    <option>Beauty</option>
                    <option>Sports</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground block mb-1.5">Markets</label>
                  <div className="flex gap-2">
                    {["UAE", "KSA"].map(m => (
                      <label key={m} className="flex items-center gap-1.5 text-sm">
                        <input type="checkbox" checked={markets.includes(m)} onChange={() => toggleArr(markets, m, setMarkets)} className="rounded border-input accent-primary" /> {m}
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground block mb-1.5">Marketplaces</label>
                  <div className="flex gap-2">
                    {["Amazon", "Noon"].map(m => (
                      <label key={m} className="flex items-center gap-1.5 text-sm">
                        <input type="checkbox" checked={mplaces.includes(m)} onChange={() => toggleArr(mplaces, m, setMplaces)} className="rounded border-input accent-primary" /> {m}
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="bg-card border rounded-lg p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Your SKUs</h2>
                <button onClick={() => setOwnSkus([...ownSkus, { productName: "", asin: "", marketplace: "Amazon UAE" }])} className="h-8 px-3 text-xs font-medium border rounded-md hover:bg-muted flex items-center gap-1 transition-colors">
                  <Plus className="w-3.5 h-3.5" /> Add SKU
                </button>
              </div>
              <table className="data-table">
                <thead><tr><th>Product Name</th><th>ASIN</th><th>Marketplace</th><th></th></tr></thead>
                <tbody>
                  {ownSkus.map((s, i) => (
                    <tr key={i}>
                      <td><input value={s.productName} onChange={e => { const c = [...ownSkus]; c[i] = { ...c[i], productName: e.target.value }; setOwnSkus(c); }} className="w-full h-8 px-2 text-sm border rounded bg-background" placeholder="Product name" /></td>
                      <td><input value={s.asin} onChange={e => { const c = [...ownSkus]; c[i] = { ...c[i], asin: e.target.value }; setOwnSkus(c); }} className="w-full h-8 px-2 text-xs font-mono border rounded bg-background" placeholder="B0XXXXXXXXX" /></td>
                      <td>
                        <select value={s.marketplace} onChange={e => { const c = [...ownSkus]; c[i] = { ...c[i], marketplace: e.target.value }; setOwnSkus(c); }} className="w-full h-8 px-2 text-xs border rounded bg-background">
                          {marketplaces.map(m => <option key={m}>{m}</option>)}
                        </select>
                      </td>
                      <td><button onClick={() => setOwnSkus(ownSkus.filter((_, j) => j !== i))} className="text-muted-foreground hover:text-destructive"><X className="w-3.5 h-3.5" /></button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {step === 2 && (
            <div className="bg-card border rounded-lg p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Competitor SKUs</h2>
                <button onClick={() => setCompSkus([...compSkus, { productName: "", asin: "", marketplace: "Amazon UAE", brandName: "" }])} className="h-8 px-3 text-xs font-medium border rounded-md hover:bg-muted flex items-center gap-1 transition-colors">
                  <Plus className="w-3.5 h-3.5" /> Add SKU
                </button>
              </div>
              <table className="data-table">
                <thead><tr><th>Brand</th><th>Product Name</th><th>ASIN</th><th>Marketplace</th><th></th></tr></thead>
                <tbody>
                  {compSkus.map((s, i) => (
                    <tr key={i}>
                      <td><input value={s.brandName} onChange={e => { const c = [...compSkus]; c[i] = { ...c[i], brandName: e.target.value }; setCompSkus(c); }} className="w-full h-8 px-2 text-sm border rounded bg-background" placeholder="Brand" /></td>
                      <td><input value={s.productName} onChange={e => { const c = [...compSkus]; c[i] = { ...c[i], productName: e.target.value }; setCompSkus(c); }} className="w-full h-8 px-2 text-sm border rounded bg-background" placeholder="Product name" /></td>
                      <td><input value={s.asin} onChange={e => { const c = [...compSkus]; c[i] = { ...c[i], asin: e.target.value }; setCompSkus(c); }} className="w-full h-8 px-2 text-xs font-mono border rounded bg-background" placeholder="B0XXXXXXXXX" /></td>
                      <td>
                        <select value={s.marketplace} onChange={e => { const c = [...compSkus]; c[i] = { ...c[i], marketplace: e.target.value }; setCompSkus(c); }} className="w-full h-8 px-2 text-xs border rounded bg-background">
                          {marketplaces.map(m => <option key={m}>{m}</option>)}
                        </select>
                      </td>
                      <td><button onClick={() => setCompSkus(compSkus.filter((_, j) => j !== i))} className="text-muted-foreground hover:text-destructive"><X className="w-3.5 h-3.5" /></button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {step === 3 && (
            <div className="bg-card border rounded-lg p-6 space-y-4">
              <h2 className="text-lg font-semibold">SKU Mapping</h2>
              <p className="text-sm text-muted-foreground">For each competitor SKU, select which of your products it maps to.</p>
              <div className="space-y-3">
                {compSkus.filter(s => s.asin.trim()).map((comp, ci) => (
                  <div key={ci} className="flex items-center gap-4 border rounded-md p-3">
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{comp.productName || comp.asin}</div>
                      <div className="text-xs text-muted-foreground font-mono">{comp.asin} · {comp.marketplace}</div>
                    </div>
                    <div className="shrink-0">
                      <select
                        value={mappings.find(m => m.compIndex === ci)?.ownIndex ?? ""}
                        onChange={e => {
                          const val = e.target.value === "" ? null : Number(e.target.value);
                          setMappings(mappings.map(m => m.compIndex === ci ? { ...m, ownIndex: val } : m));
                        }}
                        className="h-8 px-2 text-xs border rounded bg-background min-w-[180px]"
                      >
                        <option value="">— No mapping —</option>
                        {ownSkus.filter(s => s.asin.trim()).map((own, oi) => (
                          <option key={oi} value={oi}>{own.productName || own.asin}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                ))}
                {compSkus.filter(s => s.asin.trim()).length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-6">Add competitor SKUs in the previous step first.</p>
                )}
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="bg-card border rounded-lg p-6 space-y-4">
              <h2 className="text-lg font-semibold">Tracked Keywords</h2>
              <div className="flex gap-2">
                <input
                  value={kwInput}
                  onChange={e => setKwInput(e.target.value)}
                  className="flex-1 h-9 px-3 text-sm border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
                  placeholder="Add keyword..."
                  onKeyDown={e => {
                    if (e.key === "Enter" && kwInput.trim()) {
                      setKeywords([...keywords, { text: kwInput.trim(), marketplace: "Amazon UAE" }]);
                      setKwInput("");
                    }
                  }}
                />
                <button onClick={() => { if (kwInput.trim()) { setKeywords([...keywords, { text: kwInput.trim(), marketplace: "Amazon UAE" }]); setKwInput(""); } }} className="h-9 px-4 bg-primary text-primary-foreground text-sm rounded-md font-medium hover:opacity-90 active:scale-[0.98] transition-all">Add</button>
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
            </div>
          )}

          {step === 5 && (
            <div className="bg-card border rounded-lg p-6 space-y-5">
              <h2 className="text-lg font-semibold">Ready to launch</h2>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="border rounded-md p-4">
                  <div className="text-xs text-muted-foreground mb-1">Brand</div>
                  <div className="font-medium">{brandName || "—"}</div>
                </div>
                <div className="border rounded-md p-4">
                  <div className="text-xs text-muted-foreground mb-1">Category</div>
                  <div className="font-medium">{category}</div>
                </div>
                <div className="border rounded-md p-4">
                  <div className="text-xs text-muted-foreground mb-1">Own SKUs</div>
                  <div className="font-medium">{ownSkus.filter(s => s.asin.trim()).length} products</div>
                </div>
                <div className="border rounded-md p-4">
                  <div className="text-xs text-muted-foreground mb-1">Competitor SKUs</div>
                  <div className="font-medium">{compSkus.filter(s => s.asin.trim()).length} products</div>
                </div>
                <div className="border rounded-md p-4">
                  <div className="text-xs text-muted-foreground mb-1">Mappings</div>
                  <div className="font-medium">{mappings.filter(m => m.ownIndex !== null).length} linked</div>
                </div>
                <div className="border rounded-md p-4">
                  <div className="text-xs text-muted-foreground mb-1">Keywords</div>
                  <div className="font-medium">{keywords.length} tracked</div>
                </div>
              </div>
              {error && <p className="text-xs text-destructive">{error}</p>}
              <button onClick={handleLaunch} disabled={launching} className="w-full h-10 bg-primary text-primary-foreground text-sm font-medium rounded-md hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-60 flex items-center justify-center gap-2">
                {launching && <Loader2 className="w-4 h-4 animate-spin" />}
                Launch ShelfIQ 🚀
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="h-16 border-t bg-card flex items-center justify-between px-6 shrink-0">
        <button onClick={prev} disabled={step === 0} className="text-sm font-medium text-muted-foreground disabled:opacity-30 hover:text-foreground transition-colors">Back</button>
        {step < 5 && (
          <button onClick={next} className="h-9 px-5 bg-primary text-primary-foreground text-sm font-medium rounded-md hover:opacity-90 active:scale-[0.98] transition-all">Continue</button>
        )}
      </div>
    </div>
  );
}
