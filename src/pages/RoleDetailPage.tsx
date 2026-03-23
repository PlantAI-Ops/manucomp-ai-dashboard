import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { AppLayout } from "@/components/AppLayout";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/StatusBadge";
import { StatusDot } from "@/components/StatusDot";
import { LevelIndicator } from "@/components/LevelIndicator";
import { Skeleton } from "@/components/ui/skeleton";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { RoleFormModal } from "@/components/roles/RoleFormModal";
import { Progress } from "@/components/ui/progress";
import { Pencil, Trash2, Check, X, Briefcase, Users } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import api from "@/services/api";
import { useDeleteRole, MOCK_ROLES, type RoleListItem } from "@/services/roles";
import { MOCK_EMPLOYEES, type EmployeeListItem } from "@/services/employees";

function useRoleDetail(id: string) {
  return useQuery({
    queryKey: ["role-detail", id],
    queryFn: async () => {
      const { data } = await api.get<RoleListItem>(`/roles/${id}`);
      return data;
    },
    retry: false,
  });
}

function useRoleEmployees(roleId: string) {
  return useQuery({
    queryKey: ["role-employees", roleId],
    queryFn: async () => {
      const { data } = await api.get<{ items: EmployeeListItem[] }>("/employees", {
        params: { role_id: roleId, page_size: 100 },
      });
      return data.items;
    },
    retry: false,
  });
}

const RoleDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: apiRole, isLoading, isError } = useRoleDetail(id!);
  const { data: apiEmployees, isError: empError } = useRoleEmployees(id!);

  const role = isError || !apiRole ? MOCK_ROLES.find((r) => r.id === id) ?? MOCK_ROLES[0] : apiRole;
  const employees = empError || !apiEmployees
    ? MOCK_EMPLOYEES.filter((e) => e.role_id === id).slice(0, 20)
    : apiEmployees;

  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const deleteMutation = useDeleteRole();

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync(role.id);
      toast.success(`${role.name} deleted`);
      navigate("/roles");
    } catch {
      toast.error("Failed to delete role");
    } finally {
      setDeleteOpen(false);
    }
  };

  const getInitials = (name: string) =>
    name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();

  // Mock readiness % per employee
  const getReadiness = (empId: string) => {
    const hash = empId.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
    return Math.min(100, Math.max(20, (hash * 7) % 101));
  };

  const readinessColor = (pct: number) =>
    pct >= 80 ? "bg-success" : pct >= 50 ? "bg-warning" : "bg-destructive";

  if (isLoading) {
    return (
      <AppLayout>
        <div className="space-y-6">
          <Skeleton className="h-40 w-full bg-muted rounded-card" />
          <Skeleton className="h-64 w-full bg-muted rounded-card" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <PageHeader
        title={role.name}
        subtitle="Role details and competency requirements"
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setEditOpen(true)}>
              <Pencil className="mr-1 h-3.5 w-3.5" /> Edit
            </Button>
            <Button variant="outline" size="sm" className="text-destructive border-destructive/30 hover:bg-destructive/10" onClick={() => setDeleteOpen(true)}>
              <Trash2 className="mr-1 h-3.5 w-3.5" /> Delete
            </Button>
          </div>
        }
      />

      {/* Header Card */}
      <div className="glass rounded-card p-6 animate-in-up space-y-3">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 text-primary">
                <Briefcase className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">{role.name}</h2>
                {role.department && <StatusBadge variant="neutral">{role.department}</StatusBadge>}
              </div>
            </div>
            <p className="text-sm text-muted-foreground max-w-2xl">{role.description}</p>
          </div>
          <div className="text-xs text-muted-foreground tabular-nums">
            Created {format(new Date(role.created_at), "MMM d, yyyy")}
          </div>
        </div>
      </div>

      {/* Competency Requirements */}
      <div className="glass rounded-card overflow-hidden animate-in-up stagger-1 mt-6">
        <div className="flex items-center justify-between border-b border-border/50 px-5 py-3">
          <h3 className="text-sm font-medium">Competency Requirements</h3>
          <StatusBadge variant="info">{role.competency_requirements.length} required</StatusBadge>
        </div>
        {role.competency_requirements.length === 0 ? (
          <div className="flex flex-col items-center py-10 text-center text-muted-foreground">
            <p className="text-sm">No competency requirements defined</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/50">
                  {["Competency", "Category", "Required Level", "Mandatory"].map((h) => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {role.competency_requirements.map((cr) => (
                  <tr key={cr.competency_id} className="border-b border-border/30 last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="px-5 py-3">
                      <Link
                        to={`/competencies/${cr.competency_id}`}
                        className="font-medium text-primary hover:underline"
                      >
                        {cr.competency_name}
                      </Link>
                    </td>
                    <td className="px-5 py-3">
                      <StatusBadge variant="neutral">Technical</StatusBadge>
                    </td>
                    <td className="px-5 py-3">
                      <LevelIndicator level={cr.required_level} />
                    </td>
                    <td className="px-5 py-3">
                      {cr.is_mandatory ? (
                        <Check className="h-4 w-4 text-success" />
                      ) : (
                        <X className="h-4 w-4 text-muted-foreground" />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Assigned Employees */}
      <div className="glass rounded-card overflow-hidden animate-in-up stagger-2 mt-6">
        <div className="flex items-center justify-between border-b border-border/50 px-5 py-3">
          <h3 className="text-sm font-medium">Assigned Employees</h3>
          <StatusBadge variant="info">{employees.length} employees</StatusBadge>
        </div>
        {employees.length === 0 ? (
          <div className="flex flex-col items-center py-10 text-center text-muted-foreground">
            <Users className="h-6 w-6 mb-2" />
            <p className="text-sm">No employees assigned to this role</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/50">
                  {["Name", "Employee #", "Department", "Readiness", "Status"].map((h) => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {employees.map((emp) => {
                  const readiness = getReadiness(emp.id);
                  return (
                    <tr
                      key={emp.id}
                      className="border-b border-border/30 last:border-0 hover:bg-muted/30 transition-colors cursor-pointer"
                      onClick={() => navigate(`/employees/${emp.id}`)}
                    >
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/15 text-[10px] font-semibold text-primary shrink-0">
                            {getInitials(emp.full_name)}
                          </div>
                          <span className="font-medium">{emp.full_name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3 font-mono text-xs">{emp.employee_number}</td>
                      <td className="px-5 py-3">
                        <StatusBadge variant="neutral">{emp.department}</StatusBadge>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2 min-w-[120px]">
                          <div className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-secondary">
                            <div
                              className={cn("h-full rounded-full transition-all", readinessColor(readiness))}
                              style={{ width: `${readiness}%` }}
                            />
                          </div>
                          <span className="text-xs tabular-nums text-muted-foreground w-8 text-right">{readiness}%</span>
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-1.5">
                          <StatusDot variant={emp.is_active ? "success" : "danger"} />
                          <span className="text-xs">{emp.is_active ? "Active" : "Inactive"}</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <RoleFormModal open={editOpen} onOpenChange={setEditOpen} role={role} />

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete Role"
        description={`Are you sure you want to delete "${role.name}"? This will affect all assigned employees.`}
        confirmLabel="Delete"
        variant="destructive"
        loading={deleteMutation.isPending}
        onConfirm={handleDelete}
      />
    </AppLayout>
  );
};

export default RoleDetailPage;
