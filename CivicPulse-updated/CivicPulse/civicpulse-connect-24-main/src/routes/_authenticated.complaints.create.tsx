import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { Upload, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/app/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { categoryService, complaintService, departmentService } from "@/api/services";
import type { ComplaintPriority } from "@/api/services/types";
import { ApiError, getImageUrl } from "@/api/client";

const schema = z.object({
  title: z.string().trim().min(5, "Enter a descriptive title").max(150),
  description: z.string().trim().min(20, "Provide at least 20 characters of detail").max(2000),
  location: z.string().trim().min(3, "Enter the incident location").max(200),
  departmentId: z.coerce.number().int().positive("Select a department"),
  categoryId: z.coerce.number().int().positive("Select a category"),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]),
});

type FormValues = z.infer<typeof schema>;

export const Route = createFileRoute("/_authenticated/complaints/create")({
  head: () => ({
    meta: [{ title: "Register Complaint — CivicPulse Nexus" }],
  }),
  component: CreateComplaintPage,
});

function CreateComplaintPage() {
  const navigate = useNavigate();
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);

  const departments = useQuery({
    queryKey: ["departments"],
    queryFn: departmentService.list,
  });

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { priority: "MEDIUM" },
  });

  const departmentId = watch("departmentId");

  const categories = useQuery({
    queryKey: ["categories", departmentId],
    queryFn: () => categoryService.list(Number(departmentId)),
    enabled: !!departmentId,
  });

  const createMutation = useMutation({
    mutationFn: complaintService.create,
    onSuccess: (c) => {
      toast.success(`Complaint ${c.referenceNumber} registered successfully`);
      navigate({
        to: "/complaints/$id",
        params: { id: String(c.id) },
      });
    },
    onError: (err) => {
      toast.error(err instanceof ApiError ? err.message : "Failed to register complaint");
    },
  });

  const handleFile = async (file: File) => {
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image must be under 10 MB");
      return;
    }

    setUploading(true);

    try {
      const res = await complaintService.uploadImage(file);

      setImageUrls((previous) => [...previous, res.url]);
      toast.success("Image uploaded successfully");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const onSubmit = (values: FormValues) => {
    createMutation.mutate({
      ...values,
      imageUrls,
    });
  };

  return (
    <>
      <PageHeader
        title="Register a New Complaint"
        description="Provide accurate details to help the concerned department resolve your grievance."
        breadcrumbs={[
          { label: "Home", to: "/" },
          { label: "Complaints", to: "/complaints" },
          { label: "New" },
        ]}
      />

      <div className="mx-auto max-w-4xl p-6">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="rounded-sm border border-border bg-card p-6 shadow-sm"
        >
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <Label htmlFor="title">
                Complaint Title <span className="text-destructive">*</span>
              </Label>
              <Input
                id="title"
                placeholder="Brief summary (e.g. Overflowing garbage bin at Sector 15)"
                {...register("title")}
              />
              {errors.title && (
                <p className="mt-1 text-xs text-destructive">{errors.title.message}</p>
              )}
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="description">
                Detailed Description <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="description"
                rows={5}
                placeholder="Describe the issue, since when it exists, and any impact on citizens."
                {...register("description")}
              />
              {errors.description && (
                <p className="mt-1 text-xs text-destructive">{errors.description.message}</p>
              )}
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="location">
                Location / Address <span className="text-destructive">*</span>
              </Label>
              <Input
                id="location"
                placeholder="Street, landmark, ward, city, PIN"
                {...register("location")}
              />
              {errors.location && (
                <p className="mt-1 text-xs text-destructive">{errors.location.message}</p>
              )}
            </div>

            <div>
              <Label>
                Department <span className="text-destructive">*</span>
              </Label>
              <Select
                onValueChange={(value) => {
                  setValue("departmentId", Number(value));
                  setValue("categoryId", 0);
                }}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={departments.isLoading ? "Loading…" : "Select department"}
                  />
                </SelectTrigger>
                <SelectContent>
                  {(departments.data ?? []).map((department) => (
                    <SelectItem key={department.id} value={String(department.id)}>
                      {department.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.departmentId && (
                <p className="mt-1 text-xs text-destructive">{errors.departmentId.message}</p>
              )}
            </div>

            <div>
              <Label>
                Category <span className="text-destructive">*</span>
              </Label>
              <Select
                onValueChange={(value) => setValue("categoryId", Number(value))}
                disabled={!departmentId}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={!departmentId ? "Select department first" : "Select category"}
                  />
                </SelectTrigger>
                <SelectContent>
                  {(categories.data ?? []).map((category) => (
                    <SelectItem key={category.id} value={String(category.id)}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.categoryId && (
                <p className="mt-1 text-xs text-destructive">{errors.categoryId.message}</p>
              )}
            </div>

            <div>
              <Label>
                Priority <span className="text-destructive">*</span>
              </Label>
              <Select
                defaultValue="MEDIUM"
                onValueChange={(value) => setValue("priority", value as ComplaintPriority)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="LOW">Low</SelectItem>
                  <SelectItem value="MEDIUM">Medium</SelectItem>
                  <SelectItem value="HIGH">High</SelectItem>
                  <SelectItem value="CRITICAL">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="md:col-span-2">
              <Label>Supporting Images</Label>

              <div className="mt-1 rounded-sm border border-dashed border-border bg-muted/50 p-4 text-center">
                <input
                  id="image"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(event) => {
                    const file = event.target.files?.[0];

                    if (file) {
                      handleFile(file);
                    }

                    event.target.value = "";
                  }}
                />

                <label
                  htmlFor="image"
                  className="inline-flex cursor-pointer items-center justify-center rounded-sm border border-input bg-background px-3 py-2 text-sm hover:bg-accent"
                >
                  {uploading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Upload className="mr-2 h-4 w-4" />
                  )}
                  {uploading ? "Uploading..." : "Upload image"}
                </label>

                <p className="mt-2 text-xs text-muted-foreground">PNG, JPG up to 10 MB</p>
              </div>

              {imageUrls.length > 0 && (
                <div className="mt-3 grid grid-cols-3 gap-2 md:grid-cols-4">
                  {imageUrls.map((url) => (
                    <div
                      key={url}
                      className="relative overflow-hidden rounded-sm border border-border"
                    >
                      <img
                        src={getImageUrl(url)}
                        alt="Complaint attachment"
                        className="h-24 w-full object-cover"
                      />

                      <button
                        type="button"
                        onClick={() =>
                          setImageUrls((previous) =>
                            previous.filter((imageUrl) => imageUrl !== url),
                          )
                        }
                        className="absolute right-1 top-1 rounded bg-destructive p-0.5 text-destructive-foreground"
                        aria-label="Remove image"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="mt-6 flex items-center justify-end gap-2 border-t border-border pt-4">
            <Button type="button" variant="outline" onClick={() => navigate({ to: "/complaints" })}>
              Cancel
            </Button>

            <Button type="submit" disabled={uploading || isSubmitting || createMutation.isPending}>
              {(uploading || isSubmitting || createMutation.isPending) && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Submit Complaint
            </Button>
          </div>
        </form>
      </div>
    </>
  );
}
