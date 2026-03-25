import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { PageHeader } from "@/components/PageHeader";
import { StatCard } from "@/components/StatCard";
import { LevelIndicator } from "@/components/LevelIndicator";
import { StatusBadge } from "@/components/StatusBadge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import { MOCK_EMPLOYEES } from "@/services/employees";
import {
  useGapAnalysis,
  useRoleReadiness,
  useTeamAnalysis,
  buildMockGapAnalysis,
  MOCK_ROLE_READINESS,
  buildMockTeamAnalysis,
  type GapAnalysis,
  type RoleReadinessItem,
  type TeamAnalysis,
} from "@/services/analytics";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  AlertTriangle,
  Target,
  TrendingDown,
  Shield,
  Users,
  BarChart3,
  Info,
} from "lucide-react";

const SEVERITY_CONFIG: Record<string, { color: string; label: string }> = {
  critical: { color: "text-destructive bg-destructive/10 border-destructive/20", label: "Critical" },
  high: { color: "text-warning bg-warning/10 border-warning/20", label: "High" },
  medium: { color: "text-info bg-info/10 border-info/20", label: "Medium" },
  low: { color: "text-muted-foreground bg-muted border-border", label: "Low" },
};

const DEPARTMENTS = ["Assembly", "Quality", "Welding", "CNC", "Maintenance", "Safety"];

function FallbackBanner() {
  return (
    <Alert className="mb-4 border-info/20 bg-info/5">
      <Info className="h-4 w-4 text-info" />
      <AlertDescription className="text-xs text-muted-foreground">
        Analytics data will be available once the backend analytics engine is implemented. Showing demo data.
      </AlertDescription>
    </Alert>
  );
}

// ======================== TAB 1: GAP ANALYSIS ========================
function GapAnalysisTab() {
  const [selectedEmpId, setSelectedEmpId] = useState("");
  const employees = MOCK_EMPLOYEES.filter((e) => e.is_active);

  const { data: apiData } = useGapAnalysis(selectedEmpId || undefined);
  const gapData: GapAnalysis | null = apiData || (selectedEmpId ? buildMockGapAnalysis(selectedEmpId) : null);

  const radarData = gapData?.gaps.map((g) => ({
    name: g.competency_name.length > 15 ? g.competency_name.slice(0, 15) + "…" : g.competency_name,
    required: g.required_level,
    actual: g.actual_level,
  })) || [];

  return (
    <div className="space-y-6">
      <FallbackBanner />
      <Select value={selectedEmpId} onValueChange={setSelectedEmpId}>
        <SelectTrigger className="max-w-md">
          <SelectValue placeholder="Select an employee..." />
        </SelectTrigger>
        <SelectContent>
          {employees.map((e) => (
            <SelectItem key={e.id} value={e.id}>
              {e.full_name} — {e.role_name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {gapData && (
        <>
          {/* Summary Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard icon={<Target className="h-4 w-4" />} label="Total Gaps" value={gapData.total_gaps} />
            <StatCard icon={<AlertTriangle className="h-4 w-4" />} label="Critical Gaps" value={gapData.critical_gaps} iconClassName="bg-destructive/10 text-destructive" />
            <StatCard icon={<TrendingDown className="h-4 w-4" />} label="High Gaps" value={gapData.high_gaps} iconClassName="bg-warning/10 text-warning" />
            <StatCard icon={<Shield className="h-4 w-4" />} label="Readiness" value={`${gapData.readiness_percentage}%`} iconClassName="bg-success/10 text-success" />
          </div>

          {/* Radar Chart */}
          {radarData.length > 0 && (
            <div className="glass rounded-card p-5">
              <h3 className="text-sm font-semibold text-foreground mb-4">Competency Radar</h3>
              <ResponsiveContainer width="100%" height={320}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="hsl(var(--border))" />
                  <PolarAngleAxis dataKey="name" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                  <PolarRadiusAxis angle={30} domain={[0, 5]} tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                  <Radar name="Required" dataKey="required" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.15} />
                  <Radar name="Actual" dataKey="actual" stroke="hsl(var(--success))" fill="hsl(var(--success))" fillOpacity={0.25} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Gap Details Table */}
          <div className="glass rounded-card p-5">
            <h3 className="text-sm font-semibold text-foreground mb-4">Gap Details</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Competency</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-center">Safety</TableHead>
                  <TableHead>Required</TableHead>
                  <TableHead>Actual</TableHead>
                  <TableHead className="text-center">Gap</TableHead>
                  <TableHead>Severity</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {gapData.gaps.map((g) => {
                  const sev = SEVERITY_CONFIG[g.severity];
                  return (
                    <TableRow key={g.competency_id}>
                      <TableCell className="font-medium">{g.competency_name}</TableCell>
                      <TableCell><span className="text-xs font-medium px-2 py-0.5 rounded-full bg-muted text-muted-foreground capitalize">{g.category}</span></TableCell>
                      <TableCell className="text-center">
                        {g.is_safety_critical ? <AlertTriangle className="h-4 w-4 text-warning mx-auto" /> : "—"}
                      </TableCell>
                      <TableCell><LevelIndicator level={g.required_level} size="sm" /></TableCell>
                      <TableCell><LevelIndicator level={g.actual_level} size="sm" /></TableCell>
                      <TableCell className="text-center">
                        <span className={cn(
                          "inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold",
                          g.gap === 0 ? "bg-success/10 text-success" :
                          g.gap <= 2 ? "bg-warning/10 text-warning" :
                          "bg-destructive/10 text-destructive"
                        )}>
                          {g.gap}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full border", sev.color)}>
                          {sev.label}
                        </span>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </>
      )}
    </div>
  );
}

// ======================== TAB 2: ROLE READINESS ========================
function RoleReadinessTab() {
  const { data: apiData } = useRoleReadiness();
  const roles: RoleReadinessItem[] = apiData || MOCK_ROLE_READINESS;

  return (
    <div className="space-y-6">
      <FallbackBanner />
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {roles.map((r) => {
          const readinessColor =
            r.average_readiness >= 80 ? "text-success" :
            r.average_readiness >= 60 ? "text-warning" :
            "text-destructive";
          return (
            <div key={r.role_id} className="glass glass-hover rounded-card p-5 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-foreground">{r.role_name}</h3>
                  <p className="text-xs text-muted-foreground">{r.department} • {r.total_employees} employees</p>
                </div>
                <span className={cn("text-xl font-bold tabular-nums", readinessColor)}>
                  {r.average_readiness}%
                </span>
              </div>

              <Progress
                value={r.average_readiness}
                className="h-2"
              />

              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="rounded-lg bg-success/10 p-2">
                  <p className="text-lg font-bold text-success tabular-nums">{r.fully_qualified}</p>
                  <p className="text-[10px] text-muted-foreground">Qualified</p>
                </div>
                <div className="rounded-lg bg-warning/10 p-2">
                  <p className="text-lg font-bold text-warning tabular-nums">{r.partially_qualified}</p>
                  <p className="text-[10px] text-muted-foreground">Partial</p>
                </div>
                <div className="rounded-lg bg-destructive/10 p-2">
                  <p className="text-lg font-bold text-destructive tabular-nums">{r.unqualified}</p>
                  <p className="text-[10px] text-muted-foreground">Unqualified</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ======================== TAB 3: TEAM ANALYSIS ========================
function TeamAnalysisTab() {
  const navigate = useNavigate();
  const [department, setDepartment] = useState("");

  const { data: apiData } = useTeamAnalysis(department ? { department } : {});
  const teamData: TeamAnalysis | null = apiData || (department ? buildMockTeamAnalysis(department) : null);

  return (
    <div className="space-y-6">
      <FallbackBanner />
      <Select value={department} onValueChange={setDepartment}>
        <SelectTrigger className="max-w-md">
          <SelectValue placeholder="Filter by department..." />
        </SelectTrigger>
        <SelectContent>
          {DEPARTMENTS.map((d) => (
            <SelectItem key={d} value={d}>{d}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      {teamData && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <StatCard icon={<Users className="h-4 w-4" />} label="Team Size" value={teamData.team_size} />
            <StatCard icon={<BarChart3 className="h-4 w-4" />} label="Team Readiness" value={`${teamData.team_readiness}%`} />
            {teamData.manager_name && (
              <StatCard icon={<Users className="h-4 w-4" />} label="Manager" value={teamData.manager_name} />
            )}
          </div>

          <div className="glass rounded-card p-5">
            <h3 className="text-sm font-semibold text-foreground mb-4">Team Members</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Readiness</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {teamData.members.map((m) => {
                  const color =
                    m.readiness >= 80 ? "text-success" :
                    m.readiness >= 60 ? "text-warning" :
                    "text-destructive";
                  return (
                    <TableRow
                      key={m.employee_id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => navigate(`/employees/${m.employee_id}`)}
                    >
                      <TableCell className="font-medium">{m.employee_name}</TableCell>
                      <TableCell className="text-muted-foreground">{m.role_name}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3 max-w-[200px]">
                          <Progress value={m.readiness} className="h-2 flex-1" />
                          <span className={cn("text-xs font-semibold tabular-nums w-10 text-right", color)}>
                            {m.readiness}%
                          </span>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </>
      )}
    </div>
  );
}

// ======================== MAIN PAGE ========================
export default function AnalyticsPage() {
  return (
    <AppLayout>
      <PageHeader
        title="Analytics"
        subtitle="Competency gap analysis and workforce readiness insights"
      />

      <Tabs defaultValue="gap" className="space-y-6">
        <TabsList>
          <TabsTrigger value="gap">Employee Gap Analysis</TabsTrigger>
          <TabsTrigger value="readiness">Role Readiness</TabsTrigger>
          <TabsTrigger value="team">Team Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="gap">
          <GapAnalysisTab />
        </TabsContent>
        <TabsContent value="readiness">
          <RoleReadinessTab />
        </TabsContent>
        <TabsContent value="team">
          <TeamAnalysisTab />
        </TabsContent>
      </Tabs>
    </AppLayout>
  );
}
