import { useQuery } from "@tanstack/react-query";
import api from "./api";

export type AuditAction =
  | "create"
  | "update"
  | "delete"
  | "login"
  | "logout"
  | "view"
  | "assessment_submitted"
  | "bulk_assessment";

export type AuditEntityType =
  | "employee"
  | "role"
  | "competency"
  | "assessment"
  | "user"
  | "system";

export interface AuditLogItem {
  id: string;
  timestamp: string;
  action: AuditAction;
  entity_type: AuditEntityType;
  entity_id: string | null;
  entity_name: string | null;
  actor_id: string | null;
  actor_name: string | null;
  actor_role: string | null;
  details: Record<string, unknown> | null;
  ip_address: string | null;
}

export interface AuditLogFilters {
  page: number;
  page_size: number;
  entity_type?: AuditEntityType | null;
  action?: AuditAction | null;
  actor_id?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  search?: string | null;
}

export interface AuditLogPaginatedResponse {
  items: AuditLogItem[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

async function fetchAuditLogs(
  filters: AuditLogFilters
): Promise<AuditLogPaginatedResponse> {
  const params: Record<string, string | number | boolean | null> = {
    page: filters.page,
    page_size: filters.page_size,
  };
  if (filters.entity_type) params.entity_type = filters.entity_type;
  if (filters.action) params.action = filters.action;
  if (filters.actor_id) params.actor_id = filters.actor_id;
  if (filters.start_date) params.start_date = filters.start_date;
  if (filters.end_date) params.end_date = filters.end_date;
  if (filters.search) params.search = filters.search;

  const { data } = await api.get<AuditLogPaginatedResponse>("/audit", { params });
  return data;
}

// ── Mock data ────────────────────────────────────────────────────────────────

const ACTOR_NAMES = [
  "Sarah Chen",
  "Mike Johnson",
  "Admin User",
  "John Martinez",
  "Carlos Rivera",
  "Amy Thompson",
];
const DEPARTMENTS = ["Assembly", "Quality", "Welding", "CNC", "Maintenance", "Safety"];
const ENTITIES: Array<{ type: AuditEntityType; name: string }> = [
  { type: "employee", name: "John Martinez" },
  { type: "employee", name: "Lisa Park" },
  { type: "employee", name: "David Brown" },
  { type: "role", name: "CNC Operator" },
  { type: "role", name: "Quality Inspector" },
  { type: "role", name: "Welder" },
  { type: "competency", name: "CNC Machine Operation" },
  { type: "competency", name: "Quality Inspection" },
  { type: "assessment", name: "Assessment for Lisa Park" },
  { type: "user", name: "user@manucomp.io" },
];

function randomFrom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomDate(daysBack: number): string {
  const d = new Date();
  d.setDate(d.getDate() - Math.floor(Math.random() * daysBack));
  d.setHours(Math.floor(Math.random() * 24), Math.floor(Math.random() * 60));
  return d.toISOString();
}

function buildMockAuditLogs(page: number, pageSize: number): AuditLogPaginatedResponse {
  const total = 120;
  const start = (page - 1) * pageSize;
  const items: AuditLogItem[] = Array.from({ length: pageSize }, (_, i) => {
    const entity = randomFrom(ENTITIES);
    const action = randomFrom<AuditAction>([
      "create",
      "update",
      "delete",
      "login",
      "logout",
      "view",
      "assessment_submitted",
      "bulk_assessment",
    ]);
    const actorName = randomFrom(ACTOR_NAMES);
    return {
      id: `audit-${start + i + 1}`,
      timestamp: randomDate(60),
      action,
      entity_type: entity.type,
      entity_id: `${entity.type}-${Math.floor(Math.random() * 20) + 1}`,
      entity_name: entity.name,
      actor_id: `user-${Math.floor(Math.random() * 6) + 1}`,
      actor_name: actorName,
      actor_role: randomFrom(["admin", "manager", "employee"]),
      details: action === "update" ? { changed_fields: ["assessed_level", "notes"] } : null,
      ip_address: `192.168.1.${Math.floor(Math.random() * 255)}`,
    };
  });
  return {
    items,
    total,
    page,
    page_size: pageSize,
    total_pages: Math.ceil(total / pageSize),
  };
}

// ── Hooks ────────────────────────────────────────────────────────────────────

export function useAuditLogs(filters: AuditLogFilters) {
  return useQuery({
    queryKey: ["audit-logs", filters],
    queryFn: () => fetchAuditLogs(filters),
    retry: false,
  });
}

export { buildMockAuditLogs };
