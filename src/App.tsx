import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/lib/authContext";
import AppHeader from "@/components/AppHeader";
import LandingPage from "@/pages/LandingPage";
import LoginPage from "@/pages/LoginPage";
import ResumeUploadPage from "@/pages/ResumeUploadPage";
import SkillMatrixPage from "@/pages/SkillMatrixPage";
import GapAnalysisPage from "@/pages/GapAnalysisPage";
import GrowthPlanPage from "@/pages/GrowthPlanPage";
import AdminDashboard from "@/pages/AdminDashboard";
import EmployeeListPage from "@/pages/EmployeeListPage";
import EmployeeDetailPage from "@/pages/EmployeeDetailPage";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

function AppRoutes() {
  const { isLoggedIn, role } = useAuth();

  return (
    <>
      <AppHeader />
      <Routes>
        <Route path="/" element={isLoggedIn ? <Navigate to={role === 'admin' ? '/admin' : '/employee/skills'} /> : <LandingPage />} />
        <Route path="/login" element={isLoggedIn ? <Navigate to={role === 'admin' ? '/admin' : '/employee/skills'} /> : <LoginPage />} />
        <Route path="/employee/resume" element={isLoggedIn ? <ResumeUploadPage /> : <Navigate to="/login" />} />
        <Route path="/employee/skills" element={isLoggedIn ? <SkillMatrixPage /> : <Navigate to="/login" />} />
        <Route path="/employee/gap-analysis" element={isLoggedIn ? <GapAnalysisPage /> : <Navigate to="/login" />} />
        <Route path="/employee/growth-plan" element={isLoggedIn ? <GrowthPlanPage /> : <Navigate to="/login" />} />
        <Route path="/admin" element={isLoggedIn && role === 'admin' ? <AdminDashboard /> : <Navigate to="/login" />} />
        <Route path="/admin/employees" element={isLoggedIn && role === 'admin' ? <EmployeeListPage /> : <Navigate to="/login" />} />
        <Route path="/admin/employee/:id" element={isLoggedIn && role === 'admin' ? <EmployeeDetailPage /> : <Navigate to="/login" />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
