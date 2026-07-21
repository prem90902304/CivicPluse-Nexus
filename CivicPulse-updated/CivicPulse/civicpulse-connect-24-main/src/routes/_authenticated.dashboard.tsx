import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  BarChart,
  Bar,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line,
} from "recharts";
import {
  FilePlus2,
  FileText,
  CheckCircle2,
  Clock,
  AlertCircle,
  TimerReset,
  Landmark,
  ClipboardCheck,
} from "lucide-react";
import { analyticsService, complaintService, serviceApplicationService } from "@/api/services";
import { PageHeader } from "@/components/app/PageHeader";
import { StatsCard } from "@/components/app/StatsCard";
import { StatusChip, PriorityChip } from "@/components/app/StatusChip";
import { Loading } from "@/components/app/Loading";
import { EmptyState } from "@/components/app/EmptyState";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Citizen Dashboard — CivicPulse Nexus" }] }),
  component: CitizenDashboard,
});

const CHART_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

function CitizenDashboard() {
  const { user } = useAuth();
  const stats = useQuery({ queryKey: ["analytics", "citizen"], queryFn: analyticsService.citizen });
  const recent = useQuery({
    queryKey: ["complaints", "mine", "recent"],
    queryFn: () => complaintService.mine({ page: 0, size: 5, sort: "createdAt,desc" }),
  });
  const serviceApplications = useQuery({
    queryKey: ["service-applications", "dashboard", user?.id],
    queryFn: () => serviceApplicationService.mine(user!.id),
    enabled: Boolean(user?.id),
  });
  const serviceCount = serviceApplications.data?.length ?? 0;
  const serviceInProgress = (serviceApplications.data ?? []).filter(
    (application) =>
      application.status === "SUBMITTED" ||
      application.status === "DOCUMENTS_REQUIRED" ||
      application.status === "UNDER_VERIFICATION",
  ).length;

  return (
    <>
      <PageHeader
        title={`Welcome back, ${user?.fullName ?? "Citizen"}`}
        description="Manage your civic complaints, certificates, and permit applications."
        breadcrumbs={[{ label: "Home", to: "/" }, { label: "Dashboard" }]}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link to="/services/apply">
                <Landmark className="mr-2 h-4 w-4" /> Apply for Service
              </Link>
            </Button>
            <Button asChild>
              <Link to="/complaints/create">
                <FilePlus2 className="mr-2 h-4 w-4" /> Register Complaint
              </Link>
            </Button>
          </div>
        }
      />

      <div className="mx-auto max-w-[1600px] space-y-6 p-6">
        {stats.isLoading ? (
          <Loading />
        ) : stats.data ? (
          <>
            <section className="rounded-sm border border-border bg-card">
              <div className="flex items-center justify-between border-b border-border px-4 py-3">
                <div>
                  <h2 className="text-sm font-semibold uppercase tracking-wide text-foreground">
                    Grievances
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Track the status of your civic complaints.
                  </p>
                </div>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/complaints">My Complaints</Link>
                </Button>
              </div>
              <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 lg:grid-cols-4">
                <StatsCard
                  label="Total Complaints"
                  value={stats.data.totalComplaints}
                  icon={<FileText className="h-6 w-6" />}
                  tone="info"
                />
                <StatsCard
                  label="New"
                  value={stats.data.openComplaints}
                  icon={<AlertCircle className="h-6 w-6" />}
                  tone="warning"
                />
                <StatsCard
                  label="Pending"
                  value={stats.data.pendingComplaints}
                  icon={<Clock className="h-6 w-6" />}
                  tone="default"
                />
                <StatsCard
                  label="Resolved"
                  value={stats.data.resolvedComplaints}
                  icon={<CheckCircle2 className="h-6 w-6" />}
                  tone="success"
                />
              </div>
            </section>

            <section className="rounded-sm border border-border bg-card">
              <div className="flex items-center justify-between border-b border-border px-4 py-3">
                <div>
                  <h2 className="text-sm font-semibold uppercase tracking-wide text-foreground">
                    Certificates &amp; Permits
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Apply for municipal services and track your application progress.
                  </p>
                </div>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/services/applications">View applications</Link>
                </Button>
              </div>
              <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2">
                <Link
                  to="/services/apply"
                  className="rounded-md border border-border p-4 transition hover:border-primary hover:bg-muted/40"
                >
                  <Landmark className="h-5 w-5 text-primary" />
                  <p className="mt-3 font-semibold">Apply for a service</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Certificates, trade licenses, and permits.
                  </p>
                </Link>
                <Link
                  to="/services/applications"
                  className="rounded-md border border-border p-4 transition hover:border-primary hover:bg-muted/40"
                >
                  <ClipboardCheck className="h-5 w-5 text-primary" />
                  <p className="mt-3 font-semibold">Track applications</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {serviceCount} total · {serviceInProgress} currently in progress
                  </p>
                </Link>
              </div>
            </section>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
              <div className="lg:col-span-2 rounded-sm border border-border bg-card">
                <div className="border-b border-border px-4 py-3">
                  <h2 className="text-sm font-semibold uppercase tracking-wide text-foreground">
                    Monthly Trends
                  </h2>
                </div>
                <div className="p-4">
                  <ResponsiveContainer width="100%" height={280}>
                    <LineChart data={stats.data.monthlyTrends}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                      <XAxis dataKey="month" stroke="var(--muted-foreground)" fontSize={12} />
                      <YAxis stroke="var(--muted-foreground)" fontSize={12} />
                      <Tooltip
                        contentStyle={{
                          background: "var(--card)",
                          border: "1px solid var(--border)",
                          fontSize: 12,
                        }}
                      />
                      <Legend wrapperStyle={{ fontSize: 12 }} />
                      <Line
                        type="monotone"
                        dataKey="created"
                        stroke="var(--chart-1)"
                        strokeWidth={2}
                        name="Created"
                      />
                      <Line
                        type="monotone"
                        dataKey="resolved"
                        stroke="var(--chart-2)"
                        strokeWidth={2}
                        name="Resolved"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="rounded-sm border border-border bg-card">
                <div className="border-b border-border px-4 py-3">
                  <h2 className="text-sm font-semibold uppercase tracking-wide text-foreground">
                    Status Distribution
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
                          <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
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

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <div className="rounded-sm border border-border bg-card">
                <div className="border-b border-border px-4 py-3">
                  <h2 className="text-sm font-semibold uppercase tracking-wide text-foreground">
                    Priority Distribution
                  </h2>
                </div>
                <div className="p-4">
                  <ResponsiveContainer width="100%" height={260}>
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
                <div className="flex items-center justify-between border-b border-border px-4 py-3">
                  <h2 className="text-sm font-semibold uppercase tracking-wide text-foreground">
                    Resolution Metrics
                  </h2>
                  <TimerReset className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="grid grid-cols-2 gap-4 p-4">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">
                      Avg Resolution
                    </p>
                    <p className="mt-1 text-2xl font-semibold text-foreground">
                      {stats.data.avgResolutionHours.toFixed(1)}h
                    </p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">
                      Resolution Rate
                    </p>
                    <p className="mt-1 text-2xl font-semibold text-foreground">
                      {stats.data.totalComplaints
                        ? Math.round(
                            (stats.data.resolvedComplaints / stats.data.totalComplaints) * 100,
                          )
                        : 0}
                      %
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <EmptyState
            title="Unable to load dashboard"
            description="Statistics could not be retrieved from the server. Please try again later."
          />
        )}

        <div className="rounded-sm border border-border bg-card">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-foreground">
              Recent Complaints
            </h2>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/complaints">View all</Link>
            </Button>
          </div>
          {recent.isLoading ? (
            <Loading />
          ) : recent.data && recent.data.items.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted text-xs uppercase tracking-wide text-muted-foreground">
                  <tr>
                    <th className="px-4 py-2 text-left">Reference</th>
                    <th className="px-4 py-2 text-left">Title</th>
                    <th className="px-4 py-2 text-left">Department</th>
                    <th className="px-4 py-2 text-left">Priority</th>
                    <th className="px-4 py-2 text-left">Status</th>
                    <th className="px-4 py-2 text-left">Filed on</th>
                  </tr>
                </thead>
                <tbody>
                  {recent.data.items.map((c) => (
                    <tr key={c.id} className="border-t border-border hover:bg-muted/40">
                      <td className="px-4 py-2 font-mono text-xs">
                        <Link
                          to="/complaints/$id"
                          params={{ id: String(c.id) }}
                          className="text-primary hover:underline"
                        >
                          {c.referenceNumber}
                        </Link>
                      </td>
                      <td className="px-4 py-2">{c.title}</td>
                      <td className="px-4 py-2 text-muted-foreground">{c.departmentName ?? "—"}</td>
                      <td className="px-4 py-2">
                        <PriorityChip priority={c.priority} />
                      </td>
                      <td className="px-4 py-2">
                        <StatusChip status={c.status} />
                      </td>
                      <td className="px-4 py-2 text-muted-foreground">
                        {new Date(c.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState
              title="No complaints yet"
              description="You have not registered any complaints. Start by filing your first grievance."
              action={
                <Button asChild>
                  <Link to="/complaints/create">Register a complaint</Link>
                </Button>
              }
            />
          )}
        </div>
      </div>
    </>
  );
}
