import { AppLayout } from "@/components/AppLayout";
import { PageHeader } from "@/components/PageHeader";
import { StatCard } from "@/components/StatCard";
import { Users, ClipboardCheck, AlertTriangle, TrendingUp } from "lucide-react";

const Index = () => {
  return (
    <AppLayout>
      <PageHeader
        title="Dashboard"
        subtitle="Manufacturing competency overview"
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="animate-in-up stagger-1">
          <StatCard
            icon={<Users className="h-5 w-5" />}
            label="Total Employees"
            value="247"
            trend={{ direction: "up", value: "+12" }}
          />
        </div>
        <div className="animate-in-up stagger-2">
          <StatCard
            icon={<ClipboardCheck className="h-5 w-5" />}
            label="Assessments Due"
            value="38"
            trend={{ direction: "down", value: "-5" }}
          />
        </div>
        <div className="animate-in-up stagger-3">
          <StatCard
            icon={<AlertTriangle className="h-5 w-5" />}
            label="Critical Gaps"
            value="14"
            trend={{ direction: "up", value: "+3" }}
          />
        </div>
        <div className="animate-in-up stagger-4">
          <StatCard
            icon={<TrendingUp className="h-5 w-5" />}
            label="Avg Competency"
            value="3.6"
            trend={{ direction: "up", value: "+0.2" }}
          />
        </div>
      </div>
    </AppLayout>
  );
};

export default Index;
