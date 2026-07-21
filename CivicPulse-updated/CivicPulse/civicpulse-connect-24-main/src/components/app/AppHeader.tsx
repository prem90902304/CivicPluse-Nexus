import { useState } from "react";
import {
  Bell,
  Search,
  LogOut,
  User as UserIcon,
  ChevronDown,
  FileText,
  Building2,
  Briefcase,
} from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useSidebar } from "@/components/ui/sidebar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import {
  complaintService,
  departmentService,
  notificationService,
  officerService,
} from "@/api/services";

function initials(name: string) {
  return name
    .split(" ")
    .map((item) => item[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function AppHeader() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { toggleSidebar } = useSidebar();

  const [search, setSearch] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);

  const query = search.trim().toLowerCase();

  const { data: unreadCount = 0 } = useQuery({
    queryKey: ["notifications", "unread"],
    queryFn: notificationService.unreadCount,
    refetchInterval: 60_000,
    retry: false,
  });

  const globalSearch = useQuery({
    queryKey: ["global-search", query],
    enabled: query.length >= 2,
    queryFn: async () => {
      const [complaints, departments, officers] = await Promise.all([
        complaintService.list({ page: 0, size: 100 }),
        departmentService.list(),
        user?.role === "ADMIN" ? officerService.list() : Promise.resolve([]),
      ]);

      return {
        complaints: complaints.items.filter(
          (complaint) =>
            complaint.title.toLowerCase().includes(query) ||
            complaint.referenceNumber.toLowerCase().includes(query) ||
            complaint.departmentName?.toLowerCase().includes(query),
        ),
        departments: departments.filter(
          (department) =>
            department.name.toLowerCase().includes(query) ||
            department.code?.toLowerCase().includes(query),
        ),
        officers: officers.filter(
          (officer) =>
            officer.fullName.toLowerCase().includes(query) ||
            officer.email.toLowerCase().includes(query),
        ),
      };
    },
  });

  const handleLogout = async () => {
    await logout();
    navigate({ to: "/login" });
  };

  const hasResults =
    globalSearch.data &&
    (globalSearch.data.complaints.length > 0 ||
      globalSearch.data.departments.length > 0 ||
      globalSearch.data.officers.length > 0);

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border/80 bg-background/80 px-4 backdrop-blur-md lg:px-6">
      <button
        type="button"
        onClick={toggleSidebar}
        className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-lg hover:bg-muted"
        aria-label="Toggle sidebar"
      >
        <img
          src="/government-emblem.png"
          alt="Government of India"
          className="h-9 w-9 object-contain"
        />
      </button>

      <div className="hidden items-center gap-2 border-l border-border pl-4 md:flex">
        <span className="text-sm font-medium text-foreground">Civic service operations</span>
        <span className="text-sm text-muted-foreground">/</span>
        <span className="text-sm text-muted-foreground">Smart City Mission</span>
      </div>

      <div className="ml-auto flex items-center gap-2">
        <div className="relative hidden md:block">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

          <Input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setTimeout(() => setSearchFocused(false), 150)}
            placeholder="Search complaints, officers, departments…"
            className="h-9 w-80 rounded-lg border-border/80 bg-muted/40 pl-9 shadow-none focus-visible:bg-background"
          />

          {searchFocused && query.length >= 2 && (
            <div className="absolute right-0 top-11 z-50 max-h-96 w-96 overflow-y-auto rounded-xl border border-border bg-card p-2 shadow-xl">
              {globalSearch.isLoading && (
                <p className="px-3 py-4 text-sm text-muted-foreground">Searching…</p>
              )}

              {globalSearch.isError && (
                <p className="px-3 py-4 text-sm text-destructive">Unable to search right now.</p>
              )}

              {!globalSearch.isLoading && !hasResults && (
                <p className="px-3 py-4 text-sm text-muted-foreground">No results found.</p>
              )}

              {globalSearch.data?.complaints.map((complaint) => (
                <button
                  key={`complaint-${complaint.id}`}
                  type="button"
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left hover:bg-muted"
                  onMouseDown={(event) => {
                    event.preventDefault();
                    navigate({
                      to: "/complaints/$id",
                      params: { id: String(complaint.id) },
                    });
                    setSearch("");
                  }}
                >
                  <FileText className="h-4 w-4 text-blue-600" />
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium">{complaint.title}</span>
                    <span className="block text-xs text-muted-foreground">
                      Complaint · {complaint.referenceNumber}
                    </span>
                  </span>
                </button>
              ))}

              {globalSearch.data?.departments.map((department) => (
                <button
                  key={`department-${department.id}`}
                  type="button"
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left hover:bg-muted"
                  onMouseDown={(event) => {
                    event.preventDefault();
                    navigate({ to: "/admin/departments" });
                    setSearch("");
                  }}
                >
                  <Building2 className="h-4 w-4 text-emerald-600" />
                  <span>
                    <span className="block text-sm font-medium">{department.name}</span>
                    <span className="block text-xs text-muted-foreground">Department</span>
                  </span>
                </button>
              ))}

              {globalSearch.data?.officers.map((officer) => (
                <button
                  key={`officer-${officer.id}`}
                  type="button"
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left hover:bg-muted"
                  onMouseDown={(event) => {
                    event.preventDefault();
                    navigate({ to: "/admin/officers" });
                    setSearch("");
                  }}
                >
                  <Briefcase className="h-4 w-4 text-violet-600" />
                  <span>
                    <span className="block text-sm font-medium">{officer.fullName}</span>
                    <span className="block text-xs text-muted-foreground">
                      Officer · {officer.email}
                    </span>
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="relative rounded-lg"
          onClick={() => navigate({ to: "/notifications" })}
        >
          <Bell className="h-4 w-4" />

          {unreadCount > 0 && (
            <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-semibold text-destructive-foreground">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 rounded-lg border border-transparent px-2 py-1.5 hover:border-border hover:bg-muted">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-gradient-to-br from-blue-600 to-indigo-600 text-xs text-white">
                  {user ? initials(user.fullName) : "?"}
                </AvatarFallback>
              </Avatar>

              <div className="hidden text-left md:block">
                <p className="text-xs font-semibold leading-tight text-foreground">
                  {user?.fullName ?? "User"}
                </p>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  {user?.role}
                </p>
              </div>

              <ChevronDown className="h-3 w-3 text-muted-foreground" />
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col">
                <span className="text-sm font-medium">{user?.fullName}</span>
                <span className="text-xs font-normal text-muted-foreground">{user?.email}</span>
              </div>
            </DropdownMenuLabel>

            <DropdownMenuSeparator />

            <DropdownMenuItem onClick={() => navigate({ to: "/profile" })}>
              <UserIcon className="mr-2 h-4 w-4" />
              Profile
            </DropdownMenuItem>

            <DropdownMenuItem onClick={() => navigate({ to: "/settings" })}>
              Settings
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem onClick={handleLogout} className="text-destructive">
              <LogOut className="mr-2 h-4 w-4" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
