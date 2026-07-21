import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Loader2, Pencil, Power, Trash2, UserPlus, X } from "lucide-react";
import { toast } from "sonner";
import { departmentService, officerService } from "@/api/services";
import { ApiError } from "@/api/client";
import { PageHeader } from "@/components/app/PageHeader";
import { Loading } from "@/components/app/Loading";
import { EmptyState } from "@/components/app/EmptyState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/_authenticated/admin/officers")({
  head: () => ({ meta: [{ title: "Officers — CivicPulse Nexus" }] }),
  component: OfficersPage,
});

const initialForm = {
  fullName: "",
  email: "",
  phone: "",
  departmentId: "",
  password: "",
};

function OfficersPage() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState(initialForm);
  const [editingOfficerId, setEditingOfficerId] = useState<number | null>(null);

  const officers = useQuery({
    queryKey: ["officers"],
    queryFn: () => officerService.list(),
  });

  const departments = useQuery({
    queryKey: ["departments"],
    queryFn: departmentService.list,
  });

  const resetForm = () => {
    setForm(initialForm);
    setEditingOfficerId(null);
  };

  const createOfficer = useMutation({
    mutationFn: () =>
      officerService.create({
        fullName: form.fullName,
        email: form.email,
        phone: form.phone,
        departmentId: Number(form.departmentId),
        password: form.password,
      }),
    onSuccess: () => {
      toast.success("Officer created successfully");
      resetForm();
      queryClient.invalidateQueries({ queryKey: ["officers"] });
    },
    onError: (error) => {
      toast.error(error instanceof ApiError ? error.message : "Unable to create officer");
    },
  });

  const updateOfficer = useMutation({
    mutationFn: () =>
      officerService.update(editingOfficerId!, {
        fullName: form.fullName,
        phone: form.phone,
        departmentId: Number(form.departmentId),
      }),
    onSuccess: () => {
      toast.success("Officer details updated successfully");
      resetForm();
      queryClient.invalidateQueries({ queryKey: ["officers"] });
    },
    onError: (error) => {
      toast.error(error instanceof ApiError ? error.message : "Unable to update officer");
    },
  });

  const deleteOfficer = useMutation({
    mutationFn: (id: number) => officerService.remove(id),
    onSuccess: () => {
      toast.success("Officer account deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["officers"] });
    },
    onError: (error) => {
      toast.error(error instanceof ApiError ? error.message : "Unable to delete officer");
    },
  });

  const changeOfficerPassword = useMutation({
    mutationFn: () =>
      officerService.changePassword(editingOfficerId!, {
        newPassword: form.password,
      }),
    onSuccess: () => {
      toast.success("Officer password changed successfully");
      setForm({ ...form, password: "" });
    },
    onError: (error) => {
      toast.error(error instanceof ApiError ? error.message : "Unable to change officer password");
    },
  });

  const setOfficerEnabled = useMutation({
    mutationFn: ({ id, enabled }: { id: number; enabled: boolean }) =>
      officerService.setEnabled(id, enabled),
    onSuccess: (_, variables) => {
      toast.success(
        variables.enabled ? "Officer activated successfully" : "Officer deactivated successfully",
      );
      queryClient.invalidateQueries({ queryKey: ["officers"] });
    },
    onError: (error) => {
      toast.error(error instanceof ApiError ? error.message : "Unable to update officer access");
    },
  });

  const submitForm = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!form.departmentId) {
      toast.error("Please select a department");
      return;
    }

    if (editingOfficerId) {
      updateOfficer.mutate();
    } else {
      createOfficer.mutate();
    }
  };

  const startEditing = (officer: {
    id: number;
    fullName: string;
    email: string;
    phone?: string | null;
    departmentName?: string | null;
  }) => {
    const department = departments.data?.find((item) => item.name === officer.departmentName);

    setEditingOfficerId(officer.id);
    setForm({
      fullName: officer.fullName,
      email: officer.email,
      phone: officer.phone ?? "",
      departmentId: department ? String(department.id) : "",
      password: "",
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const confirmDelete = (officer: { id: number; fullName: string }) => {
    const confirmed = window.confirm(
      `Delete ${officer.fullName}'s officer account?\n\nThis action cannot be undone.`,
    );

    if (confirmed) {
      deleteOfficer.mutate(officer.id);
    }
  };

  const isSubmitting = createOfficer.isPending || updateOfficer.isPending;

  return (
    <>
      <PageHeader
        title="Field Officers"
        description="Create and manage officers across municipal departments."
        breadcrumbs={[{ label: "Admin" }, { label: "Officers" }]}
      />

      <div className="mx-auto max-w-[1600px] space-y-6 p-6">
        <section className="rounded-sm border border-border bg-card">
          <div className="flex items-center justify-between gap-2 border-b border-border px-4 py-3">
            <div className="flex items-center gap-2">
              {editingOfficerId ? (
                <Pencil className="h-4 w-4 text-primary" />
              ) : (
                <UserPlus className="h-4 w-4 text-primary" />
              )}
              <h2 className="text-sm font-semibold uppercase tracking-wide">
                {editingOfficerId ? "Edit Field Officer" : "Create Field Officer"}
              </h2>
            </div>

            {editingOfficerId && (
              <Button type="button" variant="ghost" size="sm" onClick={resetForm}>
                <X className="mr-1 h-4 w-4" />
                Cancel edit
              </Button>
            )}
          </div>

          <form
            onSubmit={submitForm}
            className="grid grid-cols-1 gap-4 p-4 md:grid-cols-2 lg:grid-cols-5"
          >
            <div>
              <Label htmlFor="officer-name">Full name</Label>
              <Input
                id="officer-name"
                required
                value={form.fullName}
                onChange={(event) => setForm({ ...form, fullName: event.target.value })}
                placeholder="Officer name"
              />
            </div>

            <div>
              <Label htmlFor="officer-email">Email address</Label>
              <Input
                id="officer-email"
                type="email"
                required
                value={form.email}
                onChange={(event) => setForm({ ...form, email: event.target.value })}
                placeholder="officer@civicpulse.com"
              />
            </div>

            <div>
              <Label htmlFor="officer-phone">Phone</Label>
              <Input
                id="officer-phone"
                value={form.phone}
                onChange={(event) => setForm({ ...form, phone: event.target.value })}
                placeholder="9876543210"
              />
            </div>

            <div>
              <Label htmlFor="officer-department">Department</Label>
              <select
                id="officer-department"
                required
                value={form.departmentId}
                onChange={(event) => setForm({ ...form, departmentId: event.target.value })}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
              >
                <option value="">Select department</option>
                {departments.data?.map((department) => (
                  <option key={department.id} value={department.id}>
                    {department.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label htmlFor="officer-password">
                {editingOfficerId ? "New password" : "Temporary password"}
              </Label>

              <Input
                id="officer-password"
                type="password"
                minLength={8}
                required={!editingOfficerId}
                value={form.password}
                onChange={(event) => setForm({ ...form, password: event.target.value })}
                placeholder={editingOfficerId ? "Enter a new password" : "Minimum 8 characters"}
              />
            </div>

            <div className="flex items-end gap-2 md:col-span-2 lg:col-span-5">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {editingOfficerId ? "Save Changes" : "Create Officer"}
              </Button>

              {editingOfficerId && (
                <Button
                  type="button"
                  variant="outline"
                  disabled={
                    !form.password || form.password.length < 8 || changeOfficerPassword.isPending
                  }
                  onClick={() => changeOfficerPassword.mutate()}
                >
                  {changeOfficerPassword.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Change Password
                </Button>
              )}
            </div>
          </form>
        </section>

        <section className="rounded-sm border border-border bg-card">
          {officers.isLoading ? (
            <Loading />
          ) : officers.data && officers.data.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted text-xs uppercase tracking-wide text-muted-foreground">
                  <tr>
                    <th className="px-4 py-2 text-left">Officer</th>
                    <th className="px-4 py-2 text-left">Department</th>
                    <th className="px-4 py-2 text-left">Contact</th>
                    <th className="px-4 py-2 text-left">Access</th>
                    <th className="px-4 py-2 text-right">Active Cases</th>
                    <th className="px-4 py-2 text-right">Resolved</th>
                    <th className="px-4 py-2 text-right">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {officers.data.map((officer) => (
                    <tr key={officer.id} className="border-t border-border hover:bg-muted/40">
                      <td className="px-4 py-2 font-medium">{officer.fullName}</td>

                      <td className="px-4 py-2 text-muted-foreground">
                        {officer.departmentName ?? "—"}
                      </td>

                      <td className="px-4 py-2 text-xs">
                        <div>{officer.email}</div>
                        <div className="text-muted-foreground">{officer.phone ?? "—"}</div>
                      </td>

                      <td className="px-4 py-2">
                        <span
                          className={
                            officer.enabled
                              ? "text-xs font-medium text-emerald-700"
                              : "text-xs font-medium text-muted-foreground"
                          }
                        >
                          {officer.enabled ? "Active" : "Deactivated"}
                        </span>
                      </td>

                      <td className="px-4 py-2 text-right tabular-nums">{officer.activeCases}</td>

                      <td className="px-4 py-2 text-right tabular-nums">{officer.resolvedCases}</td>

                      <td className="px-4 py-2">
                        <div className="flex justify-end gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            disabled={setOfficerEnabled.isPending}
                            onClick={() =>
                              setOfficerEnabled.mutate({
                                id: officer.id,
                                enabled: !officer.enabled,
                              })
                            }
                          >
                            <Power className="mr-1 h-3.5 w-3.5" />
                            {officer.enabled ? "Deactivate" : "Activate"}
                          </Button>

                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => startEditing(officer)}
                          >
                            <Pencil className="mr-1 h-3.5 w-3.5" />
                            Edit
                          </Button>

                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            disabled={deleteOfficer.isPending}
                            onClick={() => confirmDelete(officer)}
                          >
                            <Trash2 className="mr-1 h-3.5 w-3.5" />
                            Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState
              title="No officers found"
              description="Create the first field officer using the form above."
            />
          )}
        </section>
      </div>
    </>
  );
}
