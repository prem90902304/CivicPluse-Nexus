import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/app/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { serviceApplicationService } from "@/api/services";
import { ApiError } from "@/api/client";
import { useAuth } from "@/contexts/AuthContext";
import type { ServiceType } from "@/api/services/types";

const schema = z.object({
  applicantName: z.string().trim().min(3, "Enter the applicant name").max(120),
  serviceType: z.enum([
    "BIRTH_CERTIFICATE",
    "DEATH_CERTIFICATE",
    "INCOME_CERTIFICATE",
    "RESIDENCE_CERTIFICATE",
    "TRADE_LICENSE",
    "PERMIT_APPROVAL",
  ]),
  aadhaarNumber: z.string().regex(/^\d{12}$/, "Enter a valid 12-digit Aadhaar number"),
});

type FormValues = z.infer<typeof schema>;

const SERVICE_LABELS: Record<ServiceType, string> = {
  BIRTH_CERTIFICATE: "Birth Certificate",
  DEATH_CERTIFICATE: "Death Certificate",
  INCOME_CERTIFICATE: "Income Certificate",
  RESIDENCE_CERTIFICATE: "Residence Certificate",
  TRADE_LICENSE: "Trade License",
  PERMIT_APPROVAL: "Permit Approval",
};

export const Route = createFileRoute("/_authenticated/services/apply")({
  head: () => ({ meta: [{ title: "Apply for Service — CivicPulse Nexus" }] }),
  component: ApplyServicePage,
});

function ApplyServicePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const applyMutation = useMutation({
    mutationFn: serviceApplicationService.apply,
    onSuccess: (application) => {
      toast.success("Application submitted successfully");

      void navigate({
        to: "/services/application-details/$id",
        params: { id: String(application.id) },
      });
    },
    onError: (error) => {
      toast.error(error instanceof ApiError ? error.message : "Could not submit the application");
    },
  });

  const onSubmit = (values: FormValues) => {
    if (!user) return;
    applyMutation.mutate({ ...values, citizenId: user.id });
  };

  return (
    <>
      <PageHeader
        title="Apply for a Certificate or Permit"
        description="Submit your application and upload supporting documents after submission."
        breadcrumbs={[
          { label: "Home", to: "/dashboard" },
          { label: "Services", to: "/services/applications" },
          { label: "Apply" },
        ]}
      />
      <div className="mx-auto max-w-3xl p-6">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-5 rounded-sm border border-border bg-card p-6 shadow-sm"
        >
          <div>
            <Label htmlFor="applicantName">
              Applicant Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="applicantName"
              placeholder="Enter your full name"
              {...register("applicantName")}
            />
            {errors.applicantName && (
              <p className="mt-1 text-xs text-destructive">{errors.applicantName.message}</p>
            )}
          </div>
          <div>
            <Label>
              Certificate / Permit Type <span className="text-destructive">*</span>
            </Label>
            <Select onValueChange={(value) => setValue("serviceType", value as ServiceType)}>
              <SelectTrigger>
                <SelectValue placeholder="Select a service" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(SERVICE_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.serviceType && (
              <p className="mt-1 text-xs text-destructive">{errors.serviceType.message}</p>
            )}
          </div>
          <div>
            <Label htmlFor="aadhaarNumber">
              Aadhaar Number <span className="text-destructive">*</span>
            </Label>
            <Input
              id="aadhaarNumber"
              inputMode="numeric"
              maxLength={12}
              placeholder="12-digit Aadhaar number"
              {...register("aadhaarNumber")}
            />
            {errors.aadhaarNumber && (
              <p className="mt-1 text-xs text-destructive">{errors.aadhaarNumber.message}</p>
            )}
          </div>
          <div className="flex justify-end gap-3 border-t border-border pt-5">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate({ to: "/services/applications" })}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={applyMutation.isPending}>
              {applyMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Submit Application
            </Button>
          </div>
        </form>
      </div>
    </>
  );
}
