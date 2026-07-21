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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { authService } from "@/api/services";
import { ApiError } from "@/api/client";

const schema = z.object({
  fullName: z.string().trim().min(2).max(100),
  phone: z
    .string()
    .trim()
    .regex(/^[0-9]{10}$/, "Enter a valid 10-digit number"),
});
type FormValues = z.infer<typeof schema>;

export const Route = createFileRoute("/_authenticated/profile")({
  head: () => ({ meta: [{ title: "Profile — CivicPulse Nexus" }] }),
  component: ProfilePage,
});

function initials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function ProfilePage() {
  const { user, setUser } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { fullName: user?.fullName ?? "", phone: user?.phone ?? "" },
  });

  const onSubmit = async (v: FormValues) => {
    try {
      const updated = await authService.updateProfile(v);
      setUser(updated);
      toast.success("Profile updated");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to update profile");
    }
  };

  return (
    <>
      <PageHeader
        title="Profile"
        description="Your personal information on the CivicPulse Nexus platform."
        breadcrumbs={[{ label: "Account" }, { label: "Profile" }]}
      />
      <div className="mx-auto max-w-3xl space-y-4 p-6">
        <section className="flex items-center gap-4 rounded-sm border border-border bg-card p-4">
          <Avatar className="h-14 w-14">
            <AvatarFallback className="bg-secondary text-secondary-foreground text-lg">
              {user ? initials(user.fullName) : "?"}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-base font-semibold text-foreground">{user?.fullName}</p>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
            <p className="mt-1 text-xs uppercase tracking-wider text-muted-foreground">
              {user?.role}
            </p>
          </div>
        </section>

        <section className="rounded-sm border border-border bg-card">
          <header className="border-b border-border px-4 py-3">
            <h2 className="text-sm font-semibold uppercase tracking-wide">Personal Details</h2>
          </header>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="grid grid-cols-1 gap-4 p-4 md:grid-cols-2"
            noValidate
          >
            <div className="md:col-span-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input id="fullName" {...register("fullName")} />
              {errors.fullName && (
                <p className="mt-1 text-xs text-destructive">{errors.fullName.message}</p>
              )}
            </div>
            <div>
              <Label>Email</Label>
              <Input value={user?.email ?? ""} disabled />
            </div>
            <div>
              <Label htmlFor="phone">Mobile</Label>
              <Input id="phone" inputMode="numeric" maxLength={10} {...register("phone")} />
              {errors.phone && (
                <p className="mt-1 text-xs text-destructive">{errors.phone.message}</p>
              )}
            </div>
            <div className="md:col-span-2 flex justify-end">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Save Changes
              </Button>
            </div>
          </form>
        </section>
      </div>
    </>
  );
}
