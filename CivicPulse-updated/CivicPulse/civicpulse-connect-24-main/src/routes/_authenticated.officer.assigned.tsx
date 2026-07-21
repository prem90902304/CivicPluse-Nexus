import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Search } from "lucide-react";
import { complaintService } from "@/api/services";
import type { ComplaintStatus } from "@/api/services/types";
import { PageHeader } from "@/components/app/PageHeader";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loading } from "@/components/app/Loading";
import { EmptyState } from "@/components/app/EmptyState";
import { StatusChip, PriorityChip } from "@/components/app/StatusChip";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";

export const Route = createFileRoute("/_authenticated/officer/assigned")({
  head: () => ({ meta: [{ title: "Assigned Complaints — CivicPulse Nexus" }] }),
  component: AssignedComplaintsPage,
});

const STATUSES: (ComplaintStatus | "")[] = [
  "",
  "NEW",
  "PENDING",
  "ASSIGNED",
  "IN_PROGRESS",
  "ESCALATED",
  "RESOLVED",
  "REJECTED",
  "CLOSED",
];

function AssignedComplaintsPage() {
  const { user } = useAuth();
  const isMunicipalOfficer =
    user?.role === "OFFICER" && user.email.toLowerCase() === "officer@civicpulse.com";
  const [page, setPage] = useState(0);
  const [size] = useState(15);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<ComplaintStatus | "">("");
  const q = useQuery({
    queryKey: ["complaints", isMunicipalOfficer ? "all" : "assigned", { page, size, search, status }],
    queryFn: () => complaintService.assigned({ page, size, search, status }),
  });

  return (
    <>
      <PageHeader
        title={isMunicipalOfficer ? "All Complaints" : "Assigned Complaints"}
        description={
          isMunicipalOfficer
            ? "View, assign, update, and manage every civic complaint."
            : "All complaints assigned to you for resolution."
        }
        breadcrumbs={[{ label: "Officer" }, { label: "Assigned" }]}
      />
      <div className="mx-auto max-w-[1600px] space-y-4 p-6">
        <div className="flex flex-wrap items-center gap-2 rounded-sm border border-border bg-card p-3">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search complaints"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(0);
              }}
              className="pl-9"
            />
          </div>
          <Select
            value={status || "all"}
            onValueChange={(v) => {
              setStatus(v === "all" ? "" : (v as ComplaintStatus));
              setPage(0);
            }}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              {STATUSES.map((s) => (
                <SelectItem key={s || "all"} value={s || "all"}>
                  {s ? s.replace("_", " ") : "All statuses"}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="rounded-sm border border-border bg-card">
          {q.isLoading ? (
            <Loading />
          ) : q.data && q.data.items.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted text-xs uppercase tracking-wide text-muted-foreground">
                  <tr>
                    <th className="px-4 py-2 text-left">Reference</th>
                    <th className="px-4 py-2 text-left">Title</th>
                    <th className="px-4 py-2 text-left">Citizen</th>
                    <th className="px-4 py-2 text-left">Assigned Officer</th>
                    <th className="px-4 py-2 text-left">Priority</th>
                    <th className="px-4 py-2 text-left">Status</th>
                    <th className="px-4 py-2 text-left">Filed</th>
                    <th className="px-4 py-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {q.data.items.map((c) => (
                    <tr key={c.id} className="border-t border-border hover:bg-muted/40">
                      <td className="px-4 py-2 font-mono text-xs">{c.referenceNumber}</td>
                      <td className="px-4 py-2 max-w-xs truncate">{c.title}</td>
                      <td className="px-4 py-2 text-muted-foreground">{c.citizenName ?? "—"}</td>
                      <td className="px-4 py-2 text-muted-foreground">
                        {c.assignedOfficer ?? "Unassigned"}
                      </td>
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
                            Open
                          </Link>
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="flex items-center justify-between border-t border-border px-4 py-2 text-xs text-muted-foreground">
                <span>
                  Showing {q.data.items.length} of {q.data.total}
                </span>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page === 0}
                    onClick={() => setPage((p) => p - 1)}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={(page + 1) * size >= q.data.total}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <EmptyState
              title={isMunicipalOfficer ? "No complaints found" : "No assigned complaints"}
              description={
                isMunicipalOfficer
                  ? "There are no civic complaints to manage right now."
                  : "You have no complaints assigned in your queue."
              }
            />
          )}
        </div>
      </div>
    </>
  );
}
