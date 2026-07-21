import { createFileRoute } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/app/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authService } from "@/api/services";
import { ApiError } from "@/api/client";

const schema = z
  .object({
    currentPassword: z.string().min(6),
    newPassword: z.string().min(8, "At least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((v) => v.newPassword === v.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });
type FormValues = z.infer<typeof schema>;

export const Route = createFileRoute("/_authenticated/settings")({
  head: () => ({ meta: [{ title: "Settings — CivicPulse Nexus" }] }),
  component: SettingsPage,
});

function SettingsPage() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (v: FormValues) => {
    try {
      await authService.changePassword({
        currentPassword: v.currentPassword,
        newPassword: v.newPassword,
      });
      toast.success("Password updated");
      reset();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to change password");
    }
  };

  return (
    <>
      <PageHeader
        title="Account Settings"
        description="Manage your account security and preferences."
        breadcrumbs={[{ label: "Account" }, { label: "Settings" }]}
      />
      <div className="mx-auto max-w-2xl space-y-4 p-6">
        <section className="rounded-sm border border-border bg-card">
          <header className="border-b border-border px-4 py-3">
            <h2 className="text-sm font-semibold uppercase tracking-wide">Change Password</h2>
          </header>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 p-4" noValidate>
            <div>
              <Label htmlFor="cp">Current password</Label>
              <Input id="cp" type="password" {...register("currentPassword")} />
              {errors.currentPassword && (
                <p className="mt-1 text-xs text-destructive">{errors.currentPassword.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="np">New password</Label>
              <Input id="np" type="password" {...register("newPassword")} />
              {errors.newPassword && (
                <p className="mt-1 text-xs text-destructive">{errors.newPassword.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="cnp">Confirm new password</Label>
              <Input id="cnp" type="password" {...register("confirmPassword")} />
              {errors.confirmPassword && (
                <p className="mt-1 text-xs text-destructive">{errors.confirmPassword.message}</p>
              )}
            </div>
            <div className="flex justify-end">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Update Password
              </Button>
            </div>
          </form>
        </section>
        <section className="rounded-sm border border-border bg-card p-4 text-sm text-muted-foreground">
          <p className="font-medium text-foreground">Language & Theme</p>
          <p className="mt-1">
            This portal is currently available in English. Additional language support (हिन्दी,
            தமிழ், తెలుగు) is being rolled out under the Digital India programme.
          </p>
        </section>
      </div>
    </>
  );
}
