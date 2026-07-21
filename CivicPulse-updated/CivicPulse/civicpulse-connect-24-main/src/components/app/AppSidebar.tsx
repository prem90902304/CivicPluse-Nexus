import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  FilePlus2,
  Files,
  ClipboardList,
  Building2,
  Tags,
  Users,
  BarChart3,
  Bell,
  Settings,
  Briefcase,
  Landmark,
} from "lucide-react";
import type { ComponentType } from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { useAuth } from "@/contexts/AuthContext";
import type { UserRole } from "@/api/services/types";

interface NavItem {
  title: string;
  url: string;
  icon: ComponentType<{ className?: string }>;
  roles: UserRole[];
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

const groups: NavGroup[] = [
  {
    label: "Overview",
    items: [
      { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard, roles: ["CITIZEN"] },
      {
        title: "Officer Dashboard",
        url: "/officer/dashboard",
        icon: LayoutDashboard,
        roles: ["OFFICER"],
      },
      {
        title: "Admin Dashboard",
        url: "/admin/dashboard",
        icon: LayoutDashboard,
        roles: ["ADMIN"],
      },
    ],
  },
  {
    label: "Grievances",
    items: [
      {
        title: "Register Complaint",
        url: "/complaints/create",
        icon: FilePlus2,
        roles: ["CITIZEN"],
      },
      { title: "My Complaints", url: "/complaints", icon: Files, roles: ["CITIZEN"] },
      {
        title: "Assigned Complaints",
        url: "/officer/assigned",
        icon: ClipboardList,
        roles: ["OFFICER"],
      },
      { title: "All Complaints", url: "/admin/complaints", icon: Files, roles: ["ADMIN"] },
    ],
  },
  {
    label: "Certificates & Permits",
    items: [
      { title: "Apply for Service", url: "/services/apply", icon: FilePlus2, roles: ["CITIZEN"] },
      { title: "My Applications", url: "/services/applications", icon: Files, roles: ["CITIZEN"] },
      {
        title: "Service Applications",
        url: "/officer/services",
        icon: ClipboardList,
        roles: ["OFFICER"],
      },
      { title: "Service Management", url: "/admin/services", icon: Landmark, roles: ["ADMIN"] },
    ],
  },
  {
    label: "Administration",
    items: [
      { title: "Departments", url: "/admin/departments", icon: Building2, roles: ["ADMIN"] },
      { title: "Categories", url: "/admin/categories", icon: Tags, roles: ["ADMIN"] },
      { title: "Officers", url: "/admin/officers", icon: Briefcase, roles: ["ADMIN"] },
      { title: "Analytics", url: "/admin/analytics", icon: BarChart3, roles: ["ADMIN"] },
    ],
  },
  {
    label: "Account",
    items: [
      {
        title: "Notifications",
        url: "/notifications",
        icon: Bell,
        roles: ["CITIZEN", "OFFICER", "ADMIN"],
      },
      {
        title: "Settings",
        url: "/settings",
        icon: Settings,
        roles: ["CITIZEN", "OFFICER", "ADMIN"],
      },
      { title: "Profile", url: "/profile", icon: Users, roles: ["CITIZEN", "OFFICER", "ADMIN"] },
    ],
  },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const { role, user } = useAuth();
  const isMunicipalOfficer =
    user?.role === "OFFICER" && user.email.toLowerCase() === "officer@civicpulse.com";
  const pathname = useRouterState({ select: (router) => router.location.pathname });

  const isActive = (url: string) => pathname === url || pathname.startsWith(`${url}/`);

  return (
    <Sidebar
      collapsible="icon"
      className="border-r border-white/5 bg-sidebar text-sidebar-foreground"
    >
      <SidebarHeader className="border-b border-white/5 bg-sidebar">
        <div className="border-b border-white/8 px-1 py-3">
          <div className="flex h-16 w-full items-center justify-center rounded-md bg-white px-4">
            <img
              src="/government-of-india-logo.png"
              alt="Government of India"
              className="h-12 w-auto max-w-full object-contain"
            />
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="bg-sidebar px-2 py-3">
        {groups.map((group) => {
          const items = group.items.filter((item) => {
            if (!role || !item.roles.includes(role)) return false;
            return item.url !== "/officer/services" || isMunicipalOfficer;
          });

          if (items.length === 0) return null;

          return (
            <SidebarGroup key={group.label} className="mb-3 p-0">
              {!collapsed && (
                <SidebarGroupLabel className="px-3 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                  {group.label}
                </SidebarGroupLabel>
              )}

              <SidebarGroupContent>
                <SidebarMenu>
                  {items.map((item) => (
                    <SidebarMenuItem key={item.url}>
                      <SidebarMenuButton
                        asChild
                        isActive={isActive(item.url)}
                        tooltip={
                          item.url === "/officer/assigned" && isMunicipalOfficer
                            ? "All Complaints"
                            : item.title
                        }
                        className="rounded-lg text-slate-300 transition hover:bg-white/5 hover:text-white data-[active=true]:bg-gradient-to-r data-[active=true]:from-blue-600/30 data-[active=true]:to-indigo-500/10 data-[active=true]:text-white data-[active=true]:ring-1 data-[active=true]:ring-inset data-[active=true]:ring-blue-400/30"
                      >
                        <Link to={item.url} className="flex items-center gap-2">
                          <item.icon className="h-4 w-4" />
                          {!collapsed && (
                            <span className="text-sm">
                              {item.url === "/officer/assigned" && isMunicipalOfficer
                                ? "All Complaints"
                                : item.title}
                            </span>
                          )}
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          );
        })}
      </SidebarContent>

      <SidebarFooter className="border-t border-white/5 bg-sidebar p-3">
        {!collapsed && (
          <div className="rounded-lg bg-white/5 p-3 text-xs text-slate-400 ring-1 ring-inset ring-white/5">
            <p className="font-medium text-slate-200">CivicPulse Nexus</p>
            <p className="mt-1">Smart City Mission · v1.0</p>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
