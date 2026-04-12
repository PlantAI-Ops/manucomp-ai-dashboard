import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "./api";

export interface Department {
  id: string;
  name: string;
  description: string | null;
  manager_id: string | null;
  manager_name: string | null;
  employee_count: number;
  created_at: string;
}

export interface DepartmentFormData {
  name: string;
  description?: string;
  manager_id?: string;
}

const MOCK_DEPARTMENTS: Department[] = [
  { id: "dept-1", name: "Assembly", description: "Assembly line operations and product assembly", manager_id: "emp-1", manager_name: "John Martinez", employee_count: 45, created_at: "2024-01-15T10:00:00Z" },
  { id: "dept-2", name: "Quality", description: "Quality control and inspection", manager_id: "emp-2", manager_name: "Sarah Chen", employee_count: 18, created_at: "2024-01-20T10:00:00Z" },
  { id: "dept-3", name: "Welding", description: "MIG and TIG welding operations", manager_id: "emp-3", manager_name: "Mike Johnson", employee_count: 32, created_at: "2024-02-01T10:00:00Z" },
  { id: "dept-4", name: "CNC", description: "CNC machining and precision manufacturing", manager_id: "emp-4", manager_name: "Lisa Park", employee_count: 28, created_at: "2024-02-10T10:00:00Z" },
  { id: "dept-5", name: "Maintenance", description: "Equipment maintenance and repairs", manager_id: "emp-5", manager_name: "David Brown", employee_count: 15, created_at: "2024-02-15T10:00:00Z" },
  { id: "dept-6", name: "Safety", description: "Workplace safety and compliance", manager_id: "emp-6", manager_name: "Emily Wilson", employee_count: 8, created_at: "2024-02-20T10:00:00Z" },
];

async function fetchDepartments(): Promise<Department[]> {
  const { data } = await api.get<Department[]>("/departments");
  return Array.isArray(data) ? data : (data?.items ?? []);
}

async function fetchDepartment(id: string): Promise<Department> {
  const { data } = await api.get<Department>(`/departments/${id}`);
  return data;
}

async function createDepartment(body: DepartmentFormData): Promise<Department> {
  const { data } = await api.post<Department>("/departments", body);
  return data;
}

async function updateDepartment(id: string, body: Partial<DepartmentFormData>): Promise<Department> {
  const { data } = await api.patch<Department>(`/departments/${id}`, body);
  return data;
}

async function deleteDepartment(id: string): Promise<void> {
  await api.delete(`/departments/${id}`);
}

export function useDepartments() {
  return useQuery({
    queryKey: ["departments"],
    queryFn: fetchDepartments,
    retry: false,
  });
}

export function useDepartment(id: string | null) {
  return useQuery({
    queryKey: ["departments", id],
    queryFn: () => fetchDepartment(id!),
    enabled: !!id,
    retry: false,
  });
}

export function useCreateDepartment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createDepartment,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["departments"] }),
  });
}

export function useUpdateDepartment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: Partial<DepartmentFormData> }) =>
      updateDepartment(id, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["departments"] }),
  });
}

export function useDeleteDepartment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteDepartment,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["departments"] }),
  });
}

export { MOCK_DEPARTMENTS };
