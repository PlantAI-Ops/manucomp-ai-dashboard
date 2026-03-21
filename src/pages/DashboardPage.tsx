import { useQuery } from "@tanstack/react-query";
import { AppLayout } from "@/components/AppLayout";
import { PageHeader } from "@/components/PageHeader";
import { StatCard } from "@/components/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/StatusBadge";
import {
  Users, Briefcase, Award, ClipboardCheck, AlertTriangle, BarChart3, Eye,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Legend,
} from "recharts";
import {
  fetchDashboardSummary,
  MOCK_DASHBOARD,
  type DashboardSummary,
} from "@/services/dashboard";

const DashboardPage = () => {
  const { data, isLoading, isError } = useQuery<DashboardSummary>({
    queryKey: ["dashboard-summary"],
    queryFn: fetchDashboardSummary,
    retry: false,
  });

  const useMock = isError || !data;
  const summary = data ?? MOCK_DASHBOARD;

  return (
    <AppLayout>
      <PageHeader
        title="Dashboard"
        subtitle="Manufacturing competency overview"
      />

      {/* Stat Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="animate-in-up stagger-1">
          <StatCard
            icon={<Users className="h-5 w-5" />}
            label="Total Employees"
            value={isLoading ? "—" : summary.total_employees}
          />
        </div>
        <div className="animate-in-up stagger-2">
          <StatCard
            icon={<Briefcase className="h-5 w-5" />}
            label="Total Roles"
            value={isLoading ? "—" : summary.total_roles}
            iconClassName="bg-secondary/10 text-secondary"
          />
        </div>
        <div className="animate-in-up stagger-3">
          <StatCard
            icon={<Award className="h-5 w-5" />}
            label="Total Competencies"
            value={isLoading ? "—" : summary.total_competencies}
            iconClassName="bg-purple/10 text-purple"
          />
        </div>
        <div className="animate-in-up stagger-4">
          <StatCard
            icon={<ClipboardCheck className="h-5 w-5" />}
            label="Assessment Coverage"
            value={isLoading ? "—" : `${summary.assessment_percentage.toFixed(1)}%`}
            iconClassName="bg-success/10 text-success"
          />
        </div>
      </div>

      {/* API stub banner */}
      {useMock && !isLoading && (
        <div className="animate-fade-in mt-2 flex items-center gap-2 rounded-card border border-warning/20 bg-warning/5 px-4 py-2.5 text-sm text-warning">
          <BarChart3 className="h-4 w-4 shrink-0" />
          Analytics coming soon — showing sample data
        </div>
      )}

      {/* Charts Row */}
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        {/* Role Readiness */}
        <Card className="glass border-border/40 animate-in-up stagger-3">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Role Readiness</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-6 w-full" />
                ))}
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart
                  layout="vertical"
                  data={summary.role_readiness}
                  margin={{ top: 0, right: 16, bottom: 0, left: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(222 20% 20%)" horizontal={false} />
                  <XAxis type="number" tick={{ fill: "hsl(215 20% 55%)", fontSize: 12 }} />
                  <YAxis
                    dataKey="role_name"
                    type="category"
                    width={110}
                    tick={{ fill: "hsl(213 31% 91%)", fontSize: 12 }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(222 41% 11%)",
                      border: "1px solid hsl(222 20% 20%)",
                      borderRadius: 8,
                      color: "hsl(213 31% 91%)",
                      fontSize: 12,
                    }}
                  />
                  <Legend
                    wrapperStyle={{ fontSize: 12, color: "hsl(215 20% 55%)" }}
                  />
                  <Bar dataKey="fully_qualified" name="Fully Qualified" stackId="a" fill="hsl(168 76% 40%)" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="partially_qualified" name="Partially Qualified" stackId="a" fill="hsl(38 92% 50%)" />
                  <Bar dataKey="unqualified" name="Unqualified" stackId="a" fill="hsl(0 84% 60%)" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Top Skill Gaps */}
        <Card className="glass border-border/40 animate-in-up stagger-4">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Top Skill Gaps</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-6 w-full" />
                ))}
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart
                  data={summary.top_skill_gaps}
                  margin={{ top: 0, right: 16, bottom: 0, left: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(222 20% 20%)" vertical={false} />
                  <XAxis
                    dataKey="competency_name"
                    tick={{ fill: "hsl(215 20% 55%)", fontSize: 11 }}
                    angle={-35}
                    textAnchor="end"
                    height={70}
                  />
                  <YAxis tick={{ fill: "hsl(215 20% 55%)", fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(222 41% 11%)",
                      border: "1px solid hsl(222 20% 20%)",
                      borderRadius: 8,
                      color: "hsl(213 31% 91%)",
                      fontSize: 12,
                    }}
                  />
                  <Bar dataKey="gap_count" name="Gap Count" radius={[4, 4, 0, 0]}>
                    {summary.top_skill_gaps.map((entry, idx) => (
                      <Cell
                        key={idx}
                        fill={
                          entry.gap_count >= 15
                            ? "hsl(0 84% 60%)"
                            : entry.gap_count >= 10
                            ? "hsl(38 92% 50%)"
                            : "hsl(217 91% 60%)"
                        }
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Critical Gaps Alert Panel */}
      <Card className="glass border-border/40 mt-6 animate-in-up stagger-5">
        <CardHeader className="flex-row items-center justify-between pb-2">
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <AlertTriangle className="h-4 w-4 text-destructive" />
            Critical Gaps
          </CardTitle>
          <Badge variant="destructive" className="text-xs">
            {summary.critical_gap_details?.length ?? 0} issues
          </Badge>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : (
            <div className="divide-y divide-border/40">
              {(summary.critical_gap_details ?? []).map((gap, idx) => (
                <div
                  key={idx}
                  className="flex flex-wrap items-center justify-between gap-2 py-3 first:pt-0 last:pb-0"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="font-medium text-sm truncate">{gap.employee_name}</span>
                    <span className="text-muted-foreground text-xs truncate hidden sm:inline">
                      {gap.competency_name}
                    </span>
                    <span className="text-muted-foreground text-xs sm:hidden truncate">
                      {gap.competency_name}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground">Gap: {gap.gap}</span>
                    <StatusBadge variant={gap.severity === "critical" ? "danger" : "warning"}>
                      {gap.severity}
                    </StatusBadge>
                    <Button variant="ghost" size="sm" className="h-7 text-xs">
                      <Eye className="mr-1 h-3 w-3" /> Details
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </AppLayout>
  );
};

export default DashboardPage;
