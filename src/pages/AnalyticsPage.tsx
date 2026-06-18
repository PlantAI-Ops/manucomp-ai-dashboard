import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { PageHeader } from "@/components/PageHeader";
import { StatCard } from "@/components/StatCard";
import { LevelIndicator } from "@/components/LevelIndicator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useEmployeesForSelect } from "@/services/employees";
import { useDepartments } from "@/services/departments";
import {
  useGapAnalysis,
  useRoleReadiness,
  useTeamAnalysis,
  useAiOrgInsights,
  buildMockGapAnalysis,
  buildMockAiOrgInsights,
  MOCK_ROLE_READINESS,
  buildMockTeamAnalysis,
  type GapAnalysis,
  type RoleReadinessItem,
  type TeamAnalysis,
  type TeamMember,
  type TeamMemberGap,
  type AiOrgInsightsResponse,
  type TrainingRecommendation,
  type ReadinessSummary,
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
  Brain,
  BookOpen,
  TrendingUp,
  AlertCircle,
  FileText,
  Sparkles,
  Users2,
  TrendingUp as TrendingUpIcon,
  PieChart,
} from "lucide-react";
import ReactMarkdown from "react-markdown";

const SEVERITY_CONFIG: Record<string, { color: string; label: string }> = {
  critical: { color: "text-destructive bg-destructive/10 border-destructive/20", label: "Critical" },
  high: { color: "text-warning bg-warning/10 border-warning/20", label: "High" },
  medium: { color: "text-info bg-info/10 border-info/20", label: "Medium" },
  low: { color: "text-muted-foreground bg-muted border-border", label: "Low" },
};

const PRIORITY_CONFIG: Record<string, { color: string; icon: React.ReactNode; label: string }> = {
  high: { color: "text-destructive bg-destructive/10", icon: <AlertCircle className="h-3 w-3" />, label: "High" },
  medium: { color: "text-warning bg-warning/10", icon: <TrendingUp className="h-3 w-3 w-3" />, label: "Medium" },
  low: { color: "text-info bg-info/10", icon: <BookOpen className="h-3 w-3" />, label: "Low" },
};

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
  const { data: employeesData } = useEmployeesForSelect();
  const employees = employeesData ?? [];

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
  const { data: departmentsData } = useDepartments();
  const departments = departmentsData?.map(d => d.name) ?? [];

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
          {departments.map((d) => (
            <SelectItem key={d} value={d}>{d}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      {teamData && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard icon={<Users className="h-4 w-4" />} label="Team Size" value={teamData.team_size} />
            <StatCard icon={<BarChart3 className="h-4 w-4" />} label="Team Readiness" value={`${teamData.team_readiness}%`} />
            {teamData.supervisor_name && teamData.supervisor_name !== "Unknown" && (
              <StatCard icon={<Users className="h-4 w-4" />} label="Supervisor" value={teamData.supervisor_name} />
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
                  <TableHead>Critical Gaps</TableHead>
                  <TableHead>High Gaps</TableHead>
                  <TableHead>Total Gaps</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {teamData.members.map((m: TeamMember) => {
                  const readiness = m.readiness_percentage;
                  const color =
                    readiness >= 80 ? "text-success" :
                    readiness >= 60 ? "text-warning" :
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
                          <Progress value={readiness} className="h-2 flex-1" />
                          <span className={cn("text-xs font-semibold tabular-nums w-10 text-right", color)}>
                            {readiness}%
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className={cn(
                          "inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold",
                          m.critical_gaps > 0 ? "bg-destructive/10 text-destructive" : "bg-success/10 text-success"
                        )}>
                          {m.critical_gaps}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className={cn(
                          "inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold",
                          m.high_gaps > 0 ? "bg-warning/10 text-warning" : "bg-success/10 text-success"
                        )}>
                          {m.high_gaps}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className={cn(
                          "inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold",
                          m.total_gaps > 0 ? "bg-info/10 text-info" : "bg-success/10 text-success"
                        )}>
                          {m.total_gaps}
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

// ======================== TAB 4: AI ORG INSIGHTS ========================
function AiOrgInsightsTab() {
  const { data: apiData } = useAiOrgInsights();
  const insights: AiOrgInsightsResponse | null = apiData || buildMockAiOrgInsights();

  if (!insights) return null;

  const report = insights.workforce_readiness_report;
  const reportColor =
    report.status === "good"
      ? "border-success/30 bg-success/5"
      : report.status === "warning"
        ? "border-warning/30 bg-warning/5"
        : "border-destructive/30 bg-destructive/5";
  const reportBadge =
    report.status === "good"
      ? "bg-success/10 text-success"
      : report.status === "warning"
        ? "bg-warning/10 text-warning"
        : "bg-destructive/10 text-destructive";
  const reportLabel =
    report.status === "good" ? "Healthy" : report.status === "warning" ? "Needs Attention" : "Critical";

  return (
    <div className="space-y-6">
      <FallbackBanner />

      {/* Executive Readiness Report */}
      <Card className={cn("border", reportColor)}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2 text-base">
                <Sparkles className="h-4 w-4 text-primary" />
                Workforce Readiness Report
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-1">AI-generated executive summary</p>
            </div>
            <div className="flex items-center gap-3">
              <span className={cn("text-xs font-semibold px-2 py-1 rounded-full", reportBadge)}>
                {reportLabel}
              </span>
              <div className="text-right">
                <p className="text-2xl font-bold tabular-nums">{report.readiness_score}%</p>
                <p className="text-[10px] text-muted-foreground">Overall readiness</p>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="prose prose-sm max-w-none dark:prose-invert text-foreground">
            <ReactMarkdown>{report.executive_summary}</ReactMarkdown>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Workforce Summary */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Users2 className="h-4 w-4 text-primary" />
              Workforce Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none dark:prose-invert text-foreground">
              <ReactMarkdown>{insights.workforce_summary}</ReactMarkdown>
            </div>
          </CardContent>
        </Card>

        {/* Top Gap Analysis */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <AlertTriangle className="h-4 w-4 text-warning" />
              Top Gap Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none dark:prose-invert text-foreground">
              <ReactMarkdown>{insights.top_gap_analysis}</ReactMarkdown>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Readiness by Role */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <PieChart className="h-4 w-4 text-primary" />
            Readiness by Role
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {insights.readiness_summaries.map((r: ReadinessSummary) => {
              const color =
                r.readiness_percentage >= 80
                  ? "bg-success/10 border-success/30"
                  : r.readiness_percentage >= 60
                    ? "bg-warning/10 border-warning/30"
                    : "bg-destructive/10 border-destructive/30";
              const text =
                r.readiness_percentage >= 80
                  ? "text-success"
                  : r.readiness_percentage >= 60
                    ? "text-warning"
                    : "text-destructive";
              return (
                <div key={r.role_id} className={cn("rounded-lg border p-3 space-y-2", color)}>
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-sm text-foreground">{r.role_name}</h4>
                    <span className={cn("text-lg font-bold tabular-nums", text)}>
                      {r.readiness_percentage}%
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {r.total_employees} employees
                  </p>
                  <p className="text-xs text-foreground/80">{r.status_summary}</p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Training Recommendations */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <BookOpen className="h-4 w-4 text-primary" />
            Training Recommendations
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            {insights.training_recommendations.length} programs suggested
          </p>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-3">
              {insights.training_recommendations.map((rec: TrainingRecommendation, i: number) => {
                const cfg = PRIORITY_CONFIG[rec.priority];
                return (
                  <div key={i} className="rounded-lg border border-border bg-muted/30 p-4 space-y-2">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-sm text-foreground">{rec.title}</h4>
                          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-muted text-muted-foreground capitalize">
                            {rec.category}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">{rec.description}</p>
                      </div>
                      <span
                        className={cn(
                          "inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full whitespace-nowrap",
                          cfg.color
                        )}
                      >
                        {cfg.icon}
                        {cfg.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <TrendingUpIcon className="h-3 w-3 text-success" />
                      <span className="text-muted-foreground">Impact:</span>
                      <span className="font-medium text-foreground">{rec.estimated_impact}</span>
                    </div>
                    {rec.target_gaps.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {rec.target_gaps.map((g, j) => (
                          <Badge key={j} variant="outline" className="text-[10px]">
                            {g}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Competency Trends */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <BarChart3 className="h-4 w-4 text-primary" />
            Competency Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {Object.entries(insights.competency_trends.category_distribution).map(([cat, stats]) => (
              <div key={cat} className="rounded-lg bg-muted/30 border border-border p-3 space-y-1">
                <p className="text-xs font-medium text-muted-foreground capitalize">
                  {cat.replace("_", " ")}
                </p>
                <p className="text-2xl font-bold tabular-nums">{stats.avg_level.toFixed(1)}</p>
                <p className="text-[10px] text-muted-foreground">
                  {stats.assessed} assessments • {stats.total} competencies
                </p>
              </div>
            ))}
          </div>
          <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
            <span>
              <strong className="text-foreground">{insights.competency_trends.total_competencies}</strong> competencies
            </span>
            <span>
              <strong className="text-foreground">{insights.competency_trends.total_assessments}</strong> total assessments
            </span>
            <span>
              <strong className="text-foreground">
                {insights.competency_trends.safety_critical_stats.assessed}
              </strong>{" "}
              / {insights.competency_trends.safety_critical_stats.total} safety-critical assessed
            </span>
          </div>
        </CardContent>
      </Card>
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
          <TabsTrigger value="ai">AI Org Insights</TabsTrigger>
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
        <TabsContent value="ai">
          <AiOrgInsightsTab />
        </TabsContent>
      </Tabs>
    </AppLayout>
  );
}
