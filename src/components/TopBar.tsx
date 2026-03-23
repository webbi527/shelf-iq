import { Clock } from "lucide-react";

export default function TopBar() {
  return (
    <header className="h-12 border-b bg-card flex items-center justify-between px-5 shrink-0">
      <div className="flex items-center gap-2">
        <span className="font-semibold text-sm">TechGear UAE</span>
        <span className="text-xs text-muted-foreground">/ Dashboard</span>
      </div>
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Clock className="w-3.5 h-3.5" />
        Last scraped: 14 min ago
      </div>
    </header>
  );
}
