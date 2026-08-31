import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/useAuth";
import { ThemeProvider } from "@/hooks/useTheme";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { NetworkErrorToast } from "@/components/NetworkErrorToast";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import DashboardPage from "./pages/DashboardPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import EmployeesPage from "./pages/EmployeesPage";
import EmployeeDetailPage from "./pages/EmployeeDetailPage";
import RolesPage from "./pages/RolesPage";
import RoleDetailPage from "./pages/RoleDetailPage";
import CompetenciesPage from "./pages/CompetenciesPage";
import AssessmentsPage from "./pages/AssessmentsPage";
import BulkAssessmentPage from "./pages/BulkAssessmentPage";
import AuditPage from "./pages/AuditPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import AiPage from "./pages/AiPage";
import DepartmentsPage from "./pages/DepartmentsPage";
import SettingsPage from "./pages/SettingsPage";
import BulkUploadPage from "./pages/BulkUploadPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error: any) => {
        if (error?.response?.status === 501) return false;
        return failureCount < 2;
      },
      staleTime: 30_000,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
      <Toaster />
      <Sonner position="top-right" closeButton richColors duration={4000} />
      <ErrorBoundary>
        <BrowserRouter>
          <AuthProvider>
            <NetworkErrorToast />
            <Routes>
              <Route path="/" element={<ProtectedRoute><Navigate to="/dashboard" replace /></ProtectedRoute>} />
              <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
              <Route path="/employees" element={<ProtectedRoute><EmployeesPage /></ProtectedRoute>} />
              <Route path="/employees/:id" element={<ProtectedRoute><EmployeeDetailPage /></ProtectedRoute>} />
              <Route path="/roles" element={<ProtectedRoute><RolesPage /></ProtectedRoute>} />
              <Route path="/roles/:id" element={<ProtectedRoute><RoleDetailPage /></ProtectedRoute>} />
              <Route path="/competencies" element={<ProtectedRoute><CompetenciesPage /></ProtectedRoute>} />
              <Route path="/departments" element={<ProtectedRoute><DepartmentsPage /></ProtectedRoute>} />
              <Route path="/assessments" element={<ProtectedRoute><AssessmentsPage /></ProtectedRoute>} />
              <Route path="/assessments/bulk" element={<ProtectedRoute><BulkAssessmentPage /></ProtectedRoute>} />
              <Route path="/audit" element={<ProtectedRoute><AuditPage /></ProtectedRoute>} />
              <Route path="/analytics" element={<ProtectedRoute><AnalyticsPage /></ProtectedRoute>} />
              <Route path="/ai" element={<ProtectedRoute><AiPage /></ProtectedRoute>} />
              <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
              <Route path="/bulk-upload" element={<ProtectedRoute><BulkUploadPage /></ProtectedRoute>} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </ErrorBoundary>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
