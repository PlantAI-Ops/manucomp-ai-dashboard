import { useQuery } from "@tanstack/react-query";
import api from "./api";

export interface EmployeeListItem {
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
  hire_date: string;
  is_active: boolean;
  created_at: string;
}

export interface EmployeePaginatedResponse {
  items: EmployeeListItem[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface RoleOption {
  id: string;
  name: string;
}

export interface EmployeeFilters {
  page: number;
  page_size: number;
  search?: string;
  role_id?: string;
  department?: string;
  is_active?: boolean | null;
}

export async function fetchEmployees(filters: EmployeeFilters): Promise<EmployeePaginatedResponse> {
  const params: Record<string, string | number | boolean> = {
    page: filters.page,
    page_size: filters.page_size,
  };
  if (filters.search) params.search = filters.search;
  if (filters.role_id) params.role_id = filters.role_id;
  if (filters.department) params.department = filters.department;
  if (filters.is_active !== null && filters.is_active !== undefined) params.is_active = filters.is_active;

  const { data } = await api.get<EmployeePaginatedResponse>("/employees", { params });
  return data;
}

export async function fetchRoles(): Promise<RoleOption[]> {
  const { data } = await api.get<{ items: RoleOption[] }>("/roles", { params: { page_size: 100 } });
  return data.items;
}

// Mock data for when API is unavailable
const DEPARTMENTS = ["Assembly", "Quality", "Welding", "CNC", "Maintenance", "Safety"];
const ROLES = ["CNC Operator", "Quality Inspector", "Welder", "Assembly Tech", "Maintenance Tech", "Safety Officer"];

export const MOCK_EMPLOYEES: EmployeeListItem[] = Array.from({ length: 48 }, (_, i) => ({
  id: `emp-${i + 1}`,
  employee_number: `MFG-${String(1001 + i).padStart(4, "0")}`,
  full_name: [
    "John Martinez", "Sarah Chen", "Mike Johnson", "Lisa Park", "David Brown",
    "Emily Wilson", "Carlos Rivera", "Amy Thompson", "James Lee", "Maria Garcia",
    "Robert Taylor", "Jennifer Kim", "William Davis", "Patricia Moore", "Thomas Anderson",
    "Linda Jackson", "Daniel White", "Barbara Harris", "Christopher Martin", "Susan Clark",
    "Matthew Lewis", "Jessica Robinson", "Andrew Walker", "Karen Hall", "Joshua Allen",
    "Nancy Young", "Ryan King", "Betty Wright", "Brandon Lopez", "Dorothy Hill",
    "Kevin Scott", "Sandra Green", "Brian Adams", "Ashley Baker", "Jason Nelson",
    "Deborah Carter", "Justin Mitchell", "Laura Perez", "Eric Roberts", "Stephanie Turner",
    "Aaron Phillips", "Rebecca Campbell", "Nicholas Parker", "Cynthia Evans", "Tyler Edwards",
    "Kathleen Collins", "Jacob Stewart", "Angela Sanchez",
  ][i],
  email: `emp${i + 1}@manucomp.io`,
  role_id: `role-${(i % 6) + 1}`,
  role_name: ROLES[i % 6],
  supervisor_id: null,
  supervisor_name: null,
  department: DEPARTMENTS[i % 6],
  hire_date: new Date(2020 + Math.floor(i / 12), i % 12, 1 + (i % 28)).toISOString().split("T")[0],
  is_active: i % 9 !== 0,
  created_at: new Date().toISOString(),
}));

export const MOCK_ROLES: RoleOption[] = ROLES.map((name, i) => ({ id: `role-${i + 1}`, name }));

export function useEmployees(filters: EmployeeFilters) {
  return useQuery({
    queryKey: ["employees", filters],
    queryFn: () => fetchEmployees(filters),
    retry: false,
  });
}

export function useEmployeesForSelect() {
  return useQuery({
    queryKey: ["employees-for-select"],
    queryFn: async () => {
      const data = await fetchEmployees({ page: 1, page_size: 100, is_active: true });
      return data.items;
    },
    retry: false,
  });
}

export function useRoles() {
  return useQuery({
    queryKey: ["roles"],
    queryFn: fetchRoles,
    retry: false,
  });
}
