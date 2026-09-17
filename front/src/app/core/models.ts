export type UserRole = 'ROLE_CITIZEN' | 'ROLE_AGENT' | 'ROLE_ADMIN' | 'ROLE_SUPER_ADMIN';
export type ReportStatus = 'PENDING' | 'UNDER_REVIEW' | 'ASSIGNED' | 'IN_PROGRESS' | 'RESOLVED' | 'REJECTED' | 'CLOSED';
export type ReportPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
export type AssignmentStatus = 'ASSIGNED' | 'ACCEPTED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
export type NotificationType = 'REPORT_CREATED' | 'STATUS_CHANGED' | 'ASSIGNMENT' | 'COMMENT' | 'SYSTEM';
export type PhotoType = 'BEFORE' | 'AFTER' | 'OTHER';

export interface Municipality {
  id?: number;
  nom: string;
  gouvernorat: string;
  code: string;
}

export interface User {
  id?: number;
  nom: string;
  email: string;
  role: UserRole;
  municipality?: Municipality;
  plainPassword?: string;
}

export interface Category {
  id?: number;
  nom: string;
  description?: string;
  icon?: string;
  prioriteParDefaut: ReportPriority;
}

export interface Report {
  id?: number;
  titre: string;
  description: string;
  adresse: string;
  latitude: number;
  longitude: number;
  status: ReportStatus;
  priority: ReportPriority;
  photoPath?: string;
  createdAt?: string;
  updatedAt?: string;
  resolvedAt?: string;
  category?: Category;
  creator?: User;
  assignment?: Assignment;
}

export interface Assignment {
  id?: number;
  status: AssignmentStatus;
  commentaire?: string;
  assignedAt?: string;
  completedAt?: string;
  report?: Report;
  assignedAgent?: User;
  assignedBy?: User;
}

export interface Comment {
  id?: number;
  contenu: string;
  createdAt?: string;
  report?: Report;
  user?: User;
}

export interface ReportPhoto {
  id?: number;
  url: string;
  type: PhotoType;
  uploadedAt?: string;
  report?: Report;
}

export interface StatusHistory {
  id?: number;
  oldStatus: ReportStatus;
  newStatus: ReportStatus;
  changedAt?: string;
  report?: Report;
  changedBy?: User;
}

export interface Notification {
  id?: number;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  createdAt?: string;
  report?: Report;
  recipient?: User;
}

export interface AuditLog {
  id?: number;
  action: string;
  entityName: string;
  entityId: string;
  details?: string;
  createdAt?: string;
  user?: User;
}

export interface AuthResponse {
  token: string;
}

export interface CreateReportPayload {
  titre: string;
  description: string;
  adresse: string;
  latitude: number;
  longitude: number;
  category: number;
  photo?: File;
}

export interface DashboardStats {
  reportsByStatus: Array<{ name: string; value: number }>;
  reportsByCategory: Array<{ name: string; value: number }>;
  averageResolutionTimeDays: number;
}
