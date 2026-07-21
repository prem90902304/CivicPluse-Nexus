import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Download, FilePlus2, FileText } from "lucide-react";
import { PageHeader } from "@/components/app/PageHeader";
import { Button } from "@/components/ui/button";
import { Loading } from "@/components/app/Loading";
import { EmptyState } from "@/components/app/EmptyState";
import { serviceApplicationService } from "@/api/services";
import { useAuth } from "@/contexts/AuthContext";
import type { ApplicationStatus, ServiceType } from "@/api/services/types";

const labels: Record<ServiceType, string> = {
  BIRTH_CERTIFICATE: "Birth Certificate",
  DEATH_CERTIFICATE: "Death Certificate",
  INCOME_CERTIFICATE: "Income Certificate",
  RESIDENCE_CERTIFICATE: "Residence Certificate",
  TRADE_LICENSE: "Trade License",
  PERMIT_APPROVAL: "Permit Approval",
};

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

export const Route = createFileRoute("/_authenticated/services/applications")({
  head: () => ({ meta: [{ title: "My Service Applications — CivicPulse Nexus" }] }),
  component: MyApplicationsPage,
});

function MyApplicationsPage() {
  const { user } = useAuth();
  const applications = useQuery({
    queryKey: ["service-applications", "mine", user?.id],
    queryFn: () => serviceApplicationService.mine(user!.id),
    enabled: Boolean(user?.id),
  });

  return (
    <>
      <PageHeader
        title="My Applications"
        description="Track your certificate and permit application status."
        breadcrumbs={[{ label: "Home", to: "/dashboard" }, { label: "Services" }]}
        actions={
          <Button asChild>
            <Link to="/services/apply">
              <FilePlus2 className="mr-2 h-4 w-4" /> Apply for Service
            </Link>
          </Button>
        }
      />
      <div className="mx-auto max-w-[1600px] p-6">
        {applications.isLoading ? (
          <Loading />
        ) : applications.data?.length ? (
          <div className="overflow-hidden rounded-sm border border-border bg-card">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-border bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3">Application</th>
                    <th className="px-4 py-3">Service</th>
                    <th className="px-4 py-3">Applied</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Certificate</th>
                    <th className="px-4 py-3">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {applications.data.map((application) => (
                    <tr key={application.id} className="border-b border-border last:border-0">
                      <td className="px-4 py-3 font-medium">{application.applicationNumber}</td>
                      <td className="px-4 py-3">{labels[application.serviceType]}</td>
                      <td className="px-4 py-3">
                        {new Date(application.appliedAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusStyles[application.status]}`}
                        >
                          {application.status.replaceAll("_", " ")}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {application.certificateNumber ? (
                          <span className="inline-flex items-center gap-1 text-emerald-700">
                            <Download className="h-4 w-4" /> {application.certificateNumber}
                          </span>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <Button variant="outline" size="sm" asChild>
                          <Link
                            to="/services/application-details/$id"
                            params={{ id: String(application.id) }}
                          >
                            View
                          </Link>
                        </Button>
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
            title="No service applications yet"
            description="Apply for a certificate or permit to begin."
            action={
              <Button asChild>
                <Link to="/services/apply">Apply for Service</Link>
              </Button>
            }
          />
        )}
      </div>
    </>
  );
}
