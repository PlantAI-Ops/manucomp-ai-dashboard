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

// --- Team Analysis ---
export interface TeamMember {
  employee_id: string;
  employee_name: string;
  role_name: string;
  readiness: number;
}

export interface TeamAnalysis {
  department: string;
  manager_name: string | null;
  team_size: number;
  team_readiness: number;
  members: TeamMember[];
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

export function buildMockTeamAnalysis(department: string): TeamAnalysis {
  const members: TeamMember[] = NAMES.slice(0, 5).map((name, i) => ({
    employee_id: `emp-${i + 1}`,
    employee_name: name,
    role_name: ["CNC Operator", "Quality Inspector", "Welder", "Assembly Tech", "Maintenance Tech"][i],
    readiness: 55 + Math.floor(Math.random() * 40),
  }));

  return {
    department,
    manager_name: "John Martinez",
    team_size: members.length,
    team_readiness: Math.round(members.reduce((s, m) => s + m.readiness, 0) / members.length),
    members,
  };
}

// --- API + Hooks ---

async function fetchGapAnalysis(employeeId: string): Promise<GapAnalysis> {
  const { data } = await api.get<GapAnalysis>(`/analytics/gap-analysis/${employeeId}`);
  return data;
}

async function fetchRoleReadiness(): Promise<RoleReadinessItem[]> {
  const { data } = await api.get<RoleReadinessItem[]>("/analytics/role-readiness");
  return data;
}

async function fetchTeamAnalysis(params: { manager_id?: string; department?: string }): Promise<TeamAnalysis> {
  const { data } = await api.get<TeamAnalysis>("/analytics/team-analysis", { params });
  return data;
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
