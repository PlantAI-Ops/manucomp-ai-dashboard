import { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Sparkles, AlertTriangle, Lightbulb, TrendingUp, Users, Briefcase, Zap, Info, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const MOCK_INSIGHTS = {
  summary: "The organization shows strong readiness in Quality Inspection and Lean Manufacturing competencies. However, critical gaps exist in CNC Programming and Welding skills across multiple departments. Immediate training interventions recommended for Assembly and Welding teams.",
  recommendations: [
    "Implement CNC Programming bootcamp for Assembly team within Q2",
    "Establish mentorship program pairing senior welders with newer employees",
    "Deploy ISO 9001 refresher training across Quality department",
    "Consider cross-training program for Maintenance technicians in SPC Analysis",
  ],
  priority_actions: [
    { action: "12 employees lack Lockout/Tagout certification — compliance risk", severity: "critical" as const },
    { action: "5 CNC operators below required proficiency in 5-Axis Machining", severity: "critical" as const },
    { action: "Forklift Operation certifications expiring for 8 employees", severity: "high" as const },
    { action: "Welding TIG skills gap affecting production quality metrics", severity: "high" as const },
  ],
  workforce_metrics: {
    overall_readiness: 72,
    critical_gaps: 17,
    training_needed: 45,
    certified_employees: 89,
  },
  department_insights: [
    { department: "Assembly", readiness: 68, topGap: "5-Axis Machining", employees_affected: 8 },
    { department: "Quality", readiness: 85, topGap: "SPC Analysis", employees_affected: 3 },
    { department: "Welding", readiness: 61, topGap: "Welding - TIG", employees_affected: 6 },
    { department: "CNC", readiness: 74, topGap: "CNC Programming", employees_affected: 5 },
    { department: "Maintenance", readiness: 79, topGap: "Blueprint Reading", employees_affected: 4 },
    { department: "Safety", readiness: 91, topGap: "Lean Manufacturing", employees_affected: 2 },
  ],
};

const MOCK_TRAINING_SUGGESTIONS = [
  { id: 1, name: "CNC Programming Fundamentals", target: "Assembly Team", participants: 8, priority: "critical", duration: "2 weeks" },
  { id: 2, name: "Advanced TIG Welding", target: "Welding Team", participants: 6, priority: "high", duration: "1 week" },
  { id: 3, name: "Lockout/Tagout Certification", target: "All Departments", participants: 12, priority: "critical", duration: "3 days" },
  { id: 4, name: "SPC Analysis Mastery", target: "Quality Team", participants: 5, priority: "medium", duration: "1 week" },
  { id: 5, name: "Blueprint Reading Advanced", target: "Maintenance Team", participants: 4, priority: "medium", duration: "5 days" },
  { id: 6, name: "Lean Manufacturing Principles", target: "Safety Team", participants: 3, priority: "low", duration: "3 days" },
];

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

function InsightsTab() {
  const [loading, setLoading] = useState(false);
  const [insights, setInsights] = useState<typeof MOCK_INSIGHTS | null>(null);

  const handleGenerate = async () => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1500));
    setInsights(MOCK_INSIGHTS);
    setLoading(false);
    toast.success("AI insights generated successfully");
  };

  if (!insights && !loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/15 text-primary">
          <Sparkles className="h-7 w-7" />
        </div>
        <h3 className="text-lg font-medium mb-2">Organization AI Assistant</h3>
        <p className="text-sm text-muted-foreground max-w-md mb-6">
          Generate comprehensive AI-powered insights about your workforce competency landscape.
          Get actionable recommendations for training, compliance, and skill development.
        </p>
        <Button onClick={handleGenerate} className="gap-2">
          <Sparkles className="h-4 w-4" /> Generate Workforce Insights
        </Button>
      </div>
    );
  }

  if (loading) {
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

  if (!insights) return null;

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

  return (
    <div className="space-y-6 animate-fade-in">
      <FallbackBanner />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="glass border-border/50">
          <CardContent className="pt-6 text-center">
            <TrendingUp className="h-5 w-5 mx-auto mb-2 text-primary" />
            <p className="text-2xl font-bold">{insights.workforce_metrics.overall_readiness}%</p>
            <p className="text-xs text-muted-foreground">Overall Readiness</p>
          </CardContent>
        </Card>
        <Card className="glass border-border/50">
          <CardContent className="pt-6 text-center">
            <AlertTriangle className="h-5 w-5 mx-auto mb-2 text-destructive" />
            <p className="text-2xl font-bold">{insights.workforce_metrics.critical_gaps}</p>
            <p className="text-xs text-muted-foreground">Critical Gaps</p>
          </CardContent>
        </Card>
        <Card className="glass border-border/50">
          <CardContent className="pt-6 text-center">
            <Users className="h-5 w-5 mx-auto mb-2 text-warning" />
            <p className="text-2xl font-bold">{insights.workforce_metrics.training_needed}</p>
            <p className="text-xs text-muted-foreground">Need Training</p>
          </CardContent>
        </Card>
        <Card className="glass border-border/50">
          <CardContent className="pt-6 text-center">
            <Briefcase className="h-5 w-5 mx-auto mb-2 text-success" />
            <p className="text-2xl font-bold">{insights.workforce_metrics.certified_employees}%</p>
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
          <p className="text-sm text-muted-foreground leading-relaxed">{insights.summary}</p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="glass border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-warning" />
              Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {insights.recommendations.map((rec, i) => (
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
            {insights.priority_actions.map((action, i) => (
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

      <div className="flex justify-end">
        <Button variant="outline" size="sm" onClick={handleGenerate} className="gap-2">
          <Sparkles className="h-3.5 w-3.5" /> Regenerate Insights
        </Button>
      </div>
    </div>
  );
}

function TrainingTab() {
  const [selectedDept, setSelectedDept] = useState<string>("all");

  const filteredSuggestions = selectedDept === "all"
    ? MOCK_TRAINING_SUGGESTIONS
    : MOCK_TRAINING_SUGGESTIONS.filter((t) => t.target.includes(selectedDept));

  const priorityColors = {
    critical: "bg-destructive text-destructive-foreground",
    high: "bg-warning text-warning-foreground",
    medium: "bg-primary/20 text-primary",
    low: "bg-muted text-muted-foreground",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <FallbackBanner />
        <Select value={selectedDept} onValueChange={setSelectedDept}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by department" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Departments</SelectItem>
            <SelectItem value="Assembly">Assembly</SelectItem>
            <SelectItem value="Quality">Quality</SelectItem>
            <SelectItem value="Welding">Welding</SelectItem>
            <SelectItem value="CNC">CNC</SelectItem>
            <SelectItem value="Maintenance">Maintenance</SelectItem>
            <SelectItem value="Safety">Safety</SelectItem>
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
      </div>
    </div>
  );
}

function DepartmentTab() {
  const insights = MOCK_INSIGHTS.department_insights;

  return (
    <div className="space-y-6">
      <FallbackBanner />

      <div className="grid gap-4">
        {insights.map((dept) => (
          <Card key={dept.department} className="glass border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium">{dept.department}</h4>
                <Badge variant={dept.readiness >= 80 ? "default" : dept.readiness >= 65 ? "secondary" : "destructive"}>
                  {dept.readiness}% Ready
                </Badge>
              </div>
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span>Top Gap: <strong>{dept.topGap}</strong></span>
                <span>{dept.employees_affected} employees affected</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

const AiPage = () => {
  return (
    <AppLayout>
      <PageHeader
        title="AI Assistant"
        subtitle="Organization-wide competency insights powered by AI"
      />

      <Tabs defaultValue="insights" className="space-y-6">
        <TabsList className="glass border border-border/50">
          <TabsTrigger value="insights">Insights</TabsTrigger>
          <TabsTrigger value="training">Training Suggestions</TabsTrigger>
          <TabsTrigger value="departments">By Department</TabsTrigger>
        </TabsList>

        <TabsContent value="insights">
          <InsightsTab />
        </TabsContent>

        <TabsContent value="training">
          <TrainingTab />
        </TabsContent>

        <TabsContent value="departments">
          <DepartmentTab />
        </TabsContent>
      </Tabs>
    </AppLayout>
  );
};

export default AiPage;
