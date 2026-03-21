import { useState, useMemo } from "react";
import { AppLayout } from "@/components/AppLayout";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatusDot } from "@/components/StatusDot";
import { StatusBadge } from "@/components/StatusBadge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus,
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronsUpDown,
  ChevronUp,
  ChevronDown,
  Eye,
  Pencil,
  Trash2,
  X,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import {
  useEmployees,
  useRoles,
  MOCK_EMPLOYEES,
  MOCK_ROLES,
  type EmployeeListItem,
  type EmployeeFilters,
} from "@/services/employees";

type SortKey = "employee_number" | "full_name" | "role_name" | "department" | "hire_date";
type SortDir = "asc" | "desc";
type StatusFilter = "all" | "active" | "inactive";

const PAGE_SIZE_OPTIONS = [10, 20, 50];

const EmployeesPage = () => {
  const [search, setSearch] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState<string>("all");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [sortKey, setSortKey] = useState<SortKey | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  const filters: EmployeeFilters = {
    page,
    page_size: pageSize,
    search: search || undefined,
    role_id: roleFilter !== "all" ? roleFilter : undefined,
    department: departmentFilter !== "all" ? departmentFilter : undefined,
    is_active: statusFilter === "all" ? null : statusFilter === "active",
  };

  const { data: apiData, isLoading, isError } = useEmployees(filters);
  const { data: apiRoles, isError: rolesError } = useRoles();

  const useMock = isError || !apiData;
  const roles = apiRoles ?? MOCK_ROLES;

  // For mock data, do client-side filtering/pagination
  const mockFiltered = useMemo(() => {
    if (!useMock) return [];
    let result = [...MOCK_EMPLOYEES];
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (e) =>
          e.full_name.toLowerCase().includes(q) ||
          e.employee_number.toLowerCase().includes(q) ||
          e.email.toLowerCase().includes(q)
      );
    }
    if (departmentFilter !== "all") {
      result = result.filter((e) => e.department === departmentFilter);
    }
    if (roleFilter !== "all") {
      result = result.filter((e) => e.role_id === roleFilter);
    }
    if (statusFilter !== "all") {
      result = result.filter((e) => (statusFilter === "active" ? e.is_active : !e.is_active));
    }
    return result;
  }, [useMock, search, departmentFilter, roleFilter, statusFilter]);

  const sortedMock = useMemo(() => {
    if (!useMock || !sortKey) return mockFiltered;
    return [...mockFiltered].sort((a, b) => {
      const aVal = a[sortKey] ?? "";
      const bVal = b[sortKey] ?? "";
      const cmp = String(aVal).localeCompare(String(bVal), undefined, { numeric: true });
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [mockFiltered, sortKey, sortDir, useMock]);

  const employees = useMock
    ? sortedMock.slice((page - 1) * pageSize, page * pageSize)
    : apiData.items;

  const total = useMock ? sortedMock.length : apiData.total;
  const totalPages = Math.ceil(total / pageSize);

  const departments = useMemo(() => {
    const deps = useMock
      ? [...new Set(MOCK_EMPLOYEES.map((e) => e.department))]
      : [...new Set(apiData?.items.map((e) => e.department) ?? [])];
    return deps.sort();
  }, [useMock, apiData]);

  const hasFilters = search || departmentFilter !== "all" || roleFilter !== "all" || statusFilter !== "all";

  const clearFilters = () => {
    setSearch("");
    setDepartmentFilter("all");
    setRoleFilter("all");
    setStatusFilter("all");
    setPage(1);
  };

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
    setPage(1);
  };

  const SortIcon = ({ colKey }: { colKey: string }) => {
    if (sortKey !== colKey) return <ChevronsUpDown className="h-3.5 w-3.5 opacity-40" />;
    return sortDir === "asc" ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />;
  };

  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();

  const startItem = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const endItem = Math.min(page * pageSize, total);

  const columns: { key: SortKey | string; header: string; sortable: boolean }[] = [
    { key: "employee_number", header: "Employee #", sortable: true },
    { key: "full_name", header: "Name", sortable: true },
    { key: "email", header: "Email", sortable: false },
    { key: "role_name", header: "Role", sortable: true },
    { key: "department", header: "Department", sortable: true },
    { key: "hire_date", header: "Hire Date", sortable: true },
    { key: "status", header: "Status", sortable: false },
    { key: "actions", header: "Actions", sortable: false },
  ];

  return (
    <AppLayout>
      <PageHeader
        title="Employees"
        subtitle="Manage manufacturing personnel"
        actions={
          <Button size="sm">
            <Plus className="mr-1 h-4 w-4" />
            Add Employee
          </Button>
        }
      />

      <div className="glass rounded-card overflow-hidden animate-fade-in">
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 border-b border-border/50 p-4">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search name, ID, email…"
              className="pl-9 bg-muted/50 border-border/50 rounded-input"
            />
          </div>

          <Select value={departmentFilter} onValueChange={(v) => { setDepartmentFilter(v); setPage(1); }}>
            <SelectTrigger className="w-[160px] bg-muted/50 border-border/50 rounded-input">
              <SelectValue placeholder="Department" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              {departments.map((d) => (
                <SelectItem key={d} value={d}>{d}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={roleFilter} onValueChange={(v) => { setRoleFilter(v); setPage(1); }}>
            <SelectTrigger className="w-[160px] bg-muted/50 border-border/50 rounded-input">
              <SelectValue placeholder="Role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              {roles.map((r) => (
                <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex items-center rounded-input border border-border/50 bg-muted/50 overflow-hidden">
            {(["all", "active", "inactive"] as StatusFilter[]).map((s) => (
              <button
                key={s}
                onClick={() => { setStatusFilter(s); setPage(1); }}
                className={cn(
                  "px-3 py-2 text-xs font-medium capitalize transition-colors",
                  statusFilter === s
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {s}
              </button>
            ))}
          </div>

          {hasFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters} className="text-xs text-muted-foreground">
              <X className="mr-1 h-3 w-3" /> Clear
            </Button>
          )}
        </div>

        {/* Table */}
        {isLoading ? (
          <div className="p-4 space-y-3">
            <Skeleton className="h-9 w-64 bg-muted" />
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full bg-muted" />
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/50">
                  {columns.map((col) => (
                    <th
                      key={col.key}
                      className={cn(
                        "px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground",
                        col.sortable && "cursor-pointer select-none hover:text-foreground transition-colors"
                      )}
                      onClick={() => col.sortable && toggleSort(col.key as SortKey)}
                    >
                      <span className="inline-flex items-center gap-1">
                        {col.header}
                        {col.sortable && <SortIcon colKey={col.key} />}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {employees.length === 0 ? (
                  <tr>
                    <td colSpan={columns.length}>
                      <div className="flex flex-col items-center justify-center py-16 text-center">
                        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
                          <Users className="h-6 w-6" />
                        </div>
                        <h3 className="text-base font-medium">No employees found</h3>
                        <p className="mt-1 text-sm text-muted-foreground">Try adjusting your filters</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  employees.map((emp) => (
                    <tr
                      key={emp.id}
                      className="border-b border-border/30 last:border-0 hover:bg-muted/30 transition-colors duration-100"
                    >
                      <td className="px-4 py-3 font-mono text-xs">{emp.employee_number}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/15 text-xs font-semibold text-primary shrink-0">
                            {getInitials(emp.full_name)}
                          </div>
                          <span className="font-medium">{emp.full_name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{emp.email}</td>
                      <td className="px-4 py-3">
                        <StatusBadge variant="info">{emp.role_name ?? emp.role_id}</StatusBadge>
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge variant="neutral">{emp.department}</StatusBadge>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground tabular-nums">
                        {format(new Date(emp.hire_date), "MMM d, yyyy")}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <StatusDot status={emp.is_active ? "success" : "danger"} />
                          <span className="text-xs">{emp.is_active ? "Active" : "Inactive"}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="icon" className="h-7 w-7">
                            <Eye className="h-3.5 w-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7">
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive">
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {total > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/50 px-4 py-3">
            <span className="text-xs text-muted-foreground">
              Showing {startItem}–{endItem} of {total}
            </span>
            <div className="flex items-center gap-3">
              <Select value={String(pageSize)} onValueChange={(v) => { setPageSize(Number(v)); setPage(1); }}>
                <SelectTrigger className="w-[80px] h-8 text-xs bg-muted/50 border-border/50 rounded-input">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PAGE_SIZE_OPTIONS.map((s) => (
                    <SelectItem key={s} value={String(s)}>{s} / page</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" className="h-8 w-8" disabled={page <= 1} onClick={() => setPage(page - 1)}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="px-2 text-xs tabular-nums text-muted-foreground">
                  {page} / {totalPages}
                </span>
                <Button variant="ghost" size="icon" className="h-8 w-8" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default EmployeesPage;
