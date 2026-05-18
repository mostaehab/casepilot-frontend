// ============================================================
// User & Auth Types
// ============================================================

export type UserRole = "lawyer" | "assistant" | "admin";

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
  /** First team membership; populated after login by fetching memberships. */
  firmId?: string;
  createdAt: string;
  barLicenseNumber?: string;
  nationalNumber?: string;
}

/**
 * Legacy "Firm" name. The API calls this a "Team". We preserve the existing
 * type alias so UI consumers don't need a rename pass.
 */
export interface Firm {
  id: string;
  name: string;
  description?: string;
  ownerId: string;
  createdAt: string;
  updatedAt?: string;
}

/** Same shape; alias for explicit team-domain code. */
export type Team = Firm;

/**
 * Membership status as returned by GET /teams/:id and GET /teams/me.
 * `pending` = invited but hasn't accepted; `active` = accepted; `removed`
 * = soft-deleted by an owner.
 */
export type MembershipStatus = "pending" | "active" | "removed";

/**
 * A row from the team's `members` array. The API returns
 * `{ team_id, user_id, role, status, name, email }` per row; this is the
 * camelized internal shape. Note: `userId` (not `id`) is the linked
 * user's identifier — `id` is not returned at this layer.
 */
export interface TeamMember {
  teamId: string;
  userId: string;
  role: UserRole;
  status: MembershipStatus;
  /** Present on GET /teams/:id (joined from the user record); absent on
   *  the bare invitation response from POST /teams/:id/members. */
  name?: string;
  email?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

/**
 * Registration form input. Backend expects name, email, password,
 * barLicenseNumber, and nationalNumber.
 */
export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  barLicenseNumber: string;
  nationalNumber: string;
}

// ============================================================
// Case Types
// ============================================================

export type CaseStatus = "open" | "in_progress" | "pending" | "closed";
export type CaseType =
  | "litigation"
  | "corporate"
  | "criminal"
  | "family"
  | "immigration"
  | "real_estate"
  | "other";
export type CasePriority = "high" | "medium" | "low";

export interface Case {
  id: string;
  title: string;
  caseNumber?: string;
  description: string;
  /** Internal name. Mapped to/from API field `type` in case-service. */
  caseType: CaseType;
  status: CaseStatus;
  priority: CasePriority;
  courtName?: string;
  /** ISO date (YYYY-MM-DD). */
  filingDate?: string;
  /** ISO datetime. */
  nextHearingDate?: string;
  clientName: string;
  clientEmail?: string;
  clientPhone?: string;
  clientNationalNumber?: string;
  assignedTo: string[];
  /**
   * Internal name. Mapped to/from API field `teamId` in case-service.
   * Optional: a case can live without a team. Team association only happens
   * when the case is created from inside a team view.
   */
  firmId?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

// ============================================================
// Case File Types
// ============================================================

/**
 * Shape returned by GET /cases/{caseId}/files. The wire format is
 * snake_case (file_name, file_url, ...); api-client camelCases it.
 * `fileSize` is currently always null — the Vercel Blob webhook does
 * not propagate size today. See `casepilot-api` case-files frontend doc.
 */
export interface CaseFile {
  id: string;
  caseId: string;
  uploadedBy: string;
  fileName: string;
  fileUrl: string;
  fileType: string;
  fileSize: number | null;
  uploadedAt: string;
  uploaderName?: string;
}

// ============================================================
// AI Case Analysis Types
// ============================================================

export type HintSeverity = "info" | "warning" | "critical";

export interface CaseAnalysisHint {
  title: string;
  detail: string;
  severity: HintSeverity;
}

export type CaseAnalysisStatus = "pending" | "completed" | "failed";

/**
 * Wire fields arrive snake_case (`case_id`, `file_ids`, `completed_at`, ...)
 * and are camelized by api-client before reaching this type.
 */
export interface CaseAnalysis {
  id: string;
  caseId: string;
  requestedBy: string;
  model: string;
  status: CaseAnalysisStatus;
  summary: string | null;
  hints: CaseAnalysisHint[] | null;
  fileIds: string[] | null;
  error: string | null;
  createdAt: string;
  completedAt: string | null;
}

export interface AnalyzeCaseRequest {
  /** Defaults to ALL files on the case when omitted. */
  fileIds?: string[];
  /** Extra guidance for the model. Max 2000 chars (server-validated). */
  instructions?: string;
}

// ============================================================
// Deadline Types
// ============================================================

/**
 * Matches the backend `case_event_type` enum (see docs/case-deadlines.md §2).
 * "deadline" is the catch-all default; specific types refine the icon/label.
 */
export type DeadlineType =
  | "hearing"
  | "deadline"
  | "filing"
  | "meeting"
  | "reminder"
  | "other";

export interface Deadline {
  id: string;
  caseId: string;
  title: string;
  description?: string;
  /** Internal name. Mapped to/from API field `type` (wire: `event_type`). */
  type: DeadlineType;
  /**
   * ISO datetime in UTC (e.g. "2026-06-14T10:00:00.000Z"). Mapped to/from
   * the wire field `event_date`. When `allDay` is true the time portion
   * should be ignored on display.
   */
  date: string;
  /** When true, render as a date; when false, render with the time portion. */
  allDay: boolean;
  /** Toggled via PATCH /cases/{caseId}/events/{eventId}. Defaults to false on create. */
  completed: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  /** Display name joined from the list endpoint. Absent on create/detail. */
  creatorName?: string;
}

/**
 * Cross-case feed shape (GET /cases/events/upcoming). Extends the per-case
 * Deadline with the case title/number so the consumer can render a link
 * without a second fetch.
 */
export interface UpcomingDeadline extends Deadline {
  caseTitle: string;
  caseNumber: string | null;
}

// ============================================================
// Note Types
// ============================================================

export interface Note {
  id: string;
  caseId: string;
  content: string;
  authorId: string;
  authorName: string;
  authorRole: UserRole;
  createdAt: string;
  updatedAt: string;
}

// ============================================================
// Team Types
// ============================================================

export type InvitationStatus = "pending" | "accepted" | "revoked";

export interface TeamInvitation {
  id: string;
  email: string;
  /** Internal name. The API calls this `teamId`. */
  firmId: string;
  status: InvitationStatus;
  invitedBy: string;
  invitedAt: string;
  /** Role the invitee will receive on accept. */
  role?: UserRole;
}

// ============================================================
// Activity Types
// ============================================================

export type ActivityAction =
  | "case_created"
  | "case_updated"
  | "status_changed"
  | "document_uploaded"
  | "deadline_added"
  | "note_added"
  | "member_invited"
  | "member_assigned";

export interface Activity {
  id: string;
  caseId?: string;
  action: ActivityAction;
  description: string;
  actorId: string;
  actorName: string;
  timestamp: string;
}
