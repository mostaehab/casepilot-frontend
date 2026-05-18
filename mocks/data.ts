import type {
  User,
  Firm,
  Case,
  Deadline,
  Note,
  TeamInvitation,
  Activity,
} from "@/types";

// ============================================================
// Users & Firms
// ============================================================

export const mockFirm: Firm = {
  id: "firm-001",
  name: "Smith & Associates",
  ownerId: "user-001",
  createdAt: "2026-01-15T09:00:00Z",
};

export const mockUsers: User[] = [
  {
    id: "user-001",
    email: "sarah@smithlaw.com",
    name: "Sarah Smith",
    role: "lawyer",
    avatar: undefined,
    firmId: "firm-001",
    createdAt: "2026-01-15T09:00:00Z",
  },
  {
    id: "user-002",
    email: "lisa@smithlaw.com",
    name: "Lisa Chen",
    role: "assistant",
    avatar: undefined,
    firmId: "firm-001",
    createdAt: "2026-02-01T09:00:00Z",
  },
  {
    id: "user-003",
    email: "mark@smithlaw.com",
    name: "Mark Johnson",
    role: "lawyer",
    avatar: undefined,
    firmId: "firm-001",
    createdAt: "2026-02-10T09:00:00Z",
  },
];

// ============================================================
// Cases
// ============================================================

export const mockCases: Case[] = [
  {
    id: "case-001",
    title: "Johnson v. Metro Corp — Wrongful Termination",
    description: "Employment discrimination lawsuit filed against Metro Corp for wrongful termination of David Johnson. Client alleges termination was based on age discrimination in violation of the ADEA.",
    caseType: "litigation",
    status: "in_progress",
    priority: "high",
    clientName: "David Johnson",
    clientEmail: "david.j@email.com",
    clientPhone: "(555) 123-4567",
    assignedTo: ["user-001", "user-002"],
    firmId: "firm-001",
    createdBy: "user-001",
    createdAt: "2026-02-10T10:00:00Z",
    updatedAt: "2026-03-25T14:30:00Z",
  },
  {
    id: "case-002",
    title: "Rivera Family Trust Establishment",
    description: "Setting up a revocable living trust for the Rivera family. Includes trust document drafting, asset inventory, beneficiary designations, and power of attorney documents.",
    caseType: "family",
    status: "open",
    priority: "medium",
    clientName: "Maria Rivera",
    clientEmail: "maria.rivera@email.com",
    clientPhone: "(555) 234-5678",
    assignedTo: ["user-001"],
    firmId: "firm-001",
    createdBy: "user-001",
    createdAt: "2026-03-01T09:00:00Z",
    updatedAt: "2026-03-20T11:00:00Z",
  },
  {
    id: "case-003",
    title: "TechStart Inc. — Series A Funding",
    description: "Corporate legal support for TechStart Inc. Series A funding round. Reviewing term sheets, drafting shareholder agreements, and ensuring regulatory compliance.",
    caseType: "corporate",
    status: "in_progress",
    priority: "high",
    clientName: "Alex Park",
    clientEmail: "alex@techstart.io",
    clientPhone: "(555) 345-6789",
    assignedTo: ["user-003", "user-002"],
    firmId: "firm-001",
    createdBy: "user-003",
    createdAt: "2026-02-20T08:00:00Z",
    updatedAt: "2026-03-28T16:00:00Z",
  },
  {
    id: "case-004",
    title: "State v. Williams — DUI Defense",
    description: "Criminal defense for Michael Williams charged with DUI. Challenging the traffic stop legality and breathalyzer calibration records.",
    caseType: "criminal",
    status: "pending",
    priority: "high",
    clientName: "Michael Williams",
    clientEmail: "m.williams@email.com",
    clientPhone: "(555) 456-7890",
    assignedTo: ["user-003"],
    firmId: "firm-001",
    createdBy: "user-003",
    createdAt: "2026-03-05T14:00:00Z",
    updatedAt: "2026-03-22T09:00:00Z",
  },
  {
    id: "case-005",
    title: "Greenfield Real Estate — Commercial Lease",
    description: "Reviewing and negotiating a 10-year commercial lease for Greenfield Real Estate's new office space at 400 Main Street.",
    caseType: "real_estate",
    status: "open",
    priority: "low",
    clientName: "Jennifer Green",
    clientEmail: "jen@greenfield.com",
    clientPhone: "(555) 567-8901",
    assignedTo: ["user-001", "user-002"],
    firmId: "firm-001",
    createdBy: "user-001",
    createdAt: "2026-03-15T10:00:00Z",
    updatedAt: "2026-03-18T15:00:00Z",
  },
  {
    id: "case-006",
    title: "Lopez Immigration — H-1B Visa Petition",
    description: "H-1B visa petition for Carlos Lopez, a software engineer being sponsored by DataFlow Inc. Preparing petition, supporting documentation, and compliance materials.",
    caseType: "immigration",
    status: "in_progress",
    priority: "medium",
    clientName: "Carlos Lopez",
    clientEmail: "carlos.lopez@email.com",
    clientPhone: "(555) 678-9012",
    assignedTo: ["user-001"],
    firmId: "firm-001",
    createdBy: "user-001",
    createdAt: "2026-02-28T11:00:00Z",
    updatedAt: "2026-03-27T10:00:00Z",
  },
  {
    id: "case-007",
    title: "Baker Estate — Probate Administration",
    description: "Probate administration for the estate of Robert Baker. Managing asset distribution, creditor claims, and court filings.",
    caseType: "family",
    status: "pending",
    priority: "medium",
    clientName: "Emily Baker",
    clientEmail: "emily.baker@email.com",
    clientPhone: "(555) 789-0123",
    assignedTo: ["user-003", "user-002"],
    firmId: "firm-001",
    createdBy: "user-003",
    createdAt: "2026-01-20T09:00:00Z",
    updatedAt: "2026-03-15T14:00:00Z",
  },
  {
    id: "case-008",
    title: "Bright Solutions — IP Dispute",
    description: "Intellectual property dispute over a patent for cloud-based inventory management system. Bright Solutions claims infringement by competitor NexaTech.",
    caseType: "litigation",
    status: "open",
    priority: "high",
    clientName: "Tom Bright",
    clientEmail: "tom@brightsolutions.com",
    clientPhone: "(555) 890-1234",
    assignedTo: ["user-001", "user-003"],
    firmId: "firm-001",
    createdBy: "user-001",
    createdAt: "2026-03-22T08:00:00Z",
    updatedAt: "2026-03-28T11:00:00Z",
  },
  {
    id: "case-009",
    title: "Chen Divorce Settlement",
    description: "Divorce settlement negotiations for Wei Chen. Includes asset division, child custody arrangement, and spousal support mediation.",
    caseType: "family",
    status: "closed",
    priority: "medium",
    clientName: "Wei Chen",
    clientEmail: "wei.chen@email.com",
    clientPhone: "(555) 901-2345",
    assignedTo: ["user-001"],
    firmId: "firm-001",
    createdBy: "user-001",
    createdAt: "2025-11-10T09:00:00Z",
    updatedAt: "2026-02-28T16:00:00Z",
  },
  {
    id: "case-010",
    title: "Summit Corp — Merger Compliance",
    description: "Regulatory compliance review for Summit Corp's proposed merger with Alpine Industries. Antitrust analysis and FTC filing preparation.",
    caseType: "corporate",
    status: "in_progress",
    priority: "high",
    clientName: "Rachel Summit",
    clientEmail: "rachel@summitcorp.com",
    clientPhone: "(555) 012-3456",
    assignedTo: ["user-003", "user-001"],
    firmId: "firm-001",
    createdBy: "user-003",
    createdAt: "2026-03-10T09:00:00Z",
    updatedAt: "2026-03-29T08:00:00Z",
  },
];

// ============================================================
// Deadlines
// ============================================================

export const mockDeadlines: Deadline[] = [
  { id: "dl-001", caseId: "case-001", title: "Discovery deadline", date: "2026-04-05T17:00:00.000Z", allDay: false, type: "filing", description: "All discovery materials must be submitted", completed: false, createdBy: "user-001", createdAt: "2026-02-15T09:00:00Z", updatedAt: "2026-02-15T09:00:00Z" },
  { id: "dl-002", caseId: "case-001", title: "Deposition — Linda Martinez", date: "2026-04-10T09:00:00.000Z", allDay: false, type: "hearing", description: "Deposition of Metro Corp HR Director", completed: false, createdBy: "user-001", createdAt: "2026-03-01T10:00:00Z", updatedAt: "2026-03-01T10:00:00Z" },
  { id: "dl-003", caseId: "case-003", title: "Term sheet response deadline", date: "2026-04-01T23:59:00.000Z", allDay: false, type: "deadline", description: "Must respond to Series A term sheet", completed: false, createdBy: "user-003", createdAt: "2026-02-22T11:00:00Z", updatedAt: "2026-02-22T11:00:00Z" },
  { id: "dl-004", caseId: "case-004", title: "Pre-trial hearing", date: "2026-04-08T10:00:00.000Z", allDay: false, type: "hearing", description: "Pre-trial hearing at County Courthouse, Room 302", completed: false, createdBy: "user-003", createdAt: "2026-03-10T09:00:00Z", updatedAt: "2026-03-10T09:00:00Z" },
  { id: "dl-005", caseId: "case-004", title: "Motion to suppress — filing deadline", date: "2026-03-31T17:00:00.000Z", allDay: false, type: "filing", description: "File motion to suppress breathalyzer evidence", completed: false, createdBy: "user-003", createdAt: "2026-03-08T14:00:00Z", updatedAt: "2026-03-08T14:00:00Z" },
  { id: "dl-006", caseId: "case-006", title: "H-1B petition filing window opens", date: "2026-04-01T00:00:00.000Z", allDay: true, type: "filing", description: "USCIS H-1B filing window for FY2027", completed: false, createdBy: "user-001", createdAt: "2026-03-01T09:00:00Z", updatedAt: "2026-03-01T09:00:00Z" },
  { id: "dl-007", caseId: "case-007", title: "Creditor claims deadline", date: "2026-04-15T00:00:00.000Z", allDay: true, type: "deadline", description: "Final date for creditors to submit claims against estate", completed: false, createdBy: "user-003", createdAt: "2026-01-25T10:00:00Z", updatedAt: "2026-01-25T10:00:00Z" },
  { id: "dl-008", caseId: "case-010", title: "FTC filing deadline", date: "2026-04-20T00:00:00.000Z", allDay: true, type: "filing", description: "Submit pre-merger notification to FTC", completed: false, createdBy: "user-003", createdAt: "2026-03-12T09:00:00Z", updatedAt: "2026-03-12T09:00:00Z" },
  { id: "dl-009", caseId: "case-002", title: "Client meeting — Trust review", date: "2026-04-02T14:00:00.000Z", allDay: false, type: "meeting", description: "Review trust documents with Maria Rivera", completed: false, createdBy: "user-001", createdAt: "2026-03-20T11:00:00Z", updatedAt: "2026-03-20T11:00:00Z" },
  { id: "dl-010", caseId: "case-008", title: "Patent infringement complaint filing", date: "2026-04-12T00:00:00.000Z", allDay: true, type: "filing", description: "File initial complaint in District Court", completed: false, createdBy: "user-001", createdAt: "2026-03-23T09:00:00Z", updatedAt: "2026-03-23T09:00:00Z" },
];

// ============================================================
// Notes
// ============================================================

export const mockNotes: Note[] = [
  { id: "note-001", caseId: "case-001", content: "Initial consultation with David. He was employed at Metro Corp for 12 years. Terminated on Jan 15 with no prior warnings. Two younger employees were hired for similar roles within a month.", authorId: "user-001", authorName: "Sarah Smith", authorRole: "lawyer", createdAt: "2026-02-10T11:00:00Z", updatedAt: "2026-02-10T11:00:00Z" },
  { id: "note-002", caseId: "case-001", content: "Collected performance reviews from past 5 years — all positive. This strengthens the pretextual termination argument.", authorId: "user-002", authorName: "Lisa Chen", authorRole: "assistant", createdAt: "2026-02-12T14:30:00Z", updatedAt: "2026-02-12T14:30:00Z" },
  { id: "note-003", caseId: "case-003", content: "Reviewed term sheet with Alex. Main concerns: drag-along threshold at 60% is aggressive. Recommend negotiating to 75%. Also want to add a ROFR clause.", authorId: "user-003", authorName: "Mark Johnson", authorRole: "lawyer", createdAt: "2026-02-23T09:00:00Z", updatedAt: "2026-02-23T09:00:00Z" },
  { id: "note-004", caseId: "case-004", content: "Reviewed police dashcam footage. Officer did not clearly state reason for traffic stop. This may support motion to suppress.", authorId: "user-003", authorName: "Mark Johnson", authorRole: "lawyer", createdAt: "2026-03-10T15:00:00Z", updatedAt: "2026-03-10T15:00:00Z" },
];

// ============================================================
// Team Invitations
// ============================================================

export const mockInvitations: TeamInvitation[] = [
  { id: "inv-001", email: "john.doe@email.com", firmId: "firm-001", status: "pending", invitedBy: "user-001", invitedAt: "2026-03-25T09:00:00Z" },
];

// ============================================================
// Activities
// ============================================================

export const mockActivities: Activity[] = [
  { id: "act-001", caseId: "case-010", action: "case_updated", description: "Updated case status to In Progress", actorId: "user-003", actorName: "Mark Johnson", timestamp: "2026-03-29T08:00:00Z" },
  { id: "act-002", caseId: "case-008", action: "document_uploaded", description: "Uploaded Patent Filing US-2024-0012345.pdf", actorId: "user-001", actorName: "Sarah Smith", timestamp: "2026-03-28T11:00:00Z" },
  { id: "act-003", caseId: "case-003", action: "deadline_added", description: "Added deadline: Term sheet response deadline", actorId: "user-003", actorName: "Mark Johnson", timestamp: "2026-03-28T10:00:00Z" },
  { id: "act-004", caseId: "case-001", action: "note_added", description: "Added note about performance reviews", actorId: "user-002", actorName: "Lisa Chen", timestamp: "2026-03-27T14:00:00Z" },
  { id: "act-005", caseId: "case-006", action: "status_changed", description: "Changed status from Open to In Progress", actorId: "user-001", actorName: "Sarah Smith", timestamp: "2026-03-27T10:00:00Z" },
  { id: "act-006", action: "member_invited", description: "Invited john.doe@email.com to join the firm", actorId: "user-001", actorName: "Sarah Smith", timestamp: "2026-03-25T09:00:00Z" },
  { id: "act-007", caseId: "case-008", action: "case_created", description: "Created case: Bright Solutions — IP Dispute", actorId: "user-001", actorName: "Sarah Smith", timestamp: "2026-03-22T08:00:00Z" },
  { id: "act-008", caseId: "case-005", action: "case_created", description: "Created case: Greenfield Real Estate — Commercial Lease", actorId: "user-001", actorName: "Sarah Smith", timestamp: "2026-03-15T10:00:00Z" },
];
