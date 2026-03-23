import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Bell,
  TrendingUp,
  BarChart3,
  Users,
  Settings,
  LayoutGrid,
  LogOut,
} from "lucide-react";

const navItems = [
  { icon: LayoutDashboard, path: "/dashboard", label: "Dashboard" },
  { icon: Bell, path: "/alerts", label: "Alerts" },
  { icon: TrendingUp, path: "/price-history", label: "Price History" },
  { icon: BarChart3, path: "/shelf-position", label: "Shelf Position" },
  { icon: Users, path: "/competitors", label: "Competitors" },
  { icon: Settings, path: "/settings", label: "Settings" },
];

const workspaces = [
  { id: "1", name: "TechGear UAE", initials: "TG" },
  { id: "2", name: "HomeEssentials KSA", initials: "HE" },
  { id: "3", name: "FitLife Arabia", initials: "FL" },
];

export default function AppSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [showWorkspaces, setShowWorkspaces] = useState(false);

  return (
    <>
      <aside className="sidebar-nav w-[52px] min-h-screen flex flex-col items-center py-4 relative z-50 shrink-0">
        <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm mb-6">
          S
        </div>

        <nav className="flex-1 flex flex-col gap-1">
          {navItems.map((item) => {
            const active = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                title={item.label}
                className={`w-9 h-9 rounded-md flex items-center justify-center transition-colors ${
                  active ? "sidebar-item-active" : "sidebar-item-hover"
                }`}
              >
                <item.icon className="w-[18px] h-[18px]" />
              </button>
            );
          })}
        </nav>

        <div className="flex flex-col gap-2 items-center">
          <button
            onClick={() => setShowWorkspaces(!showWorkspaces)}
            title="Workspaces"
            className="w-9 h-9 rounded-md flex items-center justify-center sidebar-item-hover"
          >
            <LayoutGrid className="w-[18px] h-[18px]" />
          </button>
          <button
            onClick={() => navigate("/login")}
            title="Logout"
            className="w-9 h-9 rounded-md flex items-center justify-center sidebar-item-hover"
          >
            <LogOut className="w-[18px] h-[18px]" />
          </button>
        </div>
      </aside>

      {showWorkspaces && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setShowWorkspaces(false)} />
          <div className="fixed left-[52px] bottom-4 z-50 w-56 bg-card border rounded-lg shadow-lg p-3 animate-slide-in-left">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 px-1">
              Workspaces
            </p>
            {workspaces.map((ws) => (
              <button
                key={ws.id}
                onClick={() => setShowWorkspaces(false)}
                className="w-full flex items-center gap-2 px-2 py-2 rounded-md hover:bg-muted text-sm transition-colors"
              >
                <span className="w-7 h-7 rounded bg-primary/10 text-primary flex items-center justify-center text-xs font-semibold">
                  {ws.initials}
                </span>
                {ws.name}
              </button>
            ))}
          </div>
        </>
      )}
    </>
  );
}
