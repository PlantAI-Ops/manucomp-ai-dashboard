import { useMutation } from "@tanstack/react-query";
import api from "./api";

export interface RowError {
  row: number;
  field: string | null;
  message: string;
}

export interface BulkUploadResult {
  entity_type: string;
  dry_run: boolean;
  total_rows: number;
  success_count: number;
  error_count: number;
  errors: RowError[];
  preview: Record<string, string | number | boolean | null>[];
  created_ids: string[];
}

export type EntityType = "departments" | "competencies" | "roles" | "employees";

const ENTITY_LABELS: Record<EntityType, string> = {
  departments: "Department",
  competencies: "Competency",
  roles: "Role",
  employees: "Employee",
};

export const ENTITY_COLUMNS: Record<EntityType, { required: string[]; optional: string[] }> = {
  departments: {
    required: ["name"],
    optional: ["description", "manager_name", "parent_department_name"],
  },
  competencies: {
    required: ["name", "description", "category"],
    optional: ["is_safety_critical", "detailed_description", "best_practices", "common_mistakes"],
  },
  roles: {
    required: ["name", "description"],
    optional: ["department", "competency_requirements"],
  },
  employees: {
    required: ["employee_number", "full_name", "email", "role_name", "department_name"],
    optional: ["supervisor_name", "hire_date"],
  },
};

export function getEntityLabel(entity: EntityType): string {
  return ENTITY_LABELS[entity];
}

export async function uploadFile(
  entity: EntityType,
  file: File,
  dryRun: boolean
): Promise<BulkUploadResult> {
  const formData = new FormData();
  formData.append("file", file);
  const { data } = await api.post<BulkUploadResult>(
    `/${entity}/upload?dry_run=${dryRun}`,
    formData,
    { headers: { "Content-Type": "multipart/form-data" } }
  );
  return data;
}

export function useBulkUpload() {
  return useMutation({
    mutationFn: ({ entity, file, dryRun }: { entity: EntityType; file: File; dryRun: boolean }) =>
      uploadFile(entity, file, dryRun),
  });
}
