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
  Area,
  AreaChart,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import {
  Files,
  CheckCircle2,
  Clock,
  AlertCircle,
  Building2,
  Tags,
  Users,
  BarChart3,
  Landmark,
  FileCheck2,
} from "lucide-react";
import { analyticsService, serviceApplicationService } from "@/api/services";
import { PageHeader } from "@/components/app/PageHeader";
import { StatsCard } from "@/components/app/StatsCard";
import { Loading } from "@/components/app/Loading";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import type { ApplicationStatus } from "@/api/services/types";

export const Route = createFileRoute("/_authenticated/admin/dashboard")({
  head: () => ({ meta: [{ title: "Administrator Dashboard — CivicPulse Nexus" }] }),
  component: AdminDashboard,
});

const COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

function AdminDashboard() {
  const { user } = useAuth();
  const stats = useQuery({ queryKey: ["analytics", "admin"], queryFn: analyticsService.admin });
  const serviceApplications = useQuery({
    queryKey: ["service-applications", "admin-dashboard"],
    queryFn: serviceApplicationService.all,
  });
  const services = serviceApplications.data ?? [];
  const serviceCount = (status: ApplicationStatus) =>
    services.filter((application) => application.status === status).length;
  const recentServices = [...services]
    .sort((a, b) => new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime())
    .slice(0, 5);

  return (
    <>
      <PageHeader
        title={`Welcome back, ${user?.fullName ?? "Administrator"}`}
        description="Enterprise view of civic operations across all departments."
        breadcrumbs={[{ label: "Admin" }, { label: "Dashboard" }]}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link to="/admin/departments">
                <Building2 className="mr-2 h-4 w-4" />
                Departments
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/admin/services">
                <Landmark className="mr-2 h-4 w-4" />
                Service Management
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/admin/officers">
                <Users className="mr-2 h-4 w-4" />
                Officers
              </Link>
            </Button>
            <Button asChild>
              <Link to="/admin/analytics">
                <BarChart3 className="mr-2 h-4 w-4" />
                Analytics
              </Link>
            </Button>
          </div>
        }
      />
      <div className="mx-auto max-w-[1600px] space-y-6 p-6">
        {stats.isLoading ? (
          <Loading />
        ) : (
          stats.data && (
            <>
              <section className="rounded-sm border border-border bg-card">
                <div className="border-b border-border px-4 py-3">
                  <h2 className="text-sm font-semibold uppercase tracking-wide">Grievances</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Municipality-wide complaint status and resolution overview.
                  </p>
                </div>
                <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 lg:grid-cols-4">
                  <StatsCard
                    label="Total Complaints"
                    value={stats.data.totalComplaints}
                    icon={<Files className="h-6 w-6" />}
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
                    <h2 className="text-sm font-semibold uppercase tracking-wide">
                      Certificates &amp; Permits
                    </h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Certificate and permit applications across the municipality.
                    </p>
                  </div>
                  <Button variant="ghost" size="sm" asChild>
                    <Link to="/admin/services">View all</Link>
                  </Button>
                </div>
                <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 lg:grid-cols-4">
                  <StatsCard
                    label="Total Certificates & Permits"
                    value={services.length}
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
                    label="Certificates Issued"
                    value={serviceCount("CERTIFICATE_GENERATED") + serviceCount("DOWNLOADED")}
                    icon={<CheckCircle2 className="h-6 w-6" />}
                    tone="success"
                  />
                </div>
                {recentServices.length > 0 && (
                  <div className="overflow-x-auto border-t border-border">
                    <table className="w-full text-sm">
                      <thead className="bg-muted text-xs uppercase tracking-wide text-muted-foreground">
                        <tr>
                          <th className="px-4 py-2 text-left">Application</th>
                          <th className="px-4 py-2 text-left">Applicant</th>
                          <th className="px-4 py-2 text-left">Service</th>
                          <th className="px-4 py-2 text-left">Status</th>
                          <th className="px-4 py-2 text-left">Applied</th>
                        </tr>
                      </thead>
                      <tbody>
                        {recentServices.map((application) => (
                          <tr key={application.id} className="border-t border-border">
                            <td className="px-4 py-2 font-medium">
                              {application.applicationNumber}
                            </td>
                            <td className="px-4 py-2">{application.applicantName}</td>
                            <td className="px-4 py-2">
                              {application.serviceType.replaceAll("_", " ")}
                            </td>
                            <td className="px-4 py-2">{application.status.replaceAll("_", " ")}</td>
                            <td className="px-4 py-2 text-muted-foreground">
                              {new Date(application.appliedAt).toLocaleDateString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>

              <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                <div className="lg:col-span-2 rounded-sm border border-border bg-card">
                  <div className="border-b border-border px-4 py-3">
                    <h2 className="text-sm font-semibold uppercase tracking-wide">
                      Complaint Volume — Monthly
                    </h2>
                  </div>
                  <div className="p-4">
                    <ResponsiveContainer width="100%" height={300}>
                      <AreaChart data={stats.data.monthlyTrends}>
                        <defs>
                          <linearGradient id="c1" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="var(--chart-1)" stopOpacity={0.4} />
                            <stop offset="95%" stopColor="var(--chart-1)" stopOpacity={0} />
                          </linearGradient>
                          <linearGradient id="c2" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="var(--chart-2)" stopOpacity={0.4} />
                            <stop offset="95%" stopColor="var(--chart-2)" stopOpacity={0} />
                          </linearGradient>
                        </defs>
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
                        <Area
                          type="monotone"
                          dataKey="created"
                          stroke="var(--chart-1)"
                          fill="url(#c1)"
                          name="Created"
                        />
                        <Area
                          type="monotone"
                          dataKey="resolved"
                          stroke="var(--chart-2)"
                          fill="url(#c2)"
                          name="Resolved"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                <div className="rounded-sm border border-border bg-card">
                  <div className="border-b border-border px-4 py-3">
                    <h2 className="text-sm font-semibold uppercase tracking-wide">Status Mix</h2>
                  </div>
                  <div className="p-4">
                    <ResponsiveContainer width="100%" height={300}>
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

              <div className="rounded-sm border border-border bg-card">
                <div className="border-b border-border px-4 py-3">
                  <h2 className="text-sm font-semibold uppercase tracking-wide">
                    Department Performance
                  </h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-muted text-xs uppercase tracking-wide text-muted-foreground">
                      <tr>
                        <th className="px-4 py-2 text-left">Department</th>
                        <th className="px-4 py-2 text-right">Total</th>
                        <th className="px-4 py-2 text-right">Resolved</th>
                        <th className="px-4 py-2 text-right">Resolution Rate</th>
                        <th className="px-4 py-2 text-right">Avg Hours</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.data.departmentPerformance.map((d) => {
                        const rate = d.total ? (d.resolved / d.total) * 100 : 0;
                        return (
                          <tr key={d.departmentName} className="border-t border-border">
                            <td className="px-4 py-2 font-medium">{d.departmentName}</td>
                            <td className="px-4 py-2 text-right">{d.total}</td>
                            <td className="px-4 py-2 text-right">{d.resolved}</td>
                            <td className="px-4 py-2 text-right">
                              <div className="inline-flex items-center gap-2">
                                <div className="h-1.5 w-24 overflow-hidden rounded-full bg-muted">
                                  <div
                                    className="h-full bg-success"
                                    style={{ width: `${rate}%` }}
                                  />
                                </div>
                                <span className="tabular-nums">{rate.toFixed(0)}%</span>
                              </div>
                            </td>
                            <td className="px-4 py-2 text-right tabular-nums">
                              {d.avgHours.toFixed(1)}h
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <div className="rounded-sm border border-border bg-card">
                  <div className="border-b border-border px-4 py-3">
                    <h2 className="text-sm font-semibold uppercase tracking-wide">
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
                <div className="grid grid-cols-2 gap-3">
                  <QuickAction
                    to="/admin/departments"
                    icon={<Building2 />}
                    label="Departments"
                    desc="Manage municipal departments"
                  />
                  <QuickAction
                    to="/admin/categories"
                    icon={<Tags />}
                    label="Categories"
                    desc="Complaint category taxonomy"
                  />
                  <QuickAction
                    to="/admin/officers"
                    icon={<Users />}
                    label="Officers"
                    desc="Manage field officers"
                  />
                  <QuickAction
                    to="/admin/analytics"
                    icon={<BarChart3 />}
                    label="Analytics"
                    desc="Deep operational reports"
                  />
                </div>
              </div>
            </>
          )
        )}
      </div>
    </>
  );
}

function QuickAction({
  to,
  icon,
  label,
  desc,
}: {
  to: string;
  icon: React.ReactNode;
  label: string;
  desc: string;
}) {
  return (
    <Link
      to={to}
      className="flex flex-col justify-between rounded-sm border border-border bg-card p-4 shadow-sm transition hover:border-primary hover:shadow-md"
    >
      <div className="text-primary">{icon}</div>
      <div className="mt-4">
        <p className="text-sm font-semibold text-foreground">{label}</p>
        <p className="text-xs text-muted-foreground">{desc}</p>
      </div>
    </Link>
  );
}
