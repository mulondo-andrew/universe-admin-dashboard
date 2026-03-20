import React, { useEffect, useState } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { useClerk } from "@clerk/clerk-react";
import { useUser } from "@/hooks/useUser";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/theme-provider";
import { io } from "socket.io-client";
import { toast } from "sonner";

const navigationGroups = [
  {
    title: "Overview",
    items: [
      { name: "Dashboard", href: "/", icon: "dashboard" },
    ]
  },
  {
    title: "Personal",
    items: [
      { name: "My Profile", href: "/user/profile", icon: "person" },
      { name: "Network", href: "/user/network", icon: "group_add" },
      { name: "Settings", href: "/user/settings", icon: "settings" },
    ]
  },
  {
    title: "Identity",
    items: [
      { name: "User Directory", href: "/admin/identity/directory", icon: "group" },
      { name: "Role Management", href: "/admin/identity/rbac", icon: "manage_accounts" },
      { name: "Digital ID", href: "/admin/identity/digital-id", icon: "badge" },
    ]
  },
  {
    title: "Academic",
    items: [
      { name: "Campus Map", href: "/admin/campus/buildings", icon: "domain" },
      { name: "Academic Manager", href: "/admin/academic/manager", icon: "school" },
      { name: "Registrar", href: "/admin/academic/registrar", icon: "history_edu" },
      { name: "Scheduling", href: "/admin/academic/scheduling", icon: "calendar_month" },
    ]
  },
  {
    title: "Governance",
    items: [
      { name: "Clubs & Guilds", href: "/admin/governance/clubs", icon: "diversity_3" },
      { name: "Election Center", href: "/admin/governance/elections", icon: "how_to_vote" },
    ]
  },
  {
    title: "Safety",
    items: [
      { name: "Moderation Queue", href: "/admin/safety/moderation", icon: "gavel" },
      { name: "Crisis Response", href: "/admin/safety/crisis", icon: "emergency" },
      { name: "Content Filters", href: "/admin/safety/filters", icon: "filter_alt" },
    ]
  },
  {
    title: "Engagement",
    items: [
      { name: "Announcements", href: "/admin/engagement/announcements", icon: "campaign" },
      { name: "Marketplace", href: "/admin/engagement/marketplace", icon: "storefront" },
      { name: "Gamification", href: "/admin/engagement/gamification", icon: "social_leaderboard" },
    ]
  },
  {
    title: "System",
    items: [
      { name: "Kill Switch", href: "/admin/system/kill-switch", icon: "power_settings_new" },
      { name: "Universe State", href: "/admin/system/state", icon: "database" },
      { name: "Device Registry", href: "/admin/system/devices", icon: "devices" },
    ]
  }
];

export default function ProtectedLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, clerkUser } = useUser();
  const { signOut } = useClerk();
  const { theme, setTheme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [unreadAlerts, setUnreadAlerts] = useState(0);

  useEffect(() => {
    const socket = io();

    socket.on('critical_alert', (alert) => {
      toast.error(`Critical Alert: ${alert.message}`, {
        description: alert.time,
        duration: 10000,
      });
      setUnreadAlerts(prev => prev + 1);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const handleLogout = () => {
    signOut(() => navigate("/login"));
  };

  return (
    <div className="h-screen w-full overflow-hidden bg-muted/20 flex font-sans text-foreground">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-[280px] bg-muted/20 transform transition-transform duration-300 ease-in-out ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} md:relative md:translate-x-0`}
      >
        <div className="h-full flex flex-col">
          <div className="h-16 flex items-center px-6 mt-2">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                <span className="material-symbols-rounded text-primary-foreground text-[18px]">language</span>
              </div>
              <h1 className="text-[22px] font-medium text-foreground tracking-tight font-heading">
                UniVerse
              </h1>
            </div>
          </div>

          <nav className="flex-1 px-3 py-4 space-y-6 overflow-y-auto scrollbar-hide">
            {navigationGroups.map((group) => (
              <div key={group.title}>
                <h3 className="px-4 text-[13px] font-medium text-muted-foreground mb-2">
                  {group.title}
                </h3>
                <div className="space-y-0.5">
                  {group.items.map((item) => {
                    const isActive =
                      location.pathname === item.href ||
                      (item.href !== "/" && location.pathname.startsWith(item.href));
                    return (
                      <Link
                        key={item.name}
                        to={item.href}
                        className={`group flex items-center px-4 py-2.5 text-[14px] font-medium rounded-full transition-all duration-200 ${
                          isActive
                            ? "bg-primary/15 text-primary"
                            : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                        }`}
                      >
                        <span
                          className={`material-symbols-rounded mr-4 text-[20px] transition-colors duration-200 ${isActive ? "text-primary filled" : "text-muted-foreground group-hover:text-accent-foreground"}`}
                        >
                          {item.icon}
                        </span>
                        {item.name}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>

          <div className="p-4 bg-muted/20">
            <Button
              variant="ghost"
              className="w-full justify-start text-muted-foreground hover:text-accent-foreground hover:bg-accent rounded-full h-12 text-[14px] font-medium px-4"
              onClick={handleLogout}
            >
              <span className="material-symbols-rounded mr-4 text-[20px]">logout</span>
              Sign out
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-background rounded-tl-3xl shadow-sm border-l border-t border-border mt-2">
        {/* Topbar */}
        <header className="h-16 flex items-center justify-between px-6 bg-background border-b border-border/50 sticky top-0 z-40">
          <div className="flex items-center flex-1">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden mr-4 text-muted-foreground hover:bg-accent rounded-full"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <span className="material-symbols-rounded text-[24px]">menu</span>
            </Button>
            
            <div className="hidden md:flex items-center px-4 py-2.5 bg-muted rounded-full w-full max-w-[720px] focus-within:bg-background focus-within:shadow-[0_1px_3px_rgba(0,0,0,0.12),0_1px_2px_rgba(0,0,0,0.24)] transition-all border border-transparent focus-within:border-border">
              <span className="material-symbols-rounded text-muted-foreground mr-3 text-[20px]">search</span>
              <input 
                type="text" 
                placeholder="Search anything (Cmd+K)..." 
                className="bg-transparent border-none outline-none text-[15px] w-full placeholder:text-muted-foreground text-foreground font-sans"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-2 ml-4">
            <Button 
              variant="ghost" 
              size="icon" 
              className="relative text-muted-foreground hover:bg-accent rounded-full h-10 w-10"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              <span className="material-symbols-rounded text-[24px]">
                {theme === "dark" ? "light_mode" : "dark_mode"}
              </span>
            </Button>
            <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:bg-accent rounded-full h-10 w-10">
              <span className="material-symbols-rounded text-[24px]">help</span>
            </Button>
            <Link to="/user/settings">
              <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:bg-accent rounded-full h-10 w-10">
                <span className="material-symbols-rounded text-[24px]">settings</span>
              </Button>
            </Link>
            <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:bg-accent rounded-full h-10 w-10 mr-2" onClick={() => setUnreadAlerts(0)}>
              <span className="material-symbols-rounded text-[24px]">notifications</span>
              {unreadAlerts > 0 && (
                <span className="absolute top-2 right-2.5 w-2 h-2 bg-destructive rounded-full border-2 border-background"></span>
              )}
            </Button>
            
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-medium text-sm cursor-pointer hover:ring-2 hover:ring-offset-2 hover:ring-primary transition-all overflow-hidden">
              {clerkUser?.imageUrl ? (
                <img src={clerkUser.imageUrl} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                clerkUser?.firstName?.charAt(0) || "U"
              )}
            </div>
          </div>
        </header>

        {/* Main Area */}
        <main className="flex-1 overflow-y-auto p-8 bg-background">
          <div className="max-w-[1200px] mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
