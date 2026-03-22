import { useState, useEffect } from "react";
import { Modal } from "@/components/Modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { toast } from "sonner";
import { z } from "zod";
import api from "@/services/api";
import {
  useRoles,
  MOCK_ROLES,
  MOCK_EMPLOYEES,
  type EmployeeListItem,
  type RoleOption,
} from "@/services/employees";
import { useQueryClient } from "@tanstack/react-query";

const DEPARTMENTS = ["Assembly", "Quality", "Welding", "CNC", "Maintenance", "Safety"];

const employeeSchema = z.object({
  employee_number: z.string().trim().min(1, "Employee number is required"),
  full_name: z.string().trim().min(1, "Full name is required"),
  email: z.string().trim().email("Valid email is required"),
  role_id: z.string().min(1, "Role is required"),
  supervisor_id: z.string().nullable(),
  department: z.string().min(1, "Department is required"),
  hire_date: z.string().min(1, "Hire date is required"),
});

type FormData = z.infer<typeof employeeSchema>;

interface EmployeeFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employee?: EmployeeListItem | null;
}

export const EmployeeFormModal: React.FC<EmployeeFormModalProps> = ({
  open,
  onOpenChange,
  employee,
}) => {
  const isEdit = !!employee;
  const queryClient = useQueryClient();
  const { data: apiRoles } = useRoles();
  const roles: RoleOption[] = apiRoles ?? MOCK_ROLES;

  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [form, setForm] = useState<FormData>({
    employee_number: "",
    full_name: "",
    email: "",
    role_id: "",
    supervisor_id: null,
    department: "",
    hire_date: "",
  });

  useEffect(() => {
    if (open) {
      if (employee) {
        setForm({
          employee_number: employee.employee_number,
          full_name: employee.full_name,
          email: employee.email,
          role_id: employee.role_id,
          supervisor_id: employee.supervisor_id,
          department: employee.department,
          hire_date: employee.hire_date,
        });
      } else {
        setForm({
          employee_number: "",
          full_name: "",
          email: "",
          role_id: "",
          supervisor_id: null,
          department: "",
          hire_date: "",
        });
      }
      setErrors({});
    }
  }, [open, employee]);

  const handleChange = (field: keyof FormData, value: string | null) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleSubmit = async () => {
    const result = employeeSchema.safeParse(form);
    if (!result.success) {
      const fieldErrors: Partial<Record<keyof FormData, string>> = {};
      result.error.issues.forEach((issue) => {
        const key = issue.path[0] as keyof FormData;
        if (!fieldErrors[key]) fieldErrors[key] = issue.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setSubmitting(true);
    try {
      if (isEdit) {
        await api.patch(`/employees/${employee!.id}`, {
          full_name: form.full_name,
          email: form.email,
          role_id: form.role_id,
          supervisor_id: form.supervisor_id || null,
          department: form.department,
          is_active: employee!.is_active,
        });
      } else {
        await api.post("/employees", {
          ...form,
          supervisor_id: form.supervisor_id || null,
          hire_date: new Date(form.hire_date).toISOString(),
        });
      }
      toast.success(isEdit ? "Employee updated" : "Employee created");
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      onOpenChange(false);
    } catch (err: any) {
      const msg = err?.response?.data?.detail || (isEdit ? "Failed to update employee" : "Failed to create employee");
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const selectedDate = form.hire_date ? new Date(form.hire_date) : undefined;

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={isEdit ? "Edit Employee" : "Add Employee"}
      description={isEdit ? "Update employee information" : "Create a new employee record"}
      size="lg"
    >
      <div className="grid gap-4 py-2">
        {/* Employee Number */}
        <div className="grid gap-1.5">
          <Label htmlFor="employee_number">Employee Number *</Label>
          <Input
            id="employee_number"
            value={form.employee_number}
            onChange={(e) => handleChange("employee_number", e.target.value)}
            placeholder="MFG-0001"
            disabled={isEdit}
            className={cn("bg-muted/50 border-border/50 rounded-input", errors.employee_number && "border-destructive")}
          />
          {errors.employee_number && <p className="text-xs text-destructive">{errors.employee_number}</p>}
        </div>

        {/* Full Name & Email */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="grid gap-1.5">
            <Label htmlFor="full_name">Full Name *</Label>
            <Input
              id="full_name"
              value={form.full_name}
              onChange={(e) => handleChange("full_name", e.target.value)}
              placeholder="John Doe"
              className={cn("bg-muted/50 border-border/50 rounded-input", errors.full_name && "border-destructive")}
            />
            {errors.full_name && <p className="text-xs text-destructive">{errors.full_name}</p>}
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={form.email}
              onChange={(e) => handleChange("email", e.target.value)}
              placeholder="john@manucomp.io"
              className={cn("bg-muted/50 border-border/50 rounded-input", errors.email && "border-destructive")}
            />
            {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
          </div>
        </div>

        {/* Role & Department */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="grid gap-1.5">
            <Label>Role *</Label>
            <Select value={form.role_id} onValueChange={(v) => handleChange("role_id", v)}>
              <SelectTrigger className={cn("bg-muted/50 border-border/50 rounded-input", errors.role_id && "border-destructive")}>
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                {roles.map((r) => (
                  <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.role_id && <p className="text-xs text-destructive">{errors.role_id}</p>}
          </div>
          <div className="grid gap-1.5">
            <Label>Department *</Label>
            <Select value={form.department} onValueChange={(v) => handleChange("department", v)}>
              <SelectTrigger className={cn("bg-muted/50 border-border/50 rounded-input", errors.department && "border-destructive")}>
                <SelectValue placeholder="Select department" />
              </SelectTrigger>
              <SelectContent>
                {DEPARTMENTS.map((d) => (
                  <SelectItem key={d} value={d}>{d}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.department && <p className="text-xs text-destructive">{errors.department}</p>}
          </div>
        </div>

        {/* Supervisor & Hire Date */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="grid gap-1.5">
            <Label>Supervisor</Label>
            <Select
              value={form.supervisor_id ?? "none"}
              onValueChange={(v) => handleChange("supervisor_id", v === "none" ? null : v)}
            >
              <SelectTrigger className="bg-muted/50 border-border/50 rounded-input">
                <SelectValue placeholder="None" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {MOCK_EMPLOYEES.filter((e) => e.id !== employee?.id).slice(0, 20).map((e) => (
                  <SelectItem key={e.id} value={e.id}>{e.full_name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-1.5">
            <Label>Hire Date *</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "justify-start text-left font-normal bg-muted/50 border-border/50 rounded-input",
                    !selectedDate && "text-muted-foreground",
                    errors.hire_date && "border-destructive"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(d) => handleChange("hire_date", d ? d.toISOString().split("T")[0] : "")}
                  disabled={(d) => d > new Date()}
                  initialFocus
                  className="p-3 pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
            {errors.hire_date && <p className="text-xs text-destructive">{errors.hire_date}</p>}
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={submitting}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} disabled={submitting}>
          {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isEdit ? "Save Changes" : "Create Employee"}
        </Button>
      </div>
    </Modal>
  );
};
