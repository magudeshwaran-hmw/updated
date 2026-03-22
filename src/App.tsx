import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/lib/authContext";
import { ThemeProvider } from "@/lib/themeContext";
import { getEmployee } from "@/lib/localDB";
import AppHeader from "@/components/AppHeader";
import LandingPage from "@/pages/LandingPage";
import LoginPage from "@/pages/LoginPage";
import ResumeUploadPage from "@/pages/ResumeUploadPage";
import SkillMatrixPage from "@/pages/SkillMatrixPage";
import SkillReportPage from "@/pages/SkillReportPage";
import GapAnalysisPage from "@/pages/GapAnalysisPage";
import GrowthPlanPage from "@/pages/GrowthPlanPage";
import AdminDashboard from "@/pages/AdminDashboard";
import EmployeeListPage from "@/pages/EmployeeListPage";
import EmployeeDetailPage from "@/pages/EmployeeDetailPage";
import NotFound from "@/pages/NotFound";
import OnboardingPage from "@/pages/OnboardingPage";
import AuthPage from "@/pages/AuthPage";
import AIIntelligencePage from "@/pages/AIIntelligencePage";

const queryClient = new QueryClient();

function AppRoutes() {
  const { isLoggedIn, role, employeeId } = useAuth();

  const emp = employeeId ? getEmployee(employeeId) : null;

  // Decide where a logged-in employee should land based on submitted status
  const empLandingPage = (() => {
    if (!isLoggedIn || role !== 'employee') return '/employee/skills';
    return emp?.submitted ? '/employee/report' : '/employee/skills';
  })();

  const loggedInDest = role === 'admin' ? '/admin' : empLandingPage;

  return (
    <>
      <AppHeader />
      <Routes>
        <Route path="/"       element={isLoggedIn ? <Navigate to={loggedInDest} /> : <LandingPage />} />
        <Route path="/start"  element={isLoggedIn ? <Navigate to={loggedInDest} /> : <AuthPage />} />
        <Route path="/login"  element={isLoggedIn ? <Navigate to={loggedInDest} /> : <LoginPage />} />
        <Route path="/employee/resume"      element={isLoggedIn ? <ResumeUploadPage /> : <Navigate to="/start" />} />
        <Route path="/employee/skills"      element={isLoggedIn ? (emp?.submitted ? <Navigate to="/employee/report" /> : <SkillMatrixPage />) : <Navigate to="/start" />} />
        <Route path="/employee/report"      element={isLoggedIn ? <SkillReportPage />  : <Navigate to="/start" />} />
        <Route path="/employee/gap-analysis" element={isLoggedIn ? <GapAnalysisPage /> : <Navigate to="/start" />} />
        <Route path="/employee/growth-plan"  element={isLoggedIn ? <GrowthPlanPage />  : <Navigate to="/start" />} />
        <Route path="/employee/ai-hub"        element={isLoggedIn ? <AIIntelligencePage /> : <Navigate to="/start" />} />
        <Route path="/admin"              element={isLoggedIn && role === 'admin' ? <AdminDashboard />   : <Navigate to="/login" />} />
        <Route path="/admin/employees"    element={isLoggedIn && role === 'admin' ? <EmployeeListPage />: <Navigate to="/login" />} />
        <Route path="/admin/employee/:id" element={isLoggedIn && role === 'admin' ? <EmployeeDetailPage />: <Navigate to="/login" />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Sonner />
      <ThemeProvider>
        <AuthProvider>
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </AuthProvider>
      </ThemeProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
