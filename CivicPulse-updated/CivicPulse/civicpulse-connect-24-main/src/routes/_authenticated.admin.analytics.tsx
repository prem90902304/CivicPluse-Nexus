import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  AreaChart,
  Area,
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
import { analyticsService } from "@/api/services";
import { PageHeader } from "@/components/app/PageHeader";
import { Loading } from "@/components/app/Loading";
import { StatsCard } from "@/components/app/StatsCard";

export const Route = createFileRoute("/_authenticated/admin/analytics")({
  head: () => ({ meta: [{ title: "Analytics — CivicPulse Nexus" }] }),
  component: AnalyticsPage,
});

const COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

function AnalyticsPage() {
  const q = useQuery({ queryKey: ["analytics", "admin"], queryFn: analyticsService.admin });
  return (
    <>
      <PageHeader
        title="Operational Analytics"
        description="Cross-department reports and resolution metrics."
        breadcrumbs={[{ label: "Admin" }, { label: "Analytics" }]}
      />
      <div className="mx-auto max-w-[1600px] space-y-6 p-6">
        {q.isLoading ? (
          <Loading />
        ) : (
          q.data && (
            <>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <StatsCard label="Total Complaints" value={q.data.totalComplaints} tone="info" />
                <StatsCard label="Resolved" value={q.data.resolvedComplaints} tone="success" />
                <StatsCard label="Open" value={q.data.openComplaints} tone="warning" />
                <StatsCard
                  label="Avg Resolution"
                  value={`${q.data.avgResolutionHours.toFixed(1)}h`}
                />
              </div>
              <div className="rounded-sm border border-border bg-card">
                <div className="border-b border-border px-4 py-3">
                  <h2 className="text-sm font-semibold uppercase tracking-wide">Volume Trend</h2>
                </div>
                <div className="p-4">
                  <ResponsiveContainer width="100%" height={320}>
                    <AreaChart data={q.data.monthlyTrends}>
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
                        fill="var(--chart-1)"
                        fillOpacity={0.2}
                        name="Created"
                      />
                      <Area
                        type="monotone"
                        dataKey="resolved"
                        stroke="var(--chart-2)"
                        fill="var(--chart-2)"
                        fillOpacity={0.2}
                        name="Resolved"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <div className="rounded-sm border border-border bg-card">
                  <div className="border-b border-border px-4 py-3">
                    <h2 className="text-sm font-semibold uppercase tracking-wide">
                      Status Distribution
                    </h2>
                  </div>
                  <div className="p-4">
                    <ResponsiveContainer width="100%" height={280}>
                      <PieChart>
                        <Pie
                          data={q.data.statusDistribution}
                          dataKey="count"
                          nameKey="status"
                          outerRadius={100}
                        >
                          {q.data.statusDistribution.map((_, i) => (
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
                <div className="rounded-sm border border-border bg-card">
                  <div className="border-b border-border px-4 py-3">
                    <h2 className="text-sm font-semibold uppercase tracking-wide">
                      Priority Distribution
                    </h2>
                  </div>
                  <div className="p-4">
                    <ResponsiveContainer width="100%" height={280}>
                      <BarChart data={q.data.priorityDistribution}>
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
              </div>
            </>
          )
        )}
      </div>
    </>
  );
}
