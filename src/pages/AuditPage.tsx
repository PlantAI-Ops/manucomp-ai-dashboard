import { useState, useMemo } from "react";
import { AppLayout } from "@/components/AppLayout";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  X,
  ShieldAlert,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import {
  useAuditLogs,
  buildMockAuditLogs,
  type AuditLogFilters,
  type AuditLogItem,
  type AuditAction,
  type AuditEntityType,
} from "@/services/audit";

const ACTION_COLORS: Record<AuditAction, string> = {
  create: "bg-success/10 text-success border-success/20",
  update: "bg-info/10 text-info border-info/20",
  delete: "bg-destructive/10 text-destructive border-destructive/20",
  login: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  logout: "bg-secondary/10 text-secondary border-secondary/20",
  view: "bg-muted text-muted-foreground border-transparent",
  assessment_submitted: "bg-warning/10 text-warning border-warning/20",
  bulk_assessment: "bg-warning/10 text-warning border-warning/20",
};

export default function AuditPage() {
  const [filters, setFilters] = useState<AuditLogFilters>({
    page: 1,
    page_size: 20,
    entity_type: null,
    action: null,
    actor_id: null,
    start_date: null,
    end_date: null,
    search: null,
  });
  const [search, setSearch] = useState("");
  const [entityFilter, setEntityFilter] = useState<AuditEntityType | "__all__">("__all__");
  const [actionFilter, setActionFilter] = useState<AuditAction | "__all__">("__all__");

  const { data, isLoading, isError } = useAuditLogs(filters);

  const mockData = buildMockAuditLogs(filters.page, filters.page_size);
  const useMock = isError || (!data && !isLoading);
  const apiData = data;

  const allItems: AuditLogItem[] = useMock ? mockData.items : (apiData?.items ?? []);
  const totalItems: number = useMock ? mockData.total : (apiData?.total ?? 0);

  const filtered = useMemo(() => {
    let items = allItems;
    if (entityFilter !== "__all__") {
      items = items.filter((a) => a.entity_type === entityFilter);
    }
    if (actionFilter !== "__all__") {
      items = items.filter((a) => a.action === actionFilter);
    }
    if (search.trim()) {
      const s = search.toLowerCase();
      items = items.filter(
        (a) =>
          a.actor_name?.toLowerCase().includes(s) ||
          a.entity_name?.toLowerCase().includes(s) ||
          a.action.toLowerCase().includes(s)
      );
    }
    return items;
  }, [allItems, search, entityFilter, actionFilter]);

  const pageSize = filters.page_size;
  const totalPages = Math.max(1, Math.ceil((useMock ? filtered.length : totalItems) / pageSize));
  const page = Math.min(filters.page, totalPages);
  const pageItems = useMock
    ? filtered.slice((page - 1) * pageSize, page * pageSize)
    : filtered;

  const clearFilters = () => {
    setSearch("");
    setEntityFilter("__all__");
    setActionFilter("__all__");
    setFilters((f) => ({ ...f, page: 1 }));
  };

  const hasFilters = search || entityFilter !== "__all__" || actionFilter !== "__all__";

  const startIdx = (page - 1) * pageSize + 1;
  const endIdx = Math.min(page * pageSize, useMock ? filtered.length : totalItems);
  const showTotal = useMock ? filtered.length : totalItems;

  const formatAction = (action: AuditAction) =>
    action.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <AppLayout>
      <div className="space-y-6">
        <PageHeader
          title="Audit Log"
          subtitle="System activity and change history"
        />

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px] max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search actor, entity, or action..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setFilters((f) => ({ ...f, page: 1 }));
              }}
              className="pl-9"
            />
          </div>

          <Select
            value={entityFilter}
            onValueChange={(v) => {
              setEntityFilter(v as AuditEntityType | "__all__");
              setFilters((f) => ({ ...f, page: 1 }));
            }}
          >
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="All Entities" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">All Entities</SelectItem>
              <SelectItem value="employee">Employee</SelectItem>
              <SelectItem value="role">Role</SelectItem>
              <SelectItem value="competency">Competency</SelectItem>
              <SelectItem value="assessment">Assessment</SelectItem>
              <SelectItem value="user">User</SelectItem>
              <SelectItem value="system">System</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={actionFilter}
            onValueChange={(v) => {
              setActionFilter(v as AuditAction | "__all__");
              setFilters((f) => ({ ...f, page: 1 }));
            }}
          >
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="All Actions" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">All Actions</SelectItem>
              <SelectItem value="create">Create</SelectItem>
              <SelectItem value="update">Update</SelectItem>
              <SelectItem value="delete">Delete</SelectItem>
              <SelectItem value="login">Login</SelectItem>
              <SelectItem value="logout">Logout</SelectItem>
              <SelectItem value="view">View</SelectItem>
              <SelectItem value="assessment_submitted">Assessment Submitted</SelectItem>
              <SelectItem value="bulk_assessment">Bulk Assessment</SelectItem>
            </SelectContent>
          </Select>

          {hasFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              <X className="mr-1 h-3.5 w-3.5" /> Clear
            </Button>
          )}
        </div>

        {/* Table */}
        <div className="rounded-lg border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Timestamp</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Entity</TableHead>
                <TableHead>Actor</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && !useMock ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 6 }).map((_, j) => (
                      <TableCell key={j}>
                        <Skeleton className="h-4 w-full" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : pageItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-48">
                    <div className="flex flex-col items-center justify-center py-8 text-center animate-fade-in">
                      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
                        <ShieldAlert className="h-6 w-6" />
                      </div>
                      <h3 className="text-base font-medium">
                        {hasFilters ? "No audit records found" : "No audit records yet"}
                      </h3>
                      <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                        {hasFilters
                          ? "Try adjusting your filters"
                          : "Audit events will appear here as actions are performed."}
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                pageItems.map((item) => {
                  const actionColor = ACTION_COLORS[item.action] || ACTION_COLORS.view;
                  return (
                    <TableRow key={item.id}>
                      <TableCell className="text-muted-foreground whitespace-nowrap">
                        {format(new Date(item.timestamp), "MMM d, yyyy HH:mm")}
                      </TableCell>
                      <TableCell>
                        <span
                          className={cn(
                            "inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium capitalize",
                            actionColor
                          )}
                        >
                          {formatAction(item.action)}
                        </span>
                      </TableCell>
                      <TableCell>
                        {item.entity_name ? (
                          <div className="flex flex-col">
                            <span className="text-sm font-medium">{item.entity_name}</span>
                            <span className="text-xs text-muted-foreground capitalize">
                              {item.entity_type.replace(/_/g, " ")}
                            </span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground/50">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-sm">
                        {item.actor_name ?? <span className="text-muted-foreground/50">System</span>}
                      </TableCell>
                      <TableCell>
                        {item.actor_role ? (
                          <Badge
                            variant={
                              item.actor_role === "admin"
                                ? "destructive"
                                : item.actor_role === "manager"
                                ? "default"
                                : "secondary"
                            }
                            className="capitalize text-[10px]"
                          >
                            {item.actor_role}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground/50">—</span>
                        )}
                      </TableCell>
                      <TableCell className="max-w-[200px]">
                        {item.details ? (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="truncate block text-xs text-muted-foreground cursor-default">
                                {JSON.stringify(item.details)}
                              </span>
                            </TooltipTrigger>
                            <TooltipContent className="max-w-xs font-mono text-xs">
                              {JSON.stringify(item.details, null, 2)}
                            </TooltipContent>
                          </Tooltip>
                        ) : (
                          <span className="text-muted-foreground/50">—</span>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {startIdx}–{endIdx} of {showTotal}
          </p>
          <div className="flex items-center gap-2">
            <Select
              value={String(pageSize)}
              onValueChange={(v) =>
                setFilters((f) => ({ ...f, page_size: Number(v), page: 1 }))
              }
            >
              <SelectTrigger className="w-[100px] h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10 / page</SelectItem>
                <SelectItem value="20">20 / page</SelectItem>
                <SelectItem value="50">50 / page</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              disabled={page <= 1}
              onClick={() => setFilters((f) => ({ ...f, page: f.page - 1 }))}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm text-muted-foreground tabular-nums">
              {page} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              disabled={page >= totalPages}
              onClick={() => setFilters((f) => ({ ...f, page: f.page + 1 }))}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
