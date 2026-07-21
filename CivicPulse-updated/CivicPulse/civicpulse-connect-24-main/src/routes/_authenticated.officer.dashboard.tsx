import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  BarChart,
  Bar,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { ClipboardList, CheckCircle2, Clock, TimerReset, Landmark, FileCheck2 } from "lucide-react";
import { analyticsService, complaintService, serviceApplicationService } from "@/api/services";
import { PageHeader } from "@/components/app/PageHeader";
import { StatsCard } from "@/components/app/StatsCard";
import { Loading } from "@/components/app/Loading";
import { EmptyState } from "@/components/app/EmptyState";
import { StatusChip, PriorityChip } from "@/components/app/StatusChip";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import type { ApplicationStatus } from "@/api/services/types";

export const Route = createFileRoute("/_authenticated/officer/dashboard")({
  head: () => ({ meta: [{ title: "Officer Dashboard — CivicPulse Nexus" }] }),
  component: OfficerDashboard,
});

const COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

const SERVICE_STATUSES: ApplicationStatus[] = [
  "SUBMITTED",
  "DOCUMENTS_REQUIRED",
  "UNDER_VERIFICATION",
  "VERIFIED",
  "APPROVED",
  "REJECTED",
  "CERTIFICATE_GENERATED",
  "DOWNLOADED",
];

function OfficerDashboard() {
  const { user } = useAuth();
  const isMunicipalOfficer =
    user?.role === "OFFICER" && user.email.toLowerCase() === "officer@civicpulse.com";
  const stats = useQuery({ queryKey: ["analytics", "officer"], queryFn: analyticsService.officer });
  const assigned = useQuery({
    queryKey: ["complaints", "assigned", "top"],
    queryFn: () => complaintService.assigned({ page: 0, size: 8, sort: "priority,desc" }),
  });
  const serviceApplications = useQuery({
    queryKey: ["service-applications", "officer-dashboard"],
    enabled: isMunicipalOfficer,
    queryFn: async () => {
      const applications = await Promise.all(
        SERVICE_STATUSES.map(serviceApplicationService.byStatus),
      );
      return applications.flat();
    },
  });
  const serviceCount = (status: ApplicationStatus) =>
    (serviceApplications.data ?? []).filter((application) => application.status === status).length;

  return (
    <>
      <PageHeader
        title={`Welcome back, ${user?.fullName ?? "Officer"}`}
        description="Manage assigned complaints and monitor your workload."
        breadcrumbs={[{ label: "Home", to: "/" }, { label: "Officer" }, { label: "Dashboard" }]}
      />
      <div className="mx-auto max-w-[1600px] space-y-6 p-6">
        {isMunicipalOfficer && (
          <section className="rounded-sm border border-border bg-card">
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <div>
                <h2 className="text-sm font-semibold uppercase tracking-wide">
                  Certificates &amp; Permits
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Municipal Officer service application workload.
                </p>
              </div>
              <Button size="sm" asChild>
                <Link to="/officer/services">
                  <Landmark className="mr-2 h-4 w-4" /> Service Applications
                </Link>
              </Button>
            </div>
            <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 lg:grid-cols-5">
              <StatsCard
                label="Total Certificates & Permits"
                value={(serviceApplications.data ?? []).length}
                icon={<Landmark className="h-6 w-6" />}
                tone="info"
              />
              <StatsCard
                label="Submitted"
                value={serviceCount("SUBMITTED")}
                icon={<FileCheck2 className="h-6 w-6" />}
                tone="danger"
              />
              <StatsCard
                label="Documents Required"
                value={serviceCount("DOCUMENTS_REQUIRED")}
                icon={<Clock className="h-6 w-6" />}
                tone="warning"
              />
              <StatsCard
                label="Verified"
                value={serviceCount("VERIFIED")}
                icon={<CheckCircle2 className="h-6 w-6" />}
                tone="success"
              />
              <StatsCard
                label="Certificates Issued"
                value={serviceCount("CERTIFICATE_GENERATED") + serviceCount("DOWNLOADED")}
                icon={<Landmark className="h-6 w-6" />}
                tone="info"
              />
            </div>
          </section>
        )}
        {stats.isLoading ? (
          <Loading />
        ) : (
          stats.data && (
            <>
              <section className="rounded-sm border border-border bg-card">
                <div className="border-b border-border px-4 py-3">
                  <h2 className="text-sm font-semibold uppercase tracking-wide">Grievances</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Complaint assignment, progress, and resolution overview.
                  </p>
                </div>
                <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 lg:grid-cols-4">
                  <StatsCard
                    label="Total Assigned"
                    value={stats.data.totalComplaints}
                    icon={<ClipboardList className="h-6 w-6" />}
                    tone="info"
                  />
                  <StatsCard
                    label="In Progress"
                    value={stats.data.openComplaints}
                    icon={<Clock className="h-6 w-6" />}
                    tone="warning"
                  />
                  <StatsCard
                    label="Resolved"
                    value={stats.data.resolvedComplaints}
                    icon={<CheckCircle2 className="h-6 w-6" />}
                    tone="success"
                  />
                  <StatsCard
                    label="Avg Resolution"
                    value={`${stats.data.avgResolutionHours.toFixed(1)}h`}
                    icon={<TimerReset className="h-6 w-6" />}
                  />
                </div>
              </section>

              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <div className="rounded-sm border border-border bg-card">
                  <div className="border-b border-border px-4 py-3">
                    <h2 className="text-sm font-semibold uppercase tracking-wide">
                      Workload by Priority
                    </h2>
                  </div>
                  <div className="p-4">
                    <ResponsiveContainer width="100%" height={280}>
                      <BarChart data={stats.data.priorityDistribution}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                        <XAxis dataKey="priority" stroke="var(--muted-foreground)" fontSize={12} />
                        <YAxis stroke="var(--muted-foreground)" fontSize={12} />
                        <Tooltip
                          contentStyle={{
                            background: "var(--card)",
                            border: "1px solid var(--border)",
                            fontSize: 12,
                          }}
                        />
                        <Bar dataKey="count" fill="var(--chart-1)" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                <div className="rounded-sm border border-border bg-card">
                  <div className="border-b border-border px-4 py-3">
                    <h2 className="text-sm font-semibold uppercase tracking-wide">
                      Status Breakdown
                    </h2>
                  </div>
                  <div className="p-4">
                    <ResponsiveContainer width="100%" height={280}>
                      <PieChart>
                        <Pie
                          data={stats.data.statusDistribution}
                          dataKey="count"
                          nameKey="status"
                          innerRadius={50}
                          outerRadius={90}
                        >
                          {stats.data.statusDistribution.map((_, i) => (
                            <Cell key={i} fill={COLORS[i % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            background: "var(--card)",
                            border: "1px solid var(--border)",
                            fontSize: 12,
                          }}
                        />
                        <Legend wrapperStyle={{ fontSize: 11 }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </>
          )
        )}

        <div className="rounded-sm border border-border bg-card">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <h2 className="text-sm font-semibold uppercase tracking-wide">
              {isMunicipalOfficer ? "Top Priority Complaints" : "Top Priority Assigned Complaints"}
            </h2>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/officer/assigned">
                {isMunicipalOfficer ? "View all complaints" : "View all assigned"}
              </Link>
            </Button>
          </div>
          {assigned.isLoading ? (
            <Loading />
          ) : assigned.data && assigned.data.items.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted text-xs uppercase tracking-wide text-muted-foreground">
                  <tr>
                    <th className="px-4 py-2 text-left">Reference</th>
                    <th className="px-4 py-2 text-left">Title</th>
                    <th className="px-4 py-2 text-left">Priority</th>
                    <th className="px-4 py-2 text-left">Status</th>
                    <th className="px-4 py-2 text-left">Filed</th>
                    <th className="px-4 py-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {assigned.data.items.map((c) => (
                    <tr key={c.id} className="border-t border-border hover:bg-muted/40">
                      <td className="px-4 py-2 font-mono text-xs">{c.referenceNumber}</td>
                      <td className="px-4 py-2">{c.title}</td>
                      <td className="px-4 py-2">
                        <PriorityChip priority={c.priority} />
                      </td>
                      <td className="px-4 py-2">
                        <StatusChip status={c.status} />
                      </td>
                      <td className="px-4 py-2 text-muted-foreground">
                        {new Date(c.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-2 text-right">
                        <Button variant="ghost" size="sm" asChild>
                          <Link to="/complaints/$id" params={{ id: String(c.id) }}>
                            Handle
                          </Link>
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState title="No assigned complaints" />
          )}
        </div>
      </div>
    </>
  );
}
