import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Loader2, MessageSquare, MapPin, Building2, User, Calendar, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { complaintService, officerService } from "@/api/services";
import type { ComplaintStatus, UserRole } from "@/api/services/types";
import { PageHeader } from "@/components/app/PageHeader";
import { StatusChip, PriorityChip } from "@/components/app/StatusChip";
import { Loading } from "@/components/app/Loading";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { ApiError, getImageUrl } from "@/api/client";

export const Route = createFileRoute("/_authenticated/complaints/$id")({
  head: () => ({ meta: [{ title: "Complaint Details — CivicPulse Nexus" }] }),
  component: ComplaintDetailsPage,
});

const ROLE_COLORS: Record<UserRole, string> = {
  CITIZEN: "bg-info/10 text-info",
  OFFICER: "bg-warning/15 text-[oklch(0.45_0.15_75)]",
  ADMIN: "bg-primary/10 text-primary",
};

function ComplaintDetailsPage() {
  const { id } = Route.useParams();
  const complaintId = Number(id);
  const { role, user } = useAuth();
  const qc = useQueryClient();
  const [note, setNote] = useState("");
  const [newStatus, setNewStatus] = useState<ComplaintStatus | "">("");
  const [comment, setComment] = useState("");
  const [assignedOfficerId, setAssignedOfficerId] = useState("");

  const complaint = useQuery({
    queryKey: ["complaint", complaintId],
    queryFn: () => complaintService.get(complaintId),
  });

  const timeline = useQuery({
    queryKey: ["complaint", complaintId, "timeline"],
    queryFn: () => complaintService.timeline(complaintId),
  });

  const comments = useQuery({
    queryKey: ["complaint", complaintId, "comments"],
    queryFn: () => complaintService.comments(complaintId),
  });

  const officers = useQuery({
    queryKey: ["officers"],
    queryFn: () => officerService.list(),
    enabled:
      role === "ADMIN" ||
      (user?.role === "OFFICER" && user.email.toLowerCase() === "officer@civicpulse.com"),
  });

  const statusMutation = useMutation({
    mutationFn: () =>
      complaintService.updateStatus(complaintId, {
        status: newStatus,
        note: note || undefined,
      }),
    onSuccess: () => {
      toast.success("Status updated");
      setNote("");
      setNewStatus("");
      qc.invalidateQueries({ queryKey: ["complaint", complaintId] });
      qc.invalidateQueries({
        queryKey: ["complaint", complaintId, "timeline"],
      });
    },
    onError: (err) =>
      toast.error(err instanceof ApiError ? err.message : "Failed to update status"),
  });

  const assignOfficerMutation = useMutation({
    mutationFn: () => complaintService.assign(complaintId, Number(assignedOfficerId)),
    onSuccess: () => {
      toast.success("Officer assigned successfully");
      setAssignedOfficerId("");
      qc.invalidateQueries({ queryKey: ["complaint", complaintId] });
      qc.invalidateQueries({
        queryKey: ["complaint", complaintId, "timeline"],
      });
      qc.invalidateQueries({ queryKey: ["complaints"] });
    },
    onError: (error: unknown) => {
      toast.error(error instanceof Error ? error.message : "Failed to assign officer");
    },
  });

  const commentMutation = useMutation({
    mutationFn: () => complaintService.addComment(complaintId, comment),
    onSuccess: () => {
      toast.success("Comment posted");
      setComment("");
      qc.invalidateQueries({
        queryKey: ["complaint", complaintId, "comments"],
      });
    },
    onError: (err) => toast.error(err instanceof ApiError ? err.message : "Failed to post comment"),
  });

  const deleteComplaintMutation = useMutation({
    mutationFn: () => complaintService.deleteComplaint(complaintId),
    onSuccess: () => {
      toast.success("Complaint deleted successfully");
      qc.invalidateQueries({ queryKey: ["complaints"] });
      window.history.back();
    },
    onError: (err) =>
      toast.error(err instanceof ApiError ? err.message : "Failed to delete complaint"),
  });

  const canUpdateStatus = role === "OFFICER" || role === "ADMIN";
  const isMunicipalOfficer =
    user?.role === "OFFICER" && user.email.toLowerCase() === "officer@civicpulse.com";
  const canManageComplaint = role === "ADMIN" || isMunicipalOfficer;

  if (complaint.isLoading) return <Loading />;

  if (!complaint.data) {
    return (
      <>
        <PageHeader title="Complaint not found" />
        <div className="p-6 text-sm text-muted-foreground">
          The requested complaint could not be located. It may have been removed.
        </div>
      </>
    );
  }

  const c = complaint.data;

  return (
    <>
      <PageHeader
        title={c.title}
        description={`Reference: ${c.referenceNumber}`}
        breadcrumbs={[
          { label: "Home", to: "/" },
          { label: "Complaints", to: "/complaints" },
          { label: c.referenceNumber },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <StatusChip status={c.status} />
            <PriorityChip priority={c.priority} />
          </div>
        }
      />

      <div className="mx-auto grid max-w-[1600px] grid-cols-1 gap-6 p-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <section className="rounded-sm border border-border bg-card">
            <header className="border-b border-border px-4 py-3">
              <h2 className="text-sm font-semibold uppercase tracking-wide">Complaint Details</h2>
            </header>

            <div className="p-4">
              <p className="whitespace-pre-line text-sm text-foreground">{c.description}</p>

              {c.imageUrls && c.imageUrls.length > 0 && (
                <div className="mt-4 grid grid-cols-2 gap-2 md:grid-cols-3">
                  {c.imageUrls.map((url: string) => {
                    const imageUrl = getImageUrl(url);

                    return (
                      <a key={url} href={imageUrl} target="_blank" rel="noreferrer">
                        <img
                          src={imageUrl}
                          alt="Complaint attachment"
                          className="h-32 w-full rounded-sm border border-border object-cover"
                        />
                      </a>
                    );
                  })}
                </div>
              )}
            </div>
          </section>

          <section className="rounded-sm border border-border bg-card">
            <header className="border-b border-border px-4 py-3">
              <h2 className="text-sm font-semibold uppercase tracking-wide">Timeline</h2>
            </header>

            <div className="p-4">
              {timeline.isLoading ? (
                <Loading />
              ) : timeline.data && timeline.data.length > 0 ? (
                <ol className="relative space-y-4 border-l border-border pl-4">
                  {timeline.data.map((t) => (
                    <li key={t.id} className="relative">
                      <span className="absolute -left-[21px] top-1 h-3 w-3 rounded-full border-2 border-primary bg-card" />
                      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                        <StatusChip status={t.status} />
                        <span>·</span>
                        <span className="font-medium text-foreground">{t.actorName}</span>
                        <span
                          className={`rounded-sm px-1.5 py-0.5 text-[10px] font-medium ${ROLE_COLORS[t.actorRole]}`}
                        >
                          {t.actorRole}
                        </span>
                        <span>·</span>
                        <span>{new Date(t.createdAt).toLocaleString()}</span>
                      </div>
                      {t.note && <p className="mt-1 text-sm text-foreground">{t.note}</p>}
                    </li>
                  ))}
                </ol>
              ) : (
                <p className="text-sm text-muted-foreground">No timeline events yet.</p>
              )}
            </div>
          </section>

          <section className="rounded-sm border border-border bg-card">
            <header className="flex items-center gap-2 border-b border-border px-4 py-3">
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
              <h2 className="text-sm font-semibold uppercase tracking-wide">Comments</h2>
            </header>

            <div className="space-y-3 p-4">
              {comments.isLoading ? (
                <Loading />
              ) : comments.data && comments.data.length > 0 ? (
                comments.data.map((cm) => (
                  <div key={cm.id} className="rounded-sm border border-border bg-muted/40 p-3">
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <span className="font-medium text-foreground">{cm.authorName}</span>
                      <span
                        className={`rounded-sm px-1.5 py-0.5 text-[10px] font-medium ${ROLE_COLORS[cm.authorRole]}`}
                      >
                        {cm.authorRole}
                      </span>
                      <span className="text-muted-foreground">
                        · {new Date(cm.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-foreground">{cm.message}</p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No comments yet.</p>
              )}

              <Separator />

              <div>
                <Textarea
                  rows={3}
                  placeholder="Add a comment…"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                />
                <div className="mt-2 flex justify-end">
                  <Button
                    size="sm"
                    disabled={!comment.trim() || commentMutation.isPending}
                    onClick={() => commentMutation.mutate()}
                  >
                    {commentMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Post comment
                  </Button>
                </div>
              </div>
            </div>
          </section>
        </div>

        <aside className="space-y-4">
          <section className="rounded-sm border border-border bg-card">
            <header className="border-b border-border px-4 py-3">
              <h2 className="text-sm font-semibold uppercase tracking-wide">Information</h2>
            </header>

            <dl className="divide-y divide-border text-sm">
              <InfoRow
                icon={<Building2 className="h-4 w-4" />}
                label="Department"
                value={c.departmentName ?? "—"}
              />
              <InfoRow
                icon={<Building2 className="h-4 w-4" />}
                label="Category"
                value={c.categoryName ?? "—"}
              />
              <InfoRow icon={<MapPin className="h-4 w-4" />} label="Location" value={c.location} />
              <InfoRow
                icon={<User className="h-4 w-4" />}
                label="Filed by"
                value={c.citizenName ?? "—"}
              />
              <InfoRow
                icon={<User className="h-4 w-4" />}
                label="Assigned officer"
                value={c.assignedOfficer ?? "Unassigned"}
              />
              <InfoRow
                icon={<Calendar className="h-4 w-4" />}
                label="Filed on"
                value={new Date(c.createdAt).toLocaleString()}
              />
              <InfoRow
                icon={<Calendar className="h-4 w-4" />}
                label="Last update"
                value={new Date(c.updatedAt).toLocaleString()}
              />
            </dl>
          </section>

          {canManageComplaint && (
            <section className="rounded-sm border border-border bg-card">
              <header className="border-b border-border px-4 py-3">
                <h2 className="text-sm font-semibold uppercase tracking-wide">Assign Officer</h2>
              </header>

              <div className="space-y-3 p-4">
                <Select value={assignedOfficerId || undefined} onValueChange={setAssignedOfficerId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select field officer" />
                  </SelectTrigger>

                  <SelectContent>
                    {officers.data?.map((officer) => (
                      <SelectItem key={officer.id} value={String(officer.id)}>
                        {officer.fullName}
                        {officer.departmentName ? ` — ${officer.departmentName}` : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Button
                  className="w-full"
                  disabled={!assignedOfficerId || assignOfficerMutation.isPending}
                  onClick={() => assignOfficerMutation.mutate()}
                >
                  {assignOfficerMutation.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Assign Officer
                </Button>
              </div>
            </section>
          )}

          {canUpdateStatus && (
            <section className="rounded-sm border border-border bg-card">
              <header className="border-b border-border px-4 py-3">
                <h2 className="text-sm font-semibold uppercase tracking-wide">Update Status</h2>
              </header>

              <div className="space-y-3 p-4">
                <Select
                  value={newStatus || undefined}
                  onValueChange={(v) => setNewStatus(v as ComplaintStatus)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select new status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NEW">Open</SelectItem>
                    <SelectItem value="IN_PROGRESS">In progress</SelectItem>
                    <SelectItem value="PENDING">Pending</SelectItem>
                    <SelectItem value="RESOLVED">Resolved</SelectItem>
                    <SelectItem value="REJECTED">Rejected</SelectItem>
                    <SelectItem value="CLOSED">Closed</SelectItem>
                  </SelectContent>
                </Select>

                <Textarea
                  rows={3}
                  placeholder="Officer note (optional)"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />

                <Button
                  className="w-full"
                  disabled={!newStatus || statusMutation.isPending}
                  onClick={() => statusMutation.mutate()}
                >
                  {statusMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save Update
                </Button>
              </div>
            </section>
          )}

          {canManageComplaint && (
            <section className="rounded-sm border border-destructive/40 bg-destructive/5 p-4">
              <h2 className="text-sm font-semibold text-destructive">Delete Complaint</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                This removes the complaint, its timeline, comments, and escalation history permanently.
              </p>
              <Button
                variant="destructive"
                className="mt-3 w-full"
                disabled={deleteComplaintMutation.isPending}
                onClick={() => {
                  if (window.confirm(`Delete complaint ${c.referenceNumber}? This cannot be undone.`)) {
                    deleteComplaintMutation.mutate();
                  }
                }}
              >
                {deleteComplaintMutation.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="mr-2 h-4 w-4" />
                )}
                Delete Complaint
              </Button>
            </section>
          )}

          <Button variant="outline" className="w-full" asChild>
            <Link to="/complaints">← Back to complaints</Link>
          </Button>
        </aside>
      </div>
    </>
  );
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3 px-4 py-3">
      <span className="mt-0.5 text-muted-foreground">{icon}</span>
      <div className="min-w-0 flex-1">
        <dt className="text-xs uppercase tracking-wide text-muted-foreground">{label}</dt>
        <dd className="mt-0.5 break-words text-sm text-foreground">{value}</dd>
      </div>
    </div>
  );
}
