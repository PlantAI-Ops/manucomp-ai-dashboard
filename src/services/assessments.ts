import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "./api";

export interface AssessmentListItem {
  id: string;
  employee_id: string;
  employee_name: string;
  competency_id: string;
  competency_name: string;
  competency_category?: string;
  assessed_level: number;
  assessor_type: "self" | "supervisor" | "peer" | "external";
  assessor_id: string;
  assessor_name: string;
  notes: string | null;
  evidence: string | null;
  assessed_at: string;
}

export interface AssessmentPaginatedResponse {
  items: AssessmentListItem[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface AssessmentFilters {
  page: number;
  page_size: number;
  employee_id?: string;
  competency_id?: string;
}

export interface CreateAssessmentPayload {
  employee_id: string;
  competency_id: string;
  assessed_level: number;
  assessor_type: string;
  notes?: string;
  evidence?: string;
}

export interface UpdateAssessmentPayload {
  assessed_level?: number;
  notes?: string;
  evidence?: string;
}

// --- API calls ---

async function fetchAssessments(filters: AssessmentFilters): Promise<AssessmentPaginatedResponse> {
  const params: Record<string, string | number> = {
    page: filters.page,
    page_size: filters.page_size,
  };
  if (filters.employee_id) params.employee_id = filters.employee_id;
  if (filters.competency_id) params.competency_id = filters.competency_id;
  const { data } = await api.get<AssessmentPaginatedResponse>("/assessments", { params });
  return data;
}

async function createAssessment(payload: CreateAssessmentPayload) {
  const { data } = await api.post("/assessments", payload);
  return data;
}

async function updateAssessment(id: string, payload: UpdateAssessmentPayload) {
  const { data } = await api.patch(`/assessments/${id}`, payload);
  return data;
}

async function deleteAssessment(id: string) {
  await api.delete(`/assessments/${id}`);
}

// --- Mock data ---

const EMPLOYEE_NAMES = [
  "John Martinez", "Sarah Chen", "Mike Johnson", "Lisa Park", "David Brown",
  "Emily Wilson", "Carlos Rivera", "Amy Thompson", "James Lee", "Maria Garcia",
];

const COMPETENCY_NAMES = [
  "CNC Machine Operation", "Blueprint Reading", "Quality Inspection", "Welding (MIG/TIG)",
  "Safety Protocols", "Lean Manufacturing", "SPC Methods", "ISO 9001 Compliance",
  "Equipment Maintenance", "Team Leadership",
];

const CATEGORIES = ["technical", "technical", "technical", "technical", "safety", "process", "technical", "regulatory", "technical", "soft_skills"];
const ASSESSOR_TYPES: AssessmentListItem["assessor_type"][] = ["self", "supervisor", "peer", "external"];

export const MOCK_ASSESSMENTS: AssessmentListItem[] = Array.from({ length: 35 }, (_, i) => ({
  id: `asmt-${i + 1}`,
  employee_id: `emp-${(i % 10) + 1}`,
  employee_name: EMPLOYEE_NAMES[i % 10],
  competency_id: `comp-${(i % 10) + 1}`,
  competency_name: COMPETENCY_NAMES[i % 10],
  competency_category: CATEGORIES[i % 10],
  assessed_level: ((i * 3 + 2) % 6),
  assessor_type: ASSESSOR_TYPES[i % 4],
  assessor_id: `emp-${((i + 3) % 10) + 1}`,
  assessor_name: EMPLOYEE_NAMES[(i + 3) % 10],
  notes: i % 3 === 0 ? "Demonstrated strong practical knowledge during evaluation." : null,
  evidence: null,
  assessed_at: new Date(2025, (i % 12), 1 + (i % 28)).toISOString(),
}));

// --- Hooks ---

export function useAssessments(filters: AssessmentFilters) {
  return useQuery({
    queryKey: ["assessments", filters],
    queryFn: () => fetchAssessments(filters),
    retry: false,
  });
}

export function useEmployeeAssessments(employeeId: string) {
  return useQuery({
    queryKey: ["assessments", "employee", employeeId],
    queryFn: () => fetchAssessments({ employee_id: employeeId, page_size: 100 }),
    enabled: !!employeeId,
    retry: false,
  });
}

export function useCreateAssessment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateAssessmentPayload) => createAssessment(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["assessments"] }),
  });
}

export function useUpdateAssessment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateAssessmentPayload }) => updateAssessment(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["assessments"] }),
  });
}

export function useDeleteAssessment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteAssessment(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["assessments"] }),
  });
}
