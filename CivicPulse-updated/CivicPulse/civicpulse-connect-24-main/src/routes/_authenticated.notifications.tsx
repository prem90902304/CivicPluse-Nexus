import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Bell, CheckCheck } from "lucide-react";
import { toast } from "sonner";
import { notificationService } from "@/api/services";
import { PageHeader } from "@/components/app/PageHeader";
import { Loading } from "@/components/app/Loading";
import { EmptyState } from "@/components/app/EmptyState";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/notifications")({
  head: () => ({ meta: [{ title: "Notifications — CivicPulse Nexus" }] }),
  component: NotificationsPage,
});

function NotificationsPage() {
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ["notifications"], queryFn: notificationService.mine });
  const markRead = useMutation({
    mutationFn: (id: number) => notificationService.markAsRead(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
  });
  const markAll = useMutation({
    mutationFn: notificationService.markAllAsRead,
    onSuccess: () => {
      toast.success("All notifications marked as read");
      qc.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  return (
    <>
      <PageHeader
        title="Notifications"
        description="Real-time alerts about your complaints and departmental updates."
        breadcrumbs={[{ label: "Account" }, { label: "Notifications" }]}
        actions={
          <Button variant="outline" onClick={() => markAll.mutate()}>
            <CheckCheck className="mr-2 h-4 w-4" />
            Mark all read
          </Button>
        }
      />
      <div className="mx-auto max-w-4xl p-6">
        <div className="rounded-sm border border-border bg-card">
          {q.isLoading ? (
            <Loading />
          ) : q.data && q.data.length > 0 ? (
            <ul className="divide-y divide-border">
              {q.data.map((n) => (
                <li
                  key={n.id}
                  className={cn("flex items-start gap-3 px-4 py-3", !n.read && "bg-primary/5")}
                >
                  <Bell
                    className={cn(
                      "mt-1 h-4 w-4",
                      n.read ? "text-muted-foreground" : "text-primary",
                    )}
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">{n.title}</p>
                    <p className="text-sm text-muted-foreground">{n.message}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {new Date(n.createdAt).toLocaleString()}
                    </p>
                  </div>
                  {!n.read && (
                    <Button size="sm" variant="ghost" onClick={() => markRead.mutate(n.id)}>
                      Mark read
                    </Button>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState
              title="You're all caught up"
              description="No notifications to display."
              icon={<Bell className="h-10 w-10" />}
            />
          )}
        </div>
      </div>
    </>
  );
}
