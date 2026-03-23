import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "./api";

export interface CompetencyRequirement {
  competency_id: string;
  competency_name: string;
  required_level: number;
  is_mandatory: boolean;
}

export interface RoleListItem {
  id: string;
  name: string;
  description: string;
  department: string | null;
  competency_requirements: CompetencyRequirement[];
  created_at: string;
}

export interface RolePaginatedResponse {
  items: RoleListItem[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface RoleFilters {
  page: number;
  page_size: number;
  search?: string;
}

export interface RoleFormData {
  name: string;
  description: string;
  department?: string;
  competency_requirements: {
    competency_id: string;
    required_level: number;
    is_mandatory: boolean;
  }[];
}

export interface CompetencyOption {
  id: string;
  name: string;
  category: string;
}

export interface CompetencySuggestion {
  name: string;
  description: string;
  category: string;
  confidence: number;
  reasoning: string;
}

// API calls
async function fetchRolesPaginated(filters: RoleFilters): Promise<RolePaginatedResponse> {
  const params: Record<string, string | number> = {
    page: filters.page,
    page_size: filters.page_size,
  };
  if (filters.search) params.search = filters.search;
  const { data } = await api.get<RolePaginatedResponse>("/roles", { params });
  return data;
}

async function fetchCompetencies(): Promise<CompetencyOption[]> {
  const { data } = await api.get<{ items: CompetencyOption[] }>("/competencies", { params: { page_size: 100 } });
  return data.items;
}

async function createRole(body: RoleFormData) {
  const { data } = await api.post("/roles", body);
  return data;
}

async function updateRole(id: string, body: Partial<RoleFormData>) {
  const { data } = await api.patch(`/roles/${id}`, body);
  return data;
}

async function deleteRole(id: string) {
  await api.delete(`/roles/${id}`);
}

async function suggestCompetencies(body: { role_name: string; role_description: string; department: string }): Promise<CompetencySuggestion[]> {
  const { data } = await api.post<CompetencySuggestion[]>("/ai/role-competency-suggestions", body);
  return data;
}

// Mock data
const MOCK_COMPETENCIES: CompetencyOption[] = [
  { id: "comp-1", name: "CNC Programming", category: "Technical" },
  { id: "comp-2", name: "Blueprint Reading", category: "Technical" },
  { id: "comp-3", name: "Quality Inspection", category: "Quality" },
  { id: "comp-4", name: "Safety Protocols", category: "Safety" },
  { id: "comp-5", name: "Welding (MIG/TIG)", category: "Technical" },
  { id: "comp-6", name: "Electrical Systems", category: "Technical" },
  { id: "comp-7", name: "Hydraulic Systems", category: "Mechanical" },
  { id: "comp-8", name: "PLC Programming", category: "Automation" },
  { id: "comp-9", name: "Lean Manufacturing", category: "Process" },
  { id: "comp-10", name: "Statistical Process Control", category: "Quality" },
  { id: "comp-11", name: "Lockout/Tagout", category: "Safety" },
  { id: "comp-12", name: "Forklift Operation", category: "Operations" },
];

const DEPARTMENTS = ["Assembly", "Quality", "Welding", "CNC", "Maintenance", "Safety"];

export const MOCK_ROLES: RoleListItem[] = [
  {
    id: "role-1", name: "CNC Operator", description: "Operates CNC machines for precision manufacturing of metal components. Requires programming and setup skills.", department: "CNC",
    competency_requirements: [
      { competency_id: "comp-1", competency_name: "CNC Programming", required_level: 4, is_mandatory: true },
      { competency_id: "comp-2", competency_name: "Blueprint Reading", required_level: 3, is_mandatory: true },
      { competency_id: "comp-4", competency_name: "Safety Protocols", required_level: 3, is_mandatory: true },
    ],
    created_at: "2024-01-15T10:00:00Z",
  },
  {
    id: "role-2", name: "Quality Inspector", description: "Inspects manufactured parts and assemblies to ensure they meet quality standards and specifications.", department: "Quality",
    competency_requirements: [
      { competency_id: "comp-3", competency_name: "Quality Inspection", required_level: 5, is_mandatory: true },
      { competency_id: "comp-10", competency_name: "Statistical Process Control", required_level: 4, is_mandatory: true },
      { competency_id: "comp-2", competency_name: "Blueprint Reading", required_level: 4, is_mandatory: true },
    ],
    created_at: "2024-01-20T10:00:00Z",
  },
  {
    id: "role-3", name: "Welder", description: "Performs MIG and TIG welding operations on structural and precision assemblies.", department: "Welding",
    competency_requirements: [
      { competency_id: "comp-5", competency_name: "Welding (MIG/TIG)", required_level: 4, is_mandatory: true },
      { competency_id: "comp-2", competency_name: "Blueprint Reading", required_level: 3, is_mandatory: true },
      { competency_id: "comp-4", competency_name: "Safety Protocols", required_level: 4, is_mandatory: true },
    ],
    created_at: "2024-02-01T10:00:00Z",
  },
  {
    id: "role-4", name: "Assembly Technician", description: "Assembles mechanical and electrical components according to work instructions and specifications.", department: "Assembly",
    competency_requirements: [
      { competency_id: "comp-2", competency_name: "Blueprint Reading", required_level: 3, is_mandatory: true },
      { competency_id: "comp-6", competency_name: "Electrical Systems", required_level: 2, is_mandatory: false },
      { competency_id: "comp-4", competency_name: "Safety Protocols", required_level: 3, is_mandatory: true },
    ],
    created_at: "2024-02-10T10:00:00Z",
  },
  {
    id: "role-5", name: "Maintenance Technician", description: "Performs preventive and corrective maintenance on manufacturing equipment and facilities.", department: "Maintenance",
    competency_requirements: [
      { competency_id: "comp-6", competency_name: "Electrical Systems", required_level: 4, is_mandatory: true },
      { competency_id: "comp-7", competency_name: "Hydraulic Systems", required_level: 3, is_mandatory: true },
      { competency_id: "comp-8", competency_name: "PLC Programming", required_level: 3, is_mandatory: false },
      { competency_id: "comp-11", competency_name: "Lockout/Tagout", required_level: 5, is_mandatory: true },
    ],
    created_at: "2024-02-15T10:00:00Z",
  },
  {
    id: "role-6", name: "Safety Officer", description: "Oversees workplace safety compliance, conducts audits, and develops safety training programs.", department: "Safety",
    competency_requirements: [
      { competency_id: "comp-4", competency_name: "Safety Protocols", required_level: 5, is_mandatory: true },
      { competency_id: "comp-11", competency_name: "Lockout/Tagout", required_level: 5, is_mandatory: true },
      { competency_id: "comp-9", competency_name: "Lean Manufacturing", required_level: 2, is_mandatory: false },
    ],
    created_at: "2024-03-01T10:00:00Z",
  },
];

// Hooks
export function useRolesPaginated(filters: RoleFilters) {
  return useQuery({
    queryKey: ["roles-paginated", filters],
    queryFn: () => fetchRolesPaginated(filters),
    retry: false,
  });
}

export function useCompetencyOptions() {
  return useQuery({
    queryKey: ["competency-options"],
    queryFn: fetchCompetencies,
    retry: false,
  });
}

export function useCreateRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createRole,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["roles-paginated"] }),
  });
}

export function useUpdateRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<RoleFormData> }) => updateRole(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["roles-paginated"] }),
  });
}

export function useDeleteRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteRole,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["roles-paginated"] }),
  });
}

export function useSuggestCompetencies() {
  return useMutation({ mutationFn: suggestCompetencies });
}

export { MOCK_COMPETENCIES, DEPARTMENTS };
