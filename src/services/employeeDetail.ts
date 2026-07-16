import { useQuery } from "@tanstack/react-query";
import { isMockId } from "@/lib/utils";
import api from "./api";

export interface CompetencySummaryItem {
  competency_id: string;
  competency_name: string;
  category: string;
  required_level: number;
  assessed_level: number | null;
  gap: number;
  safety_critical: boolean;
}

export interface EmployeeCompetencyHistoryItem {
  competency_id: string;
  competency_name: string;
  category: string;
  is_safety_critical: boolean;
  latest_assessed_level: number | null;
  latest_assessment_id: string | null;
  latest_assessed_at: string | null;
  required_level: number | null;
  gap: number;
}

export interface EmployeeCompetencyHistoryResponse {
  employee_id: string;
  employee_name: string;
  role_name: string;
  department: string;
  assessments: unknown[];
  competencies: EmployeeCompetencyHistoryItem[];
  total_assessments: number;
}

export interface EmployeeDetail {
  id: string;
  employee_number: string;
  full_name: string;
  email: string;
  role_id: string;
  role_name: string | null;
  supervisor_id: string | null;
  supervisor_name: string | null;
  department: string;
  department_id: string | null;
  department_name?: string;
  hire_date: string;
  is_active: boolean;
  created_at: string;
  competency_summary: {
    total_required: number;
    assessed: number;
    gaps: number;
  };
  competencies: CompetencySummaryItem[];
}

export interface AssessmentRecord {
  id: string;
  competency_name: string;
  level: number;
  assessor_name: string;
  assessment_type: string;
  assessed_at: string;
  notes: string | null;
}

export interface AiInsightResponse {
  summary: string;
  recommendations: string[];
  priority_actions: { action: string; severity: "critical" | "high" | "medium" }[];
}

// --- Mock data ---

const COMPETENCY_NAMES = [
  "CNC Programming", "Blueprint Reading", "GD&T", "5-Axis Machining",
  "Quality Inspection", "SPC Analysis", "Welding - MIG", "Welding - TIG",
  "Lockout/Tagout", "Forklift Operation", "Lean Manufacturing", "ISO 9001",
];
const CATEGORIES = ["Technical", "Technical", "Technical", "Technical", "Quality", "Quality", "Welding", "Welding", "Safety", "Safety", "Process", "Process"];

export function buildMockEmployeeDetail(id: string): EmployeeDetail {
  const idx = parseInt(id.replace("emp-", ""), 10) - 1;
  const DEPARTMENTS = ["Assembly", "Quality", "Welding", "CNC", "Maintenance", "Safety"];
  const ROLES = ["CNC Operator", "Quality Inspector", "Welder", "Assembly Tech", "Maintenance Tech", "Safety Officer"];
  const NAMES = [
    "John Martinez", "Sarah Chen", "Mike Johnson", "Lisa Park", "David Brown",
    "Emily Wilson", "Carlos Rivera", "Amy Thompson", "James Lee", "Maria Garcia",
  ];

  const name = NAMES[idx % NAMES.length] || "Employee";
  const competencies: CompetencySummaryItem[] = COMPETENCY_NAMES.map((c, i) => {
    const required = Math.floor(Math.random() * 3) + 3;
    const assessed = Math.random() > 0.2 ? Math.floor(Math.random() * 5) + 1 : null;
    return {
      competency_id: `comp-${i + 1}`,
      competency_name: c,
      category: CATEGORIES[i],
      required_level: required,
      assessed_level: assessed,
      gap: assessed !== null ? Math.max(0, required - assessed) : required,
      safety_critical: i === 8 || i === 9,
    };
  });

  const assessed = competencies.filter((c) => c.assessed_level !== null).length;
  const gaps = competencies.filter((c) => c.gap > 0).length;
  const readiness = Math.round(((competencies.length - gaps) / competencies.length) * 100);

  return {
    id,
    employee_number: `MFG-${String(1001 + idx).padStart(4, "0")}`,
    full_name: name,
    email: `emp${idx + 1}@manucomp.io`,
    role_id: `role-${(idx % 6) + 1}`,
    role_name: ROLES[idx % 6],
    supervisor_id: idx > 0 ? "emp-1" : null,
    supervisor_name: idx > 0 ? NAMES[0] : null,
    department: DEPARTMENTS[idx % 6],
    department_id: `dept-${(idx % 6) + 1}`,
    hire_date: new Date(2020 + Math.floor(idx / 12), idx % 12, 1 + (idx % 28)).toISOString().split("T")[0],
    is_active: idx % 9 !== 0,
    created_at: new Date().toISOString(),
    competency_summary: { total_required: competencies.length, assessed, gaps, readiness_percentage: readiness },
    competencies,
  };
}

export function buildMockAssessments(employeeId: string): AssessmentRecord[] {
  const types = ["Initial", "Annual", "Spot Check", "Re-assessment"];
  const assessors = ["John Martinez", "Sarah Chen", "Admin User"];
  return Array.from({ length: 8 }, (_, i) => ({
    id: `assess-${i + 1}`,
    competency_name: COMPETENCY_NAMES[i % COMPETENCY_NAMES.length],
    level: Math.floor(Math.random() * 4) + 2,
    assessor_name: assessors[i % assessors.length],
    assessment_type: types[i % types.length],
    assessed_at: new Date(2024, i, 10 + i).toISOString(),
    notes: i % 3 === 0 ? "Performed well under supervision" : null,
  }));
}

export function buildMockEmployeeCompetencyHistory(
  employeeId: string
): EmployeeCompetencyHistoryResponse {
  const idx = parseInt(employeeId.replace("emp-", ""), 10) - 1;
  const NAMES = [
    "John Martinez", "Sarah Chen", "Mike Johnson", "Lisa Park", "David Brown",
    "Emily Wilson", "Carlos Rivera", "Amy Thompson", "James Lee", "Maria Garcia",
  ];
  const ROLES = ["CNC Operator", "Quality Inspector", "Welder", "Assembly Tech", "Maintenance Tech", "Safety Officer"];
  const DEPARTMENTS = ["Assembly", "Quality", "Welding", "CNC", "Maintenance", "Safety"];

  const competencies: EmployeeCompetencyHistoryItem[] = COMPETENCY_NAMES.map((c, i) => {
    const required = Math.floor(Math.random() * 3) + 3;
    const assessed = Math.random() > 0.2 ? Math.floor(Math.random() * 5) + 1 : null;
    const gap = assessed !== null ? Math.max(0, required - assessed) : required;
    return {
      competency_id: `comp-${i + 1}`,
      competency_name: c,
      category: CATEGORIES[i],
      is_safety_critical: i === 8 || i === 9,
      latest_assessed_level: assessed,
      latest_assessment_id: assessed ? `assess-${i + 1}` : null,
      latest_assessed_at: assessed ? new Date(2024, i % 12, 1 + (i % 28)).toISOString() : null,
      required_level: required,
      gap,
    };
  });

  const totalAssessments = competencies.filter((c) => c.latest_assessed_level !== null).length;

  return {
    employee_id: employeeId,
    employee_name: NAMES[idx % NAMES.length] || "Employee",
    role_name: ROLES[idx % 6],
    department: DEPARTMENTS[idx % 6],
    assessments: [],
    competencies,
    total_assessments: totalAssessments,
  };
}

export const MOCK_AI_INSIGHT: AiInsightResponse = {
  summary:
    "This employee shows strong technical aptitude in core machining competencies but has critical gaps in safety procedures that require immediate attention. Overall readiness is trending positively with consistent improvement over the past quarter.",
  recommendations: [
    "Enroll in advanced Lockout/Tagout certification program within 30 days",
    "Pair with senior welder for TIG welding mentorship (2 sessions/week)",
    "Schedule SPC Analysis refresher course for next quarter",
    "Consider cross-training in Quality Inspection to improve versatility",
  ],
  priority_actions: [
    { action: "Complete Lockout/Tagout safety certification — currently 3 levels below requirement", severity: "critical" },
    { action: "Address Welding - TIG gap before next production cycle", severity: "high" },
    { action: "Update Forklift Operation certification (expired)", severity: "high" },
  ],
};

// --- API hooks ---

export async function fetchEmployeeDetail(id: string): Promise<EmployeeDetail> {
  const { data } = await api.get<EmployeeDetail>(`/employees/${id}`);
  return data;
}

export async function fetchAssessments(employeeId: string): Promise<AssessmentRecord[]> {
  const { data } = await api.get<EmployeeCompetencyHistoryResponse>(
    `/assessments/employee/${employeeId}/history`
  );
  // Transform the history endpoint response to AssessmentRecord[]
  return (data.assessments ?? []).map((a: Record<string, unknown>) => ({
    id: String(a.id ?? a.assessment_id ?? ""),
    competency_name: String(a.competency_name ?? a.competency ?? ""),
    level: Number(a.level ?? a.assessed_level ?? 0),
    assessor_name: String(a.assessor_name ?? a.assessor ?? ""),
    assessment_type: String(a.assessment_type ?? a.type ?? "Assessment"),
    assessed_at: String(a.assessed_at ?? a.date ?? ""),
    notes: a.notes ?? null,
  }));
}

export async function generateAiInsight(employeeId: string): Promise<AiInsightResponse> {
  const { data } = await api.post<AiInsightResponse>("/ai/insight", { employee_id: employeeId });

  // Normalize priority_actions: backend returns strings, frontend expects objects
  const normalizedPriorityActions = (data.priority_actions ?? []).map((item) => {
    if (typeof item === "string") {
      // Infer severity from keywords in the action text
      const lower = item.toLowerCase();
      const severity: "critical" | "high" | "medium" =
        lower.includes("critical") || lower.includes("immediate")
          ? "critical"
          : lower.includes("high") || lower.includes("urgent")
            ? "high"
            : "medium";
      return { action: item, severity };
    }
    return item as { action: string; severity: "critical" | "high" | "medium" };
  });

  return {
    summary: data.summary ?? "",
    recommendations: data.recommendations ?? [],
    priority_actions: normalizedPriorityActions,
  };
}

export async function fetchEmployeeCompetencyHistory(
  employeeId: string
): Promise<EmployeeCompetencyHistoryResponse> {
  const { data } = await api.get<EmployeeCompetencyHistoryResponse>(
    `/assessments/employee/${employeeId}/history`
  );
  return data;
}

export function useEmployeeCompetencyHistory(employeeId: string) {
  const query = useQuery({
    queryKey: ["employee-competency-history", employeeId],
    queryFn: () => fetchEmployeeCompetencyHistory(employeeId),
    enabled: !isMockId(employeeId),
    retry: false,
    throwOnError: false,
  });

  return {
    ...query,
    isMock: isMockId(employeeId),
  };
}

export function useAssessments(employeeId: string) {
  const query = useQuery({
    queryKey: ["assessments", employeeId],
    queryFn: () => fetchAssessments(employeeId),
    enabled: !isMockId(employeeId),
    retry: false,
  });

  return {
    ...query,
    isMock: isMockId(employeeId),
  };
}

export function useEmployeeDetail(id: string) {
  const query = useQuery({
    queryKey: ["employee-detail", id],
    queryFn: () => fetchEmployeeDetail(id),
    enabled: !isMockId(id),
    retry: false,
  });

  return {
    ...query,
    isMock: isMockId(id),
  };
}

export function useEmployeeDetailWithHistory(id: string) {
  const detailQuery = useQuery({
    queryKey: ["employee-detail", id],
    queryFn: () => fetchEmployeeDetail(id),
    enabled: !isMockId(id),
    retry: false,
  });

  const historyQuery = useQuery({
    queryKey: ["employee-competency-history", id],
    queryFn: () => fetchEmployeeCompetencyHistory(id),
    enabled: !isMockId(id),
    retry: false,
    throwOnError: false,
  });

  const mergedData = detailQuery.data && historyQuery.data
    ? {
        ...detailQuery.data,
        competencies: historyQuery.data.competencies.map((c) => ({
          competency_id: c.competency_id,
          competency_name: c.competency_name,
          category: c.category,
          required_level: c.required_level ?? 0,
          assessed_level: c.latest_assessed_level,
          gap: c.gap,
          safety_critical: c.is_safety_critical,
        })),
      }
    : detailQuery.data;

  return {
    ...detailQuery,
    data: mergedData,
    isMock: isMockId(id),
    isLoading: detailQuery.isLoading || historyQuery.isLoading,
    isError: detailQuery.isError || historyQuery.isError,
  };
}
