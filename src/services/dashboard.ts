import api from "./api";

export interface RoleReadiness {
  role_id: string;
  role_name: string;
  total_employees: number;
  fully_qualified: number;
  partially_qualified: number;
  unqualified: number;
  average_readiness: number;
}

export interface TopSkillGap {
  competency_name: string;
  gap_count: number;
}

export interface CriticalGapItem {
  employee_name: string;
  competency_name: string;
  gap: number;
  severity: "critical" | "high";
}

export interface DashboardSummary {
  total_employees: number;
  total_roles: number;
  total_competencies: number;
  assessed_employees: number;
  assessment_percentage: number;
  critical_gaps: number;
  role_readiness: RoleReadiness[];
  top_skill_gaps: TopSkillGap[];
  critical_gap_details?: CriticalGapItem[];
}

export const MOCK_DASHBOARD: DashboardSummary = {
  total_employees: 247,
  total_roles: 12,
  total_competencies: 56,
  assessed_employees: 198,
  assessment_percentage: 80.2,
  critical_gaps: 14,
  role_readiness: [
    { role_id: "1", role_name: "CNC Operator", total_employees: 42, fully_qualified: 28, partially_qualified: 10, unqualified: 4, average_readiness: 78 },
    { role_id: "2", role_name: "Quality Inspector", total_employees: 18, fully_qualified: 12, partially_qualified: 4, unqualified: 2, average_readiness: 82 },
    { role_id: "3", role_name: "Welder", total_employees: 35, fully_qualified: 20, partially_qualified: 9, unqualified: 6, average_readiness: 68 },
    { role_id: "4", role_name: "Assembly Tech", total_employees: 50, fully_qualified: 35, partially_qualified: 10, unqualified: 5, average_readiness: 75 },
    { role_id: "5", role_name: "Maintenance", total_employees: 22, fully_qualified: 10, partially_qualified: 7, unqualified: 5, average_readiness: 60 },
    { role_id: "6", role_name: "Safety Officer", total_employees: 8, fully_qualified: 6, partially_qualified: 1, unqualified: 1, average_readiness: 85 },
  ],
  top_skill_gaps: [
    { competency_name: "Advanced CNC Programming", gap_count: 18 },
    { competency_name: "TIG Welding Certification", gap_count: 15 },
    { competency_name: "PLC Troubleshooting", gap_count: 12 },
    { competency_name: "GD&T Interpretation", gap_count: 10 },
    { competency_name: "Lean Manufacturing", gap_count: 9 },
    { competency_name: "Hydraulic Systems", gap_count: 7 },
    { competency_name: "ISO 9001 Compliance", gap_count: 6 },
  ],
  critical_gap_details: [
    { employee_name: "John Martinez", competency_name: "Advanced CNC Programming", gap: 3, severity: "critical" },
    { employee_name: "Sarah Chen", competency_name: "TIG Welding Certification", gap: 3, severity: "critical" },
    { employee_name: "Mike Johnson", competency_name: "PLC Troubleshooting", gap: 2, severity: "high" },
    { employee_name: "Lisa Park", competency_name: "GD&T Interpretation", gap: 3, severity: "critical" },
    { employee_name: "David Brown", competency_name: "Hydraulic Systems", gap: 2, severity: "high" },
    { employee_name: "Emily Wilson", competency_name: "ISO 9001 Compliance", gap: 2, severity: "high" },
    { employee_name: "Carlos Rivera", competency_name: "Advanced CNC Programming", gap: 3, severity: "critical" },
    { employee_name: "Amy Thompson", competency_name: "Lean Manufacturing", gap: 2, severity: "high" },
  ],
};

export async function fetchDashboardSummary(): Promise<DashboardSummary> {
  const { data } = await api.get<DashboardSummary>("/analytics/dashboard-summary");
  return data;
}
