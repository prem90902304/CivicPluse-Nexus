export type UserRole = "ADMIN" | "OFFICER" | "CITIZEN";

export type ServiceType =
  | "BIRTH_CERTIFICATE"
  | "DEATH_CERTIFICATE"
  | "INCOME_CERTIFICATE"
  | "RESIDENCE_CERTIFICATE"
  | "TRADE_LICENSE"
  | "PERMIT_APPROVAL";

export type ApplicationStatus =
  | "SUBMITTED"
  | "DOCUMENTS_REQUIRED"
  | "UNDER_VERIFICATION"
  | "VERIFIED"
  | "APPROVED"
  | "REJECTED"
  | "CERTIFICATE_GENERATED"
  | "DOWNLOADED";

export type DocumentType =
  | "AADHAAR_CARD"
  | "ADDRESS_PROOF"
  | "BIRTH_PROOF"
  | "DEATH_PROOF"
  | "INCOME_PROOF"
  | "RESIDENCE_PROOF"
  | "BUSINESS_REGISTRATION"
  | "PROPERTY_DOCUMENT";

export interface ServiceApplication {
  id: number;
  applicationNumber: string;
  citizenId: number;
  applicantName: string;
  serviceType: ServiceType;
  status: ApplicationStatus;
  rejectionReason?: string;
  officerMessage?: string;
  certificateNumber?: string;
  digitalSignature?: string;
  approvedAt?: string;
  downloadCount: number;
  appliedAt: string;
  documentUrls: string[];
  documentTypes: DocumentType[];
  requiredDocumentTypes: DocumentType[];
  missingDocumentTypes: DocumentType[];
}

export interface AuthUser {
  id: number;
  fullName: string;
  email: string;
  role: UserRole;
  phone?: string;
  avatarUrl?: string;
  departmentId?: number;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: AuthUser;
}

export type ComplaintStatus =
  "NEW" | "PENDING" | "ASSIGNED" | "IN_PROGRESS" | "ESCALATED" | "RESOLVED" | "REJECTED" | "CLOSED";

export type ComplaintPriority = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export interface Complaint {
  id: number;
  referenceNumber: string;
  title: string;
  description: string;
  location: string;
  status: ComplaintStatus;
  priority: ComplaintPriority;
  categoryId: number;
  categoryName?: string;
  departmentId: number;
  departmentName?: string;
  assignedOfficerId?: number;
  assignedOfficer?: string;
  citizenId: number;
  citizenName?: string;
  imageUrls?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ComplaintTimelineEntry {
  id: number;
  complaintId: number;
  status: ComplaintStatus;
  note?: string;
  actorName: string;
  actorRole: UserRole;
  createdAt: string;
}

export interface ComplaintComment {
  id: number;
  complaintId: number;
  authorName: string;
  authorRole: UserRole;
  message: string;
  createdAt: string;
}

export interface Department {
  id: number;
  name: string;
  code: string;
  headOfficerName?: string;
  totalComplaints?: number;
  resolvedComplaints?: number;
  createdAt: string;
}

export interface Category {
  id: number;
  name: string;
  code: string;
  departmentId: number;
  departmentName?: string;
  slaHours?: number;
}

export interface Officer {
  id: number;
  fullName: string;
  email: string;
  phone?: string;
  departmentId: number;
  departmentName?: string;
  enabled: boolean;
  activeCases: number;
  resolvedCases: number;
}

export interface AppNotification {
  id: number;
  title: string;
  message: string;
  read: boolean;
  type: "INFO" | "SUCCESS" | "WARNING" | "ERROR";
  createdAt: string;
  link?: string;
}

export interface DashboardStats {
  totalComplaints: number;
  openComplaints: number;
  pendingComplaints: number;
  resolvedComplaints: number;
  avgResolutionHours: number;
  statusDistribution: Array<{ status: ComplaintStatus; count: number }>;
  priorityDistribution: Array<{ priority: ComplaintPriority; count: number }>;
  monthlyTrends: Array<{ month: string; created: number; resolved: number }>;
  departmentPerformance: Array<{
    departmentName: string;
    total: number;
    resolved: number;
    avgHours: number;
  }>;
}

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  size: number;
}
