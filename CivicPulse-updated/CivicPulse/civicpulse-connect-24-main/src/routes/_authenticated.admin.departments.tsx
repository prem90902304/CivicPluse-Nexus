import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Building2, Loader2, Plus } from "lucide-react";
import { toast } from "sonner";
import { departmentService } from "@/api/services";
import { ApiError } from "@/api/client";
import { PageHeader } from "@/components/app/PageHeader";
import { Loading } from "@/components/app/Loading";
import { EmptyState } from "@/components/app/EmptyState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/_authenticated/admin/departments")({
  head: () => ({ meta: [{ title: "Departments — CivicPulse Nexus" }] }),
  component: DepartmentsPage,
});

function DepartmentsPage() {
  const queryClient = useQueryClient();

  const [form, setForm] = useState({
    name: "",
    code: "",
  });

  const departments = useQuery({
    queryKey: ["departments"],
    queryFn: departmentService.list,
  });

  const createDepartment = useMutation({
    mutationFn: () =>
      departmentService.create({
        name: form.name.trim(),
        code: form.code.trim().toUpperCase(),
      }),

    onSuccess: () => {
      toast.success("Department created successfully");
      setForm({ name: "", code: "" });

      queryClient.invalidateQueries({
        queryKey: ["departments"],
      });
    },

    onError: (error) => {
      toast.error(error instanceof ApiError ? error.message : "Unable to create department");
    },
  });

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!form.name.trim() || !form.code.trim()) {
      toast.error("Department name and code are required");
      return;
    }

    createDepartment.mutate();
  };

  return (
    <>
      <PageHeader
        title="Departments"
        description="Municipal departments and their operational performance."
        breadcrumbs={[{ label: "Admin" }, { label: "Departments" }]}
      />

      <div className="mx-auto max-w-[1600px] space-y-6 p-6">
        <section className="rounded-xl border border-border/80 bg-card shadow-sm">
          <div className="flex items-center gap-2 border-b border-border/80 px-5 py-4">
            <Building2 className="h-5 w-5 text-blue-600" />
            <div>
              <h2 className="text-sm font-semibold text-foreground">Create Department</h2>
              <p className="text-xs text-muted-foreground">
                Add a municipal department to organise complaints and officers.
              </p>
            </div>
          </div>

          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 gap-4 p-5 md:grid-cols-[1fr_220px_auto]"
          >
            <div>
              <Label htmlFor="department-name">Department Name</Label>
              <Input
                id="department-name"
                value={form.name}
                onChange={(event) => setForm({ ...form, name: event.target.value })}
                placeholder="Example: Water Supply"
              />
            </div>

            <div>
              <Label htmlFor="department-code">Department Code</Label>
              <Input
                id="department-code"
                value={form.code}
                onChange={(event) =>
                  setForm({
                    ...form,
                    code: event.target.value.toUpperCase(),
                  })
                }
                placeholder="Example: WATER"
                maxLength={20}
              />
            </div>

            <div className="flex items-end">
              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700"
                disabled={createDepartment.isPending}
              >
                {createDepartment.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Plus className="mr-2 h-4 w-4" />
                )}
                Create Department
              </Button>
            </div>
          </form>
        </section>

        <section className="overflow-hidden rounded-xl border border-border/80 bg-card shadow-sm">
          {departments.isLoading ? (
            <Loading />
          ) : departments.data && departments.data.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/60 text-xs uppercase tracking-wide text-muted-foreground">
                  <tr>
                    <th className="px-5 py-3 text-left">Code</th>
                    <th className="px-5 py-3 text-left">Department</th>
                    <th className="px-5 py-3 text-left">Head Officer</th>
                    <th className="px-5 py-3 text-right">Total Complaints</th>
                    <th className="px-5 py-3 text-right">Resolved</th>
                  </tr>
                </thead>

                <tbody>
                  {departments.data.map((department) => (
                    <tr
                      key={department.id}
                      className="border-t border-border/80 transition-colors hover:bg-muted/40"
                    >
                      <td className="px-5 py-3 font-mono text-xs text-blue-700">
                        {department.code}
                      </td>
                      <td className="px-5 py-3 font-medium">{department.name}</td>
                      <td className="px-5 py-3 text-muted-foreground">
                        {department.headOfficerName ?? "—"}
                      </td>
                      <td className="px-5 py-3 text-right tabular-nums">
                        {department.totalComplaints ?? 0}
                      </td>
                      <td className="px-5 py-3 text-right tabular-nums">
                        {department.resolvedComplaints ?? 0}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState
              title="No departments configured"
              description="Create the first municipal department using the form above."
            />
          )}
        </section>
      </div>
    </>
  );
}
