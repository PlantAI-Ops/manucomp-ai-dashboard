# API Integration Checklist

This document tracks all backend API endpoints from `backend.json` and their integration status in the frontend.

**Base URL:** `http://localhost:8000/api/v1`
**Auth:** Bearer token (JWT), stored in `localStorage.auth_token`

---

## Authentication

| Method | Endpoint | Summary | Service / Hook | Status |
|--------|----------|---------|----------------|--------|
| POST | `/api/v1/auth/register` | Register new user | `POST /auth/register` in `RegisterPage.tsx` | Integrated |
| POST | `/api/v1/auth/login` | Login, return access token | `POST /auth/login` in `LoginPage.tsx` | Integrated |
| GET | `/api/v1/auth/me` | Get current user profile | Called automatically by `useAuth` hook on token load | Integrated |

**Notes:**
- `POST /auth/login` uses `application/x-www-form-urlencoded` (username + password)
- `GET /auth/me` requires Bearer token
- On 401 response, frontend auto-clears token and redirects to `/login` (see `src/services/api.ts`)

---

## Employees

| Method | Endpoint | Summary | Service / Hook | Status |
|--------|----------|---------|----------------|--------|
| POST | `/api/v1/employees/` | Create employee | `api.post("/employees")` in `EmployeeFormModal.tsx` | Integrated |
| GET | `/api/v1/employees/` | List employees (paginated, filterable) | `useEmployees` in `src/services/employees.ts` | Integrated |
| GET | `/api/v1/employees/{employee_id}` | Get employee detail with competency summary | `fetchEmployeeDetail` in `src/services/employeeDetail.ts` | Integrated |
| PATCH | `/api/v1/employees/{employee_id}` | Update employee | `api.patch("/employees/{id}")` in `EmployeeFormModal.tsx` | Integrated |
| DELETE | `/api/v1/employees/{employee_id}` | Soft-delete employee | `api.delete("/employees/{id}")` in `EmployeesPage.tsx` | Integrated |

**Query params for List Employees:** `page`, `page_size`, `role_id`, `department`, `is_active`, `search`

---

## Roles

| Method | Endpoint | Summary | Service / Hook | Status |
|--------|----------|---------|----------------|--------|
| POST | `/api/v1/roles/` | Create role | `useCreateRole` in `src/services/roles.ts` | Integrated |
| GET | `/api/v1/roles/` | List roles (paginated, searchable) | `useRolesPaginated` in `src/services/roles.ts` | Integrated |
| GET | `/api/v1/roles/{role_id}` | Get role detail | `useRoleDetail` in `src/services/roles.ts` | Integrated |
| PATCH | `/api/v1/roles/{role_id}` | Update role | `useUpdateRole` in `src/services/roles.ts` | Integrated |
| DELETE | `/api/v1/roles/{role_id}` | Delete role | `useDeleteRole` in `src/services/roles.ts` | Integrated |

**Query params for List Roles:** `page`, `page_size`, `search`

---

## Competencies

| Method | Endpoint | Summary | Service / Hook | Status |
|--------|----------|---------|----------------|--------|
| POST | `/api/v1/competencies/` | Create competency | `useCreateCompetency` in `src/services/competencies.ts` | Integrated |
| GET | `/api/v1/competencies/` | List competencies (paginated, filterable) | `useCompetenciesPaginated` in `src/services/competencies.ts` | Integrated |
| GET | `/api/v1/competencies/{competency_id}` | Get competency detail | — | Not integrated |
| PATCH | `/api/v1/competencies/{competency_id}` | Update competency | `useUpdateCompetency` in `src/services/competencies.ts` | Integrated |
| DELETE | `/api/v1/competencies/{competency_id}` | Delete competency | `useDeleteCompetency` in `src/services/competencies.ts` | Integrated |

**Query params for List Competencies:** `page`, `page_size`, `search`, `category`, `is_safety_critical`

---

## Assessments

| Method | Endpoint | Summary | Service / Hook | Status |
|--------|----------|---------|----------------|--------|
| POST | `/api/v1/assessments/` | Create assessment | `useCreateAssessment` in `src/services/assessments.ts` | Integrated |
| GET | `/api/v1/assessments/` | List assessments (paginated, filterable) | `useAssessments` in `src/services/assessments.ts` | Integrated |
| POST | `/api/v1/assessments/bulk` | Create multiple assessments at once | — | Not integrated |
| GET | `/api/v1/assessments/{assessment_id}` | Get assessment detail | — | Not integrated |
| PATCH | `/api/v1/assessments/{assessment_id}` | Update assessment | `useUpdateAssessment` in `src/services/assessments.ts` | Integrated |
| DELETE | `/api/v1/assessments/{assessment_id}` | Delete assessment | `useDeleteAssessment` in `src/services/assessments.ts` | Integrated |

**Query params for List Assessments:** `page`, `page_size`, `employee_id`, `competency_id`

---

## Analytics

| Method | Endpoint | Summary | Service / Hook | Status |
|--------|----------|---------|----------------|--------|
| GET | `/api/v1/analytics/gap-analysis/{employee_id}` | Gap analysis for an employee | `useGapAnalysis` in `src/services/analytics.ts` | Integrated |
| GET | `/api/v1/analytics/role-readiness/{employee_id}` | Role readiness for an employee | — | Not integrated |
| GET | `/api/v1/analytics/dashboard-summary` | Dashboard summary stats | `fetchDashboardSummary` in `src/services/dashboard.ts` | Integrated |
| GET | `/api/v1/analytics/team-analysis` | Team analysis by department/manager | `useTeamAnalysis` in `src/services/analytics.ts` | Integrated |

**Notes:**
- `role-readiness` is currently integrated as a list of all roles (see `src/services/analytics.ts:146`), but the backend endpoint is per-employee — verify correct usage.

---

## AI Endpoints

| Method | Endpoint | Summary | Service / Hook | Status |
|--------|----------|---------|----------------|--------|
| POST | `/api/v1/ai/query` | Natural language query against system data | — | Not integrated |
| POST | `/api/v1/ai/insight` | Generate AI insight for employee | `generateAiInsight` in `src/services/employeeDetail.ts` | Integrated |
| POST | `/api/v1/ai/role-competency-suggestions` | Get AI-suggested competencies for a role | `useSuggestCompetencies` in `src/services/roles.ts` | Integrated |
| POST | `/api/v1/ai/competency-recommendations` | Get competency recommendations | — | Not integrated |
| POST | `/api/v1/ai/learning-paths` | Generate learning path for employee | — | Not integrated |
| POST | `/api/v1/ai/feedback-analysis` | Analyze assessment feedback | — | Not integrated |

---

## Health Check

| Method | Endpoint | Summary | Status |
|--------|----------|---------|--------|
| GET | `/api/v1/health` | Basic health check | Not integrated |
| GET | `/api/v1/health/detailed` | Health check with DB connectivity | Not integrated |

---

## Audit Logs

| Method | Endpoint | Summary | Service / Hook | Status |
|--------|----------|---------|----------------|--------|
| GET | `/api/v1/audit/logs` | List audit log entries (paginated, filterable) | `useAuditLogs` in `src/services/audit.ts` | Integrated (frontend-only) |

**Query params:** `page`, `page_size`, `entity_type`, `action`, `actor_id`, `start_date`, `end_date`, `search`

> **Note:** This is a frontend-only integration. The backend does not currently have an audit endpoint (`/audit/logs`). The service uses mock data. Once the backend implements this endpoint, update `fetchAuditLogs` in `src/services/audit.ts`.

---

## Summary

| Category | Total | Integrated | Not Integrated |
|----------|-------|------------|----------------|
| Authentication | 3 | 3 | 0 |
| Employees | 5 | 5 | 0 |
| Roles | 5 | 5 | 0 |
| Competencies | 5 | 4 | 1 |
| Assessments | 6 | 4 | 2 |
| Analytics | 4 | 3 | 1 |
| AI | 6 | 2 | 4 |
| Audit Logs | 1 | 1 | 0 |
| Health Check | 2 | 0 | 2 |
| **Total** | **37** | **27** | **10** |
