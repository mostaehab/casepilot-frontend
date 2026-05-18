# Sprint Plan: CasePilot

**Date:** 2026-03-29
**Scrum Master:** user
**Project Level:** 2
**Total Stories:** 28
**Total Points:** 103
**Planned Sprints:** 5 (1 week each)
**Team:** 1 developer, 6 hours/day, 30 hours/week
**Sprint Capacity:** ~15 points/sprint
**Target Completion:** 2026-05-03

---

## Executive Summary

CasePilot frontend development is organized into 5 one-week sprints, progressing from foundational setup and authentication through core case management, document/AI features, calendar/collaboration, and finally dashboard and polish. Each sprint delivers a usable increment, building on the existing Next.js starter that includes auth forms, dashboard layout, and base UI components.

**Key Metrics:**
- Total Stories: 28
- Total Points: 103
- Sprints: 5 (1 week each)
- Team Capacity: ~15 points per sprint
- Target Completion: 2026-05-03

---

## Story Inventory

### EPIC-001: Authentication & User Management

#### STORY-001: Project Setup & Infrastructure

**Epic:** EPIC-001
**Priority:** Must Have

**User Story:**
As a developer
I want to set up the project foundation (move existing app, install shadcn/ui, configure Zustand, create service layer pattern, set up mock data infrastructure)
So that all subsequent development has a solid, consistent base

**Acceptance Criteria:**
- [ ] Existing Next.js app moved from casepilot/ subfolder to project root
- [ ] shadcn/ui fully installed and configured
- [ ] Zustand store boilerplate created
- [ ] Service layer abstraction created (mock data provider)
- [ ] Folder structure organized (stores/, services/, mocks/, components/ui/)
- [ ] TypeScript strict mode verified

**Technical Notes:**
Move files from casepilot/ to casepilot-web/ root. Install shadcn/ui components. Set up Zustand with typed stores. Create service layer interfaces for future API swap.

**Dependencies:** None

**Points:** 5

---

#### STORY-002: Login Page Enhancement

**Epic:** EPIC-001
**Priority:** Must Have

**User Story:**
As a lawyer
I want to log in with my email and password on a modern, polished login page
So that I can securely access my firm's cases

**Acceptance Criteria:**
- [ ] Modern login form with shadcn/ui components
- [ ] Email and password fields with inline validation
- [ ] Error messages for invalid credentials
- [ ] "Remember me" checkbox
- [ ] Link to registration page
- [ ] Loading state on submit button
- [ ] Redirects to dashboard on success
- [ ] Mock auth service authenticates against mock users

**Technical Notes:**
Enhance existing LoginForm component. Integrate with Zustand auth store and mock auth service.

**Dependencies:** STORY-001

**Points:** 3

---

#### STORY-003: Registration & Firm Setup

**Epic:** EPIC-001
**Priority:** Must Have

**User Story:**
As a lawyer
I want to register an account and create my firm in one flow
So that I can get started with CasePilot quickly

**Acceptance Criteria:**
- [ ] Multi-step registration: personal info → firm info
- [ ] Fields: name, email, password, confirm password, firm name
- [ ] Password strength validation (8+ chars)
- [ ] Firm created automatically on registration
- [ ] Role set to "Lawyer" by default
- [ ] Redirects to dashboard on success
- [ ] Modern, clean form design

**Technical Notes:**
Enhance existing RegisterForm. Add firm creation step. Store in Zustand auth + firm store.

**Dependencies:** STORY-001

**Points:** 3

---

#### STORY-004: Auth State & Route Protection

**Epic:** EPIC-001
**Priority:** Must Have

**User Story:**
As a user
I want my login session to persist across page refreshes and unauthorized pages to redirect me to login
So that my experience is seamless and secure

**Acceptance Criteria:**
- [ ] Auth state persists across page refreshes
- [ ] Unauthenticated users redirected to /login
- [ ] Authenticated users redirected from /login to /dashboard
- [ ] Logout clears state and redirects to login
- [ ] Role-based route access (lawyer vs assistant)

**Technical Notes:**
Zustand persist middleware for auth. Next.js middleware for route protection.

**Dependencies:** STORY-002

**Points:** 3

---

#### STORY-005: Profile Management

**Epic:** EPIC-001
**Priority:** Should Have

**User Story:**
As a user
I want to view and edit my profile (name, email, avatar)
So that my account information stays up to date

**Acceptance Criteria:**
- [ ] Settings/profile page accessible from header avatar
- [ ] View current profile information
- [ ] Edit name and avatar
- [ ] Save changes with success feedback
- [ ] Modern card-based layout

**Technical Notes:**
New settings page under (dashboard) route group. Profile store or extend auth store.

**Dependencies:** STORY-004

**Points:** 2

---

### EPIC-002: Case Management

#### STORY-006: Case Data Model & Mock Data

**Epic:** EPIC-002
**Priority:** Must Have

**User Story:**
As a developer
I want case types, mock data, Zustand store, and service layer in place
So that all case UI components have data to work with

**Acceptance Criteria:**
- [ ] Case TypeScript interfaces defined (title, type, status, client, priority, dates, assigned)
- [ ] Mock cases data (10-15 realistic legal cases)
- [ ] Zustand case store with CRUD actions
- [ ] Case service layer (getCases, getCase, createCase, updateCase, archiveCase)
- [ ] Case status enum (Open, In Progress, Pending, Closed)
- [ ] Case type enum (Litigation, Corporate, Criminal, Family, Other)

**Technical Notes:**
Types in types/. Mock data in mocks/. Store in stores/. Service in services/.

**Dependencies:** STORY-001

**Points:** 3

---

#### STORY-007: Cases List Page

**Epic:** EPIC-002
**Priority:** Must Have

**User Story:**
As a lawyer
I want to see all my cases in a filterable, sortable list
So that I can quickly find and manage my cases

**Acceptance Criteria:**
- [ ] Cases displayed in list/card view
- [ ] Each case shows: title, type badge, status badge, client name, priority, date
- [ ] Sort by date, title, priority, status
- [ ] Filter by status, type, priority
- [ ] Combined filters with active filter chips
- [ ] Clear all filters button
- [ ] Empty state when no cases match
- [ ] Modern card design with hover effects

**Technical Notes:**
New cases page under (dashboard). Use shadcn/ui Table or custom card grid. Filter state in URL params or Zustand.

**Dependencies:** STORY-006

**Points:** 5

---

#### STORY-008: Case Detail Page

**Epic:** EPIC-002
**Priority:** Must Have

**User Story:**
As a lawyer
I want to view all details of a case on a dedicated page
So that I have complete context when working on a case

**Acceptance Criteria:**
- [ ] Case header: title, status badge, priority, type
- [ ] Client information section
- [ ] Case description
- [ ] Assigned team members
- [ ] Key dates
- [ ] Tab navigation: Overview, Documents, Deadlines, Notes
- [ ] Edit case button (opens edit form)
- [ ] Archive case button with confirmation
- [ ] Status change dropdown (inline)
- [ ] Modern layout with clear sections

**Technical Notes:**
Dynamic route: /cases/[id]. Tab-based layout. Reuses case store.

**Dependencies:** STORY-007

**Points:** 5

---

#### STORY-009: Create & Edit Case

**Epic:** EPIC-002
**Priority:** Must Have

**User Story:**
As a lawyer
I want to create new cases and edit existing ones
So that I can keep my case information organized and up to date

**Acceptance Criteria:**
- [ ] Create case form (modal or full page)
- [ ] Fields: title, type, status, client name, client email, client phone, description, priority
- [ ] Required field validation (title, type, client name)
- [ ] Edit case pre-fills current values
- [ ] Save with success toast notification
- [ ] Redirects to case detail after creation
- [ ] Clean form design with proper spacing

**Technical Notes:**
Reusable CaseForm component for create and edit. shadcn/ui form components, Select, Input.

**Dependencies:** STORY-006

**Points:** 3

---

#### STORY-010: Case Search

**Epic:** EPIC-002
**Priority:** Must Have

**User Story:**
As a lawyer
I want to search across case titles, descriptions, and client names
So that I can quickly find a specific case

**Acceptance Criteria:**
- [ ] Search bar on cases page
- [ ] Debounced search (300ms)
- [ ] Searches title, description, client name
- [ ] Results highlight matching text
- [ ] Empty state when no results
- [ ] Combines with active filters

**Technical Notes:**
Client-side search/filter on mock data. Could use simple string matching or fuzzy search.

**Dependencies:** STORY-007

**Points:** 2

---

#### STORY-011: Case Notes Timeline

**Epic:** EPIC-002
**Priority:** Should Have

**User Story:**
As a lawyer
I want to add notes to a case and see them in a timeline
So that I can track updates and important information over time

**Acceptance Criteria:**
- [ ] Notes tab on case detail page
- [ ] Add note form (text input + submit)
- [ ] Notes displayed in reverse chronological timeline
- [ ] Each note shows: author, role badge, timestamp, content
- [ ] Edit and delete own notes
- [ ] Clean timeline design with visual connectors

**Technical Notes:**
Notes stored in case store or separate notes store. Timeline component.

**Dependencies:** STORY-008

**Points:** 3

---

### EPIC-003: Document Management & AI Analysis

#### STORY-012: Document Upload & Listing

**Epic:** EPIC-003
**Priority:** Must Have

**User Story:**
As a lawyer
I want to upload documents to a case and see them listed
So that all case files are organized in one place

**Acceptance Criteria:**
- [ ] Documents tab on case detail page
- [ ] Drag-and-drop upload zone
- [ ] File picker button alternative
- [ ] Supports PDF, DOCX, JPG, PNG
- [ ] Max 20MB with error message if exceeded
- [ ] Upload progress indicator
- [ ] Multi-file upload
- [ ] Document list: name, type icon, size, upload date, uploader
- [ ] Sort by name, date, size
- [ ] Filter by file type
- [ ] Document count badge on tab
- [ ] Empty state

**Technical Notes:**
Mock upload (store file metadata in Zustand, simulate upload delay). Documents tab component.

**Dependencies:** STORY-008

**Points:** 5

---

#### STORY-013: Document Preview & Download

**Epic:** EPIC-003
**Priority:** Must Have (download) / Should Have (preview)

**User Story:**
As a lawyer
I want to preview documents in-browser and download them
So that I can review files without leaving CasePilot

**Acceptance Criteria:**
- [ ] Preview button opens modal/side panel
- [ ] PDF renders in-browser (iframe or PDF.js)
- [ ] Images display in preview modal
- [ ] Close preview returns to document list
- [ ] Loading state while rendering
- [ ] Download button on each document
- [ ] Multi-select for bulk download
- [ ] Preserves original filename

**Technical Notes:**
Preview modal component. PDF rendering via iframe or react-pdf. Mock download (create blob from mock data).

**Dependencies:** STORY-012

**Points:** 5

---

#### STORY-014: AI Document Analysis UI

**Epic:** EPIC-003
**Priority:** Must Have

**User Story:**
As a lawyer
I want to trigger AI analysis on a document and see the summary, extracted dates, and entities
So that I can quickly understand document contents without reading every page

**Acceptance Criteria:**
- [ ] "Analyze" button on each document
- [ ] Loading/processing state with progress indicator
- [ ] AI Summary section: clean, readable paragraph
- [ ] Key Dates section: structured list with date, context, "Add to calendar" button
- [ ] Analysis panel displayed alongside document or in dedicated view
- [ ] Regenerate analysis button
- [ ] Analysis persists (stored in mock data)

**Technical Notes:**
Mock AI service returns pre-built analysis results after simulated delay. AI analysis store. Analysis panel component.

**Dependencies:** STORY-012

**Points:** 5

---

#### STORY-015: Entity Recognition & Confidence

**Epic:** EPIC-003
**Priority:** Should Have

**User Story:**
As a lawyer
I want to see AI-identified entities (parties, courts, citations) with confidence levels
So that I can quickly identify key information and gauge reliability

**Acceptance Criteria:**
- [ ] Entities section in AI analysis panel
- [ ] Categories: Parties, Courts, Case References, Amounts, Citations
- [ ] Entities displayed as categorized tags/chips
- [ ] Confidence indicator (High/Medium/Low) with color coding
- [ ] Tooltip explaining confidence levels
- [ ] Source reference links (page/section number)

**Technical Notes:**
Extend AI analysis mock data with entities and confidence. Tag/chip components.

**Dependencies:** STORY-014

**Points:** 3

---

### EPIC-004: Calendar & Deadlines

#### STORY-016: Deadline Management

**Epic:** EPIC-004
**Priority:** Must Have

**User Story:**
As a lawyer
I want to add, edit, and delete deadlines on a case
So that I never miss a court date or filing deadline

**Acceptance Criteria:**
- [ ] Deadlines tab on case detail page
- [ ] Add deadline form: title, date, time, type (Court Date, Filing, Follow-up, Other), description
- [ ] Deadline list on case detail page
- [ ] Edit and delete deadlines
- [ ] Deadline type color coding
- [ ] Approaching deadlines (within 3 days) highlighted in amber
- [ ] Overdue deadlines highlighted in red
- [ ] Mock deadline data for existing cases

**Technical Notes:**
Deadline store (or extend case store). Deadline form component. Date picker from shadcn/ui.

**Dependencies:** STORY-008

**Points:** 3

---

#### STORY-017: Calendar View

**Epic:** EPIC-004
**Priority:** Must Have

**User Story:**
As a lawyer
I want a calendar page showing all deadlines across all cases
So that I have a clear view of my schedule

**Acceptance Criteria:**
- [ ] Dedicated calendar page in sidebar navigation
- [ ] Month, week, and day view toggles
- [ ] Deadlines displayed as color-coded events (by type)
- [ ] Click event to navigate to associated case
- [ ] Today indicator
- [ ] Navigate between months/weeks
- [ ] Modern, clean calendar design
- [ ] Responsive layout

**Technical Notes:**
Calendar library (react-big-calendar, @fullcalendar/react, or custom). Pulls from deadline store across all cases.

**Dependencies:** STORY-016

**Points:** 5

---

#### STORY-018: Deadline Reminders & Badges

**Epic:** EPIC-004
**Priority:** Should Have

**User Story:**
As a lawyer
I want visual indicators for approaching and overdue deadlines across the app
So that urgent items are always visible

**Acceptance Criteria:**
- [ ] Deadline count badge in sidebar "Calendar" nav item
- [ ] Approaching deadlines (3 days) badge count on dashboard
- [ ] Overdue deadlines shown prominently in red
- [ ] Dashboard upcoming deadlines widget shows urgency colors

**Technical Notes:**
Computed values from deadline store. Badge component on sidebar nav items.

**Dependencies:** STORY-016, STORY-017

**Points:** 2

---

### EPIC-005: Team Collaboration

#### STORY-019: Team Management Page

**Epic:** EPIC-005
**Priority:** Must Have

**User Story:**
As a lawyer
I want to view my team members and invite new assistants
So that my team can collaborate on cases

**Acceptance Criteria:**
- [ ] Team page accessible from sidebar
- [ ] List of current team members: name, email, role, status (Active/Pending)
- [ ] Invite form: email field + send button
- [ ] Pending invitations shown with "Revoke" option
- [ ] Role badge (Lawyer/Assistant)
- [ ] Remove team member option (with confirmation)

**Technical Notes:**
Team store. Mock team data. Invite adds to "pending" list in mock data.

**Dependencies:** STORY-004

**Points:** 3

---

#### STORY-020: Case Assignment

**Epic:** EPIC-005
**Priority:** Must Have

**User Story:**
As a lawyer
I want to assign team members to cases
So that assistants know which cases they're responsible for

**Acceptance Criteria:**
- [ ] Assign members dropdown on case detail page
- [ ] Multi-select team members
- [ ] Assigned members shown as avatars on case cards and detail page
- [ ] Assistants see only assigned cases in their case list
- [ ] Assignment can be changed by lawyers

**Technical Notes:**
Extend case store with assignment. Filter case list by assignment for assistant role.

**Dependencies:** STORY-008, STORY-019

**Points:** 3

---

#### STORY-021: Activity Log

**Epic:** EPIC-005
**Priority:** Could Have

**User Story:**
As a lawyer
I want to see an activity log on each case showing all actions
So that I know who did what and when

**Acceptance Criteria:**
- [ ] Activity tab on case detail page
- [ ] Auto-generated entries: case created, status changed, document uploaded, deadline added, note added
- [ ] Each entry: action icon, description, actor name, timestamp
- [ ] Filter by action type
- [ ] Clean timeline design

**Technical Notes:**
Activity log store or embedded in case. Auto-generate entries on mock actions.

**Dependencies:** STORY-008

**Points:** 3

---

### EPIC-006: Dashboard & Global Search

#### STORY-022: Overview Dashboard

**Epic:** EPIC-006
**Priority:** Must Have

**User Story:**
As a lawyer
I want a dashboard showing my active cases, upcoming deadlines, and recent activity at a glance
So that I can start my day with full awareness of what needs attention

**Acceptance Criteria:**
- [ ] Stats cards: total cases, active cases, upcoming deadlines (7 days), documents count
- [ ] Upcoming deadlines list (next 7 days) with urgency colors
- [ ] Recent activity feed (last 10 items)
- [ ] Case status distribution (visual bar or chart)
- [ ] Modern card-based layout with clean spacing
- [ ] Loads within 2 seconds

**Technical Notes:**
Dashboard page under (dashboard) route group. Aggregates from case, deadline, and activity stores. Chart library or simple CSS bars.

**Dependencies:** STORY-006, STORY-016

**Points:** 5

---

#### STORY-023: Global Search (Cmd+K)

**Epic:** EPIC-006
**Priority:** Must Have

**User Story:**
As a lawyer
I want to search across all cases, documents, and deadlines from a global search bar
So that I can find anything in seconds

**Acceptance Criteria:**
- [ ] Search triggered via header search bar or Cmd/Ctrl+K
- [ ] Search modal/command palette overlay
- [ ] Results grouped: Cases, Documents, Deadlines
- [ ] Each result shows preview text and metadata
- [ ] Click to navigate directly to item
- [ ] Keyboard navigation (arrow keys, enter)
- [ ] Recent searches shown on empty state
- [ ] Modern command palette design

**Technical Notes:**
Command palette component (cmdk library or custom). Searches across all stores.

**Dependencies:** STORY-006, STORY-012, STORY-016

**Points:** 5

---

#### STORY-024: Quick Actions

**Epic:** EPIC-006
**Priority:** Should Have

**User Story:**
As a lawyer
I want quick action buttons on the dashboard to create a case, upload a document, or add a deadline
So that I can perform common tasks without navigating away

**Acceptance Criteria:**
- [ ] Quick action buttons on dashboard
- [ ] "New Case" opens case creation modal
- [ ] "Upload Document" opens upload flow with case selector
- [ ] "Add Deadline" opens deadline form with case selector
- [ ] Actions complete via modals (no page navigation)

**Technical Notes:**
Reuse existing form components in modals. Case selector dropdown.

**Dependencies:** STORY-009, STORY-012, STORY-016, STORY-022

**Points:** 3

---

### Cross-Cutting

#### STORY-025: Sidebar & Navigation Enhancement

**Epic:** Cross-cutting
**Priority:** Must Have

**User Story:**
As a user
I want a modern, polished sidebar with clear navigation and active states
So that I can navigate the app effortlessly

**Acceptance Criteria:**
- [ ] Modern sidebar design with proper spacing and typography
- [ ] Active route highlighting with accent color
- [ ] Icons for each nav item (lucide-react)
- [ ] Collapsible on smaller screens
- [ ] Notification badges on relevant items
- [ ] User avatar and firm name in sidebar footer
- [ ] Smooth hover and transition animations

**Technical Notes:**
Enhance existing DashboardSidebar. Add lucide-react icons. Improve styling.

**Dependencies:** STORY-001

**Points:** 3

---

#### STORY-026: Header & Notifications

**Epic:** Cross-cutting
**Priority:** Must Have

**User Story:**
As a user
I want a clean header with search access, notifications indicator, and profile menu
So that key actions are always accessible

**Acceptance Criteria:**
- [ ] Search bar/trigger in header (connects to global search)
- [ ] Notification bell with count badge
- [ ] User avatar with dropdown menu (profile, settings, logout)
- [ ] Modern, minimal header design
- [ ] Responsive layout

**Technical Notes:**
Enhance existing DashboardHeader. Dropdown menu for avatar. Connect search to Cmd+K.

**Dependencies:** STORY-001

**Points:** 2

---

#### STORY-027: Toast Notifications & Loading States

**Epic:** Cross-cutting
**Priority:** Must Have

**User Story:**
As a user
I want clear feedback when actions succeed or fail, and loading indicators when things are processing
So that I always know what's happening

**Acceptance Criteria:**
- [ ] Toast/snackbar notifications for CRUD actions (success, error)
- [ ] Consistent loading spinners/skeletons across pages
- [ ] Button loading states (disabled + spinner)
- [ ] Page-level loading skeletons
- [ ] Empty states for lists with no data

**Technical Notes:**
shadcn/ui toast component. Skeleton components for case list, document list, dashboard.

**Dependencies:** STORY-001

**Points:** 3

---

#### STORY-028: Final Polish & Responsive Design

**Epic:** Cross-cutting
**Priority:** Should Have

**User Story:**
As a user
I want the app to look polished on desktop and tablet with consistent spacing, animations, and visual refinements
So that CasePilot feels professional and trustworthy

**Acceptance Criteria:**
- [ ] Consistent spacing (4px/8px grid) across all pages
- [ ] Smooth page transitions and micro-animations
- [ ] Responsive at desktop (1280px+) and tablet (1024px+)
- [ ] Sidebar collapses on tablet
- [ ] All empty states, loading states, and error states polished
- [ ] Cross-browser testing (Chrome, Edge, Safari)
- [ ] Lighthouse performance score > 80

**Technical Notes:**
Final pass on all pages. Tailwind responsive classes. Animation utilities.

**Dependencies:** All other stories

**Points:** 5

---

## Sprint Allocation

---

### Sprint 1 (Mar 30 - Apr 5) — Foundation & Auth — 14/15 points

**Goal:** Set up project infrastructure, complete authentication flow, and establish the modern design foundation.

| Story | Title | Points | Priority |
|-------|-------|--------|----------|
| STORY-001 | Project Setup & Infrastructure | 5 | Must Have |
| STORY-002 | Login Page Enhancement | 3 | Must Have |
| STORY-003 | Registration & Firm Setup | 3 | Must Have |
| STORY-025 | Sidebar & Navigation Enhancement | 3 | Must Have |

**Total:** 14 points / 15 capacity (93%)

**Deliverables:**
- Project moved and restructured
- shadcn/ui, Zustand, service layer set up
- Modern login and registration working
- Polished sidebar navigation

**Risks:**
- Moving existing files could break imports (low — straightforward refactor)

---

### Sprint 2 (Apr 6 - Apr 12) — Core Case Management — 15/15 points

**Goal:** Deliver complete case management — create, view, list, filter, search, and edit cases.

| Story | Title | Points | Priority |
|-------|-------|--------|----------|
| STORY-004 | Auth State & Route Protection | 3 | Must Have |
| STORY-006 | Case Data Model & Mock Data | 3 | Must Have |
| STORY-007 | Cases List Page | 5 | Must Have |
| STORY-009 | Create & Edit Case | 3 | Must Have |
| STORY-026 | Header & Notifications | 2 | Must Have |

**Total:** 16 points / 15 capacity (107% — slight stretch)

**Deliverables:**
- Auth state persistence and route protection
- Full case list with filters and sorting
- Create and edit case forms
- Enhanced header with search trigger

**Risks:**
- Slightly over capacity — STORY-026 is lightweight and can overflow to Sprint 3 if needed

---

### Sprint 3 (Apr 13 - Apr 19) — Case Details & Documents — 15/15 points

**Goal:** Complete case detail page with documents tab, upload, preview, and download.

| Story | Title | Points | Priority |
|-------|-------|--------|----------|
| STORY-008 | Case Detail Page | 5 | Must Have |
| STORY-010 | Case Search | 2 | Must Have |
| STORY-012 | Document Upload & Listing | 5 | Must Have |
| STORY-027 | Toast Notifications & Loading States | 3 | Must Have |

**Total:** 15 points / 15 capacity (100%)

**Deliverables:**
- Full case detail page with tabs
- Case search on list page
- Document upload with drag-and-drop
- Consistent loading/feedback states across app

**Risks:**
- Document upload simulation needs careful UX (progress bars, error states)

---

### Sprint 4 (Apr 20 - Apr 26) — AI Analysis, Calendar & Team — 15/15 points

**Goal:** Deliver AI document analysis, calendar with deadlines, and team collaboration.

| Story | Title | Points | Priority |
|-------|-------|--------|----------|
| STORY-013 | Document Preview & Download | 5 | Must Have |
| STORY-014 | AI Document Analysis UI | 5 | Must Have |
| STORY-016 | Deadline Management | 3 | Must Have |
| STORY-019 | Team Management Page | 3 | Must Have |

**Total:** 16 points / 15 capacity (107% — slight stretch)

**Deliverables:**
- Document preview modal and download
- AI analysis panel (summary, dates, entities)
- Deadline CRUD on case pages
- Team management and invitations

**Risks:**
- AI analysis UI is complex — mock data quality matters for demo
- Slightly over capacity — can push STORY-019 if needed

---

### Sprint 5 (Apr 27 - May 3) — Dashboard, Search & Polish — 15/15 points

**Goal:** Complete the dashboard, global search, remaining features, and final polish.

| Story | Title | Points | Priority |
|-------|-------|--------|----------|
| STORY-017 | Calendar View | 5 | Must Have |
| STORY-022 | Overview Dashboard | 5 | Must Have |
| STORY-023 | Global Search (Cmd+K) | 5 | Must Have |

**Total:** 15 points / 15 capacity (100%)

**Deliverables:**
- Full calendar page with month/week/day views
- Dashboard with stats, deadlines, and activity
- Global search command palette

**Risks:**
- Calendar library integration may need extra time

---

### Overflow / Buffer Stories

These stories are important but lower priority. Work them in if sprints complete early, or plan a Sprint 6 if needed.

| Story | Title | Points | Priority |
|-------|-------|--------|----------|
| STORY-005 | Profile Management | 2 | Should Have |
| STORY-011 | Case Notes Timeline | 3 | Should Have |
| STORY-015 | Entity Recognition & Confidence | 3 | Should Have |
| STORY-018 | Deadline Reminders & Badges | 2 | Should Have |
| STORY-020 | Case Assignment | 3 | Must Have |
| STORY-021 | Activity Log | 3 | Could Have |
| STORY-024 | Quick Actions | 3 | Should Have |
| STORY-028 | Final Polish & Responsive Design | 5 | Should Have |

**Overflow Total:** 24 points (~2 additional sprints if all included)

---

## Epic Traceability

| Epic ID | Epic Name | Stories | Total Points | Sprint(s) |
|---------|-----------|---------|--------------|-----------|
| EPIC-001 | Auth & User Management | STORY-001, 002, 003, 004, 005 | 16 | Sprint 1-2 (+overflow) |
| EPIC-002 | Case Management | STORY-006, 007, 008, 009, 010, 011 | 21 | Sprint 2-3 (+overflow) |
| EPIC-003 | Document Management & AI | STORY-012, 013, 014, 015 | 18 | Sprint 3-4 (+overflow) |
| EPIC-004 | Calendar & Deadlines | STORY-016, 017, 018 | 10 | Sprint 4-5 (+overflow) |
| EPIC-005 | Team Collaboration | STORY-019, 020, 021 | 9 | Sprint 4 (+overflow) |
| EPIC-006 | Dashboard & Global Search | STORY-022, 023, 024 | 13 | Sprint 5 (+overflow) |
| Cross-cutting | Navigation, Header, Polish | STORY-025, 026, 027, 028 | 13 | Sprint 1-2 (+overflow) |

---

## Requirements Coverage

| FR ID | FR Name | Story | Sprint |
|-------|---------|-------|--------|
| FR-001 | User Login & Logout | STORY-002, STORY-004 | 1, 2 |
| FR-002 | Role-Based Access | STORY-004 | 2 |
| FR-003 | Firm Account Setup | STORY-003 | 1 |
| FR-004 | Profile Management | STORY-005 | Overflow |
| FR-005 | Case CRUD | STORY-008, STORY-009 | 2, 3 |
| FR-006 | Case Listing with Filters | STORY-007 | 2 |
| FR-007 | Case Search | STORY-010 | 3 |
| FR-008 | Case Status Tracking | STORY-008 | 3 |
| FR-009 | Case Notes | STORY-011 | Overflow |
| FR-010 | Document Upload | STORY-012 | 3 |
| FR-011 | Document Listing | STORY-012 | 3 |
| FR-012 | Document Preview | STORY-013 | 4 |
| FR-013 | Document Download | STORY-013 | 4 |
| FR-014 | AI Document Summary | STORY-014 | 4 |
| FR-015 | Key Date Extraction | STORY-014 | 4 |
| FR-016 | Entity Recognition | STORY-015 | Overflow |
| FR-017 | AI Confidence | STORY-015 | Overflow |
| FR-018 | Source Verification | STORY-015 | Overflow |
| FR-019 | Deadline Tracking | STORY-016 | 4 |
| FR-020 | Calendar View | STORY-017 | 5 |
| FR-021 | Deadline Reminders | STORY-018 | Overflow |
| FR-022 | Invite Team Members | STORY-019 | 4 |
| FR-023 | Case Assignment | STORY-020 | Overflow |
| FR-024 | Activity Log | STORY-021 | Overflow |
| FR-025 | Global Search | STORY-023 | 5 |
| FR-026 | Advanced Filters | STORY-007 | 2 |
| FR-027 | Overview Dashboard | STORY-022 | 5 |
| FR-028 | Quick Actions | STORY-024 | Overflow |

**Coverage:** All 28 FRs mapped. 20 FRs in core sprints, 8 in overflow.

---

## Risks and Mitigation

**High:**
- Solo developer capacity — any personal setback delays everything
  - *Mitigation:* 1-week sprints allow fast re-planning. Overflow buffer exists.

**Medium:**
- Calendar library integration complexity
  - *Mitigation:* Research libraries in Sprint 4. Fallback to simple list view if needed.
- AI analysis mock data quality affects demo impact
  - *Mitigation:* Invest time in realistic mock AI responses.

**Low:**
- Moving existing codebase breaks imports
  - *Mitigation:* Straightforward refactor with search-replace on import paths.

---

## Dependencies

**Internal:**
- Each sprint builds on the previous — must complete in order
- STORY-001 (infrastructure) is the foundation for everything

**External:**
- None for frontend (backend built separately, using mock data)

---

## Definition of Done

For a story to be considered complete:
- [ ] Code implemented and committed
- [ ] TypeScript strict mode — no type errors
- [ ] Components are reusable and follow shadcn/ui patterns
- [ ] Modern UI with consistent spacing and animations
- [ ] Loading, empty, and error states handled
- [ ] Responsive at desktop (1280px+) and tablet (1024px+)
- [ ] Mock data serves through service layer
- [ ] Acceptance criteria validated

---

## Next Steps

**Immediate:** Begin Sprint 1

Run `/bmad:dev-story` to start implementing STORY-001 (Project Setup & Infrastructure).

**Sprint cadence:**
- Sprint length: 1 week
- Sprint start: Monday
- Sprint review: Friday

---

**This plan was created using BMAD Method v6 - Phase 4 (Implementation Planning)**

*To continue: Run `/workflow-status` to see your progress and next recommended workflow.*
