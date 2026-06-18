import { useState } from "react";
import { Link } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Sparkles, AlertTriangle, Lightbulb, TrendingUp, Users, Briefcase, Zap, Info, BarChart3, Loader2, RefreshCw, Target, Shield, BookOpen, TrendingDown, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useAiOrgInsights, type AiOrgInsightsResponse, type TrainingRecommendation, type ReadinessSummary } from "@/services/analytics";
import { useAuth } from "@/hooks/useAuth";
import ReactMarkdown from "react-markdown";

function parseTopGapAnalysis(text: string) {
  const recommendations: string[] = [];
  const priorityActions: { action: string; severity: "critical" | "high" | "medium" }[] = [];

  const recMatch = text.match(/\*\*Recommendations:\*\*\n\n((?:- .+\n?)+)/);
  if (recMatch) {
    recommendations.push(...recMatch[1].split("\n").filter(l => l.startsWith("- ")).map(l => l.slice(2).trim()));
  }

  const riskMatch = text.match(/Gaps posing the biggest risk to operations or safety:([\s\S]*?)(?:\n\d\.|$)/);
  if (riskMatch) {
    const items = riskMatch[1].match(/- .+/g);
    if (items) {
      items.forEach(item => {
        priorityActions.push({ action: item.slice(2).trim(), severity: "critical" });
      });
    }
  }

  const impactMatch = text.match(/Gaps affecting the most employees and having the broadest impact:([\s\S]*?)(?:\n\d\.|$)/);
  if (impactMatch) {
    const items = impactMatch[1].match(/- .+/g);
    if (items) {
      items.forEach(item => {
        priorityActions.push({ action: item.slice(2).trim(), severity: "high" });
      });
    }
  }

  const interventionMatch = text.match(/Highest-impact intervention:([\s\S]*?)(?:\n\*\*Recommendations:|$)/);
  if (interventionMatch) {
    const text2 = interventionMatch[1];
    const boldMatch = text2.match(/\*\*(.+?)\*\*/);
    if (boldMatch) {
      priorityActions.unshift({ action: boldMatch[1].trim(), severity: "critical" });
    }
  }

  return { recommendations, priorityActions };
}

function transformTrainingRecommendations(recs: TrainingRecommendation[]) {
  return recs.map((r, i) => {
    const impactStr = String(r.estimated_impact || "");
    return {
      id: i + 1,
      name: r.title,
      target: r.target_gaps.join(", "),
      participants: parseInt(impactStr.replace(/\D/g, "")) || 0,
      priority: r.priority,
      duration: r.category === "safety" ? "3 days" : r.category === "technical" ? "1 week" : "5 days",
    };
  });
}

function transformDepartmentInsights(readinessSummaries: ReadinessSummary[]) {
  return readinessSummaries.map(r => ({
    department: r.role_name,
    readiness: Math.round(r.readiness_percentage),
    topGap: r.status_summary.match(/gap in (?:this|these) (?:area|areas)[^.]*\.?/i)?.[0]?.replace(/gap in (?:this|these) (?:area|areas) /i, "")?.replace(".", "") || "Multiple gaps",
    employees_affected: r.total_employees,
  }));
}

function FallbackBanner() {
  return (
    <Alert className="mb-4 border-info/20 bg-info/5">
      <Info className="h-4 w-4 text-info" />
      <AlertDescription className="text-xs text-muted-foreground">
        AI insights are powered by GPT-4. Showing organizational-wide recommendations based on current competency data.
      </AlertDescription>
    </Alert>
  );
}

function InsightsTab({ data, isLoading, error }: { data: AiOrgInsightsResponse | undefined; isLoading: boolean; error: Error | null }) {
  const severityStyles = {
    critical: "border-destructive/40 bg-destructive/10",
    high: "border-warning/40 bg-warning/10",
    medium: "border-primary/40 bg-primary/10",
  };

  const severityIcons = {
    critical: <AlertTriangle className="h-4 w-4 text-destructive shrink-0" />,
    high: <AlertTriangle className="h-4 w-4 text-warning shrink-0" />,
    medium: <Zap className="h-4 w-4 text-primary shrink-0" />,
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-48 w-full bg-muted rounded-card" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Skeleton className="h-24 bg-muted rounded-card" />
          <Skeleton className="h-24 bg-muted rounded-card" />
          <Skeleton className="h-24 bg-muted rounded-card" />
          <Skeleton className="h-24 bg-muted rounded-card" />
        </div>
        <Skeleton className="h-64 w-full bg-muted rounded-card" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="mb-4">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>Failed to load AI insights: {error.message}</AlertDescription>
      </Alert>
    );
  }

  if (!data) return null;

  const { recommendations, priorityActions } = parseTopGapAnalysis(data.top_gap_analysis);
  const report = data.workforce_readiness_report;
  const trends = data.competency_trends;

  const overallReadiness = Math.round(report.readiness_score);
  const criticalGaps = report.critical_gaps;
  const totalEmployees = data.readiness_summaries.reduce((sum, r) => sum + r.total_employees, 0);
  const trainingNeeded = data.training_recommendations.reduce((sum, t) => sum + (parseInt(t.estimated_impact.replace(/\D/g, "")) || 0), 0);
  const certifiedPercentage = overallReadiness;

  return (
    <div className="space-y-6 animate-fade-in">
      <FallbackBanner />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="glass border-border/50">
          <CardContent className="pt-6 text-center">
            <TrendingUp className="h-5 w-5 mx-auto mb-2 text-primary" />
            <p className="text-2xl font-bold">{overallReadiness}%</p>
            <p className="text-xs text-muted-foreground">Overall Readiness</p>
          </CardContent>
        </Card>
        <Card className="glass border-border/50">
          <CardContent className="pt-6 text-center">
            <AlertTriangle className="h-5 w-5 mx-auto mb-2 text-destructive" />
            <p className="text-2xl font-bold">{criticalGaps}</p>
            <p className="text-xs text-muted-foreground">Critical Gaps</p>
          </CardContent>
        </Card>
        <Card className="glass border-border/50">
          <CardContent className="pt-6 text-center">
            <Users className="h-5 w-5 mx-auto mb-2 text-warning" />
            <p className="text-2xl font-bold">{trainingNeeded}</p>
            <p className="text-xs text-muted-foreground">Need Training</p>
          </CardContent>
        </Card>
        <Card className="glass border-border/50">
          <CardContent className="pt-6 text-center">
            <Briefcase className="h-5 w-5 mx-auto mb-2 text-success" />
            <p className="text-2xl font-bold">{certifiedPercentage}%</p>
            <p className="text-xs text-muted-foreground">Certified</p>
          </CardContent>
        </Card>
      </div>

      <Card className="glass border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            Executive Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground leading-relaxed prose prose-sm max-w-none">
            <ReactMarkdown>{report.executive_summary}</ReactMarkdown>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="glass border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-warning" />
              Key Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {recommendations.map((rec, i) => (
                <li key={i} className="flex items-start gap-3 text-sm">
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                  <span className="text-muted-foreground">{rec}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card className="glass border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-destructive" />
              Priority Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {priorityActions.map((action, i) => (
              <div
                key={i}
                className={cn("rounded-lg border p-3 flex items-start gap-3", severityStyles[action.severity])}
              >
                {severityIcons[action.severity]}
                <div>
                  <Badge variant="outline" className="text-xs mb-1">{action.severity.toUpperCase()}</Badge>
                  <p className="text-sm text-muted-foreground">{action.action}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card className="glass border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-primary" />
            Competency Trends
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {Object.entries(trends.category_distribution).map(([category, stats]) => (
              <div key={category} className="p-3 rounded-lg bg-muted/50">
                <p className="text-xs font-medium capitalize text-muted-foreground">{category.replace("_", " ")}</p>
                <p className="text-lg font-bold">{stats.assessed}/{stats.total}</p>
                <p className="text-xs text-muted-foreground">Avg Level: {stats.avg_level.toFixed(1)}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-border/50">
            <p className="text-xs text-muted-foreground">
              Total Competencies: <strong>{trends.total_competencies}</strong> | 
              Total Assessments: <strong>{trends.total_assessments}</strong> | 
              Safety-Critical: <strong>{trends.safety_critical_stats.assessed}/{trends.safety_critical_stats.total}</strong> assessed
            </p>
          </div>
        </CardContent>
      </Card>

          <Card className="glass border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-primary" />
            Workforce Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground leading-relaxed prose prose-sm max-w-none">
            <ReactMarkdown>{data.workforce_summary}</ReactMarkdown>
          </div>
        </CardContent>
      </Card>

      <Card className="glass border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-4 w-4 text-primary" />
            Gap Analysis Detail
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground leading-relaxed prose prose-sm max-w-none">
            <ReactMarkdown>{data.top_gap_analysis}</ReactMarkdown>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function TrainingTab({ data, isLoading }: { data: AiOrgInsightsResponse | undefined; isLoading: boolean }) {
  const [selectedDept, setSelectedDept] = useState<string>("all");

  const trainingData = transformTrainingRecommendations(data?.training_recommendations || []);

  const filteredSuggestions = selectedDept === "all"
    ? trainingData
    : trainingData.filter((t) => t.target.toLowerCase().includes(selectedDept.toLowerCase()));

  const priorityColors = {
    critical: "bg-destructive text-destructive-foreground",
    high: "bg-warning text-warning-foreground",
    medium: "bg-primary/20 text-primary",
    low: "bg-muted text-muted-foreground",
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <FallbackBanner />
          <Skeleton className="w-48 h-10" />
        </div>
        <div className="grid gap-4">
          {[1, 2, 3, 4, 5].map(i => (
            <Skeleton key={i} className="h-28 bg-muted rounded-card" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <FallbackBanner />
        <Select value={selectedDept} onValueChange={setSelectedDept}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="safety">Safety</SelectItem>
            <SelectItem value="technical">Technical</SelectItem>
            <SelectItem value="process">Process</SelectItem>
            <SelectItem value="soft_skills">Soft Skills</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4">
        {filteredSuggestions.map((training) => (
          <Card key={training.id} className="glass border-border/50">
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-sm">{training.name}</h4>
                    <Badge className={cn("text-xs", priorityColors[training.priority as keyof typeof priorityColors])}>
                      {training.priority}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">{training.target}</p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Users className="h-3 w-3" /> {training.participants} participants
                    </span>
                    <span className="flex items-center gap-1">
                      <BarChart3 className="h-3 w-3" /> {training.duration}
                    </span>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  Assign
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {filteredSuggestions.length === 0 && (
          <Card className="glass border-border/50">
            <CardContent className="p-8 text-center text-muted-foreground">
              No training suggestions match the selected filter.
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

function DepartmentTab({ data, isLoading }: { data: AiOrgInsightsResponse | undefined; isLoading: boolean }) {
  const departmentInsights = transformDepartmentInsights(data?.readiness_summaries || []);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <FallbackBanner />
        <div className="grid gap-4">
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="h-20 bg-muted rounded-card" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <FallbackBanner />

      <div className="grid gap-4">
        {departmentInsights.map((dept) => (
          <Card key={dept.department} className="glass border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <h4 className="font-medium">{dept.department}</h4>
                </div>
                <Badge variant={dept.readiness >= 80 ? "default" : dept.readiness >= 65 ? "secondary" : "destructive"}>
                  {dept.readiness}% Ready
                </Badge>
              </div>
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span>Top Gap: <strong>{dept.topGap}</strong></span>
                <span>{dept.employees_affected} employees affected</span>
              </div>
              <div className="mt-3 h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-500"
                  style={{ width: `${dept.readiness}%` }}
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

const AiPage = () => {
  const { isAuthenticated } = useAuth();
  const { data, isLoading, error, refetch } = useAiOrgInsights({ enabled: isAuthenticated });

  if (!isAuthenticated) {
    return (
      <AppLayout>
        <PageHeader
          title="AI Assistant"
          subtitle="Organization-wide competency insights powered by AI"
        />
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/15 text-primary">
            <Lock className="h-7 w-7" />
          </div>
          <h3 className="text-lg font-medium mb-2">Authentication Required</h3>
          <p className="text-sm text-muted-foreground max-w-md mb-6">
            Please log in to access AI-powered organizational insights and training recommendations.
          </p>
          <Button asChild className="gap-2">
            <Link to="/login"><Sparkles className="h-4 w-4" /> Sign In to Continue</Link>
          </Button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <PageHeader
        title="AI Assistant"
        subtitle="Organization-wide competency insights powered by AI"
        action={
          <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isLoading} className="gap-2">
            <RefreshCw className={cn("h-3.5 w-3.5", isLoading && "animate-spin")} />
            Refresh
          </Button>
        }
      />

      <Tabs defaultValue="insights" className="space-y-6">
        <TabsList className="glass border border-border/50">
          <TabsTrigger value="insights">Insights</TabsTrigger>
          <TabsTrigger value="training">Training Suggestions</TabsTrigger>
          <TabsTrigger value="departments">By Department</TabsTrigger>
        </TabsList>

        <TabsContent value="insights">
          <InsightsTab data={data} isLoading={isLoading} error={error} />
        </TabsContent>

        <TabsContent value="training">
          <TrainingTab data={data} isLoading={isLoading} />
        </TabsContent>

        <TabsContent value="departments">
          <DepartmentTab data={data} isLoading={isLoading} />
        </TabsContent>
      </Tabs>
    </AppLayout>
  );
};

export default AiPage;