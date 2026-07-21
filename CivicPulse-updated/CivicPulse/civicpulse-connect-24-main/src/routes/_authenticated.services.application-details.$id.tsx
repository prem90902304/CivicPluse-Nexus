import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Download,
  FileCheck2,
  FileText,
  Loader2,
  ShieldCheck,
  Trash2,
  Upload,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/app/PageHeader";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loading } from "@/components/app/Loading";
import { serviceApplicationService } from "@/api/services";
import { ApiError, getImageUrl } from "@/api/client";
import { useAuth } from "@/contexts/AuthContext";
import type { DocumentType, ServiceType } from "@/api/services/types";

const serviceLabels: Record<ServiceType, string> = {
  BIRTH_CERTIFICATE: "Birth Certificate",
  DEATH_CERTIFICATE: "Death Certificate",
  INCOME_CERTIFICATE: "Income Certificate",
  RESIDENCE_CERTIFICATE: "Residence Certificate",
  TRADE_LICENSE: "Trade License",
  PERMIT_APPROVAL: "Permit Approval",
};

const documentLabels: Record<DocumentType, string> = {
  AADHAAR_CARD: "Aadhaar Card",
  ADDRESS_PROOF: "Address Proof",
  BIRTH_PROOF: "Birth Proof / Hospital Record",
  DEATH_PROOF: "Death Proof / Hospital Record",
  INCOME_PROOF: "Income Proof",
  RESIDENCE_PROOF: "Residence Proof",
  BUSINESS_REGISTRATION: "Business Registration",
  PROPERTY_DOCUMENT: "Property Document",
};

export const Route = createFileRoute("/_authenticated/services/application-details/$id")({
  head: () => ({ meta: [{ title: "Application Details — CivicPulse Nexus" }] }),
  component: ServiceApplicationDetailsPage,
});

function ServiceApplicationDetailsPage() {
  const { user } = useAuth();
  const [documentType, setDocumentType] = useState<DocumentType | "">("");
  const { id } = Route.useParams();
  const applicationId = Number(id);
  const queryClient = useQueryClient();
  const application = useQuery({
    queryKey: ["service-application", applicationId],
    queryFn: () => serviceApplicationService.get(applicationId),
  });
  const refresh = () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: ["service-application", applicationId] }),
      queryClient.invalidateQueries({ queryKey: ["service-applications"] }),
    ]);
  const showError = (error: unknown) =>
    toast.error(error instanceof ApiError ? error.message : "Action failed. Please try again.");

  const upload = useMutation({
    mutationFn: (file: File) =>
      serviceApplicationService.uploadDocument(applicationId, file, documentType as DocumentType),
    onSuccess: () => {
      toast.success("Document uploaded successfully");
      setDocumentType("");
      refresh();
    },
    onError: showError,
  });
  const download = useMutation({
    mutationFn: () => serviceApplicationService.download(applicationId),
    onSuccess: () => {
      toast.success("Certificate download recorded");
      refresh();
    },
    onError: showError,
  });
  const verify = useMutation({
    mutationFn: () => serviceApplicationService.verify(applicationId, user!.id),
    onSuccess: () => {
      toast.success("Documents verified");
      refresh();
    },
    onError: showError,
  });
  const approve = useMutation({
    mutationFn: () => serviceApplicationService.approve(applicationId, user!.id),
    onSuccess: () => {
      toast.success("Application approved");
      refresh();
    },
    onError: showError,
  });
  const reject = useMutation({
    mutationFn: (reason: string) =>
      serviceApplicationService.reject(applicationId, user!.id, reason),
    onSuccess: () => {
      toast.success("Application rejected");
      refresh();
    },
    onError: showError,
  });
  const requestDocuments = useMutation({
    mutationFn: (message: string) =>
      serviceApplicationService.requestDocuments(applicationId, user!.id, message),
    onSuccess: () => {
      toast.success("Document request sent to the citizen");
      refresh();
    },
    onError: showError,
  });
  const generate = useMutation({
    mutationFn: () => serviceApplicationService.generateCertificate(applicationId),
    onSuccess: () => {
      toast.success("Certificate generated");
      refresh();
    },
    onError: showError,
  });
  const deleteRejected = useMutation({
    mutationFn: () => serviceApplicationService.deleteRejected(applicationId),
    onSuccess: () => {
      toast.success("Rejected application deleted");
      window.history.back();
    },
    onError: showError,
  });

  const onFileChange = (file?: File) => {
    if (!file) return;
    if (!documentType) {
      toast.error("Select the document type before uploading");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Document must be under 10 MB");
      return;
    }
    upload.mutate(file);
  };

  if (application.isLoading) return <Loading />;
  if (!application.data) return null;
  const item = application.data;
  const certificateReady = item.status === "CERTIFICATE_GENERATED" || item.status === "DOWNLOADED";
  const canUploadDocuments = user?.role === "CITIZEN";
  const isMunicipalOfficer =
    user?.role === "OFFICER" && user.email.toLowerCase() === "officer@civicpulse.com";
  const canDeleteRejected =
    (user?.role === "OFFICER" || user?.role === "ADMIN") && item.status === "REJECTED";
  const canDownloadCertificate =
    certificateReady && (user?.role === "CITIZEN" || user?.role === "ADMIN");

  const requestMoreDocuments = () => {
    const message = window.prompt(
      `Message for ${item.applicationNumber}:`,
      "Please upload the missing supporting documents so we can continue processing your application.",
    );
    if (message?.trim()) requestDocuments.mutate(message.trim());
  };
  const rejectApplication = () => {
    const reason = window.prompt(`Reason for rejecting ${item.applicationNumber}:`);
    if (reason?.trim()) reject.mutate(reason.trim());
  };
  const deleteApplication = () => {
    if (
      window.confirm(
        `Delete rejected application ${item.applicationNumber}? This cannot be undone.`,
      )
    ) {
      deleteRejected.mutate();
    }
  };

  return (
    <>
      <PageHeader
        title="Application Details"
        description="View status, manage supporting documents, and download your certificate."
        breadcrumbs={[
          { label: "Home", to: "/dashboard" },
          { label: "My Applications", to: "/services/applications" },
          { label: item.applicationNumber },
        ]}
      />
      <div className="mx-auto max-w-4xl space-y-6 p-6">
        <div className="rounded-sm border border-border bg-card p-6 shadow-sm">
          <div className="flex flex-col justify-between gap-4 sm:flex-row">
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                Application Number
              </p>
              <h2 className="mt-1 text-xl font-semibold">{item.applicationNumber}</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {serviceLabels[item.serviceType]}
              </p>
            </div>
            <span className="h-fit rounded-full bg-muted px-3 py-1.5 text-sm font-medium">
              {item.status.replaceAll("_", " ")}
            </span>
          </div>
          <div className="mt-6 grid grid-cols-1 gap-4 border-t border-border pt-5 sm:grid-cols-2">
            <div>
              <p className="text-xs text-muted-foreground">Applicant</p>
              <p className="font-medium">{item.applicantName}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Applied Date</p>
              <p className="font-medium">{new Date(item.appliedAt).toLocaleString()}</p>
            </div>
            {item.certificateNumber && (
              <div>
                <p className="text-xs text-muted-foreground">Certificate Number</p>
                <p className="font-medium text-emerald-700">{item.certificateNumber}</p>
              </div>
            )}
            {item.digitalSignature && (
              <div>
                <p className="text-xs text-muted-foreground">Digital Signature</p>
                <p className="font-medium">{item.digitalSignature}</p>
              </div>
            )}
          </div>
          {item.rejectionReason && (
            <div className="mt-5 rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
              <strong>Rejection reason:</strong> {item.rejectionReason}
            </div>
          )}
          {item.officerMessage && (
            <div className="mt-5 rounded-md border border-amber-400/50 bg-amber-50 p-3 text-sm text-amber-900">
              <strong>Documents required:</strong> {item.officerMessage}
            </div>
          )}
        </div>
        <div className="rounded-sm border border-border bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-semibold">Supporting Documents</h2>
              <p className="text-sm text-muted-foreground">
                Upload PDF, JPG, or PNG files up to 10 MB.
              </p>
            </div>
            {canUploadDocuments && (
              <div className="flex items-center gap-2">
                <Select
                  value={documentType}
                  onValueChange={(value) => setDocumentType(value as DocumentType)}
                >
                  <SelectTrigger className="w-56">
                    <SelectValue placeholder="Select document type" />
                  </SelectTrigger>
                  <SelectContent>
                    {item.missingDocumentTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {documentLabels[type]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  asChild
                  disabled={upload.isPending || item.missingDocumentTypes.length === 0}
                >
                  <label className="cursor-pointer">
                    <Upload className="mr-2 h-4 w-4" /> {upload.isPending ? "Uploading…" : "Upload"}
                    <input
                      type="file"
                      accept="application/pdf,image/jpeg,image/png"
                      className="hidden"
                      onChange={(event) => onFileChange(event.target.files?.[0])}
                    />
                  </label>
                </Button>
              </div>
            )}
          </div>
          {item.missingDocumentTypes.length > 0 && (
            <div className="mt-4 rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-950">
              <strong>Still required:</strong>{" "}
              {item.missingDocumentTypes.map((type) => documentLabels[type]).join(", ")}
            </div>
          )}
          <div className="mt-4 space-y-2">
            {item.documentUrls.length ? (
              item.documentUrls.map((url, index) => (
                <a
                  key={url}
                  href={getImageUrl(url)}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 rounded-md border border-border p-3 text-sm text-primary hover:bg-muted"
                >
                  <FileText className="h-4 w-4" />{" "}
                  {item.documentTypes[index]
                    ? documentLabels[item.documentTypes[index]]
                    : "Previously uploaded document"}
                </a>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No documents uploaded yet.</p>
            )}
          </div>
        </div>
        {(isMunicipalOfficer || canDeleteRejected) && (
          <div className="rounded-sm border border-border bg-card p-6 shadow-sm">
            <h2 className="font-semibold">Application Actions</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Review the application and complete the next available action.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {isMunicipalOfficer && item.status === "SUBMITTED" && (
                <>
                  <Button
                    variant="outline"
                    onClick={requestMoreDocuments}
                    disabled={requestDocuments.isPending}
                  >
                    <AlertTriangle className="mr-2 h-4 w-4" /> Request Documents
                  </Button>
                  <Button onClick={() => verify.mutate()} disabled={verify.isPending}>
                    <ShieldCheck className="mr-2 h-4 w-4" /> Verify
                  </Button>
                </>
              )}
              {isMunicipalOfficer && item.status === "DOCUMENTS_REQUIRED" && (
                <Button
                  variant="outline"
                  onClick={requestMoreDocuments}
                  disabled={requestDocuments.isPending}
                >
                  <AlertTriangle className="mr-2 h-4 w-4" /> Update Request
                </Button>
              )}
              {isMunicipalOfficer && item.status === "VERIFIED" && (
                <>
                  <Button onClick={() => approve.mutate()} disabled={approve.isPending}>
                    <CheckCircle2 className="mr-2 h-4 w-4" /> Approve
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={rejectApplication}
                    disabled={reject.isPending}
                  >
                    <XCircle className="mr-2 h-4 w-4" /> Reject
                  </Button>
                </>
              )}
              {isMunicipalOfficer && item.status === "APPROVED" && (
                <Button onClick={() => generate.mutate()} disabled={generate.isPending}>
                  <FileCheck2 className="mr-2 h-4 w-4" /> Generate Certificate
                </Button>
              )}
              {canDeleteRejected && (
                <Button
                  variant="destructive"
                  onClick={deleteApplication}
                  disabled={deleteRejected.isPending}
                >
                  <Trash2 className="mr-2 h-4 w-4" /> Delete Rejected Application
                </Button>
              )}
            </div>
          </div>
        )}
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => window.history.back()}>
            Back
          </Button>
          {canDownloadCertificate && (
            <Button onClick={() => download.mutate()} disabled={download.isPending}>
              {download.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Download className="mr-2 h-4 w-4" />
              )}{" "}
              Download Certificate
            </Button>
          )}
        </div>
      </div>
    </>
  );
}
