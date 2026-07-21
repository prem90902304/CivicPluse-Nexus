import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Search, X } from "lucide-react";
import { toast } from "sonner";

import { complaintService } from "@/api/services";
import type { ComplaintPriority, ComplaintStatus } from "@/api/services/types";
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

export const Route = createFileRoute("/_authenticated/admin/complaints")({
  head: () => ({ meta: [{ title: "All Complaints — CivicPulse Nexus" }] }),
  component: AdminComplaintsPage,
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

const PRIORITIES: (ComplaintPriority | "")[] = ["", "LOW", "MEDIUM", "HIGH", "CRITICAL"];

function AdminComplaintsPage() {
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<ComplaintStatus | "">("");
  const [priority, setPriority] = useState<ComplaintPriority | "">("");

  const queryClient = useQueryClient();
  const size = 15;

  const q = useQuery({
    queryKey: ["complaints", "admin", "all"],
    queryFn: () => complaintService.list({ page: 0, size: 500 }),
  });

  const deleteComplaint = useMutation({
    mutationFn: (id: number) => complaintService.deleteComplaint(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["complaints"] });
      toast.success("Complaint deleted successfully");
    },
    onError: () => {
      toast.error("Unable to delete complaint");
    },
  });

  const filteredComplaints = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    const complaints = q.data?.items ?? [];

    return complaints.filter((complaint) => {
      const matchesSearch =
        !keyword ||
        [
          complaint.referenceNumber,
          complaint.title,
          complaint.departmentName,
          complaint.assignedOfficer,
          complaint.priority,
          complaint.status,
        ]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(keyword));

      const matchesStatus = !status || complaint.status === status;
      const matchesPriority = !priority || complaint.priority === priority;

      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [q.data?.items, search, status, priority]);

  const total = filteredComplaints.length;
  const totalPages = Math.max(1, Math.ceil(total / size));
  const safePage = Math.min(page, totalPages - 1);

  const visibleComplaints = filteredComplaints.slice(safePage * size, safePage * size + size);

  const clearFilters = () => {
    setSearch("");
    setStatus("");
    setPriority("");
    setPage(0);
  };

  const hasFilters = Boolean(search || status || priority);

  return (
    <>
      <PageHeader
        title="All Complaints"
        description="Enterprise-wide grievance registry across departments."
        breadcrumbs={[{ label: "Admin" }, { label: "Complaints" }]}
      />

      <div className="mx-auto max-w-[1600px] space-y-4 p-6">
        <div className="flex flex-wrap items-center gap-2 rounded-sm border border-border bg-card p-3">
          <div className="relative min-w-[240px] flex-1">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

            <Input
              placeholder="Search reference, title, department, officer..."
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(0);
              }}
              className="pl-9 pr-9"
            />

            {search && (
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setPage(0);
                }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                aria-label="Clear search"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <Select
            value={status || "all"}
            onValueChange={(value) => {
              setStatus(value === "all" ? "" : (value as ComplaintStatus));
              setPage(0);
            }}
          >
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>

            <SelectContent>
              {STATUSES.map((item) => (
                <SelectItem key={item || "all"} value={item || "all"}>
                  {item ? item.replace("_", " ") : "All statuses"}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={priority || "all"}
            onValueChange={(value) => {
              setPriority(value === "all" ? "" : (value as ComplaintPriority));
              setPage(0);
            }}
          >
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>

            <SelectContent>
              {PRIORITIES.map((item) => (
                <SelectItem key={item || "all"} value={item || "all"}>
                  {item || "All priorities"}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {hasFilters && (
            <Button variant="outline" size="sm" onClick={clearFilters}>
              Clear filters
            </Button>
          )}
        </div>

        <div className="rounded-sm border border-border bg-card">
          {q.isLoading ? (
            <Loading />
          ) : visibleComplaints.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted text-xs uppercase tracking-wide text-muted-foreground">
                  <tr>
                    <th className="px-4 py-2 text-left">Reference</th>
                    <th className="px-4 py-2 text-left">Title</th>
                    <th className="px-4 py-2 text-left">Department</th>
                    <th className="px-4 py-2 text-left">Officer</th>
                    <th className="px-4 py-2 text-left">Priority</th>
                    <th className="px-4 py-2 text-left">Status</th>
                    <th className="px-4 py-2 text-right">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {visibleComplaints.map((complaint) => (
                    <tr key={complaint.id} className="border-t border-border hover:bg-muted/40">
                      <td className="px-4 py-2 font-mono text-xs">{complaint.referenceNumber}</td>

                      <td className="max-w-xs truncate px-4 py-2">{complaint.title}</td>

                      <td className="px-4 py-2 text-muted-foreground">
                        {complaint.departmentName ?? "—"}
                      </td>

                      <td className="px-4 py-2 text-muted-foreground">
                        {complaint.assignedOfficer ?? "Unassigned"}
                      </td>

                      <td className="px-4 py-2">
                        <PriorityChip priority={complaint.priority} />
                      </td>

                      <td className="px-4 py-2">
                        <StatusChip status={complaint.status} />
                      </td>

                      <td className="px-4 py-2 text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="sm" asChild>
                            <Link to="/complaints/$id" params={{ id: String(complaint.id) }}>
                              View
                            </Link>
                          </Button>

                          <Button
                            variant="destructive"
                            size="sm"
                            disabled={deleteComplaint.isPending}
                            onClick={() => {
                              const confirmed = window.confirm(
                                `Delete complaint ${complaint.referenceNumber}? This cannot be undone.`,
                              );

                              if (confirmed) {
                                deleteComplaint.mutate(complaint.id);
                              }
                            }}
                          >
                            Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="flex items-center justify-between border-t border-border px-4 py-2 text-xs text-muted-foreground">
                <span>
                  Showing {safePage * size + 1}–{Math.min((safePage + 1) * size, total)} of {total}{" "}
                  complaints
                </span>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={safePage === 0}
                    onClick={() => setPage((current) => Math.max(0, current - 1))}
                  >
                    Previous
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    disabled={safePage >= totalPages - 1}
                    onClick={() => setPage((current) => Math.min(totalPages - 1, current + 1))}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <EmptyState
              title="No complaints match the filters"
              description="Try changing or clearing your search and filters."
              action={
                hasFilters ? <Button onClick={clearFilters}>Clear filters</Button> : undefined
              }
            />
          )}
        </div>
      </div>
    </>
  );
}
