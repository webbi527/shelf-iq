import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { workspace_id } = await req.json();
    if (!workspace_id) {
      return new Response(JSON.stringify({ error: "workspace_id required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Fetch all own + competitor SKUs for the workspace
    const [{ data: ownSkus }, { data: compSkus }] = await Promise.all([
      supabase
        .from("own_skus")
        .select("id, asin, marketplace")
        .eq("workspace_id", workspace_id),
      supabase
        .from("competitor_skus")
        .select("id, asin, marketplace")
        .eq("workspace_id", workspace_id),
    ]);

    const now = new Date().toISOString();
    const snapshots: any[] = [];

    // Generate mock snapshots for own SKUs
    for (const sku of ownSkus || []) {
      snapshots.push({
        sku_id: sku.id,
        sku_type: "own",
        workspace_id,
        marketplace: sku.marketplace,
        price: +(Math.random() * 40 + 20).toFixed(2),
        currency: sku.marketplace.includes("UAE") ? "AED" : "SAR",
        in_stock: true,
        buy_box_holder: "American Garden",
        rating: +(Math.random() * 1 + 4).toFixed(1),
        review_count: Math.floor(Math.random() * 500 + 50),
        badge: null,
        scraped_at: now,
      });
    }

    // Generate mock snapshots for competitor SKUs
    for (const sku of compSkus || []) {
      snapshots.push({
        sku_id: sku.id,
        sku_type: "competitor",
        workspace_id,
        marketplace: sku.marketplace,
        price: +(Math.random() * 40 + 20).toFixed(2),
        currency: sku.marketplace.includes("UAE") ? "AED" : "SAR",
        in_stock: Math.random() > 0.2,
        buy_box_holder: "Hellmann's",
        rating: +(Math.random() * 1 + 3.5).toFixed(1),
        review_count: Math.floor(Math.random() * 500 + 50),
        badge: null,
        scraped_at: now,
      });
    }

    if (snapshots.length > 0) {
      const { error } = await supabase
        .from("price_snapshots")
        .insert(snapshots);
      if (error) throw error;
    }

    return new Response(
      JSON.stringify({ ok: true, count: snapshots.length }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
