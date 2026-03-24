import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "./api";

export interface CompetencyItem {
  id: string;
  name: string;
  description: string;
  category: "technical" | "soft_skills" | "safety" | "regulatory" | "process";
  is_safety_critical: boolean;
  detailed_description: string | null;
  best_practices: string | null;
  common_mistakes: string | null;
  created_at: string;
}

export interface CompetencyPaginatedResponse {
  items: CompetencyItem[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface CompetencyFormData {
  name: string;
  description: string;
  category: string;
  is_safety_critical: boolean;
  detailed_description?: string | null;
  best_practices?: string | null;
  common_mistakes?: string | null;
}

// ── Mock data ──

const MOCK_COMPETENCIES: CompetencyItem[] = [
  { id: "c1", name: "CNC Machine Operation", description: "Ability to set up and operate CNC milling and turning machines", category: "technical", is_safety_critical: true, detailed_description: null, best_practices: null, common_mistakes: null, created_at: "2024-01-10T08:00:00Z" },
  { id: "c2", name: "Quality Inspection", description: "Perform dimensional and visual quality checks using precision instruments", category: "technical", is_safety_critical: false, detailed_description: null, best_practices: null, common_mistakes: null, created_at: "2024-01-12T08:00:00Z" },
  { id: "c3", name: "Lockout/Tagout Procedures", description: "Safely de-energize and isolate equipment for maintenance", category: "safety", is_safety_critical: true, detailed_description: null, best_practices: null, common_mistakes: null, created_at: "2024-01-15T08:00:00Z" },
  { id: "c4", name: "Team Leadership", description: "Lead and motivate cross-functional manufacturing teams", category: "soft_skills", is_safety_critical: false, detailed_description: null, best_practices: null, common_mistakes: null, created_at: "2024-02-01T08:00:00Z" },
  { id: "c5", name: "ISO 9001 Compliance", description: "Ensure manufacturing processes meet ISO 9001 quality management standards", category: "regulatory", is_safety_critical: false, detailed_description: null, best_practices: null, common_mistakes: null, created_at: "2024-02-10T08:00:00Z" },
  { id: "c6", name: "Lean Manufacturing", description: "Apply lean principles to eliminate waste and improve efficiency", category: "process", is_safety_critical: false, detailed_description: null, best_practices: null, common_mistakes: null, created_at: "2024-02-15T08:00:00Z" },
  { id: "c7", name: "Welding (MIG/TIG)", description: "Perform MIG and TIG welding on steel and aluminum components", category: "technical", is_safety_critical: true, detailed_description: null, best_practices: null, common_mistakes: null, created_at: "2024-03-01T08:00:00Z" },
  { id: "c8", name: "Hazardous Material Handling", description: "Properly handle, store, and dispose of hazardous chemicals", category: "safety", is_safety_critical: true, detailed_description: null, best_practices: null, common_mistakes: null, created_at: "2024-03-05T08:00:00Z" },
  { id: "c9", name: "Problem Solving", description: "Analyze root causes and develop effective solutions using 8D methodology", category: "soft_skills", is_safety_critical: false, detailed_description: null, best_practices: null, common_mistakes: null, created_at: "2024-03-10T08:00:00Z" },
  { id: "c10", name: "Statistical Process Control", description: "Monitor and control manufacturing processes using SPC tools", category: "process", is_safety_critical: false, detailed_description: null, best_practices: null, common_mistakes: null, created_at: "2024-03-15T08:00:00Z" },
  { id: "c11", name: "OSHA Regulations", description: "Understanding and compliance with OSHA workplace safety regulations", category: "regulatory", is_safety_critical: true, detailed_description: null, best_practices: null, common_mistakes: null, created_at: "2024-03-20T08:00:00Z" },
  { id: "c12", name: "Blueprint Reading", description: "Interpret engineering drawings, GD&T symbols, and technical specifications", category: "technical", is_safety_critical: false, detailed_description: null, best_practices: null, common_mistakes: null, created_at: "2024-04-01T08:00:00Z" },
];

function mockPaginate(items: CompetencyItem[], page: number, pageSize: number, search?: string, category?: string, safetyCritical?: boolean): CompetencyPaginatedResponse {
  let filtered = items;
  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter(c => c.name.toLowerCase().includes(q) || c.description.toLowerCase().includes(q));
  }
  if (category) filtered = filtered.filter(c => c.category === category);
  if (safetyCritical) filtered = filtered.filter(c => c.is_safety_critical);
  const total = filtered.length;
  const start = (page - 1) * pageSize;
  return { items: filtered.slice(start, start + pageSize), total, page, page_size: pageSize, total_pages: Math.ceil(total / pageSize) };
}

// ── Hooks ──

export function useCompetenciesPaginated(page: number, pageSize: number, search?: string, category?: string, safetyCritical?: boolean) {
  return useQuery({
    queryKey: ["competencies", page, pageSize, search, category, safetyCritical],
    queryFn: async () => {
      try {
        const params: Record<string, any> = { page, page_size: pageSize };
        if (search) params.search = search;
        if (category) params.category = category;
        const { data } = await api.get<CompetencyPaginatedResponse>("/competencies", { params });
        return data;
      } catch {
        return mockPaginate(MOCK_COMPETENCIES, page, pageSize, search, category, safetyCritical);
      }
    },
  });
}

export function useCreateCompetency() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: CompetencyFormData) => {
      const { data } = await api.post("/competencies", body);
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["competencies"] }),
  });
}

export function useUpdateCompetency() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, body }: { id: string; body: Partial<CompetencyFormData> }) => {
      const { data } = await api.patch(`/competencies/${id}`, body);
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["competencies"] }),
  });
}

export function useDeleteCompetency() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/competencies/${id}`);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["competencies"] }),
  });
}
