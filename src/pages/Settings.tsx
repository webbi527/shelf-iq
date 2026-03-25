import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AlertRulesTab from "@/components/settings/AlertRulesTab";
import ManageSkusTab from "@/components/settings/ManageSkusTab";
import WorkspaceTab from "@/components/settings/WorkspaceTab";

export default function SettingsPage() {
  const [workspaceId, setWorkspaceId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data: ws } = await supabase.from("workspaces").select("id").limit(1).single();
      setWorkspaceId(ws?.id || null);
      setLoading(false);
    })();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!workspaceId) {
    return <div className="text-center text-muted-foreground py-12">No workspace found.</div>;
  }

  return (
    <div className="animate-fade-in max-w-3xl">
      <h1 className="text-lg font-semibold mb-4">Settings</h1>
      <Tabs defaultValue="alerts">
        <TabsList>
          <TabsTrigger value="alerts">Alert Rules</TabsTrigger>
          <TabsTrigger value="skus">Manage SKUs</TabsTrigger>
          <TabsTrigger value="workspace">Workspace</TabsTrigger>
        </TabsList>
        <TabsContent value="alerts"><AlertRulesTab workspaceId={workspaceId} /></TabsContent>
        <TabsContent value="skus"><ManageSkusTab workspaceId={workspaceId} /></TabsContent>
        <TabsContent value="workspace"><WorkspaceTab workspaceId={workspaceId} /></TabsContent>
      </Tabs>
    </div>
  );
}
