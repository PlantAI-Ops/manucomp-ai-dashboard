import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/StatusBadge";
import { StatusDot } from "@/components/StatusDot";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { EmployeeFormModal } from "@/components/employees/EmployeeFormModal";
import { CompetencyTab } from "@/components/employees/CompetencyTab";
import { AssessmentHistoryTab } from "@/components/employees/AssessmentHistoryTab";
import { AiInsightsTab } from "@/components/employees/AiInsightsTab";
import { useAuth } from "@/hooks/useAuth";
import {
  ArrowLeft,
  Mail,
  Calendar,
  Hash,
  UserCheck,
  Pencil,
  Power,
  Info,
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import api from "@/services/api";
import { useQueryClient } from "@tanstack/react-query";
import {
  useEmployeeDetail,
  buildMockEmployeeDetail,
  type EmployeeDetail,
} from "@/services/employeeDetail";

const EmployeeDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: apiEmployee, isLoading, isError, isMock } = useEmployeeDetail(id!);
  const employee: EmployeeDetail | null = apiEmployee ?? (isError ? buildMockEmployeeDetail(id!) : null);

  const hasValidCompetencies = employee?.competencies && Array.isArray(employee.competencies);
  const employeeData: EmployeeDetail | null = hasValidCompetencies ? employee : (employee ? buildMockEmployeeDetail(id!) : null);

  const [editOpen, setEditOpen] = useState(false);
  const [toggling, setToggling] = useState(false);

  const isManagerOrAdmin = user?.role === "admin" || user?.role === "manager";

  const handleToggleActive = async () => {
    if (!employeeData) return;
    setToggling(true);
    try {
      await api.patch(`/employees/${employeeData.id}`, { is_active: !employeeData.is_active });
      toast.success(employeeData.is_active ? "Employee deactivated" : "Employee activated");
      queryClient.invalidateQueries({ queryKey: ["employee-detail", id] });
    } catch {
      toast.error("Failed to update status");
    } finally {
      setToggling(false);
    }
  };

  const getInitials = (name: string) =>
    name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();

  if (isLoading || !employeeData) {
    return (
      <AppLayout>
        <div className="space-y-6 animate-fade-in">
          <Skeleton className="h-10 w-32 bg-muted" />
          <Skeleton className="h-48 w-full bg-muted rounded-card" />
          <Skeleton className="h-96 w-full bg-muted rounded-card" />
        </div>
      </AppLayout>
    );
  }

  // Convert to EmployeeListItem shape for the edit modal
  const editableEmployee = {
    id: employeeData.id,
    employee_number: employeeData.employee_number,
    full_name: employeeData.full_name,
    email: employeeData.email,
    role_id: employeeData.role_id,
    role_name: employeeData.role_name,
    supervisor_id: employeeData.supervisor_id,
    supervisor_name: employeeData.supervisor_name,
    department: employeeData.department,
    hire_date: employeeData.hire_date,
    is_active: employeeData.is_active,
    created_at: employeeData.created_at,
  };

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Back button */}
        <Button variant="ghost" size="sm" onClick={() => navigate("/employees")} className="text-muted-foreground">
          <ArrowLeft className="mr-1 h-4 w-4" /> Back to Employees
        </Button>

        {/* Mock data warning */}
        {isMock && (
          <Alert className="border-info/40 bg-info/5">
            <Info className="h-4 w-4 text-info" />
            <AlertDescription className="text-sm">
              <strong>Demo Data:</strong> This employee record is sample data for demonstration purposes. Changes cannot be saved.
            </AlertDescription>
          </Alert>
        )}

        {/* Header card */}
        <div className="glass rounded-card p-6">
          <div className="flex flex-col sm:flex-row gap-6">
            {/* Avatar */}
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-primary/15 text-2xl font-bold text-primary">
              {getInitials(employeeData.full_name)}
            </div>

            {/* Info */}
            <div className="flex-1 space-y-3">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold">{employeeData.full_name}</h1>
                  <div className="mt-1 flex flex-wrap items-center gap-2">
                    <StatusBadge variant="info">{employeeData.role_name ?? employeeData.role_id}</StatusBadge>
                    <StatusBadge variant="neutral">{employeeData.department}</StatusBadge>
                    <div className="flex items-center gap-1.5">
                      <StatusDot variant={employeeData.is_active ? "success" : "danger"} />
                      <span className="text-sm">{employeeData.is_active ? "Active" : "Inactive"}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => setEditOpen(true)} disabled={isMock}>
                    <Pencil className="mr-1 h-3.5 w-3.5" /> Edit
                  </Button>
                  <Button
                    variant={employeeData.is_active ? "outline" : "default"}
                    size="sm"
                    onClick={handleToggleActive}
                    disabled={toggling || isMock}
                    className={employeeData.is_active ? "text-destructive border-destructive/30 hover:bg-destructive/10" : ""}
                  >
                    <Power className="mr-1 h-3.5 w-3.5" />
                    {employeeData.is_active ? "Deactivate" : "Activate"}
                  </Button>
                </div>
              </div>

              <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5" /> {employeeData.email}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Hash className="h-3.5 w-3.5" /> {employeeData.employee_number}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" /> Hired {format(new Date(employeeData.hire_date), "MMM d, yyyy")}
                </span>
                {employeeData.supervisor_name && (
                  <span className="inline-flex items-center gap-1.5">
                    <UserCheck className="h-3.5 w-3.5" /> {employeeData.supervisor_name}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="competencies" className="space-y-4">
          <TabsList className="glass border border-border/50">
            <TabsTrigger value="competencies">Competency Summary</TabsTrigger>
            <TabsTrigger value="assessments">Assessment History</TabsTrigger>
            {isManagerOrAdmin && <TabsTrigger value="ai">AI Insights</TabsTrigger>}
          </TabsList>

          <TabsContent value="competencies">
            <CompetencyTab employee={employeeData} />
          </TabsContent>

          <TabsContent value="assessments">
            <AssessmentHistoryTab employeeId={employeeData.id} />
          </TabsContent>

          {isManagerOrAdmin && (
            <TabsContent value="ai">
              <AiInsightsTab employeeId={employeeData.id} />
            </TabsContent>
          )}
        </Tabs>
      </div>

      <EmployeeFormModal open={editOpen} onOpenChange={setEditOpen} employee={editableEmployee} />
    </AppLayout>
  );
};

export default EmployeeDetailPage;
