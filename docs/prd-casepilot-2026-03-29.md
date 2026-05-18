# Product Requirements Document: CasePilot

**Date:** 2026-03-29
**Author:** user
**Version:** 1.0
**Project Type:** web-app
**Project Level:** 2
**Status:** Draft

---

## Document Overview

This Product Requirements Document (PRD) defines the functional and non-functional requirements for CasePilot. It serves as the source of truth for what will be built and provides traceability from requirements through implementation.

**Related Documents:**
- Product Brief: docs/product-brief-casepilot-2026-03-29.md

---

## Executive Summary

CasePilot is a simple, straightforward web application for lawyers to manage, organize, and analyze their cases and related documents. Built for solo practitioners and small law firms, it replaces paper-based workflows and complex legacy tools with an intuitive digital platform powered by AI (Gemini via backend). The frontend is built with Next.js, shadcn/ui, Tailwind CSS, TypeScript, and Zustand — designed to be modern, clean, and usable without training.

---

## Product Goals

### Business Objectives

- Build and sell CasePilot as an internal tool to small law firms
- Reduce the time lawyers spend on administrative tasks by at least 50%
- Establish CasePilot as a trusted, secure platform for handling sensitive legal data
- Achieve positive user feedback and word-of-mouth growth within the legal community

### Success Metrics

- Measurable reduction in time lawyers spend on administrative tasks
- Positive user feedback and satisfaction scores
- Firm adoption and retention rates
- User engagement (daily active usage)

---

## Functional Requirements

Functional Requirements (FRs) define **what** the system does - specific features and behaviors.

Each requirement includes:
- **ID**: Unique identifier (FR-001, FR-002, etc.)
- **Priority**: Must Have / Should Have / Could Have (MoSCoW)
- **Description**: What the system should do
- **Acceptance Criteria**: How to verify it's complete

---

### FR-001: User Login & Logout

**Priority:** Must Have

**Description:**
Users can sign in with email and password and sign out from any page. Authentication state persists across page refreshes.

**Acceptance Criteria:**
- [ ] User can log in with valid email/password
- [ ] Invalid credentials show clear error message
- [ ] User can log out from any page
- [ ] Auth state persists across page refreshes
- [ ] Unauthenticated users are redirected to login

**Dependencies:** None

---

### FR-002: Role-Based Access

**Priority:** Must Have

**Description:**
The system supports two roles: Lawyer and Assistant. Lawyers have full access to all features. Assistants have access scoped to cases they are assigned to, with restricted permissions (e.g., cannot delete cases or manage team).

**Acceptance Criteria:**
- [ ] Lawyer role has full access to all features
- [ ] Assistant role has scoped access to assigned cases only
- [ ] Assistants cannot delete cases or manage firm settings
- [ ] Role is clearly displayed in the UI

**Dependencies:** FR-001

---

### FR-003: Firm Account Setup

**Priority:** Must Have

**Description:**
A lawyer can create a firm account during registration. The firm serves as the organizational unit — all cases, documents, and team members belong to a firm.

**Acceptance Criteria:**
- [ ] Lawyer can create a firm during registration
- [ ] Firm name and basic info can be set
- [ ] All subsequent data is scoped to the firm
- [ ] Firm info is displayed in sidebar/header

**Dependencies:** FR-001

---

### FR-004: Profile Management

**Priority:** Should Have

**Description:**
Users can view and edit their profile information including name, email, and avatar.

**Acceptance Criteria:**
- [ ] User can view their profile details
- [ ] User can edit name and avatar
- [ ] Changes are saved and reflected immediately
- [ ] Profile is accessible from the header avatar

**Dependencies:** FR-001

---

### FR-005: Case CRUD

**Priority:** Must Have

**Description:**
Users can create, view, edit, and archive cases. Each case includes: title, case type, status, client name, client contact info, description, priority, assigned team members, and key dates.

**Acceptance Criteria:**
- [ ] User can create a new case with required fields
- [ ] User can view full case details on a dedicated page
- [ ] User can edit case information
- [ ] User can archive (soft-delete) a case
- [ ] Validation on required fields (title, case type, client name)

**Dependencies:** FR-001, FR-002

---

### FR-006: Case Listing with Filters

**Priority:** Must Have

**Description:**
Cases are displayed in a list/grid view with filters for status, case type, date range, priority, and assigned team member.

**Acceptance Criteria:**
- [ ] Cases displayed in a sortable list or grid
- [ ] Filter by status (Open, In Progress, Pending, Closed)
- [ ] Filter by case type
- [ ] Filter by priority (High, Medium, Low)
- [ ] Filter by assigned team member
- [ ] Filter by date range
- [ ] Filters can be combined
- [ ] Filter state is preserved during session

**Dependencies:** FR-005

---

### FR-007: Case Search

**Priority:** Must Have

**Description:**
Full-text search across case titles, descriptions, client names, and metadata. Results are displayed with relevance highlighting.

**Acceptance Criteria:**
- [ ] Search bar accessible from cases page
- [ ] Searches across title, description, and client name
- [ ] Results update as user types (debounced)
- [ ] Matching text is highlighted in results
- [ ] Empty state shown when no results found

**Dependencies:** FR-005

---

### FR-008: Case Status Tracking

**Priority:** Must Have

**Description:**
Each case has a visual status indicator with a workflow: Open → In Progress → Pending → Closed. Status can be changed from the case detail page or inline from the list view.

**Acceptance Criteria:**
- [ ] Status displayed as colored badge/tag
- [ ] Status can be changed from case detail page
- [ ] Status can be changed inline from list view
- [ ] Status change is reflected immediately in all views
- [ ] Status history is visible (timestamp of last change)

**Dependencies:** FR-005

---

### FR-009: Case Notes

**Priority:** Should Have

**Description:**
Users can add timestamped notes to a case. Notes are displayed in a timeline view, showing author, date, and content.

**Acceptance Criteria:**
- [ ] User can add a text note to any case
- [ ] Notes display in reverse chronological order
- [ ] Each note shows author name, role, and timestamp
- [ ] Notes can be edited or deleted by the author
- [ ] Timeline view is clean and scannable

**Dependencies:** FR-005

---

### FR-010: Document Upload

**Priority:** Must Have

**Description:**
Users can upload documents (PDF, DOCX, images) to a specific case. Maximum file size is 20MB. Supports drag-and-drop and file picker.

**Acceptance Criteria:**
- [ ] Upload via drag-and-drop zone
- [ ] Upload via file picker button
- [ ] Supports PDF, DOCX, JPG, PNG formats
- [ ] Maximum file size: 20MB with clear error if exceeded
- [ ] Upload progress indicator shown
- [ ] Multiple files can be uploaded at once
- [ ] Uploaded documents are associated with the selected case

**Dependencies:** FR-005

---

### FR-011: Document Listing & Organization

**Priority:** Must Have

**Description:**
Documents within a case are displayed in a list with name, type, size, upload date, and uploader. Supports sorting and filtering by type and date.

**Acceptance Criteria:**
- [ ] Documents listed with name, type icon, size, date, uploader
- [ ] Sort by name, date, size
- [ ] Filter by file type
- [ ] Document count shown per case
- [ ] Empty state when no documents uploaded

**Dependencies:** FR-010

---

### FR-012: Document Preview

**Priority:** Should Have

**Description:**
Users can preview documents (PDF and images) in-browser without downloading, in a modal or side panel.

**Acceptance Criteria:**
- [ ] PDF files render in-browser
- [ ] Image files display in a preview modal
- [ ] Preview opens without full page navigation
- [ ] Close button returns to document list
- [ ] Loading state while document renders

**Dependencies:** FR-010

---

### FR-013: Document Download

**Priority:** Must Have

**Description:**
Users can download individual documents or select multiple documents for bulk download.

**Acceptance Criteria:**
- [ ] Download button on each document
- [ ] Multi-select for bulk download
- [ ] Download preserves original file name and format
- [ ] Download works across supported browsers

**Dependencies:** FR-010

---

### FR-014: AI Document Summary

**Priority:** Must Have

**Description:**
Users can trigger an AI-generated summary for any uploaded document. The summary is displayed alongside the document and can be regenerated.

**Acceptance Criteria:**
- [ ] "Analyze" button on each document
- [ ] Loading state while AI processes document
- [ ] Summary displayed in a clean, readable panel
- [ ] Summary can be regenerated
- [ ] Summary persists (doesn't need re-generation on revisit)

**Dependencies:** FR-010

---

### FR-015: Key Date Extraction

**Priority:** Must Have

**Description:**
AI extracts important dates from documents (court dates, filing deadlines, contract dates) and displays them in a structured list with context.

**Acceptance Criteria:**
- [ ] Extracted dates shown in a structured list
- [ ] Each date includes context (what the date refers to)
- [ ] Dates can be added to the case calendar with one click
- [ ] Extraction runs as part of AI analysis

**Dependencies:** FR-014

---

### FR-016: Entity Recognition

**Priority:** Should Have

**Description:**
AI identifies and highlights key entities in documents: parties (names), courts, case references, monetary amounts, and legal citations.

**Acceptance Criteria:**
- [ ] Entities displayed as tagged/categorized items
- [ ] Categories: Parties, Courts, Case References, Amounts, Citations
- [ ] Entity list shown alongside document summary
- [ ] Extraction runs as part of AI analysis

**Dependencies:** FR-014

---

### FR-017: AI Confidence Indicator

**Priority:** Should Have

**Description:**
AI outputs display a confidence level (High, Medium, Low) so lawyers can gauge reliability before relying on the analysis.

**Acceptance Criteria:**
- [ ] Confidence indicator shown on each AI output section
- [ ] Visual differentiation (color/icon) for High/Medium/Low
- [ ] Tooltip explaining what confidence level means

**Dependencies:** FR-014

---

### FR-018: Source Verification

**Priority:** Should Have

**Description:**
AI findings link back to the specific section or page of the source document, allowing lawyers to verify AI output against the original.

**Acceptance Criteria:**
- [ ] Each AI finding includes a source reference (page/section)
- [ ] Clicking the reference navigates to that part of the document
- [ ] Clear visual connection between finding and source

**Dependencies:** FR-012, FR-014

---

### FR-019: Deadline Tracking

**Priority:** Must Have

**Description:**
Users can add deadlines to any case — court dates, filing deadlines, follow-ups. Each deadline has a title, date, time, type, and optional description.

**Acceptance Criteria:**
- [ ] Add deadline from case detail page
- [ ] Deadline fields: title, date, time, type, description
- [ ] Deadline types: Court Date, Filing Deadline, Follow-up, Other
- [ ] Deadlines visible on case detail page
- [ ] Deadlines can be edited and deleted

**Dependencies:** FR-005

---

### FR-020: Calendar View

**Priority:** Must Have

**Description:**
A dedicated calendar page shows all deadlines across all cases in month/week/day views. Clicking a deadline navigates to the associated case.

**Acceptance Criteria:**
- [ ] Month, week, and day view toggles
- [ ] Deadlines displayed as color-coded events
- [ ] Color coding by deadline type
- [ ] Click event to navigate to case
- [ ] Today indicator
- [ ] Navigate between months/weeks

**Dependencies:** FR-019

---

### FR-021: Deadline Reminders

**Priority:** Should Have

**Description:**
Visual indicators highlight approaching deadlines (within 3 days) and overdue deadlines across the dashboard, case list, and calendar.

**Acceptance Criteria:**
- [ ] Approaching deadlines (within 3 days) shown in amber
- [ ] Overdue deadlines shown in red
- [ ] Indicators appear on dashboard, case list, and calendar
- [ ] Deadline count badge in sidebar navigation

**Dependencies:** FR-019, FR-020

---

### FR-022: Invite Team Members

**Priority:** Must Have

**Description:**
Lawyers can invite assistants to join their firm via email. Invited users receive a registration link and are added to the firm with the Assistant role.

**Acceptance Criteria:**
- [ ] Invite form with email field
- [ ] Invited user appears as "Pending" in team list
- [ ] Invited user registers and is automatically added to firm
- [ ] Lawyer can revoke pending invitations
- [ ] Team member list shows all firm members with roles

**Dependencies:** FR-001, FR-003

---

### FR-023: Case Assignment

**Priority:** Must Have

**Description:**
Lawyers can assign cases to team members. Assigned members see those cases in their dashboard and case list.

**Acceptance Criteria:**
- [ ] Assign one or more team members to a case
- [ ] Assignment visible on case detail and list views
- [ ] Assigned members see the case in their filtered views
- [ ] Assignment can be changed by lawyers

**Dependencies:** FR-005, FR-022

---

### FR-024: Activity Log

**Priority:** Could Have

**Description:**
Each case has an activity log showing all actions: case created, status changed, document uploaded, deadline added, notes added — with actor and timestamp.

**Acceptance Criteria:**
- [ ] Auto-generated log entries for key actions
- [ ] Each entry shows action, actor, and timestamp
- [ ] Log displayed on case detail page
- [ ] Filterable by action type

**Dependencies:** FR-005

---

### FR-025: Global Search

**Priority:** Must Have

**Description:**
A global search bar in the header searches across all cases, documents, and deadlines. Results are grouped by type with quick navigation.

**Acceptance Criteria:**
- [ ] Search bar accessible from any page (in header)
- [ ] Results grouped: Cases, Documents, Deadlines
- [ ] Results show preview text and metadata
- [ ] Click result to navigate directly
- [ ] Keyboard shortcut to focus search (Ctrl/Cmd + K)

**Dependencies:** FR-005, FR-010, FR-019

---

### FR-026: Advanced Filters

**Priority:** Must Have

**Description:**
Combine multiple filter criteria across cases: date range, status, case type, priority, assigned user. Filters persist during session.

**Acceptance Criteria:**
- [ ] Multi-criteria filter panel
- [ ] Filters combinable (AND logic)
- [ ] Active filters shown as removable chips
- [ ] Clear all filters button
- [ ] Filter state persists during session

**Dependencies:** FR-006

---

### FR-027: Overview Dashboard

**Priority:** Must Have

**Description:**
The main dashboard shows a summary: total active cases, upcoming deadlines (next 7 days), recent activity, and case status distribution.

**Acceptance Criteria:**
- [ ] Stats cards: total cases, active cases, upcoming deadlines, pending tasks
- [ ] Upcoming deadlines list (next 7 days)
- [ ] Recent activity feed
- [ ] Case status distribution (visual chart or bars)
- [ ] Dashboard loads within 2 seconds

**Dependencies:** FR-005, FR-019

---

### FR-028: Quick Actions

**Priority:** Should Have

**Description:**
Quick action buttons on the dashboard allow creating a case, uploading a document, or adding a deadline without navigating away.

**Acceptance Criteria:**
- [ ] Quick action buttons prominently placed on dashboard
- [ ] "New Case" opens case creation modal/form
- [ ] "Upload Document" opens upload flow with case selector
- [ ] "Add Deadline" opens deadline form with case selector
- [ ] Actions complete without full page navigation

**Dependencies:** FR-005, FR-010, FR-019

---

## Non-Functional Requirements

Non-Functional Requirements (NFRs) define **how** the system performs - quality attributes and constraints.

---

### NFR-001: Page Load Performance

**Priority:** Must Have

**Description:**
All pages load within 2 seconds on standard broadband connections. Use Next.js SSR/SSG, code splitting, and lazy loading to optimize.

**Acceptance Criteria:**
- [ ] Initial page load < 2 seconds on 10Mbps connection
- [ ] Subsequent navigation < 500ms (client-side routing)
- [ ] Lighthouse performance score > 80

**Rationale:**
Lawyers are busy professionals — slow load times will drive them back to their existing workflows.

---

### NFR-002: UI Responsiveness

**Priority:** Must Have

**Description:**
All UI interactions (clicks, filters, toggles, modals) respond within 100ms. No janky animations or unresponsive states.

**Acceptance Criteria:**
- [ ] Button clicks trigger feedback within 100ms
- [ ] Filter changes update results within 300ms
- [ ] Animations run at 60fps
- [ ] Loading states shown for operations > 500ms

**Rationale:**
A responsive UI is critical for the "simple and straightforward" positioning.

---

### NFR-003: Secure Authentication Flows

**Priority:** Must Have

**Description:**
No sensitive data (tokens, passwords, PII) stored in local storage. Use httpOnly cookies or secure session management. No credentials logged to console.

**Acceptance Criteria:**
- [ ] Auth tokens stored in httpOnly cookies (not localStorage)
- [ ] No PII in browser console logs
- [ ] Session expires after inactivity period
- [ ] Secure redirect after login/logout

**Rationale:**
Legal data is highly sensitive — security must be built in from the frontend layer.

---

### NFR-004: Secure API Communication

**Priority:** Must Have

**Description:**
All API calls use HTTPS. No sensitive data in URL parameters. Request/response payloads follow secure patterns.

**Acceptance Criteria:**
- [ ] All API calls use HTTPS
- [ ] No sensitive data in query strings
- [ ] CSRF protection on state-changing requests
- [ ] API errors don't leak internal details to UI

**Rationale:**
Protecting legal data in transit is non-negotiable.

---

### NFR-005: Modern UI Design

**Priority:** Must Have

**Description:**
Clean, modern aesthetic with smooth animations, consistent spacing, polished visual hierarchy, and subtle depth. Leverage shadcn/ui components with custom theming for a professional, premium feel.

**Acceptance Criteria:**
- [ ] Consistent spacing system (4px/8px grid)
- [ ] Smooth transitions and micro-animations
- [ ] Professional color palette with clear visual hierarchy
- [ ] Modern typography with clear readability
- [ ] Polished empty states, loading states, and error states

**Rationale:**
A modern, professional UI builds trust with lawyers and differentiates from dated competitors.

---

### NFR-006: Responsive Design

**Priority:** Should Have

**Description:**
Fully functional on desktop (1280px+) and tablet (1024px+). Gracefully degraded but usable on mobile (< 1024px).

**Acceptance Criteria:**
- [ ] Full functionality at desktop and tablet breakpoints
- [ ] Sidebar collapses on tablet
- [ ] Core features accessible on mobile
- [ ] No horizontal scrolling at any breakpoint

**Rationale:**
Lawyers work primarily on desktop/laptop but may check cases on tablet.

---

### NFR-007: Zero-Training Onboarding

**Priority:** Must Have

**Description:**
New users can navigate and use all core features without documentation, tutorials, or training. UI patterns should be familiar and self-explanatory.

**Acceptance Criteria:**
- [ ] Clear navigation labels and icons
- [ ] Contextual help tooltips on complex features
- [ ] Intuitive form layouts with inline validation
- [ ] Consistent patterns throughout (no surprises)

**Rationale:**
Target users have mid-level tech savviness — the tool must be immediately usable.

---

### NFR-008: Browser Support

**Priority:** Must Have

**Description:**
CasePilot works correctly on the latest 2 versions of Chrome, Edge, and Safari.

**Acceptance Criteria:**
- [ ] Tested on Chrome (latest 2 versions)
- [ ] Tested on Edge (latest 2 versions)
- [ ] Tested on Safari (latest 2 versions)
- [ ] No critical functionality broken on supported browsers

**Rationale:**
These are the browsers most commonly used in professional environments.

---

### NFR-009: Basic Accessibility

**Priority:** Should Have

**Description:**
Core accessibility: keyboard navigation, proper color contrast ratios (WCAG AA), semantic HTML elements, and ARIA labels where needed.

**Acceptance Criteria:**
- [ ] All interactive elements reachable via keyboard
- [ ] Color contrast meets WCAG AA (4.5:1 for text)
- [ ] Semantic HTML (headings, landmarks, buttons vs. divs)
- [ ] Form inputs have associated labels

**Rationale:**
Accessibility is good practice and may be required by some firms.

---

### NFR-010: Component Architecture

**Priority:** Must Have

**Description:**
Reusable, composable component library following shadcn/ui patterns. Components are self-contained with clear props interfaces.

**Acceptance Criteria:**
- [ ] UI components are reusable across pages
- [ ] Components follow shadcn/ui composition patterns
- [ ] Props are typed with TypeScript interfaces
- [ ] No duplicated UI code across pages

**Rationale:**
Maintainable component architecture enables fast iteration and consistent UI.

---

### NFR-011: Type Safety

**Priority:** Must Have

**Description:**
Full TypeScript strict mode. No `any` types in production code. All API response types defined. Zustand stores fully typed.

**Acceptance Criteria:**
- [ ] tsconfig strict mode enabled
- [ ] Zero `any` types in production code
- [ ] All API interfaces/types defined in types/
- [ ] Zustand stores have typed state and actions

**Rationale:**
Type safety prevents bugs and improves developer experience for long-term maintenance.

---

### NFR-012: API-Ready Frontend

**Priority:** Must Have

**Description:**
All data flows use a service layer abstraction. Mock data is served through the same interfaces that will later connect to real APIs. Swapping mock for real API requires changing only the service implementation.

**Acceptance Criteria:**
- [ ] Service layer abstracts all data access
- [ ] Mock data matches expected API response shapes
- [ ] Switching to real API requires only service-level changes
- [ ] No hardcoded mock data in components

**Rationale:**
Backend will be built later — the frontend must be ready to integrate without refactoring.

---

## Epics

Epics are logical groupings of related functionality that will be broken down into user stories during sprint planning (Phase 4).

Each epic maps to multiple functional requirements and will generate 2-10 stories.

---

### EPIC-001: Authentication & User Management

**Description:**
Complete authentication flow and user/firm management. Includes login, registration, role-based access, firm setup, and profile management. Partially built — existing login/register forms need integration and enhancement.

**Functional Requirements:**
- FR-001: User Login & Logout
- FR-002: Role-Based Access
- FR-003: Firm Account Setup
- FR-004: Profile Management

**Story Count Estimate:** 4-6

**Priority:** Must Have

**Business Value:**
Foundation for all other features — users must authenticate and belong to a firm before accessing any functionality.

---

### EPIC-002: Case Management

**Description:**
Core case management capabilities: creating, viewing, editing, filtering, searching, and tracking cases. This is the central feature of CasePilot.

**Functional Requirements:**
- FR-005: Case CRUD
- FR-006: Case Listing with Filters
- FR-007: Case Search
- FR-008: Case Status Tracking
- FR-009: Case Notes

**Story Count Estimate:** 5-8

**Priority:** Must Have

**Business Value:**
The primary reason lawyers use CasePilot — organized, filterable, searchable case management replaces paper files and folders.

---

### EPIC-003: Document Management & AI Analysis

**Description:**
Document upload, organization, preview, and AI-powered analysis. Includes document summaries, key date extraction, entity recognition, confidence indicators, and source verification.

**Functional Requirements:**
- FR-010: Document Upload
- FR-011: Document Listing & Organization
- FR-012: Document Preview
- FR-013: Document Download
- FR-014: AI Document Summary
- FR-015: Key Date Extraction
- FR-016: Entity Recognition
- FR-017: AI Confidence Indicator
- FR-018: Source Verification

**Story Count Estimate:** 6-10

**Priority:** Must Have

**Business Value:**
The key differentiator — AI-powered document analysis saves lawyers hours of manual document review and ensures nothing is missed.

---

### EPIC-004: Calendar & Deadlines

**Description:**
Deadline management and calendar visualization. Track court dates, filing deadlines, and follow-ups with visual reminders for approaching and overdue items.

**Functional Requirements:**
- FR-019: Deadline Tracking
- FR-020: Calendar View
- FR-021: Deadline Reminders

**Story Count Estimate:** 3-5

**Priority:** Must Have

**Business Value:**
Missing a court date or filing deadline can have severe consequences for lawyers and their clients. This feature provides peace of mind.

---

### EPIC-005: Team Collaboration

**Description:**
Team management and case collaboration. Lawyers invite assistants, assign cases, and track activity across the firm.

**Functional Requirements:**
- FR-022: Invite Team Members
- FR-023: Case Assignment
- FR-024: Activity Log

**Story Count Estimate:** 3-5

**Priority:** Must Have

**Business Value:**
Enables the lawyer-assistant workflow that small firms rely on — seamless collaboration without confusion about who is doing what.

---

### EPIC-006: Dashboard & Global Search

**Description:**
The main dashboard providing an at-a-glance overview and global search for quick access to anything in the system.

**Functional Requirements:**
- FR-025: Global Search
- FR-026: Advanced Filters
- FR-027: Overview Dashboard
- FR-028: Quick Actions

**Story Count Estimate:** 3-5

**Priority:** Must Have

**Business Value:**
The first thing users see — a well-designed dashboard drives daily engagement and makes the app feel indispensable.

---

## User Stories (High-Level)

Detailed user stories will be created during sprint planning (Phase 4).

---

## User Personas

### Persona 1: Sarah — Solo Practitioner

- **Age:** 32
- **Role:** Solo lawyer (family law)
- **Tech Level:** Mid — uses email, Word, basic cloud storage
- **Pain Point:** Drowning in paper files, misses deadlines occasionally, spends evenings catching up on document review
- **Goal:** One place to manage all cases, get AI help reading long documents

### Persona 2: Mark — Small Firm Partner

- **Age:** 41
- **Role:** Partner at a 3-person firm (litigation)
- **Tech Level:** Mid — tried Clio, found it too complex
- **Pain Point:** Can't easily see what his assistants are working on, no single view of all deadlines
- **Goal:** Simple tool his whole team can use, clear visibility into case status and upcoming dates

### Persona 3: Lisa — Legal Assistant

- **Age:** 27
- **Role:** Assistant at Mark's firm
- **Tech Level:** Mid-high — comfortable with digital tools
- **Pain Point:** Spends hours organizing and filing documents, manually updating lawyers on case status
- **Goal:** Upload and organize documents quickly, let AI do the summarizing, keep lawyers informed without meetings

---

## User Flows

### Flow 1: Case Review & AI Analysis
1. Lawyer logs in → Dashboard loads
2. Views upcoming deadlines and active cases
3. Clicks on a case → Case detail page
4. Views case info, status, and notes
5. Opens documents tab → Selects a document
6. Clicks "Analyze" → AI generates summary, extracts dates, identifies entities
7. Reviews AI output with confidence indicators
8. Clicks extracted date → Adds to case calendar

### Flow 2: New Case Setup
1. Lawyer clicks "New Case" (from dashboard or cases page)
2. Fills in case details (title, type, client, priority)
3. Saves case → Redirected to case detail page
4. Uploads initial documents via drag-and-drop
5. Assigns case to assistant
6. Adds key deadlines (court date, filing deadline)

### Flow 3: Daily Check-In
1. Lawyer opens CasePilot → Dashboard
2. Reviews stats cards (active cases, upcoming deadlines)
3. Checks deadline list — sees 2 deadlines this week
4. Clicks on approaching deadline → Navigates to case
5. Reviews recent activity and notes
6. Uses global search (Cmd+K) to find a specific document

---

## Dependencies

### Internal Dependencies

- Backend API (built separately by founder) — frontend will use mock data until API is ready
- Zustand store architecture must support seamless mock-to-API transition

### External Dependencies

- Gemini AI (Google) — used in backend for document analysis; frontend consumes AI results via API
- File storage service — backend handles storage; frontend handles upload/download flows

---

## Assumptions

- Backend API will be built separately and integrated later; frontend uses mock/placeholder data initially
- Users will access CasePilot through modern browsers (Chrome, Edge, Safari)
- Each law firm will have its own isolated data environment (multi-tenancy)
- Lawyers are willing to transition from paper-based workflows to a digital solution if the tool is simple enough
- AI analysis results are returned as structured JSON from the backend API
- Maximum document upload size is 20MB
- Unlimited team members per firm

---

## Out of Scope

- Backend/API development (handled separately by founder)
- Mobile native app
- Billing/invoicing features
- Client-facing portal
- Email notifications (visual in-app only)
- Offline functionality
- Multi-language support (English only for v1)

---

## Open Questions

- Which specific Gemini model will be used for document analysis? (Gemini Pro, Gemini Flash, etc.)
- What is the expected AI response time for document analysis?
- Will there be a file type conversion service, or only preview what browsers natively support?
- What is the session timeout duration for inactive users?

---

## Approval & Sign-off

### Stakeholders

- **user (Solo Founder / Developer)** - High influence. Sole decision-maker, developer, and product owner.

### Approval Status

- [ ] Product Owner (user)

---

## Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-03-29 | user | Initial PRD |

---

## Next Steps

### Phase 3: Architecture

Run `/architecture` to create system architecture based on these requirements.

The architecture will address:
- All functional requirements (FRs)
- All non-functional requirements (NFRs)
- Technical stack decisions
- Data models and APIs
- System components

### Phase 4: Sprint Planning

After architecture is complete, run `/sprint-planning` to:
- Break epics into detailed user stories
- Estimate story complexity
- Plan sprint iterations
- Begin implementation

---

**This document was created using BMAD Method v6 - Phase 2 (Planning)**

*To continue: Run `/workflow-status` to see your progress and next recommended workflow.*

---

## Appendix A: Requirements Traceability Matrix

| Epic ID | Epic Name | Functional Requirements | Story Count (Est.) |
|---------|-----------|-------------------------|-------------------|
| EPIC-001 | Authentication & User Management | FR-001, FR-002, FR-003, FR-004 | 4-6 |
| EPIC-002 | Case Management | FR-005, FR-006, FR-007, FR-008, FR-009 | 5-8 |
| EPIC-003 | Document Management & AI Analysis | FR-010, FR-011, FR-012, FR-013, FR-014, FR-015, FR-016, FR-017, FR-018 | 6-10 |
| EPIC-004 | Calendar & Deadlines | FR-019, FR-020, FR-021 | 3-5 |
| EPIC-005 | Team Collaboration | FR-022, FR-023, FR-024 | 3-5 |
| EPIC-006 | Dashboard & Global Search | FR-025, FR-026, FR-027, FR-028 | 3-5 |

**Total Estimated Stories: 24-39**

---

## Appendix B: Prioritization Details

### Functional Requirements Breakdown
- **Must Have:** 18 FRs (FR-001, FR-002, FR-003, FR-005, FR-006, FR-007, FR-008, FR-010, FR-011, FR-013, FR-014, FR-015, FR-019, FR-020, FR-022, FR-023, FR-025, FR-026, FR-027)
- **Should Have:** 8 FRs (FR-004, FR-009, FR-012, FR-016, FR-017, FR-018, FR-021, FR-028)
- **Could Have:** 2 FRs (FR-024)

### Non-Functional Requirements Breakdown
- **Must Have:** 9 NFRs (NFR-001 through NFR-005, NFR-007, NFR-008, NFR-010, NFR-011, NFR-012)
- **Should Have:** 3 NFRs (NFR-006, NFR-009)

### Priority Distribution
- **Must Have:** 27 requirements (67.5%)
- **Should Have:** 11 requirements (27.5%)
- **Could Have:** 2 requirements (5%)
