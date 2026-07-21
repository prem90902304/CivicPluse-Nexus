import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { FolderPlus, Loader2, Plus } from "lucide-react";
import { toast } from "sonner";
import { categoryService, departmentService } from "@/api/services";
import { ApiError } from "@/api/client";
import { PageHeader } from "@/components/app/PageHeader";
import { Loading } from "@/components/app/Loading";
import { EmptyState } from "@/components/app/EmptyState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/_authenticated/admin/categories")({
  head: () => ({ meta: [{ title: "Categories — CivicPulse Nexus" }] }),
  component: CategoriesPage,
});

function CategoriesPage() {
  const queryClient = useQueryClient();

  const [form, setForm] = useState({
    name: "",
    code: "",
    departmentId: "",
    slaHours: "48",
  });

  const categories = useQuery({
    queryKey: ["categories", "all"],
    queryFn: () => categoryService.list(),
  });

  const departments = useQuery({
    queryKey: ["departments"],
    queryFn: departmentService.list,
  });

  const createCategory = useMutation({
    mutationFn: () =>
      categoryService.create({
        name: form.name.trim(),
        code: form.code.trim().toUpperCase(),
        departmentId: Number(form.departmentId),
        slaHours: Number(form.slaHours),
      }),

    onSuccess: () => {
      toast.success("Category created successfully");

      setForm({
        name: "",
        code: "",
        departmentId: "",
        slaHours: "48",
      });

      queryClient.invalidateQueries({
        queryKey: ["categories"],
      });
    },

    onError: (error) => {
      toast.error(error instanceof ApiError ? error.message : "Unable to create category");
    },
  });

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!form.name.trim() || !form.code.trim() || !form.departmentId) {
      toast.error("Name, code, and department are required");
      return;
    }

    if (!form.slaHours || Number(form.slaHours) <= 0) {
      toast.error("SLA hours must be greater than zero");
      return;
    }

    createCategory.mutate();
  };

  return (
    <>
      <PageHeader
        title="Complaint Categories"
        description="Taxonomy used across departments."
        breadcrumbs={[{ label: "Admin" }, { label: "Categories" }]}
      />

      <div className="mx-auto max-w-[1600px] space-y-6 p-6">
        <section className="rounded-xl border border-border/80 bg-card shadow-sm">
          <div className="flex items-center gap-2 border-b border-border/80 px-5 py-4">
            <FolderPlus className="h-5 w-5 text-blue-600" />
            <div>
              <h2 className="text-sm font-semibold text-foreground">Create Category</h2>
              <p className="text-xs text-muted-foreground">
                Add a complaint category and define its resolution SLA.
              </p>
            </div>
          </div>

          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 gap-4 p-5 md:grid-cols-2 xl:grid-cols-[1fr_180px_220px_150px_auto]"
          >
            <div>
              <Label htmlFor="category-name">Category Name</Label>
              <Input
                id="category-name"
                value={form.name}
                onChange={(event) => setForm({ ...form, name: event.target.value })}
                placeholder="Example: Water Leakage"
              />
            </div>

            <div>
              <Label htmlFor="category-code">Category Code</Label>
              <Input
                id="category-code"
                value={form.code}
                onChange={(event) =>
                  setForm({
                    ...form,
                    code: event.target.value.toUpperCase(),
                  })
                }
                placeholder="Example: LEAK"
                maxLength={20}
              />
            </div>

            <div>
              <Label htmlFor="category-department">Department</Label>
              <select
                id="category-department"
                value={form.departmentId}
                onChange={(event) => setForm({ ...form, departmentId: event.target.value })}
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
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
              <Label htmlFor="category-sla">SLA Hours</Label>
              <Input
                id="category-sla"
                type="number"
                min="1"
                value={form.slaHours}
                onChange={(event) => setForm({ ...form, slaHours: event.target.value })}
              />
            </div>

            <div className="flex items-end">
              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700"
                disabled={createCategory.isPending}
              >
                {createCategory.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Plus className="mr-2 h-4 w-4" />
                )}
                Create Category
              </Button>
            </div>
          </form>
        </section>

        <section className="overflow-hidden rounded-xl border border-border/80 bg-card shadow-sm">
          {categories.isLoading ? (
            <Loading />
          ) : categories.data && categories.data.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/60 text-xs uppercase tracking-wide text-muted-foreground">
                  <tr>
                    <th className="px-5 py-3 text-left">Code</th>
                    <th className="px-5 py-3 text-left">Category</th>
                    <th className="px-5 py-3 text-left">Department</th>
                    <th className="px-5 py-3 text-right">SLA (Hours)</th>
                  </tr>
                </thead>

                <tbody>
                  {categories.data.map((category) => (
                    <tr
                      key={category.id}
                      className="border-t border-border/80 transition-colors hover:bg-muted/40"
                    >
                      <td className="px-5 py-3 font-mono text-xs text-blue-700">{category.code}</td>
                      <td className="px-5 py-3 font-medium">{category.name}</td>
                      <td className="px-5 py-3 text-muted-foreground">
                        {category.departmentName ?? "—"}
                      </td>
                      <td className="px-5 py-3 text-right tabular-nums">
                        {category.slaHours ?? "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState
              title="No categories configured"
              description="Create the first complaint category using the form above."
            />
          )}
        </section>
      </div>
    </>
  );
}
