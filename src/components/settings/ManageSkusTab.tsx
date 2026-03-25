import { useEffect, useState } from "react";
import { Loader2, Trash2, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const MARKETPLACES = ["Amazon UAE", "Amazon KSA", "Noon UAE", "Noon KSA"];

interface OwnSku {
  id: string;
  product_name: string | null;
  asin: string;
  marketplace: string;
}

interface CompSku {
  id: string;
  product_name: string | null;
  brand_name: string | null;
  asin: string;
  marketplace: string;
}

interface SkuMapping {
  id: string;
  own_sku_id: string | null;
  competitor_sku_id: string | null;
}

export default function ManageSkusTab({ workspaceId }: { workspaceId: string }) {
  const [loading, setLoading] = useState(true);
  const [ownSkus, setOwnSkus] = useState<OwnSku[]>([]);
  const [compSkus, setCompSkus] = useState<CompSku[]>([]);
  const [mappings, setMappings] = useState<SkuMapping[]>([]);

  // Own SKU form
  const [ownName, setOwnName] = useState("");
  const [ownCategory, setOwnCategory] = useState("");
  const [ownAsin, setOwnAsin] = useState("");
  const [ownMp, setOwnMp] = useState("");
  const [ownAdding, setOwnAdding] = useState(false);

  // Comp SKU form
  const [compName, setCompName] = useState("");
  const [compAsin, setCompAsin] = useState("");
  const [compMp, setCompMp] = useState("");
  const [compBrand, setCompBrand] = useState("");
  const [compAdding, setCompAdding] = useState(false);

  const fetchAll = async () => {
    setLoading(true);
    const [{ data: own }, { data: comp }, { data: maps }] = await Promise.all([
      supabase.from("own_skus").select("id, product_name, asin, marketplace").eq("workspace_id", workspaceId),
      supabase.from("competitor_skus").select("id, product_name, brand_name, asin, marketplace").eq("workspace_id", workspaceId),
      supabase.from("sku_mappings").select("id, own_sku_id, competitor_sku_id").eq("workspace_id", workspaceId),
    ]);
    setOwnSkus(own || []);
    setCompSkus(comp || []);
    setMappings(maps || []);
    setLoading(false);
  };

  useEffect(() => { fetchAll(); }, [workspaceId]);

  const addOwnSku = async () => {
    if (!ownAsin || !ownMp) return;
    setOwnAdding(true);
    const { error } = await supabase.from("own_skus").insert({
      product_name: ownName || null,
      category: ownCategory || null,
      asin: ownAsin,
      marketplace: ownMp,
      workspace_id: workspaceId,
    });
    setOwnAdding(false);
    if (error) { toast({ title: "Failed to add SKU", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Own SKU added" });
    setOwnName(""); setOwnCategory(""); setOwnAsin(""); setOwnMp("");
    fetchAll();
  };

  const deleteOwnSku = async (id: string) => {
    const { error } = await supabase.from("own_skus").delete().eq("id", id);
    if (error) { toast({ title: "Delete failed", variant: "destructive" }); return; }
    toast({ title: "SKU deleted" });
    fetchAll();
  };

  const addCompSku = async () => {
    if (!compAsin || !compMp) return;
    setCompAdding(true);
    const { error } = await supabase.from("competitor_skus").insert({
      product_name: compName || null,
      brand_name: compBrand || null,
      asin: compAsin,
      marketplace: compMp,
      workspace_id: workspaceId,
    });
    setCompAdding(false);
    if (error) { toast({ title: "Failed to add SKU", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Competitor SKU added" });
    setCompName(""); setCompAsin(""); setCompMp(""); setCompBrand("");
    fetchAll();
  };

  const deleteCompSku = async (id: string) => {
    const { error } = await supabase.from("competitor_skus").delete().eq("id", id);
    if (error) { toast({ title: "Delete failed", variant: "destructive" }); return; }
    toast({ title: "SKU deleted" });
    fetchAll();
  };

  const updateMapping = async (competitorSkuId: string, ownSkuId: string) => {
    // Delete existing mapping for this competitor
    await supabase.from("sku_mappings").delete().eq("competitor_sku_id", competitorSkuId).eq("workspace_id", workspaceId);

    if (ownSkuId === "__none__") {
      toast({ title: "Mapping removed" });
      fetchAll();
      return;
    }

    const { error } = await supabase.from("sku_mappings").insert({
      competitor_sku_id: competitorSkuId,
      own_sku_id: ownSkuId,
      workspace_id: workspaceId,
    });
    if (error) { toast({ title: "Mapping failed", variant: "destructive" }); return; }
    toast({ title: "Mapping updated" });
    fetchAll();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Own SKUs */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold">Own SKUs</h2>
        <div className="bg-card border rounded-md overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-muted-foreground text-left">
                <th className="px-4 py-2 font-medium">Product Name</th>
                <th className="px-4 py-2 font-medium">Category</th>
                <th className="px-4 py-2 font-medium">ASIN</th>
                <th className="px-4 py-2 font-medium">Marketplace</th>
                <th className="px-4 py-2 w-10" />
              </tr>
            </thead>
            <tbody className="divide-y">
              {ownSkus.map((s) => (
                <tr key={s.id}>
                  <td className="px-4 py-2">{s.product_name || "—"}</td>
                  <td className="px-4 py-2">{(s as any).category || "—"}</td>
                  <td className="px-4 py-2 font-mono text-xs">{s.asin}</td>
                  <td className="px-4 py-2">{s.marketplace}</td>
                  <td className="px-4 py-2">
                    <button onClick={() => deleteOwnSku(s.id)} className="text-muted-foreground hover:text-destructive transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
              {ownSkus.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-4 text-center text-muted-foreground text-xs">No own SKUs added yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="flex items-end gap-2">
          <Input placeholder="Product name" value={ownName} onChange={(e) => setOwnName(e.target.value)} className="h-8 text-xs flex-1" />
          <Input placeholder="e.g. Mayonnaise" value={ownCategory} onChange={(e) => setOwnCategory(e.target.value)} className="h-8 text-xs w-32" />
          <Input placeholder="ASIN" value={ownAsin} onChange={(e) => setOwnAsin(e.target.value)} className="h-8 text-xs w-32" />
          <Select value={ownMp} onValueChange={setOwnMp}>
            <SelectTrigger className="h-8 text-xs w-40"><SelectValue placeholder="Marketplace" /></SelectTrigger>
            <SelectContent>{MARKETPLACES.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
          </Select>
          <Button size="sm" className="h-8 text-xs" onClick={addOwnSku} disabled={ownAdding || !ownAsin || !ownMp}>
            {ownAdding ? <Loader2 className="w-3 h-3 animate-spin" /> : <Plus className="w-3 h-3" />} Add
          </Button>
        </div>
      </section>

      {/* Competitor SKUs */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold">Competitor SKUs</h2>
        <div className="bg-card border rounded-md overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-muted-foreground text-left">
                <th className="px-4 py-2 font-medium">Product Name</th>
                <th className="px-4 py-2 font-medium">Brand</th>
                <th className="px-4 py-2 font-medium">ASIN</th>
                <th className="px-4 py-2 font-medium">Marketplace</th>
                <th className="px-4 py-2 w-10" />
              </tr>
            </thead>
            <tbody className="divide-y">
              {compSkus.map((s) => (
                <tr key={s.id}>
                  <td className="px-4 py-2">{s.product_name || "—"}</td>
                  <td className="px-4 py-2">{s.brand_name || "—"}</td>
                  <td className="px-4 py-2 font-mono text-xs">{s.asin}</td>
                  <td className="px-4 py-2">{s.marketplace}</td>
                  <td className="px-4 py-2">
                    <button onClick={() => deleteCompSku(s.id)} className="text-muted-foreground hover:text-destructive transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
              {compSkus.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-4 text-center text-muted-foreground text-xs">No competitor SKUs added yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="flex items-end gap-2">
          <Input placeholder="Product name" value={compName} onChange={(e) => setCompName(e.target.value)} className="h-8 text-xs flex-1" />
          <Input placeholder="Brand name" value={compBrand} onChange={(e) => setCompBrand(e.target.value)} className="h-8 text-xs w-28" />
          <Input placeholder="ASIN" value={compAsin} onChange={(e) => setCompAsin(e.target.value)} className="h-8 text-xs w-28" />
          <Select value={compMp} onValueChange={setCompMp}>
            <SelectTrigger className="h-8 text-xs w-40"><SelectValue placeholder="Marketplace" /></SelectTrigger>
            <SelectContent>{MARKETPLACES.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
          </Select>
          <Button size="sm" className="h-8 text-xs" onClick={addCompSku} disabled={compAdding || !compAsin || !compMp}>
            {compAdding ? <Loader2 className="w-3 h-3 animate-spin" /> : <Plus className="w-3 h-3" />} Add
          </Button>
        </div>
      </section>

      {/* SKU Mappings */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold">SKU Mappings</h2>
        <p className="text-xs text-muted-foreground">Map each competitor SKU to one of your own SKUs for price comparison.</p>
        <div className="bg-card border rounded-md divide-y">
          {compSkus.length === 0 && (
            <div className="px-4 py-4 text-center text-muted-foreground text-xs">Add competitor SKUs first to create mappings</div>
          )}
          {compSkus.map((cs) => {
            const currentMapping = mappings.find((m) => m.competitor_sku_id === cs.id);
            return (
              <div key={cs.id} className="flex items-center justify-between px-4 py-3 gap-4">
                <div className="flex-1 min-w-0">
                  <span className="text-sm truncate block">{cs.product_name || cs.asin}</span>
                  <span className="text-[10px] text-muted-foreground">{cs.brand_name} · {cs.marketplace}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-muted-foreground">→</span>
                  <Select
                    value={currentMapping?.own_sku_id || "__none__"}
                    onValueChange={(val) => updateMapping(cs.id, val)}
                  >
                    <SelectTrigger className="h-8 text-xs w-56"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none__">No mapping</SelectItem>
                      {ownSkus.map((os) => (
                        <SelectItem key={os.id} value={os.id}>
                          {os.product_name || os.asin} ({os.marketplace})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
