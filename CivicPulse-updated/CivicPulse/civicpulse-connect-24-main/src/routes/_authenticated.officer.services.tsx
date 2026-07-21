import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Eye, FileCheck2, Search } from "lucide-react";
import { PageHeader } from "@/components/app/PageHeader";
import { Button } from "@/components/ui/button";
import { Loading } from "@/components/app/Loading";
import { EmptyState } from "@/components/app/EmptyState";
import { Input } from "@/components/ui/input";
import { serviceApplicationService } from "@/api/services";
import { getImageUrl } from "@/api/client";
import { useAuth } from "@/contexts/AuthContext";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ApplicationStatus, ServiceType } from "@/api/services/types";

const serviceLabels: Record<ServiceType, string> = {
  BIRTH_CERTIFICATE: "Birth Certificate",
  DEATH_CERTIFICATE: "Death Certificate",
  INCOME_CERTIFICATE: "Income Certificate",
  RESIDENCE_CERTIFICATE: "Residence Certificate",
  TRADE_LICENSE: "Trade License",
  PERMIT_APPROVAL: "Permit Approval",
};

const statusOptions: ApplicationStatus[] = [
  "SUBMITTED",
  "DOCUMENTS_REQUIRED",
  "UNDER_VERIFICATION",
  "VERIFIED",
  "APPROVED",
  "REJECTED",
  "CERTIFICATE_GENERATED",
  "DOWNLOADED",
];

const statusStyles: Record<ApplicationStatus, string> = {
  SUBMITTED: "bg-red-100 text-red-800",
  DOCUMENTS_REQUIRED: "bg-yellow-100 text-yellow-800",
  UNDER_VERIFICATION: "bg-yellow-100 text-yellow-800",
  VERIFIED: "bg-green-100 text-green-800",
  APPROVED: "bg-green-100 text-green-800",
  REJECTED: "bg-red-100 text-red-800",
  CERTIFICATE_GENERATED: "bg-green-100 text-green-800",
  DOWNLOADED: "bg-green-100 text-green-800",
};

export const Route = createFileRoute("/_authenticated/officer/services")({
  head: () => ({ meta: [{ title: "Service Applications — CivicPulse Nexus" }] }),
  component: OfficerServicesPage,
});

function OfficerServicesPage() {
  const { user } = useAuth();
  const isMunicipalOfficer =
    user?.role === "OFFICER" && user.email.toLowerCase() === "officer@civicpulse.com";
  const [statusFilter, setStatusFilter] = useState<ApplicationStatus | "ALL">("ALL");
  const [search, setSearch] = useState("");
  const applications = useQuery({
    queryKey: ["service-applications", "officer"],
    enabled: isMunicipalOfficer,
    queryFn: async () => {
      const results = await Promise.all(statusOptions.map(serviceApplicationService.byStatus));
      return results.flat();
    },
  });

  const visibleApplications = (applications.data ?? []).filter((application) => {
    const matchesStatus = statusFilter === "ALL" || application.status === statusFilter;
    const query = search.trim().toLowerCase();
    const matchesSearch =
      !query ||
      application.applicationNumber.toLowerCase().includes(query) ||
      application.applicantName.toLowerCase().includes(query) ||
      serviceLabels[application.serviceType].toLowerCase().includes(query);

    return matchesStatus && matchesSearch;
  });

  return (
    <>
      <PageHeader
        title="Service Applications"
        description="Verify documents and process certificate or permit applications."
        breadcrumbs={[
          { label: "Home", to: "/officer/dashboard" },
          { label: "Service Applications" },
        ]}
      />
      <div className="mx-auto max-w-[1600px] p-6">
        {!isMunicipalOfficer ? (
          <EmptyState
            icon={<FileCheck2 className="h-6 w-6" />}
            title="Municipal Officer access required"
            description="Certificates and permits are processed only by the Municipal Officer."
          />
        ) : applications.isLoading ? (
          <Loading />
        ) : applications.data?.length ? (
          <div className="space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="relative w-full sm:max-w-lg">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search by application, applicant, or service"
                  className="pl-9"
                />
              </div>
              <Select
                value={statusFilter}
                onValueChange={(value) => setStatusFilter(value as ApplicationStatus | "ALL")}
              >
                <SelectTrigger className="w-full sm:w-60">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All applications</SelectItem>
                  {statusOptions.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status.replaceAll("_", " ")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="overflow-hidden rounded-sm border border-border bg-card">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b border-border bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
                    <tr>
                      <th className="px-4 py-3">Application</th>
                      <th className="px-4 py-3">Applicant</th>
                      <th className="px-4 py-3">Service</th>
                      <th className="px-4 py-3">Documents</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visibleApplications.map((application) => (
                      <tr key={application.id} className="border-b border-border last:border-0">
                        <td className="px-4 py-3 font-medium">{application.applicationNumber}</td>
                        <td className="px-4 py-3">{application.applicantName}</td>
                        <td className="px-4 py-3">{serviceLabels[application.serviceType]}</td>
                        <td className="px-4 py-3">
                          {application.documentUrls.length ? (
                            <div className="space-y-1">
                              {application.documentUrls.map((url, index) => (
                                <a
                                  key={url}
                                  href={getImageUrl(url)}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="block text-xs text-primary underline"
                                >
                                  View document {index + 1}
                                </a>
                              ))}
                            </div>
                          ) : (
                            <span className="text-muted-foreground">No documents</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusStyles[application.status]}`}
                          >
                            {application.status.replaceAll("_", " ")}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex justify-end gap-2">
                            <Button size="sm" variant="outline" asChild>
                              <Link
                                to="/services/application-details/$id"
                                params={{ id: String(application.id) }}
                              >
                                <Eye className="mr-1 h-4 w-4" /> View
                              </Link>
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            {visibleApplications.length === 0 && (
              <EmptyState
                icon={<FileCheck2 className="h-6 w-6" />}
                title="No matching applications"
                description="Try changing the search text or status filter."
              />
            )}
          </div>
        ) : (
          <EmptyState
            icon={<FileCheck2 className="h-6 w-6" />}
            title="No applications awaiting action"
            description="New citizen applications will appear here."
          />
        )}
      </div>
    </>
  );
}
