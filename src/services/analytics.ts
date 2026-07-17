import { useQuery } from "@tanstack/react-query";
import { isMockId } from "@/lib/utils";
import api from "./api";

// --- Gap Analysis ---
export interface GapItem {
  competency_id: string;
  competency_name: string;
  category: string;
  is_safety_critical: boolean;
  required_level: number;
  actual_level: number;
  gap: number;
  severity: "low" | "medium" | "high" | "critical";
}

export interface GapAnalysis {
  employee_id: string;
  employee_name: string;
  role_name: string;
  gaps: GapItem[];
  critical_gaps: number;
  high_gaps: number;
  total_gaps: number;
  readiness_percentage: number;
}

// --- Role Readiness ---
export interface RoleReadinessItem {
  role_id: string;
  role_name: string;
  department: string;
  total_employees: number;
  fully_qualified: number;
  partially_qualified: number;
  unqualified: number;
  average_readiness: number;
}

// --- Dashboard Summary ---
export interface DashboardSummary {
  total_employees: number;
  total_roles: number;
  total_competencies: number;
  assessed_employees: number;
  assessment_percentage: number;
  critical_gaps: number;
  role_readiness: RoleReadinessItem[];
  top_skill_gaps: Array<Record<string, unknown>>;
}

// --- Team Analysis ---
export interface TeamMemberGap {
  competency_id: string;
  competency_name: string;
  category: string;
  is_safety_critical: boolean;
  required_level: number;
  actual_level: number;
  gap: number;
  severity: "low" | "medium" | "high" | "critical";
}

export interface TeamMember {
  employee_id: string;
  employee_name: string;
  role_name: string;
  gaps: TeamMemberGap[];
  critical_gaps: number;
  high_gaps: number;
  total_gaps: number;
  readiness_percentage: number;
}

export interface TeamAnalysis {
  supervisor_id: string | null;
  supervisor_name: string;
  team_size: number;
  team_readiness: number;
  members: TeamMember[];
}

// --- AI Org Insights ---
export interface ReadinessSummary {
  role_id: string;
  role_name: string;
  total_employees: number;
  readiness_percentage: number;
  status_summary: string;
  fully_qualified?: number;
  partially_qualified?: number;
  unqualified?: number;
}

export interface TrainingRecommendation {
  title: string;
  description: string;
  target_gaps: string[];
  priority: "high" | "medium" | "low";
  estimated_impact: string;
  category: string;
}

export interface CompetencyTrends {
  category_distribution: Record<string, { total: number; assessed: number; avg_level: number }>;
  safety_critical_stats: { total: number; assessed: number };
  total_competencies: number;
  total_assessments: number;
}

export interface WorkforceReadinessReport {
  status: "critical" | "warning" | "good";
  readiness_score: number;
  critical_gaps: number;
  executive_summary: string;
}

export interface CriticalGapDetail {
  employee_name: string;
  competency_name: string;
  gap?: number;
  gap_level?: number;
  gap_size?: number;
  level_gap?: number;
  severity: "critical" | "high";
  role_name?: string;
}

export interface AiOrgInsightsResponse {
  workforce_summary: string;
  top_gap_analysis: string;
  readiness_summaries: ReadinessSummary[];
  training_recommendations: TrainingRecommendation[];
  workforce_readiness_report: WorkforceReadinessReport;
  competency_trends: CompetencyTrends;
  critical_gap_details?: CriticalGapDetail[];
  high_gap_details?: CriticalGapDetail[];
}

// --- Mock Data ---

const NAMES = [
  "John Martinez", "Sarah Chen", "Mike Johnson", "Lisa Park", "David Brown",
  "Emily Wilson", "Carlos Rivera", "Amy Thompson", "James Lee", "Maria Garcia",
];

export function buildMockGapAnalysis(employeeId: string): GapAnalysis {
  const idx = parseInt(employeeId.replace("emp-", ""), 10) - 1;
  const name = NAMES[idx % NAMES.length] || "Employee";
  const ROLES = ["CNC Operator", "Quality Inspector", "Welder", "Assembly Tech", "Maintenance Tech", "Safety Officer"];

  const competencies = [
    { name: "CNC Programming", cat: "technical", safety: false },
    { name: "Blueprint Reading", cat: "technical", safety: false },
    { name: "Quality Inspection", cat: "technical", safety: false },
    { name: "Welding (MIG/TIG)", cat: "technical", safety: false },
    { name: "Safety Protocols", cat: "safety", safety: true },
    { name: "Lockout/Tagout", cat: "safety", safety: true },
    { name: "Lean Manufacturing", cat: "process", safety: false },
    { name: "SPC Methods", cat: "technical", safety: false },
  ];

  const gaps: GapItem[] = competencies.map((c, i) => {
    const required = 3 + (i % 3);
    const actual = Math.max(0, required - ((i + idx) % 4));
    const gap = Math.max(0, required - actual);
    const severity: GapItem["severity"] =
      gap >= 3 ? "critical" : gap === 2 ? "high" : gap === 1 ? "medium" : "low";
    return {
      competency_id: `comp-${i + 1}`,
      competency_name: c.name,
      category: c.cat,
      is_safety_critical: c.safety,
      required_level: required,
      actual_level: actual,
      gap,
      severity,
    };
  });

  const withGaps = gaps.filter((g) => g.gap > 0);
  const critical = gaps.filter((g) => g.severity === "critical").length;
  const high = gaps.filter((g) => g.severity === "high").length;
  const readiness = Math.round(((gaps.length - withGaps.length) / gaps.length) * 100);

  return {
    employee_id: employeeId,
    employee_name: name,
    role_name: ROLES[idx % 6],
    gaps,
    critical_gaps: critical,
    high_gaps: high,
    total_gaps: withGaps.length,
    readiness_percentage: readiness,
  };
}

export const MOCK_ROLE_READINESS: RoleReadinessItem[] = [
  { role_id: "role-1", role_name: "CNC Operator", department: "CNC", total_employees: 42, fully_qualified: 28, partially_qualified: 10, unqualified: 4, average_readiness: 78 },
  { role_id: "role-2", role_name: "Quality Inspector", department: "Quality", total_employees: 18, fully_qualified: 12, partially_qualified: 4, unqualified: 2, average_readiness: 82 },
  { role_id: "role-3", role_name: "Welder", department: "Welding", total_employees: 35, fully_qualified: 20, partially_qualified: 9, unqualified: 6, average_readiness: 68 },
  { role_id: "role-4", role_name: "Assembly Tech", department: "Assembly", total_employees: 50, fully_qualified: 35, partially_qualified: 10, unqualified: 5, average_readiness: 75 },
  { role_id: "role-5", role_name: "Maintenance Tech", department: "Maintenance", total_employees: 22, fully_qualified: 10, partially_qualified: 7, unqualified: 5, average_readiness: 60 },
  { role_id: "role-6", role_name: "Safety Officer", department: "Safety", total_employees: 8, fully_qualified: 6, partially_qualified: 1, unqualified: 1, average_readiness: 85 },
];

export function buildMockAiOrgInsights(): AiOrgInsightsResponse {
  return {
    workforce_summary:
      "## Workforce Overview\n\nYour organization has **225 employees** across 6 roles. Overall readiness is at **74%**, with technical competencies leading at 78% and process competencies trailing at 65%.\n\n- 142 employees fully qualified\n- 58 employees partially qualified\n- 25 employees with significant gaps",
    top_gap_analysis:
      "## Critical Skill Gaps\n\n1. **Welding (MIG/TIG)** — 15 employees below required level (safety-adjacent)\n2. **Safety Protocols** — 8 employees below required level (safety-critical)\n3. **Lean Manufacturing** — 12 employees below required level\n4. **SPC Methods** — 9 employees below required level",
    readiness_summaries: MOCK_ROLE_READINESS.map((r) => ({
      role_id: r.role_id,
      role_name: r.role_name,
      total_employees: r.total_employees,
      readiness_percentage: r.average_readiness,
      status_summary:
        r.average_readiness >= 80
          ? "Strong performance; minor upskilling recommended."
          : r.average_readiness >= 60
            ? "Moderate readiness; targeted training advised."
            : "Critical gaps; immediate intervention required.",
    })),
    training_recommendations: [
      {
        title: "Advanced Welding Certification",
        description: "Structured 40-hour program for welders below level 3, focused on MIG/TIG techniques and code compliance.",
        target_gaps: ["Welding (MIG/TIG)"],
        priority: "high",
        estimated_impact: "Reduces critical gaps by ~40%",
        category: "technical",
      },
      {
        title: "Safety Protocol Refresher",
        description: "Mandatory safety training covering lockout/tagout and emergency response procedures.",
        target_gaps: ["Safety Protocols", "Lockout/Tagout"],
        priority: "high",
        estimated_impact: "Closes 100% of safety-critical gaps",
        category: "safety",
      },
      {
        title: "Lean Manufacturing Foundations",
        description: "Introductory workshop on 5S, waste reduction, and continuous improvement.",
        target_gaps: ["Lean Manufacturing"],
        priority: "medium",
        estimated_impact: "Improves process readiness by ~15%",
        category: "process",
      },
      {
        title: "SPC Methods Workshop",
        description: "Statistical process control techniques for quality inspectors and line leads.",
        target_gaps: ["SPC Methods"],
        priority: "medium",
        estimated_impact: "Improves quality KPIs by ~20%",
        category: "technical",
      },
    ],
    workforce_readiness_report: {
      status: "warning",
      readiness_score: 74,
      critical_gaps: 23,
      executive_summary:
        "## Executive Summary\n\nThe organization shows **moderate readiness** (74%). Two roles — Maintenance Tech (60%) and Welder (68%) — fall below the 70% threshold and should be prioritized.\n\n**Recommended actions:**\n1. Launch the Advanced Welding Certification within 30 days\n2. Complete the Safety Protocol Refresher for all affected employees within 60 days\n3. Reassess readiness in Q+1 to measure training impact",
    },
    competency_trends: {
      category_distribution: {
        technical: { total: 8, assessed: 145, avg_level: 3.2 },
        safety: { total: 2, assessed: 98, avg_level: 3.8 },
        process: { total: 3, assessed: 87, avg_level: 2.9 },
        soft_skills: { total: 2, assessed: 110, avg_level: 3.5 },
      },
      safety_critical_stats: { total: 2, assessed: 98 },
      total_competencies: 15,
      total_assessments: 440,
    },
  };
}

export function buildMockTeamAnalysis(department: string): TeamAnalysis {
  const mockGaps: TeamMemberGap[] = [
    {
      competency_id: "69dac161dc384e94e41d9d45",
      competency_name: "Python Programming",
      category: "technical",
      is_safety_critical: false,
      required_level: 2,
      actual_level: 3,
      gap: 0,
      severity: "low",
    },
    {
      competency_id: "69dac161dc384e94e41d9d46",
      competency_name: "Communication Skills",
      category: "soft_skills",
      is_safety_critical: false,
      required_level: 2,
      actual_level: 0,
      gap: 2,
      severity: "high",
    },
    {
      competency_id: "69dac161dc384e94e41d9d4a",
      competency_name: "Teamwork",
      category: "soft_skills",
      is_safety_critical: false,
      required_level: 2,
      actual_level: 0,
      gap: 2,
      severity: "high",
    },
  ];

  const members: TeamMember[] = NAMES.slice(0, 5).map((name, i) => ({
    employee_id: `emp-${i + 1}`,
    employee_name: name,
    role_name: ["CNC Operator", "Quality Inspector", "Welder", "Assembly Tech", "Maintenance Tech"][i],
    gaps: mockGaps,
    critical_gaps: 0,
    high_gaps: 2,
    total_gaps: 2,
    readiness_percentage: 50,
  }));

  return {
    supervisor_id: null,
    supervisor_name: "Unknown",
    team_size: members.length,
    team_readiness: 50,
    members,
  };
}

// --- API + Hooks ---

async function fetchGapAnalysis(employeeId: string): Promise<GapAnalysis> {
  const { data } = await api.get<GapAnalysis>(`/analytics/gap-analysis/${employeeId}`);
  return data;
}

async function fetchDashboardSummary(): Promise<DashboardSummary> {
  const { data } = await api.get<DashboardSummary>("/analytics/dashboard-summary");
  return data;
}

async function fetchRoleReadiness(): Promise<RoleReadinessItem[]> {
  const [summary, rolesRes] = await Promise.all([
    fetchDashboardSummary(),
    api.get<{ items: { id: string; name: string; department: string }[] }>("/roles", { params: { page_size: 100 } }),
  ]);
  const roleDeptMap = new Map(rolesRes.data.items.map(r => [r.id, r.department]));
  return (summary.role_readiness || []).map(r => ({
    ...r,
    department: roleDeptMap.get(r.role_id) || "Unknown",
  }));
}

async function fetchTeamAnalysis(params: { manager_id?: string; department?: string }): Promise<TeamAnalysis> {
  const { data } = await api.get<TeamAnalysis>("/analytics/team-analysis", { params });
  return data;
}

async function fetchAiOrgInsights(): Promise<AiOrgInsightsResponse> {
  const { data } = await api.get<AiOrgInsightsResponse>("/ai/org-insights", { timeout: 120_000 });
  return data;
}

export function useAiOrgInsights(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ["ai-org-insights"],
    queryFn: fetchAiOrgInsights,
    retry: false,
    throwOnError: false,
    enabled: options?.enabled ?? true,
  });
}

export function useGapAnalysis(employeeId: string | undefined) {
  const query = useQuery({
    queryKey: ["gap-analysis", employeeId],
    queryFn: () => fetchGapAnalysis(employeeId!),
    enabled: !!employeeId && !isMockId(employeeId),
    retry: false,
  });

  return {
    ...query,
    isMock: isMockId(employeeId ?? ""),
  };
}

export function useRoleReadiness() {
  return useQuery({
    queryKey: ["role-readiness"],
    queryFn: fetchRoleReadiness,
    retry: false,
  });
}

export function useTeamAnalysis(params: { manager_id?: string; department?: string }) {
  return useQuery({
    queryKey: ["team-analysis", params],
    queryFn: () => fetchTeamAnalysis(params),
    enabled: !!(params.manager_id || params.department),
    retry: false,
  });
}
