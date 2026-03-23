import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/StatusBadge";
import { Skeleton } from "@/components/ui/skeleton";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { RoleFormModal } from "@/components/roles/RoleFormModal";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Plus,
  Search,
  ChevronLeft,
  ChevronRight,
  Eye,
  Pencil,
  Trash2,
  Briefcase,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { toast } from "sonner";
import {
  useRolesPaginated,
  useDeleteRole,
  MOCK_ROLES,
  type RoleListItem,
  type RoleFilters,
} from "@/services/roles";

const PAGE_SIZE_OPTIONS = [10, 20, 50];

const RolesPage = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const [formOpen, setFormOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<RoleListItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<RoleListItem | null>(null);

  const filters: RoleFilters = { page, page_size: pageSize, search: search || undefined };
  const { data: apiData, isLoading, isError } = useRolesPaginated(filters);
  const deleteMutation = useDeleteRole();

  const useMock = isError || !apiData;

  const mockFiltered = useMemo(() => {
    if (!useMock) return [];
    let result = [...MOCK_ROLES];
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (r) => r.name.toLowerCase().includes(q) || r.description.toLowerCase().includes(q)
      );
    }
    return result;
  }, [useMock, search]);

  const roles = useMock ? mockFiltered.slice((page - 1) * pageSize, page * pageSize) : apiData.items;
  const total = useMock ? mockFiltered.length : apiData.total;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const startItem = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const endItem = Math.min(page * pageSize, total);

  const openCreate = () => { setEditingRole(null); setFormOpen(true); };
  const openEdit = (r: RoleListItem) => { setEditingRole(r); setFormOpen(true); };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteMutation.mutateAsync(deleteTarget.id);
      toast.success(`${deleteTarget.name} deleted`);
    } catch {
      toast.error("Failed to delete role");
    } finally {
      setDeleteTarget(null);
    }
  };

  const truncate = (text: string, max: number) =>
    text.length > max ? text.slice(0, max) + "…" : text;

  return (
    <AppLayout>
      <PageHeader
        title="Roles"
        subtitle="Define job roles and competency requirements"
        actions={
          <Button size="sm" onClick={openCreate}>
            <Plus className="mr-1 h-4 w-4" /> Add Role
          </Button>
        }
      />

      <div className="glass rounded-card overflow-hidden animate-fade-in">
        {/* Search */}
        <div className="flex items-center gap-3 border-b border-border/50 p-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search roles…"
              className="pl-9 bg-muted/50 border-border/50 rounded-input"
            />
          </div>
        </div>

        {/* Table */}
        {isLoading ? (
          <div className="p-4 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 w-full bg-muted" />)}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/50">
                  {["Role Name", "Description", "Department", "Required Competencies", "Created", "Actions"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {roles.length === 0 ? (
                  <tr>
                    <td colSpan={6}>
                      <div className="flex flex-col items-center justify-center py-16 text-center">
                        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
                          <Briefcase className="h-6 w-6" />
                        </div>
                        <h3 className="text-base font-medium">No roles found</h3>
                        <p className="mt-1 text-sm text-muted-foreground">Create a role to get started</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  roles.map((role) => (
                    <tr key={role.id} className="border-b border-border/30 last:border-0 hover:bg-muted/30 transition-colors duration-100">
                      <td className="px-4 py-3 font-medium">{role.name}</td>
                      <td className="px-4 py-3 text-muted-foreground">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="cursor-default">{truncate(role.description, 60)}</span>
                          </TooltipTrigger>
                          {role.description.length > 60 && (
                            <TooltipContent className="max-w-xs">
                              <p className="text-xs">{role.description}</p>
                            </TooltipContent>
                          )}
                        </Tooltip>
                      </td>
                      <td className="px-4 py-3">
                        {role.department ? (
                          <StatusBadge variant="neutral">{role.department}</StatusBadge>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge variant="info">{role.competency_requirements.length}</StatusBadge>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground tabular-nums">
                        {format(new Date(role.created_at), "MMM d, yyyy")}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => navigate(`/roles/${role.id}`)}>
                            <Eye className="h-3.5 w-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(role)}>
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => setDeleteTarget(role)}>
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
            <span className="text-xs text-muted-foreground">Showing {startItem}–{endItem} of {total}</span>
            <div className="flex items-center gap-3">
              <Select value={String(pageSize)} onValueChange={(v) => { setPageSize(Number(v)); setPage(1); }}>
                <SelectTrigger className="w-[80px] h-8 text-xs bg-muted/50 border-border/50 rounded-input"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {PAGE_SIZE_OPTIONS.map((s) => <SelectItem key={s} value={String(s)}>{s} / page</SelectItem>)}
                </SelectContent>
              </Select>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" className="h-8 w-8" disabled={page <= 1} onClick={() => setPage(page - 1)}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="px-2 text-xs tabular-nums text-muted-foreground">{page} / {totalPages}</span>
                <Button variant="ghost" size="icon" className="h-8 w-8" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      <RoleFormModal open={formOpen} onOpenChange={setFormOpen} role={editingRole} />

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete Role"
        description={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="destructive"
        loading={deleteMutation.isPending}
        onConfirm={handleDelete}
      />
    </AppLayout>
  );
};

export default RolesPage;
