import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Eye, FileText, Search } from "lucide-react";
import { PageHeader } from "@/components/app/PageHeader";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EmptyState } from "@/components/app/EmptyState";
import { Loading } from "@/components/app/Loading";
import { StatsCard } from "@/components/app/StatsCard";
import { serviceApplicationService } from "@/api/services";
import { Button } from "@/components/ui/button";
import type { ApplicationStatus, ServiceType } from "@/api/services/types";

const serviceLabels: Record<ServiceType, string> = {
  BIRTH_CERTIFICATE: "Birth Certificate",
  DEATH_CERTIFICATE: "Death Certificate",
  INCOME_CERTIFICATE: "Income Certificate",
  RESIDENCE_CERTIFICATE: "Residence Certificate",
  TRADE_LICENSE: "Trade License",
  PERMIT_APPROVAL: "Permit Approval",
};

const statuses: ApplicationStatus[] = [
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

export const Route = createFileRoute("/_authenticated/admin/services")({
  head: () => ({ meta: [{ title: "Service Management — CivicPulse Nexus" }] }),
  component: AdminServicesPage,
});

function AdminServicesPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<ApplicationStatus | "ALL">("ALL");
  const [type, setType] = useState<ServiceType | "ALL">("ALL");
  const applications = useQuery({
    queryKey: ["service-applications", "all"],
    queryFn: serviceApplicationService.all,
  });
  const filtered = useMemo(
    () =>
      (applications.data ?? []).filter((application) => {
        const query = search.trim().toLowerCase();
        return (
          (!query ||
            application.applicationNumber.toLowerCase().includes(query) ||
            application.applicantName.toLowerCase().includes(query)) &&
          (status === "ALL" || application.status === status) &&
          (type === "ALL" || application.serviceType === type)
        );
      }),
    [applications.data, search, status, type],
  );

  const all = applications.data ?? [];
  const count = (target: ApplicationStatus) => all.filter((item) => item.status === target).length;

  return (
    <>
      <PageHeader
        title="Service Management"
        description="Monitor all certificate and permit applications across the municipality."
        breadcrumbs={[{ label: "Home", to: "/admin/dashboard" }, { label: "Service Management" }]}
      />
      <div className="mx-auto max-w-[1600px] space-y-6 p-6">
        {applications.isLoading ? (
          <Loading />
        ) : (
          <>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
              <StatsCard
                label="Total Applications"
                value={all.length}
                icon={<FileText className="h-6 w-6" />}
                tone="info"
              />
              <StatsCard
                label="Pending"
                value={
                  count("SUBMITTED") + count("DOCUMENTS_REQUIRED") + count("UNDER_VERIFICATION")
                }
                icon={<FileText className="h-6 w-6" />}
                tone="warning"
              />
              <StatsCard
                label="Approved"
                value={count("APPROVED") + count("CERTIFICATE_GENERATED") + count("DOWNLOADED")}
                icon={<FileText className="h-6 w-6" />}
                tone="success"
              />
              <StatsCard
                label="Rejected"
                value={count("REJECTED")}
                icon={<FileText className="h-6 w-6" />}
                tone="danger"
              />
              <StatsCard
                label="Certificates Issued"
                value={count("CERTIFICATE_GENERATED") + count("DOWNLOADED")}
                icon={<FileText className="h-6 w-6" />}
                tone="info"
              />
            </div>
            <div className="flex flex-col gap-3 rounded-sm border border-border bg-card p-4 md:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search application number or applicant name"
                  className="pl-9"
                />
              </div>
              <Select
                value={status}
                onValueChange={(value) => setStatus(value as ApplicationStatus | "ALL")}
              >
                <SelectTrigger className="md:w-56">
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All statuses</SelectItem>
                  {statuses.map((item) => (
                    <SelectItem key={item} value={item}>
                      {item.replaceAll("_", " ")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={type} onValueChange={(value) => setType(value as ServiceType | "ALL")}>
                <SelectTrigger className="md:w-56">
                  <SelectValue placeholder="All service types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All service types</SelectItem>
                  {Object.entries(serviceLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {filtered.length ? (
              <div className="overflow-hidden rounded-sm border border-border bg-card">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="border-b border-border bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
                      <tr>
                        <th className="px-4 py-3">Application</th>
                        <th className="px-4 py-3">Applicant</th>
                        <th className="px-4 py-3">Service</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3">Certificate No.</th>
                        <th className="px-4 py-3">Downloads</th>
                        <th className="px-4 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map((application) => (
                        <tr key={application.id} className="border-b border-border last:border-0">
                          <td className="px-4 py-3 font-medium">{application.applicationNumber}</td>
                          <td className="px-4 py-3">{application.applicantName}</td>
                          <td className="px-4 py-3">{serviceLabels[application.serviceType]}</td>
                          <td className="px-4 py-3">
                            <span
                              className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusStyles[application.status]}`}
                            >
                              {application.status.replaceAll("_", " ")}
                            </span>
                          </td>
                          <td className="px-4 py-3">{application.certificateNumber ?? "—"}</td>
                          <td className="px-4 py-3">{application.downloadCount}</td>
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
            ) : (
              <EmptyState
                icon={<FileText className="h-6 w-6" />}
                title="No matching applications"
                description="Try changing the search or filters."
              />
            )}
          </>
        )}
      </div>
    </>
  );
}
